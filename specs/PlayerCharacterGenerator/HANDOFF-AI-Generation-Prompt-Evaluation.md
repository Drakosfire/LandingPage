# Handoff: AI Character Generation - Prompt Evaluation
**Date:** 2025-12-12  
**Type:** Research / Experiment  
**Last Updated:** 2025-12-13  
**Status:** 🟢 Pilot Complete — Ready for Real API Testing

---

## 🎯 Goal

Design and validate an AI-assisted character generation system where:
1. **User provides identity** (Class, Race, Level, Background) — hardest to validate, most personal
2. **Generator computes math** (HP, modifiers, AC, saves) — deterministic, no AI needed
3. **AI expresses preferences** (ability priorities, skill themes, flavor) — creative, translatable
4. **Rule Engine validates** — guarantees legal output

**Scope:** Levels 1-3 only (most common starting levels, avoids ASI/Feat complexity)

---

## 🎉 Pilot Test Results (2025-12-13)

```
══════════════════════════════════════════════════════════════════════
 AI GENERATION EXPERIMENT RESULTS
══════════════════════════════════════════════════════════════════════

OVERALL SUCCESS RATES (Mock Data)
──────────────────────────────────────────────────────────────────────
 Parse Success:       100.0%
 Translation Success: 100.0%
 Validation Success:  100.0%
 Overall Success:     100.0%

BY CLASS
──────────────────────────────────────────────────────────────────────
 Fighter: Kira Stonefist       (STR 16, DEX 14, CON 16) ✅
 Wizard:  Aldric Thornwood     (INT 16, CON 16, DEX 14) ✅
 Rogue:   Vex Shadowmere       (DEX 16, CON 16, CHA 14) ✅
 Cleric:  Brother Marcus       (WIS 16, CON 16, STR 14) ✅
 Bard:    Lyric Silversong     (CHA 16, DEX 16, CON 14) ✅

TRANSLATION DETAILS
──────────────────────────────────────────────────────────────────────
 Point Buy:    27/27 spent on all characters
 Skills:       Mapped from themes to valid options
 Equipment:    Package A selected for all (heavy/defensive style)
 Validation:   All rules passed
```

**Next:** Run with real OpenAI API calls to validate against actual LLM behavior.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     USER INPUT                                   │
│  Class: [select]   Race: [select]   Level: [1/2/3]              │
│  Background: [select]   Concept: [free text]                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│               RULE ENGINE (Deterministic)                        │
│  • Load class features for selected class @ level               │
│  • Load racial traits and ability bonuses                       │
│  • Compute valid skill options (handle overlaps)                │
│  • Compute spell list (if caster, filtered by level)            │
│  • Format equipment choices (packages, not items)               │
│  • Inject point buy table                                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AI GENERATION                                 │
│  Input:  Concept + Constrained Options (from Rule Engine)       │
│  Output: Preferences (priorities, themes, flavor)               │
│  NOT:    Exact scores, specific skill names, spell IDs          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│               PREFERENCE TRANSLATOR                              │
│  • Map ability priorities → optimal point buy (27 pts)          │
│  • Map skill themes → valid skill selections                    │
│  • Map equipment style → valid package                          │
│  • Map spell themes → valid spell selections                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│               RULE ENGINE VALIDATION                             │
│  • Point buy ≤ 27?                                              │
│  • Skills ∈ valid set?                                          │
│  • Equipment valid combo?                                       │
│  • Spells valid for class/level?                                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│               MATH COMPUTATION                                   │
│  • Ability modifiers: (score - 10) / 2                          │
│  • HP: Hit Die + CON mod (+ racial if applicable)               │
│  • AC: Armor + DEX (capped by armor type)                       │
│  • Proficiency bonus: +2 (levels 1-4)                           │
│  • Save bonuses, attack bonuses, spell DC                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📋 Two Parallel Tracks

### Track A: UI for User Decisions
Design the interface that guides users through foundational choices (Class, Race, Level, Background) with enough information to choose confidently.

### Track B: Test Harness for AI + Rule Engine
Build infrastructure to validate AI preference generation and Rule Engine correctness using synthetic test cases.

---

## ✅ Task List

### Phase 1: Foundation ✅ COMPLETE
- [x] **T1.1** Define `AiPreferences` TypeScript interface
- [x] **T1.2** Define `TranslationResult` interface  
- [x] **T1.3** Create `translatePreferences()` function stub
- [x] **T1.4** Create test case generator (5-case pilot)

### Phase 2: Prompt Design ✅ COMPLETE
- [x] **T2.1** Write preference prompt template (concept → preferences)
- [x] **T2.2** Create constraint injection formatters (skills, spells, equipment as lists)
- [x] **T2.3** Create test runner with mock responses

### Phase 3: Translation Layer ✅ COMPLETE
- [x] **T3.1** Implement ability priority → point buy translator
- [x] **T3.2** Implement skill themes → skill selection translator
- [x] **T3.3** Implement equipment style → package selector
- [x] **T3.4** Implement spell themes → spell selection (for casters)
- [x] **T3.5** Build test runner (TestCase → TestResult)
- [x] **T3.6** Build results aggregator (TestResult[] → Summary)

### Phase 4: Real API Testing 🔜 NEXT
- [ ] **T4.1** Add backend endpoint for AI generation (DungeonMindServer)
- [ ] **T4.2** Wire frontend test runner to call real API
- [ ] **T4.3** Run pilot (5 cases) with real AI and review results
- [ ] **T4.4** Identify failure patterns from real AI responses

### Phase 5: Full Experiment
- [ ] **T5.1** Run full matrix (375 cases) or representative sample (75 cases)
- [ ] **T5.2** Aggregate results by class, race, level
- [ ] **T5.3** Document failure patterns
- [ ] **T5.4** Determine retry strategy (how many, which failures)
- [ ] **T5.5** Calculate final success rate and cost

### Phase 6: UI Components (Parallel Track)
- [ ] **T6.1** Design ClassSelector card layout
- [ ] **T6.2** Implement ClassSelector component
- [ ] **T6.3** Design RaceSelector with synergy hints
- [ ] **T6.4** Implement RaceSelector component
- [ ] **T6.5** Implement LevelSelector (simple)
- [ ] **T6.6** Implement BackgroundSelector
- [ ] **T6.7** Implement ConceptInput with suggestions
- [ ] **T6.8** Wire flow: Level → Class → Race → Background → Concept

---

## 📁 Files Created

### Generation Pipeline (All Complete)
```
LandingPage/src/components/PlayerCharacterGenerator/generation/
├── types.ts                 ✅ AiPreferences, GenerationConstraints, TranslationResult
├── preferenceTranslator.ts  ✅ Preferences → mechanics (point buy, skills, equipment, spells)
├── promptBuilder.ts         ✅ Prompt construction with constraint injection
├── testHarness.ts           ✅ Test case generation and result aggregation
├── testRunner.ts            ✅ Full pipeline runner with mock responses
├── demo.ts                  ✅ CLI demo script
└── index.ts                 ✅ Clean exports
```

### Run Commands
```bash
# Run full pilot test (5 classes)
npx tsx src/components/PlayerCharacterGenerator/generation/demo.ts pilot

# Show prompt for a specific class
npx tsx src/components/PlayerCharacterGenerator/generation/demo.ts prompt wizard

# Run single pipeline demo
npx tsx src/components/PlayerCharacterGenerator/generation/demo.ts pipeline fighter
```

### Rule Engine (Existing)
```
LandingPage/src/components/PlayerCharacterGenerator/
├── rules/dnd5e/DnD5eRuleEngine.ts     # All class/race/spell data access
├── rules/dnd5e/pointBuy.ts            # Point buy costs and validation
├── types/dnd5e/character.types.ts     # DnD5eCharacter interface
└── data/dnd5e/                        # Raw data files
    ├── classes.json
    ├── races.json
    ├── backgrounds.json
    └── spells.json
```

---

## 🧪 Experiment Design

### What We're Testing

| Question | How to Answer |
|----------|---------------|
| Can AI express coherent preferences from a concept? | Qualitative review of preference outputs |
| Can we translate preferences into valid mechanics? | Translation success rate |
| Does Rule Engine correctly validate all edge cases? | Validation catches known-bad inputs |
| What's the token cost per character? | Measure prompt + completion tokens |
| What's the latency? | Measure end-to-end time |
| How many retries needed for 95%+ success? | Run retry experiments |

### AI Output Format (Preferences, Not Mechanics)

```json
{
  "abilityPriorities": ["strength", "constitution", "dexterity", "wisdom", "charisma", "intelligence"],
  "abilityReasoning": "Tough survivor who has seen too much",
  
  "combatApproach": "Defensive, protects allies, endures punishment",
  "skillThemes": ["physical prowess", "intimidation", "awareness"],
  
  "equipmentStyle": "Heavy armor, shield, reliable weapon",
  "fightingStylePreference": { "id": "defense", "reasoning": "Survival is paramount" },
  
  "character": {
    "name": "Kira Stonefist",
    "personality": {
      "traits": ["I face problems head-on", "I sleep with my back to a wall"],
      "ideals": ["Protection - The strong must shield the weak"],
      "bonds": ["I carry the insignia of my fallen unit"],
      "flaws": ["I blame myself for every death I witness"]
    },
    "backstory": "A veteran of the Goblin Wars who lost her entire unit...",
    "appearance": "A weathered woman with grey-streaked hair and a jagged scar",
    "age": 38
  }
}
```

**Key insight:** AI expresses *intent*, we compute *mechanics*.

### Test Matrix

| Variable | Values | Count |
|----------|--------|-------|
| Class | Fighter, Wizard, Rogue, Cleric, Bard | 5 |
| Race | Human, Dwarf, Elf, Halfling, Half-Orc | 5 |
| Level | 1, 2, 3 | 3 |
| Background | Soldier, Sage, Criminal, Acolyte, Folk Hero | 5 |

**Full matrix:** 5 × 5 × 3 × 5 = **375 combinations**
**Pilot matrix:** 5 classes × 1 race × 1 level × 1 background = **5 combinations** (quick validation)

### Metrics to Collect

| Metric | Target | Pilot Result |
|--------|--------|--------------|
| Parse Success | >98% | 100% (mock) |
| Translation Success | >95% | 100% (mock) |
| Validation Success | >90% | 100% (mock) |
| Avg Tokens | <1500 | ~1371 (mock) |
| Avg Latency | <3s | 3ms (mock) |
| Cost per Character | <$0.02 | ~$0.014 (mock) |

---

## 🚨 Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Who picks Class/Race/Level? | User | Identity choices, hardest to validate |
| Who picks ability scores? | AI priority → we compute | AI can't mess up point buy math |
| Who picks skills? | AI themes → we select | Guaranteed valid from constrained list |
| Who picks spells? | AI themes → we select | Filtered list prevents level errors |
| Who generates flavor? | AI | Pure creativity, no validation needed |
| Retry strategy? | Max 2 retries on translation failure | Balance success rate vs cost |

---

## 🔮 Success Criteria

| Outcome | Action |
|---------|--------|
| >90% validation success | ✅ Proceed with preference-based approach |
| 75-90% success | 🔧 Add targeted auto-repair for top failure patterns |
| <75% success | 🔄 Reduce AI scope further (AI does flavor only) |

---

## 📊 Failure Pattern Categories (Expected)

| Category | Example | Auto-Repair Strategy |
|----------|---------|---------------------|
| **Priority Conflict** | All scores need to be high | Cap at 2 "high priority" scores |
| **Theme Unmatchable** | "stealth" theme but no Stealth available | Substitute closest available |
| **Subclass Invalid** | Picked subclass not available at level | Default to first valid option |
| **Spell Theme Miss** | Wanted "fire" but no fire spells at level 1 | Pick thematically adjacent |

---

## 🚀 Immediate Next Step

**T4.1: Add backend endpoint for AI generation**

Create a new endpoint in `DungeonMindServer/routers/playercharactergenerator_router.py`:

```python
@router.post("/generate-preferences")
async def generate_preferences(request: GeneratePreferencesRequest):
    """
    Generate AI preferences for character creation
    
    Input: GenerationInput (classId, raceId, level, backgroundId, concept)
    Output: AiPreferences (ability priorities, skill themes, character flavor)
    """
    # Build prompt with constraints
    # Call OpenAI
    # Return parsed preferences
```

This will allow the frontend test runner to call real AI and collect actual success metrics.

---

## 📚 References

- **Tasks:** `specs/PlayerCharacterGenerator/tasks.md` → Phase 5.0
- **Rule Engine:** `LandingPage/src/components/PlayerCharacterGenerator/rules/dnd5e/DnD5eRuleEngine.ts`
- **Point Buy:** `LandingPage/src/components/PlayerCharacterGenerator/rules/dnd5e/pointBuy.ts`
