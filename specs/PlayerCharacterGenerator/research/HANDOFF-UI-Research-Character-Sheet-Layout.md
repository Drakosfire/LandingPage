# UI Research Handoff: PHB-Style Character Sheet Layout

**Date:** December 4, 2025  
**Purpose:** Handoff document for new agent focusing on character sheet UI/layout research  
**Status:** Current implementation is functional but needs significant visual refinement

---

## ⚠️ CRITICAL: Canvas Package Not Used

**The current PCG implementation does NOT use the `@dungeonmind/canvas` package.**

This is a **major architectural problem**. The Canvas package provides:
- ✅ Measurement-driven layout (accurate height calculation)
- ✅ Automatic multi-page pagination
- ✅ Multi-column overflow handling
- ✅ Component registry pattern
- ✅ Adapter pattern for domain-specific logic
- ✅ Print optimization
- ✅ Battle-tested in StatblockGenerator

**What PCG built instead (wrong approach):**
- ❌ Custom components with inline styles
- ❌ Manual page structure without measurement
- ❌ No pagination engine
- ❌ No height estimation
- ❌ No adapter pattern integration

### How StatblockGenerator Uses Canvas

```typescript
// LandingPage/src/components/StatBlockGenerator/canvasAdapters.ts
import type {
    DataResolver,
    ListNormalizer,
    HeightEstimator,
    MetadataExtractor,
    CanvasAdapters,
} from 'dungeonmind-canvas';
import { createDefaultAdapters } from 'dungeonmind-canvas';

// StatblockGenerator creates domain-specific adapters
export const createStatblockAdapters = (): CanvasAdapters => {
    // ... implements adapters for statblock data
};
```

### What PCG Should Do

1. **Create `characterAdapters.ts`** - Implement `CanvasAdapters` for character data
2. **Use `useCanvasLayout` hook** - Get measurement-driven pagination
3. **Register components** with Canvas component registry
4. **Let Canvas handle** multi-page layout, overflow, measurement

### Key Files to Study

- **Canvas Architecture:** `Canvas/ARCHITECTURE.md` (652 lines)
- **Adapter Guide:** `Canvas/ADAPTER_IMPLEMENTATION_GUIDE.md` (502 lines)
- **StatblockGenerator Example:** `LandingPage/src/components/StatBlockGenerator/canvasAdapters.ts`
- **Canvas Package:** `Canvas/src/` (the actual implementation)

**This refactor is prerequisite to any visual work.** The current approach won't scale.

---

## 1. Project Overview

### What We're Building
The **Player Character Generator (PCG)** is a D&D 5e character creation tool within the DungeonMind ecosystem. It allows users to:
1. Create characters through a step-by-step wizard (race, class, background, etc.)
2. View the resulting character on a **canvas-rendered character sheet** styled like the official Player's Handbook (PHB)

### The Problem
We have functional data flow (wizard → data model → display), but the **visual rendering is basic**. The character sheet doesn't look like an authentic PHB character sheet - it's just styled data display.

### The Goal
Render multi-page character sheets that look like they came from the Player's Handbook, using:
- Authentic PHB typography, colors, and parchment textures
- Proper two-column layout within framed sections
- Iconic visual elements (ability score boxes, proficiency markers, death save circles)

---

## 2. Current Architecture

### File Structure
```
LandingPage/src/components/PlayerCharacterGenerator/
├── canvasComponents/
│   ├── CharacterSheetPage.tsx      # Page wrapper (.page.phb)
│   ├── CharacterSheetRenderer.tsx  # Multi-page orchestrator
│   ├── sections/                   # PHB-styled section components
│   │   ├── AbilityScoresSection.tsx
│   │   ├── SavesSkillsSection.tsx
│   │   ├── CombatStatsSection.tsx
│   │   ├── AttacksSection.tsx
│   │   ├── FeaturesSection.tsx
│   │   ├── EquipmentSection.tsx
│   │   ├── ProficienciesSection.tsx
│   │   ├── BackgroundSection.tsx
│   │   └── SpellcastingSection.tsx
│   └── demoData/
│       └── DEMO_FIGHTER.ts         # Test data for rendering
├── shared/
│   └── CharacterCanvas.tsx         # Entry point (uses CharacterSheetRenderer)
└── types/dnd5e/
    └── character.types.ts          # Data model
```

### CSS Files
```
LandingPage/src/styles/
├── canvas/
│   ├── index.css                   # Imports all canvas styles
│   ├── canvas-base.css             # Layout fundamentals
│   ├── canvas-dnd-theme.css        # D&D colors/fonts
│   └── canvas-print.css            # Print optimization
├── CharacterComponents.css         # NEW: Character-specific PHB styles
└── StatblockComponents.css         # Monster statblock styles (reference)
```

### Current HTML Structure
The `CharacterSheetRenderer` produces:
```html
<div class="brewRenderer dm-canvas-responsive">
  <div class="pages">
    <div class="page phb" id="page1">
      <div class="columnWrapper">
        <div class="block character frame">
          <!-- Section content -->
        </div>
      </div>
      <div class="page-number">1</div>
    </div>
  </div>
</div>
```

---

## 3. The Canvas Package (@dungeonmind/canvas)

The Canvas package is a **generic, template-driven rendering engine** for multi-column, multi-page layouts. It's already used by StatblockGenerator and should be used by PCG.

### Canvas Architecture (High Level)

```
┌─────────────────────────────────────────────────────────────┐
│ Application Layer (PlayerCharacterGenerator)                │
│ - Provides domain-specific adapters (characterAdapters.ts) │
│ - Provides component registry                               │
│ - Provides data sources (character data)                    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ Canvas Hook Layer (useCanvasLayout)                         │
│ - Manages component lifecycle                               │
│ - Coordinates state updates                                 │
│ - Provides MeasurementLayer                                 │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ Layout Engine Layer                                         │
│ ├── Bucket Builder - Groups components by region            │
│ ├── Planner - Determines segment placement                  │
│ └── Paginator - Places components in pages/columns          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ Measurement Layer                                           │
│ - Offscreen rendering for height measurement                │
│ - Accurate layout without guessing                          │
└─────────────────────────────────────────────────────────────┘
```

### Adapter Interfaces PCG Must Implement

```typescript
// characterAdapters.ts - TO BE CREATED

interface CanvasAdapters {
    dataResolver: DataResolver;        // Get fields from character data
    listNormalizer: ListNormalizer;    // Normalize arrays (skills, spells, etc.)
    heightEstimator: HeightEstimator;  // Estimate section heights
    metadataExtractor: MetadataExtractor; // Get name for export
    regionContentFactory: RegionContentFactory; // Create region content
}

// Example: HeightEstimator for character sections
const characterHeightEstimator: HeightEstimator = {
    estimateItemHeight(item: unknown): number {
        // Estimate height of a skill row, spell entry, etc.
        return 24; // pixels
    },
    
    estimateListHeight(items: unknown[], isContinuation: boolean): number {
        // Estimate height of skills block, spells list, etc.
        const headerHeight = isContinuation ? 0 : 36;
        return headerHeight + (items.length * 24);
    },
    
    estimateComponentHeight(component: unknown): number {
        // Estimate height of ability scores block, combat stats, etc.
        return 200;
    }
};
```

### Key Canvas Files to Read

| File | Purpose |
|------|---------|
| `Canvas/ARCHITECTURE.md` | Complete system documentation |
| `Canvas/ADAPTER_IMPLEMENTATION_GUIDE.md` | How to implement adapters |
| `Canvas/src/hooks/useCanvasLayout.ts` | The main hook PCG should use |
| `Canvas/src/types/adapters.types.ts` | Adapter interface definitions |
| `Canvas/src/layout/paginate.ts` | Pagination engine |

---

## 4. Reference: StatblockGenerator Canvas System

The **StatblockGenerator** has a mature canvas system that renders monster statblocks in PHB style. It's the best internal reference for how to build character sheets.

### Key StatblockGenerator Patterns

**File:** `LandingPage/src/components/StatBlockGenerator/canvasComponents/`

1. **Component Registry Pattern**
   - Components register with metadata (render order, required data)
   - Canvas renders components dynamically based on available data

2. **Measurement Layer**
   - Hidden layer measures component heights before final render
   - Enables intelligent column/page allocation

3. **CSS Layer System**
   ```css
   @layer theme { /* D&D decorative styles */ }
   @layer canvas-structure { /* Layout/positioning */ }
   @layer canvas-overrides { /* Specific overrides */ }
   ```

4. **Two-Column Layout**
   - Uses `.monster.frame.wide` with flexbox columns
   - Child `.canvas-column` divs for explicit column control

### What Statblock Does Well
- ✅ Authentic PHB monster statblock appearance
- ✅ Responsive column layout
- ✅ Print-optimized output
- ✅ Dynamic content fitting

### What's Different for Character Sheets
- Character sheets have more varied sections (skills list, spell slots, equipment inventory)
- Character sheets span 2-3 pages vs. single-page statblocks
- Character sheets have iconic visual elements (ability boxes, death saves)
- Character sheets need different information density

---

## 4. Current Visual Problems

### What's Rendering Now
The current output is functional but visually basic:
- Plain lists instead of iconic layouts
- No visual hierarchy between sections
- Missing parchment frame aesthetics
- Ability scores in a table, not the classic 6-box layout
- Skills/saves as plain lists, not the checkbox-style proficiency markers

### Reference: What We Want
Look at:
- Official D&D 5e character sheet PDF
- D&D Beyond character sheet UI
- Homebrewery character sheet examples

Key visual elements to achieve:
1. **Ability Score Boxes** - Square boxes with score on top, modifier below
2. **Proficiency Markers** - Filled/empty circles (●/○) before skills/saves
3. **Death Saves** - Three circles for successes, three for failures
4. **Spell Slots** - Checkbox-style tracking (■■□□□)
5. **Framed Sections** - Parchment-colored boxes with subtle borders
6. **Typography** - NodestoCaps for headers, ScalySans for body text

---

## 5. Available CSS Classes (CharacterComponents.css)

We've defined these CSS classes, but they need refinement and proper visual testing:

```css
/* Frame wrapper */
.page .character.frame { /* Parchment box */ }

/* Ability scores */
.ability-scores-grid { /* 6-column grid */ }
.ability-box { /* Individual score box */ }
.ability-label { /* STR, DEX, etc. */ }
.ability-score { /* The number */ }
.ability-modifier { /* +3, -1, etc. */ }

/* Skills & Saves */
.skills-list, .saves-list { /* 2-column list */ }
.skill-item, .save-item { /* Single row */ }
.proficiency-marker { /* ●/○ indicator */ }

/* Combat */
.combat-stats-grid { /* 3-column: AC/Init/Speed */ }
.combat-stat-box { /* Individual stat box */ }
.hp-box { /* Hit points display */ }
.death-saves { /* Success/failure tracking */ }

/* Equipment */
.equipment-list { /* Inventory items */ }
.attacks-table { /* Weapon attacks */ }

/* Spellcasting */
.spell-slot-tracker { /* Slot checkboxes */ }
.spellList { /* Multi-column spell list */ }
```

---

## 6. External References for Research

### Homebrewery (Primary Reference)
- **GitHub:** https://github.com/naturalcrit/homebrewery
- **Live:** https://homebrewery.naturalcrit.com/
- **Key Files:**
  - `client/homebrew/phbStyle/` - PHB CSS classes
  - `client/homebrew/themes/` - Theme variations
- **Why:** They've solved PHB styling for web. Study their CSS patterns.

### GM Binder (Secondary Reference)
- **Live:** https://www.gmbinder.com/
- **Example:** https://www.gmbinder.com/share/-L0WUSjJyFHG7PDyIFta
- **Why:** Alternative implementation of PHB styling

### D&D Beyond
- **Character Sheet:** https://www.dndbeyond.com/characters
- **Why:** Modern interpretation of character sheet UI, responsive design

### Official D&D Character Sheet
- Search: "D&D 5e character sheet PDF"
- **Why:** The canonical layout we're trying to replicate

---

## 7. Research Questions for New Agent

1. **Layout Strategy**
   - Should each "section" be a separate `.character.frame` or should we use one large frame per page?
   - How do Homebrewery/GM Binder handle multi-page character sheets?
   - What's the best approach for column flow vs. explicit positioning?

2. **Visual Fidelity**
   - What CSS is needed to achieve the classic ability score boxes?
   - How should proficiency markers (●/○) be implemented - CSS pseudo-elements or actual characters?
   - What fonts are closest to the PHB fonts, and are they available?

3. **Content Overflow**
   - How should we handle characters with many features (e.g., high-level casters)?
   - Should spell lists auto-paginate or use a condensed format?
   - How do we handle equipment overflow?

4. **Print Optimization**
   - What CSS is needed for clean page breaks?
   - How do we ensure backgrounds/colors print correctly?

---

## 8. Files to Read

### PRIORITY 1: Canvas Package (Read First!)

1. `Canvas/ARCHITECTURE.md` - **Complete system documentation** (652 lines)
2. `Canvas/ADAPTER_IMPLEMENTATION_GUIDE.md` - **How to implement adapters** (502 lines)
3. `Canvas/src/types/adapters.types.ts` - Adapter interface definitions
4. `Canvas/src/hooks/useCanvasLayout.ts` - The hook PCG should use

### PRIORITY 2: Working Example (StatblockGenerator)

1. `LandingPage/src/components/StatBlockGenerator/canvasAdapters.ts` - **How StatBlock uses Canvas**
2. `LandingPage/src/styles/StatblockComponents.css` - PHB styling for statblocks
3. `LandingPage/src/components/StatBlockGenerator/canvasComponents/` - Canvas component registry

### PRIORITY 3: Current PCG State (Needs Refactor)

1. `specs/PlayerCharacterGenerator/research/DESIGN-PHB-Character-Sheet-Implementation.md` - Design decisions (may need revision)
2. `src/styles/CharacterComponents.css` - CSS classes (keep, integrate with Canvas)
3. `src/components/PlayerCharacterGenerator/canvasComponents/CharacterSheetRenderer.tsx` - **REPLACE with Canvas**
4. `src/components/PlayerCharacterGenerator/canvasComponents/sections/` - **Convert to Canvas components**

### Test Data

1. `src/components/PlayerCharacterGenerator/canvasComponents/demoData/DEMO_FIGHTER.ts` - Sample character for testing

---

## 9. Success Criteria

The new design should achieve:

### Architecture (Phase 0 - BLOCKING)
1. **Canvas Integration** - Uses `@dungeonmind/canvas` package, NOT custom rendering
2. **Character Adapters** - `characterAdapters.ts` implements all required adapter interfaces
3. **Component Registry** - Character components registered with Canvas registry
4. **Measurement-Driven** - Layout determined by actual height measurements

### Visual (Phase 1)
5. **Visual Authenticity** - Looks like it belongs in the Player's Handbook
6. **Functional Layout** - All character data visible and organized logically
7. **Multi-Page Support** - Graceful handling of 2-3 page characters (via Canvas pagination)
8. **Print-Ready** - Can export to PDF without visual issues
9. **Responsive Canvas** - Scales appropriately in the UI container

---

## 10. Canvas Integration Progress

### Completed (December 4, 2025)

1. ✅ **Canvas Architecture Study** - Reviewed `ARCHITECTURE.md` and `ADAPTER_IMPLEMENTATION_GUIDE.md`

2. ✅ **Character Adapters Created** - `characterAdapters.ts`
   - `DataResolver` for character data (handles `dnd5eData` nested paths)
   - `ListNormalizer` for features, equipment, spells
   - `HeightEstimator` for character sections (ability scores, combat stats, etc.)
   - `MetadataExtractor` for character name/level/class/race

3. ✅ **Character Templates Created** - `characterTemplates.ts`
   - `phbCharacterTemplate` - PHB-style multi-page layout
   - `compactCharacterTemplate` - Single-page quick reference

4. ✅ **Canvas Registry Created** - `canvasComponents/canvasRegistry.ts`
   - Wrapper components bridging existing section components with Canvas props
   - `CHARACTER_CANVAS_REGISTRY` with all character components

5. ✅ **Page Document Builder** - `characterPageDocument.ts`
   - `buildCharacterPageDocument()` creates Canvas-compatible page documents
   - `updateCharacterDataSources()` for live updates

### Remaining (Deferred)

6. ⏳ **Full `useCanvasLayout` Integration**
   - Create `CharacterPage.tsx` similar to `StatblockPage.tsx`
   - Wire measurement system
   - Replace `CharacterSheetRenderer` with Canvas rendering

**Note:** Current `CharacterSheetRenderer` works correctly for manual page layout. Full Canvas integration provides automatic pagination but is not blocking for current development.

### Files Created Summary

| File | Purpose |
|------|---------|
| `characterAdapters.ts` | Canvas adapters for character data (DataResolver, HeightEstimator, etc.) |
| `characterTemplates.ts` | Template configs (PHB-style, Compact) |
| `canvasComponents/canvasRegistry.tsx` | Canvas-compatible wrapper components |
| `characterPageDocument.ts` | Page document builder for Canvas |

### Test Status

All 574 PlayerCharacterGenerator tests passing. TypeScript compiles without errors.

### Canvas Package Dependency

**The Canvas package needs modification** to support `'character'` data references.

**Spec:** `Canvas/specs/SPEC-Add-Character-DataReference-Type.md`

**Summary of Change:**
1. Add `{ type: 'character'; path: string; sourceId?: string }` to `ComponentDataReference` union
2. Update `createDefaultDataResolver()` to handle nested paths (e.g., `'dnd5eData.abilityScores'`)
3. Optional: Add `characterData` option to `PageDocumentBuilder`

### Next Steps for Full Canvas Integration

After Canvas modification is complete:
1. Update `characterAdapters.ts` to use native `'character'` type
2. Create `CharacterPage.tsx` following `StatblockPage.tsx` pattern
3. Wire `useCanvasLayout` hook with character adapters
4. Use `MeasurementPortal` for height measurement
5. Update `CharacterCanvas.tsx` to use new `CharacterPage`

### Phase 1: Visual Research (After Canvas Integration)

1. **Research**
   - Study Homebrewery CSS for character sheet patterns
   - Find example character sheet HTML/CSS implementations
   - Document visual patterns needed (ability boxes, proficiency markers, etc.)

2. **Design**
   - Create mockup/wireframe of target layout
   - Define CSS class structure
   - Plan page content allocation (what goes on each page)

3. **Implementation**
   - Update `CharacterComponents.css` with refined styles
   - Create Canvas-compatible section components
   - Test with `DEMO_FIGHTER` data through Canvas

---

## 11. Current Rendering (Screenshot Reference)

The current rendering shows:
- Basic ability score table (not the iconic 6-box layout)
- Plain lists for saving throws and skills
- Functional but not visually authentic

**What we have:** Data displayed correctly
**What we need:** Data displayed beautifully in PHB style

---

**End of Handoff**

*This document provides context for a fresh agent to research and design improved character sheet layouts. Focus on visual authenticity while leveraging the existing component architecture.*

