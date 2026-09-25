# Player Character Generator

PlayerCharacterGenerator is the current D&D 5e character-creation surface in DungeonMind Web.

The old phase-based README/spec corpus is historical. Current implementation is substantially beyond the November 2025 “Phase 1” foundation.

## Current implementation

Primary entry points:

- `PlayerCharacterGenerator.tsx` — product shell and drawer coordination;
- `PlayerCharacterGeneratorProvider.tsx` — character state, validation, local/cloud persistence, project CRUD;
- `engine/` — D&D 5e rule engine;
- `characterAdapters.ts` + `characterPageDocument.ts` + sheet/canvas components — rendered character-sheet pipeline;
- `PCGBuildDrawer.tsx` — manual build flow;
- `PCGGenerationDrawer.tsx` — AI-assisted generation;
- `PlayerCharacterRosterDrawer.tsx` — saved characters/projects;
- `characterToolboxConfig.tsx` — UnifiedHeader toolbox integration.

## Current behavior

- Canvas-first character-sheet rendering;
- manual and AI-assisted creation;
- D&D 5e validation through the local rule engine;
- localStorage persistence under `pcg_character_state`;
- authenticated project CRUD through DungeonMindServer;
- edit mode;
- mutually exclusive/toggleable roster/build/generation drawers;
- browser print/PDF workflow and development print-debug support;
- UnifiedHeader integration.

## Historical specs

The old `specs/PlayerCharacterGenerator/**` project corpus is archived as implementation history. Do not use phase labels or old prototype/research files to infer current behavior.

For current truth, use code/tests in this directory.
