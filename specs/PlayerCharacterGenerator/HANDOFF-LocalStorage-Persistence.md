# Handoff: LocalStorage Character Persistence

**Date:** 2025-12-08  
**Type:** Feature  
**Last Updated:** 2025-12-09 00:30  

---

## 🚨 CURRENT STATE

### What's Working ✅
- Wizard step persisted to localStorage (`charactergen_wizard_step`)
- **Character data persisted** to localStorage (`pcg_character_state`) with 2s debounce
- Character state managed in React context
- Edit mode with inline editing for quick fields
- Complex field clicks open wizard drawer
- **Click anywhere in labeled box** triggers edit (not just on text)
- **Player Name** persists correctly
- **XP** persists correctly (added `xp` field to Character type)

### What's NOT Working ❌
- **No save status indicator** - User has no feedback (Phase 2)

### Resolved This Session ✅
- **Death Saving Throws** - Clickable dots, toggle on click, persists ✅
- **Inspiration** - 24x24 box, clickable toggle, persists ✅
- **Hit Dice** - Confirmed: derived from class (not editable) ✅
- **beforeunload handler** - Saves immediately on page close/refresh ✅

### Bug Fixes Applied (2025-12-09)
1. **playerName** was saving to `metadata.playerName` → now saves to root `playerName`
2. **XP** was saving to `notes` field → added `xp` field to Character type, saves correctly
3. **Canvas files** were passing hardcoded empty values → now read from `character`
4. **Click area** - clicking empty space in LabeledBox now triggers edit via `EditableTextRef`

---

## Quick Pickup

### Commands
```bash
cd /home/drakosfire/Projects/DungeonOverMind/LandingPage
pnpm dev
# Open http://localhost:5173
# Load a demo character (toolbox dropdown)
# Make edits in edit mode
# Refresh page - character data is lost
```

### Key Files
```
src/components/PlayerCharacterGenerator/
├── PlayerCharacterGeneratorProvider.tsx   # Lines 88-94: Character state init (has TODO comment)
├── types/character.types.ts               # Character interface
└── types/dnd5e/character.types.ts         # DnD5eCharacter interface
```

### Existing Pattern Reference
```
.cursor/rules/PATTERNS-Utilities.mdc       # Multi-level persistence hook pattern
```

---

## Implementation Plan

### Phase 1: Basic localStorage (2h)
| Task | Status | Description |
|------|--------|-------------|
| Add localStorage key constant | ✅ | `pcg_character_state` |
| Save on character change | ✅ | Debounced (2s) to avoid spam |
| Restore on mount | ✅ | Parse from localStorage if exists |
| Handle parse errors | ✅ | Fallback to empty character |
| Clear on reset | ✅ | `resetCharacter()` clears localStorage |

### Phase 2: Save Status UI (1h)
| Task | Status | Description |
|------|--------|-------------|
| Add saveStatus to context | ⬜ | `'idle' \| 'saving' \| 'saved' \| 'error'` |
| Wire to UnifiedHeader | ⬜ | Already has `saveStatus` prop |
| Show feedback badge | ⬜ | Green "Saved" / Yellow "Saving" |

### Phase 3: Cloud Sync (Future)
| Task | Status | Description |
|------|--------|-------------|
| Firestore integration | ⬜ | When user is logged in |
| Conflict resolution | ⬜ | Local vs cloud |
| Offline support | ⬜ | Queue changes |

---

## Code Locations

### Where to Add Persistence

**Provider init (restore):**
```typescript
// PlayerCharacterGeneratorProvider.tsx:88-94
const [character, setCharacter] = useState<Character | null>(() => {
    // Phase 0: Just create empty D&D 5e character
    // Phase 4+: Try to restore from localStorage  <-- THIS COMMENT
    const empty = createEmptyCharacter();
    empty.dnd5eData = createEmptyDnD5eCharacter();
    return empty;
});
```

**Add save effect after state:**
```typescript
// After line 94, add:
const LOCAL_STORAGE_KEY = 'pcg_character_state';

// Debounced save to localStorage
useEffect(() => {
    if (!character) return;
    
    const timer = setTimeout(() => {
        try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(character));
            console.log('💾 [PCG] Saved to localStorage');
        } catch (err) {
            console.error('❌ [PCG] localStorage save failed:', err);
        }
    }, 2000); // 2s debounce
    
    return () => clearTimeout(timer);
}, [character]);
```

**Restore on init:**
```typescript
const [character, setCharacter] = useState<Character | null>(() => {
    // Try to restore from localStorage
    try {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            console.log('📦 [PCG] Restored from localStorage:', parsed.name);
            return parsed;
        }
    } catch (err) {
        console.warn('⚠️ [PCG] Failed to restore from localStorage:', err);
    }
    
    // Fallback: create empty character
    const empty = createEmptyCharacter();
    empty.dnd5eData = createEmptyDnD5eCharacter();
    return empty;
});
```

---

## Testing Checklist

### Manual Tests
- [ ] Create character via wizard → Refresh → Character persists
- [ ] Load demo character → Make edits → Refresh → Edits persist
- [ ] Clear localStorage → Refresh → Gets empty character
- [ ] Corrupt localStorage JSON → Refresh → Falls back gracefully

### Edge Cases
- [ ] Very large character (many items/spells) fits in localStorage
- [ ] Multiple tabs don't conflict
- [ ] Private browsing mode (localStorage may fail)

---

## Status

| Phase | Status | Description |
|-------|--------|-------------|
| Analysis | ✅ Complete | Identified missing persistence |
| Phase 1 | ✅ Complete | Basic localStorage save/restore |
| Bug Fixes | ✅ Complete | playerName, XP, click area issues |
| Phase 2 | ⬜ Not Started | Save status UI feedback |
| Phase 3 | ⬜ Future | Cloud sync with Firestore |

---

## Completed: Edit Mode Polish ✅

### T145: Death Saving Throws ✅
- **Location:** `AbilityScoresRow.tsx` - `DeathSaveDot` component
- **Behavior:** Click circles to toggle successes/failures
- **State:** `dnd5eData.derivedStats.deathSaves: { successes: 0-3, failures: 0-3 }`

### T147: Inspiration Toggle ✅
- **Location:** `AbilityScoresRow.tsx` - `MetaStats` component
- **UI:** 24x24 box with gold fill when active
- **State:** `dnd5eData.derivedStats.hasInspiration: boolean`

### T146: Hit Dice ✅
- **Decision:** NOT editable - derived from class
- **Removed** `data-editable="quick"` from Hit Dice row
- **D&D 5e Rules:** Total = character level, die size from class

## Next Up: Phase 2 - Save Status UI

| Task | Description |
|------|-------------|
| Add saveStatus to context | `'idle' \| 'saving' \| 'saved' \| 'error'` |
| Wire to UnifiedHeader | Already has `saveStatus` prop |
| Show feedback badge | Green "Saved" / Yellow "Saving" |

---

## Context

This handoff was created after implementing Edit Mode (inline editing for quick fields, drawer navigation for complex fields). During testing, it was discovered that character changes are lost on page refresh because only the wizard step was being persisted to localStorage.

The `usePersistence` hook pattern from `PATTERNS-Utilities.mdc` provides a reference implementation with:
- localStorage for immediate persistence
- Debounced cloud sync for logged-in users
- Save status tracking

For Phase 1, a simpler approach (just localStorage) is sufficient.

---

## References

- **Pattern:** `.cursor/rules/PATTERNS-Utilities.mdc` (Multi-level persistence hook)
- **Related Handoff:** `HANDOFF-Wizard-Polish.md`
- **Provider:** `src/components/PlayerCharacterGenerator/PlayerCharacterGeneratorProvider.tsx`

