# Codex Multi-Agent Orchestrator

`codex-orchestrate` is a fail-closed local orchestrator for ChatGPT Codex usage. It starts `codex app-server --listen stdio://` as a child process, performs `initialize`/`initialized`, checks `account/read`, `model/list`, and `account/rateLimits/read`, asks the Sol role for a JSON-schema-constrained plan/review, and runs Luna-role workers in isolated worktrees or copied temporary directories.

It does not call the OpenAI Responses API directly and does not read or send an API key. If the App Server reports API-key auth, logout, or missing requested models, the run stops with the available information and no fallback model.

By default, the original Sol/Luna contract is still strict: it requires ChatGPT Pro plus exact `gpt-5.6-sol` and `gpt-5.6-luna` model IDs. When you explicitly pass `--model` and `--effort`, the CLI uses that exact advertised model and effort for both roles. For example, `--model gpt-5.5 --effort high` runs Sol and Luna as orchestration roles on `gpt-5.5/high`; it does not pretend that dedicated GPT-5.6 Sol/Luna models were available.

## Setup

From the repository root:

```bash
npm install
npm link
codex-orchestrate --help
```

Node 20+ and a working `codex` executable are required. Authenticate the Codex CLI with ChatGPT. If needed:

```bash
codex-orchestrate doctor --login
```

Complete the printed `chatgptDeviceCode` verification, then run `codex-orchestrate doctor` again.

## Commands

```bash
codex-orchestrate run --goal "로그인 기능을 분석하고 테스트까지 추가해줘" --cwd . --workers 4
codex-orchestrate run --goal "로그인 기능을 수정하고 검증해줘" --cwd . --workers 4 --apply
codex-orchestrate run --goal "로그인 기능을 분석하고 테스트까지 추가해줘" --cwd . --workers 4 --model gpt-5.5 --effort high
codex-orchestrate doctor --model gpt-5.5 --effort high
codex-orchestrate doctor
codex-orchestrate models
```

`--apply` is the only mode that applies Sol-approved worker patches in the reported order. Without it, worker workspaces are inspected and removed after the report. Existing user changes remain in the root; a three-way patch conflict is reported and is not silently resolved.

## Tests

The normal test suite never consumes model usage:

```bash
npm run typecheck
npm test
npm run build
```

Mock workflow checks use `codex-orchestrate run ... --mock`. Real account/model/rate-limit checks are intentionally explicit via `doctor`, `models`, or a separately opted-in integration command; this repository does not run real model turns as part of normal tests.

The read-only integration check can be run explicitly with:

```bash
CODEX_ORCHESTRATOR_INTEGRATION=1 npx vitest run tools/codex-orchestrator/test/integration.test.ts
```

It may fail closed when the current account is not ChatGPT Pro or the exact Sol/Luna ids are not in the current catalog; that is expected and is reported rather than hidden.

## Limits

- Exact model availability is checked against the current App Server catalog; this project will not silently substitute a model. Explicit model mode requires both `--model` and `--effort`.
- `--model gpt-5.5 --effort high` preserves the orchestration workflow but uses role instructions rather than dedicated GPT-5.6 Sol/Luna model IDs.
- App Server protocol fields can evolve because `codex app-server` is experimental. The client uses the currently observed v2 methods and the generated schema-compatible fields.
- A worker can report a commit or patch; automatic merge remains disabled unless `--apply` is supplied.
