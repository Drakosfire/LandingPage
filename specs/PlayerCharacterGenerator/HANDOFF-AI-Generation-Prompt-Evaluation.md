# Handoff: PCG Backend Rule Engine (Design) + AI Prompt Evaluation (Harness)
**Date:** 2025-12-13  
**Type:** Research / Experiment / Architecture  
**Last Updated:** 2025-12-14  

---

## 🎯 Goal

Design and implement a **backend Rule Engine for PCG** inside `DungeonMindServer/playercharactergenerator/` that can:

1. **Compute constraints deterministically** from user identity choices (Class/Race/Level/Background)
2. **Validate and compute** final character mechanics (derived stats, legality)
3. Follow the long-term pattern of a **middle-layer JSON rules config** (future: `DungeonMindEngine` loads configs to support other systems)

In parallel, keep the AI preference harness working to empirically measure success/cost while deterministic rules harden.

**Scope:** Levels 1-3 only (most common starting levels, avoids ASI/Feat complexity)

---

## 🚨 CURRENT STATE (Evidence-Based)

### What's Working ✅
- **Live AI preference generation** works end-to-end against `https://dev.dungeonmind.net`.
- **Stay on `chat.completions`** for PCG; Responses API migration is deferred to the external Component Generator effort.
- **Backend health identifies deployment**: `/api/playercharactergenerator/health` includes `token_limit_param` + `module_path`.
- **Backend Rule Engine exists (PCG-local)**:
  - `POST /api/playercharactergenerator/constraints` (authoritative constraints for L1–3)
  - `POST /api/playercharactergenerator/validate` (E2 validators for translated choices)
-  - `POST /api/playercharactergenerator/compute` (E3 derived stats compute)
- **Harness uses real constraints** in live mode (no more `getMockConstraints()` for live runs).
- **Concurrency is supported** for live samples via `--concurrency N` (works well at 3–4 on this box).
- **Concurrency logging is explicit**: the CLI logs worker START/END with `inFlight=X/N` and prints `maxInFlightObserved`.
- **Latency/cost reporting improved**: report includes avg + p50 + p95 latency; per-stage timings collected (constraints/AI/translate/validate).
- **Failure reporting improved**: demo prints a full JSON dump for each failed case (raw response + issues + timings).
- **Dev run logs**: in dev env, CLI output is saved to `LandingPage/pcg_run_logs/*.txt` for review.
- **Spells (E4) implemented (Standard path)**:
  - Rule engine owns the spell catalog + per-class spell constraints
  - AI returns themes
  - Translator selects deterministic spell IDs
  - Backend validates counts + membership + max spell level + prepared formulas
- **Hard-caster spike started**:
  - **Warlock** (pact magic metadata surfaced: `pactSlots`, `pactSlotLevel`)
  - **Paladin** (half-caster prepared formula: `abilityModPlusHalfLevel`)
  - **Ranger** (half-caster known spells at L2–3; no cantrips)

### Recent empirical results ✅
- **Representative sample (75 cases, live, concurrent=4)**: achieved **100%** parse/translate/validate.
  - **Latency**: avg ~45.3s, p50 ~46.0s, p95 ~58.4s
  - **Cost**: ~$0.0096 per success
- **Spell-focused sample (9 cases, live)**: wizard/cleric/bard across L1–3 achieved **100%** parse/translate/validate.
  - **Latency**: avg ~35.5s, p50 ~34.9s, p95 ~37.3s

### Known gotcha (and how we debug it) ⚠️
- If you change spell catalogs locally, the deployed server may still be serving the **old catalog** until it’s restarted/redeployed.
- Symptom: translation failures like **`Only matched 3/4 spells`** with **0% spell theme mismatch**, which indicates a *catalog coverage shortage*, not theme mismatch.
- Fast confirmation (wizard L2 coverage check):

```bash
curl -sk -X POST "https://dev.dungeonmind.net/api/playercharactergenerator/constraints" \
  -H "Content-Type: application/json" \
  -d '{"classId":"wizard","raceId":"human","level":2,"backgroundId":"soldier","concept":"Check catalog coverage for wizard L2."}' \
  | python -c 'import sys,json; o=json.load(sys.stdin); sc=o["data"]["constraints"]["spellcasting"]; print(len(sc.get("availableSpells") or []), [s.get("id") for s in (sc.get("availableSpells") or [])])'
```

- Evidence:
  - Before restart: wizard L2 `availableSpells.length == 3` (guaranteed failures for prepared L2 wizards that need 4+ spells)
  - After restart: wizard L2 `availableSpells.length == 11`
  - Focused live rerun (previously failing slice) passed **4/4**:
    `--classes wizard --levels 2 --races human,dwarf --backgrounds soldier,sage`

### What's Not Yet Real ❌
- **Spell slots / spell resources are not computed** (we validate spell *selection*; we don't model slots yet).
- **Warlock pact-magic enforcement is minimal** (we surface pact metadata; we don't validate “all slots are slotLevel” usage, or short-rest refresh semantics).
- **Ranger not implemented yet** (next half-caster; known-caster behavior differs from paladin).
- **Spell catalogs are tiny** (v0 lists are intentionally small; expand once we start seeing real theme misses).
- Frontend still has legacy/mock validators in some UI areas; backend is becoming the source of truth.

---

## Quick Pickup

### Commands

```bash
cd /home/drakosfire/Projects/DungeonOverMind/LandingPage

# Pilot (5 cases)
NODE_TLS_REJECT_UNAUTHORIZED=0 DUNGEONMIND_API_URL=https://dev.dungeonmind.net \
npx tsx src/components/PlayerCharacterGenerator/generation/demo.ts pilot --live --backend-validate --backend-compute --max-retries 2

# Representative sample (75 cases, concurrent, with backend validate)
NODE_TLS_REJECT_UNAUTHORIZED=0 DUNGEONMIND_API_URL=https://dev.dungeonmind.net \
npx tsx src/components/PlayerCharacterGenerator/generation/demo.ts sample --count 75 --live --concurrency 4 --backend-validate --backend-compute --max-retries 2

# Spell-focused sample (casters only, level slice)
NODE_TLS_REJECT_UNAUTHORIZED=0 DUNGEONMIND_API_URL=https://dev.dungeonmind.net \
npx tsx src/components/PlayerCharacterGenerator/generation/demo.ts sample \
  --classes wizard,cleric,bard,warlock,paladin,ranger --levels 2,3 \
  --count 24 --live --concurrency 4 --backend-validate --backend-compute --max-retries 2

# Re-run only a failure slice (example: fighter+cleric, levels 1+3)
NODE_TLS_REJECT_UNAUTHORIZED=0 DUNGEONMIND_API_URL=https://dev.dungeonmind.net \
npx tsx src/components/PlayerCharacterGenerator/generation/demo.ts sample \
  --classes fighter,cleric --levels 1,3 \
  --live --concurrency 4 --backend-validate --backend-compute --max-retries 2

# Re-run the previously failing wizard-L2 slice (coverage check after spell catalog updates)
NODE_TLS_REJECT_UNAUTHORIZED=0 DUNGEONMIND_API_URL=https://dev.dungeonmind.net \
npx tsx src/components/PlayerCharacterGenerator/generation/demo.ts sample \
  --classes wizard --levels 2 --races human,dwarf --backgrounds soldier,sage \
  --live --concurrency 4 --backend-validate --backend-compute --max-retries 2

# Save CLI output to file automatically in dev env (unless --no-save-log)
DUNGEONMIND_ENV=dev \
npx tsx src/components/PlayerCharacterGenerator/generation/demo.ts pilot
```

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     USER INPUT                               │
│  Class: [select]   Race: [select]   Level: [1/2/3]          │
│  Background: [select]   Concept: [free text]                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│               RULE ENGINE (Deterministic)                    │
│  • Load class features for selected class @ level           │
│  • Load racial traits and ability bonuses                   │
│  • Compute valid skill options (handle overlaps)            │
│  • Compute spell list (if caster, filtered by level)        │
│  • Format equipment choices (packages, not items)           │
│  • Inject point buy table                                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    AI GENERATION                             │
│  Input:  Concept + Constrained Options (from Rule Engine)   │
│  Output: Preferences (priorities, themes, flavor)           │
│  NOT:    Exact scores, specific skill names, spell IDs      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│               PREFERENCE TRANSLATOR                          │
│  • Map ability priorities → optimal point buy               │
│  • Map skill themes → valid skill selections                │
│  • Map equipment style → valid package                      │
│  • Map spell themes → valid spell selections                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│               RULE ENGINE VALIDATION                         │
│  • Point buy ≤ 27?                                          │
│  • Skills ∈ valid set?                                      │
│  • Equipment valid combo?                                   │
│  • Spells valid for class/level?                            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│               MATH COMPUTATION                               │
│  • Ability modifiers: (score - 10) / 2                      │
│  • HP: Hit Die + CON mod (+ racial if applicable)           │
│  • AC: Armor + DEX (capped by armor type)                   │
│  • Proficiency bonus: +2 (levels 1-4)                       │
│  • Save bonuses, attack bonuses, spell DC                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧠 Backend Rule Engine Design (PCG)

### Intent
Build a backend rule engine that is:
- **Authoritative** (backend is source of truth for legality + derived stats)
- **Config-driven** (catalogs/rules loaded from a middle-layer JSON format)
- **A stepping stone** toward a future `DungeonMindEngine` that can load/validate other systems

### Current backend layout (implemented)
```
DungeonMindServer/playercharactergenerator/
  rule_engine/
    catalogs/
      dnd5e_v0/
        catalog.py               # "middle layer" catalog (python data; JSON later)
    catalog_loader.py
    pcg_rule_engine.py           # GenerationInput -> GenerationConstraints (L1–3)
    validators.py                # E2: point buy + skills + equipment pkg + feature choices
```

**Note:** `DungeonMindServer/.cursorignore` blocks `*.json`, so catalogs are python data for now. Long-term goal remains JSON-driven configs.

### Target endpoints (authoritative)
- **`POST /api/playercharactergenerator/constraints`**
  - Input: `GenerationInput`
  - Output: `GenerationConstraints` (same shape as frontend `generation/types.ts`)
- **`POST /api/playercharactergenerator/validate`**
  - Input: mechanics payload (abilityScores + selected skills + equipment package + spells + feature choices)
  - Output: structured validation result (errors/warnings)
- **`POST /api/playercharactergenerator/compute`**
  - Input: mechanics payload
  - Output: derived stats (mods/prof/HP/AC/etc.) + debug sections (E3 baseline)

### Phased delivery (recommended)
| Phase | Deliverable | Why |
|------:|-------------|-----|
| E0 | Backend catalogs + loader utilities | Enables constraints to be real |
| E1 | `/constraints` for level 1–3 | Grounds AI prompts; enables real harness |
| E2 | `/validate` (point buy, skills, equipment pkgs, feature choices) | Makes success rates meaningful |
| E3 | Derived stats compute: prof bonus/mods/hp/ac | Deterministic “mathy bits” |
| E4 | Spell constraints + spell validation | First real complexity spike |

---

## 🧪 Track B: Experiment Design

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
  "abilityPriorities": ["constitution", "strength", "wisdom"],
  "abilityReasoning": "Tough survivor who has seen too much",
  
  "combatApproach": "Defensive, protects allies, endures punishment",
  "skillThemes": ["physical prowess", "intimidation", "awareness"],
  
  "equipmentStyle": "Heavy armor, shield, reliable weapon",
  "subclassPreference": "Champion - simple, reliable, survivor mentality",
  "fightingStylePreference": "Defense or Protection",
  
  "character": {
    "name": "Durgan Ironforge",
    "personality": {
      "traits": ["I face problems head-on", "I sleep with my back to a wall"],
      "ideals": ["Protection - The strong must shield the weak"],
      "bonds": ["I failed to protect my unit; never again"],
      "flaws": ["I have trouble trusting others with important tasks"]
    },
    "backstory": "A veteran of the Goblin Wars who lost her entire unit..."
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

| Metric | Target | Why |
|--------|--------|-----|
| Parse Success | >98% | AI returns valid JSON |
| Translation Success | >95% | Preferences map to valid options |
| Validation Success | >90% | Generated character passes all rules |
| Avg Tokens | <1500 | Cost control |
| Avg Latency | <60s (live) | User experience + loading bar design |
| Cost per Character | <$0.02 | Economics |

---

## 🎨 Track A: UI Design Tasks

### Decision Flow

```
Level → Class → Race → Background → Concept → [Generate]
```

### UI Components Needed

| Component | Purpose | Information to Display |
|-----------|---------|----------------------|
| **LevelSelector** | Pick 1-3 | Simple cards, tooltip for what each unlocks |
| **ClassSelector** | Pick class | Hit die, armor, weapons, key features, complexity rating |
| **ClassDetailPanel** | Expand on class | Full feature list, skill options, subclasses (if L3) |
| **RaceSelector** | Pick race | Ability bonuses, traits, synergy hints based on class |
| **BackgroundSelector** | Pick background | Skills granted, feature, equipment preview |
| **ConceptInput** | Free text + suggestions | Text area, concept starters, generate button |

### Key UX Principles

1. **Progressive disclosure** — Show essentials on card, details on expand
2. **Synergy hints** — "Good for Fighter" badges based on class selection
3. **Overlap handling** — Show when background skill duplicates class option
4. **Complexity ratings** — [Beginner], [Intermediate], [Advanced] badges

---

## ✅ Task List

### Completed (AI Harness)
- [x] `AiPreferences` + `TranslationResult` types
- [x] `translatePreferences()` (initial)
- [x] Prompt builder + parser + preference validation
- [x] Test runner (mock + live API)
- [x] Live pilot run (5 cases)
- [x] Representative sample generator fixed (reliably produces N unique cases)
- [x] Concurrency support for live sample (`--concurrency`)
- [x] Timing metrics (avg + p50 + p95; per-stage breakdown stored in results)
- [x] Full failure dumps (raw response + issues + timings)
- [x] Dev env run logs saved to `LandingPage/pcg_run_logs/*.txt`
- [x] Filtered reruns: `--classes`, `--levels`, `--races`, `--backgrounds`

### Next (Backend Rule Engine)
- [x] **E0** Backend catalogs (v0) + loader utilities
- [x] **E1** `/constraints` endpoint (L1–3)
- [x] **E2** `/validate` endpoint + validators: point buy + skills + equipment packages + feature choices
- [x] **E3** Derived-stats compute (mods/prof/HP/AC/etc.) + `/compute` endpoint
- [x] **E4** Spell constraints + spell validation (standard path)
- [x] **E4.1** Hard casters: warlock (pact metadata) + paladin (half-caster prepared formula)
- [x] Harden parse reliability (retry strategy in CLI via `--max-retries`)

---

## 📁 Key Files

### Backend Rule Engine (Authoritative)
```
DungeonMindServer/playercharactergenerator/
├── pcg_generator.py                               # AI generation; now computes constraints when missing
├── rule_engine/pcg_rule_engine.py                 # GenerationInput -> GenerationConstraints
├── rule_engine/validators.py                      # E2 validation for translated choices
└── routers/playercharactergenerator_router.py      # /constraints + /validate + /generate-preferences
```

### Frontend Harness (Experiment + Debug)
```
LandingPage/src/components/PlayerCharacterGenerator/
├── engine/dnd5e/DnD5eRuleEngine.ts                # Client reference engine (not authoritative)
├── rules/dnd5e/pointBuy.ts                        # Client point buy rules (reference)
└── generation/
    ├── demo.ts                                    # CLI runner (concurrency, filters, logs, failure dumps)
    ├── testRunner.ts                              # Calls /constraints, /generate-preferences, /validate
    ├── testHarness.ts                             # Matrix + sample generation + summary aggregation
    ├── preferenceTranslator.ts                    # Preferences -> mechanical choices
    └── promptBuilder.ts                           # Prompt construction
```

### To Create
```
LandingPage/src/components/PlayerCharacterGenerator/
├── generation/
│   ├── types.ts                       # AiPreferences, TranslationResult
│   ├── promptBuilder.ts               # Build prompts with constraints
│   ├── preferenceTranslator.ts        # Preferences → valid mechanics
│   └── testHarness.ts                 # Test runner and aggregator
└── components/
    ├── ClassSelector/
    ├── RaceSelector/
    ├── LevelSelector/
    ├── BackgroundSelector/
    └── ConceptInput/
```

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

## 📚 References

- **Tasks:** `specs/PlayerCharacterGenerator/tasks.md` → Phase 5.0
- **Client Rule Engine:** `LandingPage/src/components/PlayerCharacterGenerator/engine/dnd5e/DnD5eRuleEngine.ts`
- **Point Buy:** `LandingPage/src/components/PlayerCharacterGenerator/rules/dnd5e/pointBuy.ts`
- **Responses API migration reference (do NOT apply to PCG yet):** `Docs/ProjectDiary/2025/RulesLawyer-Revival/handoffs/phase1/02_phase1_h2-openai-responses-api-migration-COMPLETE.md`

---

## 🚀 Immediate Next Step

**Next complexity spike:** add **Ranger** (half-caster, known spells) and begin modeling **spell slots/resources** (including warlock pact slots) so `/compute` can return caster “usable loadout” sections, not just selections.

### Proposed next steps (pick 1)
1. **Ranger (half-caster, known spells)** ✅ (implemented):
   - Catalog + spell list + constraints
   - Validator already supports known casters; added 2 focused unit tests (L2 + L3)
   - Next: run a focused live slice: `--classes ranger --levels 2,3 --count 12`
2. **Warlock “real pact magic” validation (still small scope)** ✅:
   - Keep selection validation as-is
   - ✅ Added `sections["spellSlots"]` in `/compute` with pact slots (count + slotLevel) for UX
3. **Expand spell catalogs (v0 → v1) driven by theme misses** ✅:
   - ✅ Added ~10–20 spells per list; updated descriptions to include theme keywords used by the translator (`damage`, `healing`, `control`, `utility`, `buff`, `protection`, `ritual`)
   - ✅ Harness now reports spell mismatch metrics:
     - `Spell Theme Mismatch Rate` (cases with 1+ unmatched spell themes, among spellcasters)
     - `Avg Unmatched Spell Themes`
   - Next: run a 24–48 case caster-only live sample and inspect mismatch rates:
     `--classes wizard,cleric,bard,warlock,paladin,ranger --levels 2,3 --count 48`
