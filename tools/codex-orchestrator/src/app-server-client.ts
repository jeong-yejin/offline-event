import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';
import { createInterface } from 'node:readline';
import type {
  Account,
  JsonRpcMessage,
  JsonRpcResponse,
  ModelInfo,
  RateLimits,
  ThreadStartResponse,
} from './protocol.js';
import { log } from './logger.js';

export interface AppServerClientOptions {
  command?: string;
  args?: string[];
  cwd?: string;
  env?: NodeJS.ProcessEnv;
  child?: ChildProcessWithoutNullStreams;
}

type Pending = { resolve: (value: unknown) => void; reject: (reason: Error) => void };

export function parseJsonRpcLine(line: string): JsonRpcMessage | null {
  if (!line.trim()) return null;
  try {
    return JSON.parse(line) as JsonRpcMessage;
  } catch (error) {
    throw new Error(`Invalid JSON-RPC line: ${(error as Error).message}`);
  }
}

export class AppServerClient {
  private process?: ChildProcessWithoutNullStreams;
  private nextId = 1;
  private closing = false;
  private readonly pending = new Map<number, Pending>();
  private readonly notifications: Array<(message: JsonRpcMessage) => void> = [];
  private readonly options: AppServerClientOptions;

  constructor(options: AppServerClientOptions = {}) {
    this.options = options;
  }

  async connect(): Promise<unknown> {
    this.closing = false;
    this.process = this.options.child ?? spawn(this.options.command ?? 'codex', this.options.args ?? ['app-server', '--listen', 'stdio://'], {
      cwd: this.options.cwd,
      env: this.options.env,
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    const stdout = this.process.stdout;
    const stderr = this.process.stderr;
    createInterface({ input: stdout }).on('line', (line) => this.handleLine(line));
    stderr.on('data', (chunk) => log('debug', 'app_server_stderr', { message: chunk.toString().trim() }));
    this.process.on('exit', (code, signal) => {
      if (this.closing) return;
      const error = new Error(`App Server exited (code=${code ?? 'null'}, signal=${signal ?? 'null'})`);
      for (const pending of this.pending.values()) pending.reject(error);
      this.pending.clear();
    });
    const initialized = await this.request('initialize', {
      clientInfo: { name: 'event-perpdex-orchestrator', version: '0.1.0' },
      capabilities: { experimentalApi: true },
    });
    this.notify('initialized', {});
    return initialized;
  }

  onMessage(handler: (message: JsonRpcMessage) => void): () => void {
    this.notifications.push(handler);
    return () => {
      const index = this.notifications.indexOf(handler);
      if (index >= 0) this.notifications.splice(index, 1);
    };
  }

  request<T = unknown>(method: string, params?: unknown): Promise<T> {
    if (!this.process?.stdin.writable) return Promise.reject(new Error('App Server is not connected'));
    const id = this.nextId++;
    const request = { id, method, params };
    return new Promise<T>((resolve, reject) => {
      this.pending.set(id, { resolve: resolve as (value: unknown) => void, reject });
      this.process!.stdin.write(`${JSON.stringify(request)}\n`);
    });
  }

  notify(method: string, params?: unknown): void {
    if (!this.process?.stdin.writable) return;
    this.process.stdin.write(`${JSON.stringify({ method, params })}\n`);
  }

  async accountRead(): Promise<{ account: Account | null; requiresOpenaiAuth: boolean }> {
    return this.request('account/read', {});
  }

  async modelList(): Promise<{ data: ModelInfo[]; nextCursor?: string | null }> {
    const models: ModelInfo[] = [];
    let cursor: string | null | undefined;
    do {
      const response = await this.request<{ data: ModelInfo[]; nextCursor?: string | null }>('model/list', {
        cursor,
        includeHidden: false,
      });
      models.push(...response.data);
      cursor = response.nextCursor;
    } while (cursor);
    return { data: models, nextCursor: null };
  }

  rateLimitsRead(): Promise<RateLimits> {
    return this.request('account/rateLimits/read', {});
  }

  threadStart(params: Record<string, unknown>): Promise<ThreadStartResponse> {
    return this.request('thread/start', params);
  }

  turnStart(params: Record<string, unknown>): Promise<{ turn?: unknown }> {
    return this.request('turn/start', params);
  }

  loginDeviceCode(): Promise<unknown> {
    return this.request('account/login/start', { type: 'chatgptDeviceCode' });
  }

  async close(): Promise<void> {
    if (!this.process) return;
    this.closing = true;
    this.process.kill('SIGTERM');
    await new Promise<void>((resolve) => {
      const timer = setTimeout(resolve, 500);
      this.process?.once('exit', () => {
        clearTimeout(timer);
        resolve();
      });
    });
    this.process = undefined;
  }

  private handleLine(line: string): void {
    let message: JsonRpcMessage;
    try {
      const parsed = parseJsonRpcLine(line);
      if (!parsed) return;
      message = parsed;
    } catch (error) {
      log('error', 'app_server_protocol_error', { message: (error as Error).message });
      return;
    }
    if ('id' in message && typeof message.id === 'number') {
      const pending = this.pending.get(message.id);
      if (!pending) return;
      this.pending.delete(message.id);
      const response = message as JsonRpcResponse;
      if (response.error) pending.reject(new Error(`${response.error.code}: ${response.error.message}`));
      else pending.resolve(response.result);
      return;
    }
    for (const handler of this.notifications) handler(message);
  }
}
