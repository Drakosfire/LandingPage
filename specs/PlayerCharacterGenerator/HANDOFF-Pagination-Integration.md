# Handoff: Character Sheet Pagination Integration
**Date:** December 7, 2025  
**Updated:** December 7, 2025 (Phase 2 Complete)  
**Type:** Feature Enhancement  
**Estimated Effort:** 12-18 hours (multiple phases)  
**Status:** Phase 2 Complete - Features overflow working with multi-page support

---

## Progress Summary

| Phase | Status | Notes |
|-------|--------|-------|
| Phase 0: Research & Spike | ✅ Complete | Canvas patterns understood |
| Phase 1: Responsive Scaling | ✅ Complete | ResizeObserver + CSS transform working |
| Phase 2: Features Overflow | ✅ Complete | Multi-page overflow with DOM measurement |
| Phase 3: SpellSheet Pagination | ⏳ Pending | Most complex case |
| Phase 4: Inventory Overflow | ⏳ Pending | |
| Phase 6: Manual Add Lines | ⏳ Pending | |

### Files Created (December 7, 2025)

| File | Purpose |
|------|---------|
| `hooks/useMeasureItems.tsx` | Lightweight Canvas-pattern measurement hook |
| `hooks/useFeaturesOverflow.tsx` | Features overflow detection & pagination |
| `hooks/index.ts` | Hooks barrel export |
| `sheetComponents/overflow/FeaturesOverflowPage.tsx` | Continuation page component |
| `sheetComponents/overflow/FeaturesOverflowPage.css` | PHB-styled overflow styling |
| `sheetComponents/overflow/index.ts` | Overflow components export |
| `canvasComponents/demoData/DEMO_OVERFLOW.ts` | Test character with 18 features |

### Key Decisions Made

1. **Continuation page style:** Simplified overflow layout with PHB parchment background
2. **Features overflow:** Stay on main sheet Column 3, overflow to continuation pages
3. **Measurement approach:** Lightweight `useMeasureItems` hook (not full Canvas integration)
4. **Mobile preservation:** Overflow disabled for mobile - uses natural scroll

---

## Context

We have built complete, visually polished static character sheet pages:
- **CharacterSheet** - Main stats, abilities, skills, combat, features
- **BackgroundPersonalitySheet** - Notes, traits, ideals, bonds, flaws  
- **InventorySheet** - Equipment, weapons, armor, consumables, treasure
- **SpellSheet** - Spellcasting info, slots, cantrips, prepared/known spells

These currently render as **fixed-height pages** without dynamic pagination. The next step is integrating with the Canvas layout system to enable:

1. **Overflow handling** - When features/spells/inventory grow, content flows to continuation pages
2. **Responsive scaling** - Sheets scale to fit viewport while maintaining measurement accuracy
3. **AI-generated character support** - Handle arbitrary-length data from AI generation

---

## Goal

Integrate the existing `sheetComponents` with the Canvas pagination system to handle dynamic content overflow while maintaining the current fixed-page layouts for primary sections.

**Success Criteria:**
- [x] Primary pages (CharacterSheet, InventorySheet, SpellSheet) render at fixed height
- [x] Overflow content (features) flows to continuation pages *(inventory, spells pending)*
- [ ] User can manually add lines to expandable sections
- [x] AI-generated characters with long feature lists paginate correctly
- [x] Responsive scaling works (fills viewport, no horizontal scroll)

---

## What We Have

### Current Architecture

```
CharacterCanvas.tsx
└── CharacterSheetContainer
    ├── CharacterSheet (Page 1 - fixed layout)
    ├── BackgroundPersonalitySheet (Page 2 - fixed layout)  
    ├── InventorySheet (Page 3 - fixed layout)
    └── SpellSheet (Page 4, if caster - fixed layout)
```

**Key Files:**
- `shared/CharacterCanvas.tsx` - Current rendering (no pagination)
- `sheetComponents/CharacterSheetPage.tsx` - Page container with `.page.phb` styling
- `sheetComponents/CharacterSheet.css` - Complete PHB styling (~2100 lines)
- `sheetComponents/*.tsx` - All section components

### Canvas System Reference (StatblockGenerator)

The StatblockGenerator already implements full pagination. Key concepts:

```
StatblockPage.tsx (orchestrator)
├── CanvasLayoutProvider (state management)
├── useCanvasLayout (pagination hook)
├── MeasurementCoordinator (off-screen measuring)
├── CanvasPage (renders paginated content)
└── componentRegistry.ts (maps component types to React components)
```

**Reference Files:**
- `StatBlockGenerator/StatblockPage.tsx` - Full pagination implementation
- `Canvas/src/hooks/useCanvasLayout.ts` - Core pagination hook
- `Canvas/src/layout/paginate.ts` - Pagination algorithm
- `Docs/ProjectDiary/2025/Canvas/CanvasLayout_DeepDive.md` - Architecture doc

---

## Pagination Strategy: Hybrid Fixed + Dynamic

### Design Decision: Fixed Page Shell + Dynamic Sections

Character sheets have **fixed page shells** (header, ability scores stay put) but many sections within can overflow:

| Page | Fixed Sections | Overflow-Capable Sections |
|------|----------------|---------------------------|
| **CharacterSheet** | Header, AbilityScores, Combat Stats | Attacks, Spellcasting, Features, Equipment, Proficiencies |
| **BackgroundPersonalitySheet** | Header | Notes (expandable + "Add Note" button) |
| **InventorySheet** | Header, Currency, Attunement | All inventory blocks (weapons, armor, gear, consumables, treasure) |
| **SpellSheet** | Spellcasting info header | All spell level sections (cantrips through 9th) |

### Overflow-Capable Sections (Comprehensive List)

**CharacterSheet (Page 1):**
- **Attacks & Spellcasting** (Column 2) - Weapons + spell attacks grow
- **Features and Traits** (Column 3) - Grows significantly with level/multiclass
- **Equipment** (Column 2) - List of carried items
- **Proficiencies** (Column 1) - Languages, tools, armor, weapons can be extensive

**BackgroundPersonalitySheet (Page 2):**
- **Notes** - Should expand dynamically + have "Add Note" button

**InventorySheet (Page 3):**
- **All InventoryBlocks** - Weapons, Armor, Magic Items, Adventuring Gear, Consumables, Treasure, Other

**SpellSheet (Page 4+):**
- **All Spell Level Sections** - Cantrips, 1st through 9th level spells

**Approach:** Each page has a fixed "shell" (header, static info), but content sections within register with measurement system and overflow to continuation pages when needed.

---

## Implementation Plan

### Phase 0: Research & Spike ✅ COMPLETE

**Goal:** Understand how to adapt Canvas system for hybrid pagination.

**Questions Answered:**
1. ✅ Can we use `useCanvasLayout` for only certain sections? → No, created lightweight alternative
2. ✅ How does StatblockGenerator handle "wide" components? → Not needed for PCG
3. ✅ What's the minimum integration for responsive scaling? → ResizeObserver + CSS transform

**Spike Tasks:**
- [x] Read `useCanvasLayout` hook and identify required inputs
- [x] Understand `componentRegistry` pattern and how components register
- [x] Study how `MeasurementLayer` measures off-screen
- [x] Identify what CSS variables Canvas expects (--dm-page-width, etc.)

### Phase 1: Responsive Scaling Only ✅ COMPLETE

**Goal:** Get sheets to scale responsively WITHOUT full pagination.

**Tasks:**
- [x] Add `ResizeObserver` to CharacterCanvas for scale calculation
- [x] Apply CSS transform scaling like StatblockPage does
- [x] Set CSS variables for page dimensions
- [x] Test at various viewport sizes

**Implementation:** See `CharacterCanvas.tsx` lines 205-232

### Phase 2: Features Overflow Infrastructure ✅ COMPLETE

**Goal:** Set up measurement infrastructure for features section.

**Approach Change:** Instead of full `MeasurementCoordinator` integration, created lightweight `useMeasureItems` hook that borrows Canvas patterns but is simpler for PCG.

**Tasks:**
- [x] Create `useMeasureItems` hook with ResizeObserver-based DOM measurement
- [x] Create `useFeaturesOverflow` hook for features split detection
- [x] Create `FeaturesOverflowPage` component for continuation pages
- [x] Wire measurement portal into CharacterCanvas
- [x] Test with DEMO_OVERFLOW character (18 features)

**Key Implementation Details:**

```typescript
// useMeasureItems returns measurementPortal as React.ReactNode (not component function!)
// This prevents infinite re-render loop - see LEARNINGS-Canvas-Measurement-Pagination-2025.md Issue 15
const { heights, isComplete, measurementPortal } = useMeasureItems({
    items: features,
    renderItem: (feature) => <FeatureMeasureItem feature={feature} />,
    cssContext: { className: 'page phb', contentWidthPx: 720 },
    enabled: !isMobile,
});

// Render portal as element, NOT as component
return <>{measurementPortal}</>; // ✅ CORRECT
return <MeasurementPortal />;     // ❌ WRONG - causes infinite loop
```

**Files Created:**
- `hooks/useMeasureItems.tsx` - Core measurement hook
- `hooks/useFeaturesOverflow.tsx` - Features-specific overflow logic
- `sheetComponents/overflow/FeaturesOverflowPage.tsx` - Overflow page component

### Phase 3: Pagination for SpellSheet (4-5 hours)

**Goal:** Full pagination for spell lists (most complex case).

SpellSheet is the best candidate for first pagination because:
- Spells can be very numerous (20+ prepared spells)
- Each spell level is a distinct "bucket" for pagination
- Clear visual pattern: spells overflow to next page

**Tasks:**
- [ ] Create `characterTemplates.ts` with spell sheet template config
- [ ] Create `characterPageDocument.ts` for building page structure
- [ ] Implement `useCanvasLayout` integration for SpellSheet
- [ ] Create continuation page component for spell overflow
- [ ] Test with DEMO_WIZARD (has many spells)

### Phase 4: Inventory Overflow (2-3 hours)

**Goal:** Inventory sections overflow to continuation pages.

**Tasks:**
- [ ] Add inventory sections to template config
- [ ] Implement overflow detection for each InventoryBlock
- [ ] Create inventory continuation page layout
- [ ] Test with DEMO_FIGHTER (comprehensive inventory)

### Phase 5: Features Overflow (2-3 hours)

**Goal:** Features section overflows when too many features.

**Tasks:**
- [ ] Add FeaturesSection to measurement system
- [ ] Define overflow behavior (continue on next page vs. dedicated features page)
- [ ] Test with multi-classed or high-level characters

### Phase 6: Manual Add Lines & Notes Expansion (3-4 hours)

**Goal:** User can manually add content to expandable sections.

**UX Patterns:**

**For List Sections (Features, Inventory, Attacks):**
- "+" button at bottom of each expandable section
- Clicking adds a blank line (for user to fill in)
- Lines persist in character data

**For Notes Section (special case):**
- Notes section should be built to expand naturally
- "Add Note" button creates new note entry
- Each note can have title + content
- Notes overflow to continuation pages when needed

**Tasks:**
- [ ] Add "Add Line" UI to FeaturesSection
- [ ] Add "Add Item" UI to InventoryBlocks
- [ ] Add "Add Attack" UI to Attacks section
- [ ] **Add "Add Note" button to Notes section**
- [ ] **Build Notes as expandable textarea or multi-entry list**
- [ ] Wire all additions to character state
- [ ] Re-measure after adding content
- [ ] Handle overflow when content exceeds page

---

## Critical Patterns to Adapt

### 1. Measure-First Flow (from CanvasLayout_DeepDive.md)

The Canvas system measures ALL components before pagination:

```
1. Components created → measurement entries generated
2. waitingForInitialMeasurements = true (pagination blocked)
3. MeasurementLayer renders off-screen, reports heights
4. All measurements arrive → buckets built → pagination runs
5. Layout committed, visible layer renders
```

**For PCG:** We only need this for dynamic sections (spells, inventory, features), not for fixed-layout sections.

### 2. Region Height Calculation

StatblockGenerator calculates region height from page dimensions:

```typescript
const PHB_FRAME_CONFIG: FrameConfig = {
    verticalBorderPx: 12.5,
    horizontalBorderPx: 10,
    columnPaddingPx: 10,
    columnVerticalPaddingPx: 16,
    componentGapPx: 12,
    pageFontSizePx: 12.8504,
    frameFontSizePx: 12.0189,
};
```

**For PCG:** We need to define similar config for character sheet frame.

### 3. Component Registry Pattern

StatblockGenerator uses a registry to map component types to React components:

```typescript
// componentRegistry.ts
export const CANVAS_COMPONENT_REGISTRY = {
    'name-header': { component: NameHeader },
    'ability-scores': { component: AbilityScoresBlock },
    'actions-list': { component: ActionsList },
    // ...
};
```

**For PCG:** We may need a simpler registry since we have fewer component types.

---

## What's Different from StatblockGenerator

| Aspect | StatblockGenerator | CharacterGenerator |
|--------|-------------------|-------------------|
| **Page structure** | Single flowing layout | Multiple distinct pages with fixed shells |
| **Content pagination** | All content flows | Fixed shells + many overflow sections |
| **Column layout** | Dynamic 1-2 columns | Fixed 3 columns on main sheet |
| **Component types** | ~15 canvas components | 4 page types, each with overflow sections |
| **Overflow sections** | Actions, Traits, Spells | Attacks, Features, Equipment, Proficiencies, Notes, Inventory, Spells |
| **User-added content** | No | Yes - "Add" buttons for each overflow section |

---

## CSS Variables Needed

Canvas expects certain CSS variables. We should set these in CharacterCanvas:

```css
.character-canvas-area {
    --dm-page-width: 816px;      /* US Letter at 96dpi */
    --dm-page-height: 1056px;
    --dm-page-scale: 1;          /* Updated by ResizeObserver */
    --dm-column-count: 3;        /* Main sheet is 3 columns */
    --dm-component-gap: 4px;     /* Our spacing scale */
}
```

---

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `shared/CharacterCanvas.tsx` | Modify | Add ResizeObserver, scale state, CSS variables |
| `characterMeasurement.tsx` | Create | Measurement wrappers for dynamic sections |
| `characterTemplates.ts` | Create | Template config for pagination (may exist, update) |
| `characterPageDocument.ts` | Create | Build page structure (may exist, update) |
| `SpellSheetPaginated.tsx` | Create | SpellSheet with pagination support |
| `InventoryOverflow.tsx` | Create | Inventory continuation page |
| `FeaturesOverflow.tsx` | Create | Features continuation page |
| `PlayerCharacterGeneratorProvider.tsx` | Modify | Add MeasurementCoordinator |

---

## Testing Checklist

### Responsive Scaling
- [ ] CharacterSheet renders at correct fixed dimensions
- [ ] Sheets scale down on narrow viewport (no horizontal scroll)
- [ ] Sheets scale up on wide viewport (max 2.5x)

### CharacterSheet Overflow
- [ ] Attacks section overflows with 10+ weapons/attacks
- [ ] Spellcasting section overflows with high-level caster
- [ ] Features section overflows with 15+ features (multiclass)
- [ ] Equipment list overflows with many items
- [ ] Proficiencies overflow with extensive language/tool list

### BackgroundPersonalitySheet Overflow
- [ ] Notes section expands as content is added
- [ ] "Add Note" button works and triggers re-measure
- [ ] Long notes overflow to continuation page

### InventorySheet Overflow
- [ ] Each inventory block (weapons, armor, gear, etc.) can overflow
- [ ] Mixed overflow (e.g., lots of weapons + lots of gear)

### SpellSheet Overflow
- [ ] Each spell level section can overflow independently
- [ ] Full spellbook (wizard with 20+ spells) paginates correctly

### Manual Add Functionality
- [ ] "Add Attack" button works
- [ ] "Add Feature" button works  
- [ ] "Add Item" button works (each inventory category)
- [ ] "Add Note" button works
- [ ] Adding content triggers re-pagination

### Integration Tests
- [ ] AI-generated wizard character with many spells paginates correctly
- [ ] AI-generated fighter with extensive equipment paginates correctly
- [ ] Print preview shows correct page breaks

---

## Success Metrics

1. **Responsive:** Sheet fits viewport without horizontal scroll
2. **Overflow:** Long lists create continuation pages
3. **Manual edit:** Users can add lines to expandable sections
4. **AI ready:** Generated characters with lots of content render correctly
5. **Performance:** <500ms initial render, <100ms re-pagination

---

## References

### Implementation References
- `StatBlockGenerator/StatblockPage.tsx` - Full pagination example
- `Canvas/src/hooks/useCanvasLayout.ts` - Core pagination hook
- `Docs/ProjectDiary/2025/Canvas/CanvasLayout_DeepDive.md` - Architecture doc

### Current Character Sheet Components
- `sheetComponents/CharacterSheet.tsx` - Main sheet
- `sheetComponents/SpellSheet.tsx` - Spell page
- `sheetComponents/InventorySheet.tsx` - Inventory page
- `sheetComponents/column3/FeaturesSection.tsx` - Features list

### Demo Data
- `canvasComponents/demoData/DEMO_FIGHTER.ts` - Fighter with comprehensive inventory
- `canvasComponents/demoData/DEMO_WIZARD.ts` - Wizard with many spells

---

## Open Questions

1. ~~**Should we start with scaling-only?**~~ → ✅ Yes, completed in Phase 1
2. ~~**Continuation page style:**~~ → ✅ Simplified overflow layout with PHB parchment
3. ~~**Features overflow:**~~ → ✅ Stay on main sheet Column 3, overflow to continuation pages
4. **Edit mode interaction:** How does pagination interact with edit mode? *(deferred)*
5. **Print optimization:** Do we need print-specific pagination logic? *(deferred)*

---

**Next Step:** Phase 3 (SpellSheet Pagination) - Most complex overflow case with multiple spell levels.

