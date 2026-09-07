import { describe, expect, it } from 'vitest';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { runOrchestration } from '../src/run.js';

describe('mock full orchestration', () => {
  it('runs Sol plan, dependent Luna workers, Sol review, and reuses duplicate input', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'codex-orchestrator-run-'));
    const options = { goal: 'mock integration workflow', cwd, workers: 2, apply: false, mock: true, integration: false } as const;
    const first = await runOrchestration(options) as { status: string; plan: { tasks: unknown[] }; workers: Array<{ status: string }>; review: { approved: boolean } };
    const second = await runOrchestration(options) as typeof first;
    expect(first.status).toBe('completed');
    expect(first.plan.tasks.length).toBe(2);
    expect(first.workers.every((worker) => worker.status === 'completed')).toBe(true);
    expect(first.review.approved).toBe(true);
    expect(second).toEqual(first);
  });

  it('runs with an explicitly selected gpt-5.5 high model', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'codex-orchestrator-run-'));
    const report = await runOrchestration({
      goal: 'mock explicit gpt-5.5 workflow',
      cwd,
      workers: 2,
      apply: false,
      mock: true,
      integration: false,
      model: 'gpt-5.5',
      effort: 'high',
    }) as { status: string; preflight: { sol: { id: string }; luna: { id: string }; solReasoningEffort: string; lunaReasoningEffort: string }; review: { approved: boolean } };

    expect(report.status).toBe('completed');
    expect(report.preflight.sol.id).toBe('gpt-5.5');
    expect(report.preflight.luna.id).toBe('gpt-5.5');
    expect(report.preflight.solReasoningEffort).toBe('high');
    expect(report.preflight.lunaReasoningEffort).toBe('high');
    expect(report.review.approved).toBe(true);
  });
});
