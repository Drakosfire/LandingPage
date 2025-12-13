# Handoff: UnifiedHeader Drawer Behavior
**Date:** 2025-12-11  
**Type:** Feature (UX Standard Pattern)  
**Last Updated:** 2025-12-11  

---

## 🚨 CURRENT STATE

### What's Working ✅
- Drawer buttons in UnifiedHeader open their respective drawers
- Multiple drawers can be open simultaneously (current behavior)

### What's NOT Working ❌
- **No toggle behavior** - Clicking the same button again doesn't close the drawer
- **No mutual exclusion** - Opening one drawer doesn't close others

### Expected Behavior (Standard Pattern)

All drawers connected to UnifiedHeader should follow this pattern:

| Action | Expected Result |
|--------|-----------------|
| Click Projects (closed) | Opens Projects drawer |
| Click Projects (open) | Closes Projects drawer |
| Click Generation (while Projects open) | Closes Projects, opens Generation |
| Click Projects (while Generation open) | Closes Generation, opens Projects |

---

## Quick Pickup

### Commands
```bash
cd /home/drakosfire/Projects/DungeonOverMind/LandingPage
pnpm dev
# Navigate to Character Generator
# Test: Click Projects button twice (should toggle)
# Test: Open Projects, then click Generation (should switch)
```

### Key Files
```
src/components/UnifiedHeader.tsx                    # Shared header component
src/components/PlayerCharacterGenerator/
├── PlayerCharacterGenerator.tsx                    # Has isRosterOpen, isDrawerOpen state
├── PlayerCharacterRosterDrawer.tsx                 # Projects drawer
└── PlayerCharacterCreationDrawer.tsx               # Generation drawer
```

---

## Implementation Approach

### Option A: Local State Coordination (Simple)

Each app manages its own drawer state with toggle + exclusion logic:

```typescript
// PlayerCharacterGenerator.tsx
const [activeDrawer, setActiveDrawer] = useState<'roster' | 'editor' | null>(null);

const handleRosterClick = () => {
  setActiveDrawer(prev => prev === 'roster' ? null : 'roster');
};

const handleEditorClick = () => {
  setActiveDrawer(prev => prev === 'editor' ? null : 'editor');
};

// Pass to UnifiedHeader
<UnifiedHeader
  onProjectsClick={handleRosterClick}
  onGenerationClick={handleEditorClick}
/>

// Drawers use derived state
<PlayerCharacterRosterDrawer opened={activeDrawer === 'roster'} />
<PlayerCharacterCreationDrawer opened={activeDrawer === 'editor'} />
```

**Pros:** Simple, no shared state, each app controls its own drawers
**Cons:** Pattern must be repeated in each app

### Option B: UnifiedHeader Manages Drawer State (Centralized)

UnifiedHeader owns the drawer state and provides callbacks:

```typescript
// UnifiedHeader.tsx
const [activeDrawer, setActiveDrawer] = useState<string | null>(null);

const toggleDrawer = (drawerId: string) => {
  setActiveDrawer(prev => prev === drawerId ? null : drawerId);
};

// Expose via props or context
onDrawerToggle={(drawerId) => toggleDrawer(drawerId)}
activeDrawer={activeDrawer}
```

**Pros:** Consistent behavior across all apps
**Cons:** More coupling, UnifiedHeader becomes stateful

### Recommendation: Option A

Each app should manage its own drawer state with a simple `activeDrawer` pattern. This:
- Keeps UnifiedHeader stateless
- Allows per-app customization if needed
- Is easy to implement incrementally

---

## Status

| Task | Status | Description |
|------|--------|-------------|
| T074f | ✅ Done | Drawer toggle (click button → toggle open/close) |
| T074g | ✅ Done | Drawer exclusion (opening one closes others) |

---

## Files to Modify

### PlayerCharacterGenerator Implementation

| File | Change |
|------|--------|
| `PlayerCharacterGenerator.tsx` | Replace `isRosterOpen` + `isDrawerOpen` with `activeDrawer` state |
| `UnifiedHeader.tsx` | No changes (buttons already have onClick) |

### Pattern for Other Apps (Future)

Same pattern applies to:
- StatblockGenerator (StatBlockProjectsDrawer, GenerationDrawer)
- CardGenerator (ProjectsDrawer, GenerationDrawer)

---

## Context

This emerged from Phase 4 (Save/Load) testing. The Character Roster drawer works but doesn't follow standard UX patterns:
1. Users expect clicking a toggle button to close what it opened
2. Users expect only one drawer open at a time

This is low-priority polish but should be addressed for consistency.

---

## References

- **Tasks:** `specs/PlayerCharacterGenerator/tasks.md` (T074f, T074g)
- **Save/Load Handoff:** `specs/PlayerCharacterGenerator/HANDOFF-Save-Load.md`
