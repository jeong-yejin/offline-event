# Page Module Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split the monolithic `src/App.tsx` into page, shared component, data, and routing modules while preserving the current home/vote behavior and UI.

**Architecture:** `App.tsx` owns only route state and page composition. Home and vote pages live under `src/pages`, reusable UI primitives live under `src/components`, content constants live under `src/data`, and browser-history navigation is isolated in `src/router`. CSS and existing public assets remain unchanged unless a selector needs a stable component boundary.

**Tech Stack:** React, TypeScript, Vite, Vitest, Testing Library.

## Global Constraints

- Keep the behavior the same.
- Keep the home route at `/` and the vote route at `/vote`.
- Keep existing copy, assets, interaction states, and visual styling.
- Do not add runtime dependencies.
- `App.tsx` must not contain page markup or page-specific data.
- Preserve existing tests and add focused module-boundary coverage only if needed.

### Task 1: Architecture and module boundaries

**Files:**
- Create: `src/data/homeContent.ts`
- Create: `src/data/voteContent.ts`
- Create: `src/router/useAppRoute.ts`
- Create: `src/components/ArrowIcon.tsx`
- Create: `src/components/CtaWord.tsx`
- Create: `src/components/FooterWordmark.tsx`
- Create: `src/components/VoteCandidateLogo.tsx`
- Create: `src/pages/HomePage.tsx`
- Create: `src/pages/VotePage.tsx`
- Modify: `src/App.tsx`

- [ ] Move content constants and shared visual helpers into focused modules.
- [ ] Move home and vote markup into their page modules.
- [ ] Keep `App.tsx` limited to route selection and navigation wiring.
- [ ] Preserve all current class names and accessible labels.

### Task 2: Test and integration verification

**Files:**
- Modify: `src/ui.test.tsx` only if module extraction requires import or setup changes.

- [ ] Run `npm test -- --run`.
- [ ] Run `npm run build`.
- [ ] Verify home-to-vote navigation and vote submission behavior.
- [ ] Verify no console errors in the browser.

### Task 3: Review and optimization

- [ ] Confirm there are no circular imports or duplicated page data.
- [ ] Confirm shared components have narrow props and no page-state ownership.
- [ ] Confirm route changes continue to reset scroll position.
- [ ] Confirm the final folder structure and responsibilities are documented.
