import type { AppServerClient } from './app-server-client.js';
import type { OrchestrationTask } from './contracts.js';
import type { ModelInfo, WorkerThreadResult } from './protocol.js';
import { chooseEffort, collectTurn, parseStructuredOutput } from './sol.js';
import type { IsolatedWorkspace, WorkspaceManager } from './workspace.js';

export const workerSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['taskId', 'status', 'summary', 'changedFiles', 'tests', 'completionCriteriaMet', 'remainingRisks', 'commitOrPatch', 'failureReason'],
  properties: {
    taskId: { type: 'string' }, status: { type: 'string', enum: ['completed', 'failed'] }, summary: { type: 'string' },
    changedFiles: { type: 'array', items: { type: 'string' } },
    tests: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['command', 'result'], properties: { command: { type: 'string' }, result: { type: 'string' } } } },
    completionCriteriaMet: { type: 'boolean' }, remainingRisks: { type: 'array', items: { type: 'string' } },
    commitOrPatch: { anyOf: [{ type: 'object', additionalProperties: false, required: ['commit', 'patch'], properties: { commit: { anyOf: [{ type: 'string' }, { type: 'null' }] }, patch: { anyOf: [{ type: 'string' }, { type: 'null' }] } } }, { type: 'null' }] }, failureReason: { anyOf: [{ type: 'string' }, { type: 'null' }] },
  },
} as const;

export class LunaWorker {
  constructor(private readonly clientFactory: () => AppServerClient, private readonly model: ModelInfo, private readonly workspaceManager: WorkspaceManager, private readonly forcedEffort?: string) {}

  async run(task: OrchestrationTask, retryInstructions = ''): Promise<WorkerThreadResult> {
    const workspace = await this.workspaceManager.prepare(task.id);
    const client = this.clientFactory();
    try {
      await client.connect();
      const choice = this.forcedEffort ? { effort: this.forcedEffort } : chooseEffort(this.model, task.difficulty === 'hard' ? 'max' : 'fastest');
      const thread = await client.threadStart({
        model: this.model.id,
        cwd: workspace.path,
        approvalPolicy: 'never',
        sandbox: 'workspace-write',
        developerInstructions: `You are acting in the Luna worker role on ${this.model.id}. Work only on the assigned task and allowed files. Do not broaden scope, use API keys, or modify files outside the workspace.`,
      });
      const prompt = [
        `Task ID: ${task.id}`,
        `Goal: ${task.goal}`,
        `Allowed read files: ${task.readFiles.join(', ') || '(none specified)'}`,
        `Allowed writable files: ${task.writableFiles.join(', ') || '(none specified)'}`,
        `Completion criteria: ${task.completionCriteria.join('; ')}`,
        retryInstructions ? `Specific retry instructions: ${retryInstructions}` : '',
        'Return the worker result JSON with task ID, status, summary, changed files, tests and results, completion criteria status, risks, commit or patch info, and failure reason.',
      ].filter(Boolean).join('\n');
      const output = await collectTurn(client, thread.thread.id, prompt, choice.effort, workerSchema);
      const result = parseStructuredOutput<WorkerThreadResult>(output);
      if (result.taskId !== task.id) throw new Error(`Worker returned task ${result.taskId}; expected ${task.id}`);
      const actualChangedFiles = workspace.isGit ? await this.workspaceManager.changedFilesFor(workspace) : result.changedFiles;
      const allowed = task.writableFiles;
      const unauthorized = actualChangedFiles.filter((file) => !allowed.some((allowedFile) => file === allowedFile || file.startsWith(`${allowedFile}/`)));
      if (unauthorized.length > 0) {
        return { ...result, status: 'failed', completionCriteriaMet: false, failureReason: `Worker changed files outside its allowlist: ${unauthorized.join(', ')}`, remainingRisks: [...result.remainingRisks, 'Unauthorized file changes were rejected.'] };
      }
      return result;
    } catch (error) {
      return {
        taskId: task.id, status: 'failed', summary: '', changedFiles: [], tests: [], completionCriteriaMet: false,
        remainingRisks: [], commitOrPatch: null, failureReason: (error as Error).message,
      };
    } finally {
      await client.close();
    }
  }

  async patchFor(workspace: IsolatedWorkspace): Promise<string> {
    return this.workspaceManager.patchFor(workspace);
  }
}
