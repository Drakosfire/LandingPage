# Anchor — DungeonMind.net Platform Refresh

**Status:** ACTIVE REFERENCE / NO IMPLEMENTATION DISPATCH  
**Created:** 2026-09-25  
**Cross-repository authority:** `Drakosfire/DungeonOverMind/Docs/roadmaps/ROADMAP-dungeonmind-net-platform-refresh.md`  
**Steward handoff:** `Drakosfire/DungeonOverMind/Docs/Plans/STEWARDS-HANDOFF-dungeonmind-net-platform-refresh.md`

## Why this exists

This repository is named `LandingPage`, but it already functions as the primary DungeonMind web application shell: public home, auth-aware UI, shared theme/header, and multiple product routes.

DungeonBuddy's future launch on `dungeonmind.net` is an opportunity to decide deliberately what **DungeonMind Web** should become.

This repository remains the owner of public web presentation, routes, interaction, and frontend product state.

OverMind owns the cross-repository platform-refresh architecture and sequencing.

## Questions the steward will resolve

- The repository is now documented conceptually as **DungeonMind Web** while retaining its physical repository name for now.
- Should Create React App / `react-scripts` move to Vite before Buddy launch?
- What public/authenticated navigation should exist?
- What does a World-oriented product home look like?
- How should existing tools remain visible and useful?
- Should Buddy remain an independent SPA under the same origin, mount through this shell, or eventually consolidate?
- What auth/theme/header contracts should be shared without coupling the repositories?
- Does standalone Canvas remain a useful shared frontend dependency in this future?
- Which package manager/lockfile should be authoritative? Both `package-lock.json` and `pnpm-lock.yaml` are currently committed.

## Working direction — not yet implementation authority

Prefer:

- one coherent DungeonMind.net identity and login;
- a first-class persistent-world/Buddy entry;
- existing tools retained during transition;
- same-origin integration without forcing same repository/build artifact;
- modernization that reduces maintenance rather than simply rewrites UI.

## Scope guard

This anchor authorizes no frontend redesign or migration.

The separate Buddy UI pause/re-entry decision remains independent.

Any platform-refresh frontend implementation must arrive as a bounded handoff after the OverMind steward completes the target architecture and sequencing.
