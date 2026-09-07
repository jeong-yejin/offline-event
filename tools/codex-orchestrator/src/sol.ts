import type { AppServerClient } from './app-server-client.js';
import type { ModelInfo } from './protocol.js';
import type { OrchestrationPlan, ReviewResult } from './contracts.js';

export const planSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['goal', 'tasks', 'notes'],
  properties: {
    goal: { type: 'string' },
    notes: { type: 'array', items: { type: 'string' } },
    tasks: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['id', 'goal', 'dependsOn', 'readFiles', 'writableFiles', 'completionCriteria', 'difficulty'],
        properties: {
          id: { type: 'string', pattern: '^[a-zA-Z0-9._-]+$' },
          goal: { type: 'string' },
          dependsOn: { type: 'array', items: { type: 'string' } },
          readFiles: { type: 'array', items: { type: 'string' } },
          writableFiles: { type: 'array', items: { type: 'string' } },
          completionCriteria: { type: 'array', items: { type: 'string' }, minItems: 1 },
          difficulty: { type: 'string', enum: ['easy', 'medium', 'hard'] },
        },
      },
    },
  },
} as const;

export const reviewSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['approved', 'summary', 'retryTasks', 'applyOrder', 'risks'],
  properties: {
    approved: { type: 'boolean' },
    summary: { type: 'string' },
    retryTasks: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['taskId', 'instructions'], properties: { taskId: { type: 'string' }, instructions: { type: 'string' } } } },
    applyOrder: { type: 'array', items: { type: 'string' } },
    risks: { type: 'array', items: { type: 'string' } },
  },
} as const;

export function supportedEfforts(model: Pick<ModelInfo, 'supportedReasoningEfforts'>): string[] {
  return model.supportedReasoningEfforts.map((effort) => typeof effort === 'string' ? effort : effort.reasoningEffort);
}

export function chooseEffort(model: Pick<ModelInfo, 'supportedReasoningEfforts'>, preferred: 'max' | 'fastest'): { effort: string; notice?: string } {
  const efforts = supportedEfforts(model);
  if (preferred === 'max') {
    if (efforts.includes('max')) return { effort: 'max' };
    const fallback = ['high', 'medium', 'low', 'minimal', 'none'].find((effort) => efforts.includes(effort)) ?? efforts[0];
    if (!fallback) throw new Error('Model advertises no reasoning efforts');
    return { effort: fallback, notice: `gpt-5.6-sol does not support max; using advertised ${fallback} and continuing transparently.` };
  }
  const fastest = ['none', 'minimal', 'low', 'medium', 'high', 'max'].find((effort) => efforts.includes(effort)) ?? efforts[0];
  if (!fastest) throw new Error('Model advertises no reasoning efforts');
  return { effort: fastest };
}

export async function collectTurn(client: AppServerClient, threadId: string, prompt: string, effort: string, outputSchema: unknown): Promise<string> {
  let text = '';
  const unsubscribe = client.onMessage((message) => {
    if (!('method' in message) || message.method !== 'item/agentMessage/delta') return;
    const params = message.params as { threadId?: string; delta?: string } | undefined;
    if (params?.threadId === threadId) text += params.delta ?? '';
  });
  try {
    const completed = new Promise<void>((resolve, reject) => {
      const unsubscribeCompleted = client.onMessage((message) => {
        if (!('method' in message) || message.method !== 'turn/completed') return;
        const params = message.params as { threadId?: string; turn?: { status?: string; error?: unknown } } | undefined;
        if (params?.threadId !== threadId) return;
        unsubscribeCompleted();
        clearTimeout(timer);
        if (params.turn?.status === 'failed' || params.turn?.error) reject(new Error(`Turn failed: ${JSON.stringify(params.turn?.error ?? params.turn?.status)}`));
        else resolve();
      });
      const timer = setTimeout(() => {
        unsubscribeCompleted();
        reject(new Error(`Timed out waiting for turn completion on thread ${threadId}`));
      }, 10 * 60 * 1000);
      timer.unref();
    });
    await client.turnStart({
      threadId,
      effort,
      outputSchema,
      input: [{ type: 'text', text: prompt }],
    });
    await completed;
  } finally {
    unsubscribe();
  }
  return text.trim();
}

export function parseStructuredOutput<T>(text: string): T {
  const unfenced = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  const objectStart = unfenced.indexOf('{');
  if (objectStart >= 0) {
    let depth = 0;
    let inString = false;
    let escaped = false;
    for (let index = objectStart; index < unfenced.length; index += 1) {
      const char = unfenced[index];
      if (escaped) {
        escaped = false;
        continue;
      }
      if (char === '\\' && inString) {
        escaped = true;
        continue;
      }
      if (char === '"') {
        inString = !inString;
        continue;
      }
      if (inString) continue;
      if (char === '{') depth += 1;
      if (char === '}') {
        depth -= 1;
        if (depth === 0) return JSON.parse(unfenced.slice(objectStart, index + 1)) as T;
      }
    }
  }
  try {
    return JSON.parse(unfenced) as T;
  } catch (error) {
    throw new Error(`Model returned invalid structured JSON: ${(error as Error).message}`);
  }
}

export function validatePlan(plan: OrchestrationPlan): OrchestrationPlan {
  if (!plan || typeof plan.goal !== 'string' || !Array.isArray(plan.tasks) || !Array.isArray(plan.notes)) throw new Error('Sol plan does not match the required schema');
  const ids = new Set<string>();
  for (const task of plan.tasks) {
    if (!task.id || ids.has(task.id)) throw new Error(`Sol plan contains duplicate or empty task id: ${task.id}`);
    ids.add(task.id);
    if (!Array.isArray(task.dependsOn) || !Array.isArray(task.readFiles) || !Array.isArray(task.writableFiles) || !Array.isArray(task.completionCriteria) || !task.completionCriteria.length) throw new Error(`Task ${task.id} is missing required arrays`);
  }
  for (const task of plan.tasks) for (const dependency of task.dependsOn) if (!ids.has(dependency)) throw new Error(`Task ${task.id} depends on unknown task ${dependency}`);
  return plan;
}

export class SolPlanner {
  constructor(private readonly client: AppServerClient, private readonly model: ModelInfo, private readonly cwd: string, private readonly forcedEffort?: string) {}

  async plan(goal: string): Promise<{ plan: OrchestrationPlan; notice?: string }> {
    const choice = this.forcedEffort ? { effort: this.forcedEffort } : chooseEffort(this.model, 'max');
    const thread = await this.client.threadStart({
      model: this.model.id,
      cwd: this.cwd,
      approvalPolicy: 'never',
      developerInstructions: `You are acting in the Sol orchestration role on ${this.model.id}. Analyze, decompose, distribute, review, and report. Never invent unavailable models or hide model substitution. Return only the JSON schema requested by the caller.`,
    });
    const output = await collectTurn(this.client, thread.thread.id, `Create an executable plan for this goal:\n${goal}\nEach task must include id, goal, dependsOn, readFiles, writableFiles, completionCriteria, and difficulty. Only include work needed for this goal.`, choice.effort, planSchema);
    return { plan: validatePlan(parseStructuredOutput<OrchestrationPlan>(output)), notice: choice.notice };
  }

  async review(goal: string, plan: OrchestrationPlan, results: unknown[]): Promise<ReviewResult> {
    const choice = this.forcedEffort ? { effort: this.forcedEffort } : chooseEffort(this.model, 'max');
    const thread = await this.client.threadStart({
      model: this.model.id,
      cwd: this.cwd,
      approvalPolicy: 'never',
      developerInstructions: `You are acting in the Sol review role on ${this.model.id}. Be strict: approve only if completion criteria and tests are credible. Return only the requested JSON.`,
    });
    const output = await collectTurn(this.client, thread.thread.id, `Review goal, plan, and worker results. Goal: ${goal}\nPlan: ${JSON.stringify(plan)}\nResults: ${JSON.stringify(results)}\nRetry only failed tasks with specific instructions; never request more than two retries per task.`, choice.effort, reviewSchema);
    const review = parseStructuredOutput<ReviewResult>(output);
    if (typeof review.approved !== 'boolean' || !Array.isArray(review.retryTasks) || !Array.isArray(review.applyOrder) || !Array.isArray(review.risks)) throw new Error('Sol review does not match the required schema');
    return review;
  }
}
