import { createHash } from 'node:crypto';
import { mkdir, open, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { AppServerClient } from './app-server-client.js';
import type { OrchestrationPlan, ReviewResult, RunOptions } from './contracts.js';
import { log } from './logger.js';
import { LunaWorker } from './luna-worker.js';
import { runPreflight } from './preflight.js';
import { RetryLedger } from './retry.js';
import { SolPlanner } from './sol.js';
import { scheduleTasks } from './scheduler.js';
import { applyPatchSafely, WorkspaceManager } from './workspace.js';

function mockArgs(): string[] {
  return ['--import', fileURLToPath(import.meta.resolve('tsx/esm')), fileURLToPath(new URL('./mock-app-server.ts', import.meta.url))];
}

function clientFor(options: RunOptions): AppServerClient {
  return options.mock ? new AppServerClient({ command: process.execPath, args: mockArgs(), cwd: options.cwd }) : new AppServerClient({ cwd: options.cwd });
}

async function acquireLock(stateDir: string, runId: string): Promise<() => Promise<void>> {
  await mkdir(stateDir, { recursive: true });
  const path = resolve(stateDir, `${runId}.lock`);
  try {
    const handle = await open(path, 'wx');
    return async () => { await handle.close(); await writeFile(path, '', { flag: 'w' }).catch(() => undefined); };
  } catch {
    throw new Error(`Duplicate or concurrent execution refused for run ${runId}`);
  }
}

async function readCachedReport(stateDir: string, runId: string): Promise<unknown | null> {
  try { return JSON.parse(await readFile(resolve(stateDir, `${runId}.json`), 'utf8')); } catch { return null; }
}

export async function runOrchestration(options: RunOptions): Promise<unknown> {
  if (!options.goal.trim()) throw new Error('goal must not be empty');
  if (!Number.isInteger(options.workers) || options.workers < 1 || options.workers > 32) throw new Error('workers must be an integer from 1 to 32');
  const cwd = resolve(options.cwd);
  const runId = createHash('sha256').update(JSON.stringify({ goal: options.goal, cwd, workers: options.workers, apply: options.apply, mock: options.mock, model: options.model, effort: options.effort })).digest('hex').slice(0, 16);
  const stateDir = resolve(cwd, '.codex-orchestrator', 'runs');
  const cached = await readCachedReport(stateDir, runId);
  if (cached) {
    log('info', 'duplicate_run_reused', { runId });
    return cached;
  }
  const release = await acquireLock(stateDir, runId);
  const client = clientFor(options);
  const workspaceManager = new WorkspaceManager(cwd, runId);
  let report: Record<string, unknown>;
  try {
    await client.connect();
    const preflight = await runPreflight(client, 'codex', { model: options.model, effort: options.effort });
    const sol = new SolPlanner(client, preflight.sol as never, cwd, preflight.solReasoningEffort);
    const planned = await sol.plan(options.goal);
    const ledger = new RetryLedger();
    const workerResults: unknown[] = [];
    const runTask = async (task: OrchestrationPlan['tasks'][number], instructions = '') => {
      const worker = new LunaWorker(() => clientFor(options), preflight.luna as never, workspaceManager, preflight.lunaReasoningEffort);
      const result = await ledger.run(task.id, JSON.stringify({ task, instructions }), () => worker.run(task, instructions));
      workerResults.push(result);
      return result;
    };
    await scheduleTasks(planned.plan.tasks, (task) => runTask(task), options.workers);
    let review: ReviewResult = await sol.review(options.goal, planned.plan, workerResults);
    for (let retryRound = 0; !review.approved && retryRound < 2 && review.retryTasks.length > 0; retryRound += 1) {
      for (const retry of review.retryTasks) {
        const task = planned.plan.tasks.find((candidate) => candidate.id === retry.taskId);
        if (task) await runTask(task, retry.instructions);
      }
      review = await sol.review(options.goal, planned.plan, workerResults);
    }
    if (review.approved && workerResults.some((result) => (result as { status?: string; completionCriteriaMet?: boolean }).status !== 'completed' || !(result as { completionCriteriaMet?: boolean }).completionCriteriaMet)) {
      review = { ...review, approved: false, summary: `${review.summary} Orchestrator safety gate blocked approval because at least one worker did not report completed criteria.`, risks: [...review.risks, 'A worker result was incomplete or failed.'] };
    }
    const applied: Array<{ taskId: string; applied: boolean; conflict: string | null }> = [];
    if (options.apply && review.approved) {
      const order = review.applyOrder.length ? review.applyOrder : planned.plan.tasks.map((task) => task.id);
      for (const taskId of order) {
        const workspace = workspaceManager.workspaceFor(taskId);
        if (!workspace) continue;
        const patch = await workspaceManager.patchFor(workspace);
        applied.push({ taskId, ...(await applyPatchSafely(cwd, patch)) });
      }
    }
    const rateLimitsAfter = await client.rateLimitsRead();
    report = { runId, status: review.approved ? 'completed' : 'blocked', goal: options.goal, preflight, plan: planned.plan, workers: workerResults, review, applied, rateLimitsBefore: preflight.rateLimitsBefore, rateLimitsAfter, notices: [...preflight.notices, ...(planned.notice ? [planned.notice] : [])] };
    await writeFile(resolve(stateDir, `${runId}.json`), JSON.stringify(report, null, 2));
    return report;
  } catch (error) {
    report = { runId, status: 'failed', goal: options.goal, error: (error as Error).message };
    await writeFile(resolve(stateDir, `${runId}.json`), JSON.stringify(report, null, 2));
    throw error;
  } finally {
    await workspaceManager.cleanup();
    await client.close();
    await release();
  }
}
