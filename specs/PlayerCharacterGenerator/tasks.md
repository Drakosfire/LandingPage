# Tasks: PlayerCharacterGenerator

**Generated**: November 30, 2025  
**Updated**: December 14, 2025 (V1 Feature Complete — Ready for Deploy)  
**Source**: spec.md + plan.md  
**Status**: 🚀 Phase 8 (Deploy & Verify) is next

---

## 🎉 Project Summary

The Player Character Generator V1 is **feature complete**. All core functionality is implemented:

- ✅ 8-step character creation wizard
- ✅ PHB-style 4-page character sheet (Main, Background, Inventory, Spells)
- ✅ Edit mode (inline + drawer)
- ✅ LocalStorage + Firestore persistence
- ✅ AI-assisted character generation
- ✅ Portrait generation + upload
- ✅ Mobile responsiveness
- ✅ PDF export (Print → Save as PDF)

**Next Steps:**
1. **Phase 8**: Deploy to production and verify
2. **Phase 9**: Reflection and learnings capture

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

### LocalStorage Persistence (Completed 2025-12-09)

| Task | Description | Status |
|------|-------------|--------|
| **T069** | localStorage auto-save with 2s debounce | ✅ Complete |
| **T073** | Wire persistence into Provider | ✅ Complete |
| **BugFix** | playerName saving to wrong location | ✅ Fixed |
| **BugFix** | XP field missing from Character type | ✅ Fixed |
| **BugFix** | Click area only on text, not full box | ✅ Fixed |

**Handoff:** `specs/PlayerCharacterGenerator/HANDOFF-LocalStorage-Persistence.md`

### Edit Mode Expansion (December 9-10, 2025)

**Handoff:** `specs/PlayerCharacterGenerator/HANDOFF-Edit-Mode-Expansion.md`

| Task | Description | Status |
|------|-------------|--------|
| **EM-01** | Edit toggle in UnifiedHeader (eye/pencil icons) | ✅ Complete |
| **EM-02** | Visual indicators (blue dashed = quick, purple dotted = complex) | ✅ Complete |
| **EM-03** | CharacterHeader inline edit (name, playerName, XP, alignment) | ✅ Complete |
| **EM-04** | AbilityScoresRow (HP, death saves, inspiration) | ✅ Complete |
| **EM-05** | Column2Content (Currency, Attacks complex, Equipment complex) | ✅ Complete |
| **EM-06** | BackgroundPersonalitySheet (Traits, Ideals, Bonds, Flaws) | ✅ Complete |
| **EM-07** | InventorySheet CurrencySection | ✅ Complete |
| **EM-08** | SpellSheet SpellSlotTracker (click-to-toggle) | ✅ Complete |
| **EM-09** | Column 1 (Skills/Saves) → complex edit | ✅ Complete |
| **EM-10** | Column 3 (Features) → complex edit | ✅ Complete |
| **EM-11** | InventorySheet Attunement toggles | ✅ Complete |
| **EM-12** | SpellSheet Prepared spell toggles | ✅ Complete |

**Key Patterns Established:**
- `EditableText` component for inline editing
- `EditableTextarea` with `useImperativeHandle` for container click forwarding
- `data-editable="quick"` and `data-editable="complex"` attributes
- `openDrawerToStep(WIZARD_STEPS.X)` for complex fields

### Editable Equipment Modal (December 9-10, 2025)

**Handoff:** `specs/PlayerCharacterGenerator/HANDOFF-Editable-Equipment-Modal.md`

| Task | Description | Status |
|------|-------------|--------|
| **EQM-01** | AddItemRow component ("+" button in edit mode) | ✅ Complete |
| **EQM-02** | ItemEditModal component (add/edit/delete) | ✅ Complete |
| **EQM-03** | InventoryBlock integration (onAddItem, onItemEdit) | ✅ Complete |
| **EQM-04** | CharacterCanvas inventory CRUD handlers | ✅ Complete |
| **EQM-05** | Polish & testing | 🔄 In Progress |

### Mobile Responsiveness (December 7, 2025)

**Handoff:** `specs/PlayerCharacterGenerator/HANDOFF-Mobile-Responsiveness.md`

| Task | Description | Status |
|------|-------------|--------|
| **MR-01** | ResizeObserver + CSS transform scaling | ✅ Complete |
| **MR-02** | Hybrid system (canvas vars + calc()) | ✅ Complete |
| **MR-03** | Mobile canvas with viewport switch at 800px | ✅ Complete |
| **MR-04** | InventorySheet + SpellSheet mobile CSS fix | ✅ Complete |
| **MR-05** | Polish and device testing | ⬜ Pending |

### Pagination Integration (December 7, 2025)

**Handoff:** `specs/PlayerCharacterGenerator/HANDOFF-Pagination-Integration.md`

| Task | Description | Status |
|------|-------------|--------|
| **PG-01** | Research & Spike (Canvas patterns) | ✅ Complete |
| **PG-02** | Responsive Scaling (ResizeObserver) | ✅ Complete |
| **PG-03** | Features Overflow (multi-page) | ✅ Complete |
| **PG-04** | SpellSheet Pagination | ✅ Complete |
| **PG-05** | Inventory Overflow | ✅ Complete |
| **PG-06** | Manual Add Lines | ✅ Complete |

### Ready for Next Phase (Wizard)

| Task | Description | Status |
|------|-------------|--------|
| **T105** | Full `useCanvasLayout` integration (automatic pagination) | 🔜 Next |
| **T106** | Test pagination with long feature lists | ⏳ Pending |

### End Polish / Optimization

| Task | Description | Status |
|------|-------------|--------|
| **T119** | Mobile responsiveness - InventorySheet/SpellSheet CSS fix | ✅ Complete |
| **T120** | Offload CSS and images to CDN (fonts, backgrounds, icons) | ⏳ Pending |
| **T121** | SpellSheet: Only show spell levels that have slots (hide empty levels) | ✅ Complete |

### Pending Handoff Work

| Handoff | Priority | Est. Hours | Status |
|---------|----------|------------|--------|
| `HANDOFF-Editable-Spell-Modal.md` | P2 | 6-8h | ⬜ Not Started |
| `HANDOFF-Unified-Equipment-Model.md` | P2 | 4-5h | ⬜ Not Started |
| `HANDOFF-Edit-Mode-Expansion.md` Phase 2-4 | P3 | 4-6h | ⬜ Skills, Features, Attunement |
| `HANDOFF-Pagination-Integration.md` Phase 3-6 | P3 | 6-8h | ⬜ SpellSheet, Inventory overflow |

### Phase 3.7: Edit Mode (Inline Character Editing)

**Goal:** Transform sheets from read-only display to editable documents  
**Prerequisite:** Sheets render correctly (T118 ✅)  
**Status:** 🔄 Mostly Complete (via HANDOFF-Edit-Mode-Expansion)

| Task | Description | Status |
|------|-------------|--------|
| **T140** | Create `useEditMode.ts` hook - edit state, dirty tracking, undo buffer | ✅ Complete (in Provider) |
| **T141** | Add inline text editing for CharacterHeader (name, playerName, XP, alignment) | ✅ Complete |
| **T142** | Add inline editing for personality traits, ideals, bonds, flaws | ✅ Complete (BackgroundPersonalitySheet) |
| **T143** | Add inline editing for notes/backstory on BackgroundSheet | ⏳ Pending (backstory not done) |
| **T144** | HP tracking - click to adjust current HP, temp HP | ✅ Complete (AbilityScoresRow) |
| **T145** | Death saves - click to mark successes/failures | ✅ Complete |
| **T146** | Hit dice - confirmed derived from class (not editable) | ✅ N/A |
| **T147** | Inspiration toggle - click to grant/remove | ✅ Complete |
| **T148** | Spell slot dots - click to mark used/expended | ✅ Complete (SpellSlotTracker) |
| **T149** | Spell prepared checkboxes - toggle prepared spells | ⏳ Pending |

### Phase 3.8: Edit Mode - Inventory & Equipment

**Goal:** Complete inventory editing capabilities  
**Prerequisite:** Core edit mode (T140-T149)  
**Status:** 🔄 Mostly Complete (via HANDOFF-Editable-Equipment-Modal)

| Task | Description | Status |
|------|-------------|--------|
| **T150** | Equipment checkboxes - mark equipped/attuned items | ✅ Complete |
| **T151** | Currency tracking - edit gold/silver/etc inline | ✅ Complete (Column2Content + CurrencySection) |
| **T152** | Consumables - track quantity used | ✅ Complete (ItemEditModal) |
| **T153** | Item quantity editing (add/remove/adjust) | ✅ Complete (ItemEditModal) |
| **T154** | Visual edit mode toggle (pencil icon, border highlights) | ✅ Complete (UnifiedHeader) |
| **T160** | Equipment data in Rule Engine (weapons, armor, packs, gear with full stats) | ⬜ Pending |

**T160 Details:** Move equipment data from hardcoded `EquipmentChoiceSelector` to rule engine:
- Create `engine/data/equipment.ts` with all PHB weapons, armor, packs, gear
- Add `getEquipmentDetails(itemId)` method to `DnD5eRuleEngine`
- Include: damage, properties, weight, value, pack contents, armor AC/type
- Info popovers in wizard will query rule engine instead of local data

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

### ✅ Completed Phases (V1 Launch Scope)

| Phase | Description | Status |
|-------|-------------|--------|
| **Phase 1** | Setup | ✅ Complete |
| **Phase 2** | Foundational (Rule Engine) | ✅ Complete |
| **Phase 3** | US1 - Manual Character Creation | ✅ Complete |
| **Phase 3.5b** | Wizard Polish & Integration | ✅ Complete |
| **Phase 3.6** | Edit Mode Expansion | ✅ Complete |
| **Phase 3.7** | Edit Mode (Core) | ✅ Complete |
| **Phase 3.8** | Edit Mode (Inventory) | ✅ Complete |
| **Phase 4** | US4 - Save and Load (Character Roster) | ✅ Complete |
| **Phase 5.0** | AI Prompt Evaluation (RESEARCH) | ✅ Complete |
| **Phase 5.1** | US2 - AI Generation Infrastructure | ✅ Complete |
| **Phase 5.2** | US2 - AI Generation UI | ✅ Complete |
| **Phase 6** | US3 - Portrait Generation | ✅ Complete |
| **Phase 7** | US6 - PDF Export | ✅ Complete |

### 🚀 Final V1 Phases

| Phase | Description | Status |
|-------|-------------|--------|
| **Phase 7** | US6 - PDF Export | ✅ Complete |
| **Phase 8** | Deploy & Verify | 🔜 Next |
| **Phase 9** | Reflection & Learnings | ⏳ After Deploy |

### 📦 Backlog (Post-V1)

| Phase | Description | Status |
|-------|-------------|--------|
| **Phase 3.8b** | Editable Spell Modal | ⬜ Backlog |
| **Phase 3.8c** | Unified Equipment Model | ⬜ Backlog |
| **Phase 3.9** | Homebrew Mode | ⬜ Backlog |
| **US5** | Character Leveling | ⬜ Backlog |
| **US6** | JSON Export (PDF complete) | ⬜ Backlog |
| **Polish** | Final polish pass | ⬜ Backlog |

---

## 📦 Backlog: Standardized “Print Contract” (Recurring Pattern)

**Problem:** Print/PDF bugs recur across generators (blank first page in Firefox, blank pages between pages due to flex+gap, viewport-derived heights/padding leaking into print, selector specificity battles with `!important` rules).

**Goal:** A reusable, standardized print contract so future features can be one-shot:
- One “print surface” wrapper/class to opt in
- Shared print CSS contract (not per-feature print CSS spelunking)
- Evidence-first debugging via snapshot capture

| Task | Description | Status |
|------|-------------|--------|
| **T130** | Standardize a reusable “print surface” wrapper for non-Canvas DOM pages (PCG-style pages) that mirrors Canvas structure/expectations | ⬜ Backlog |
| **T131** | Consolidate PCG print rules into shared print contract CSS (minimize per-feature print CSS) | ⬜ Backlog |
| **T132** | Generalize “Capture Print Snapshot (HTML)” into a shared dev tool usable by any generator surface | ⬜ Backlog |
| **T133** | Add a “Print Contract Checklist” to project quick reference (symptoms → root causes → fixes) | ⬜ Backlog |

**Success Criteria:**
- Firefox prints **no blank first page** and **no blank pages between pages** for any compliant surface.
- Print layout cannot be broken by screen-only layout styles (flex/gap/min-height/height/padding).
- Debugging is snapshot-driven: capture → diff → one surgical change.

---

## 🎉 December 2025 Progress

**Major Milestones Completed:**
- ✅ Full character creation wizard (8 steps)
- ✅ PHB-style character sheet (4 pages: Main, Background, Inventory, Spells)
- ✅ Mobile responsiveness (viewport switch at 800px)
- ✅ Edit mode (inline quick edits + drawer for complex fields)
- ✅ Editable Equipment Modal (add/edit/delete items)
- ✅ LocalStorage auto-save with cloud sync for logged-in users
- ✅ Character Roster UI (list, load, delete projects)
- ✅ AI-assisted character generation (concept → full character)
- ✅ Portrait generation + upload (4x gallery, recipe panel)
- ✅ Portrait layering fix (z-index override for PHB stylesheet)
- ✅ PDF export (Print → Save as PDF with Firefox recommendation)

**Critical Path to V1 Launch:**
1. ✅ ~~Wizard Polish (3.5b)~~ — Complete
2. ✅ ~~Save/Load (Phase 4)~~ — Complete
3. ✅ ~~AI Generation (5.0-5.2)~~ — Complete
4. ✅ ~~Portrait Generation (Phase 6)~~ — Complete
5. ✅ ~~PDF Export (Phase 7)~~ — Complete
6. 🔜 **Deploy & Verify (Phase 8)** — Next
7. ⏳ **Reflection & Learnings (Phase 9)** — After deploy

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

### 3.5b Wizard Polish & Integration (COMPLETE)

**Goal:** Make wizard fully functional end-to-end  
**Status:** ✅ **COMPLETE** (December 11, 2025)  
**Handoff:** `specs/PlayerCharacterGenerator/HANDOFF-Wizard-Polish.md`

| Task | Description | Est. | Status |
|------|-------------|------|--------|
| **T058a** | Add `BasicInfoStep.tsx` - character name, backstory concept, pronouns (Step 0) | 2h | ✅ |
| **T058b** | Reorder wizard: Basic Info → Abilities → Race → Class → ... | 1h | ✅ |
| **T058c** | Wire wizard state to CharacterCanvas (see changes live) | 2h | ✅ |
| **T058d** | ~~Validation gating~~ → Free navigation (users can explore steps freely) | 2h | ✅ |
| **T058e** | Fix drawer height/overflow (scrollable content area) | 1h | ✅ |
| **T058f** | Manual end-to-end test: Create full character through wizard | 2h | ✅ |
| **T058g** | Validate all 7 test fixture characters can be created via wizard | 4h | ⏳ |
| **T161** | Weapon sub-selection ("Any simple weapon" → specific weapon picker) | 2h | ✅ |
| **T162** | Spell selection integration (fixed case sensitivity bug) | 1h | ✅ |

**Session Highlights (December 10-11, 2025):**
- Unified step navigation for mobile AND desktop (StepNav component)
- Removed nested ScrollAreas (parent drawer handles all scrolling)
- Added 100px bottom padding + curved corners to drawer
- Added "Changes saved automatically..." footer to ALL 8 steps
- Skill overlap replacement shows green confirmation box after selection
- Weapon sub-selection with searchable dropdown + confirmation box
- Fixed spell selection case sensitivity bug (`getClassById('Warlock')` vs `id: 'warlock'`)

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

**Goal**: Multi-character management with cloud sync  
**Design:** Option 2 "Delightful" - Character Roster (approved 2025-12-11)  
**Handoff:** `specs/PlayerCharacterGenerator/HANDOFF-Save-Load.md`  
**Status:** ✅ **Core CRUD Complete** (December 11, 2025)  
**Depends On**: Phase 3 complete

### Phase 4a: Provider CRUD Functions (2h) ✅ Complete

| Task | Description | Status |
|------|-------------|--------|
| **T068a** | Add `currentProject` state + `CharacterProject` type | ✅ |
| **T068b** | Add `saveStatus` state | ✅ |
| **T068c** | Implement `createProject(name, description)` | ✅ |
| **T068d** | Implement `loadProject(projectId)` | ✅ |
| **T068e** | Implement `deleteProject(projectId)` | ✅ |
| **T068f** | Implement `listProjects()` | ✅ |
| **T068g** | Implement `saveProject()` (manual) | ✅ |

### Phase 4b: Character Roster Drawer UI (3h) ✅ Complete

| Task | Description | Status |
|------|-------------|--------|
| **T072a** | Create `CharacterProjectSummary` type | ✅ |
| **T072b** | Create `PlayerCharacterRosterDrawer.tsx` | ✅ |
| **T072c** | Create `CharacterRoster.tsx` with character cards | ✅ |
| **T072d** | Add class icons (🗡️ Fighter, 🔮 Wizard, etc.) | ✅ |
| **T072e** | Wire "Create New Character" → reset + wizard | ✅ |
| **T072f** | Add roster button to UnifiedHeader | ✅ |

### Phase 4c: Firestore Cloud Sync (2h) ✅ Complete

| Task | Description | Status |
|------|-------------|--------|
| **T070a** | Debounced Firestore save useEffect (2s) | ✅ |
| **T070b** | Content hash deduplication | ✅ |
| **T070c** | Backend: `POST /api/playercharactergenerator/save-project` | ✅ |
| **T070d** | Backend: `GET /api/playercharactergenerator/list-projects` | ✅ |
| **T070e** | Backend: `DELETE /api/playercharactergenerator/delete-project` | ✅ |

**Additional Fix (Option 1 - Standard):**
- ✅ Added `clearCurrentProject()` for explicit project management
- ✅ Added `isUnsavedNewCharacter` derived state
- ✅ Gated auto-save on `currentProject?.id` existence
- ✅ Fixed "New Character" flow to prevent overwrites

### Phase 4d: Polish & Testing (1h) ✅ Complete

| Task | Description | Status |
|------|-------------|--------|
| **T074a** | Test: Create → save → reload → verify | ✅ |
| **T074b** | Test: Switch characters → verify state | ✅ |
| **T074c** | Test: Delete character → verify removal | ✅ |
| **T074d** | Test: Anon user → localStorage only | ✅ |
| **T074e** | Mobile: Roster drawer on mobile | ✅ |

### Backlog: UnifiedHeader Drawer Behavior (Standard Pattern)

| Task | Description | Status |
|------|-------------|--------|
| **T074f** | **Drawer toggle:** Clicking a nav button toggles its drawer (open→close, close→open) | ⬜ Backlog |
| **T074g** | **Drawer exclusion:** Opening one drawer auto-closes any other open drawer | ⬜ Backlog |

**Standard behavior:** All drawers connected to UnifiedHeader should follow this pattern:
- Click Projects button → opens Projects drawer (if closed) OR closes it (if open)
- Click Generation button → opens Generation drawer (if closed) OR closes it (if open)
- Opening Projects while Generation is open → closes Generation, opens Projects

### Already Complete
- [x] T069 [US4] localStorage auto-save ✅ (2025-12-09)
- [x] T073 [US4] Provider persistence wiring ✅ (2025-12-09)

---

## Phase 5: US2 - AI-Assisted Character Generation (P2)

**Goal**: Generate complete character from text prompt  
**Independent Test**: Enter concept → receive valid, editable character  
**Depends On**: Phase 4 complete

### Phase 5.0: Prompt Evaluation + Backend Rule Engine (RESEARCH - BLOCKING) ✅ COMPLETE (v1)

**Goal:** Empirically validate the **preferences-not-mechanics** approach while hardening an **authoritative backend Rule Engine** for PCG.  
**Handoff (canonical):** `specs/PlayerCharacterGenerator/HANDOFF-AI-Generation-Prompt-Evaluation.md`

| Task | Description | Status |
|------|-------------|--------|
| **T075a** | Build AI preference harness (types, prompt builder, translator, CLI demo) | ✅ |
| **T075b** | Backend endpoints: `/generate-preferences`, `/constraints`, `/validate` | ✅ |
| **T075c** | Run live samples + capture cost/latency (avg + p50/p95) | ✅ |
| **T075d** | Add concurrency + targeted reruns (`--classes/--levels/...`) + dev log saving + full failure dumps | ✅ |
| **T075e** | Update handoff with evidence + next steps (E3/E4) | ✅ |
| **T075f** | Decide near-term architecture constraints (stay on chat.completions; defer Responses API) | ✅ |
| **T075g** | E3: `/compute` endpoint + derived stats compute | ✅ |
| **T075h** | E4: spell constraints + spell validation (standard path) | ✅ |
| **T075i** | Hard casters: warlock (pact metadata + `/compute` spellSlots section), paladin/ranger (half-caster rules) | ✅ |
| **T075j** | Expand spell catalogs v0→v1 + add harness spell theme mismatch metrics | ✅ |
| **T075k** | Add explicit concurrency logging (worker START/END, `inFlight=X/N`, `maxInFlightObserved`) | ✅ |

**Notes:**
- Spell constraints/validation are now implemented (E4), including warlock/paladin/ranger.
- Timing data is available for UX loading bars (p50/p95) and per-stage breakdown.
- **Deployment gotcha**: a stale backend can serve old spell catalogs. Always confirm via `POST /constraints` before spending tokens on large runs.

**Success Criteria:**
- >90% JSON parse rate
- >80% RuleEngine validation rate
- Clear failure patterns documented

**Estimated Time:** 4-6 hours

---

### Phase 5.1: Generation Infrastructure (After Evaluation) 🔜 ACTIVE

**Handoff:** `specs/PlayerCharacterGenerator/HANDOFF-Phase51-Generation-Infrastructure.md`

**Goal:** Create unified `/generate` endpoint that returns complete character from concept.

#### T076: Port Translator to Backend (4h)

| Task | Description | Status |
|------|-------------|--------|
| **T076a** | Create `translator.py` with main function signature | ✅ Complete |
| **T076b** | Port `translateAbilityPriorities()` | ✅ Complete |
| **T076c** | Port `translateSkillThemes()` | ✅ Complete |
| **T076d** | Port `translateEquipmentStyle()` | ✅ Complete |
| **T076e** | Port `translateFeatureChoices()` | ✅ Complete |
| **T076f** | Port `translateSpellThemes()` | ✅ Complete |
| **T076g** | Add unit tests for translator | ✅ Complete (`DungeonMindServer/playercharactergenerator/tests/test_translator.py`) |

#### T077: Create Character Builder (2h)

| Task | Description | Status |
|------|-------------|--------|
| **T077a** | Create `character_builder.py` with main function | ✅ Complete |
| **T077b** | Implement `build_features_list()` | ✅ Complete (minimal v0: fighting style promoted into class features; full SRD features deferred) |
| **T077c** | Implement `build_equipment_list()` | ✅ Complete (minimal v0: infers armor/shield from equipment package item IDs) |
| **T077d** | Implement `build_spells_list()` | ✅ Complete (maps selected IDs to spell dicts using constraint-provided spell entries) |

#### T079: Unified Generate Endpoint (2h)

| Task | Description | Status |
|------|-------------|--------|
| **T079a** | Add Pydantic models for request/response | ✅ Complete (request reuses `GenerationInput`; response is JSON dict payload) |
| **T079b** | Implement `/generate` endpoint | ✅ Complete (`DungeonMindServer/routers/playercharactergenerator_router.py`) |
| **T079c** | Wire into existing infrastructure | ✅ Complete (constraints → generate-preferences → translate → validate → compute → build character) |
| **T079d** | End-to-end test via CLI | ⏳ Pending (requires a running server; unit tests cover translator + validate + compute) |

#### T078: Rate Limiting (Deferred to Phase 5.3)

| Task | Description | Status |
|------|-------------|--------|
| **T078** | Add rate limiting (5 anon, unlimited logged-in) | ⏳ Deferred |

**Estimated Time:** 8 hours total

### Phase 5.2: Generation UI ✅ Complete (2025-12-14)

**Handoff:** `specs/PlayerCharacterGenerator/HANDOFF-Phase52-Generation-UI.md`

**Goal:** Create "Generate" tab for AI-powered character creation from concept.

#### T080: Create AIGenerationTab.tsx (3h)

| Task | Description | Status |
|------|-------------|--------|
| **T080a** | Create component skeleton with form layout | ✅ Complete (`creationDrawerComponents/AIGenerationTab.tsx`) |
| **T080b** | Add concept textarea with validation (min 10 chars) | ✅ Complete |
| **T080c** | Add Class/Level selects (required, with asterisk) | ✅ Complete |
| **T080d** | Add Race/Background selects (optional, "Random" default) | ✅ Complete (filtered to backend PCG v0 IDs) |
| **T080e** | Style required vs optional sections with dividers | ✅ Complete |
| **T080f** | Add loading state with progress simulation | ✅ Complete |
| **T080g** | Add error handling and display | ✅ Complete |

#### T081: Wire Form to API (1h)

| Task | Description | Status |
|------|-------------|--------|
| **T081a** | Implement `handleGenerate()` with fetch to `/generate` | ✅ Complete |
| **T081b** | Handle random race/background when not selected | ✅ Complete |
| **T081c** | End-to-end test with live API | ⏳ Pending (requires running frontend + backend) |

#### T082: Integrate with Provider (1h)

| Task | Description | Status |
|------|-------------|--------|
| **T082a** | Add `setCharacter()` to Provider for hydration | ✅ N/A (already present in Provider) |
| **T082b** | Auto-switch to Build tab (step 7: Review) after generation | ✅ Complete (`PlayerCharacterCreationDrawer.tsx`) |
| **T082c** | Add success toast notification | ✅ Complete (local drawer toast) |

#### T083: Add Generate Tab to Drawer (30m)

| Task | Description | Status |
|------|-------------|--------|
| **T083a** | Add third tab to PlayerCharacterCreationDrawer | ✅ Complete |
| **T083b** | Reorder tabs: Generate → Build → Portrait | ✅ Complete |

**Estimated Time:** 5-6 hours total

### Already Complete
- [x] T074 Router created for save/load (reuse for generate endpoint) ✅ (2025-12-11)

---

## Phase 6: US3 - Character Portrait Generation (P3)

**Goal**: Generate character portrait using Stable Diffusion  
**Independent Test**: Generate portrait → see it on character sheet  
**Depends On**: Phase 5 complete (uses same AI infrastructure)  
**Handoff:** `specs/PlayerCharacterGenerator/HANDOFF-US3-Portrait-Generation-OptionB.md`

### Phase 1 — Render Plumbing

| Task | Description | Status |
|------|-------------|--------|
| **US3-01a** | Wire `portraitUrl={character.portrait}` in `CharacterCanvas.tsx` | ✅ |
| **US3-01b** | Wire `portraitUrl={character.portrait}` in `MobileCharacterCanvas.tsx` | ✅ |

### Phase 2 — Data Schema

| Task | Description | Status |
|------|-------------|--------|
| **US3-02a** | Extend `Character` type with gallery fields | ✅ |
| **US3-02b** | Verify `createEmptyCharacter()` tests pass | ✅ |

### Phase 3 — Portrait Tab

| Task | Description | Status |
|------|-------------|--------|
| **US3-03a** | Create `PortraitGenerationTab.tsx` | ✅ |
| **US3-03b** | Replace placeholder in drawer | ✅ |
| **US3-03c** | Wire to provider | ✅ |

### Phase 4 — Generation Flow

| Task | Description | Status |
|------|-------------|--------|
| **US3-04a** | Copy generate flow from `ImageGenerationTab.tsx` | ✅ |
| **US3-04b** | Store results in `portraitGallery` | ✅ |
| **US3-04c** | Set active portrait on selection | ✅ |

### Phase 5 — Delightful Extras

| Task | Description | Status |
|------|-------------|--------|
| **US3-05a** | Locks UI (soft locks in prompt) | ✅ |
| **US3-05b** | Recipe panel + copy prompt | ✅ |

### Phase 6 — Upload + Save Trigger + Layer Fix (Discovered During Implementation)

| Task | Description | Status |
|------|-------------|--------|
| **US3-06a** | Add drag/drop + browse upload (local-first) and store into `portrait` + `portraitGallery` | ✅ |
| **US3-06b** | Ensure cloud autosave triggers on portrait changes when signed in (hash includes portrait fingerprints/counts) | ✅ |
| **US3-06c** | Fix portrait invisibility by overriding global `.page img { z-index: -1; }` for portrait images | ✅ |

### Non-critical polish (optional)

| Task | Description | Status |
|------|-------------|--------|
| **US3-P1** | Increase rendered portrait size on the character sheet header (desktop + mobile) while preserving layout | ⬜ |

---

## Phase 7: US6 - PDF Export ✅ COMPLETE

**Goal**: Export character sheet as PDF  
**Independent Test**: Export completed character → verify PDF renders all 4 pages  
**Depends On**: Phase 3 complete (Canvas must work)  
**Pattern Source**: StatblockGenerator PDF export  
**Handoff:** `specs/PlayerCharacterGenerator/HANDOFF-US6-PDF-Export.md`  
**Status:** ✅ **COMPLETE** (December 14, 2025)

### Current Approach (Native Browser Print → Save as PDF)

We export via the browser print dialog (`window.print()`), not a jsPDF pipeline.

**Why**: The PCG sheet is already “real DOM pages” (`.page.phb.character-sheet`). Native print preserves
fonts/backgrounds best and avoids re-rendering a complex layout into canvas images.

### Print Debug Playbook (One-shot next time)

When print output is wrong (blank pages, shifted layout, missing backgrounds), do **evidence-first**:

1. **Capture snapshot**: Use **Dev Tools → Capture Print Snapshot (HTML)** to download a snapshot of the exact DOM/CSS state.
2. **Verify page nodes**: Confirm the snapshot contains:
   - `.character-sheet-container`
   - children like `.page.phb.character-sheet` (one per printed page)
3. **Kill viewport sizing**: If you see `min-height: calc(... 100vh ...)`, large fixed `height`, or `padding: 24px`
   on `.generator-canvas-container` / intermediate wrappers, neutralize those in `@media print`.
4. **Avoid flex pagination quirks**: If `.character-sheet-container` is `display: flex` with `gap`, set it to
   `display: block` for print to prevent phantom pages.
   - **Important**: If there are existing screen rules using `!important` with *more specific selectors*
     (e.g. `.character-canvas-renderer .character-sheet-container { gap: 32px !important; }`), your print override
     must be **at least as specific** (or more specific) to win in Firefox.
5. **Eliminate leading blank pages**: If Firefox prints a blank first page, it’s often because the app uses a
   visibility contract (`visibility: hidden`) that leaves hidden UI in-flow. In PCG, fix by forcing:
   - `.generator-layout > * { display: none }` and then re-enabling
   - `.generator-layout > .generator-canvas-container { display: block }`
5. **Break rules**: Prefer `break-before: page` on non-first pages over `page-break-after` on all-but-last; avoid
   adding pseudo-element “demarkers” unless proven necessary (they have caused blank pages in the past).

### Known Pitfalls (Root Causes we’ve hit)

- **Viewport-dependent container sizing**: `min-height: calc(... + 100vh)` and large computed heights can create extra blank pages in print.
- **Flex + gap in print**: `display:flex` + `gap` can paginate unpredictably across browsers.
- **Over-aggressive print overrides**: forcing `position:absolute`, hard `width: 8in`, or hiding everything via `visibility` can break the PHB layout (headers not stretching, left-shifts).

### Pattern Reuse from StatblockGenerator

The StatblockGenerator already has working PDF export. Key files to reference:

| Pattern | Source File | Notes |
|---------|-------------|-------|
| PDF generation | `StatBlockGenerator/utils/pdfExport.ts` | Uses html2canvas + jsPDF |
| Export button | `StatBlockGenerator/components/ExportButton.tsx` | UI pattern |
| Multi-page handling | `StatBlockGenerator/utils/pdfExport.ts` | Iterates through pages |

### Tasks

| Task | Description | Status |
|------|-------------|--------|
| **T110** | Review StatblockGenerator print contract (`canvas-print.css`) | ✅ |
| **T111** | Add "Print / Save PDF" action (native browser print) | ✅ |
| **T112** | Add Dev Tool: "Capture Print Snapshot (HTML)" for evidence-driven debugging | ✅ |
| **T113** | Print CSS: neutralize viewport sizing + avoid flex pagination quirks | ✅ |
| **T114** | Test: Print → verify exactly 4 pages (no blanks, correct alignment, backgrounds) | ✅ |

---

## Phase 8: Deploy & Verify

**Goal**: Deploy PCG to production and verify it works end-to-end  
**Independent Test**: Create character on deployed site → save → reload → verify persistence  
**Depends On**: Phase 7 (PDF Export) complete

| Task | Description | Status |
|------|-------------|--------|
| **T115** | Merge all PCG changes to main branch | ⬜ |
| **T116** | Deploy to production environment | ⬜ |
| **T117** | Smoke test: Create character via wizard → verify sheet renders | ⬜ |
| **T118** | Smoke test: AI generation → verify character hydrates | ⬜ |
| **T119** | Smoke test: Portrait generation/upload → verify on sheet | ⬜ |
| **T120** | Smoke test: Save/Load (logged in) → verify persistence | ⬜ |
| **T121** | Smoke test: PDF export → verify all 4 pages | ⬜ |
| **T122** | Smoke test: Mobile viewport → verify responsive layout | ⬜ |
| **T123** | Fix any deploy-specific issues discovered | ⬜ |

---

## Phase 9: Reflection & Learnings

**Goal**: Capture what worked, what patterns emerged, and how to improve future projects  
**Depends On**: Phase 8 complete (deploy verified)

| Task | Description | Status |
|------|-------------|--------|
| **T124** | Review all handoffs created during PCG development | ⬜ |
| **T125** | Identify successful development patterns (handoff structure, phasing, etc.) | ⬜ |
| **T126** | Identify new patterns discovered during implementation | ⬜ |
| **T127** | Evaluate: What context in `.cursorrules` was essential vs noise? | ⬜ |
| **T128** | Compile critical learnings into `Docs/Learnings/LEARNINGS-PCG-December-2025.md` | ⬜ |
| **T129** | Propose updates to `development.mdc` and `engineering-principles.mdc` | ⬜ |
| **T130** | Archive completed handoffs to `specs/PlayerCharacterGenerator/archive/` | ⬜ |

### Reflection Questions

**Development Workflow:**
- Which handoff format was most effective? (treasure map vs task list vs research doc)
- How well did the phased approach work? Were phases the right size?
- What was the ratio of design time to implementation time?

**Context Management:**
- What rules were always helpful? What was rarely referenced?
- How can we minimize context while maintaining quality?
- Which patterns from StatblockGenerator transferred directly?

**Technical Patterns:**
- What React patterns emerged (useRef guards, portal z-index, etc.)?
- What CSS patterns emerged (z-index layers, PHB overrides)?
- What backend patterns emerged (constraints/validate/compute triad)?

**Meta-Project Potential:**
This reflection phase could seed a larger meta-project: "How to structure AI-assisted development for complex features." Consider capturing:
- Prompt construction patterns for LLM-generated code
- Handoff templates that maximize one-shot success
- Rules file organization that scales

---

## 📦 Backlog: Post-V1 Features

### US5 - Character Leveling

**Goal**: Level characters from 1→2→3  
**Independent Test**: Level 1 character → level up → verify HP, features, subclass  
**Depends On**: Phase 3 complete

**Note**: Level 1 subclasses (Cleric, Sorcerer, Warlock) are handled in Phase 3.
This phase handles:
- Level 2 subclass: Wizard (School of Evocation)
- Level 3 subclasses: Barbarian (Berserker), Bard (Lore), Druid (Land), Fighter (Champion), Monk (Open Hand), Paladin (Devotion), Ranger (Hunter), Rogue (Thief)

| Task | Description | Status |
|------|-------------|--------|
| **US5-01** | Create `levelUp.ts` with HP calculation, feature lookup | ⬜ Backlog |
| **US5-02** | Add level 2-3 SRD subclasses to `subclasses.ts` | ⬜ Backlog |
| **T084** | Implement `calculateLevelUpHP()` in `DnD5eRuleEngine.ts` | ⬜ Backlog |
| **T085** | Create `LevelUpWizard.tsx` | ⬜ Backlog |

### Polish & Cross-Cutting Concerns

**Goal**: Final integration and cleanup

| Task | Description | Status |
|------|-------------|--------|
| **T089** | Verify all success criteria (SC-001 through SC-010) pass | ⬜ Backlog |
| **T090** | Run full test suite and verify >80% coverage on engine/validation | ⬜ Backlog |
| **T091** | Performance audit: Canvas renders <500ms, auto-save <2s | ⬜ Backlog |
| **T092** | Refactor `DnD5eRuleEngine.ts` into smaller modules | ⬜ Backlog |

### Edit Mode Enhancements

| Task | Description | Status |
|------|-------------|--------|
| **Phase 3.8b** | Editable Spell Modal (add/edit/remove spells) | ⬜ Backlog |
| **Phase 3.8c** | Unified Equipment Model (single source of truth) | ⬜ Backlog |
| **Phase 3.9** | Homebrew Mode (bypass SRD restrictions) | ⬜ Backlog |

---

## 📊 V1 Launch Dependency Chain

```
Phase 2 (Foundational) ───────────────────────────────┐
         │                                            │
         ▼                                            │
Phase 3 (Manual Creation + Canvas) ───────────────────┤
         │                                            │
         ▼                                            │
Phase 3.6-3.8 (Edit Mode + Equipment Modal) ──────────┤
         │                                            │
         ├────────────────────────────────────────────┤
         ▼                                            │
Phase 4 (Save/Load) ──────────────────────────────────┤
         │                                            │
         ▼                                            │
Phase 5.0-5.2 (AI Generation) ────────────────────────┤
         │                                            │
         ▼                                            │
Phase 6 (Portrait) ✅ ────────────────────────────────┘
         │
         ▼
Phase 7 (PDF Export) ✅
         │
         ▼
Phase 8 (Deploy & Verify) ← YOU ARE HERE 🔜
         │
         ▼
Phase 9 (Reflection & Learnings)
         │
         ▼
    ✅ V1 COMPLETE
         │
         │ (future)
         ▼
    📦 BACKLOG (US5 Leveling, JSON Export, Spell Modal, Homebrew, Polish)
```

**Key Change:** Edit Mode (Phase 3.7-3.9) is now on the critical path before AI Generation. This ensures:
1. Manual character creation is fully exercised before automation
2. Generated characters can be immediately edited
3. Homebrew content system is available for AI-generated characters


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
8. **Sprint 8**: Phase 3.5b (Wizard Polish & Integration) - 14-16h ✅ **COMPLETE**
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
**Updated**: December 11, 2025 (Phase 4 Save/Load complete)  
**Next**: Phase 3.8b (Editable Spell Modal) → Phase 5 (AI Generation)

