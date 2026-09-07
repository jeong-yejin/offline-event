export type Difficulty = 'easy' | 'medium' | 'hard';

export interface OrchestrationTask {
  id: string;
  goal: string;
  dependsOn: string[];
  readFiles: string[];
  writableFiles: string[];
  completionCriteria: string[];
  difficulty: Difficulty;
}

export interface OrchestrationPlan {
  goal: string;
  tasks: OrchestrationTask[];
  notes: string[];
}

export interface ReviewResult {
  approved: boolean;
  summary: string;
  retryTasks: Array<{ taskId: string; instructions: string }>;
  applyOrder: string[];
  risks: string[];
}

export interface RunOptions {
  goal: string;
  cwd: string;
  workers: number;
  apply: boolean;
  mock: boolean;
  integration: boolean;
  model?: string;
  effort?: string;
}

export interface RunReport {
  runId: string;
  status: 'completed' | 'blocked' | 'failed';
  goal: string;
  preflight: unknown;
  plan: OrchestrationPlan | null;
  workers: unknown[];
  review: ReviewResult | null;
  rateLimitsBefore: unknown;
  rateLimitsAfter: unknown;
}
