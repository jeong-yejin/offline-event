import { describe, expect, it } from 'vitest';
import { WorkspaceManager } from '../src/workspace.js';
import { access, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

describe('workspace isolation', () => {
  it('preserves a pre-existing user file while preparing an isolated directory', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'orchestrator-workspace-'));
    const userFile = join(cwd, 'user-change.txt');
    await writeFile(userFile, 'keep me', 'utf8');
    const manager = new WorkspaceManager(cwd, 'run-1');
    const isolated = await manager.prepare('task-1');
    expect(isolated.path).not.toBe(cwd);
    await expect(import('node:fs/promises').then(({ readFile }) => readFile(userFile, 'utf8'))).resolves.toBe('keep me');
    await manager.cleanup();
  });

  it('uses a dedicated branch and worktree for a git repository', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'orchestrator-git-workspace-'));
    await execFileAsync('git', ['init', '-q'], { cwd });
    await execFileAsync('git', ['config', 'user.email', 'test@example.com'], { cwd });
    await execFileAsync('git', ['config', 'user.name', 'Test'], { cwd });
    await writeFile(join(cwd, 'README.md'), 'original', 'utf8');
    await execFileAsync('git', ['add', 'README.md'], { cwd });
    await execFileAsync('git', ['commit', '-qm', 'initial'], { cwd });
    const manager = new WorkspaceManager(cwd, 'run-git');
    const isolated = await manager.prepare('task-git');
    expect(isolated.isGit).toBe(true);
    expect(isolated.branch).toBe('codex-orchestrator/run-git/task-git');
    await access(join(isolated.path, 'README.md'));
    await manager.cleanup();
  });
});
