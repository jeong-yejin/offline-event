import { createInterface } from 'node:readline';

type Message = { id?: number; method: string; params?: Record<string, unknown> };
const threads = new Map<string, { model: string; role: 'sol-plan' | 'sol-review' | 'luna' }>();
let nextThread = 1;
let solThreads = 0;

function write(message: unknown): void {
  process.stdout.write(`${JSON.stringify(message)}\n`);
}

function model(id: string, effort: string[]) {
  return { id, model: id, displayName: id, description: 'Mock model', hidden: false, isDefault: false, defaultReasoningEffort: effort[0], supportedReasoningEfforts: effort.map((reasoningEffort) => ({ reasoningEffort, description: reasoningEffort })) };
}

createInterface({ input: process.stdin }).on('line', (line) => {
  const message = JSON.parse(line) as Message;
  if (message.method === 'initialize') {
    write({ id: message.id, result: { userAgent: 'Mock Codex App Server', codexHome: '/tmp/mock-codex', platformFamily: 'unix', platformOs: 'mock' } });
    return;
  }
  if (message.method === 'initialized') return;
  if (message.method === 'account/read') {
    write({ id: message.id, result: { account: { type: 'chatgpt', planType: 'pro', email: 'mock@example.com' }, requiresOpenaiAuth: false } });
    return;
  }
  if (message.method === 'model/list') {
    write({ id: message.id, result: { data: [model('gpt-5.6-sol', ['max', 'high', 'medium']), model('gpt-5.6-luna', ['low', 'medium', 'max']), model('gpt-5.5', ['low', 'medium', 'high', 'xhigh'])], nextCursor: null } });
    return;
  }
  if (message.method === 'account/rateLimits/read') {
    write({ id: message.id, result: { rateLimits: { planType: 'pro', primary: { usedPercent: 1, windowDurationMins: 300 } } } });
    return;
  }
  if (message.method === 'account/login/start') {
    write({ id: message.id, result: { type: 'chatgptDeviceCode', loginId: 'mock-login', userCode: 'MOCK-1234', verificationUrl: 'https://auth.openai.com/device' } });
    return;
  }
  if (message.method === 'thread/start') {
    const id = `mock-thread-${nextThread++}`;
    const requestedModel = String(message.params?.model ?? '');
    const instructions = String(message.params?.developerInstructions ?? '');
    const role = instructions.includes('Sol') ? (solThreads++ === 0 ? 'sol-plan' : 'sol-review') : 'luna';
    threads.set(id, { model: requestedModel, role });
    write({ id: message.id, result: { thread: { id }, model: requestedModel, modelProvider: 'mock', cwd: String(message.params?.cwd ?? process.cwd()), reasoningEffort: null, approvalPolicy: 'never', sandbox: 'workspace-write' } });
    return;
  }
  if (message.method === 'turn/start') {
    const threadId = String(message.params?.threadId ?? '');
    const thread = threads.get(threadId);
    write({ id: message.id, result: { turn: { id: `mock-turn-${threadId}`, status: 'inProgress' } } });
    const input = JSON.stringify(message.params?.input ?? []);
    const prompt = String(((message.params?.input as Array<{ text?: string }> | undefined)?.[0]?.text) ?? input);
    let content: unknown;
    if (thread?.role === 'sol-plan') {
      content = { goal: 'Mock goal', notes: ['Mock plan uses no API keys'], tasks: [
        { id: 'inspect', goal: 'Inspect the requested surface', dependsOn: [], readFiles: ['README.md'], writableFiles: [], completionCriteria: ['inspection reported'], difficulty: 'easy' },
        { id: 'implement', goal: 'Implement the requested change', dependsOn: ['inspect'], readFiles: ['README.md'], writableFiles: ['src/mock.ts'], completionCriteria: ['tests pass'], difficulty: 'medium' },
      ] };
    } else if (thread?.role === 'sol-review') {
      content = { approved: true, summary: 'Mock review approved all worker results.', retryTasks: [], applyOrder: ['inspect', 'implement'], risks: [] };
    } else {
      const match = prompt.match(/Task ID: ([^\n]+)/);
      const taskId = match?.[1]?.trim() ?? 'unknown';
      content = { taskId, status: 'completed', summary: `Mock Luna completed ${taskId}.`, changedFiles: taskId === 'implement' ? ['src/mock.ts'] : [], tests: [{ command: 'npm test', result: 'passed (mock)' }], completionCriteriaMet: true, remainingRisks: [], commitOrPatch: null, failureReason: null };
    }
    const text = JSON.stringify(content);
    write({ method: 'item/agentMessage/delta', params: { threadId, turnId: `mock-turn-${threadId}`, itemId: `item-${threadId}`, delta: text } });
    write({ method: 'turn/completed', params: { threadId, turn: { id: `mock-turn-${threadId}`, status: 'completed' } } });
  }
});
