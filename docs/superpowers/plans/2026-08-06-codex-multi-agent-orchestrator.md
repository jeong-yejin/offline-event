# Codex Multi-Agent Orchestrator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a React/TypeScript UI and Node 20+ CLI that orchestrates GPT-5.6 Sol planning/review and GPT-5.6 Luna parallel work through Codex App Server stdio and ChatGPT Pro auth only.

**Architecture:** A newline-delimited JSON-RPC App Server client owns the child `codex app-server --listen stdio://` process and exposes typed account, model, rate-limit, thread, and turn calls. The orchestrator performs a fail-closed preflight, asks Sol for a JSON-schema-constrained DAG, runs non-overlapping Luna work in isolated git worktrees or temporary directories with a bounded scheduler, then asks Sol to review and optionally applies approved patches. A Vite React console visualizes the run using the supplied Figma screen as the visual reference.

**Tech Stack:** Node.js 20+, TypeScript, React, Vite, Vitest, Node `parseArgs`, JSON-RPC over stdio, Git worktree, CSS.

## Global Constraints

- Never use OpenAI Responses API or an API key; only Codex App Server and ChatGPT authentication.
- Fail closed when authentication is missing/API-key based or either exact required model is unavailable.
- Use `codex app-server --listen stdio://`; do not use WebSocket transport.
- Default worker concurrency is four and is bounded by `--workers`.
- Overlapping write sets never run concurrently; retries are capped at two per task.
- Do not delete or overwrite pre-existing user changes; automatic merge is opt-in via `--apply`.
- General tests use the Mock App Server; real account/model/rate-limit checks are explicit doctor/models/integration operations only.

### Task 1: Protocol and fail-closed preflight

**Files:**
- Create: `tools/codex-orchestrator/src/app-server-client.ts`
- Create: `tools/codex-orchestrator/src/protocol.ts`
- Create: `tools/codex-orchestrator/src/preflight.ts`
- Create: `tools/codex-orchestrator/src/logger.ts`
- Test: `tools/codex-orchestrator/test/preflight.test.ts`
- Test: `tools/codex-orchestrator/test/app-server-client.test.ts`

**Interfaces:** `AppServerClient.connect()`, `request(method, params)`, `preflight(client, requiredModels)`, and typed `PreflightReport`.

- [ ] Write tests for initialize/initialized, account auth rejection, exact model matching, and rate-limit snapshots.
- [ ] Implement the line-delimited JSON-RPC client and notification/request handling.
- [ ] Implement binary/version and account/model/rate-limit gates with explicit device-code guidance.
- [ ] Run protocol tests and typecheck.

### Task 2: Sol planner, Luna worker, DAG scheduler, isolation

**Files:**
- Create: `tools/codex-orchestrator/src/contracts.ts`
- Create: `tools/codex-orchestrator/src/sol.ts`
- Create: `tools/codex-orchestrator/src/luna-worker.ts`
- Create: `tools/codex-orchestrator/src/scheduler.ts`
- Create: `tools/codex-orchestrator/src/workspace.ts`
- Create: `tools/codex-orchestrator/src/retry.ts`
- Test: `tools/codex-orchestrator/test/scheduler.test.ts`
- Test: `tools/codex-orchestrator/test/retry.test.ts`
- Test: `tools/codex-orchestrator/test/workspace.test.ts`

**Interfaces:** `SolPlanner.plan()`, `SolReviewer.review()`, `LunaWorker.run()`, `scheduleTasks()`, `WorkspaceManager.prepare()`, and `RetryLedger.run()`.

- [ ] Write failing tests for dependency order, write-set exclusion, four-worker cap, bounded retries, duplicate fingerprints, and preserved user files.
- [ ] Implement strict plan/result validators and prompt construction with only task-scoped context.
- [ ] Implement isolated worktree/temp-dir lifecycle and patch/commit metadata.
- [ ] Implement scheduler and retry ledger.
- [ ] Run scheduler/isolation tests and typecheck.

### Task 3: CLI, mock server, end-to-end workflow, documentation

**Files:**
- Create: `tools/codex-orchestrator/src/cli.ts`
- Create: `tools/codex-orchestrator/src/run.ts`
- Create: `tools/codex-orchestrator/src/mock-app-server.ts`
- Create: `tools/codex-orchestrator/test/mock-run.test.ts`
- Create: `tools/codex-orchestrator/README.md`
- Create: `tools/codex-orchestrator/.env.example`
- Create: `tools/codex-orchestrator/package.json`
- Create: `tools/codex-orchestrator/tsconfig.json`
- Create: `tools/codex-orchestrator/vitest.config.ts`

- [ ] Write the Mock App Server workflow test before wiring the CLI.
- [ ] Implement `run`, `doctor`, and `models` commands, structured logs, `--workers`, `--apply`, and explicit integration opt-in.
- [ ] Implement the mock server and full workflow assertions, including no infinite retry.
- [ ] Document setup, authentication, model gate behavior, safe apply semantics, and real integration commands.
- [ ] Run install, typecheck, unit tests, mock workflow, help, and failure-path checks.

### Task 4: Figma-based React console

**Files:**
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/styles.css`
- Create: `index.html`
- Create: `vite.config.ts`
- Create: `src/ui.test.tsx`
- Modify: `package.json`

- [ ] Write UI tests for goal input, worker control, start state, and cookie consent dismissal.
- [ ] Implement the Figma-inspired Sequence Collect shell: soft gray canvas, serif hero, cobalt canvas art, sponsor/speaker/agenda bands, fixed cookie dialog, and orchestrator run panel.
- [ ] Connect the visible controls to local state and a mock-safe start interaction without pretending a real account run succeeded.
- [ ] Run Vite build, UI tests, browser smoke checks, and responsive screenshot verification.

### Task 5: Final verification

- [ ] Run fresh install, `tsc`, all Vitest tests, Mock App Server full run, CLI help, invalid option/error cases, and user-change preservation checks.
- [ ] Run `codex-orchestrate doctor` and `codex-orchestrate models` against the local App Server when available; record actual account/model/rate-limit results without invoking model turns.
- [ ] Capture the Figma reference and latest UI screenshot, inspect both, and record at least five fidelity comparison points plus any intentional deviations.
- [ ] Update README with exact verified limitations and final command examples.
