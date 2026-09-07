# Styles CSS Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split the monolithic `src/styles.css` into maintainable responsibility-based CSS modules without changing rendered behavior.

**Architecture:** Keep `src/styles.css` as the stable entrypoint imported by `main.tsx`. It will contain ordered `@import` statements for fonts/tokens, reset/base, motion, home-page styles, vote-page styles, and responsive overrides. The import order is part of the contract because the vote-page editorial overrides intentionally follow the legacy vote rules.

**Tech Stack:** CSS, Vite CSS imports, React/Vite asset URLs.

## Global Constraints

- Preserve all selectors, class names, asset URLs, font declarations, responsive behavior, animations, and cascade outcomes.
- Keep `src/styles.css` as the existing import entrypoint.
- Do not add dependencies.
- Do not change JSX or public assets.
- Prefer CSS custom properties for shared visual tokens; do not alter their resolved values.

### Task 1: CSS module extraction

- [ ] Create ordered CSS partials for base/tokens, motion, home page, vote page, and responsive rules.
- [ ] Replace the monolithic stylesheet body with ordered imports.
- [ ] Preserve the later vote-page override block and mobile override order.

### Task 2: Review and optimization

- [ ] Verify no selectors or font/asset URLs are lost.
- [ ] Verify there are no circular CSS imports.
- [ ] Reduce repeated literal tokens only when computed styles remain identical.
- [ ] Run tests, typecheck, build, and browser visual smoke checks.
