# Agent operating policy

## Repository role

This repository is **DungeonMind Web**, the public/authenticated React frontend for dungeonmind.net.

It owns frontend routes, presentation, interaction, shared auth/header/theme, and frontend product state.

It does **not** own:

- backend/API behavior → DungeonMindServer;
- reusable inference execution → GenerationEngine;
- durable world-knowledge internals → DungeonMind;
- DungeonBuddy product semantics → DungeonMindBuddy;
- cross-repository architecture/sequencing → DungeonOverMind.

Start from `README.md` and `Docs/README.md`. Do not preload historical `Docs/Archive/` material.

## Ecosystem execution core — overmind-agent-core-v1

These rules are intentionally shared across active DungeonMind ecosystem repositories. Repository-specific law may add constraints, but it must not weaken this core.

1. **Re-anchor before action.** Fetch the current remote default branch and inspect relevant open PRs/active work before editing, reviewing, or merging. Chat history, stale handoffs, and local `main` are not current authority.
2. **Respect ownership boundaries.** Cross-repository architecture and sequencing belong in DungeonOverMind; runtime/product implementation belongs in the repository that owns the capability. When a change crosses owners, name the contract.
3. **Handoffs are portable bounded contracts.** A handoff may live on `main`, a branch, a PR, or another durable pinned ref/location. Its location alone neither activates nor invalidates it. Execution authority comes from explicit authorization/status, a pinned authority/ref, and bounded scope/write ownership. Do not require a handoff to be merged to `main` unless the specific workstream explicitly makes that a gate.
4. **Finish authorized implementation work all the way to a PR.** Once implementation is authorized, ordinary completion includes: implement → test/verify → inspect the cumulative diff → commit intended changes → push the branch → open or update the assigned PR. If no PR exists, open it. Do not stop with intended work only local, uncommitted, or unpushed and wait for another prompt to commit/push/open the PR.
5. **Merge is separate authority.** Opening/updating a PR is part of implementation completion; merging it is not. Merge only when the user or the repository's explicit process authorizes merge.
6. **Use isolated Git lanes.** Do not develop on local `main`. Use a branch/worktree or equivalent isolated checkout, and treat file/runtime/state collisions as coordination problems rather than relying on Git conflicts.
7. **Keep slices bounded.** One implementation slice should deliver one independently useful capability. A second capability, new durable/public contract, or unplanned extra PR is a stop/split signal unless explicitly authorized.
8. **Verify at the owning boundary.** Review the exact cumulative base→head diff and prove behavior at the layer that owns the invariant. A green helper test is not evidence for a boundary it does not exercise.
9. **Settle after merge.** Re-anchor, synchronize mutable authority that now became stale, and prune superseded process/transition scaffolding. Git history is the default archive; preserve a separate archive copy only when it carries unique durable evidence.

## Current application architecture

Current shell is defined by `src/App.tsx`.

The shared composition is:

```text
MantineProvider
→ AuthProvider
→ AppProvider
→ BrowserRouter
→ StatBlockGeneratorProvider
→ route surfaces
```

### Navigation

`UnifiedHeader` + `NavigationDrawer` are the current shared navigation pattern.

Do **not** restore or design around:

- the removed fixed `NavBar` sidebar;
- an 80px global left margin;
- `FloatingHeader` as the site navigation pattern.

Tool-specific drawers/state belong to the owning product component. Keep `UnifiedHeader` primarily presentational/composable; do not centralize unrelated product state into it.

## Styling

Mantine 7 and `src/config/mantineTheme.ts` are current shared UI foundations.

Use current code/design tokens before inventing new global styling rules.

Existing product-specific CSS is allowed. Do not perform broad CSS→Mantine rewrites unless the task independently requires them.

Avoid global selectors that can change Canvas/print layouts unintentionally.

## API and auth

Use `DUNGEONMIND_API_URL` from `src/config.ts`; do not hard-code backend origins.

Use `AuthContext` for browser authentication state.

Authenticated backend calls should follow current cookie/credentials patterns.

Do not copy backend schemas/policy into frontend code when the API contract can own them.

## Shared packages

`dungeonmind-canvas` is the Canvas repository's public package.

Treat Canvas internals as external-library authority. Frontend adapters/projections belong here; reusable Canvas mechanics belong in Canvas.

## Product-local authority

For current behavior:

```text
current code/tests
→ current component/design docs
→ merged commit/PR evidence
→ Docs/Archive / Git history
```

Old specs/handoffs are historical even if they contain unchecked boxes or say READY.

Open/staged work is proposed behavior, not `main` authority.

## TypeScript / React

- Prefer typed functional components and hooks.
- Avoid new `any` unless crossing an untyped boundary that is documented locally.
- Keep shared state in the narrowest appropriate context/provider.
- Clean up event listeners/timers/subscriptions.
- Preserve current route and auth behavior unless the task explicitly changes them.
- Add/adjust focused tests for behavioral changes when practical.

## Async / performance

Frontend network operations are naturally async. Do not introduce worker/thread abstractions for ordinary HTTP I/O.

Avoid unbounded fan-out and duplicate fetches.

Do not optimize by intuition alone; preserve correctness and measure before adding caching/concurrency machinery.

## Development commands

Current build system is Create React App / `react-scripts`.

```bash
npm start
npm test
npm run build
```

The repository currently contains both npm and pnpm lockfiles. Do not silently normalize package managers or rewrite dependency locks as incidental cleanup; the platform-refresh lane should settle that deliberately.

There is no configured Storybook script.

## Documentation

Active repository documentation starts at `Docs/README.md`.

Create/update owner docs only when they capture current frontend truth that must survive independently of code/tests.

Completed implementation plans, exploratory research, debug logs, and one-off creative briefs belong in Archive or Git history.

## Platform refresh

`Docs/Plans/ANCHOR-dungeonmind-net-platform-refresh.md` is context only. It authorizes no frontend modernization by itself.

CRA→Vite, product-shell restructuring, Buddy integration, package-manager normalization, and auth/theme sharing should arrive through bounded implementation handoffs after DungeonOverMind stewardship settles the target architecture.
