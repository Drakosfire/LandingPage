# Handoff: Edit Mode Expansion (All Sheet Components)

**Date:** 2025-12-09  
**Type:** Feature  
**Last Updated:** 2025-12-09 (Phase 1 Complete)  

---

## 🚨 CURRENT STATE

### What's Working ✅
- Edit toggle in UnifiedHeader (eye/pencil icons)
- `isEditMode` state in context, accessible via `usePlayerCharacterGenerator()`
- Visual indicator CSS defined in CharacterSheet.css
  - Blue dashed border = quick edit (inline)
  - Purple dotted border = complex edit (opens drawer/modal)
- **CharacterHeader:** name, playerName, XP, alignment
- **AbilityScoresRow:** current HP, temp HP, death saves, inspiration
- **Column2Content:** Currency quick edit (5 coins), Attacks complex edit, Equipment complex edit
- **BackgroundPersonalitySheet:** Traits, Ideals, Bonds, Flaws quick edit textareas
- **InventorySheet (CurrencySection):** Currency quick edit (5 coins)
- **SpellSheet (SpellSlotTracker):** Click-to-toggle spell slot usage
- localStorage persistence with beforeunload handler

### What's NOT Done ❌
- **Column 1:** Skills, Saving Throws, Proficiencies (complex edit → drawer)
- **Column 3:** Features (complex edit → drawer)
- **InventorySheet:** Attunement toggles, Item quantities, Item detail modal
- **SpellSheet:** Prepared spell toggles

---

## Design Principles (Established)

### Color Coding
| Type | Border | Color | Cursor | Behavior |
|------|--------|-------|--------|----------|
| Quick Edit | 2px dashed | Blue `#3b82f6` | `text` | Click → inline input |
| Complex Edit | 2px dotted | Purple `#8b5cf6` | `pointer` | Click → drawer/modal |

### Edit Mode Rules
1. **Quick fields** = directly editable values (HP, currency, notes)
2. **Complex fields** = derived or require selection (class, race, skills)
3. **Non-editable** = purely calculated (AC without homebrew, proficiency bonus)

### Implementation Pattern
```tsx
// 1. Import context
import { usePlayerCharacterGenerator } from '../PlayerCharacterGeneratorProvider';

// 2. Get edit mode state
const { isEditMode, updateDnD5eData, openDrawerToStep } = usePlayerCharacterGenerator();

// 3. Add data-editable attribute
<div 
    data-editable="quick"  // or "complex"
    onClick={isEditMode ? handleClick : undefined}
    role={isEditMode ? 'button' : undefined}
    tabIndex={isEditMode ? 0 : undefined}
>

// 4. For quick edit, use EditableText
import { EditableText } from './EditableText';
<EditableText
    value={currentValue}
    onChange={(v) => handleChange(v)}
    type="text"  // or "number"
/>
```

---

## Task Breakdown

### Page 1: Main Character Sheet

#### Column 1 (Left)

| Component | File | Type | Behavior |
|-----------|------|------|----------|
| Saving Throws | `column1/SavingThrowsSection.tsx` | Complex | Opens Abilities step (proficiencies from class) |
| Skills | `column1/SkillsSection.tsx` | Complex | Opens Class/Background step (proficiencies) |
| Proficiencies (text) | `column1/Column1Content.tsx` | Complex | Opens Class step (armor/weapons/tools) |
| Languages | `column1/Column1Content.tsx` | Complex | Opens Race/Background step |

**Note:** Individual skill/save checks could have a "quick" toggle for expertise in homebrew mode.

#### Column 2 (Center)

| Component | File | Type | Behavior |
|-----------|------|------|----------|
| Attacks | `column2/` or inline | Complex | Opens Equipment step (weapon-based) |
| Equipment list | `column2/Column2Content.tsx` | Complex | Opens Equipment step or Inventory modal |
| Currency (cp/sp/gp) | `column2/Column2Content.tsx` | Quick | Inline number inputs |

#### Column 3 (Right)

| Component | File | Type | Behavior |
|-----------|------|------|----------|
| Features list | `column3/FeaturesSection.tsx` | Complex | Opens relevant step or modal |
| Personality traits | `column3/PersonalitySection.tsx` | Quick | Inline text (or opens Background step) |

---

### Page 2: Background & Personality Sheet

| Component | File | Type | Behavior |
|-----------|------|------|----------|
| Traits | `BackgroundPersonalitySheet.tsx` | Quick | Inline textarea |
| Ideals | `BackgroundPersonalitySheet.tsx` | Quick | Inline textarea |
| Bonds | `BackgroundPersonalitySheet.tsx` | Quick | Inline textarea |
| Flaws | `BackgroundPersonalitySheet.tsx` | Quick | Inline textarea |
| Backstory | `BackgroundPersonalitySheet.tsx` | Quick | Inline textarea (large) |

---

### Page 3: Inventory Sheet

| Component | File | Type | Behavior |
|-----------|------|------|----------|
| Currency (all 5 coins) | `inventory/CurrencySection.tsx` | Quick | Inline number inputs |
| Attunement slots | `inventory/AttunementSection.tsx` | Quick | Click to toggle on/off |
| Weapons | `inventory/InventoryBlock.tsx` | Complex | Opens Equipment step or item modal |
| Armor | `inventory/InventoryBlock.tsx` | Complex | Opens Equipment step or item modal |
| Magic Items | `inventory/InventoryBlock.tsx` | Complex | Opens item detail modal |
| Adventuring Gear | `inventory/InventoryBlock.tsx` | Quick/Complex | Quantity = quick, item = complex |
| Treasure | `inventory/TreasureBlock.tsx` | Quick | Inline text/number |

---

### Page 4: Spell Sheet (if spellcaster)

| Component | File | Type | Behavior |
|-----------|------|------|----------|
| Spell slots used | `spells/SpellSlotTracker.tsx` | Quick | Click circles to mark used |
| Cantrips | `spells/SpellItem.tsx` | Complex | Opens Spells step |
| Prepared checkbox | `spells/SpellItem.tsx` | Quick | Click to toggle prepared |
| Spell list | `spells/SpellLevelBlock.tsx` | Complex | Opens Spells step |

---

## Quick Pickup

### Commands
```bash
cd /home/drakosfire/Projects/DungeonOverMind/LandingPage
pnpm dev
# Open http://localhost:5173
# Load demo character (Wizard for spells)
# Click Edit toggle (pencil icon)
# Visual indicators should appear on editable fields
```

### Key Files
```
src/components/PlayerCharacterGenerator/
├── sheetComponents/
│   ├── CharacterSheet.css           # Lines 2230-2390: Edit mode styles (REFERENCE)
│   ├── CharacterHeader.tsx          # DONE: inline edit example
│   ├── AbilityScoresRow.tsx         # DONE: death saves, inspiration pattern
│   ├── EditableText.tsx             # Reusable inline edit component
│   ├── column1/
│   │   ├── SkillsSection.tsx        # TODO: Add complex edit
│   │   └── SavingThrowsSection.tsx  # TODO: Add complex edit
│   ├── column2/
│   │   └── Column2Content.tsx       # TODO: Currency quick, attacks complex
│   ├── column3/
│   │   ├── FeaturesSection.tsx      # TODO: Complex edit
│   │   └── PersonalitySection.tsx   # TODO: Quick edit textareas
│   ├── BackgroundPersonalitySheet.tsx  # TODO: All quick edit textareas
│   ├── InventorySheet.tsx           # TODO: Container for inventory edits
│   └── SpellSheet.tsx               # TODO: Spell slot tracking
└── PlayerCharacterGeneratorProvider.tsx  # Context with isEditMode
```

### CSS Classes Reference
```css
/* Quick edit - blue dashed */
[data-editable="quick"] {
    border: 2px dashed #3b82f6 !important;
    cursor: text;
}

/* Complex edit - purple dotted */
[data-editable="complex"] {
    border: 2px dotted #8b5cf6 !important;
    cursor: pointer;
}
```

---

## Implementation Priority

### Phase 1: High-Value Quick Edits (2-3h) ✅ COMPLETE
1. ✅ **Currency** - All 5 coin types (Column2Content + CurrencySection)
2. ✅ **Personality traits** - Traits/Ideals/Bonds/Flaws textareas (BackgroundPersonalitySheet)
3. ✅ **Spell slots used** - Click to mark used (SpellSlotTracker)
4. ✅ **Attacks section** - Complex edit indicator (opens Equipment step)
5. ✅ **Equipment list** - Complex edit indicator (opens Equipment step)

### Phase 2: Complex Field Wiring (2-3h)
1. **Skills/Saves** - Click opens Abilities step
2. **Features** - Click opens relevant step
3. **Proficiencies** - Click opens Class step

### Phase 3: Inventory Interactions (2-3h)
1. **Attunement toggles** - Click to toggle
2. **Item quantities** - Inline number edit
3. **Item detail modal** - For full item editing

### Phase 4: Polish (1-2h)
1. Verify all fields have appropriate indicators
2. Test tab order and keyboard accessibility
3. Verify persistence works for all new fields

---

## Status

| Section | Status | Description |
|---------|--------|-------------|
| CharacterHeader | ✅ Complete | Name, playerName, XP, alignment |
| AbilityScoresRow | ✅ Complete | HP, death saves, inspiration |
| Column 1 (Skills/Saves) | ⬜ Not Started | Complex edit indicators |
| Column 2 (Attacks/Equip) | ✅ Complete | Currency quick edit, attacks/equipment complex edit |
| Column 3 (Features) | ⬜ Not Started | Complex edit indicators |
| BackgroundPersonality | ✅ Complete | Quick edit textareas (traits, ideals, bonds, flaws) |
| InventorySheet | ✅ Complete | Currency quick edit (CurrencySection) |
| SpellSheet | ✅ Complete | Spell slot usage click-to-toggle |

---

## Reusable Patterns

### Pattern 1: Quick Edit Number Field
```tsx
// From AbilityScoresRow.tsx - HP editing
<EditableText
    value={currentHP ?? 0}
    onChange={(v) => handleCurrentHPChange(Number(v))}
    type="number"
    min={0}
    max={maxHP}
/>
```

### Pattern 2: Click Toggle (Death Saves, Attunement)
```tsx
// From AbilityScoresRow.tsx - DeathSaveDot
<span
    className={`dot ${filled ? 'filled' : ''} ${isEditMode ? 'clickable' : ''}`}
    onClick={isEditMode ? onToggle : undefined}
    role={isEditMode ? 'button' : undefined}
    tabIndex={isEditMode ? 0 : undefined}
/>
```

### Pattern 3: Complex Field → Drawer
```tsx
// From CharacterHeader.tsx - Class click
const handleClassClick = () => {
    if (isEditMode) {
        console.log('🔗 [Component] Opening Class step');
        openDrawerToStep(WIZARD_STEPS.CLASS);
    }
};

<div 
    data-editable="complex"
    onClick={handleClassClick}
>
```

### Pattern 4: Quick Edit Textarea (for traits) ✅ IMPLEMENTED
```tsx
// From BackgroundPersonalitySheet.tsx - EditableTextarea component
// Shows static text when not editing, textarea when editing (click to edit)
<EditableTextarea
    value={traits}
    onChange={(v) => updateDnD5eData({ 
        personality: { ...personality, traits: [v] } 
    })}
    placeholder="Enter your personality traits"
    rows={4}
/>
```

### Pattern 5: Spell Slot Click Toggle ✅ IMPLEMENTED
```tsx
// From SpellSlotTracker.tsx - clickable slot circles
<div 
    className={`slot-circle ${isEditMode ? 'clickable' : ''}`}
    onClick={() => handleSlotClick(idx, false)}
    role={isEditMode ? 'button' : undefined}
    tabIndex={isEditMode ? 0 : undefined}
/>
```

---

## Type Additions Needed

Check if these fields exist in `DnD5eCharacter`:
- [ ] `personality.traits` - array or string?
- [ ] `personality.ideals` - array or string?
- [ ] `personality.bonds` - array or string?
- [ ] `personality.flaws` - array or string?
- [ ] `currency` - already exists ✅
- [ ] Spell slots `used` tracking

---

## Context

This handoff continues the Edit Mode work started in the Wizard Polish phase. The foundational patterns (visual indicators, EditableText component, context wiring) are established. This phase extends those patterns to all remaining sheet components.

**Key Insight:** Most fields fall into clear quick/complex categories based on whether they're direct values (quick) or derived from selections (complex).

---

## References

- **Pattern Source:** `sheetComponents/CharacterHeader.tsx`, `AbilityScoresRow.tsx`
- **CSS Reference:** `CharacterSheet.css` lines 2230-2390
- **Context:** `PlayerCharacterGeneratorProvider.tsx`
- **Learnings:** `Docs/ProjectDiary/Learnings/LEARNINGS-React-State-Architecture-2025.md`
- **Related Handoff:** `HANDOFF-Wizard-Polish.md`, `HANDOFF-LocalStorage-Persistence.md`

