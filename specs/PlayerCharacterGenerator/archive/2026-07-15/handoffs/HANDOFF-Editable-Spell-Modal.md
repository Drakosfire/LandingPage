# Handoff: Editable Spell Modal (Spell Management)
**Date:** 2025-12-10  
**Type:** Feature  
**Last Updated:** 2025-12-10 10:30  

---

## 🎯 Goal

Add spell management capabilities to the Spell Sheet in edit mode. Users can add, edit, and remove spells with **search-first UX** and **class-aware validation**.

**Key Difference from Equipment:** Spells validate against a database (`data/dnd5e/spells.ts`) rather than being freeform.

---

## 🚨 CURRENT STATE

### What's Working ✅
- `SpellSheet` displays spells organized by level (0-9)
- `SpellLevelBlock` renders spell sections with headers
- `SpellDetailModal` shows read-only spell details
- `SpellSlotTracker` has quick edit for slot usage
- **Spell database exists**: `SRD_SPELLS` with ~45 cantrips + level 1 spells
- **Helper functions exist**: `getSpellsByClass()`, `getSpellsByLevel()`, `getCantripsByClass()`

### What's NOT Working ❌
- No way to **add new spells** in edit mode
- No way to **remove spells** from character
- No way to **edit existing spell** (e.g., toggle prepared status)
- No **homebrew spell support**

---

## 📋 Requirements

### User Flow
1. **Edit Mode ON** → "+" button appears at end of each spell level section
2. **Click "+"** → Opens `SpellEditModal` filtered to that spell level
3. **Search/Filter** → Type to filter spells, filter by class
4. **Select spell** → Auto-populates all fields from database
5. **Save** → Adds spell to character sheet at correct level
6. **Click existing spell** → Opens modal in edit mode (toggle prepared, remove)

### Validation Behavior
| Scenario | Behavior |
|----------|----------|
| Spell in database | Auto-populate all fields |
| Spell on class list | ✓ Green indicator |
| Spell NOT on class list | ⚠️ Warning + "Add Anyway" option |
| Homebrew toggle checked | Unlock manual entry, no validation |

---

## 🏗️ Architecture

### Data Flow

```
User clicks "+" on 2nd Level section
           ↓
SpellEditModal opens (filtered to level 2)
           ↓
User types "fire" → Autocomplete shows Scorching Ray, Flaming Sphere...
           ↓
User selects spell → Auto-fill from SRD_SPELLS
           ↓
[✓ On Wizard spell list]  OR  [⚠️ Not on Cleric list - Add Anyway?]
           ↓
User clicks "Add Spell"
           ↓
onSave callback → CharacterCanvas.handleAddSpell()
           ↓
updateDnD5eData({ spellcasting: { spells: [...] } })
```

### Component Hierarchy

```
SpellSheet
├── SpellSlotTracker (existing)
├── SpellLevelBlock (×10 levels: cantrips + 1-9)
│   ├── SpellItem (existing spells) → onClick → SpellEditModal (edit mode)
│   └── AddSpellRow (edit mode) → onClick → SpellEditModal (add mode)
└── SpellEditModal (new component)
    ├── Search input with autocomplete
    ├── Class filter checkboxes
    ├── Spell list (filtered)
    ├── Spell preview/details
    ├── Homebrew toggle + manual fields
    ├── Validation status indicator
    └── Save/Cancel/Delete buttons
```

---

## 📁 Key Files

### Existing (to modify)

```
LandingPage/src/components/PlayerCharacterGenerator/sheetComponents/
├── spells/
│   ├── SpellLevelBlock.tsx        # Add onAddSpell, onSpellClick props
│   ├── SpellItem.tsx              # Make clickable in edit mode
│   └── index.ts                   # Export new component
├── modals/
│   └── SpellDetailModal.tsx       # Reference for SpellEditModal styling
├── SpellSheet.tsx                 # Wire up callbacks, pass isEditMode
└── CharacterSheet.css             # Modal and button styles

LandingPage/src/components/PlayerCharacterGenerator/data/dnd5e/
└── spells.ts                      # Spell database (already exists)
```

### To Create

```
LandingPage/src/components/PlayerCharacterGenerator/sheetComponents/
├── modals/
│   └── SpellEditModal.tsx         # New editable modal with search
├── spells/
│   └── AddSpellRow.tsx            # "+" button row component
```

### State Handler (CharacterCanvas.tsx)

```
LandingPage/src/components/PlayerCharacterGenerator/shared/
└── CharacterCanvas.tsx            # Add handlers for spell CRUD
```

---

## 🎨 Design Specifications

### SpellEditModal Layout

```
┌─────────────────────────────────────────────────────────────┐
│ Add 2nd Level Spell                                    [X]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Search: [____________________🔍]                           │
│                                                             │
│  Class filters:                                             │
│  [✓ Wizard] [☐ Cleric] [☐ Bard] [☐ All Classes]            │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ✓ Scorching Ray          Evocation        2nd      │   │
│  │ ✓ Misty Step             Conjuration      2nd      │   │
│  │ ✓ Mirror Image           Illusion         2nd      │   │
│  │ ⚠️ Spiritual Weapon       Evocation        2nd      │   │
│  │   └── Not on Wizard spell list                      │   │
│  │ ✓ Hold Person            Enchantment      2nd      │   │
│  │   (scroll for more...)                              │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ─────────── Selected Spell Preview ───────────            │
│  Scorching Ray                                              │
│  2nd-level Evocation                                        │
│  Casting: 1 action | Range: 120 ft | V, S                  │
│  You create three rays of fire and hurl them...            │
│                                                             │
│  ☐ Homebrew/Custom Spell                                   │
│                                                             │
│  ┌──────────┐                    ┌──────────────────────┐  │
│  │  Cancel  │                    │     Add Spell        │  │
│  └──────────┘                    └──────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Homebrew Mode (when toggled)

```
│  ☑ Homebrew/Custom Spell                                   │
│                                                             │
│  Name: [_________________________]                          │
│  Level: [dropdown ▼]  School: [dropdown ▼]                 │
│                                                             │
│  Casting Time: [1 action      ]  Range: [_______]          │
│  Components: [☐V] [☐S] [☐M] Material: [_________]          │
│  Duration: [_______________]                                │
│                                                             │
│  Description:                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [☐ Concentration] [☐ Ritual]                              │
```

### Edit Mode (existing spell)

```
┌─────────────────────────────────────────────────────────────┐
│ Edit Spell: Fireball                                   [X]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  3rd-level Evocation                                        │
│  Casting: 1 action | Range: 150 ft | V, S, M               │
│                                                             │
│  [Full description...]                                      │
│                                                             │
│  ☐ Prepared (for prepared casters)                         │
│                                                             │
│  ┌──────────┐  ┌────────────┐  ┌────────────────────────┐  │
│  │  Cancel  │  │   Remove   │  │    Save Changes        │  │
│  └──────────┘  └────────────┘  └────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Add Spell Button Row

```
┌────────────────────────────────────────────────────────────┐
│  [+]  Add Spell...                                         │
└────────────────────────────────────────────────────────────┘
```

- Appears after last spell in each `SpellLevelBlock` when `isEditMode`
- Blue dashed border (quick edit style)
- Same styling as `AddItemRow` from equipment

---

## 📝 Implementation Plan

### Phase 1: AddSpellRow Component
**Time:** ~30 min

1. Create `AddSpellRow.tsx` (copy pattern from `AddItemRow`)
2. Add to `SpellLevelBlock` when `isEditMode && onAddSpell`
3. Wire up click handler to open modal with level context

### Phase 2: SpellEditModal - Search Mode
**Time:** ~2-3 hours

1. Create `SpellEditModal.tsx` with search-first UI
2. Implement spell search/filter using existing helpers
3. Add class filter checkboxes
4. Implement spell preview panel
5. Add validation status indicators

### Phase 3: SpellEditModal - Homebrew Mode
**Time:** ~1 hour

1. Add homebrew toggle
2. Implement manual entry form fields
3. Wire up save logic for homebrew spells

### Phase 4: SpellLevelBlock Integration
**Time:** ~1 hour

1. Add props: `onAddSpell`, `onSpellEdit`, `onSpellRemove`
2. Make `SpellItem` clickable in edit mode
3. Pass spell data to modal on click

### Phase 5: CharacterCanvas Handlers
**Time:** ~1 hour

1. Create `handleAddSpell(level, spell)`
2. Create `handleEditSpell(spellId, updates)` (prepared toggle)
3. Create `handleRemoveSpell(spellId)`
4. Wire through SpellSheet → SpellLevelBlock

### Phase 6: Polish & Testing
**Time:** ~1 hour

1. Keyboard navigation (arrow keys in list, Enter to select)
2. Accessibility attributes
3. "Most common" spells section
4. Scroll behavior for long lists

---

## 🔧 Type Definitions

### Existing SpellEntry (spells/SpellLevelBlock.tsx:14-39)

```typescript
export interface SpellEntry {
    id: string;
    name: string;
    isPrepared?: boolean;
    isRitual?: boolean;
    isConcentration?: boolean;
    
    // Extended fields (from DnD5eSpell)
    level?: number;
    school?: SpellSchool;
    castingTime?: string;
    range?: string;
    components?: { verbal: boolean; somatic: boolean; material: boolean; materialDescription?: string };
    duration?: string;
    description?: string;
    // ... etc
}
```

### Existing DnD5eSpell (types/dnd5e/spell.types.ts:14-57)

```typescript
export interface DnD5eSpell {
    id: string;
    name: string;
    level: number;
    school: SpellSchool;
    castingTime: string;
    range: string;
    components: { verbal: boolean; somatic: boolean; material: boolean; materialDescription?: string; consumesMaterial?: boolean };
    duration: string;
    description: string;
    higherLevels?: string;
    ritual?: boolean;
    concentration?: boolean;
    damage?: { type: DamageType; dice: string };
    healing?: { dice: string };
    classes: string[];           // ← Key for class validation
    source: string;
    imageUrl?: string;
}
```

### New SpellEditModal Props

```typescript
interface SpellEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    
    /** Mode: 'add' for new spell, 'edit' for existing */
    mode: 'add' | 'edit';
    
    /** Spell level to filter (for add mode) */
    spellLevel?: number;
    
    /** Character's spellcasting class (for validation) */
    spellcastingClass?: string;
    
    /** Existing spell data (for edit mode) */
    spell?: SpellEntry;
    
    /** Save callback */
    onSave: (spell: SpellEntry) => void;
    
    /** Remove callback (edit mode only) */
    onRemove?: (spellId: string) => void;
}
```

### New SpellLevelBlock Props (additions)

```typescript
interface SpellLevelBlockProps {
    // ... existing props ...
    
    /** Callback when add spell is clicked (edit mode) */
    onAddSpell?: (level: number) => void;
    
    /** Callback when existing spell is clicked (edit mode) */
    onSpellEdit?: (spell: SpellEntry) => void;
}
```

---

## 🔍 Helper Functions Available

From `data/dnd5e/spells.ts`:

```typescript
// Get all spells for a class
getSpellsByClass('wizard')  // Returns DnD5eSpell[]

// Get spells at a specific level
getSpellsByLevel(2)  // Returns all 2nd-level spells

// Get cantrips for a class
getCantripsByClass('wizard')

// Get spell by ID
getSpellById('fireball')

// Get ritual spells
getRitualSpellsByClass('wizard')
```

### Search Implementation

```typescript
// Simple search filter
const filterSpells = (spells: DnD5eSpell[], query: string, classFilter?: string) => {
    let filtered = spells;
    
    // Text search
    if (query) {
        const lowerQuery = query.toLowerCase();
        filtered = filtered.filter(s => 
            s.name.toLowerCase().includes(lowerQuery) ||
            s.school.toLowerCase().includes(lowerQuery)
        );
    }
    
    // Class filter
    if (classFilter && classFilter !== 'all') {
        filtered = filtered.filter(s => s.classes.includes(classFilter.toLowerCase()));
    }
    
    return filtered;
};
```

---

## 🎯 Success Criteria

- [ ] "+" button appears in edit mode on each spell level section
- [ ] Clicking "+" opens modal filtered to that spell level
- [ ] Search input filters spells as user types
- [ ] Class filter shows only spells on that class's list
- [ ] Selecting a spell auto-populates preview
- [ ] Validation indicator shows if spell is on class list
- [ ] "Add Anyway" allows off-list spells with warning
- [ ] Homebrew toggle unlocks manual entry
- [ ] Clicking existing spell opens edit mode
- [ ] Prepared status can be toggled
- [ ] Spells can be removed
- [ ] Changes persist via CharacterCanvas state
- [ ] Keyboard navigation works

---

## ⚠️ Edge Cases to Handle

1. **Empty spell database for level**: Show "No [X] level spells in database" + homebrew option
2. **Non-spellcaster class**: Show all spells, no class filtering
3. **Multiclass spellcaster**: Show union of class spell lists (future consideration)
4. **Duplicate spell**: Prevent adding same spell twice
5. **Cantrips vs leveled**: Cantrips never show "prepared" checkbox
6. **Class filter + search**: Both filters apply simultaneously

---

## 🔮 Future Considerations

### Backend Rules Engine (noted for later)
- Spell database could move to backend API
- Validation could be server-side
- Would enable real-time spell list updates
- Hybrid approach: client autocomplete, server validation

### Spell Slot Integration
- Currently separate from spell management
- Could add "cast" button that uses a slot
- Could warn when adding spells above available slot level

---

## 📚 References

### Pattern Sources
- `ItemEditModal.tsx` - Modal structure and form patterns
- `AddItemRow.tsx` - "+" button row component
- `SpellDetailModal.tsx` - Spell display styling

### Spell Data
- `data/dnd5e/spells.ts` - SRD spell database and helpers
- `types/dnd5e/spell.types.ts` - `DnD5eSpell` interface

### Related Handoffs
- `HANDOFF-Editable-Equipment-Modal.md` - Equipment edit pattern (same approach)
- `HANDOFF-Edit-Mode-Expansion.md` - Edit mode framework

---

## Quick Pickup

### Commands
```bash
cd /home/drakosfire/Projects/DungeonOverMind/LandingPage
pnpm dev
# Navigate to Character Generator, load demo spellcaster
# Toggle Edit Mode, observe Spell Sheet
```

### Key Files to Start
```
sheetComponents/modals/SpellDetailModal.tsx   # Reference for styling
sheetComponents/spells/SpellLevelBlock.tsx    # Add onAddSpell prop
data/dnd5e/spells.ts                          # Spell database + helpers
shared/CharacterCanvas.tsx                    # Add spell CRUD handlers
```

---

## Status

| Phase | Status | Description |
|-------|--------|-------------|
| Phase 1 | ⬜ Not Started | AddSpellRow component |
| Phase 2 | ⬜ Not Started | SpellEditModal - Search mode |
| Phase 3 | ⬜ Not Started | SpellEditModal - Homebrew mode |
| Phase 4 | ⬜ Not Started | SpellLevelBlock integration |
| Phase 5 | ⬜ Not Started | CharacterCanvas handlers |
| Phase 6 | ⬜ Not Started | Polish & testing |

---

**Total Estimated Time:** 6-8 hours

