# CardGenerator Persistence

**Status:** ACTIVE IMPLEMENTATION REFERENCE  
**Owner:** DungeonMind Web / LandingPage

This document describes current CardGenerator persistence boundaries. Code remains authority.

## Current layers

CardGenerator currently uses two overlapping persistence paths:

1. **Card/session state helpers** in `src/utils/firestorePersistence.ts`
   - backend session save/load endpoints;
   - localStorage fallback/cache under `cardGenerator_state`;
   - optional template-blob serialization in localStorage.

2. **Named project CRUD** in `src/services/projectAPI.ts` and `CardGenerator.tsx`
   - create/list/get/update/delete project calls through DungeonMindServer;
   - explicit frontend↔backend state-shape transforms;
   - authenticated requests use browser credentials.

`CardGenerator.tsx` also uses a temporary/recovery localStorage key, `cardGenerator_sessionBackup`, and clears both local keys on a confirmed logout.

## State authority

Frontend state includes:

- current workflow step/completion;
- item details;
- selected/generated assets;
- generated/rendered card outputs;
- current named project;
- save status.

Persistent backend authority belongs to DungeonMindServer. Browser localStorage is recovery/cache state, not durable server authority.

## Failure behavior

- failed backend session saves fall back to localStorage;
- session loads prefer the backend when a usable session/user identifier exists, then fall back locally;
- project API failures surface to the frontend and do not redefine backend persistence semantics.

## Documentation rule

The retired `docs/Save_Session_System.md` described an earlier “three-layer” model and exact timing assumptions that no longer cleanly match current code. Use this document for the boundary and inspect:

- `src/components/CardGenerator/CardGenerator.tsx`
- `src/utils/firestorePersistence.ts`
- `src/services/projectAPI.ts`

for detailed current behavior.
