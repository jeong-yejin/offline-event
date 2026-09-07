#!/usr/bin/env node
import { parseArgs } from 'node:util';
import { AppServerClient } from './app-server-client.js';
import { log } from './logger.js';
import { readCodexVersion, runPreflight } from './preflight.js';
import { runOrchestration } from './run.js';

function help(): string {
  return `codex-orchestrate\n\nUsage:\n  codex-orchestrate run --goal "..." [--cwd .] [--workers 4] [--apply] [--mock] [--model gpt-5.5 --effort high]\n  codex-orchestrate doctor [--login] [--model gpt-5.5 --effort high]\n  codex-orchestrate models\n\nThis CLI uses Codex App Server stdio and ChatGPT authentication only. It never uses an API key or OpenAI Responses API directly. Without an explicit model override it requires ChatGPT Pro plus exact gpt-5.6-sol and gpt-5.6-luna availability.`;
}

async function main(): Promise<void> {
  const { positionals, values } = parseArgs({
    allowPositionals: true,
    options: {
      goal: { type: 'string' }, cwd: { type: 'string', default: '.' }, workers: { type: 'string', default: '4' }, apply: { type: 'boolean', default: false }, mock: { type: 'boolean', default: false }, login: { type: 'boolean', default: false }, help: { type: 'boolean', short: 'h', default: false },
      model: { type: 'string' }, effort: { type: 'string' },
    },
  });
  const command = positionals[0] ?? 'help';
  const model = values.model ?? process.env.CODEX_ORCHESTRATOR_MODEL;
  const effort = values.effort ?? process.env.CODEX_ORCHESTRATOR_EFFORT;
  if (values.help || command === 'help') { console.log(help()); return; }
  if (command === 'run') {
    if (!values.goal) throw new Error('--goal is required');
    const report = await runOrchestration({ goal: values.goal, cwd: values.cwd ?? '.', workers: Number(values.workers), apply: Boolean(values.apply), mock: Boolean(values.mock), integration: false, model, effort });
    console.log(JSON.stringify(report, null, 2));
    return;
  }
  if (command === 'doctor' || command === 'models') {
    const client = new AppServerClient();
    await client.connect();
    try {
      if (values.login) {
        const login = await client.loginDeviceCode();
        console.log(JSON.stringify({ message: 'Complete ChatGPT device-code login, then rerun doctor.', login }, null, 2));
        return;
      }
      const version = await readCodexVersion();
      const account = await client.accountRead();
      const models = await client.modelList();
      const rateLimits = await client.rateLimitsRead();
      if (command === 'models') { console.log(JSON.stringify({ codexVersion: version, account, models: models.data, rateLimits }, null, 2)); return; }
      try {
        const report = await runPreflight(client, 'codex', { model, effort });
        console.log(JSON.stringify(report, null, 2));
      } catch (error) {
        console.log(JSON.stringify({ codexVersion: version, account, models: models.data, rateLimits, error: (error as Error).message }, null, 2));
        process.exitCode = 1;
      }
    } finally { await client.close(); }
    return;
  }
  throw new Error(`Unknown command: ${command}\n\n${help()}`);
}

main().catch((error) => { log('error', 'cli_failed', { message: (error as Error).message }); process.exitCode = 1; });
