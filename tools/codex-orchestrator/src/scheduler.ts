import type { OrchestrationTask } from './contracts.js';

function overlaps(left: string[], right: string[]): boolean {
  const rightSet = new Set(right);
  return left.some((file) => rightSet.has(file));
}

export async function scheduleTasks<T>(
  tasks: OrchestrationTask[],
  run: (task: OrchestrationTask) => Promise<T>,
  workers: number,
): Promise<T[]> {
  if (!Number.isInteger(workers) || workers < 1) throw new Error('workers must be a positive integer');
  const byId = new Map(tasks.map((task) => [task.id, task]));
  if (byId.size !== tasks.length) throw new Error('Task IDs must be unique');
  for (const task of tasks) {
    for (const dependency of task.dependsOn) {
      if (!byId.has(dependency)) throw new Error(`Task ${task.id} depends on unknown task ${dependency}`);
    }
  }
  const completed = new Set<string>();
  const remaining = new Set(tasks.map((task) => task.id));
  const results: T[] = [];

  while (remaining.size > 0) {
    const active: OrchestrationTask[] = [];
    const activeWrites: string[] = [];
    for (const id of remaining) {
      const task = byId.get(id)!;
      if (!task.dependsOn.every((dependency) => completed.has(dependency))) continue;
      if (active.length >= workers || overlaps(task.writableFiles, activeWrites)) continue;
      active.push(task);
      activeWrites.push(...task.writableFiles);
    }
    if (active.length === 0) {
      const blocked = [...remaining].join(', ');
      throw new Error(`DAG cannot make progress; unresolved dependencies or cyclic plan near: ${blocked}`);
    }
    const batchResults = await Promise.all(active.map((task) => run(task)));
    active.forEach((task) => {
      remaining.delete(task.id);
      completed.add(task.id);
    });
    results.push(...batchResults);
  }
  return results;
}
