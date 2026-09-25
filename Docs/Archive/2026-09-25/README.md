# DungeonMind Web documentation archive — 2026-09-25

**Status:** HISTORICAL PRODUCT / IMPLEMENTATION EVIDENCE  
**Current documentation index:** `Docs/README.md`

This archive consolidates completed project/spec/research material that should not compete with current frontend implementation authority.

## Archived project corpus

### LandingPage visual refresh

Moved the full historical `specs/1-landingpage-visual-refresh/**` package here.

The migration it described is substantially represented in current code:

- `src/App.tsx` uses `UnifiedHeader`;
- the old fixed sidebar flow is gone from app composition;
- current Mantine/theme/navigation behavior lives in code.

Do not resume work from the archived spec/task state.

### PlayerCharacterGenerator

Moved the historical `specs/PlayerCharacterGenerator/**` corpus here, including:

- original spec/plan/tasks;
- implementation strategies and manual checklists;
- research/reference dumps;
- HTML/CSS prototypes;
- copied web research assets;
- already-archived phase handoffs.

Current PCG authority is code/tests plus `src/components/PlayerCharacterGenerator/README.md`.

### Root handoffs

Archived:

- page-centering investigation — completed/fixed in 2025;
- UnifiedHeader drawer behavior — toggle/mutual exclusion now exists in current PCG code.

### CardGenerator persistence predecessor

Archived the old `docs/Save_Session_System.md` because its “three-layer” framing and exact timing assumptions no longer cleanly describe current persistence code.

Current boundary reference:

`Docs/Design/CARDGENERATOR-PERSISTENCE.md`

### OverMind historical imports

The historical material imported from OverMind on 2026-09-24 was moved from lower-case `docs/archive/` into this repository's canonical `Docs/Archive/` namespace.

## Restore rule

If an archived idea becomes relevant:

1. inspect current code/tests first;
2. re-read the historical artifact only for context;
3. write/update current owner documentation only if the concept still survives;
4. do not move old plans back into active context merely for discoverability.
