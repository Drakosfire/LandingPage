# Handoff: PCG Component Implementation
**Date:** December 5, 2025  
**Goal:** Build React components for character sheet rendering

---

## Architecture (TL;DR)

**Main pages** (Character, Spells, Inventory) = **static layouts** with fixed component positions  
**Overflow pages** = **Canvas-driven** with measurement-based pagination

Canvas is used for: font loading, responsive scaling, CSS variables, and overflow page pagination.

---

## Required Reading (in order)

1. **Design (LOCKED):** `specs/PlayerCharacterGenerator/DESIGN-Canvas-Character-Sheet-Integration.md`
   - Section 2.3: Canvas-PCG Contract
   - Section 8: Implementation Phases
   - Section 13: Lessons Applied

2. **Component Breakdown:** `specs/PlayerCharacterGenerator/ANALYSIS-Page-Layout-Components.md`
   - Static vs Dynamic classification
   - Component priority for implementation

3. **Build Guide:** `Docs/Guides/GUIDE-Canvas-Component-Building.md`
   - Component architecture patterns
   - Edit locking pattern
   - CSS conventions

---

## HTML Prototypes (Visual Reference)

```
specs/PlayerCharacterGenerator/prototypes/
├── character-sheet.html   ← Main character page
├── spell-sheet.html       ← Spellcasting page
├── inventory-sheet.html   ← Equipment/inventory page
└── phb-prototype.css      ← Shared PHB styling
```

Open these in browser to see target layouts.

---

## Immediate Tasks

**Phase 1: Character Sheet Core (Static Components)**

Start with these high-priority static components from `character-sheet.html`:

| Component | Priority | Notes |
|-----------|----------|-------|
| `CharacterHeader` | P0 | Name, class, level, race, background |
| `AbilityScores` | P0 | 6 stats in horizontal row |
| `SavingThrows` | P0 | 6 saves with proficiency dots |
| `Skills` | P0 | 18 skills with proficiency dots |
| `CombatStats` | P0 | AC, Initiative, Speed, HP |
| `PersonalityTraits` | P1 | Traits, Ideals, Bonds, Flaws |

**File structure:**
```
src/components/PlayerCharacterGenerator/
├── sheetComponents/
│   ├── CharacterHeader.tsx
│   ├── AbilityScores.tsx
│   ├── SavingThrows.tsx
│   └── ...
└── CharacterSheet.css  ← Extract from phb-prototype.css
```

---

## Key Constraints

- **Font loading gate required** (FR-041) - no render until PHB fonts load
- **US Letter dimensions** (FR-040) - 816px × 1056px at 96dpi
- **Section bounds for overflow** (FR-038):
  - Features: 8 items max
  - Attacks: 5 items max  
  - Equipment: 12 items max
  - Spells/level: 8 max

---

## Reference Files

- **Spec:** `specs/PlayerCharacterGenerator/spec.md`
- **Tasks:** `specs/PlayerCharacterGenerator/tasks.md`
- **Character types:** `src/types/dnd5e/character.types.ts`
- **StatBlock example:** `src/components/StatBlockGenerator/` (reference implementation)

