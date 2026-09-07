export type JsonRpcId = number | string;

export interface JsonRpcRequest {
  id: JsonRpcId;
  method: string;
  params?: unknown;
}

export interface JsonRpcResponse {
  id: JsonRpcId;
  result?: unknown;
  error?: { code: number; message: string; data?: unknown };
}

export interface JsonRpcNotification {
  method: string;
  params?: unknown;
}

export type JsonRpcMessage = JsonRpcResponse | JsonRpcNotification;

export interface ModelInfo {
  id: string;
  model?: string;
  displayName?: string;
  description?: string;
  defaultReasoningEffort?: string;
  supportedReasoningEfforts: Array<string | { reasoningEffort: string; description?: string }>;
  hidden?: boolean;
}

export interface ChatGptAccount {
  type: 'chatgpt';
  email: string;
  planType: string;
}

export type Account = ChatGptAccount | { type: 'apiKey' } | { type: 'amazonBedrock' };

export interface RateLimits {
  rateLimits?: Record<string, unknown> | null;
  rateLimitsByLimitId?: Record<string, unknown> | null;
}

export interface ThreadStartResponse {
  thread: { id: string };
  model?: string;
  reasoningEffort?: string | null;
  [key: string]: unknown;
}

export interface TurnCompletedParams {
  threadId: string;
  turn: { id?: string; status?: string; error?: unknown };
}

export interface WorkerThreadResult {
  taskId: string;
  status: 'completed' | 'failed';
  summary: string;
  changedFiles: string[];
  tests: Array<{ command: string; result: string }>;
  completionCriteriaMet: boolean;
  remainingRisks: string[];
  commitOrPatch: { commit?: string; patch?: string } | null;
  failureReason: string | null;
}
