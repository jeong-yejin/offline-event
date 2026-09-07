import { execFile } from 'node:child_process';
import { cp, mkdtemp, mkdir, realpath, rm } from 'node:fs/promises';
import { promisify } from 'node:util';
import { dirname, isAbsolute, join, relative } from 'node:path';
import { tmpdir } from 'node:os';

const execFileAsync = promisify(execFile);

export interface IsolatedWorkspace {
  path: string;
  taskId: string;
  branch?: string;
  isGit: boolean;
}

export class WorkspaceManager {
  private readonly root: string;
  private readonly runId: string;
  private readonly created: IsolatedWorkspace[] = [];
  private baseDir?: string;

  constructor(root: string, runId: string) {
    this.root = root;
    this.runId = runId;
  }

  async prepare(taskId: string): Promise<IsolatedWorkspace> {
    const isGit = await this.detectGit();
    if (isGit) {
      this.baseDir ??= join(this.root, '.codex-orchestrator', 'worktrees', this.runId);
      await mkdir(this.baseDir, { recursive: true });
      const path = join(this.baseDir, taskId);
      const branch = `codex-orchestrator/${this.runId}/${taskId}`;
      await execFileAsync('git', ['worktree', 'add', '-b', branch, path, 'HEAD'], { cwd: this.root });
      const workspace = { path, taskId, branch, isGit: true };
      this.created.push(workspace);
      return workspace;
    }
    const tempParent = await this.safeTempParent();
    this.baseDir ??= await mkdtemp(join(tempParent, `codex-orchestrator-${this.runId}-`));
    const path = join(this.baseDir, taskId);
    await cp(this.root, path, {
      recursive: true,
      filter: (source) => !source.includes('/node_modules/') && !source.includes('/.codex-orchestrator-') && !source.includes('/.codex-orchestrator/'),
    });
    await mkdir(path, { recursive: true });
    const workspace = { path, taskId, isGit: false };
    this.created.push(workspace);
    return workspace;
  }

  async patchFor(workspace: IsolatedWorkspace): Promise<string> {
    if (!workspace.isGit) return '';
    const committed = await execFileAsync('git', ['diff', '--binary', `HEAD..${workspace.branch}`], { cwd: this.root }).catch(() => ({ stdout: '' }));
    const uncommitted = await execFileAsync('git', ['diff', '--binary', 'HEAD'], { cwd: workspace.path }).catch(() => ({ stdout: '' }));
    return `${committed.stdout}${uncommitted.stdout}`;
  }

  async changedFilesFor(workspace: IsolatedWorkspace): Promise<string[]> {
    if (!workspace.isGit) return [];
    const committed = await execFileAsync('git', ['diff', '--name-only', `HEAD..${workspace.branch}`], { cwd: this.root }).catch(() => ({ stdout: '' }));
    const uncommitted = await execFileAsync('git', ['diff', '--name-only', 'HEAD'], { cwd: workspace.path }).catch(() => ({ stdout: '' }));
    return [...new Set(`${committed.stdout}\n${uncommitted.stdout}`.split(/\r?\n/).map((file) => file.trim()).filter(Boolean))];
  }

  workspaceFor(taskId: string): IsolatedWorkspace | undefined {
    return this.created.find((workspace) => workspace.taskId === taskId);
  }

  async cleanup(): Promise<void> {
    for (const workspace of [...this.created].reverse()) {
      if (workspace.isGit) {
        await execFileAsync('git', ['worktree', 'remove', '--force', workspace.path], { cwd: this.root }).catch(() => undefined);
      } else {
        await rm(workspace.path, { recursive: true, force: true }).catch(() => undefined);
      }
    }
    if (this.baseDir && !this.created.some((workspace) => workspace.isGit)) {
      await rm(this.baseDir, { recursive: true, force: true }).catch(() => undefined);
    }
  }

  private async detectGit(): Promise<boolean> {
    try {
      await execFileAsync('git', ['rev-parse', '--is-inside-work-tree'], { cwd: this.root });
      return true;
    } catch {
      return false;
    }
  }

  private async safeTempParent(): Promise<string> {
    const candidate = tmpdir();
    const rootReal = await realpath(this.root).catch(() => this.root);
    const candidateReal = await realpath(candidate).catch(() => candidate);
    const distance = relative(rootReal, candidateReal);
    const candidateIsInsideRoot = distance === '' || (!distance.startsWith('..') && !isAbsolute(distance));
    return candidateIsInsideRoot ? dirname(candidateReal) : candidateReal;
  }
}

export async function applyPatchSafely(cwd: string, patch: string): Promise<{ applied: boolean; conflict: string | null }> {
  if (!patch.trim()) return { applied: true, conflict: null };
  try {
    const { spawn } = await import('node:child_process');
    await new Promise<void>((resolve, reject) => {
      const child = spawn('git', ['apply', '--3way', '--binary'], { cwd, stdio: ['pipe', 'pipe', 'pipe'] });
      let stderr = '';
      child.stderr.on('data', (chunk) => { stderr += chunk.toString(); });
      child.on('error', reject);
      child.on('close', (code) => code === 0 ? resolve() : reject(new Error(stderr || `git apply exited with ${code}`)));
      child.stdin.end(patch);
    });
    return { applied: true, conflict: null };
  } catch (error) {
    return { applied: false, conflict: `${(error as Error).message}\nUser changes were preserved; inspect conflict markers and the rejected patch.` };
  }
}
