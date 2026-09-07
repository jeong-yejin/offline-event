import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import type { AppServerClient } from './app-server-client.js';
import type { Account, ModelInfo, RateLimits } from './protocol.js';
import { log } from './logger.js';

const execFileAsync = promisify(execFile);
export const requiredModelIds = ['gpt-5.6-sol', 'gpt-5.6-luna'] as const;

export interface PreflightInput {
  codexVersion: string;
  account: Account | null;
  models: Array<Pick<ModelInfo, 'id' | 'supportedReasoningEfforts'>>;
}

export interface ModelOverride {
  model?: string;
  effort?: string;
}

export interface PreflightReport extends PreflightInput {
  rateLimitsBefore?: RateLimits;
  sol: Pick<ModelInfo, 'id' | 'supportedReasoningEfforts'>;
  luna: Pick<ModelInfo, 'id' | 'supportedReasoningEfforts'>;
  solReasoningEffort?: string;
  lunaReasoningEffort?: string;
  notices: string[];
}

function advertisedEfforts(model: Pick<ModelInfo, 'supportedReasoningEfforts'>): string[] {
  return model.supportedReasoningEfforts.map((effort) => typeof effort === 'string' ? effort : effort.reasoningEffort);
}

export function assertPreflight(input: PreflightInput, override: ModelOverride = {}): PreflightReport {
  if (!input.account) throw new Error('ChatGPT account is logged out. Run `codex-orchestrate doctor --login` and complete chatgptDeviceCode login.');
  if (input.account.type !== 'chatgpt') {
    throw new Error('API-key or non-ChatGPT authentication is not supported. Switch to ChatGPT with `account/login/start` type `chatgptDeviceCode`, then retry.');
  }
  const hasExplicitModel = Boolean(override.model);
  if (!hasExplicitModel && input.account.planType !== 'pro') {
    throw new Error(`ChatGPT authentication is present but the plan is ${input.account.planType}; this orchestrator requires ChatGPT Pro.`);
  }
  const found = new Map(input.models.map((model) => [model.id.toLowerCase(), model]));
  if (hasExplicitModel) {
    const requestedId = override.model!.toLowerCase();
    const selected = found.get(requestedId);
    if (!selected) {
      const available = input.models.map((model) => model.id).sort();
      throw new Error(`Requested model is unavailable: ${override.model}. No fallback will be used. Available models: ${available.join(', ') || '(none)'}`);
    }
    if (!override.effort) throw new Error('Explicit model override requires --effort so the orchestrator does not infer a hidden default.');
    const efforts = advertisedEfforts(selected);
    if (!efforts.includes(override.effort)) {
      throw new Error(`Requested model ${selected.id} does not support reasoning effort ${override.effort}. Available efforts: ${efforts.join(', ') || '(none)'}`);
    }
    const notices = [`Explicit model override active: Sol and Luna roles will both run on ${selected.id} with reasoning effort ${override.effort}.`];
    if (input.account.planType !== 'pro') notices.push(`Current ChatGPT plan is ${input.account.planType}; continuing because the model override was explicit.`);
    return {
      ...input,
      sol: selected,
      luna: selected,
      solReasoningEffort: override.effort,
      lunaReasoningEffort: override.effort,
      notices,
    };
  }
  const missing = requiredModelIds.filter((id) => !found.has(id));
  if (missing.length > 0) {
    const available = input.models.map((model) => model.id).sort();
    throw new Error(`Required models are unavailable: ${missing.join(', ')}. No fallback will be used. Available models: ${available.join(', ') || '(none)'}`);
  }
  return {
    ...input,
    sol: found.get('gpt-5.6-sol')!,
    luna: found.get('gpt-5.6-luna')!,
    notices: [],
  };
}

export async function readCodexVersion(command = 'codex'): Promise<string> {
  try {
    const result = await execFileAsync(command, ['--version']);
    return result.stdout.trim();
  } catch (error) {
    throw new Error(`Unable to execute ${command} --version: ${(error as Error).message}`);
  }
}

export async function runPreflight(client: AppServerClient, command = 'codex', override: ModelOverride = {}): Promise<PreflightReport> {
  const codexVersion = await readCodexVersion(command);
  const accountResponse = await client.accountRead();
  const modelsResponse = await client.modelList();
  const report = assertPreflight({ codexVersion, account: accountResponse.account, models: modelsResponse.data }, override);
  report.rateLimitsBefore = await client.rateLimitsRead();
  log('info', 'preflight_passed', {
    codexVersion,
    accountType: report.account?.type,
    planType: report.account?.type === 'chatgpt' ? report.account.planType : undefined,
    models: report.models.map((model) => model.id),
    selectedModel: override.model,
    selectedEffort: override.effort,
  });
  return report;
}
