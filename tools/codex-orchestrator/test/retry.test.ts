import { describe, expect, it } from 'vitest';
import { RetryLedger } from '../src/retry.js';

describe('retry ledger', () => {
  it('allows at most two retries and refuses duplicate completed input', async () => {
    const ledger = new RetryLedger();
    let attempts = 0;
    const first = await ledger.run('task-1', 'same-input', async () => {
      attempts += 1;
      if (attempts < 3) throw new Error('temporary');
      return 'ok';
    });
    expect(first).toBe('ok');
    expect(attempts).toBe(3);
    await expect(ledger.run('task-1', 'same-input', async () => 'duplicate')).rejects.toThrow(/duplicate/i);
  });

  it('does not retry a task after the retry budget is exhausted', async () => {
    const ledger = new RetryLedger();
    let attempts = 0;
    await expect(ledger.run('task-2', 'input', async () => {
      attempts += 1;
      throw new Error('permanent');
    })).rejects.toThrow('permanent');
    expect(attempts).toBe(3);
  });
});
