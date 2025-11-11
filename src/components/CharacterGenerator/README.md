# Character Generator

D&D 5e character creation tool with AI generation and manual workflows.

## Status

**Phase 0: Foundation** ✅ COMPLETE (November 3, 2025)
- ✅ Two-layer architecture (system-agnostic wrapper + D&D 5e specifics)
- ✅ TypeScript interfaces defined (types/system.types.ts, types/character.types.ts, types/dnd5e/)
- ✅ Sample SRD data (Hill Dwarf race)
- ✅ Skeleton components (CharacterGenerator, CharacterGeneratorProvider)
- ✅ Test infrastructure ready
- ✅ 15+ foundation tests passing
- ✅ Zero linter errors

**Phase 1: Ability Scores** 🚧 NEXT
- See: `Docs/ProjectDiary/2025/CharacterGenerator/2025-11-03-phase1-ability-scores-HANDOFF.md` (to be created)

## Architecture

### Two-Layer Design for Multi-System Support

```
Character (wrapper)
├── system: 'dnd5e' | 'pathfinder1e' | 'osr' | ...
├── dnd5eData?: DnD5eCharacter      ← D&D 5e specific
└── pathfinderData?: ...             ← Future: Pathfinder specific
```

**Benefits:**
- Build D&D 5e NOW (concrete, fast development)
- Extend to Pathfinder/OSR LATER (new namespace, zero refactoring)
- Follows StatblockGenerator proven pattern

### Directory Structure

```
CharacterGenerator/
├── types/
│   ├── system.types.ts          # System-agnostic (CreatureSize, SpeedObject, etc.)
│   ├── character.types.ts       # Character wrapper
│   └── dnd5e/                   # D&D 5e-specific types
│       ├── character.types.ts
│       ├── race.types.ts
│       ├── class.types.ts
│       ├── background.types.ts
│       ├── equipment.types.ts
│       └── spell.types.ts
├── data/
│   └── dnd5e/                   # D&D 5e SRD data
│       ├── races.ts             # Currently: Hill Dwarf (Phase 0)
│       ├── classes.ts           # Phase 1+
│       └── backgrounds.ts       # Phase 1+
├── rules/
│   └── dnd5e/                   # D&D 5e game rules
│       └── (Phase 1+)
└── validation/
    └── dnd5e/                   # D&D 5e validation
        └── (Phase 1+)
```

## Running Tests

```bash
cd LandingPage

# All CharacterGenerator tests
npm test -- CharacterGenerator

# Watch mode
npm test -- --watch CharacterGenerator

# Coverage
npm test -- --coverage CharacterGenerator
```

**Current Test Count:** 15+ tests passing

## Development

```bash
# Start dev server
cd LandingPage
npm run dev

# Navigate to CharacterGenerator
# http://localhost:3000/character-generator (Phase 1+ routing)
```

## Design Documents

- **CHARACTER_GENERATOR_DESIGN.md** - Complete vision
- **CHARACTER_CREATION_ALGORITHM.md** - D&D 5e rules implementation
- **2025-11-03-phase0-foundation-HANDOFF.md** - Phase 0 specification

## Data Sources

- **SRD Content:** https://www.5esrd.com/
- **D&D Beyond:** Reference only (not scraped)
- **Open5e API:** Structured data source

## Next Steps (Phase 1)

**Ability Score Assignment** (8-10 hours):
1. Point buy calculator (27 points)
2. Standard array selector
3. Dice rolling simulator
4. Ability score validation
5. Race ability bonuses
6. 28 tests for ability score system

## Learnings from StatblockGenerator

**What Worked:**
- TypeScript data files (not JSON) ✅
- Test-first approach ✅
- Provider pattern for state ✅
- Fixture data for tests ✅

**Applied to CharacterGenerator:**
- Two-layer architecture (NEW)
- Namespaced by system (NEW)
- System-agnostic wrapper (NEW)
- Same Provider pattern ✅

