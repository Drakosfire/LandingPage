# Handoff: Save/Load Characters (Phase 4)
**Date:** 2025-12-11  
**Type:** Feature  
**Last Updated:** 2025-12-11 (CRUD confirmed working)  

---

## 🚨 CURRENT STATE

### What's Working ✅
- localStorage auto-save with 500ms debounce
- localStorage restore on mount
- `beforeunload` save on browser close
- Wizard step persistence to localStorage
- **Multi-character management** - Character Roster drawer with load/delete
- **Cloud sync** - Debounced Firestore save (2s) for logged-in users
- **Backend API** - Full CRUD endpoints working
- **Explicit project management** - "New Character" clears project, manual save creates project

### Backlog (UX Enhancement)
- **Drawer mutual exclusion** - Clicking Projects while Editor drawer is open should auto-close Editor and open Projects

---

## 📚 Research: StatblockGenerator Persistence Patterns

### Architecture Overview

StatblockGenerator uses a **three-tier persistence strategy**:

```
┌─────────────────────────────────────────────────────────────┐
│                    PERSISTENCE FLOW                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  User Edits → Immediate localStorage → Debounced Firestore  │
│                    (0ms)                   (2000ms)          │
│                                                              │
│  On Load → Try Firestore → Fallback to localStorage          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Key Files (Patterns to Adapt)

| File | Purpose | Lines |
|------|---------|-------|
| `StatBlockGeneratorProvider.tsx` | Provider with persistence logic | 1490-1650 |
| `StatBlockProjectsDrawer.tsx` | Wrapper connecting to Provider | ~220 lines |
| `ProjectsDrawer.tsx` | Reusable UI component | ~360 lines |
| `utils/firestorePersistence.ts` | CardGenerator persistence utils | ~350 lines |

### Provider Persistence Pattern

```typescript
// 1. Immediate localStorage save (every change)
useEffect(() => {
    if (isGenerating) return; // Skip during generation
    
    const stateSnapshot = {
        creatureDetails,
        selectedAssets,
        generatedContent,
        imagePrompt,
        currentProject: currentProject?.id,
        timestamp: Date.now()
    };
    localStorage.setItem('statblockGenerator_state', JSON.stringify(stateSnapshot));
}, [creatureDetails, selectedAssets, generatedContent, imagePrompt, currentProject?.id, isGenerating]);

// 2. Debounced Firestore save (2s delay, auth required)
useEffect(() => {
    if (!isLoggedIn || !userId) return;
    if (!creatureDetails.name?.trim()) return;
    
    // Content hash deduplication
    const contentHash = JSON.stringify({ key: 'fields' });
    if (contentHash === lastSavedContentHashRef.current) return;
    
    clearTimeout(debouncedSaveTimerRef.current);
    debouncedSaveTimerRef.current = setTimeout(async () => {
        setSaveStatus('saving');
        await fetch(`${API_URL}/save-project`, { ... });
        lastSavedContentHashRef.current = contentHash;
        setSaveStatus('saved');
    }, 2000);
}, [dependencies]);
```

### Project Management Functions

```typescript
interface ProviderContext {
    // Project state
    currentProject: StatBlockProject | null;
    saveStatus: 'idle' | 'saving' | 'saved' | 'error';
    
    // Project CRUD
    createProject: (name: string, description?: string) => Promise<string>;
    saveProject: () => Promise<void>;
    loadProject: (projectId: string) => Promise<void>;
    deleteProject: (projectId: string) => Promise<void>;
    listProjects: () => Promise<StatBlockProjectSummary[]>;
}
```

### ProjectsDrawer Interface (Reusable)

```typescript
interface ProjectsDrawerProps {
    opened: boolean;
    onClose: () => void;
    projects: StatBlockProjectSummary[];  // Need CharacterProjectSummary
    currentProjectId?: string;
    currentCreatureName?: string;  // → currentCharacterName
    isLoadingProjects?: boolean;
    canSaveProject?: boolean;
    onLoadProject: (projectId: string) => Promise<void>;
    onCreateNewProject: () => Promise<void>;
    onSaveProject?: () => Promise<void>;
    onDeleteProject: (projectId: string) => Promise<void>;
    onRefresh?: () => Promise<void>;
    isGenerationInProgress?: boolean;  // Probably not needed for PCG
}
```

---

## 🎨 Three Design Approaches

### Option 1: Standard (Copy StatblockGenerator Pattern)

**Approach:** Direct port of StatblockGenerator's proven pattern

**Implementation:**
1. Add `currentProject` and `saveStatus` to Provider
2. Add CRUD functions (create/save/load/delete/list)
3. Add Firestore debounced save useEffect
4. Create `PlayerCharacterProjectsDrawer.tsx` (thin wrapper)
5. Reuse `ProjectsDrawer.tsx` component (or make generic)

**Pros:**
- Proven pattern, minimal risk
- Familiar UX for users of StatblockGenerator
- ~4-6 hours implementation

**Cons:**
- "Projects" terminology might be odd for characters
- No innovation

**Effort:** 4-6 hours

---

### Option 2: Delightful (Character Roster)

**Approach:** Treat saved characters as a "roster" or "party" with character-specific UI

**Implementation:**
1. Same backend as Standard
2. **Character Roster Drawer** instead of generic Projects drawer:
   - Character portrait thumbnails (or class icons)
   - Race/Class/Level visible at a glance
   - "Party" grouping (optional future)
3. **Quick-switch** - Click any character to swap
4. **Create New Character** button opens wizard at step 1
5. **Character name + class badge** in header shows active character

**UI Concept:**
```
┌─────────────────────────────────────────┐
│ 👤 Character Roster                     │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ 🗡️ Thorin Ironforge        [ACTIVE] │ │
│ │ Dwarf Fighter 5                     │ │
│ │ Updated: Today, 3:42pm              │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ 🔮 Elara Moonwhisper         [Load] │ │
│ │ Elf Wizard 3                        │ │
│ │ Updated: Dec 10                     │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ 🎵 Pip Goodbarrel           [Load]  │ │
│ │ Halfling Bard 2                     │ │
│ │ Updated: Dec 8                      │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ [+ Create New Character]                │
└─────────────────────────────────────────┘
```

**Pros:**
- More thematic for D&D
- Better at-a-glance info (race/class/level)
- Sets up "party management" feature later
- Delightful for the use case

**Cons:**
- More work than Standard (~6-8 hours)
- Custom drawer vs reusing ProjectsDrawer

**Effort:** 6-8 hours

---

### Option 3: Unexpected (Campaign Hub)

**Approach:** Characters belong to Campaigns; the primary entity is the Campaign

**Implementation:**
1. **Campaign** entity containing multiple characters
2. **Campaign Drawer** shows:
   - Campaign name + description
   - List of characters in campaign
   - "Add to Campaign" when creating character
3. **Cross-service potential**: Link to StatblockGenerator creatures in same campaign
4. **Session notes** (stretch goal)

**UI Concept:**
```
┌─────────────────────────────────────────┐
│ 📜 Campaigns                            │
├─────────────────────────────────────────┤
│ ▼ Curse of Strahd (Active)              │
│   └─ 👤 Thorin Ironforge (Fighter 5)    │
│   └─ 👤 Elara Moonwhisper (Wizard 3)    │
│   └─ 👹 Count Strahd [StatBlock Link]   │
│                                         │
│ ▶ Dragon Heist                          │
│ ▶ Homebrew One-Shot                     │
│                                         │
│ [+ New Campaign] [+ New Character]      │
└─────────────────────────────────────────┘
```

**Pros:**
- Big vision, differentiating feature
- Connects multiple DungeonMind tools
- Premium feature potential

**Cons:**
- Significant scope expansion (20+ hours)
- Requires new backend entities
- Too ambitious for Phase 4

**Effort:** 20-40 hours (multi-phase)

---

## 🎯 Decision: Option 2 (Delightful - Character Roster) ✅

**Approved:** 2025-12-11

**Rationale:**
1. Uses proven StatblockGenerator backend pattern (low risk)
2. Character-specific UI is more thematic and useful
3. Reasonable effort increase over Standard (2-4 hours more)
4. Sets up future "party" features naturally
5. Option 3 (Campaigns) can layer on top later

---

## 📋 Implementation Plan

### Phase 4a: Provider CRUD Functions (2h)

**Goal:** Add project management to `PlayerCharacterGeneratorProvider.tsx`

| Task | Description |
|------|-------------|
| 4a-1 | Add `currentProject` state and `CharacterProject` type |
| 4a-2 | Add `saveStatus` state ('idle' \| 'saving' \| 'saved' \| 'error') |
| 4a-3 | Implement `createProject(name, description)` |
| 4a-4 | Implement `loadProject(projectId)` |
| 4a-5 | Implement `deleteProject(projectId)` |
| 4a-6 | Implement `listProjects()` |
| 4a-7 | Implement `saveProject()` (manual save) |

**Pattern Source:** `StatBlockGeneratorProvider.tsx:1165-1480`

### Phase 4b: Character Roster Drawer UI (3h)

**Goal:** Create character-specific project browser

| Task | Description |
|------|-------------|
| 4b-1 | Create `CharacterProjectSummary` type (name, race, class, level, updatedAt) |
| 4b-2 | Create `PlayerCharacterRosterDrawer.tsx` (wrapper) |
| 4b-3 | Create `CharacterRoster.tsx` component with character cards |
| 4b-4 | Add class icons (🗡️ Fighter, 🔮 Wizard, etc.) or generic fallback |
| 4b-5 | Wire "Create New Character" to reset + open wizard |
| 4b-6 | Add to UnifiedHeader (roster button for logged-in users) |

**UI Target:**
```
┌─────────────────────────────────────────┐
│ 👤 Character Roster              [X]    │
├─────────────────────────────────────────┤
│ [+ Create New Character]                │
├─────────────────────────────────────────┤
│ 🔍 Search characters...                 │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ 🗡️ Thorin Ironforge        [ACTIVE] │ │
│ │ Dwarf Fighter 5                     │ │
│ │ Updated: Today, 3:42pm              │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ 🔮 Elara Moonwhisper         [Load] │ │
│ │ Elf Wizard 3                        │ │
│ │ Updated: Dec 10              [🗑️]   │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### Phase 4c: Firestore Cloud Sync (2h)

**Goal:** Auto-save to cloud for logged-in users

| Task | Description |
|------|-------------|
| 4c-1 | Add debounced Firestore save useEffect (2s delay) |
| 4c-2 | Add content hash deduplication (prevent duplicate saves) |
| 4c-3 | Add `skipAutoSaveRef` pattern (after delete) |
| 4c-4 | Backend endpoint: `POST /api/playercharactergenerator/save-project` |
| 4c-5 | Backend endpoint: `GET /api/playercharactergenerator/list-projects` |
| 4c-6 | Backend endpoint: `DELETE /api/playercharactergenerator/delete-project` |

**Pattern Source:** `StatBlockGeneratorProvider.tsx:1531-1650`

### Phase 4d: Polish & Testing (1h)

| Task | Description |
|------|-------------|
| 4d-1 | Test: Create new character → save → reload page → verify |
| 4d-2 | Test: Switch between characters → verify state swap |
| 4d-3 | Test: Delete character → verify removal |
| 4d-4 | Test: Anonymous user → localStorage only, no roster |
| 4d-5 | Mobile: Verify roster drawer works on mobile |

---

**Total Estimated:** 8 hours

---

## Quick Pickup

### Commands
```bash
cd /home/drakosfire/Projects/DungeonOverMind/LandingPage
pnpm dev
# Navigate to Character Generator
# Current: Single character, localStorage only
```

### Key Files
```
# Frontend (LandingPage)
src/components/PlayerCharacterGenerator/
├── PlayerCharacterGeneratorProvider.tsx  # ✅ CRUD + auto-save (P4a, P4c)
├── PlayerCharacterCreationDrawer.tsx     # Existing wizard
├── PlayerCharacterRosterDrawer.tsx       # ✅ Character list wrapper (P4b)
├── CharacterRoster.tsx                   # ✅ Character cards UI (P4b)
├── PlayerCharacterGenerator.tsx          # ✅ Wired up roster drawer (P4b)
├── utils/
│   └── classIcons.ts                     # ✅ Class emoji icons (P4b)
└── __tests__/provider/
    └── PlayerCharacterGeneratorProvider.test.tsx  # ✅ CRUD tests (P4a)

# Backend (DungeonMindServer)
routers/
├── playercharactergenerator_router.py    # ✅ API endpoints (P4c)
└── app.py                                # ✅ Router registration (P4c)

# Pattern source:
src/components/StatBlockGenerator/
├── StatBlockGeneratorProvider.tsx        # Lines 1165-1480 (CRUD), 1531-1650 (auto-save)
├── StatBlockProjectsDrawer.tsx           # Thin wrapper
└── ProjectsDrawer.tsx                    # Reusable UI
routers/
└── statblockgenerator_router.py          # Backend pattern source
```

---

## Status

| Phase | Status | Description | Est. |
|-------|--------|-------------|------|
| P4a | ✅ Complete | Provider CRUD functions | 2h |
| P4b | ✅ Complete | Character Roster Drawer UI | 3h |
| P4c | ✅ Complete | Firestore cloud sync (debounced auto-save) | 2h |
| P4c.1 | ✅ Complete | Option 1 (Standard) - Explicit project management | 1h |
| P4d | ✅ Complete | Polish + testing | 1h |

**Phase 4: COMPLETE** ✅ (December 11, 2025)

**Backlog Items (UnifiedHeader Drawer Behavior):**
- **T074f:** Drawer toggle - clicking nav button toggles its drawer (open↔close)
- **T074g:** Drawer exclusion - opening one drawer auto-closes any other open drawer

This is standard UX for all drawers connected to UnifiedHeader across the app.

---

## Files Modified This Session

### Option 1 (Standard) Implementation (2025-12-11)
**Issue Fixed:** "Create New Character" was overwriting the previous project because `currentProject` wasn't cleared.

**Solution:** Explicit project management - user must save once to create project, then auto-save works.

- **Modified:** `PlayerCharacterGeneratorProvider.tsx`
  - Added `clearCurrentProject()` function - clears project ID and content hash
  - Added `isUnsavedNewCharacter` derived state - true when character has name but no project ID
  - **Gated auto-save:** Only runs when `currentProject?.id` exists
  - Exposed both in context

- **Modified:** `PlayerCharacterRosterDrawer.tsx`
  - `handleCreateNewCharacter` now calls `clearCurrentProject()` BEFORE `resetCharacter()`
  - This prevents auto-save from overwriting the old project

- **Modified:** `UnifiedHeader.tsx`
  - Added `isUnsaved` prop - shows orange save button when true
  - Tooltip shows "Unsaved - Click to save" when unsaved

- **Modified:** `PlayerCharacterGenerator.tsx`
  - Added `isUnsavedNewCharacter` to context usage
  - Passes `isUnsaved={isUnsavedNewCharacter}` to UnifiedHeader

**UX Flow After Fix:**
```
Create New → clearCurrentProject() → resetCharacter()
          → Auto-save disabled (no project ID)
          → Save button shows orange "Unsaved"
          
User clicks Save button:
          → Creates new project (POST /save-project with no projectId)
          → currentProject.id set
          → Auto-save enabled for this project
          → Save button shows blue/green
```

---

### Save Button Enhancement (2025-12-11)
- **Modified:** `src/components/UnifiedHeader.tsx`
  - Added `onSaveClick` and `showSaveButton` props
  - Added interactive save button with status-aware icons:
    - 💾 Idle (blue) - floppy disk icon
    - ⏳ Saving (yellow) - spinner
    - ✅ Saved (green) - checkmark
    - ⚠️ Error (red) - alert icon
  - Tooltip shows status: "Save now", "Saving...", "All changes saved", "Save failed - click to retry"
  - Button disabled when not logged in or already saving
  - Kept fallback Badge for apps without save button

- **Modified:** `PlayerCharacterGenerator.tsx`
  - Added `saveProject` from Provider
  - Added `handleSaveClick` handler for manual save
  - Wired `onSaveClick` prop to UnifiedHeader

### Phase 4c Implementation (2025-12-11)
- **Modified (Frontend):** `PlayerCharacterGeneratorProvider.tsx`
  - Added debounced cloud save useEffect (2s delay)
  - Content hash deduplication (prevents duplicate saves)
  - Auto-updates `currentProject` with server response
  - Uses `skipAutoSaveRef` pattern (already in place from P4a)

- **Created (Backend):** `DungeonMindServer/routers/playercharactergenerator_router.py`
  - `POST /save-project` - Create/update character project
  - `GET /list-projects` - List user's character projects
  - `GET /project/{id}` - Load specific project
  - `DELETE /project/{id}` - Delete project
  - `GET /health` - Health check endpoint
  - Character ID normalization (spells, equipment, features, classes)
  - Firestore collection: `playercharacter_projects`

- **Modified (Backend):** `DungeonMindServer/app.py`
  - Imported and registered `playercharactergenerator_router`

**Backend Endpoints (✅ Implemented):**
```
POST   /api/playercharactergenerator/save-project     # Create/update project
GET    /api/playercharactergenerator/list-projects    # List user's projects
GET    /api/playercharactergenerator/project/{id}     # Load project
DELETE /api/playercharactergenerator/project/{id}     # Delete project
GET    /api/playercharactergenerator/health           # Health check
```

### Phase 4b Implementation (2025-12-11)
- **Created:** `utils/classIcons.ts`
  - D&D class emoji mapping (🗡️ Fighter, 🔮 Wizard, etc.)
  - `getClassIcon()`, `getClassIconWithName()`, `hasKnownClassIcon()` helpers

- **Created:** `CharacterRoster.tsx`
  - Character cards with class icons and race/class/level info
  - Search filtering, relative timestamps
  - Load/Delete actions with confirmation modal
  - Uses Mantine Drawer pattern (matches ProjectsDrawer)

- **Created:** `PlayerCharacterRosterDrawer.tsx`
  - Thin wrapper connecting to Provider (like StatBlockProjectsDrawer)
  - Manages project list loading and refresh
  - Handles unsaved changes warnings
  - "Create New Character" wires to reset + open wizard

- **Modified:** `PlayerCharacterGenerator.tsx`
  - Added `isRosterOpen` state for roster drawer
  - Wired Projects button to open Character Roster
  - Added `PlayerCharacterRosterDrawer` component
  - Connected `saveStatus` to UnifiedHeader

### Phase 4a Implementation (2025-12-11)
- **Modified:** `PlayerCharacterGeneratorProvider.tsx`
  - Added `CharacterProject` and `CharacterProjectSummary` types
  - Added `currentProject`, `saveStatus`, `isLoadingProjects` state
  - Added refs: `skipAutoSaveRef`, `lastSavedContentHashRef`, `debouncedSaveTimerRef`
  - Implemented CRUD functions: `createProject`, `loadProject`, `deleteProject`, `listProjects`, `saveProject`
  - Added auth integration via `useAuth` hook

- **Created:** `__tests__/provider/PlayerCharacterGeneratorProvider.test.tsx`
  - Tests for all CRUD functions with mocked API calls
  - Tests for auth checks (logged in vs. not logged in)
  - Tests for error handling

### API Endpoints Required (Backend - Phase 4c)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/playercharactergenerator/save-project` | Create/update project |
| GET | `/api/playercharactergenerator/project/{id}` | Load project |
| DELETE | `/api/playercharactergenerator/project/{id}` | Delete project |
| GET | `/api/playercharactergenerator/list-projects` | List user's projects |

### Research Only (No Changes)
- Read `StatBlockGeneratorProvider.tsx` (persistence patterns)
- Read `ProjectsDrawer.tsx` (reusable UI component)
- Read `utils/firestorePersistence.ts` (Firestore helpers)

---

## Context

PlayerCharacterGenerator currently saves a single character to localStorage. Phase 4 adds:
1. **Multi-character management** - Save/load multiple characters
2. **Cloud sync** - Firestore persistence for logged-in users
3. **Character Roster UI** - Drawer to view/switch characters

The StatblockGenerator has a proven pattern we can adapt with character-specific theming.

---

## References

- **Tasks:** `specs/PlayerCharacterGenerator/tasks.md` (Phase 4 section)
- **StatblockGenerator Pattern:** `StatBlockGeneratorProvider.tsx:1165-1650`
- **Reusable Drawer:** `ProjectsDrawer.tsx`

