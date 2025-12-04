# UI Research Handoff: PHB-Style Character Sheet Layout

**Date:** December 4, 2025  
**Purpose:** Handoff document for new agent focusing on character sheet UI/layout research  
**Status:** Current implementation is functional but needs significant visual refinement

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

## 3. Reference: StatblockGenerator Canvas System

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

**Start with these to understand current state:**

1. `specs/PlayerCharacterGenerator/research/DESIGN-PHB-Character-Sheet-Implementation.md` - Locked design document with decisions made
2. `src/styles/CharacterComponents.css` - Current CSS classes
3. `src/components/PlayerCharacterGenerator/canvasComponents/CharacterSheetRenderer.tsx` - Page orchestration
4. `src/components/PlayerCharacterGenerator/canvasComponents/sections/` - All section components

**Reference for proven patterns:**
1. `src/styles/StatblockComponents.css` - How monster statblocks are styled
2. `src/components/StatBlockGenerator/canvasComponents/` - Mature canvas implementation

**Test data:**
1. `src/components/PlayerCharacterGenerator/canvasComponents/demoData/DEMO_FIGHTER.ts` - Sample character for testing

---

## 9. Success Criteria

The new design should achieve:

1. **Visual Authenticity** - Looks like it belongs in the Player's Handbook
2. **Functional Layout** - All character data visible and organized logically
3. **Multi-Page Support** - Graceful handling of 2-3 page characters
4. **Print-Ready** - Can export to PDF without visual issues
5. **Responsive Canvas** - Scales appropriately in the UI container

---

## 10. Immediate Next Steps

1. **Research Phase**
   - Study Homebrewery CSS for character sheet patterns
   - Find example character sheet HTML/CSS implementations
   - Document visual patterns needed (ability boxes, proficiency markers, etc.)

2. **Design Phase**
   - Create mockup/wireframe of target layout
   - Define CSS class structure
   - Plan page content allocation (what goes on each page)

3. **Implementation Phase**
   - Update `CharacterComponents.css` with refined styles
   - Refactor section components to use proper CSS classes
   - Test with `DEMO_FIGHTER` data

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

