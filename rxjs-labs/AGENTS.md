# AGENTS.md — RxJS + TypeScript project rules for Codex

## What success looks like
- Produce a clean PR with minimal, relevant changes.
- Run tests and fix failures before handing back.
- Keep streams alive: model errors as data when feasible.

## Setup commands
- Install: `npm ci` (or `pnpm install`)
- Typecheck: `npm run typecheck`
- Tests: `npm test`
- Lint: `npm run lint`
- Dev: `npm run dev`
- Build: `npm run build`

## Coding conventions (must follow)
- Language: TypeScript. Avoid `any` unless absolutely necessary (prefer generics, unions).
- Avoid classes; prefer pure functions and plain objects.
- Railway-Oriented Programming style:
  - Business logic in pure functions.
  - RxJS orchestrates those functions over time.
  - Side effects at the subscribe boundary.
  - Prefer “errors as data” (Result/Either-like values) over throwing.
- RxJS pipeline style:
  1) define source observables
  2) merge sources
  3) apply transformations/operators
  4) define reducer functions for `scan` (suffix: `...Steps`, not `...Reducer`)
  5) subscribe only for side effects (render, IO)
- Prefer readable naming over cleverness.

## Testing conventions
- Use Vitest.
- For timing-sensitive operators, use RxJS `TestScheduler` (virtual time) and marble tests.

## Diagram conventions (when asked to generate Mermaid)
- flowchart TD with vertically stacked subgraphs per operator stage (L1, L2, …)
- LR inside each subgraph
- declare nodes/subgraphs first, then edges
- label all arrows, show emitted values, avoid parentheses in labels

## PR hygiene
- Keep diffs small and explain intent in PR description.
- Do not reformat unrelated files.
- If requirements are ambiguous, list assumptions in the PR body.

## Setup commands
- Install (CI): `npm ci`
- Install (local): `npm install`
- Typecheck: `npm run typecheck`
- Tests: `npm test`
- Lint: `npm run lint`
- PR gate: `npm run check`
- Dev: `npm run dev`
- Build: `npm run build`
