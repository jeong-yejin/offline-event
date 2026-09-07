import { describe, expect, it } from 'vitest';
import { scheduleTasks } from '../src/scheduler.js';
import type { OrchestrationTask } from '../src/contracts.js';

const task = (id: string, dependsOn: string[] = [], writableFiles: string[] = []): OrchestrationTask => ({
  id,
  goal: id,
  dependsOn,
  readFiles: [],
  writableFiles,
  completionCriteria: ['done'],
  difficulty: 'easy',
});

describe('DAG scheduler', () => {
  it('runs independent tasks in parallel but serializes overlapping writes', async () => {
    const active: string[] = [];
    let maxActive = 0;
    const started: string[] = [];
    const result = await scheduleTasks([
      task('a', [], ['shared.ts']),
      task('b', [], ['shared.ts']),
      task('c', ['a']),
      task('d'),
    ], async (current) => {
      active.push(current.id);
      started.push(current.id);
      maxActive = Math.max(maxActive, active.length);
      await new Promise((resolve) => setTimeout(resolve, 5));
      active.splice(active.indexOf(current.id), 1);
      return current.id;
    }, 4);

    expect(result).toEqual(expect.arrayContaining(['a', 'b', 'c', 'd']));
    expect(maxActive).toBeLessThanOrEqual(3);
    expect(started.indexOf('c')).toBeGreaterThan(started.indexOf('a'));
  });

  it('caps concurrency at the requested worker count', async () => {
    let maxActive = 0;
    let active = 0;
    await scheduleTasks(['a', 'b', 'c', 'd', 'e'].map((id) => task(id)), async () => {
      active += 1;
      maxActive = Math.max(maxActive, active);
      await new Promise((resolve) => setTimeout(resolve, 3));
      active -= 1;
      return true;
    }, 2);
    expect(maxActive).toBe(2);
  });
});
