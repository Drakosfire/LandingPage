# Handoff: Subrace Handling System-Wide Fixes
**Date:** 2025-12-15  
**Type:** Bug Fix / Technical Debt  
**Last Updated:** 2025-12-15  

---

## 🚨 CURRENT STATE

### What's Working ✅
- **Frontend validation error message improved** - Now checks for subrace requirements before invalid race error
  - `LandingPage/src/components/PlayerCharacterGenerator/engine/dnd5e/DnD5eRuleEngine.ts:243-262`
  - Provides clearer error: "Dwarf requires a subrace selection (e.g., Mountain Dwarf, Hill Dwarf)"
- **Frontend data structure supports subraces** - `subraceId?: string` in GenerationInput
- **Frontend race data has subraces** - Complete subrace definitions with baseRace field
- **UI allows subrace selection** - RaceSelectionStep and RaceCard components handle subrace UI

### What's NOT Working ❌
- **Backend catalog missing subraces** - Only has base races (dwarf, elf, halfling), not subraces
  - `DungeonMindServer/playercharactergenerator/rule_engine/catalogs/dnd5e_v0/catalog.py:15-21`
  - Causes backend to accept "dwarf" when frontend requires "hill-dwarf" or "mountain-dwarf"
- **Prompt builder doesn't mention subraces** - AI generation prompt doesn't include subrace info
  - `LandingPage/src/components/PlayerCharacterGenerator/generation/promptBuilder.ts:69-101`
  - Shows only `**Race:** ${constraints.race.name}` - no subrace guidance
- **Backend constraint building doesn't handle subraceId** - get_constraints() only uses race_id
  - `DungeonMindServer/playercharactergenerator/rule_engine/pcg_rule_engine.py:43-62`
  - No logic to look up subrace from subrace_id

### Suspected Causes
1. **Data model mismatch**: Frontend expects subraces (hill-dwarf, mountain-dwarf), backend only has base races (dwarf)
2. **Prompt generation gap**: Constraints are built from base race, so prompt can't show subrace options
3. **Validation happens too late**: Backend accepts "dwarf", but frontend rejects it during generation

### Root Issue
**Per D&D 5e SRD rules, subraces are MANDATORY for races that have them:**
- Dwarf → Must be Hill Dwarf OR Mountain Dwarf
- Elf → Must be High Elf OR Wood Elf  
- Halfling → Must be Lightfoot OR Stout
- Gnome → Must be Forest Gnome OR Rock Gnome

The system currently allows base race selection but doesn't enforce subrace selection consistently.

---

## Quick Pickup

### Commands
```bash
cd LandingPage
pnpm dev
# Navigate to /playercharactergenerator
# Try AI generation with race "dwarf" - observe validation error

cd ../DungeonMindServer
# Check backend catalog for subrace definitions
```

### Key Files

#### Frontend (Race Data & Validation)
```
LandingPage/src/components/PlayerCharacterGenerator/data/dnd5e/races.ts
  # Complete subrace definitions (HILL_DWARF, MOUNTAIN_DWARF, etc.)
  # Each subrace has baseRace: 'dwarf' field

LandingPage/src/components/PlayerCharacterGenerator/engine/dnd5e/DnD5eRuleEngine.ts:243-276
  # Validation logic (FIXED - now checks subrace requirement first)
  
LandingPage/src/components/PlayerCharacterGenerator/generation/promptBuilder.ts:69-101
  # Prompt builder - MISSING subrace information
  
LandingPage/src/components/PlayerCharacterGenerator/generation/types.ts:55-76
  # GenerationInput interface has subraceId?: string
```

#### Backend (Catalog & Constraints)
```
DungeonMindServer/playercharactergenerator/rule_engine/catalogs/dnd5e_v0/catalog.py:15-21
  # RACES list - ONLY base races, missing subraces
  
DungeonMindServer/playercharactergenerator/rule_engine/pcg_rule_engine.py:34-62
  # get_constraints() - Only uses race_id, ignores subrace_id
  
DungeonMindServer/playercharactergenerator/models/pcg_models.py:22-36
  # GenerationInput model has subrace_id: Optional[str] but it's not used
```

#### UI Components
```
LandingPage/src/components/PlayerCharacterGenerator/creationDrawerComponents/RaceSelectionStep.tsx
  # UI for race/subrace selection - works correctly
  
LandingPage/src/components/PlayerCharacterGenerator/components/RaceCard.tsx
  # Displays race with subrace options
```

---

## Status

| Phase | Status | Description |
|-------|--------|-------------|
| Frontend Validation Error | ✅ Complete | Improved error message for missing subrace |
| Backend Catalog | ❌ Not Started | Need to add subraces to backend catalog |
| Prompt Builder | ❌ Not Started | Need to include subrace in AI generation prompts |
| Backend Constraint Building | ❌ Not Started | Need to handle subrace_id in get_constraints() |
| End-to-End Testing | ❌ Not Started | Verify subrace selection flows correctly |

---

## Files Modified This Session

### Modified
- `LandingPage/src/components/PlayerCharacterGenerator/engine/dnd5e/DnD5eRuleEngine.ts:243-262`
  - Reordered validation to check subrace requirement before invalid race check
  - Provides clearer error message with subrace examples

### Not Modified (Need Work)
- `LandingPage/src/components/PlayerCharacterGenerator/generation/promptBuilder.ts` - Needs subrace info
- `DungeonMindServer/playercharactergenerator/rule_engine/catalogs/dnd5e_v0/catalog.py` - Needs subraces
- `DungeonMindServer/playercharactergenerator/rule_engine/pcg_rule_engine.py` - Needs subrace_id handling

---

## Required Fixes

### 1. Backend Catalog: Add Subraces

**File:** `DungeonMindServer/playercharactergenerator/rule_engine/catalogs/dnd5e_v0/catalog.py`

**Current State:**
```python
RACES: List[Dict[str, Any]] = [
    {"id": "dwarf", "name": "Dwarf", "abilityBonuses": {"constitution": 2}},
    {"id": "elf", "name": "Elf", "abilityBonuses": {"dexterity": 2}},
    # ... only base races
]
```

**Needs:**
- Add subrace entries: `hill-dwarf`, `mountain-dwarf`, `high-elf`, `wood-elf`, etc.
- Consider: Keep base races for compatibility OR remove them and only have subraces?
- Match frontend structure: `baseRace` field to link subraces to base race

**Reference:** Frontend has complete subrace data in `LandingPage/src/components/PlayerCharacterGenerator/data/dnd5e/races.ts`

### 2. Backend Constraint Building: Handle subrace_id

**File:** `DungeonMindServer/playercharactergenerator/rule_engine/pcg_rule_engine.py:34-62`

**Current Logic:**
```python
race = self._catalog.races_by_id.get(input_data.race_id)
if not race:
    raise ValueError(f"Unknown raceId: {input_data.race_id}")
```

**Needs:**
- Check if `input_data.subrace_id` is provided
- If yes, look up subrace instead of base race
- If no subrace_id but race has subraces, reject with clear error
- Use subrace ability bonuses and traits in constraints

### 3. Prompt Builder: Include Subrace Information

**File:** `LandingPage/src/components/PlayerCharacterGenerator/generation/promptBuilder.ts:69-101`

**Current State:**
```typescript
`**Race:** ${constraints.race.name}`,
```

**Needs:**
- Check if subrace was selected (from input.subraceId)
- If yes, show: `**Race:** ${subraceName} (${baseRaceName})`
- If base race selected but subrace required, show available subrace options
- Include subrace-specific ability bonuses in prompt

### 4. End-to-End Flow Verification

**Test Cases:**
1. ✅ User selects "dwarf" → Gets clear error (FIXED)
2. ❌ User selects "hill-dwarf" → Should work end-to-end
3. ❌ AI generation with subrace → Should include subrace in prompt
4. ❌ Backend validation with subrace_id → Should use subrace constraints

---

## Debug Steps for Next Session

1. **Verify current error behavior:**
   ```bash
   # In browser console at /playercharactergenerator
   # Select race "dwarf", try to generate
   # Should see: "Dwarf requires a subrace selection (e.g., Mountain Dwarf, Hill Dwarf)"
   ```

2. **Check backend catalog structure:**
   ```bash
   cd DungeonMindServer
   grep -A 5 "RACES:" playercharactergenerator/rule_engine/catalogs/dnd5e_v0/catalog.py
   ```

3. **Test backend constraint building:**
   ```python
   # In Python console
   from playercharactergenerator.rule_engine import PCGRuleEngine
   from playercharactergenerator.models.pcg_models import GenerationInput
   
   engine = PCGRuleEngine()
   input_data = GenerationInput(
       class_id="wizard",
       race_id="hill-dwarf",  # Try subrace
       subrace_id="hill-dwarf",  # Also try this
       level=3,
       background_id="folk-hero",
       concept="Test character"
   )
   constraints = engine.get_constraints(input_data)
   print(constraints.race.id)  # Should be "hill-dwarf"
   ```

4. **Check prompt output:**
   ```typescript
   // In frontend
   const prompt = buildPreferencePrompt(input, constraints);
   console.log(prompt);
   // Verify subrace is mentioned if selected
   ```

---

## Context

### D&D 5e Subrace Rules
- **Mandatory for**: Dwarf, Elf, Halfling, Gnome
- **Not applicable for**: Human, Dragonborn, Half-Elf, Half-Orc, Tiefling
- Each subrace has different ability bonuses:
  - Hill Dwarf: +2 CON, +1 WIS
  - Mountain Dwarf: +2 CON, +2 STR
  - High Elf: +2 DEX, +1 INT
  - Wood Elf: +2 DEX, +1 WIS

### Current Architecture
- **Frontend**: Rich race/subrace data structure with complete trait definitions
- **Backend**: Minimal catalog with only base races
- **Generation**: AI gets constraints based on base race only (missing subrace benefits)

### Design Decision Needed
**Option A:** Backend catalog mirrors frontend (has all subraces)
- Pros: Consistent data, can use subrace-specific constraints
- Cons: Larger catalog, need to maintain sync

**Option B:** Backend only has subraces (remove base races)
- Pros: Forces correct selection, simpler validation
- Cons: Breaking change if anything depends on base race IDs

**Option C:** Backend has both, validation enforces subrace selection
- Pros: Flexible, backward compatible
- Cons: More complex validation logic

**Recommendation:** Option A (mirror frontend) - provides consistency and enables subrace-specific constraints in prompts.

---

## References

- **Frontend Race Data:** `LandingPage/src/components/PlayerCharacterGenerator/data/dnd5e/races.ts`
- **D&D 5e SRD Reference:** See `LandingPage/specs/PlayerCharacterGenerator/research/`
- **Character Creation Algorithm:** Mentions subrace requirement in Step 1
- **Related Handoff:** `HANDOFF-Phase51-Generation-Infrastructure.md` (AI generation system)

---

## Next Steps (Priority Order)

1. **Update backend catalog** to include subraces (matches frontend structure)
2. **Update get_constraints()** to use subrace_id when provided
3. **Update prompt builder** to include subrace information in AI prompts
4. **Test end-to-end** with subrace selection through generation flow
5. **Verify validation** rejects base races that require subraces at all layers

