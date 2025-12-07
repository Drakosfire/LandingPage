# Handoff: Character Sheet Pagination Integration
**Date:** December 7, 2025  
**Type:** Feature Enhancement  
**Estimated Effort:** 12-18 hours (multiple phases)

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
- [ ] Primary pages (CharacterSheet, InventorySheet, SpellSheet) render at fixed height
- [ ] Overflow content (features, inventory, spells) flows to continuation pages
- [ ] User can manually add lines to expandable sections
- [ ] AI-generated characters with long feature/spell lists paginate correctly
- [ ] Responsive scaling works (fills viewport, no horizontal scroll)

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

### Design Decision: Primary Pages Stay Fixed

Unlike StatblockGenerator (where ALL content flows dynamically), character sheets have **logical page boundaries**:

| Page | Content | Pagination Behavior |
|------|---------|---------------------|
| **Page 1** | CharacterSheet (header, abilities, combat, attacks) | Fixed height - never overflows |
| **Page 2** | BackgroundPersonalitySheet (traits, notes) | Fixed height - notes can expand |
| **Page 3** | InventorySheet | Fixed height - inventory can overflow |
| **Page 4+** | SpellSheet | **Dynamic** - spells overflow to continuation pages |
| **Overflow** | FeaturesSection, InventoryBlocks, SpellLists | **Dynamic** - measured and paginated |

### Key Insight: Features/Spells/Inventory Can Grow

These sections need overflow handling:
- **FeaturesSection** (Column 3) - Class/racial features grow with level
- **InventoryBlocks** - Equipment list can grow significantly
- **SpellLists** - Casters can have 20+ prepared spells

**Approach:** Keep primary pages at fixed dimensions, but specific sections within them register with the measurement system and overflow to continuation pages.

---

## Implementation Plan

### Phase 0: Research & Spike (2-3 hours)

**Goal:** Understand how to adapt Canvas system for hybrid pagination.

**Questions to Answer:**
1. Can we use `useCanvasLayout` for only certain sections?
2. How does StatblockGenerator handle "wide" components that span columns?
3. What's the minimum integration needed for responsive scaling?

**Spike Tasks:**
- [ ] Read `useCanvasLayout` hook and identify required inputs
- [ ] Understand `componentRegistry` pattern and how components register
- [ ] Study how `MeasurementLayer` measures off-screen
- [ ] Identify what CSS variables Canvas expects (--dm-page-width, etc.)

### Phase 1: Responsive Scaling Only (3-4 hours)

**Goal:** Get sheets to scale responsively WITHOUT full pagination.

This gives us the visual polish of responsive scaling while we work on pagination.

**Tasks:**
- [ ] Add `ResizeObserver` to CharacterCanvas for scale calculation
- [ ] Apply CSS transform scaling like StatblockPage does
- [ ] Set CSS variables for page dimensions
- [ ] Test at various viewport sizes

**Reference Pattern (from StatblockPage.tsx):**
```typescript
useLayoutEffect(() => {
    const observer = new ResizeObserver((entries) => {
        const availableWidth = entry.contentRect.width - paddingLeft - paddingRight;
        const widthScale = availableWidth / baseWidthPx;
        const nextScale = clamp(widthScale, MIN_SCALE, MAX_SCALE);
        setScale(nextScale);
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
}, [baseWidthPx]);
```

### Phase 2: MeasurementCoordinator Integration (4-5 hours)

**Goal:** Set up measurement infrastructure for dynamic sections.

**Tasks:**
- [ ] Create `MeasurementCoordinator` in `PlayerCharacterGeneratorProvider`
- [ ] Identify which sections need measurement:
  - `FeaturesSection` (can grow with level)
  - `InventoryBlock` (each category can grow)
  - `SpellLevelSection` (each spell level can grow)
- [ ] Create measurement wrapper components for dynamic sections
- [ ] Wire `MeasurementPortal` into CharacterCanvas

**Key Decision: Measurement Keys**

Each measurable section needs a unique measurement key:
```typescript
// Pattern from StatblockGenerator
const measurementKey = `${characterId}:features:block`;
const measurementKey = `${characterId}:inventory:weapons:block`;
const measurementKey = `${characterId}:spells:level1:block`;
```

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

### Phase 6: Manual Add Lines (2-3 hours)

**Goal:** User can manually add blank lines to expandable sections.

**UX Pattern:**
- "+" button at bottom of each expandable section
- Clicking adds a blank line (for user to fill in)
- Lines persist in character data

**Tasks:**
- [ ] Add "Add Line" UI to FeaturesSection
- [ ] Add "Add Item" UI to InventoryBlocks  
- [ ] Wire to character state (add empty item to array)
- [ ] Re-measure after adding line

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
| **Page structure** | Single flowing layout | Multiple distinct pages |
| **All content paginated** | Yes | No - primary pages are fixed |
| **Column layout** | Dynamic 1-2 columns | Fixed 3 columns on main sheet |
| **Component types** | ~15 canvas components | 4 main pages + overflow sections |
| **Template complexity** | High (many slots) | Lower (fewer dynamic sections) |

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

- [ ] CharacterSheet renders at correct fixed dimensions
- [ ] Sheets scale down on narrow viewport (no horizontal scroll)
- [ ] Sheets scale up on wide viewport (max 2.5x)
- [ ] SpellSheet overflows to continuation page with 20+ spells
- [ ] InventorySheet overflows with 30+ items
- [ ] FeaturesSection overflows with 15+ features
- [ ] Manual "Add Line" works in each expandable section
- [ ] AI-generated wizard character with many spells paginates correctly
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

1. **Should we start with scaling-only?** Get responsive working before full pagination?
2. **Continuation page style:** Same PHB styling as primary pages?
3. **Features overflow:** Stay on main sheet or dedicated features page?
4. **Edit mode interaction:** How does pagination interact with edit mode?
5. **Print optimization:** Do we need print-specific pagination logic?

---

**Next Step:** Start with Phase 0 (Research & Spike) to understand Canvas integration points, then Phase 1 (Responsive Scaling) for immediate visual improvement.

