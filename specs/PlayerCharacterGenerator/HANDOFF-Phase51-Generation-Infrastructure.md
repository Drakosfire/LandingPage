# Handoff: Phase 5.1 - Generation Infrastructure
**Date:** 2025-12-14  
**Type:** Feature  
**Last Updated:** 2025-12-14  
**Status:** ✅ Implemented (backend)  

---

## 🎯 Goal

Create a **unified `/generate` endpoint** that takes user input and returns a **complete, ready-to-hydrate character**. This closes the loop from "user types concept" → "character appears on canvas".

---

## 🚨 CURRENT STATE

### What's Working ✅
- **`/generate-preferences`** - AI generates creative preferences (names, backstory, themes)
- **`/constraints`** - Backend rule engine provides valid options (L1-3)
- **`/validate`** - Backend validates translated mechanical choices
- **`/compute`** - Backend computes derived stats (mods, HP, AC, spell slots)
- **Backend `translator.py`** - Translates preferences → `ValidationChoices` (backend-authoritative)
- **Backend `POST /generate`** - Unified pipeline returning a frontend `Character` wrapper with populated `dnd5eData`

### What's Missing ❌
- **Rate limiting** - Not implemented (can defer)

### Current Flow (Test Harness)
```
Frontend calls:
1. POST /constraints        → GenerationConstraints
2. POST /generate-preferences → AiPreferences
3. translatePreferences()    → TranslatedChoices  ← FRONTEND
4. POST /validate           → ValidationResult
5. POST /compute            → DerivedStats
```

### Target Flow (Unified)
```
Frontend calls:
1. POST /generate → Character (wrapper) with dnd5eData populated (ready for canvas)

Backend does:
  ├── constraints → preferences → translate → validate → compute
  └── Returns hydrated character object
```

---

## 🏗️ Architecture

### New Backend Module: `translator.py`

Port the TypeScript `preferenceTranslator.ts` to Python.

**Actual implementation**
- **File**: `DungeonMindServer/playercharactergenerator/rule_engine/translator.py`
- **Primary function**: `translate_preferences(...) -> (success: bool, choices: ValidationChoices, issues: List[str])`

Notes:
- Backend outputs **`ValidationChoices`** (the same shape consumed by backend validators/compute).
- Point-buy / skills / equipment / feature choice / spell selection are translated with a small heuristic layer, then validated authoritatively by `validate_translated_choices()`.

### New Endpoint: `POST /generate`

**Actual implementation**
- **File**: `DungeonMindServer/routers/playercharactergenerator_router.py`
- **Endpoint**: `POST /api/playercharactergenerator/generate`
- **Request body**: `GenerationInput` (`classId`, `raceId`, `level`, `backgroundId`, `concept`)
- **Response**: `{ success: true, data: { character, preferences, choices, derivedStats, constraints, ... } }`

### Character Builder: `character_builder.py`

**Actual implementation**
- **File**: `DungeonMindServer/playercharactergenerator/character_builder.py`
- **Output**: a frontend `Character` wrapper (`system: 'dnd5e'`) with `dnd5eData` populated.

Notes:
- The backend PCG v0 catalog is intentionally sparse; builder fills missing SRD-rich fields with safe defaults.
- Equipment is currently **minimal** (armor/shield inferred from equipment package item IDs used by backend `/compute` AC logic).

---

## 📋 Task Breakdown

### T076: Port Translator to Backend (4h)

| Subtask | Description | Est |
|---------|-------------|-----|
| T076a | Create `translator.py` with main function signature | 15m |
| T076b | Port `translateAbilityPriorities()` | 45m |
| T076c | Port `translateSkillThemes()` | 30m |
| T076d | Port `translateEquipmentStyle()` | 30m |
| T076e | Port `translateFeatureChoices()` | 30m |
| T076f | Port `translateSpellThemes()` | 45m |
| T076g | Add unit tests for translator | 45m |

### T077: Create Character Builder (2h)

| Subtask | Description | Est |
|---------|-------------|-----|
| T077a | Create `character_builder.py` with main function | 30m |
| T077b | Implement `build_features_list()` | 30m |
| T077c | Implement `build_equipment_list()` | 30m |
| T077d | Implement `build_spells_list()` | 30m |

### T079: Unified Generate Endpoint (2h)

| Subtask | Description | Est |
|---------|-------------|-----|
| T079a | Add Pydantic models for request/response | 30m |
| T079b | Implement `/generate` endpoint | 45m |
| T079c | Wire into existing infrastructure | 30m |
| T079d | End-to-end test via CLI | 15m |

### T078: Rate Limiting (Deferred)

Can be added later - not blocking for initial implementation.

---

## 📁 Key Files

### Source (TypeScript to Port)
```
LandingPage/src/components/PlayerCharacterGenerator/
└── generation/
    └── preferenceTranslator.ts    # ~785 lines - main translation logic
```

### Target (Python Created)
```
DungeonMindServer/playercharactergenerator/
├── rule_engine/
│   └── translator.py              # NEW: ported translation logic
├── character_builder.py           # NEW: build complete character
└── tests/
    └── test_translator.py         # NEW: translator tests (also validates + computes)
```

### Modify
```
DungeonMindServer/routers/
└── playercharactergenerator_router.py   # ADD: /generate endpoint
```

---

## 🧪 Testing Strategy

### Unit Tests (translator.py)
```python
def test_translate_ability_priorities_fighter():
    """Fighter: STR > CON > DEX"""
    priorities = ["strength", "constitution", "dexterity", "wisdom", "charisma", "intelligence"]
    result = translate_ability_priorities(priorities, [])
    assert result.scores["strength"] == 15  # Highest
    assert result.scores["intelligence"] == 8  # Lowest
    assert result.points_spent <= 27

def test_translate_skill_themes_stealth():
    """Rogue with stealth theme gets Stealth skill"""
    themes = ["stealth and subterfuge", "quick thinking"]
    skills = SkillConstraints(classOptions=["Stealth", "Acrobatics", "Athletics"])
    result = translate_skill_themes(themes, skills)
    assert "Stealth" in result.selected
```

### Integration Test (CLI)
```bash
# Test unified endpoint
curl -X POST "https://dev.dungeonmind.net/api/playercharactergenerator/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "classId": "fighter",
    "raceId": "human", 
    "level": 1,
    "backgroundId": "soldier",
    "concept": "A battle-hardened veteran seeking redemption"
  }'
```

### Backend Unit Test (Implemented)
```bash
cd DungeonMindServer
uv run pytest playercharactergenerator/tests -q
```

---

## 🎯 Success Criteria

| Metric | Target |
|--------|--------|
| `/generate` returns valid character | 100% of valid inputs |
| Character hydrates in frontend without errors | ✅ |
| Latency | <60s (same as current pipeline) |
| Cost | ~$0.01/character (same as current) |

---

## 🔮 Frontend Integration (Phase 5.2)

Once `/generate` is working:

```typescript
// AIGenerationTab.tsx
const handleGenerate = async () => {
    setLoading(true);
    const response = await fetch(`${API_URL}/api/playercharactergenerator/generate`, {
        method: 'POST',
        body: JSON.stringify({
            classId: selectedClass,
            raceId: selectedRace,
            level: selectedLevel,
            backgroundId: selectedBackground,
            concept: userConcept
        })
    });
    const { character } = await response.json();
    
    // Hydrate into context
    setCharacter(character);
    setActiveTab('editor');  // Switch to character sheet
};
```

---

## References

- **Phase 5.0 Handoff:** `HANDOFF-AI-Generation-Prompt-Evaluation.md`
- **Frontend Translator:** `generation/preferenceTranslator.ts`
- **Backend Models:** `models/pcg_models.py`
- **Tasks:** `tasks.md` → Phase 5.1

