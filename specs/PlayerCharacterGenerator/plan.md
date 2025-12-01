# Technical Plan: PlayerCharacterGenerator

**Created**: November 30, 2025  
**Status**: Ready for Implementation  
**Branch**: `PlayerCharacterGenerator`  
**Based On**: spec.md + existing foundation analysis  
**Constitution Version**: 1.0.0

---

## ⚖️ Constitution Compliance

### Principle Alignment

| Principle | Compliance | Notes |
|-----------|------------|-------|
| **I. Empirical Verification** | ✅ | Tests required before each phase completion |
| **II. Documentation-First** | ✅ | This plan + spec created before implementation |
| **III. Test-First (TDD)** | ✅ | 77 existing tests, >80% coverage target |
| **IV. Service Boundaries** | ✅ | Rule Engine stays in LandingPage, API for backend |
| **V. Contract-Driven Design** | ✅ | RuleEngine interface defined in Phase 0 |
| **VI. Phased Implementation** | ✅ | 8 phases with 2-4h increments |
| **VII. Simplicity (YAGNI)** | ✅ | Build D&D 5e concrete first, extract later |

### Complexity Justification

**Rule Engine Interface (Phase 0):**
- **Justification**: Needed to decouple frontend from game rules
- **Why Now**: Interface-only, no premature abstraction
- **Extraction Point**: After D&D 5e proven, before adding second system

---

## 🎯 Key Architectural Decision: Rule Engine

### Decision
Build the D&D 5e Rule Engine **in-situ** within PlayerCharacterGenerator. Define the interface contract now, implement concretely for D&D 5e, extract to separate package when adding a second game system.

### Pattern
Same as Canvas extraction: **Build Concrete → Prove → Extract**

### Benefits
- Frontend doesn't know game rules (just calls engine)
- Same engine validates frontend and backend AI generation
- Clean extraction point when needed
- No premature abstraction risk

---

## 📜 Rule Engine Contract

### Interface Definition (Phase 0 Deliverable)

```typescript
// engine/RuleEngine.interface.ts

/**
 * Rule Engine Contract
 * 
 * Defines how the frontend interacts with game rules.
 * Implementations are system-specific (D&D 5e, Pathfinder, etc.)
 * 
 * CONSUMER (Frontend) provides: Character data, user choices
 * PROVIDER (Engine) returns: Validation results, available choices, derived stats
 */
export interface RuleEngine<TCharacter, TRace, TClass, TBackground> {
  // ===== IDENTITY =====
  readonly systemId: string;        // 'dnd5e', 'pf2e', 'custom'
  readonly systemName: string;      // 'D&D 5th Edition'
  readonly version: string;         // '1.0.0'

  // ===== VALIDATION =====
  
  /** Validate entire character, returns all errors/warnings */
  validateCharacter(character: TCharacter): ValidationResult;
  
  /** Validate a specific step */
  validateStep(character: TCharacter, step: CreationStep): ValidationResult;
  
  /** Check if character is complete and valid */
  isCharacterComplete(character: TCharacter): boolean;

  // ===== DATA PROVIDERS =====
  
  /** Get available races for this system */
  getAvailableRaces(): TRace[];
  
  /** Get available classes for this system */
  getAvailableClasses(): TClass[];
  
  /** Get available backgrounds for this system */
  getAvailableBackgrounds(): TBackground[];
  
  /** Get subraces for a given base race */
  getSubraces(baseRaceId: string): TRace[];

  // ===== CHOICE HELPERS =====
  
  /** Get valid skill choices based on class selection */
  getValidSkillChoices(character: TCharacter): SkillChoice;
  
  /** Get equipment choice groups for class */
  getEquipmentChoices(classId: string): EquipmentChoiceGroup[];
  
  /** Get spells available at character's level */
  getAvailableSpells(character: TCharacter, spellLevel: number): Spell[];
  
  /** Get subclasses for a given class (SRD subclasses only) */
  getAvailableSubclasses(classId: string): Subclass[];
  
  /** Get level at which class gains subclass (1, 2, or 3) */
  getSubclassLevel(classId: string): number;

  // ===== CALCULATIONS =====
  
  /** Calculate all derived stats (AC, HP, etc.) */
  calculateDerivedStats(character: TCharacter): DerivedStats;
  
  /** Apply racial bonuses to ability scores (handles both fixed and choice-based) */
  applyRacialBonuses(baseScores: AbilityScores, raceId: string, bonusChoices?: AbilityBonusChoice[]): AbilityScores;
  
  /** Calculate HP for level-up */
  calculateLevelUpHP(character: TCharacter, hitDieRoll: number): number;
  
  /** Get proficiency bonus for level */
  getProficiencyBonus(level: number): number;
  
  /** Get spellcasting info for character (null if non-caster) */
  getSpellcastingInfo(character: TCharacter): SpellcastingInfo | null;
  
  /** Check if race has flexible ability bonuses (e.g., Half-Elf) */
  hasFlexibleAbilityBonuses(raceId: string): boolean;
  
  /** Get flexible ability bonus options for a race */
  getFlexibleAbilityBonusOptions(raceId: string): FlexibleBonusConfig | null;
}

// ===== SUPPORTING TYPES =====

export type CreationStep = 
  | 'abilityScores' 
  | 'race' 
  | 'class' 
  | 'background' 
  | 'equipment' 
  | 'review';

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];      // MUST fix
  warnings: ValidationError[];    // SHOULD fix
  info: ValidationError[];        // FYI
}

export interface ValidationError {
  code: string;                   // 'SKILL_COUNT_INVALID'
  message: string;                // Human-readable message
  step: CreationStep;             // Which step to fix
  field?: string;                 // Specific field if applicable
  severity: 'error' | 'warning' | 'info';
}

export interface SkillChoice {
  count: number;                  // How many to choose
  options: string[];              // Available skill names
  selected: string[];             // Currently selected
}

export interface EquipmentChoiceGroup {
  id: string;
  description: string;            // "Choose one of the following"
  options: EquipmentOption[];
  selectedIndex?: number;
}

// ===== SPELLCASTING TYPES (NEW) =====

export interface SpellcastingInfo {
  ability: AbilityName;           // 'intelligence' | 'wisdom' | 'charisma'
  saveDC: number;                 // 8 + proficiency + ability mod
  attackBonus: number;            // proficiency + ability mod
  cantripsKnown: number;          // Number of cantrips known
  spellsKnown: number | null;     // null = prepared caster (Cleric, Druid, etc.)
  preparedSpellCount: number | null;  // null = known caster (Bard, Sorcerer, etc.)
  spellSlots: Record<number, number>; // spell level -> slots available
  ritualCasting: boolean;
  spellcastingFocus?: string;     // e.g., "arcane focus" or "holy symbol"
}

// ===== FLEXIBLE ABILITY BONUS TYPES (NEW) =====

export interface AbilityBonus {
  ability: AbilityName | 'choice';  // 'choice' = player picks
  bonus: number;
  isChoice: boolean;
  choiceCount?: number;             // e.g., 2 for Half-Elf's +1/+1
  excludeAbilities?: AbilityName[]; // Can't pick these (e.g., CHA for Half-Elf)
}

export interface AbilityBonusChoice {
  ability: AbilityName;
  bonus: number;
}

export interface FlexibleBonusConfig {
  choiceCount: number;              // How many abilities to choose
  bonusPerChoice: number;           // +1 per choice typically
  excludeAbilities: AbilityName[];  // Already has fixed bonus
  description: string;              // "Choose two abilities to increase by 1"
}

// ===== SUBCLASS TYPES (NEW) =====

export interface Subclass {
  id: string;
  name: string;
  classId: string;                  // Parent class
  description: string;
  features: SubclassFeature[];      // Level-gated features
  spells?: string[];                // Domain/Origin spells if applicable
}

export interface SubclassFeature {
  id: string;
  name: string;
  level: number;                    // Level gained
  description: string;
}
```

### D&D 5e Implementation

```typescript
// engine/DnD5eRuleEngine.ts

export class DnD5eRuleEngine implements RuleEngine<
  DnD5eCharacter,
  DnD5eRace,
  DnD5eClass,
  DnD5eBackground
> {
  readonly systemId = 'dnd5e';
  readonly systemName = 'D&D 5th Edition (SRD)';
  readonly version = '1.0.0';

  // Inject SRD data
  constructor(
    private races: DnD5eRace[],
    private classes: DnD5eClass[],
    private backgrounds: DnD5eBackground[],
    private spells: DnD5eSpell[]
  ) {}

  // ... implement all interface methods
}
```

---

## 📊 Foundation Assessment

### What's Already Built ✅

| Category | Files | Status | Test Coverage |
|----------|-------|--------|---------------|
| **Type System** | 12 files | ✅ Complete | ✅ Tested |
| **Point Buy Rules** | `pointBuy.ts` | ✅ Complete | ✅ 100% |
| **Standard Array** | `standardArray.ts` | ✅ Complete | ✅ 100% |
| **Dice Roller** | `diceRoller.ts` | ✅ Complete | ✅ 100% |
| **Racial Bonuses** | `racialBonuses.ts` | ✅ Complete | ✅ Tested |
| **Race Data** | `races.ts` | 🔄 Partial | 1/9 races |
| **Provider** | `PlayerCharacterGeneratorProvider.tsx` | ✅ Complete | - |
| **Main Component** | `PlayerCharacterGenerator.tsx` | ✅ Complete | - |
| **Creation Drawer** | `PlayerCharacterCreationDrawer.tsx` | ✅ Shell | - |
| **Step 1 UI** | `Step1AbilityScores.tsx` | ✅ Complete | ✅ Tested |
| **Canvas** | `CharacterCanvas.tsx` | 🔄 Basic | - |

### Existing Test Count: ~77 tests (all passing)

---

## 🏗️ Implementation Phases

### Phase 0: Rule Engine Interface (BLOCKING) - 4-6 hours

**Goal**: Define the RuleEngine contract and create D&D 5e implementation shell

**This phase MUST complete before other phases can start.**

#### 0.1 Interface Definition (2h)

**Files to Create**:
```
engine/
├── RuleEngine.interface.ts      # Generic interface
├── RuleEngine.types.ts          # Shared types (ValidationResult, etc.)
└── index.ts                     # Re-exports
```

**Deliverables**:
- [ ] `RuleEngine` interface with all methods defined
- [ ] Supporting types (ValidationResult, SkillChoice, etc.)
- [ ] JSDoc documentation for all methods
- [ ] Tests for type correctness

#### 0.2 D&D 5e Engine Shell (2-3h)

**Files to Create**:
```
engine/dnd5e/
├── DnD5eRuleEngine.ts           # Implementation class
├── DnD5eRuleEngine.test.ts      # Unit tests
└── index.ts                     # Re-exports
```

**Deliverables**:
- [ ] `DnD5eRuleEngine` class implementing interface
- [ ] All methods stubbed with TODO comments
- [ ] Basic tests for interface compliance
- [ ] Wired into Provider

#### 0.3 Provider Integration (1h)

**Files to Update**:
- `PlayerCharacterGeneratorProvider.tsx` - Add engine to context

**Context Shape**:
```typescript
interface PlayerCharacterGeneratorContextType {
  // Existing...
  character: Character | null;
  updateCharacter: (updates: Partial<Character>) => void;
  
  // NEW: Rule Engine
  ruleEngine: RuleEngine<DnD5eCharacter, DnD5eRace, DnD5eClass, DnD5eBackground>;
  
  // Engine-derived helpers
  validation: ValidationResult;
  availableRaces: DnD5eRace[];
  availableClasses: DnD5eClass[];
}
```

**Verification**:
- [ ] Engine accessible from any component via `usePlayerCharacterGenerator()`
- [ ] Validation runs on character changes
- [ ] All existing tests still pass

---

### Phase 1: Complete SRD Data (8-12 hours)

**Goal**: All 9 SRD races + 12 SRD classes fully defined
**Depends On**: Phase 0 complete

#### 1.1 Race Data Completion (4-6h) ✅ MOSTLY COMPLETE

**Files to Create/Update**:
- `data/dnd5e/races.ts` - All 13 SRD races/subraces ✅ DONE

**Races Added** (as of Phase 3.1 commit):
- ✅ Hill Dwarf, Mountain Dwarf
- ✅ High Elf, Wood Elf  
- ✅ Lightfoot Halfling, Stout Halfling
- ✅ Human
- ✅ Dragonborn (with 10 ancestry options)
- ✅ Forest Gnome, Rock Gnome
- ✅ Half-Elf (**flexible +1/+1 bonuses**)
- ✅ Half-Orc
- ✅ Tiefling

**Engine Integration** (remaining):
- [ ] Wire races into `DnD5eRuleEngine.getAvailableRaces()`
- [ ] Implement `getSubraces(baseRaceId)`
- [ ] Implement `applyRacialBonuses()` with flexible bonus support
- [ ] Implement `hasFlexibleAbilityBonuses(raceId)` for Half-Elf
- [ ] Implement `getFlexibleAbilityBonusOptions(raceId)`

**Test Coverage**:
- ✅ Each race has correct ability bonuses
- ✅ Each race has correct traits
- ✅ Subraces properly inherit from base race
- [ ] Flexible bonus validation (Half-Elf +1/+1 can't stack)
- [ ] Engine returns correct races

#### 1.2 Class Data Creation (12-16h) - EXPANDED

**Files to Create**:
- `data/dnd5e/classes.ts` - All 12 SRD classes
- `data/dnd5e/classFeatures.ts` - Level 1-3 features
- `data/dnd5e/subclasses.ts` - **Level 1 subclasses (CRITICAL)**
- `data/dnd5e/spells.ts` - Cantrips and level 1 spells for casters

**Classes to Define**:
```typescript
const SRD_CLASSES = [
  // Simple (no spells)
  'Barbarian',  // d12, STR/CON saves, Rage, Unarmored Defense
  'Fighter',    // d10, STR/CON saves, Fighting Style, Second Wind
  'Monk',       // d8, STR/DEX saves, Martial Arts, Unarmored Defense
  'Rogue',      // d8, DEX/INT saves, Sneak Attack, Expertise
  
  // Spellcasters
  'Bard',       // d8, DEX/CHA saves, Spellcasting, Bardic Inspiration
  'Cleric',     // d8, WIS/CHA saves, Spellcasting, Divine Domain (LEVEL 1 SUBCLASS!)
  'Druid',      // d8, INT/WIS saves, Spellcasting, Druidic
  'Paladin',    // d10, WIS/CHA saves, Divine Sense, Lay on Hands
  'Ranger',     // d10, STR/DEX saves, Favored Enemy, Natural Explorer
  'Sorcerer',   // d6, CON/CHA saves, Spellcasting, Sorcerous Origin (LEVEL 1 SUBCLASS!)
  'Warlock',    // d8, WIS/CHA saves, Pact Magic, Otherworldly Patron (LEVEL 1 SUBCLASS!)
  'Wizard',     // d6, INT/WIS saves, Spellcasting, Arcane Recovery
];
```

**CRITICAL: Level 1 Subclasses** (must be in Phase 1, NOT Phase 7):
```typescript
const LEVEL_1_SUBCLASSES = {
  cleric: ['Life Domain'],        // SRD only
  sorcerer: ['Draconic Bloodline'], // SRD only
  warlock: ['The Fiend'],         // SRD only
};
```

**Spellcasting Data**:
```typescript
// Per-class spellcasting info
interface ClassSpellcasting {
  ability: 'intelligence' | 'wisdom' | 'charisma';
  type: 'known' | 'prepared';     // Bard/Sorcerer = known, Cleric/Druid = prepared
  cantripsKnownByLevel: number[]; // Index by level
  spellsKnownByLevel?: number[];  // For 'known' casters
  ritualCasting: boolean;
}
```

**Engine Integration**:
- [ ] Wire classes into `DnD5eRuleEngine.getAvailableClasses()`
- [ ] Implement `getValidSkillChoices(character)`
- [ ] Implement `getEquipmentChoices(classId)`
- [ ] Implement `getAvailableSubclasses(classId)`
- [ ] Implement `getSubclassLevel(classId)` - returns 1 for Cleric/Sorcerer/Warlock, 2 for Wizard, 3 for others
- [ ] Implement `getSpellcastingInfo(character)` - returns cantrips, spells, slots, DC, attack bonus

**Test Coverage**:
- [ ] Each class has correct hit die
- [ ] Saving throws are correct (2 per class)
- [ ] Skill choices within limits
- [ ] Level 1 features present
- [ ] Engine returns correct skill options
- [ ] **Level 1 subclass required for Cleric/Sorcerer/Warlock**
- [ ] **Spellcasting stats calculated correctly**

---

### Phase 2: Validation Implementation (6-8 hours)

**Goal**: Full character validation through Rule Engine
**Depends On**: Phase 1 complete

#### 2.1 Step Validators (4-5h)

**Files to Create**:
```
engine/dnd5e/validators/
├── validateAbilityScores.ts
├── validateRace.ts
├── validateClass.ts
├── validateBackground.ts
├── validateEquipment.ts
└── index.ts
```

**Engine Methods to Implement**:
- [ ] `validateStep(character, 'abilityScores')` - Point buy/array/rolled valid
- [ ] `validateStep(character, 'race')` - Race + subrace selected
- [ ] `validateStep(character, 'class')` - Class + skills + equipment chosen
- [ ] `validateStep(character, 'background')` - Background + no duplicate skills
- [ ] `validateStep(character, 'equipment')` - All choices made
- [ ] `validateStep(character, 'review')` - All steps valid

#### 2.2 Full Character Validation (2-3h)

**Engine Methods to Implement**:
- [ ] `validateCharacter()` - Aggregates all step validations
- [ ] `isCharacterComplete()` - Returns true if all validations pass

**Test Coverage**:
- [ ] Invalid point buy caught
- [ ] Missing subrace caught
- [ ] Wrong skill count caught
- [ ] Duplicate skills caught
- [ ] Complete character passes

---

### Phase 3: Wizard Steps UI (24-30 hours)

**Goal**: Complete 6-step character creation wizard
**Depends On**: Phase 2 complete (validation works)

#### 3.1 Step 2: Race Selection (6-8h)

**Files to Create**:
- `creationDrawerComponents/RaceSelectionStep.tsx`
- `components/RaceCard.tsx`
- `components/SubraceSelector.tsx`

**Features**:
- Grid of race cards (from `ruleEngine.getAvailableRaces()`)
- Subrace dropdown (from `ruleEngine.getSubraces(baseRaceId)`)
- Racial trait preview
- Ability bonus preview (uses `ruleEngine.applyRacialBonuses()`)
- Validation display (from `ruleEngine.validateStep('race')`)

#### 3.2 Step 3: Class Selection (10-14h) - HIGHEST COMPLEXITY

**Files to Create**:
- `creationDrawerComponents/ClassSelectionStep.tsx`
- `components/ClassCard.tsx`
- `components/SkillSelector.tsx`
- `components/EquipmentChoiceSelector.tsx`

**Features**:
- Grid of class cards (from `ruleEngine.getAvailableClasses()`)
- Skill selector (from `ruleEngine.getValidSkillChoices()`)
- Equipment wizard (from `ruleEngine.getEquipmentChoices()`)
- Validation display (from `ruleEngine.validateStep('class')`)

#### 3.3 Step 4: Background Selection (6-8h)

**Files to Create**:
- `data/dnd5e/backgrounds.ts`
- `creationDrawerComponents/BackgroundSelectionStep.tsx`
- `components/BackgroundCard.tsx`

**SRD Backgrounds**:
```typescript
const SRD_BACKGROUNDS = [
  'Acolyte',      // Insight, Religion, 2 languages
  'Criminal',     // Deception, Stealth, gaming set, thieves' tools
  'Folk Hero',    // Animal Handling, Survival, artisan tools, vehicles (land)
  'Noble',        // History, Persuasion, gaming set, 1 language
  'Sage',         // Arcana, History, 2 languages
  'Soldier',      // Athletics, Intimidation, gaming set, vehicles (land)
];
```

**Engine Integration**:
- [ ] `ruleEngine.getAvailableBackgrounds()`
- [ ] Duplicate skill detection in validation

#### 3.4 Step 5: Equipment Finalization (6-8h)

**Files to Create**:
- `creationDrawerComponents/EquipmentStep.tsx`
- `components/EquipmentList.tsx`

**Features**:
- Review equipment from class + background
- Armor/weapon selection
- AC calculation (via `ruleEngine.calculateDerivedStats()`)

#### 3.5 Step 6: Review & Validation (4-6h)

**Files to Create**:
- `creationDrawerComponents/ReviewStep.tsx`

**Features**:
- Full character summary
- Validation from `ruleEngine.validateCharacter()`
- "Finalize Character" button (disabled unless `isCharacterComplete()`)

---

### Phase 4: Canvas Enhancement (8-12 hours)

**Goal**: Full character sheet display using Canvas
**Depends On**: Phase 3 complete

#### 4.1 Canvas Component Registry (4-6h)

**Files to Create**:
- `canvasComponents/CharacterHeader.tsx`
- `canvasComponents/AbilityScoresBlock.tsx`
- `canvasComponents/CombatStatsBlock.tsx`
- `canvasComponents/ProficienciesBlock.tsx`
- `canvasComponents/FeaturesBlock.tsx`
- `canvasComponents/EquipmentBlock.tsx`
- `canvasComponents/componentRegistry.ts`

#### 4.2 Live Preview Updates (4-6h)

**Features**:
- Canvas updates as wizard progresses
- Derived stats from `ruleEngine.calculateDerivedStats()`
- Multi-column layout (like PHB character sheet)

---

### Phase 5: Project Management (6-8 hours)

**Goal**: Save/load characters with auto-save
**Depends On**: Phase 4 complete

#### 5.1 Auto-Save Implementation (3-4h)

**Pattern**: Copy from StatblockGenerator

**Files to Create**:
- `hooks/useCharacterPersistence.ts`

#### 5.2 Projects Drawer (3-4h)

**Files to Create**:
- `PlayerCharacterProjectsDrawer.tsx`

---

### Phase 6: AI Generation (12-16 hours) - P2

**Goal**: Generate complete character from text prompt
**Depends On**: Phase 5 complete

#### 6.1 Backend Endpoint (6-8h)

**Critical**: Backend uses SAME Rule Engine for validation

**Files to Create** (in DungeonMindServer):
- `routers/playercharactergenerator_router.py`
- `services/character_generator.py`

**Endpoint**:
```python
POST /api/playercharactergenerator/generate
{
  "concept": "A grizzled dwarven fighter who survived the orc wars",
  "constraints": { "level": 1 }
}

Response:
{
  "character": { /* complete DnD5eCharacter */ },
  "validation": { "isValid": true, "errors": [] },
  "aiGenerated": true
}
```

**Backend Validation**:
- Port `DnD5eRuleEngine` to Python (or call TypeScript via subprocess)
- AI output MUST pass same validation as manual creation

#### 6.2 Frontend Integration (6-8h)

**Files to Create**:
- `creationDrawerComponents/AIGenerationStep.tsx`

---

### Phase 7: Leveling System (8-10 hours) - P3

**Goal**: Level characters from 1→2→3

**Note**: Level 1 subclasses (Cleric, Sorcerer, Warlock) are handled in Phase 1. This phase covers:
- Level 2 subclass: Wizard (School of Evocation - SRD)
- Level 3 subclasses: All other classes

#### 7.1 Level-Up Logic (4-5h)

**Files to Create**:
- `engine/dnd5e/levelUp.ts`

**Engine Methods**:
- [ ] `calculateLevelUpHP(character, hitDieRoll)`
- [ ] Get features for new level
- [ ] Subclass selection for Wizard (level 2), all others (level 3)

#### 7.2 Level 2-3 Subclass Data (4-5h)

**Files to Update**:
- `data/dnd5e/subclasses.ts` - Add remaining SRD subclasses

**SRD Subclasses by Level**:
```typescript
// Level 1 (done in Phase 1): Cleric (Life), Sorcerer (Draconic), Warlock (Fiend)
// Level 2: Wizard (Evocation)
// Level 3: Barbarian (Berserker), Bard (Lore), Druid (Land), 
//          Fighter (Champion), Monk (Open Hand), Paladin (Devotion),
//          Ranger (Hunter), Rogue (Thief)
```

---

### Phase 8: Export (4-6 hours) - P4

**Goal**: Export character as PDF and JSON

**Files to Create**:
- `utils/characterExport.ts`

---

## 📋 Updated Task Breakdown

### Phase 0 - Rule Engine (BLOCKING)

| Task | Est. Hours | Dependencies |
|------|------------|--------------|
| 0.1 Interface definition | 2h | None |
| 0.2 D&D 5e engine shell | 2-3h | 0.1 |
| 0.3 Provider integration | 1h | 0.2 |
| **Phase 0 Total** | **4-6h** | |

### P1 - Core Manual Creation

| Task | Est. Hours | Dependencies |
|------|------------|--------------|
| 1.1 Race data (13 races) | ✅ 4-6h | Phase 0 |
| 1.2 Class data (12 classes) | 12-16h | Phase 0 |
| 1.3 **Level 1 subclasses** (NEW) | 4-6h | 1.2 |
| 1.4 **Spellcasting data** (NEW) | 4-6h | 1.2 |
| 2.1 Step validators | 6-8h | 1.1, 1.2, 1.3, 1.4 |
| 2.2 Full validation | 2-3h | 2.1 |
| 3.1 Race selection UI (with flexible bonus selector) | 8-10h | 2.2 |
| 3.2 Class selection UI (with subclass for Cleric/Sorcerer/Warlock) | 12-16h | 2.2 |
| 3.3 Background data + UI | 6-8h | 2.2 |
| 3.4 Equipment step | 6-8h | 3.2 |
| 3.5 Review step | 4-6h | 3.1-3.4 |
| 4.1 Canvas components | 4-6h | 3.5 |
| 4.2 Live preview | 4-6h | 4.1 |
| **P1 Total** | **72-100h** | |

### P2 - Essential Features

| Task | Est. Hours | Dependencies |
|------|------------|--------------|
| 5.1 Auto-save | 3-4h | P1 |
| 5.2 Projects drawer | 3-4h | 5.1 |
| 6.1 AI backend | 6-8h | P1 |
| 6.2 AI frontend | 6-8h | 6.1 |
| **P2 Total** | **18-24h** | |

### P3 - Enhanced Features

| Task | Est. Hours | Dependencies |
|------|------------|--------------|
| 7.1 Level-up logic | 4-5h | P1 |
| 7.2 Subclass data | 4-5h | 7.1 |
| Portrait generation | 4-6h | P2 |
| **P3 Total** | **12-16h** | |

### P4 - Polish

| Task | Est. Hours | Dependencies |
|------|------------|--------------|
| Export (PDF/JSON) | 4-6h | P1 |
| **P4 Total** | **4-6h** | |

---

## 📁 Updated File Structure

```
src/components/PlayerCharacterGenerator/
├── PlayerCharacterGenerator.tsx
├── PlayerCharacterGeneratorProvider.tsx
├── PlayerCharacterCreationDrawer.tsx
├── PlayerCharacterProjectsDrawer.tsx
├── characterToolboxConfig.tsx
│
├── engine/                              # 🆕 RULE ENGINE
│   ├── RuleEngine.interface.ts          # Generic interface
│   ├── RuleEngine.types.ts              # Shared types
│   ├── index.ts
│   └── dnd5e/
│       ├── DnD5eRuleEngine.ts           # D&D 5e implementation
│       ├── DnD5eRuleEngine.test.ts
│       ├── validators/
│       │   ├── validateAbilityScores.ts
│       │   ├── validateRace.ts
│       │   ├── validateClass.ts
│       │   ├── validateBackground.ts
│       │   └── validateEquipment.ts
│       └── index.ts
│
├── types/
│   └── ... (existing)
│
├── data/
│   └── dnd5e/
│       ├── races.ts
│       ├── classes.ts
│       ├── backgrounds.ts
│       ├── subclasses.ts
│       ├── equipment.ts
│       └── spells.ts
│
├── rules/                               # Keep existing (used by engine)
│   └── dnd5e/
│       ├── pointBuy.ts                  ✅
│       ├── standardArray.ts             ✅
│       ├── diceRoller.ts                ✅
│       ├── racialBonuses.ts             ✅
│       ├── derivedStats.ts
│       └── levelUp.ts
│
├── components/
│   └── ... (existing + new UI pieces)
│
├── creationDrawerComponents/
│   └── ... (wizard steps)
│
├── canvasComponents/
│   └── ... (character sheet blocks)
│
├── shared/
│   └── CharacterCanvas.tsx
│
├── hooks/
│   └── useCharacterPersistence.ts
│
└── __tests__/
    ├── engine/                          # 🆕
    │   └── dnd5e/
    │       ├── DnD5eRuleEngine.test.ts
    │       └── validators/
    └── ... (existing)
```

---

## 🧪 Testing Strategy

### Test Pyramid

```
                /\
               /  \
              / E2E \ (5 tests)
             /______\
            /        \
           / Integr.  \ (25 tests)
          /____________\
         /              \
        / Engine Tests   \ (50+ tests)  🆕
       /________________\
      /                  \
     /    Unit Tests      \ (150+ tests)
    /______________________\
```

### Test Coverage Targets

| Module | Target | Current |
|--------|--------|---------|
| **Engine Interface** | 100% | ⏳ Phase 0 |
| **Engine Validators** | 95% | ⏳ Phase 2 |
| Rules (pointBuy, etc.) | 100% | ✅ ~100% |
| Types | 90% | ✅ ~90% |
| Data (races, classes) | 95% | 🔄 Partial |
| Components | 70% | 🔄 Partial |

---

## ✅ Definition of Done

### For Phase 0 (Rule Engine):
- [ ] `RuleEngine` interface fully defined with JSDoc
- [ ] `DnD5eRuleEngine` class created with all methods stubbed
- [ ] Engine wired into Provider context
- [ ] Basic tests for interface compliance
- [ ] All existing 77 tests still pass

### For MVP (P1 Complete):
- [ ] All 9 SRD races via `ruleEngine.getAvailableRaces()`
- [ ] All 12 SRD classes via `ruleEngine.getAvailableClasses()`
- [ ] All 6 SRD backgrounds via `ruleEngine.getAvailableBackgrounds()`
- [ ] Complete 6-step wizard using engine for validation
- [ ] `ruleEngine.validateCharacter()` catches all invalid builds
- [ ] Can create valid level 1 character in <10 minutes
- [ ] 200+ tests passing (50+ engine tests)
- [ ] >80% test coverage on engine/validation

### For Extraction (Future):
- [ ] Second game system requested
- [ ] Extract `RuleEngine` interface to shared package
- [ ] `DnD5eRuleEngine` becomes one implementation
- [ ] Frontend unchanged (just imports from different package)

---

## 🚀 Next Steps

1. **Immediate**: Phase 0 - Define RuleEngine interface (4-6h)
2. **Then**: Phase 1 - Complete race and class data (8-12h)
3. **Then**: Phase 2 - Implement validators in engine (6-8h)
4. **Then**: Phase 3 - Build wizard steps using engine

**Recommended First Session**: 
1. Create `engine/RuleEngine.interface.ts` with full interface
2. Create `engine/dnd5e/DnD5eRuleEngine.ts` shell
3. Wire into Provider
4. Run existing tests to verify nothing broke

---

## 📚 Research Notes

### Rule Engine Patterns Considered

| Pattern | Decision | Rationale |
|---------|----------|-----------|
| **JSON Rules** | ❌ Deferred | Less type-safe, wait for second system |
| **Backend Service** | ❌ Deferred | Adds latency, extract later if needed |
| **TypeScript Class** | ✅ Chosen | Type-safe, testable, extractable |
| **Abstract First** | ❌ Rejected | Premature abstraction risk |

### Extraction Timeline

```
Now:        Build D&D 5e engine in PlayerCharacterGenerator
+6 months:  If Pathfinder requested, extract to dungeonmind-rules-engine
+12 months: If custom rules requested, add RuleBuilder UI
```

---

## 🔗 External Data References

### Primary SRD Data Sources

| Source | URL | Use Case |
|--------|-----|----------|
| **5e.tools** | https://5e.tools | Comprehensive D&D 5e reference (classes, spells, items) |
| **5etools GitHub** | https://github.com/5etools-mirror-3/5etools-src | JSON data files in `/data/` folder |
| **Foundry VTT dnd5e** | https://github.com/foundryvtt/dnd5e | Data structure patterns, advancement system |
| **D&D SRD PDF** | https://media.wizards.com/2016/downloads/DND/SRD-OGL_V5.1.pdf | Official SRD text for verification |

### Key 5etools Data Paths
```
/data/class/          # Class JSON (features, subclasses, spell progression)
/data/spells/         # Complete spell database with class lists
/data/races.json      # Race data with traits and subraces
/data/items.json      # Equipment, weapons, armor
/data/backgrounds.json # Background features and proficiencies
```

**Note**: Use 5etools for comprehensive data cross-reference, Foundry for architectural patterns, SRD PDF for official rulings.

---

## 📖 Research Documents

### Spellcasting System Research

**Document**: `research/RESEARCH-Spellcasting-System.md`  
**Status**: ✅ Complete (December 2025)

Key findings for implementation:

| Topic | Summary |
|-------|---------|
| **Caster Types** | Known (Bard, Ranger, Sorcerer, Warlock) vs Prepared (Cleric, Druid, Paladin, Wizard) |
| **Spellcasting Ability** | INT: Wizard / WIS: Cleric, Druid, Ranger / CHA: Bard, Paladin, Sorcerer, Warlock |
| **Spell Save DC** | 8 + proficiency + ability modifier |
| **Spell Attack** | proficiency + ability modifier |
| **Full Caster Slots** | L1: 2×1st, L2: 3×1st, L3: 4×1st + 2×2nd |
| **Half Caster Slots** | L1: none, L2: 2×1st, L3: 3×1st |
| **Warlock Pact Magic** | L1: 1×1st, L2: 2×1st, L3: 2×2nd (all slots same level, refresh on short rest) |
| **Ritual Casting** | Bard, Cleric, Druid, Wizard (different rules each) |
| **Domain Spells** | Always prepared, don't count against limit (Life Domain: Bless, Cure Wounds) |

**Use For**: Tasks T028-T030 (caster classes), T035j-p (spellcasting system)

### Equipment System Research

**Document**: `research/RESEARCH-Equipment-System.md`  
**Status**: ✅ Complete (December 2025)

Key findings for implementation:

| Topic | Summary |
|-------|---------|
| **SRDWeapon Interface** | `id`, `name`, `category` (simple/martial), `type` (melee/ranged), `damage`, `twoHandedDamage?`, `properties[]`, `range?`, `weight`, `cost` |
| **SRDArmor Interface** | `id`, `name`, `category` (light/medium/heavy/shield), `baseAC`, `addDexModifier`, `dexModifierMax?`, `strengthRequirement?`, `stealthDisadvantage`, `weight`, `cost` |
| **SRDEquipmentPack** | `id`, `name`, `contents[]` (itemId + quantity), `cost` |
| **Weapon Properties** | Ammunition, Finesse, Heavy, Light, Loading, Reach, Special, Thrown, Two-Handed, Versatile |
| **Equipment Packs** | Burglar's, Diplomat's, Dungeoneer's, Entertainer's, Explorer's, Priest's, Scholar's |
| **Starting Gold** | Class-specific dice formulas (e.g., Fighter: 5d4×10 gp, Monk: 5d4 gp) |

**Use For**: Phase 4 (Equipment System), class equipment options validation

---

## 🧪 Test Character Fixtures

**Location**: `__tests__/fixtures/testCharacters.ts`  
**Status**: ✅ Complete (December 2025)

Pre-built character fixtures for integration testing and stress-testing the engine.

### Standard Characters (6)

| ID | Character | Level | Race | Class | Tests |
|----|-----------|-------|------|-------|-------|
| L1-S1 | Marcus Steelhand | 1 | Human | Fighter | Point buy, +1 all stats |
| L1-S2 | Brenna Stoneheart | 1 | Hill Dwarf | Cleric (Life) | L1 subclass, prepared caster |
| L1-S3 | Tharivol Nightwhisper | 1 | Wood Elf | Rogue | DEX build, expertise |
| L2-S1 | Korgan Ironfist | 2 | Mountain Dwarf | Barbarian | Rage, unarmored defense |
| L3-S1 | Aerindel Starweaver | 3 | High Elf | Wizard (Evocation) | Spellbook, ritual casting |
| L3-S2 | Elena Brightshield | 3 | Human | Paladin (Devotion) | Half-caster, Divine Smite |

### Edge Case Characters (5)

| ID | Character | Level | Key Tests |
|----|-----------|-------|-----------|
| EDGE-L1-1 | Lyria Moonsong (Half-Elf Bard) | 1 | **Flexible ability bonuses** (+1 to 2 chosen stats) |
| EDGE-L1-2 | Mordecai Ashborne (Tiefling Warlock) | 1 | **L1 subclass** + **Pact Magic** (short rest slots) |
| EDGE-L1-3 | Rhogar Flamescale (Dragonborn Sorcerer) | 1 | **L1 subclass** + **Natural AC** (13+DEX) |
| EDGE-L3-1 | Merric Goodbarrel (Halfling Ranger) | 3 | **Small race** + Half-caster |
| EDGE-L3-2 | Mordecai Ashborne (Tiefling Warlock) | 3 | **Pact Magic upgrade** (slots → 2nd level) |

### When to Use Test Fixtures

| Phase | Task Range | Fixture Usage |
|-------|------------|---------------|
| **Phase 3.4** | T033-T035 | Use `HUMAN_FIGHTER_L1`, `HILL_DWARF_CLERIC_L1` to test `getAvailableClasses()`, skill/equipment choices |
| **Phase 3.5** | T035b-T035i | Use edge cases for L1 subclass selection (Cleric, Sorcerer, Warlock) |
| **Phase 3.6** | T035j-T035p | Use all caster characters to test spellcasting engine methods |
| **Phase 3.7** | T036-T048 | Use `HALF_ELF_BARD_L1` for flexible bonus UI, standard chars for validation |
| **Phase 4** | T049-T058 | Full integration: create characters through wizard, compare to fixtures |
| **Phase 5** | T059-T069 | E2E: build characters matching fixture specs, verify final state |

### Helper Functions

```typescript
import { 
    getCharactersByLevel,    // Get all L1, L2, or L3 fixtures
    getCharactersByClass,    // Get all fighters, wizards, etc.
    getCharactersByRace,     // Get all elves, dwarves, etc.
    ALL_TEST_CHARACTERS,     // All 11 fixtures
    STANDARD_CHARACTERS,     // 6 common builds
    EDGE_CASE_CHARACTERS     // 5 edge cases
} from './__tests__/fixtures/testCharacters';
```

---

**Last Updated**: December 1, 2025  
**Status**: Ready for Implementation  
**Next Phase**: Phase 3.2 - Caster Classes (using research findings)
