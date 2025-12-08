# Tasks: PlayerCharacterGenerator

**Generated**: November 30, 2025  
**Updated**: December 7, 2025 (All Sheet Pages Visually Complete)  
**Source**: spec.md + plan.md  
**Total Tasks**: 131 (124 + 7 integration tests)  
**Estimated Hours**: 122-170h

---

## 🎨 Implementation Strategy: HTML-First → Canvas Componentization

**Strategy Doc:** `IMPLEMENTATION-STRATEGY.md`  
**Prototype:** `prototypes/character-sheet.html`

### Completed Foundation Work

| Task | Description | Status |
|------|-------------|--------|
| **T100** | Read `Canvas/ARCHITECTURE.md` and `ADAPTER_IMPLEMENTATION_GUIDE.md` | ✅ Complete |
| **T101** | Create `characterAdapters.ts` implementing `CanvasAdapters` | ✅ Complete |
| **T102** | Create `characterTemplates.ts` with PHB-style template config | ✅ Complete |
| **T103** | Create `canvasRegistry.tsx` with Canvas-compatible wrapper components | ✅ Complete |
| **T104** | Create `characterPageDocument.ts` for page document building | ✅ Complete |
| **T107** | Add `'character'` type to Canvas `ComponentDataReference` | ✅ Complete |
| **T108** | Create static HTML prototype (`prototypes/character-sheet.html`) | ✅ Complete |
| **T109** | Create implementation strategy doc | ✅ Complete |

### Active Implementation (HTML-First Approach)

| Task | Description | Status |
|------|-------------|--------|
| **T110** | Polish HTML prototype to match PHB aesthetic | ✅ Complete |
| **T111** | Extract CSS to `CharacterSheet.css` | ✅ Complete |
| **T112** | Build section components from prototype | ✅ Complete |
| **T113** | Wire components into Canvas system | ✅ Complete |
| **T114** | Test with DEMO_FIGHTER data | ✅ Complete |
| **T115** | Build BackgroundPersonalitySheet from prototype | ✅ Complete |
| **T116** | Build InventorySheet from prototype | ✅ Complete |
| **T117** | Build SpellSheet from prototype | ✅ Complete |
| **T118** | Polish all sheet pages (spacing, layout, CSS variables) | ✅ Complete |

### Ready for Next Phase (Pagination)

| Task | Description | Status |
|------|-------------|--------|
| **T105** | Full `useCanvasLayout` integration (automatic pagination) | 🔜 Next |
| **T106** | Test pagination with long feature lists | ⏳ Pending |

### End Polish / Optimization

| Task | Description | Status |
|------|-------------|--------|
| **T119** | Mobile responsiveness - InventorySheet/SpellSheet not rendering | ⏳ Blocked |
| **T120** | Offload CSS and images to CDN (fonts, backgrounds, icons) | ⏳ Pending |
| **T121** | SpellSheet: Only show spell levels that have slots (hide empty levels) | ✅ Complete |

### Phase 3.7: Edit Mode (Inline Character Editing)

**Goal:** Transform sheets from read-only display to editable documents  
**Prerequisite:** Sheets render correctly (T118 ✅)  
**Why Before Save/Load:** Users should see changes immediately; persistence is secondary

| Task | Description | Status |
|------|-------------|--------|
| **T140** | Create `useEditMode.ts` hook - edit state, dirty tracking, undo buffer | ⏳ Pending |
| **T141** | Add inline text editing for CharacterHeader (name, class display) | ⏳ Pending |
| **T142** | Add inline editing for personality traits, ideals, bonds, flaws | ⏳ Pending |
| **T143** | Add inline editing for notes/backstory on BackgroundSheet | ⏳ Pending |
| **T144** | HP tracking - click to adjust current HP, temp HP | ⏳ Pending |
| **T145** | Death saves - click to mark successes/failures | ⏳ Pending |
| **T146** | Hit dice - click to track used dice | ⏳ Pending |
| **T147** | Inspiration toggle - click to grant/remove | ⏳ Pending |
| **T148** | Spell slot dots - click to mark used/expended | ⏳ Pending |
| **T149** | Spell prepared checkboxes - toggle prepared spells | ⏳ Pending |

### Phase 3.8: Edit Mode - Inventory & Equipment

**Goal:** Complete inventory editing capabilities  
**Prerequisite:** Core edit mode (T140-T149)

| Task | Description | Status |
|------|-------------|--------|
| **T150** | Equipment checkboxes - mark equipped/attuned items | ⏳ Pending |
| **T151** | Currency tracking - edit gold/silver/etc inline | ⏳ Pending |
| **T152** | Consumables - track quantity used | ⏳ Pending |
| **T153** | Item quantity editing (add/remove/adjust) | ⏳ Pending |
| **T154** | Visual edit mode toggle (pencil icon, border highlights) | ⏳ Pending |

### Phase 3.9: Homebrew Mode (Custom Content)

**Goal:** Allow adding non-SRD content to character  
**Prerequisite:** Edit Mode working (Phase 3.7-3.8)

| Task | Description | Status |
|------|-------------|--------|
| **T155** | Add "Custom Feature" button to FeaturesSection | ⏳ Pending |
| **T156** | Add "Custom Item" button to InventorySheet | ⏳ Pending |
| **T157** | Add "Custom Spell" button to SpellSheet | ⏳ Pending |
| **T158** | Create `CustomContentModal` for entering homebrew data | ⏳ Pending |
| **T159** | Flag homebrew content visually (different styling/icon) | ⏳ Pending |

**Edit Mode Note:** These tasks transform the sheet from read-only display to a functional play session tool. Key considerations:
- Immediate visual feedback (no save required to see changes)
- Touch-friendly tap targets (44px minimum)
- Undo/redo for accidental clicks
- State persistence handled in Phase 4 (Save/Load)

**Files Created (December 4, 2025):**
- `characterAdapters.ts` - Canvas adapter implementations for character data
- `characterTemplates.ts` - PHB-style and compact template configs
- `canvasComponents/canvasRegistry.tsx` - Canvas-compatible wrapper components
- `characterPageDocument.ts` - Page document builder for Canvas
- `prototypes/character-sheet.html` - Static HTML visual prototype
- `IMPLEMENTATION-STRATEGY.md` - Phased implementation guide

**Files Created (December 6, 2025):**
- `sheetComponents/CharacterSheet.css` - PHB styling extracted from prototype (~2100 lines)
- `sheetComponents/CharacterSheet.tsx` - Main entry component orchestrating all sections
- `sheetComponents/CharacterSheetPage.tsx` - Page container with PHB styling
- `sheetComponents/CharacterHeader.tsx` - Portrait + labeled info boxes
- `sheetComponents/AbilityScoresRow.tsx` - 6 horizontal ability boxes
- `sheetComponents/MainContentGrid.tsx` - 3-column layout wrapper
- `sheetComponents/column1/` - SavingThrowsSection, SkillsSection, Column1Content
- `sheetComponents/column2/` - CombatStatsRow, HPSection, Column2Content  
- `sheetComponents/column3/` - PersonalitySection, FeaturesSection, Column3Content
- Updated `shared/CharacterCanvas.tsx` to use new sheetComponents

**Files Created (December 7, 2025):**
- `sheetComponents/BackgroundPersonalitySheet.tsx` - Separate page for notes, traits, ideals, bonds, flaws
- `sheetComponents/InventorySheet.tsx` - Equipment, weapons, armor, consumables, treasure
- `sheetComponents/inventory/` - InventoryHeader, InventoryTopRow, InventoryBlock, ItemRow
- `sheetComponents/SpellSheet.tsx` - Spellcasting ability, slots, cantrips, prepared/known spells
- `sheetComponents/spells/` - SpellLevelSection, SpellSlotTracker, SpellList
- `canvasComponents/demoData/DEMO_WIZARD.ts` - Demo wizard character for spell testing
- Updated `canvasComponents/demoData/DEMO_FIGHTER.ts` - Comprehensive inventory for all item types

**Reference**: `DESIGN-Canvas-Character-Sheet-Integration.md`

---

## 📚 Research References

| Document | Key Insights |
|----------|-------------|
| `research/RESEARCH-Spellcasting-System.md` | Caster types, slot progressions, Pact Magic |
| `research/RESEARCH-Equipment-System.md` | Weapon/armor interfaces, proficiency rules |
| `research/Technical Analysis of 5etools Architecture...md` | **Class-Feature separation**, spell `fromClassList`, progression arrays |

**5etools Strategic Note**: Consider importing filtered 5etools JSON for spell data (T035k) - would save significant manual data entry. See plan.md for details.

---

## 📋 Task Summary

| Phase | Description | Tasks | Est. Hours | Status |
|-------|-------------|-------|------------|--------|
| **Phase 1** | Setup | 3 | 1h | ✅ Complete |
| **Phase 2** | Foundational (Rule Engine) | 10 | 4-6h | ✅ Complete |
| **Phase 3** | US1 - Manual Character Creation | 62 | 84-114h | 🔄 In Progress (Canvas ✅, Pagination ✅) |
| **Phase 3.5b** | Wizard Polish & Integration | 7 | 14-16h | ⏳ **NEXT** (blocks Edit Mode) |
| **Phase 3.7** | Edit Mode (Core) | 10 | 12-16h | ⏳ Pending |
| **Phase 3.8** | Edit Mode (Inventory) | 5 | 6-8h | ⏳ Pending |
| **Phase 3.9** | Homebrew Mode | 5 | 8-12h | ⏳ Pending |
| **Phase 4** | US4 - Save and Load | 6 | 6-8h | ⏳ Pending |
| **Phase 5** | US2 - AI Generation | 6 | 12-16h | ⏳ Pending (after Edit Mode) |
| **Phase 6** | US3 - Portrait Generation | 2 | 4-6h | ⏳ Pending |
| **Phase 7** | US5 - Character Leveling | 4 | 8-10h | ⏳ Pending |
| **Phase 8** | US6 - Export | 3 | 4-6h | ⏳ Pending |
| **Phase 9** | Polish | 3 | 2-4h | ⏳ Pending |

**Changes from GPT-5 Review**:
- Added Level 1 subclass tasks (Cleric, Sorcerer, Warlock)
- Added spellcasting info tasks
- Added flexible ability bonus tasks (Half-Elf)
- Moved subclass selection to Phase 3 for level 1 classes

---

## Phase 1: Setup

**Goal**: Verify project structure and existing foundation

- [x] T001 Verify existing 77 tests pass by running `npm test -- --testPathPattern="PlayerCharacterGenerator" --watchAll=false` ✅ 79 tests (77 + 2 placeholder)
- [x] T002 Verify directory structure matches plan in `src/components/PlayerCharacterGenerator/` ✅ Core structure exists
- [x] T003 Create `engine/` directory structure in `src/components/PlayerCharacterGenerator/engine/` ✅ Created engine/, engine/dnd5e/, engine/dnd5e/validators/

---

## Phase 2: Foundational - Rule Engine Interface (BLOCKING)

**Goal**: Define RuleEngine contract and D&D 5e shell implementation  
**This phase MUST complete before user story phases**

### 2.1 Interface Definition

- [x] T004 [P] Create `RuleEngine.interface.ts` with generic interface in `src/components/PlayerCharacterGenerator/engine/RuleEngine.interface.ts` ✅
- [x] T005 [P] Create `RuleEngine.types.ts` with ValidationResult, SkillChoice, EquipmentChoiceGroup in `src/components/PlayerCharacterGenerator/engine/RuleEngine.types.ts` ✅
- [x] T006 Create `index.ts` re-exports in `src/components/PlayerCharacterGenerator/engine/index.ts` ✅

### 2.2 D&D 5e Engine Shell

- [x] T007 Create `DnD5eRuleEngine.ts` class implementing interface in `src/components/PlayerCharacterGenerator/engine/dnd5e/DnD5eRuleEngine.ts` ✅
- [x] T008 Stub all interface methods with TODO comments in `DnD5eRuleEngine.ts` ✅ All methods stubbed
- [x] T009 Create `DnD5eRuleEngine.test.ts` with interface compliance tests in `src/components/PlayerCharacterGenerator/__tests__/engine/dnd5e/DnD5eRuleEngine.test.ts` ✅
- [x] T010 Create `index.ts` re-exports in `src/components/PlayerCharacterGenerator/engine/dnd5e/index.ts` ✅

### 2.3 Provider Integration

- [x] T011 Add ruleEngine to context in `src/components/PlayerCharacterGenerator/PlayerCharacterGeneratorProvider.tsx` ✅
- [x] T012 Add validation state derived from engine in `PlayerCharacterGeneratorProvider.tsx` ✅ (validation + isCharacterValid)
- [x] T013 Verify all 77+ existing tests still pass after engine integration ✅ 112 tests pass

---

## Phase 3: US1 - Manual Character Creation via Wizard (P1)

**Goal**: Complete 6-step character creation wizard with validation  
**Independent Test**: Complete all 6 wizard steps → valid level 1 character sheet  
**Depends On**: Phase 2 complete

### 📦 Test Fixtures Available

**Location**: `__tests__/fixtures/testCharacters.ts` ✅ Complete

| Fixture | Usage |
|---------|-------|
| `HUMAN_FIGHTER_L1` | Basic martial, point buy validation |
| `HILL_DWARF_CLERIC_L1` | L1 subclass, prepared caster, domain spells |
| `HALF_ELF_BARD_L1` | **Flexible ability bonuses** (choose 2 stats) |
| `TIEFLING_WARLOCK_L1` | L1 subclass, **Pact Magic** |
| `DRAGONBORN_SORCERER_L1` | L1 subclass, natural AC |
| `HIGH_ELF_WIZARD_L3` | Spellbook, ritual casting, 2nd-level slots |
| `HUMAN_PALADIN_L3` | Half-caster progression |

**When to Use**: After T035p (spellcasting), use fixtures to validate engine produces correct character state

### 3.1 SRD Race Data ✅ COMPLETE
Source: https://github.com/foundryvtt/dnd5e/tree/5.2.x/packs/_source

- [x] T014 [P] [US1] Add Mountain Dwarf subrace in `src/components/PlayerCharacterGenerator/data/dnd5e/races.ts` ✅
- [x] T015 [P] [US1] Add High Elf and Wood Elf subraces in `data/dnd5e/races.ts` ✅
- [x] T016 [P] [US1] Add Lightfoot and Stout Halfling subraces in `data/dnd5e/races.ts` ✅
- [x] T017 [P] [US1] Add Human race (no subrace) in `data/dnd5e/races.ts` ✅
- [x] T018 [P] [US1] Add Dragonborn race with ancestry choice in `data/dnd5e/races.ts` ✅
- [x] T019 [P] [US1] Add Forest and Rock Gnome subraces in `data/dnd5e/races.ts` ✅
- [x] T020 [P] [US1] Add Half-Elf race (+2 CHA, +1 to two others) in `data/dnd5e/races.ts` ✅
- [x] T021 [P] [US1] Add Half-Orc race in `data/dnd5e/races.ts` ✅
- [x] T022 [P] [US1] Add Tiefling race in `data/dnd5e/races.ts` ✅
- [x] T023 [US1] Create race data tests in `src/components/PlayerCharacterGenerator/__tests__/data/dnd5e/races.test.ts` ✅ 50+ tests
- [x] T024 [US1] Implement `getAvailableRaces()` in `DnD5eRuleEngine.ts` ✅
- [x] T025 [US1] Implement `getSubraces(baseRaceId)` in `DnD5eRuleEngine.ts` ✅
- [x] T026 [US1] Implement `applyRacialBonuses()` in `DnD5eRuleEngine.ts` ✅

### 3.1b Flexible Ability Bonuses ✅ COMPLETE

- [x] T026b [US1] Add `FlexibleBonusConfig` type to `RuleEngine.types.ts` ✅
- [x] T026c [US1] Add `AbilityBonusChoice` type to `RuleEngine.types.ts` ✅
- [x] T026d [US1] Implement `hasFlexibleAbilityBonuses(raceId)` in `DnD5eRuleEngine.ts` ✅
- [x] T026e [US1] Implement `getFlexibleAbilityBonusOptions(raceId)` in `DnD5eRuleEngine.ts` ✅
- [x] T026f [US1] Update `applyRacialBonuses()` to accept `bonusChoices` parameter ✅
- [x] T026g [US1] Add tests for flexible bonus validation (Half-Elf +1/+1 can't stack) ✅

### 3.2 SRD Class Data

- [x] T027 [P] [US1] Create `classes.ts` with Barbarian, Fighter, Monk, Rogue in `src/components/PlayerCharacterGenerator/data/dnd5e/classes.ts` ✅ 4 martial classes
- [x] T028 [P] [US1] Add Bard, Cleric, Druid classes to `data/dnd5e/classes.ts` ✅ 3 full casters (known + prepared)
- [x] T029 [P] [US1] Add Paladin, Ranger classes to `data/dnd5e/classes.ts` ✅ 2 half casters
- [x] T030 [P] [US1] Add Sorcerer, Warlock, Wizard classes to `data/dnd5e/classes.ts` ✅ 3 full casters (all 12 SRD classes complete!)
- [ ] T031 [US1] Create `classFeatures.ts` with level 1-3 features in `src/components/PlayerCharacterGenerator/data/dnd5e/classFeatures.ts` ℹ️ Features embedded in classes.ts. **5etools pattern**: Consider reference-based approach (`"Second Wind|Fighter|1"`) for feature reuse across classes (e.g., Extra Attack)
- [x] T032 [US1] Create class data tests in `src/components/PlayerCharacterGenerator/__tests__/data/dnd5e/classes.test.ts` ✅ 218 tests
- [x] T033 [US1] Implement `getAvailableClasses()` in `DnD5eRuleEngine.ts` ✅ Returns all 12 SRD classes
- [x] T034 [US1] Implement `getValidSkillChoices(character)` in `DnD5eRuleEngine.ts` ✅ Returns class skill options + tracks selected
- [x] T035 [US1] Implement `getEquipmentChoices(classId)` in `DnD5eRuleEngine.ts` ✅ Transforms class equipment to EquipmentChoiceGroup[]

### 3.2b Level 1 Subclasses ✅ COMPLETE

**These classes require subclass selection at level 1:**
- Cleric → Life Domain
- Sorcerer → Draconic Bloodline  
- Warlock → The Fiend

**🧪 Test Fixtures**: Use `HILL_DWARF_CLERIC_L1`, `DRAGONBORN_SORCERER_L1`, `TIEFLING_WARLOCK_L1` to verify L1 subclass handling

- [x] T035b [US1] Create `subclasses.ts` with `Subclass` interface ✅ Already exists in class.types.ts as DnD5eSubclass
- [x] T035c [US1] Add Life Domain (Cleric) subclass data ✅ Exists in classes.ts
- [x] T035d [US1] Add Draconic Bloodline (Sorcerer) subclass data ✅ Exists in classes.ts
- [x] T035e [US1] Add The Fiend (Warlock) subclass data ✅ Exists in classes.ts
- [x] T035f [US1] Create subclass tests ✅ 31 new tests in DnD5eRuleEngine.test.ts
- [x] T035g [US1] Implement `getAvailableSubclasses(classId)` in `DnD5eRuleEngine.ts` ✅
- [x] T035h [US1] Implement `getSubclassLevel(classId)` in `DnD5eRuleEngine.ts` ✅ (returns 1 for Cleric/Sorcerer/Warlock)
- [x] T035i [US1] Add subclass validation to `validateClass()` ✅ Error if L1 class without subclass

### 3.2c Spellcasting System ✅ COMPLETE

**Reference**: `research/RESEARCH-Spellcasting-System.md` ✅ Complete

**🧪 Test Fixtures**: 
- Full casters: `HILL_DWARF_CLERIC_L1` (prepared), `HALF_ELF_BARD_L1` (known), `HIGH_ELF_WIZARD_L3` (spellbook)
- Half casters: `HUMAN_PALADIN_L3` (prepared), `LIGHTFOOT_HALFLING_RANGER_L3` (known)
- Pact Magic: `TIEFLING_WARLOCK_L1` (L1), `TIEFLING_WARLOCK_L3` (slot upgrade)

- [x] T035j [US1] Add `SpellcastingInfo` type to `RuleEngine.types.ts` ✅ Full character spellcasting state type
- [x] T035k [US1] Create `spells.ts` with SRD cantrips and level 1 spells ✅ 23 cantrips + 22 1st-level spells (45 total)
- [x] T035l [US1] Spellcasting config per class ✅ Already in classes.ts from T027-T030
- [x] T035m [US1] Implement `getSpellcastingInfo(character)` ✅ Full/half/pact caster support
- [x] T035n [US1] Implement spell slot calculation ✅ Uses class.spellSlots data
- [x] T035o [US1] Implement `getAvailableSpells(character, spellLevel)` ✅ Filters by class list
- [x] T035p [US1] Add spellcasting tests ✅ 9 new tests covering all caster types

### 3.3 SRD Background Data ✅ COMPLETE

- [x] T036 [US1] Create `backgrounds.ts` with 6 SRD backgrounds ✅ Acolyte, Criminal, Folk Hero, Noble, Sage, Soldier
- [x] T037 [US1] Implement `getAvailableBackgrounds()` in `DnD5eRuleEngine.ts` ✅ Returns all 6 SRD backgrounds

### 3.4 Validation Implementation ✅ COMPLETE

- [x] T038 [US1] Implement `validateAbilityScores()` ✅ Checks scores 1-30, detects unset (0) scores
- [x] T039 [US1] Implement `validateRace()` ✅ Checks race selected, valid SRD race, subrace requirements, flexible bonus choices
- [x] T040 [US1] `validateClass()` already implemented ✅ Checks class selected, L1 subclass requirement
- [x] T041 [US1] Implement `validateBackground()` ✅ Checks background selected and valid SRD background
- [x] T042 [US1] Implement `validateEquipment()` ✅ Optional validation with info message for empty equipment
- [x] T043 [US1] `validateStep()` already wired ✅ Dispatches to appropriate validator by step
- [x] T044 [US1] `validateCharacter()` already wired ✅ Aggregates results from all steps
- [x] T045 [US1] `isCharacterComplete()` already wired ✅ Returns validateCharacter().isValid
- [x] T046 [US1] Create validator tests ✅ 27 new tests covering all validators

**Note:** Validators kept inline in DnD5eRuleEngine.ts rather than separate files (simpler, no circular deps)

### 3.5 Wizard Steps UI

#### Step 2: Race Selection ✅ COMPLETE
- [x] T047 [US1] Create `RaceSelectionStep.tsx` in `src/components/PlayerCharacterGenerator/creationDrawerComponents/RaceSelectionStep.tsx` ✅
- [x] T048 [US1] Create `RaceCard.tsx` component in `src/components/PlayerCharacterGenerator/components/RaceCard.tsx` ✅
- [x] T049 [US1] Create `SubraceSelector.tsx` component in `src/components/PlayerCharacterGenerator/components/SubraceSelector.tsx` ✅
- [x] T049b [US1] Create `FlexibleAbilityBonusSelector.tsx` for Half-Elf +1/+1 choice in `components/FlexibleAbilityBonusSelector.tsx` ✅

#### Step 3: Class Selection (with Level 1 Subclass) ✅ COMPLETE
- [x] T050 [US1] Create `ClassSelectionStep.tsx` in `creationDrawerComponents/ClassSelectionStep.tsx` ✅
- [x] T051 [US1] Create `ClassCard.tsx` component in `components/ClassCard.tsx` ✅
- [x] T052 [US1] Create `SkillSelector.tsx` component in `components/SkillSelector.tsx` ✅
- [x] T053 [US1] Create `EquipmentChoiceSelector.tsx` component in `components/EquipmentChoiceSelector.tsx` ✅
- [x] T053b [US1] Create `SubclassSelector.tsx` for level 1 subclass selection (Cleric/Sorcerer/Warlock) in `components/SubclassSelector.tsx` ✅
- [x] T053c [US1] Create `SubclassCard.tsx` component in `components/SubclassCard.tsx` ❌ CANCELLED (integrated into SubclassSelector)
- [x] T053d [US1] Create `SpellSelector.tsx` for caster cantrip/spell selection in `components/SpellSelector.tsx` ✅

#### Step 4: Background Selection
- [x] T054 [US1] Create `BackgroundSelectionStep.tsx` in `creationDrawerComponents/BackgroundSelectionStep.tsx` ✅
- [x] T055 [US1] Create `BackgroundCard.tsx` component in `components/BackgroundCard.tsx` ✅

#### Step 5: Equipment
- [x] T056 [US1] Create `EquipmentStep.tsx` in `creationDrawerComponents/EquipmentStep.tsx` ✅

#### Step 6: Review
- [x] T057 [US1] Create `ReviewStep.tsx` in `creationDrawerComponents/ReviewStep.tsx` ✅

#### Integration
- [x] T058 [US1] Wire all steps into `CharacterCreationWizard.tsx` ✅

### 3.5b Wizard Polish & Integration (BLOCKING for Edit Mode)

**Goal:** Make wizard fully functional end-to-end before Edit Mode  
**Status:** ⏳ Not started - Critical gap identified December 8, 2025

| Task | Description | Est. | Status |
|------|-------------|------|--------|
| **T058a** | Add `BasicInfoStep.tsx` - character name, backstory concept, pronouns (Step 0) | 2h | ⏳ |
| **T058b** | Reorder wizard: Basic Info → Abilities → Race → Class → ... | 1h | ⏳ |
| **T058c** | Wire wizard state to CharacterCanvas (see changes live) | 2h | ⏳ |
| **T058d** | Add validation gating - disable Next until step validates | 2h | ⏳ |
| **T058e** | Fix drawer height/overflow (scrollable content area) | 1h | ⏳ |
| **T058f** | Manual end-to-end test: Create full character through wizard | 2h | ⏳ |
| **T058g** | Validate all 7 test fixture characters can be created via wizard | 4h | ⏳ |

**Why This Blocks Edit Mode:**
- Can't edit a character that wasn't properly created
- Need to verify wizard produces valid data before editing it
- Canvas must display wizard output before adding edit capabilities

### 3.6 Canvas Enhancement

**Goal**: Render complete character sheet on canvas with all data from wizard  
**Prerequisite**: Demo character data for testing canvas components  
**Pattern**: Follow StatblockGenerator componentRegistry approach

#### Phase 3.6a: Demo Data & Calculations (BLOCKING) ✅ COMPLETE

Must complete before canvas components can be tested.

- [x] T059a [US1] Create `DEMO_FIGHTER.ts` in `canvasComponents/demoData/` ✅ Complete Human Fighter L1 with all fields
- [x] T066a [US1] Implement `calculateArmorClass(character)` ✅ Armor, shield, unarmored defense, Draconic Resilience
- [x] T066b [US1] Implement `calculateHP(character)` ✅ Hit die + CON, Dwarven Toughness, Draconic Resilience
- [x] T066c [US1] Implement `calculateInitiative(character)` ✅ DEX modifier
- [x] T066d [US1] Implement `calculatePassiveScores(character)` ✅ Perception/Investigation/Insight with proficiency
- [x] T066e [US1] Wire all calculations into `calculateDerivedStats()` ✅ 20 new tests

#### Phase 3.6b: Canvas Components (Display Only)

Each component renders a section of the character sheet. Display-only first, editability added later.

| Component | Renders |
|-----------|---------|
| CharacterHeader | Name, Level X Race Class (Subclass) |
| AbilityScoresBlock | 6 ability scores with modifiers |
| CombatStatsBlock | HP (current/max), AC, Initiative, Speed, Proficiency Bonus |
| SkillsBlock | 18 skills with proficiency checkmarks and modifiers |
| SavingThrowsBlock | 6 saves with proficiency checkmarks and modifiers |
| FeaturesBlock | Racial + Class features (collapsible descriptions) |
| EquipmentBlock | Weapons, Armor, Gear (grouped sections) |
| SpellcastingBlock | Spell Save DC, Attack Bonus, Cantrips, Spells, Slots (casters only) |

- [x] T059 [US1] Create `CharacterHeader.tsx` in `canvasComponents/` - Renders: Name, "Level X Race Class (Subclass)" ✅
- [x] T060 [US1] Create `AbilityScoresBlock.tsx` in `canvasComponents/` - Renders: 6 ability boxes with score + modifier ✅
- [x] T061 [US1] Create `CombatStatsBlock.tsx` in `canvasComponents/` - Renders: HP box (current/max + temp), AC shield, Initiative, Speed, Prof Bonus badge ✅
- [x] T062 [US1] Create `SkillsBlock.tsx` in `canvasComponents/` - Renders: 18 D&D 5e skills with proficiency indicator (●/○) and calculated modifier ✅
- [x] T062b [US1] Create `SavingThrowsBlock.tsx` in `canvasComponents/` - Renders: 6 saving throws with proficiency indicator and modifier ✅
- [x] T063 [US1] Create `FeaturesBlock.tsx` in `canvasComponents/` - Renders: Racial + Class features list with collapsible descriptions, grouped by source ✅
- [x] T064 [US1] Create `EquipmentBlock.tsx` in `canvasComponents/` - Renders: Weapons section, Armor section, Adventuring Gear section ✅
- [x] T064b [US1] Create `SpellcastingBlock.tsx` in `canvasComponents/` - Renders: Spellcasting Ability, Spell Save DC, Spell Attack, Cantrips list, Spells Known/Prepared, Spell Slots (only visible for casters) ✅

#### Phase 3.6c: Integration

- [x] T065 [US1] Create `componentRegistry.ts` in `canvasComponents/` - Register all canvas components following StatblockGenerator pattern ✅
- [x] T067 [US1] Refactor `CharacterCanvas.tsx` to use component registry - Replace inline rendering with registry-based component composition ✅
- [ ] T067a [US1] Manual smoke test - Load demo fighter, verify all blocks render correctly

#### Phase 3.6d: PHB-Style Multi-Page Canvas (Blocking for visual quality)

**Goal**: Implement proper D&D PHB character sheet styling with multi-page canvas rendering  
**Status**: ✅ COMPLETE (via HTML-First approach - T110-T118)  
**Approach Change**: Instead of T070-T075 plan, used HTML prototype-driven componentization

- [x] T068 [US1] **Research**: Extract HTML source from StatblockGenerator canvas for reference styling ✅
- [x] T069 [US1] **Research**: Get reference renders + deep research on Homebrewery CSS ✅
- [x] T070 [US1] Create `CharacterSheetPage.tsx` - Single page wrapper with `.page.phb` ✅ (via T112)
- [x] T071 [US1] Create `PageBreakManager.ts` - ⏭️ SUPERSEDED: Using fixed multi-sheet layout instead
- [x] T072 [US1] Create `CharacterSheetRenderer.tsx` - ⏭️ SUPERSEDED: `CharacterCanvas.tsx` handles sheet switching
- [x] T073 [US1] Section components: ✅ COMPLETE (via T112, T115-T117)
  - T073a: `AbilityScoresRow.tsx` ✅
  - T073b: `SavingThrowsSection.tsx`, `SkillsSection.tsx` ✅
  - T073c: `CombatStatsRow.tsx`, `HPSection.tsx` ✅
  - T073d: Attacks in `InventorySheet.tsx` weapons section ✅
  - T073e: `FeaturesSection.tsx` ✅
  - T073f: `InventorySheet.tsx` ✅
  - T073g: `ProficienciesSection.tsx` ✅
  - T073h: `BackgroundPersonalitySheet.tsx` ✅
  - T073i: `SpellSheet.tsx` ✅
- [x] T074 [US1] Create `CharacterSheet.css` with PHB-specific styles ✅ (~2100 lines)
- [x] T075 [US1] Test multi-page rendering with DEMO_FIGHTER and DEMO_WIZARD ✅

### 3.8 Integration Testing with Test Fixtures 🧪

**Goal**: Validate engine produces correct output for all test character scenarios  
**Fixtures**: `__tests__/fixtures/testCharacters.ts`

| Test | Fixture | Validates |
|------|---------|-----------|
| T067b | `HUMAN_FIGHTER_L1` | Point buy, racial bonuses, martial class |
| T067c | `HILL_DWARF_CLERIC_L1` | L1 subclass, prepared caster, domain spells |
| T067d | `HALF_ELF_BARD_L1` | Flexible ability bonuses, known caster |
| T067e | `TIEFLING_WARLOCK_L1` | Pact Magic, L1 subclass (Fiend) |
| T067f | `DRAGONBORN_SORCERER_L1` | Natural AC (Draconic Resilience), L1 subclass |
| T067g | `HIGH_ELF_WIZARD_L3` | Spellbook, 2nd-level slots, ritual casting |
| T067h | `TIEFLING_WARLOCK_L3` | Pact Magic slot upgrade (1st→2nd) |

- [ ] T067b [US1] Create `engine.integration.test.ts` in `__tests__/engine/` - validate engine builds `HUMAN_FIGHTER_L1` correctly
- [ ] T067c [US1] Add integration test: build `HILL_DWARF_CLERIC_L1` through engine, verify L1 subclass and prepared spells
- [ ] T067d [US1] Add integration test: build `HALF_ELF_BARD_L1` through engine, verify flexible bonus application
- [ ] T067e [US1] Add integration test: build `TIEFLING_WARLOCK_L1` through engine, verify Pact Magic slots
- [ ] T067f [US1] Add integration test: build `DRAGONBORN_SORCERER_L1` through engine, verify Draconic Resilience AC
- [ ] T067g [US1] Add integration test: build `HIGH_ELF_WIZARD_L3` through engine, verify spellbook and 2nd-level slots
- [ ] T067h [US1] Add integration test: build `TIEFLING_WARLOCK_L3` through engine, verify slot level upgrade

**Completion Criteria**: All 11 test fixture characters can be built through the engine and match expected state

---

## Phase 4: US4 - Save and Load Characters (P2)

**Goal**: Auto-save to localStorage, cloud sync for logged-in users  
**Independent Test**: Create character → close browser → reopen → load with all data intact  
**Depends On**: Phase 3 complete

- [ ] T068 [US4] Create `useCharacterPersistence.ts` hook in `src/components/PlayerCharacterGenerator/hooks/useCharacterPersistence.ts`
- [ ] T069 [US4] Implement localStorage auto-save with 2s debounce in `useCharacterPersistence.ts`
- [ ] T070 [US4] Implement cloud sync for logged-in users in `useCharacterPersistence.ts`
- [ ] T071 [US4] Implement storage limit enforcement (5 anon / 50 logged-in) in `useCharacterPersistence.ts`
- [ ] T072 [US4] Create `PlayerCharacterProjectsDrawer.tsx` in `src/components/PlayerCharacterGenerator/PlayerCharacterProjectsDrawer.tsx`
- [ ] T073 [US4] Wire persistence hook into `PlayerCharacterGeneratorProvider.tsx`

---

## Phase 5: US2 - AI-Assisted Character Generation (P2)

**Goal**: Generate complete character from text prompt  
**Independent Test**: Enter concept → receive valid, editable character  
**Depends On**: Phase 3.7-3.9 complete (Edit Mode must work before AI generates editable characters)

- [ ] T074 [US2] Create `playercharactergenerator_router.py` in `DungeonMindServer/routers/playercharactergenerator_router.py`
- [ ] T075 [US2] Create `character_generator.py` service in `DungeonMindServer/services/character_generator.py`
- [ ] T076 [US2] Implement character generation prompt engineering in `character_generator.py`
- [ ] T077 [US2] Implement AI rate limiting (5 for anon, unlimited for logged-in) in `playercharactergenerator_router.py`
- [ ] T078 [US2] Create `AIGenerationStep.tsx` in `src/components/PlayerCharacterGenerator/creationDrawerComponents/AIGenerationStep.tsx`
- [ ] T079 [US2] Wire AI generation tab into `PlayerCharacterCreationDrawer.tsx`

---

## Phase 6: US3 - Character Portrait Generation (P3)

**Goal**: Generate character portrait using Stable Diffusion  
**Independent Test**: Generate portrait → see it on character sheet  
**Depends On**: Phase 5 complete (uses same AI infrastructure)

- [ ] T080 [US3] Copy and adapt `ImageGenerationTab.tsx` from StatblockGenerator to `creationDrawerComponents/PortraitGenerationStep.tsx`
- [ ] T081 [US3] Wire portrait into `CharacterHeader.tsx` canvas component

---

## Phase 7: US5 - Character Leveling (P3)

**Goal**: Level characters from 1→2→3  
**Independent Test**: Level 1 character → level up → verify HP, features, subclass  
**Depends On**: Phase 3 complete

**Note**: Level 1 subclasses (Cleric, Sorcerer, Warlock) are handled in Phase 3.
This phase handles:
- Level 2 subclass: Wizard (School of Evocation)
- Level 3 subclasses: Barbarian (Berserker), Bard (Lore), Druid (Land), Fighter (Champion), Monk (Open Hand), Paladin (Devotion), Ranger (Hunter), Rogue (Thief)

- [ ] T082 [US5] Create `levelUp.ts` with HP calculation, feature lookup in `src/components/PlayerCharacterGenerator/engine/dnd5e/levelUp.ts`
- [ ] T083 [US5] Add level 2-3 SRD subclasses to `subclasses.ts` (Wizard at 2, others at 3)
- [ ] T084 [US5] Implement `calculateLevelUpHP()` in `DnD5eRuleEngine.ts`
- [ ] T085 [US5] Create `LevelUpWizard.tsx` in `src/components/PlayerCharacterGenerator/creationDrawerComponents/LevelUpWizard.tsx`

---

## Phase 8: US6 - Export Character Sheet (P4)

**Goal**: Export as PDF and JSON  
**Independent Test**: Export completed character → verify output format  
**Depends On**: Phase 3 complete (Canvas must work)

- [ ] T086 [US6] Create `characterExport.ts` utility in `src/components/PlayerCharacterGenerator/utils/characterExport.ts`
- [ ] T087 [US6] Implement PDF export using Canvas in `characterExport.ts`
- [ ] T088 [US6] Implement JSON export in DungeonMindObject schema in `characterExport.ts`

---

## Phase 9: Polish & Cross-Cutting Concerns

**Goal**: Final integration and cleanup

- [ ] T089 Verify all success criteria (SC-001 through SC-010) pass
- [ ] T090 Run full test suite and verify >80% coverage on engine/validation
- [ ] T091 Performance audit: Canvas renders <500ms, auto-save <2s
- [ ] T092 Refactor `DnD5eRuleEngine.ts` into smaller modules:
  - Extract validators to `validators/` (validateAbilityScores, validateRace, etc.)
  - Extract calculators to `calculators/` (calculateAC, calculateHP, calculateDerivedStats)
  - Extract data providers to `providers/` (getAvailableRaces, getAvailableClasses, etc.)
  - Extract spellcasting logic to `spellcasting/` (getSpellcastingInfo, getAvailableSpells)
  - Keep core RuleEngine as thin orchestrator (~200-300 lines)
  - **Prerequisite**: File is well-exercised through canvas + wizard integration
  - **Current size**: ~1450 lines (target: <300 lines core + modules)

---

## 📊 Dependencies

```
Phase 2 (Foundational) ──────────────────────────────────────────┐
         │                                                       │
         ▼                                                       │
Phase 3 (US1: Manual Creation + Canvas Display) ─────────────────┤
         │                                                       │
         ▼                                                       │
Phase 3.7-3.9 (Edit Mode + Homebrew) ← CRITICAL PATH ────────────┤
         │                                                       │
         ├──────────────────┬───────────────┬───────────────────┤
         ▼                  ▼               ▼                   │
Phase 4 (Save/Load)    Phase 7 (Leveling) Phase 8 (Export)      │
         │                                                      │
         ▼                                                      │
Phase 5 (AI Generation) ← Requires Edit Mode to work ───────────┤
         │                                                      │
         ▼                                                      │
Phase 6 (Portrait) ─────────────────────────────────────────────┘
                                                                │
                                                                ▼
                                                       Phase 9 (Polish)
```

**Key Change:** Edit Mode (Phase 3.7-3.9) is now on the critical path before AI Generation. This ensures:
1. Manual character creation is fully exercised before automation
2. Generated characters can be immediately edited
3. Homebrew content system is available for AI-generated characters

---

## 🔀 Parallel Execution Opportunities

### Phase 2 (Foundational)
```
T004, T005 can run in parallel (different files)
```

### Phase 3 (US1)
```
Race data tasks (T014-T022) can ALL run in parallel
Class data tasks (T027-T030) can ALL run in parallel
Canvas components (T059-T065) can ALL run in parallel
```

### Phase 4, 5, 7, 8 can run in parallel
After Phase 3 completes, these phases are independent:
```
┌─ Phase 4 (US4: Save/Load)
├─ Phase 5 (US2: AI Gen) → Phase 6 (US3: Portrait)
├─ Phase 7 (US5: Leveling)
└─ Phase 8 (US6: Export)
```

---

## 🎯 Implementation Strategy

### MVP Scope (Recommended)
**Phase 1 + Phase 2 + Phase 3 + Phase 3.7-3.9 + Phase 4**
- Delivers: Complete manual character creation with inline editing and save/load
- Includes: Level 1 characters, full editing, homebrew content, persistence
- Excludes: AI generation, portraits, leveling, export
- Estimated: 130-160 hours
- Value: Fully functional character sheet tool (create, edit, save, load)

### Incremental Delivery
1. **Sprint 1**: Phase 1-2 (Foundation + Rule Engine) - 5-7h ✅ COMPLETE
2. **Sprint 2**: Phase 3.1 (Race Data) - 4-6h ✅ COMPLETE
3. **Sprint 3**: Phase 3.1b + 3.2 (Flexible bonuses + Classes) - 12-18h ✅ COMPLETE
4. **Sprint 4**: Phase 3.2b + 3.2c (Level 1 Subclasses + Spellcasting) - 12-18h ✅ COMPLETE
5. **Sprint 5**: Phase 3.3-3.4 (Backgrounds + Validation) - 10-14h ✅ COMPLETE
6. **Sprint 6**: Phase 3.5 (Wizard UI with subclass/spell selectors) - 24-32h ✅ COMPLETE
7. **Sprint 7**: Phase 3.6 (Canvas - Demo Data, Components, Pagination) - 14-18h ✅ COMPLETE
8. **Sprint 8**: Phase 3.5b (Wizard Polish & Integration) - 14-16h ← **NEXT**
9. **Sprint 9**: Phase 3.7 (Edit Mode - Core) - 12-16h
10. **Sprint 10**: Phase 3.8-3.9 (Edit Mode - Inventory + Homebrew) - 14-20h
11. **Sprint 11**: Phase 4 (Save/Load) - 6-8h
12. **Sprint 12**: Phase 5 (AI Generation) - 12-16h
13. **Sprint 13**: Phase 6-8 (Portrait, Leveling, Export) - 16-22h
14. **Sprint 14**: Phase 9 (Polish) - 2-4h

---

## ✅ Format Validation

- [x] All tasks have checkbox `- [ ]`
- [x] All tasks have sequential ID (T001-T091)
- [x] All parallelizable tasks marked with `[P]`
- [x] All user story phase tasks have `[US#]` label
- [x] All tasks have file path or clear action
- [x] Setup phase: NO story labels
- [x] Foundational phase: NO story labels
- [x] Polish phase: NO story labels

---

## 📈 Metrics

| Metric | Value |
|--------|-------|
| **Total Tasks** | 158 |
| **Setup Tasks** | 3 (✅ complete) |
| **Foundational Tasks** | 10 (✅ complete) |
| **US1 Tasks** | 85 (includes subclass/spellcasting + canvas breakdown + 7 integration tests) |
| **Wizard Polish (3.5b)** | 7 (basic info, wiring, validation, testing) |
| **Edit Mode Tasks (3.7)** | 10 (core editing, HP, spell slots) |
| **Edit Mode - Inventory (3.8)** | 5 (equipment, currency, consumables) |
| **Homebrew Mode Tasks (3.9)** | 5 (custom features, items, spells) |
| **US2 Tasks (AI)** | 6 |
| **US3 Tasks (Portrait)** | 2 |
| **US4 Tasks (Save/Load)** | 6 |
| **US5 Tasks (Leveling)** | 4 |
| **US6 Tasks (Export)** | 3 |
| **Polish Tasks** | 7 |
| **Parallel Opportunities** | 25+ tasks |
| **MVP Tasks** | 111 (Phase 1-3 + Edit Mode + Save/Load) |

**Tasks Added (December 2, 2025 - Canvas Breakdown)**:
- T059a: Demo character data for canvas testing (1 task)
- T066a-T066e: Derived stats calculation breakdown (5 tasks)
- T062b: SavingThrowsBlock separate from skills (1 task)
- T064b: SpellcastingBlock for casters (1 task)
- T067a: Manual smoke test (1 task)
- T068-T075: PHB-style multi-page canvas (8 tasks + 9 sub-tasks for T073)

**Previous Additions (GPT-5 Review)**:
- T026b-T026g: Flexible ability bonuses (6 tasks)
- T035b-T035i: Level 1 subclasses (8 tasks)
- T035j-T035p: Spellcasting system (7 tasks)
- T049b: FlexibleAbilityBonusSelector UI (1 task)
- T053b-T053d: Subclass/Spell selection UI (3 tasks)

---

**Tasks Added (December 7, 2025 - All Sheets Visual Complete)**:
- T115-T118: Additional sheet pages (Background/Personality, Inventory, Spells, Polish)
- Marked T070-T075 as complete/superseded via HTML-first approach
- T119: Mobile responsiveness debug (InventorySheet/SpellSheet not rendering)
- T120: CDN optimization (offload CSS, images, fonts)
- T121: SpellSheet only show levels with slots ✅ Complete

**Tasks Restructured (December 8, 2025 - Edit Mode + Phase Reorder)**:
- **Phase 3.7 (Edit Mode)**: T140-T149 - Core inline editing, HP/spell tracking
- **Phase 3.8 (Edit Mode - Inventory)**: T150-T154 - Equipment/currency editing
- **Phase 3.9 (Homebrew Mode)**: T155-T159 - Custom content creation
- Absorbed old T130-T138 interactivity tasks into Phase 3.7/3.8
- **Reordered phases**: Edit Mode now comes BEFORE AI Generation
- Updated dependency diagram to show Edit Mode as critical path
- MVP now includes Edit Mode + Save/Load (111 tasks vs 91)

**Generated by speckit.tasks workflow**  
**Updated**: December 8, 2025 (Edit Mode phases added, Wizard Polish blocking phase identified)  
**Next**: Phase 3.5b (Wizard Polish) → Phase 3.7 (Edit Mode) → Phase 4 (Save/Load) → Phase 5 (AI Generation)

