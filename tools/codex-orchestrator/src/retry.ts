import { createHash } from 'node:crypto';

export function fingerprint(taskId: string, input: string): string {
  return createHash('sha256').update(`${taskId}\0${input}`).digest('hex');
}

export class RetryLedger {
  private readonly attempts = new Map<string, number>();
  private readonly completed = new Set<string>();

  async run<T>(taskId: string, input: string, operation: (attempt: number) => Promise<T>): Promise<T> {
    const key = fingerprint(taskId, input);
    if (this.completed.has(key)) throw new Error(`Duplicate execution refused for ${taskId}: identical input already completed`);
    const previousAttempts = this.attempts.get(taskId) ?? 0;
    for (let attempt = previousAttempts; attempt <= 2; attempt += 1) {
      this.attempts.set(taskId, attempt + 1);
      try {
        const result = await operation(attempt);
        this.completed.add(key);
        return result;
      } catch (error) {
        if (attempt === 2) throw error;
      }
    }
    throw new Error(`Retry budget exhausted for ${taskId}`);
  }
}
