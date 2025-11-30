# Tasks: PlayerCharacterGenerator

**Generated**: November 30, 2025  
**Source**: spec.md + plan.md  
**Total Tasks**: 67  
**Estimated Hours**: 92-130h

---

## 📋 Task Summary

| Phase | Description | Tasks | Est. Hours |
|-------|-------------|-------|------------|
| **Phase 1** | Setup | 3 | 1h |
| **Phase 2** | Foundational (Rule Engine) | 10 | 4-6h |
| **Phase 3** | US1 - Manual Character Creation | 38 | 58-82h |
| **Phase 4** | US4 - Save and Load | 6 | 6-8h |
| **Phase 5** | US2 - AI Generation | 6 | 12-16h |
| **Phase 6** | US3 - Portrait Generation | 2 | 4-6h |
| **Phase 7** | US5 - Character Leveling | 4 | 8-10h |
| **Phase 8** | US6 - Export | 3 | 4-6h |
| **Phase 9** | Polish | 3 | 2-4h |

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

### 3.1 SRD Race Data
We can mine this https://github.com/foundryvtt/dnd5e/tree/5.2.x/packs/_source

- [ ] T014 [P] [US1] Add Mountain Dwarf subrace in `src/components/PlayerCharacterGenerator/data/dnd5e/races.ts`
- [ ] T015 [P] [US1] Add High Elf and Wood Elf subraces in `data/dnd5e/races.ts`
- [ ] T016 [P] [US1] Add Lightfoot and Stout Halfling subraces in `data/dnd5e/races.ts`
- [ ] T017 [P] [US1] Add Human race (no subrace) in `data/dnd5e/races.ts`
- [ ] T018 [P] [US1] Add Dragonborn race with ancestry choice in `data/dnd5e/races.ts`
- [ ] T019 [P] [US1] Add Forest and Rock Gnome subraces in `data/dnd5e/races.ts`
- [ ] T020 [P] [US1] Add Half-Elf race (+2 CHA, +1 to two others) in `data/dnd5e/races.ts`
- [ ] T021 [P] [US1] Add Half-Orc race in `data/dnd5e/races.ts`
- [ ] T022 [P] [US1] Add Tiefling race in `data/dnd5e/races.ts`
- [ ] T023 [US1] Create race data tests in `src/components/PlayerCharacterGenerator/__tests__/data/dnd5e/races.test.ts`
- [ ] T024 [US1] Implement `getAvailableRaces()` in `DnD5eRuleEngine.ts`
- [ ] T025 [US1] Implement `getSubraces(baseRaceId)` in `DnD5eRuleEngine.ts`
- [ ] T026 [US1] Implement `applyRacialBonuses()` in `DnD5eRuleEngine.ts`

### 3.2 SRD Class Data

- [ ] T027 [P] [US1] Create `classes.ts` with Barbarian, Fighter, Monk, Rogue in `src/components/PlayerCharacterGenerator/data/dnd5e/classes.ts`
- [ ] T028 [P] [US1] Add Bard, Cleric, Druid classes to `data/dnd5e/classes.ts`
- [ ] T029 [P] [US1] Add Paladin, Ranger classes to `data/dnd5e/classes.ts`
- [ ] T030 [P] [US1] Add Sorcerer, Warlock, Wizard classes to `data/dnd5e/classes.ts`
- [ ] T031 [US1] Create `classFeatures.ts` with level 1-3 features in `src/components/PlayerCharacterGenerator/data/dnd5e/classFeatures.ts`
- [ ] T032 [US1] Create class data tests in `src/components/PlayerCharacterGenerator/__tests__/data/dnd5e/classes.test.ts`
- [ ] T033 [US1] Implement `getAvailableClasses()` in `DnD5eRuleEngine.ts`
- [ ] T034 [US1] Implement `getValidSkillChoices(character)` in `DnD5eRuleEngine.ts`
- [ ] T035 [US1] Implement `getEquipmentChoices(classId)` in `DnD5eRuleEngine.ts`

### 3.3 SRD Background Data

- [ ] T036 [US1] Create `backgrounds.ts` with 6 SRD backgrounds in `src/components/PlayerCharacterGenerator/data/dnd5e/backgrounds.ts`
- [ ] T037 [US1] Implement `getAvailableBackgrounds()` in `DnD5eRuleEngine.ts`

### 3.4 Validation Implementation

- [ ] T038 [US1] Create `validateAbilityScores.ts` in `src/components/PlayerCharacterGenerator/engine/dnd5e/validators/validateAbilityScores.ts`
- [ ] T039 [US1] Create `validateRace.ts` in `engine/dnd5e/validators/validateRace.ts`
- [ ] T040 [US1] Create `validateClass.ts` in `engine/dnd5e/validators/validateClass.ts`
- [ ] T041 [US1] Create `validateBackground.ts` in `engine/dnd5e/validators/validateBackground.ts`
- [ ] T042 [US1] Create `validateEquipment.ts` in `engine/dnd5e/validators/validateEquipment.ts`
- [ ] T043 [US1] Implement `validateStep()` in `DnD5eRuleEngine.ts` using validators
- [ ] T044 [US1] Implement `validateCharacter()` in `DnD5eRuleEngine.ts`
- [ ] T045 [US1] Implement `isCharacterComplete()` in `DnD5eRuleEngine.ts`
- [ ] T046 [US1] Create validator tests in `__tests__/engine/dnd5e/validators/`

### 3.5 Wizard Steps UI

- [ ] T047 [US1] Create `RaceSelectionStep.tsx` in `src/components/PlayerCharacterGenerator/creationDrawerComponents/RaceSelectionStep.tsx`
- [ ] T048 [US1] Create `RaceCard.tsx` component in `src/components/PlayerCharacterGenerator/components/RaceCard.tsx`
- [ ] T049 [US1] Create `SubraceSelector.tsx` component in `src/components/PlayerCharacterGenerator/components/SubraceSelector.tsx`
- [ ] T050 [US1] Create `ClassSelectionStep.tsx` in `creationDrawerComponents/ClassSelectionStep.tsx`
- [ ] T051 [US1] Create `ClassCard.tsx` component in `components/ClassCard.tsx`
- [ ] T052 [US1] Create `SkillSelector.tsx` component in `components/SkillSelector.tsx`
- [ ] T053 [US1] Create `EquipmentChoiceSelector.tsx` component in `components/EquipmentChoiceSelector.tsx`
- [ ] T054 [US1] Create `BackgroundSelectionStep.tsx` in `creationDrawerComponents/BackgroundSelectionStep.tsx`
- [ ] T055 [US1] Create `BackgroundCard.tsx` component in `components/BackgroundCard.tsx`
- [ ] T056 [US1] Create `EquipmentStep.tsx` in `creationDrawerComponents/EquipmentStep.tsx`
- [ ] T057 [US1] Create `ReviewStep.tsx` in `creationDrawerComponents/ReviewStep.tsx`
- [ ] T058 [US1] Wire all steps into `CharacterCreationWizard.tsx`

### 3.6 Canvas Enhancement

- [ ] T059 [US1] Create `CharacterHeader.tsx` in `src/components/PlayerCharacterGenerator/canvasComponents/CharacterHeader.tsx`
- [ ] T060 [US1] Create `AbilityScoresBlock.tsx` in `canvasComponents/AbilityScoresBlock.tsx`
- [ ] T061 [US1] Create `CombatStatsBlock.tsx` in `canvasComponents/CombatStatsBlock.tsx`
- [ ] T062 [US1] Create `ProficienciesBlock.tsx` in `canvasComponents/ProficienciesBlock.tsx`
- [ ] T063 [US1] Create `FeaturesBlock.tsx` in `canvasComponents/FeaturesBlock.tsx`
- [ ] T064 [US1] Create `EquipmentBlock.tsx` in `canvasComponents/EquipmentBlock.tsx`
- [ ] T065 [US1] Create `componentRegistry.ts` in `canvasComponents/componentRegistry.ts`
- [ ] T066 [US1] Implement `calculateDerivedStats()` in `DnD5eRuleEngine.ts`
- [ ] T067 [US1] Update `CharacterCanvas.tsx` to use component registry in `shared/CharacterCanvas.tsx`

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
**Depends On**: Phase 3 complete

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

- [ ] T082 [US5] Create `levelUp.ts` with HP calculation, feature lookup in `src/components/PlayerCharacterGenerator/engine/dnd5e/levelUp.ts`
- [ ] T083 [US5] Create `subclasses.ts` with SRD subclasses in `src/components/PlayerCharacterGenerator/data/dnd5e/subclasses.ts`
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

---

## 📊 Dependencies

```
Phase 2 (Foundational) ──────────────────────────────────┐
         │                                               │
         ▼                                               │
Phase 3 (US1: Manual Creation) ──────────────────────────┤
         │                                               │
         ├──────────────────┬───────────────┬───────────┤
         ▼                  ▼               ▼           │
Phase 4 (US4: Save/Load)  Phase 7 (US5)   Phase 8 (US6)│
         │                                              │
         ▼                                              │
Phase 5 (US2: AI Generation) ───────────────────────────┤
         │                                              │
         ▼                                              │
Phase 6 (US3: Portrait) ────────────────────────────────┘
                                                        │
                                                        ▼
                                               Phase 9 (Polish)
```

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
**Phase 1 + Phase 2 + Phase 3 (US1 only)**
- Delivers: Complete manual character creation
- Excludes: AI, portraits, save/load, leveling, export
- Estimated: 63-89 hours
- Value: Core product works end-to-end

### Incremental Delivery
1. **Sprint 1**: Phase 1-2 (Foundation + Rule Engine) - 5-7h
2. **Sprint 2**: Phase 3.1-3.3 (Data: Races, Classes, Backgrounds) - 16-24h
3. **Sprint 3**: Phase 3.4 (Validation) - 6-8h
4. **Sprint 4**: Phase 3.5 (Wizard UI) - 20-28h
5. **Sprint 5**: Phase 3.6 (Canvas) - 8-12h
6. **Sprint 6**: Phase 4-5 (Save/Load + AI) - 18-24h
7. **Sprint 7**: Phase 6-8 (Portrait, Leveling, Export) - 16-22h
8. **Sprint 8**: Phase 9 (Polish) - 2-4h

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
| **Total Tasks** | 91 |
| **Setup Tasks** | 3 |
| **Foundational Tasks** | 10 |
| **US1 Tasks** | 54 |
| **US2 Tasks** | 6 |
| **US3 Tasks** | 2 |
| **US4 Tasks** | 6 |
| **US5 Tasks** | 4 |
| **US6 Tasks** | 3 |
| **Polish Tasks** | 3 |
| **Parallel Opportunities** | 25+ tasks |
| **MVP Tasks** | 67 (Phase 1-3) |

---

**Generated by speckit.tasks workflow**  
**Ready for implementation**

