# Report — DungeonMind Web Documentation Authority Audit, 2026-09-25

**Status:** COMPLETE — first rigor pass  
**Repository:** `Drakosfire/LandingPage`

## Result

LandingPage now documents what it actually is:

> **DungeonMind Web — the public/authenticated frontend application for dungeonmind.net**

The repository owns frontend routes, shared auth/header/theme, product interaction, and frontend product state. Cross-repository architecture/sequencing stays in DungeonOverMind.

## Major corrections

- replaced untouched Create React App boilerplate README with current product/runtime ownership;
- established `Docs/README.md` as the frontend documentation authority index;
- refreshed CardGenerator and PlayerCharacterGenerator component READMEs against current code;
- created current CardGenerator persistence boundary guidance;
- archived completed visual-refresh and PCG spec/research/project corpora;
- archived completed root UX handoffs;
- consolidated historical OverMind imports under the canonical `Docs/Archive/` namespace;
- retained the DungeonMind.net platform-refresh anchor as active cross-repository context without treating it as implementation authorization.

## Current implementation truth captured

Current shell is:

```text
React 18
TypeScript 4.9
React Router 6
Mantine 7
Create React App / react-scripts 5
dungeonmind-canvas shared package
```

`src/App.tsx` currently composes Mantine, AuthProvider, AppProvider, BrowserRouter, StatBlockGeneratorProvider, and product routes.

Auth authority is `src/context/AuthContext.tsx`.

API-origin authority is `src/config.ts`.

UnifiedHeader is the shared navigation/header pattern.

## Archive policy

Historical specs and project research remain available under `Docs/Archive/2026-09-25/`, but they cannot direct current work.

This is especially important for PCG: old phase labels, prototypes, and research docs describe intermediate states that current implementation has already surpassed.

## Deliberate non-cleanup

Module-local documentation remains beside code when it still earns that location:

- `src/components/CardGenerator/README.md`;
- `src/components/CardGenerator/shared/README.md`;
- `src/components/PlayerCharacterGenerator/README.md`;
- `public/fonts/README.md`.

The shared image README was left unchanged because it still describes the current colocated helper system.

Historical archive volume is not itself a problem; competing active authority is.

## Current platform-refresh pressure

`Docs/Plans/ANCHOR-dungeonmind-net-platform-refresh.md` remains active reference only.

It correctly identifies current questions:

- CRA → Vite modernization;
- authenticated/public navigation shape;
- DungeonBuddy integration under the DungeonMind.net product identity;
- shared auth/theme/header contracts without forced repo/build consolidation.

Implementation should arrive later through bounded owner-repository handoffs after DungeonOverMind stewardship settles the cross-repository architecture.


## Final active documentation shape

At closeout:

```text
101 files under Docs/
95 historical files under Docs/Archive/
6 active central documentation files
```

Active central files:

- `Docs/README.md`
- `Docs/Plans/README.md`
- `Docs/Plans/ANCHOR-dungeonmind-net-platform-refresh.md`
- `Docs/Design/CARDGENERATOR-PERSISTENCE.md`
- `Docs/Design/AUDIT-dungeonmind-web-current-debt.md`
- `Docs/Reports/REPORT-document-authority-audit-2026-09-25.md`

Current module-local READMEs remain colocated with CardGenerator, its shared image helpers, PlayerCharacterGenerator, and public font assets.

## Additional authority cleanup

The active `.cursorrules` file was rewritten because it was materially obsolete: it called the removed fixed `NavBar` sacred, required an 80px sidebar margin, prescribed `FloatingHeader`, and advertised a nonexistent Storybook command.

The current rules now match `UnifiedHeader`, current ownership boundaries, CRA reality, and the platform-refresh guardrail.

Tracked 2025 PCG debug logs/snapshots and `debug-component-10.js` were removed from `main`; `/pcg_run_logs/` is now ignored.

## Executable structural check

`npm run check:docs` executes `scripts/checkDocumentationAuthority.js`.

It asserts current authority files exist and fails if retired active-root namespaces/paths reappear.

The repository now has a dedicated `.github/workflows/documentation-authority.yml` workflow that runs the same zero-dependency authority check on pushes to `main` and pull requests.
