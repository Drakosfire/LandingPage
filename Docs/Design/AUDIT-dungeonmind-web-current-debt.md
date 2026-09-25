# Audit — DungeonMind Web Current Architecture Debt

**Status:** ACTIVE REFERENCE  
**Last reviewed:** 2026-09-25  
**Scope:** frontend/platform pressure that remains true on current `main`; not an implementation roadmap.

## Verified current pressure

1. **Repository naming lags behavior.**
   Physical repo name is `LandingPage`, but it is the full DungeonMind Web application shell. Documentation now uses the conceptual name without requiring a rename.

2. **Create React App is still the build system.**
   `react-scripts@5` remains current. The platform-refresh steward is evaluating Vite, but no migration exists yet.

3. **Two package-manager lockfiles are committed.**
   Both `package-lock.json` and `pnpm-lock.yaml` exist. Do not guess which is canonical during unrelated work; normalize only through an explicit tooling slice.

4. **The root application eagerly imports many product surfaces.**
   `src/App.tsx` imports home/blog/generator/demo routes directly. Route-level lazy loading/code splitting is not currently part of the shell.

5. **Demo/development routes are mounted in the same router table.**
   `/test-unified-header`, `/generation-drawer-demo`, `/ruleslawyer-demo`, and `/map-demo` are current routes. A platform-refresh slice should decide whether production builds should expose them.

6. **Auth refresh is polling/event-driven in the browser.**
   `AuthContext` refreshes on mount, every five minutes, window focus, and visibility changes. This is current product behavior; any simplification must preserve OAuth/session correctness.

7. **CardGenerator persistence has overlapping historical paths.**
   Current code uses session helpers, named-project CRUD, and localStorage recovery/cache. The boundary is documented in `Docs/Design/CARDGENERATOR-PERSISTENCE.md`; future cleanup should be behavior-driven rather than a wholesale rewrite.

8. **Legacy debug/generated artifacts had been committed.**
   The 2026-09-25 documentation pass removes old PCG run logs and a tracked debug script and adds ignore rules to prevent recurrence.

## Modernization direction

The platform-refresh lane should consider bounded slices around:

- CRA→Vite only if migration cost is justified;
- one authoritative package manager/lockfile;
- production/demo route separation;
- route-level loading/bundle strategy if measured bundle/startup pressure warrants it;
- coherent authenticated product shell for persistent Worlds/Buddy;
- preserving UnifiedHeader/auth/theme contracts without forcing Buddy into this repository.

Do not use this audit as permission for a broad visual rewrite.
