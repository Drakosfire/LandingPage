# Handoff: Wizard Polish & Integration (Phase 3.5b)

**Date:** 2025-12-08  
**Type:** Feature  
**Last Updated:** 2025-12-08 23:00  
**Tasks:** T058a-T058g  

---

## 🚨 CURRENT STATE

### What's Working ✅
- 7-step wizard structure exists with Next/Previous navigation
- All step components exist (Abilities, Race, Class, Spells, Background, Equipment, Review)
- Character name input exists (in ReviewStep only)
- Validation exists in rule engine
- Demo characters render on canvas correctly

### What's NOT Working ❌
- **No name input early** - Character name only available in Review (Step 7)
- **Wizard → Canvas not wired** - Wizard changes don't update canvas display
- **No validation gating** - Users can advance with invalid/incomplete steps
- **Drawer overflow** - Content may extend beyond viewport (unverified)
- **Wizard never exercised** - No end-to-end test creating a character

### Suspected Causes
1. Name was intended for Review step but should be Step 0/1
2. Wizard state lives in context but canvas reads from demo data
3. Validation exists but isn't blocking step advancement

---

## Quick Pickup

### Commands
```bash
cd /home/drakosfire/Projects/DungeonOverMind/LandingPage
pnpm dev
# Open http://localhost:5173
# Click "Create Character" button to open wizard drawer
```

### Key Files
```
src/components/PlayerCharacterGenerator/
├── PlayerCharacterCreationDrawer.tsx      # Drawer container
├── creationDrawerComponents/
│   ├── CharacterCreationWizard.tsx        # Wizard orchestrator (lines 32-152)
│   ├── AbilityScoresStep.tsx              # Step 1: Wrapper for Step1AbilityScores
│   ├── RaceSelectionStep.tsx              # Step 2
│   ├── ClassSelectionStep.tsx             # Step 3
│   ├── SpellSelectionStep.tsx             # Step 4 (skipped for non-casters)
│   ├── BackgroundSelectionStep.tsx        # Step 5
│   ├── EquipmentStep.tsx                  # Step 6
│   └── ReviewStep.tsx                     # Step 7: Has name input (lines 115-125)
├── PlayerCharacterGeneratorProvider.tsx   # Context with character state
└── shared/CharacterCanvas.tsx             # Canvas display (uses demo data)
```

---

## Task Breakdown

| Task | Description | Est. | Priority |
|------|-------------|------|----------|
| **T058e** | Fix drawer height/overflow | 1h | 1️⃣ |
| **T058c** | Wire wizard state → CharacterCanvas | 2h | 2️⃣ |
| **T058a** | Add BasicInfoStep (name, concept) | 2h | 3️⃣ |
| **T058b** | Reorder wizard steps | 1h | 4️⃣ |
| **T058d** | Add validation gating | 2h | 5️⃣ |
| **T058f** | Manual E2E test | 2h | 6️⃣ |
| **T058g** | Test all 7 fixture characters | 4h | 7️⃣ |

---

## Implementation Details

### T058e: Fix Drawer Overflow

**Current drawer styles (PlayerCharacterCreationDrawer.tsx:54-61):**
```tsx
styles={{
    content: {
        marginTop: '88px', // Below UnifiedHeader
        marginLeft: '0',
        height: 'calc(100vh - 88px)',
        width: '100%'
    }
}}
```

**Wizard content area (CharacterCreationWizard.tsx:110):**
```tsx
<Box style={{ flex: 1, overflowY: 'auto' }}>
```

**Check:**
1. Is content scrolling within the Box?
2. Does Stepper take too much vertical space?
3. Are buttons visible at bottom?

---

### T058c: Wire Wizard → Canvas

**Current state flow:**
```
CharacterCreationWizard
    ↓ uses
PlayerCharacterGeneratorProvider (has `character` state)
    ↓ but
CharacterCanvas reads from `selectedCharacter` prop or DEMO data
```

**Fix approach:**
1. In `PlayerCharacterGenerator.tsx`, pass `character` from context to `CharacterCanvas`
2. Or make `CharacterCanvas` read from context directly

**Key file:** `src/components/PlayerCharacterGenerator/PlayerCharacterGenerator.tsx`

---

### T058a: Add BasicInfoStep

**Create new file:** `creationDrawerComponents/BasicInfoStep.tsx`

```tsx
// Inputs:
// - Character name (required)
// - Backstory concept (optional, 2-3 sentences)
// - Pronouns (optional dropdown)

// Validation: name must be non-empty
```

**Update CharacterCreationWizard.tsx:**
```tsx
// Before:
// Step 0: AbilityScoresStep
// Step 1: RaceSelectionStep
// ...

// After:
// Step 0: BasicInfoStep (NEW)
// Step 1: AbilityScoresStep  
// Step 2: RaceSelectionStep
// ...
```

---

### T058d: Validation Gating

**Current handleNext (CharacterCreationWizard.tsx:59-71):**
```tsx
const handleNext = () => {
    if (currentStep < TOTAL_STEPS - 1) {
        let nextStep = currentStep + 1;
        // ... skip logic for non-casters
        setCurrentStep(nextStep);
    }
};
```

**Add validation check:**
```tsx
const handleNext = () => {
    // Get validation for current step
    const stepValidation = ruleEngine.validateStep(currentStep, character);
    
    if (!stepValidation.isValid) {
        // Show errors, don't advance
        return;
    }
    
    // ... existing logic
};
```

**Note:** `validateStep()` already exists in DnD5eRuleEngine

---

## Test Fixtures

Use these to verify wizard can produce valid characters:

| Fixture | Race | Class | Key Feature |
|---------|------|-------|-------------|
| `HUMAN_FIGHTER_L1` | Human | Fighter | Basic martial |
| `HILL_DWARF_CLERIC_L1` | Hill Dwarf | Cleric (Life) | L1 subclass, prepared caster |
| `HALF_ELF_BARD_L1` | Half-Elf | Bard | Flexible ability bonuses |
| `TIEFLING_WARLOCK_L1` | Tiefling | Warlock (Fiend) | Pact Magic |
| `DRAGONBORN_SORCERER_L1` | Dragonborn | Sorcerer (Draconic) | Draconic Resilience |
| `HIGH_ELF_WIZARD_L3` | High Elf | Wizard | Spellbook |

**Location:** `__tests__/fixtures/testCharacters.ts`

---

## Status

| Phase | Status | Description |
|-------|--------|-------------|
| T058e | ⬜ Not Started | Fix drawer overflow |
| T058c | ⬜ Not Started | Wire wizard → canvas |
| T058a | ⬜ Not Started | Add BasicInfoStep |
| T058b | ⬜ Not Started | Reorder wizard steps |
| T058d | ⬜ Not Started | Add validation gating |
| T058f | ⬜ Not Started | Manual E2E test |
| T058g | ⬜ Not Started | Test fixture characters |

---

## Context

This phase was identified on December 8, 2025 when reviewing task order. The wizard **exists** but was never **exercised**. Before Edit Mode (Phase 3.7) can begin, we need to verify:

1. Users can actually create characters through the wizard
2. Wizard data flows to the canvas display
3. All validation works correctly

**Principle:** "Test the pipes" - Can't edit what you can't create.

---

## References

- **Tasks:** `specs/PlayerCharacterGenerator/tasks.md` (Phase 3.5b section)
- **Learnings:** `Docs/Learnings/LEARNINGS-PlayerCharacterGenerator-2025.md`
- **Provider:** `src/components/PlayerCharacterGenerator/PlayerCharacterGeneratorProvider.tsx`
- **Rule Engine:** `src/components/PlayerCharacterGenerator/engine/dnd5e/DnD5eRuleEngine.ts`

