# Handoff: Mobile Responsiveness Retrofit
**Date:** December 7, 2025  
**Type:** Technical Debt / UX Enhancement  
**Estimated Effort:** 16-24 hours (finicky work)  
**Difficulty:** High - Retrofitting is harder than building mobile-first

---

## Context

**StatblockGenerator was built mobile-first.**  
It uses `dm-canvas-responsive` containers, ResizeObserver for dynamic scaling, CSS variables, and media queries throughout.

**PlayerCharacterGenerator was NOT built mobile-first.**  
The HTML prototypes and resulting components use fixed pixel widths (816px × 1056px) with a 3-column layout designed for desktop viewing.

This handoff captures what we know about the StatblockGenerator patterns and the challenges of retrofitting them to PCG.

---

## What StatblockGenerator Does Right (Patterns to Adopt)

### 1. Responsive Container Pattern

```css
/* canvas-base.css */
.dm-canvas-responsive {
    --dm-page-scale: 1;
    --dm-page-width: 816px;
    --dm-page-height: 1056px;
    --dm-column-count: 2;
    --dm-column-gap: 12px;
    
    width: 100%;
    max-width: 100%;
    margin: 0 auto;
    padding: 0 1rem;
    box-sizing: border-box;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: flex-start;
}
```

### 2. ResizeObserver + CSS Transform Scaling

```typescript
// StatblockPage.tsx
const observer = new ResizeObserver((entries) => {
    const availableWidth = entry.contentRect.width - paddingLeft - paddingRight;
    const widthScale = availableWidth / baseWidthPx;
    const nextScale = clamp(widthScale, MIN_SCALE, MAX_SCALE);
    setScale(nextScale);
});
```

The content is rendered at base dimensions (816px) then scaled via CSS transform to fit the viewport.

### 3. CSS Variables for Dimensions

```css
/* Everything uses CSS variables, enabling consistent scaling */
.page.phb {
    width: var(--dm-page-width);
    height: var(--dm-page-height);
}

.dm-canvas-pages {
    width: var(--dm-page-width);
}
```

### 4. Media Query Breakpoints

```css
/* canvas-base.css has explicit breakpoints */
@media (max-width: 600px) {
    .page.phb { column-count: 1; }
}

@media (max-width: 768px) {
    .dm-canvas-responsive { padding: 0 0.5rem; }
    .page.phb { font-size: 11px; }
}

@media (max-width: 480px) {
    .page.phb { font-size: 10px; }
}
```

---

## What CharacterSheet Currently Does (Problems)

### 1. Fixed Pixel Widths

```css
/* CharacterSheet.css */
.character-sheet {
    width: var(--page-width);  /* 816px */
    min-height: var(--page-height);  /* 1056px */
    padding: 1.4cm 1.9cm 1.7cm;
}
```

No flexibility for smaller viewports.

### 2. 3-Column Layout

```css
.sheet-main-content {
    display: flex;
    gap: var(--gap-lg);  /* 10px */
}

.column-1, .column-2, .column-3 {
    flex: 1;
}
```

3 columns at ~240px each is illegible on mobile.

### 3. No Responsive Container

`CharacterCanvas.tsx` renders directly without a responsive wrapper:

```tsx
return (
    <div className="character-canvas-area" data-testid="character-canvas">
        {canvasContent}
    </div>
);
```

No `dm-canvas-responsive` class, no ResizeObserver, no scaling.

### 4. No Media Queries

`CharacterSheet.css` (~2100 lines) has **zero** `@media` queries.

---

## Why This is Finicky

### Problem 1: 3-Column → 1-Column Reflow

StatblockGenerator has a max of 2 columns. Collapsing to 1 is straightforward.

CharacterSheet has **3 columns** with interdependent content:
- Column 1: Saves, Skills, Proficiencies
- Column 2: Combat stats, HP, Attacks, Equipment
- Column 3: Features, Personality (moved to separate sheet now)

On mobile, which column comes first? How do they stack?

### Problem 2: Information Density

Character sheets are **information dense**. The 3-column layout exists to pack everything onto one page. On mobile, this becomes:

- Very long scrolling
- OR multiple "views" (swipeable tabs?)
- OR selective information hiding

### Problem 3: Interlinked Sections

Some sections reference each other:
- Ability scores → saving throw modifiers
- Combat stats row → derived from abilities
- Attacks → derived from abilities + proficiency

If we reorder or separate these visually, user confusion increases.

### Problem 4: Print vs. Screen

Character sheets are designed to be **printed**. The current layout matches expected physical sheets. Mobile layout diverges from this expectation.

### Problem 5: Component Structure

Components were built assuming fixed layout:
- `MainContentGrid` → hardcoded 3-column flex
- `CharacterHeader` → assumes wide viewport
- Labeled boxes → pixel-based min-heights

---

## Proposed Strategy: Layered Approach

### Layer 1: Responsive Scaling (Easiest, Biggest Impact)

**Goal:** Sheet scales down to fit viewport, maintaining proportions.

**What:** Add ResizeObserver + CSS transform scaling to CharacterCanvas.

**Result:** On mobile, the sheet is small but readable via zoom. No layout changes needed.

**Effort:** 2-3 hours

**Limitation:** Sheet is very small on phone screens. User must pinch-zoom to read.

### Layer 2: Font Size Adjustments

**Goal:** Reduce font sizes at smaller breakpoints to improve density.

**What:** Add media queries to reduce font sizes progressively.

```css
@media (max-width: 768px) {
    .character-sheet { font-size: 11px; }
    .character-sheet .labeled-box .value { font-size: 13px; }
}

@media (max-width: 480px) {
    .character-sheet { font-size: 10px; }
}
```

**Effort:** 2-3 hours

### Layer 3: Spacing Reduction

**Goal:** Tighten spacing at smaller viewports.

**What:** Media queries to reduce CSS variable values.

```css
@media (max-width: 768px) {
    .character-sheet {
        --padding-box: var(--space-3);
        --gap-sm: var(--space-2);
        --gap-md: var(--space-4);
    }
}
```

**Effort:** 3-4 hours (need to test each section)

### Layer 4: Column Reflow (Hardest)

**Goal:** Stack columns vertically on narrow viewports.

**What:** Media queries to change flex direction.

```css
@media (max-width: 768px) {
    .sheet-main-content {
        flex-direction: column;
    }
    
    .column-1, .column-2, .column-3 {
        width: 100%;
    }
}
```

**Challenge:** Decide column order. Options:
- Combat (most used) → Abilities → Skills → Features
- Abilities → Combat → Skills → Features
- Keep current order (Saves/Skills → Combat → Features)

**Effort:** 6-8 hours (including testing all sheets)

### Layer 5: Mobile-Specific Views (Nuclear Option)

**Goal:** Completely different layout for mobile.

**What:** Separate mobile components or view modes.

**Examples:**
- Tab-based navigation (Stats | Combat | Inventory | Spells)
- Collapsible sections (accordion pattern)
- Card-based layout instead of sheet layout

**Effort:** 20-40 hours (basically redesigning mobile experience)

**Recommendation:** Save for v2 if Layer 1-4 aren't sufficient.

---

## Implementation Plan

### Phase 1: Responsive Scaling Foundation (3-4 hours)

**Tasks:**
- [ ] Add `dm-canvas-responsive` class to CharacterCanvas wrapper
- [ ] Implement ResizeObserver for scale calculation
- [ ] Apply CSS transform scaling to sheet container
- [ ] Set CSS variables for page dimensions
- [ ] Test on various viewport sizes

**Files to Modify:**
- `shared/CharacterCanvas.tsx` - Add responsive wrapper and scaling
- `sheetComponents/CharacterSheet.css` - Ensure it works with scaling

### Phase 2: Media Query Foundation (4-6 hours)

**Tasks:**
- [ ] Add breakpoint media queries to CharacterSheet.css
- [ ] Implement font size scaling (768px, 480px breakpoints)
- [ ] Implement spacing reduction at breakpoints
- [ ] Test each section at each breakpoint

**Breakpoint Strategy:**
```
> 1024px: Full desktop (current layout)
768-1024px: Tablet (slightly reduced spacing/fonts)
480-768px: Large phone (further reduced, consider column stack)
< 480px: Small phone (column stack required)
```

### Phase 3: Column Reflow (6-8 hours)

**Tasks:**
- [ ] Implement flex-direction: column at mobile breakpoint
- [ ] Decide and implement column stacking order
- [ ] Adjust section widths for full-width stacking
- [ ] Test all four sheet types (Character, Background, Inventory, Spell)
- [ ] Fix any overflow/spacing issues

**Column Order Recommendation:**
```
Mobile stack order (top to bottom):
1. Header (name, class, level) - always first
2. Ability Scores - reference for everything else
3. Combat Stats (AC, HP, Initiative) - most used in play
4. Attacks - active play
5. Saves & Skills - reference
6. Features - reference
7. Equipment - reference
8. Proficiencies - reference
```

### Phase 4: Per-Sheet Mobile Polish (6-8 hours)

Each sheet needs individual attention:

**CharacterSheet:**
- [ ] Header stacking (portrait + info boxes)
- [ ] Ability scores row → 2×3 grid on mobile?
- [ ] Combat stats horizontal → vertical
- [ ] Attacks table → card layout?

**InventorySheet:**
- [ ] Header info row stacking
- [ ] Inventory blocks → full width
- [ ] Item row columns → responsive grid

**SpellSheet:**
- [ ] Spell header stacking
- [ ] Spell level sections → full width
- [ ] Spell entries → compact cards

**BackgroundPersonalitySheet:**
- [ ] Two-column → single column
- [ ] Notes expand naturally

---

## CSS Architecture Considerations

### Option A: Media Queries in CharacterSheet.css

Add media queries directly to the existing CSS file.

**Pros:** Single file, easy to find all styles
**Cons:** File is already 2100 lines, will get larger

### Option B: Separate Mobile CSS File

Create `CharacterSheet.mobile.css` with all responsive overrides.

**Pros:** Cleaner separation, easier to disable/enable
**Cons:** Two files to maintain, cascade concerns

### Option C: Use dm-canvas System

Adopt the `dm-canvas-responsive` patterns from canvas-base.css.

**Pros:** Consistent with StatblockGenerator, battle-tested
**Cons:** May need to adapt significantly for 3-column layout

**Recommendation:** Option A for Phase 1-2, then evaluate.

---

## Testing Checklist

### Viewport Sizes to Test
- [ ] Desktop: 1920×1080
- [ ] Laptop: 1366×768
- [ ] Tablet Landscape: 1024×768
- [ ] Tablet Portrait: 768×1024
- [ ] Phone Landscape: 812×375 (iPhone X)
- [ ] Phone Portrait: 375×812 (iPhone X)
- [ ] Small Phone: 320×568 (iPhone SE)

### Elements to Check at Each Size
- [ ] Text is readable without zooming
- [ ] No horizontal scrolling required
- [ ] Touch targets are minimum 44×44px
- [ ] Forms/inputs are usable
- [ ] Column layout reflows appropriately
- [ ] Header information is accessible
- [ ] Print preview still works correctly

---

## What We CAN'T Easily Adapt from StatblockGenerator

### 1. 2-Column vs 3-Column
StatblockGenerator max 2 columns, PCG has 3. Different reflow logic.

### 2. Single Frame vs Multiple Sheets
StatblockGenerator = one statblock frame. PCG = 4+ distinct pages.

### 3. Content Structure
Statblock is fairly linear (name → stats → actions → spells).
Character sheet has interconnected sections in different columns.

### 4. Print Expectations
Statblock is "nice to print". Character sheet is "expected to print and match official sheets".

---

## Open Questions

1. **Column order on mobile:** What order makes most sense for actual play?
2. **Print vs. screen divergence:** How much can mobile layout differ from print layout?
3. **Tab/swipe navigation:** Would a tab-based mobile UI be better than long scroll?
4. **Minimum viable mobile:** What's acceptable for v1? (Just scaling? Or full reflow?)
5. **Ability scores on mobile:** 6-across row → 2×3 grid? 3×2 grid? 6-tall stack?

---

## Success Criteria

### Minimum (Layer 1-2)
- [ ] Sheet scales to fit any viewport without horizontal scroll
- [ ] Sheet is readable on tablet without excessive zooming
- [ ] No visual breakage at any viewport size

### Good (Layer 1-3)
- [ ] Font sizes adjust for readability at smaller viewports
- [ ] Spacing tightens appropriately
- [ ] Sheet is readable on phone landscape

### Excellent (Layer 1-4)
- [ ] Columns reflow to single-column on phone portrait
- [ ] All sections remain usable on small screens
- [ ] Touch targets meet accessibility guidelines
- [ ] Print preview unaffected by mobile changes

---

## References

### StatblockGenerator Patterns
- `src/styles/canvas/canvas-base.css` - Responsive container and breakpoints
- `StatBlockGenerator/StatblockPage.tsx` - ResizeObserver + transform scaling
- `src/styles/DesignSystem.css` - App-wide breakpoint definitions

### Current CharacterSheet
- `sheetComponents/CharacterSheet.css` - All current styles (~2100 lines)
- `sheetComponents/CharacterSheetPage.tsx` - Page container
- `shared/CharacterCanvas.tsx` - Canvas wrapper (needs responsive layer)

### Testing Resources
- Chrome DevTools device emulation
- BrowserStack for real device testing
- Lighthouse accessibility audit

---

## Recommendation

**Start with Phase 1 (Responsive Scaling)** as part of the Pagination work since they share the ResizeObserver infrastructure. This gives immediate improvement with minimal risk.

**Phase 2-3** can follow as incremental improvements once scaling is working.

**Phase 4** (Column Reflow) is the most impactful but also most risky. Consider user testing before full implementation.

**Layer 5** (Mobile-Specific Views) is a future consideration if the scaling approach proves insufficient for phone usage.

---

**Key Insight:** Retrofitting mobile responsiveness is significantly harder than building mobile-first. We should be prepared for multiple iterations and user feedback cycles to get this right.

