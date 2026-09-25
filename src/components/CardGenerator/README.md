# Card Generator

CardGenerator is the current DungeonMind Web frontend for card/item generation and project management.

## Current implementation

Primary entry point:

`src/components/CardGenerator/CardGenerator.tsx`

Current UI pattern:

- `UnifiedHeader` for shared navigation/toolbox/save/projects controls;
- four logical workflow stages: text, core image, border/card generation, final assembly;
- `ProjectsDrawerEnhanced` for saved project access;
- generation locks prevent state-changing navigation while async generation is active;
- authenticated project CRUD goes through `src/services/projectAPI.ts`;
- session/persistence helpers live in `src/utils/firestorePersistence.ts`.

The older `FloatingHeader` / `CardGeneratorRefactored.tsx` documentation is historical; those files are not current implementation authority.

## Persistence

See:

`Docs/Design/CARDGENERATOR-PERSISTENCE.md`

Current persistence combines backend session/project APIs with localStorage fallback/recovery. Treat code in `CardGenerator.tsx`, `projectAPI.ts`, and `firestorePersistence.ts` as authority when docs disagree.

## Shared image UI

Reusable modal/image helpers under `shared/` are documented in `shared/README.md`.

## Verification

Use the repository test/build commands from the root README. For a behavior claim about CardGenerator, inspect current component/service code rather than old project specs.
