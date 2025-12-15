
# Handoff: Spell Selection in Character Builder (Step 4)
**Date:** 2025-12-11  
**Type:** Bug / Feature Integration  
**Last Updated:** 2025-12-11 22:00  

---

## ✅ BUG FIXED

### Root Cause
**Case sensitivity mismatch in `isSpellcaster()` function** in `PlayerCharacterCreationDrawer.tsx`:

```typescript
// BUG: primaryClass.name is "Warlock" (capitalized), but class IDs are "warlock" (lowercase)
const classData = ruleEngine.getClassById(primaryClass.name);  // Returns undefined!
```

This caused `isSpellcaster()` to return `false` for ALL spellcasters, so the wizard navigation skipped Step 4 entirely.

### Fix Applied
```typescript
// FIXED: Normalize to lowercase before lookup
const classData = ruleEngine.getClassById(primaryClass.name.toLowerCase());
```

### Files Modified
1. `PlayerCharacterCreationDrawer.tsx` (line 52) - Added `.toLowerCase()` to class lookup
2. `SpellSelectionStep.tsx` (lines 32-54) - Added debug logging for spellcasting data flow

---

## 🚨 PREVIOUS STATE (Resolved)

### What Was Working ✅
- `SpellSelector` component exists with full UI (tabs, spell cards, expandable details)
- `SpellSelectionStep` wrapper component exists and calls `SpellSelector`
- Spell data exists in `data/dnd5e/spells.ts` (cantrips + level 1 spells for all classes)
- Warlock has `spellcasting` property defined in class data
- Rule engine has `getSpellcastingInfo()` and `getAvailableSpells()` methods

### What Was NOT Working ❌ (NOW FIXED)
- ~~**Warlock spell selection not appearing**~~ - Step 4 was being skipped due to case mismatch
- ~~**Cleric Step 3 says "select spells on next step" but goes to Background**~~ - Same root cause

---

## Quick Pickup

### Commands
```bash
cd /home/drakosfire/Projects/DungeonOverMind/LandingPage
pnpm dev
# Navigate to Character Generator
# Create new character → Pick Warlock → Go to Step 4 (Spells)
# Check console for debug output
```

### Key Files
```
src/components/PlayerCharacterGenerator/creationDrawerComponents/SpellSelectionStep.tsx
  - Wrapper that calls SpellSelector
  - Lines 44-54: Gets availableCantrips and availableSpells from ruleEngine

src/components/PlayerCharacterGenerator/components/SpellSelector.tsx
  - Full spell selection UI with tabs, cards, expandable details
  - Lines 145-146: maxCantrips and maxSpells from spellcastingInfo

src/components/PlayerCharacterGenerator/engine/dnd5e/DnD5eRuleEngine.ts
  - Line 817-830: getAvailableSpells() - filters spells by level and class
  - Line 840-947: getSpellcastingInfo() - returns spellcasting metadata
  - Line 938-947: getSpellcastingClass() - finds first class with spellcasting

src/components/PlayerCharacterGenerator/data/dnd5e/spells.ts
  - Lines 75-88: ELDRITCH_BLAST (warlock cantrip) - verify 'warlock' in classes array
  - Line 754-757: SRD_SPELLS export

src/components/PlayerCharacterGenerator/data/dnd5e/classes.ts
  - Lines 2153-2167: Warlock spellcasting config
```

---

## Status

| Phase | Status | Description |
|-------|--------|-------------|
| Data Layer | ✅ Complete | Spell data exists, class spellcasting defined |
| Rule Engine | ✅ Complete | getSpellcastingInfo, getAvailableSpells implemented |
| SpellSelector UI | ✅ Complete | Tabs, cards, selection limits, summary |
| Integration | ✅ Fixed | Case sensitivity bug resolved |
| Step Navigation | ✅ Fixed | Step 4 now renders for spellcasters |

---

## Files Modified (2025-12-11)

1. `PlayerCharacterCreationDrawer.tsx` - Fixed `isSpellcaster()` case sensitivity
2. `SpellSelectionStep.tsx` - Added debug logging for spell data flow

---

## Context

### Step Order (Current)
```
0. Basics (name, concept, pronouns)
1. Abilities (point buy)
2. Race
3. Class (skills, equipment) ← Says "select spells on next step"
4. Spells ← Should show spell selection, but appears empty
5. Background
6. Equipment
7. Review
```

### Spell Selection Flow
```
SpellSelectionStep
  ├── usePlayerCharacterGenerator() → ruleEngine
  ├── ruleEngine.getSpellcastingInfo(dnd5eData) → spellcastingInfo
  ├── ruleEngine.getAvailableSpells(dnd5eData, 0) → cantrips
  ├── ruleEngine.getAvailableSpells(dnd5eData, 1) → level 1 spells
  └── SpellSelector component receives all props
```

### Warlock Specifics
- Uses Pact Magic (different from regular spell slots)
- `spellcasting.pactMagic: true` flag in class data
- Should have 2 cantrips known, 2 spells known at level 1

---

## Future Enhancements (Backlogged)

### Option 2: Spell Browser (Polish)
- Side-by-side browsing experience
- Each spell gets full card treatment
- Filters: School, Components, Concentration, Ritual
- More visual, more engaging

### Option 3: Spell Advisor (Novel)
- AI-style recommendations based on character concept
- Quick-pick presets ("Blaster", "Controller", "Support")
- Reduces decision paralysis for new players

---

## References

- **Wizard Polish Handoff:** `specs/PlayerCharacterGenerator/HANDOFF-Wizard-Polish.md`
- **Task:** T162 - Spell selection integration

