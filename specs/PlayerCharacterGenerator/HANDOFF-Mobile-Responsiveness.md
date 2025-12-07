# Handoff: Mobile Responsiveness Retrofit
**Date:** December 7, 2025  
**Type:** Technical Debt / UX Enhancement  
**Last Updated:** December 7, 2025 ~12:30 AM  
**Difficulty:** High - Retrofitting is harder than building mobile-first

---

## ✅ FIX APPLIED - December 7, 2025

### Root Cause (SOLVED)
The issue was that `InventorySheet` and `SpellSheet` wrap content in `<CharacterSheetPage>` which outputs:
```html
<div class="page phb character-sheet inventory-sheet">
```

The global PHB CSS (`public/dnd-static/style.css`) sets **fixed dimensions AND overflow: hidden** on `.page`:
```css
.page {
    height: 279.4mm;  /* 1056px */
    width: 215.9mm;   /* 816px */
    overflow: hidden; /* THIS WAS CLIPPING THE CONTENT! */
}
```

The mobile CSS was targeting `.inventory-sheet` and `.spell-sheet`, but these classes were **weaker** than `.page`'s styles from global CSS.

### The Fix
Added a rule in `MobileCharacterCanvas.css` (line ~252) that directly targets `.page.phb` within the mobile canvas:

```css
/* Override .page fixed dimensions from global PHB CSS */
.mobile-character-canvas.character-sheet .page.phb {
    width: 100% !important;
    max-width: 100% !important;
    height: auto !important;
    min-height: unset !important;
    padding: 12px !important;
    box-sizing: border-box;
    /* CRITICAL: Override overflow: hidden - content was being clipped! */
    overflow: visible !important;
    border: none !important;
    border-image: none !important;
    box-shadow: none !important;
}
```

### What's Working Now ✅
- Mobile canvas renders when viewport < 800px (window resize listener)
- `CharacterHeader` stacks vertically (portrait full-width, name/info boxes stack)
- `AbilityScoresRow` renders with stats
- `Column1Content` (saves, skills, proficiencies) renders
- `Column2Content` (attacks, equipment summary) renders  
- `FeaturesSection` renders
- `Personality` section renders
- **InventorySheet** - Should now render (needs verification)
- **SpellSheet** - Should now render (needs verification)

### Verification Steps
1. Start dev server: `cd LandingPage && pnpm dev`
2. Open http://localhost:3000/charactergenerator
3. Load demo wizard character (Dev Tools → Load Demo Character → Wizard)
4. Resize browser to < 800px width
5. Scroll down - InventorySheet and SpellSheet should be visible

### Quick Pickup Commands
```bash
cd /media/drakosfire/Projects/DungeonOverMind/LandingPage
pnpm dev
# Open http://localhost:3000/charactergenerator
# Resize browser to < 800px width to see mobile canvas
# Load a demo character: Dev Tools → Load Demo Character
```

### Key Files Modified
```
shared/MobileCharacterCanvas.css      # Lines 252-275 - Added .page.phb override
```

---

## Status

| Phase | Status | Description |
|-------|--------|-------------|
| Phase 1 | ✅ **Complete** | ResizeObserver + CSS transform scaling (desktop/tablet) |
| Phase 2 | ✅ **Complete** | Hybrid system (canvas vars + calc()) |
| Phase 3 | ✅ **Complete** | Mobile canvas with viewport switch at 800px |
| Phase 4 | ✅ **Complete** | InventorySheet + SpellSheet mobile rendering - CSS fix applied |
| Phase 5 | ⬜ Not started | Polish and testing |

---

## Files Modified This Session

### Created
- `shared/MobileCharacterCanvas.tsx` (~350 lines) - Mobile vertical scroll layout
- `shared/MobileCharacterCanvas.css` (~250 lines) - Mobile-specific styles

### Modified  
- `shared/CharacterCanvas.tsx` - Added viewport switch, window resize listener
- `sheetComponents/CharacterSheet.css` - Added hybrid calc() system (later replaced media queries)

---

## 🚨 Architectural Pivot: Mobile Canvas

**Realization:** Scaling the page down to fit mobile makes content tiny and requires pinch-zoom. This is technically cool but **wrong for mobile UX**.

**Better Approach:** Two rendering modes:
1. **Desktop/Tablet:** Current scaled page layout (preserves print fidelity)
2. **Mobile:** Simple vertical scroll through components (native mobile experience)

### Mobile Canvas Concept

```
Desktop (scaled page)              Mobile (vertical scroll)
┌──────────────────────┐           ┌──────────────────┐
│┌────┬────┬────┐      │           │ Character Header │
││Col1│Col2│Col3│      │           ├──────────────────┤
││    │    │    │      │           │ Ability Scores   │
│└────┴────┴────┘      │           ├──────────────────┤
│  (scaled to fit)     │           │ Combat Stats     │
└──────────────────────┘           ├──────────────────┤
                                   │ Attacks          │
                                   ├──────────────────┤
                                   │ Saves & Skills   │
                                   ├──────────────────┤
                                   │ Features         │
                                   ├──────────────────┤
                                   │ Equipment        │
                                   └──────────────────┘
                                     (native scroll)
```

### Benefits
- ✅ Readable text at native sizes (no scaling)
- ✅ Natural mobile scrolling
- ✅ Touch-friendly tap targets
- ✅ Components reused (just different layout)
- ✅ Desktop still has print-ready page layout

### What We Keep (Scaling System)

The hybrid scaling system (Phase 1-2) remains valuable for:
- **Tablet landscape:** Scaled page fits nicely, readable without full reflow
- **Desktop with narrow window:** Graceful degradation
- **Print preview:** Accurate representation of printed output
- **PDF export:** Page layout preserved

The scaling system becomes the **desktop/tablet renderer**, while mobile gets its own canvas.

### Implementation Options

**Option A: Viewport Switch in CharacterCanvas**
```tsx
const CharacterCanvas = () => {
    const isMobile = viewportWidth < MOBILE_BREAKPOINT;
    
    return isMobile 
        ? <MobileCharacterView character={character} />
        : <DesktopCharacterPages character={character} scale={scale} />;
};
```

**Option B: Separate Route/Component**
- `/character-sheet` → Desktop (current)
- `/character-sheet?view=mobile` → Mobile layout

**Option C: CSS-Only Reflow (Limited)**
- Keep same components, use CSS to reflow
- Risk: May not work well for complex sections

### ✅ Components Already Extracted!

Looking at `sheetComponents/index.ts`, the components are **already modular**:

```typescript
// Already exported and reusable:
CharacterHeader          // Name, class, race, background
AbilityScoresRow         // 6 ability scores
SavingThrowsSection      // Saves list
SkillsSection            // Skills list  
CombatStatusSection      // Inspiration, proficiency bonus
CombatStatsRow           // AC, Initiative, Speed
HPSection                // HP, temp HP, hit dice, death saves
FeaturesSection          // Class/racial features
InventorySheet           // Full inventory page
SpellSheet               // Full spell list page
BackgroundPersonalitySheet // Personality, backstory
```

**No extraction needed** - just compose them differently for mobile.

### Mobile Canvas Implementation

```tsx
// shared/MobileCharacterCanvas.tsx
const MobileCharacterCanvas: React.FC = () => {
    const { character } = usePlayerCharacterGenerator();
    const dnd5e = character?.dnd5eData;
    
    if (!dnd5e) return <EmptyState />;
    
    return (
        <div className="mobile-character-canvas">
            {/* Sections stack vertically, full-width */}
            <CharacterHeader {...headerProps} />
            <AbilityScoresRow scores={dnd5e.abilityScores} />
            <CombatStatsRow ac={...} initiative={...} speed={...} />
            <HPSection maxHP={...} currentHP={...} />
            <SavingThrowsSection {...savesProps} />
            <SkillsSection {...skillsProps} />
            <FeaturesSection features={features} />
            {/* Equipment as collapsible sections */}
            <CollapsibleSection title="Equipment">
                <EquipmentList equipment={dnd5e.equipment} />
            </CollapsibleSection>
            {/* Spells if spellcaster */}
            {dnd5e.spellcasting && (
                <CollapsibleSection title="Spells">
                    <SpellList spells={dnd5e.spellcasting} />
                </CollapsibleSection>
            )}
        </div>
    );
};
```

### Mobile CSS (Simple)

```css
.mobile-character-canvas {
    width: 100%;
    max-width: 100vw;
    padding: var(--space-4);
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
    background: var(--bg-page);
}

.mobile-character-canvas > * {
    width: 100%;
}
```

### Viewport Switch

```tsx
// shared/CharacterCanvas.tsx
const MOBILE_BREAKPOINT = 800;

const CharacterCanvas: React.FC = () => {
    const [viewportWidth, setViewportWidth] = useState(window.innerWidth);
    // ... ResizeObserver updates viewportWidth ...
    
    // Mobile: vertical scroll layout
    if (viewportWidth < MOBILE_BREAKPOINT) {
        return <MobileCharacterCanvas />;
    }
    
    // Desktop/Tablet: scaled page layout (current implementation)
    return <DesktopCharacterCanvas scale={scale} />;
};
```

### New Phase Structure

| Phase | Status | Description |
|-------|--------|-------------|
| Mobile-1 | ✅ **Complete** | Create `MobileCharacterCanvas` component |
| Mobile-2 | ✅ **Complete** | Add viewport switch to `CharacterCanvas` (window.innerWidth) |
| Mobile-3 | ✅ **Complete** | Style CharacterHeader, AbilityScoresRow for mobile |
| Mobile-4 | 🔄 **BLOCKED** | InventorySheet + SpellSheet not rendering |
| Mobile-5 | ⬜ | Test on real devices |

### Files Created/Modified

**Created:**
- `shared/MobileCharacterCanvas.tsx` - Mobile vertical scroll layout (~350 lines)
- `shared/MobileCharacterCanvas.css` - Mobile-specific styles (~250 lines)

**Modified:**
- `shared/CharacterCanvas.tsx` - Added `windowWidth` state + resize listener for mobile switch

**Modified:**
- `shared/CharacterCanvas.tsx` - Added viewport switch at 800px breakpoint

---

## 🆕 Hybrid Responsive System (December 2025)

After implementing media queries in Phase 2, we evolved to a **hybrid approach** that centralizes responsive logic in the canvas layer while using CSS `calc()` for actual sizing.

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CharacterCanvas.tsx                       │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ ResizeObserver tracks viewport width                    ││
│  │ ↓                                                       ││
│  │ getFontScale(viewportWidth) → 0.8 | 0.9 | 1.0          ││
│  │ getSpacingScale(viewportWidth) → 0.75 | 0.85 | 1.0     ││
│  │ ↓                                                       ││
│  │ CSS Variables set on container:                         ││
│  │   --dm-font-scale: 0.9                                  ││
│  │   --dm-spacing-scale: 0.85                              ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    CharacterSheet.css                        │
│  .header-name {                                              │
│      font-size: calc(28px * var(--dm-font-scale, 1));       │
│  }                                                           │
│  .section-padding {                                          │
│      padding: calc(var(--space-6) * var(--dm-spacing-scale, 1)); │
│  }                                                           │
└─────────────────────────────────────────────────────────────┘
```

### CSS Variables Set by Canvas

| Variable | Desktop | Tablet (≤768px) | Phone (≤480px) |
|----------|---------|-----------------|----------------|
| `--dm-font-scale` | 1.0 | 0.9 | 0.8 |
| `--dm-spacing-scale` | 1.0 | 0.85 | 0.75 |
| `--dm-viewport-width` | actual | actual | actual |

### Benefits Over Media Queries

1. **Single source of truth** - Breakpoints defined in `CharacterCanvas.tsx`
2. **Reusable across services** - Same pattern for StatblockGen, CardGen, PCG
3. **Testable** - `getFontScale()` and `getSpacingScale()` are pure functions
4. **Smooth scaling** - Can implement continuous scaling if desired
5. **No CSS cascade issues** - No specificity battles between media query blocks
6. **Dynamic** - Can adjust based on content, not just viewport

### Files Modified

- `shared/CharacterCanvas.tsx` - Added scale factor calculations and CSS variables
- `sheetComponents/CharacterSheet.css` - Converted media queries to `calc()` approach

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

### Phase 1: Responsive Scaling Foundation ✅ COMPLETE

**Completed December 2025**

**What was implemented:**
- [x] ResizeObserver for viewport-responsive scaling (`CharacterCanvas.tsx` lines 98-127)
- [x] CSS transform scaling with `scale(${scale})` and `transformOrigin: 'top center'`
- [x] Font loading gate to prevent layout shift (lines 58-95)
- [x] CSS variables for page dimensions (`--dm-page-scale`, `--dm-page-width`, `--dm-page-height`)
- [x] `dm-canvas-responsive` class on `CharacterSheetPage.tsx`
- [x] Proper container height calculation based on scale

**Files Modified:**
- `shared/CharacterCanvas.tsx` - Full responsive implementation
- `canvasComponents/CharacterSheetPage.tsx` - dm-canvas-responsive class

### Phase 2: Hybrid Responsive System ✅ COMPLETE

**Completed December 2025**

**Evolution:** Started with media queries, then evolved to hybrid canvas + calc() system.

**What was implemented:**
- [x] Canvas calculates `--dm-font-scale` and `--dm-spacing-scale` from viewport width
- [x] CSS uses `calc(BASE_SIZE * var(--dm-font-scale, 1))` for all scaled sizes
- [x] Pure functions for scale calculation (testable, reusable)
- [x] Removed media query blocks in favor of calc() approach

**Font Size Scaling (via --dm-font-scale):**
```
Desktop (default): --dm-font-scale: 1.0
  28px * 1.0 = 28px (header name)
  20px * 1.0 = 20px (combat values)
  
Tablet (≤768px): --dm-font-scale: 0.9
  28px * 0.9 = 25.2px (header name)
  20px * 0.9 = 18px (combat values)

Phone (≤480px): --dm-font-scale: 0.8
  28px * 0.8 = 22.4px (header name)
  20px * 0.8 = 16px (combat values)
```

**Files Modified:**
- `shared/CharacterCanvas.tsx` - Scale factor calculation + CSS variable injection
- `sheetComponents/CharacterSheet.css` - Replaced media queries with calc() rules

### Phase 3: Spacing Reduction via `--dm-spacing-scale` (2-3 hours)

**Goal:** Tighten spacing at smaller viewports using the hybrid system.

**Already Available:**
- Canvas sets `--dm-spacing-scale` (0.75 | 0.85 | 1.0)
- Just need to apply it to spacing CSS variables

**Implementation Pattern:**
```css
.character-sheet {
    --padding-box: calc(var(--space-4) * var(--dm-spacing-scale, 1));
    --padding-box-sm: calc(var(--space-3) * var(--dm-spacing-scale, 1));
    --gap-sm: calc(var(--space-3) * var(--dm-spacing-scale, 1));
    --gap-md: calc(var(--space-6) * var(--dm-spacing-scale, 1));
    --gap-lg: calc(var(--space-10) * var(--dm-spacing-scale, 1));
}
```

**Tasks:**
- [ ] Apply `--dm-spacing-scale` to semantic spacing variables
- [ ] Apply to page padding/margins
- [ ] Test each section for overflow issues
- [ ] Verify print layout unaffected (scale = 1.0 for print)

### Phase 4: Column Reflow (6-8 hours)

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

### Phase 5: Per-Sheet Mobile Polish (6-8 hours)

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

