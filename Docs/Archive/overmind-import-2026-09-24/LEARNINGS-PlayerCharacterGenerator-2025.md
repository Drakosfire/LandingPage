> **Historical import from DungeonOverMind — 2026-09-24.** This document records an older DungeonMind Web/product implementation state. It is not current LandingPage architecture or sequencing authority. Re-anchor against current code before applying it.

# PlayerCharacterGenerator: Learnings & Patterns (2025)

**Project:** DungeonMind PlayerCharacterGenerator  
**Timeline:** November - December 2025  
**Status:** In Development (Phase 3 - Canvas Rendering ✅, Phase 5 - AI Harness + Backend PCG Rule Engine ✅)  
**Purpose:** Capture development patterns, workflows, and insights

---

## 🎯 Executive Summary

The PlayerCharacterGenerator introduces a **Rule Engine** pattern for D&D 5e character creation, separating game rules from UI. 

**Key Architectural Decisions (December 2025):**

1. **HTML-First Development** - Prototype visually in HTML before React components. Resulted in 50% faster implementation.

2. **Static Pages + Overflow** - Main character sheets use fixed layouts (not full Canvas measurement). Overflow content uses Canvas pagination.

3. **Multi-Sheet Organization** - Separate dedicated pages (Character, Inventory, Spells, Background) instead of dynamic cramming.

---

## 📐 Key Learnings

### 1.1 Data Model → Consumer → Producer

**Date:** December 2, 2025  
**Context:** Built wizard steps before canvas components  
**Impact:** Accumulated wiring bugs that would have been caught earlier

#### The Learning

**Once you have a data model, build a CONSUMER (display/export) before perfecting the PRODUCER (wizard/input).**

#### Why This Matters

| Build Order | Result |
|-------------|--------|
| ❌ Model → Producer → Consumer | Bugs accumulate invisibly, discovered late |
| ✅ Model → Consumer → Producer | Model validated early, bugs visible immediately |

#### Concrete Example

```
What we did:
1. Defined DnD5eCharacter interface ✅
2. Built Rule Engine (getAvailableRaces, validateStep, etc.) ✅
3. Built 7 wizard steps that populate DnD5eCharacter ✅
4. Built canvas components to DISPLAY DnD5eCharacter ← NOW

Problem: Wizard wiring bugs accumulated. We can't easily see if 
the wizard is producing valid data because we have nothing to 
display it.
```

```
Better approach:
1. Defined DnD5eCharacter interface ✅
2. Built Rule Engine ✅
3. Created DEMO_FIGHTER.ts - complete sample character
4. Built canvas to display demo character
5. NOW build wizard steps to produce same structure
```

#### The Pattern

**"Test the pipes"** - Once you have a data contract (interface/type), build something that:
1. Creates sample data conforming to that contract
2. Consumes/displays that data end-to-end

This validates:
- The model is complete (no missing fields)
- The model is correct (types make sense)
- The calculations work (derived stats)
- The display logic works (rendering)

Then build the producer (wizard), which is just another way to create that same data.

#### Applied Fix

Added **Phase 3.6a (BLOCKING)** tasks:
- T059a: Create `DEMO_FIGHTER.ts` - Complete sample character
- T066a-e: Implement derived stat calculations

These must complete BEFORE canvas components can be tested.

---

### 1.2 HTML-First Component Building

**Date:** December 7, 2025  
**Context:** Original plan (T070-T075) called for building Canvas components directly  
**Impact:** HTML-first approach completed all sheets in ~2 days vs estimated 1-2 weeks

#### The Learning

**Prototype in static HTML before building React components.** This lets you iterate on layout and CSS rapidly without React's feedback loop.

#### The Workflow

```
1. Create HTML prototype with inline CSS
   └── Iterate visually in browser (instant feedback)
   
2. Extract shared CSS to stylesheet
   └── Identify patterns, define CSS variables
   
3. Build React components by "porting" HTML sections
   └── Copy HTML structure, add props for data
   
4. Wire data and state
   └── Component already looks correct, just needs data
```

#### Evidence (Task Supersession)

| Original Plan | Actual Approach | Result |
|---------------|-----------------|--------|
| T070-T075: Build Canvas components (6 tasks) | T110-T118: HTML prototype → Extract → Port (9 tasks) | All sheets complete |
| Estimated: 12-16 hours | Actual: ~8 hours | 50% faster |

#### Why HTML-First Works

1. **Zero build step** - Browser auto-refreshes on save
2. **CSS experimentation** - Try 10 variations in 2 minutes
3. **Visual debugging** - See layout issues immediately
4. **Copy-paste components** - HTML sections become React components
5. **Parallel CSS extraction** - Identify shared patterns naturally

#### Files Created

```
prototypes/
├── character-sheet.html    ← Visual prototype
├── inventory-sheet.html    ← Ported from character
├── spell-sheet.html        ← Ported from character
└── phb-prototype.css       ← Shared PHB styling

sheetComponents/
├── CharacterSheet.css      ← Extracted (~2100 lines)
├── CharacterSheet.tsx      ← Orchestrator
├── CharacterHeader.tsx     ← Ported from HTML
├── AbilityScoresRow.tsx    ← Ported from HTML
├── column1/, column2/, column3/  ← Section components
└── inventory/, spells/     ← Additional sheet components
```

#### When to Use HTML-First

✅ **Use when:**
- Building new visual layouts
- Complex CSS with many interacting elements
- PHB/themed styling with borders, backgrounds
- Unknown layout requirements

❌ **Skip when:**
- Reusing existing components
- Simple data display (lists, tables)
- Logic-heavy components (forms, validation)

---

### 1.3 Static Pages + Overflow Architecture

**Date:** December 7, 2025  
**Context:** Deciding how to paginate character sheets vs StatblockGenerator  
**Impact:** Simpler implementation, better user experience for fixed-content sheets

#### The Learning

**Fixed content pages (character sheets) benefit from static layouts with overflow pages, NOT full measurement-based pagination.**

#### Two Pagination Strategies

| Strategy | Use Case | Example |
|----------|----------|---------|
| **Full Canvas Pagination** | Dynamic content length, unknown ahead of time | Statblocks (creature abilities vary wildly) |
| **Static Pages + Overflow** | Mostly fixed content, known max sizes | Character sheets (6 abilities, 18 skills, etc.) |

#### Why Character Sheets Differ from Statblocks

```
Statblock:
- Actions: 1-20+ (variable)
- Legendary actions: 0-5 (variable)
- Spells: 0-50+ (variable)
- Description: 1 paragraph to 3 pages (variable)
→ MUST measure and paginate dynamically

Character Sheet:
- Abilities: exactly 6 (fixed)
- Saves: exactly 6 (fixed)
- Skills: exactly 18 (fixed)
- Features: 1-8+ (bounded, can overflow)
- Equipment: 5-20 (bounded, can overflow)
→ MOSTLY fixed, overflow to continuation page
```

#### The Architecture

```
Main Pages (Static Layout):
┌─────────────────────────────┐
│ Character Sheet (Page 1)    │ ← Fixed positions
│ - Header, Abilities, Skills │
│ - Combat stats, HP          │
│ - Features (max 8 shown)    │
└─────────────────────────────┘

┌─────────────────────────────┐
│ Inventory Sheet (Page 2)    │ ← Fixed positions
│ - Equipment (max 12 shown)  │
│ - Currency, weight          │
└─────────────────────────────┘

Overflow Pages (Canvas-Driven):
┌─────────────────────────────┐
│ Features (Continued)        │ ← Canvas measures & paginates
│ - Items 9-16...             │

---

## 🤖 AI-Assisted Generation (Backend Rule Engine + Harness)

**Timeframe:** December 13–14, 2025  
**Canonical reference:** `LandingPage/specs/PlayerCharacterGenerator/HANDOFF-AI-Generation-Prompt-Evaluation.md`

### 2.1 Architecture that Actually Scales: “AI Preferences, Deterministic Mechanics”

**Problem:** One-shot “generate a legal 5e character” prompts don’t scale (rules are too brittle; failures are hard to debug).  
**Solution:** Split the pipeline into deterministic + probabilistic layers:

```
User Identity (Class/Race/Level/Background)
  → Backend Rule Engine: /constraints (authoritative)
  → AI: generates preferences (intent, themes, flavor — NOT mechanics)
  → Translator: preferences → mechanical choices
  → Backend: /validate (legality) + /compute (mathy bits)
```

**Lesson:** Keep the LLM in the **“intent”** lane; keep the backend in the **“truth/math”** lane.

---

### 2.2 Authoritative Backend Endpoints: /constraints → /validate → /compute

**Problem:** Frontend mocks/validators can give false confidence (“0 failures”) and drift from real rules.  
**Solution:** Make the backend authoritative for:
- `POST /api/playercharactergenerator/constraints` (deterministic option sets)
- `POST /api/playercharactergenerator/validate` (E2/E4 legality checks)
- `POST /api/playercharactergenerator/compute` (E3 derived stats)

**Lesson:** When the backend is the source of truth, the harness becomes a real experiment instead of a demo.

---

### 2.3 Concurrency + Stage Timings Turn Experiments into Product Inputs

**Problem:** Experiments are slow and don’t produce UX-friendly timing data.  
**Solution:** The CLI harness supports:
- `--concurrency N` promise pool to reduce wall-clock time
- per-stage timings (`constraintsMs`, `aiCallMs`, `translateMs`, `backendValidateMs`, `backendComputeMs`) for realistic loading bars
- `p50`/`p95` latency reporting for UX pacing

**Lesson:** Treat the harness like a product telemetry pipeline—timings + percentiles matter more than averages.

---

### 2.4 Retry Strategy: Preserve Experiment Validity Without Hiding Failures

**Problem:** Transient API/network failures distort experimental success rates.  
**Solution:** Add `--max-retries N` (0–3) for live runs and **accumulate tokens/cost across retries**.

**Lesson:** Retries should improve reliability while keeping economics honest.

---

### 2.5 Skill Overlap Semantics: Background Skills Must Always Be Included

**Problem:** Backend validation failed with “Missing background-granted skill” even though translation “looked right”.  
**Root cause:** Translator wasn’t explicitly including background-granted skills; plus overlap semantics weren’t aligned.  
**Solution:**
- Always include background-granted skills in selections
- Use `overlapHandling="replace"` (5e semantics: overlap yields an extra class pick)

**Lesson:** Model overlap semantics explicitly and keep frontend/backed semantics identical.

---

### 2.6 Spells (Standard Path): Catalog-Driven Lists + Deterministic Selection

**Problem:** Spells are high complexity and easy to validate incorrectly.  
**Standard path implemented:** Backend provides `spellcasting` constraints with:
- `casterType` (`known` vs `prepared`)
- `preparedFormula=abilityModPlusLevel` for prepared casters
- `maxSpellLevel`
- `availableCantrips` + `availableSpells` (IDs + short descriptions)

Backend validation enforces:
- correct counts (prepared uses ability mod + level)
- no duplicates
- membership in allowed IDs
- max spell level

**Lesson:** Put spell legality in the backend; keep AI on themes; keep selection deterministic.

---

### 2.7 Testing Pattern: Unit Tests That Don’t Import the Whole App

**Problem:** Importing the full backend app triggered unrelated env requirements (auth secrets) and blocked testing.  
**Solution:** Write tests that import only PCG-local modules (`rule_engine`, `validators`, `compute`).

**Lesson:** Keep rule engine code modular so tests don’t depend on infra/auth wiring.

└─────────────────────────────┘
```

---

## 🖨️ Print / Save as PDF (US6): “Print Contract” vs Canvas Contract

**Timeframe:** December 14, 2025  
**Primary goal:** Export the PCG 4-page character sheet via **native browser print** (`window.print()` → Save as PDF)  
**Why (PCG-specific):** PCG already renders true PHB pages as DOM (`.page.phb.character-sheet`), so native print preserves fonts/backgrounds and avoids a second rendering pipeline.

### 3.1 The Shared Pattern: a “Print Contract” is Mandatory

**Problem:** Print engines (especially Firefox) are extremely sensitive to layout “chrome” and viewport-driven sizing.  
**Symptom:** Extra blank pages (white, parchment, or wood), shifted layouts, or pages collapsing into a single row.  
**Root cause:** Screen-time layout rules (flex/gap/heights/min-height calc with `vh`) leak into print and interact unpredictably with pagination.

**Solution:** Define and enforce a **print contract**:

- **Print surface**: a single container that participates in layout during print (everything else must not affect flow).
- **Page node**: explicit page elements with stable dimensions and predictable breaks.
- **Normalization**: remove viewport-derived heights/padding and flex/gap pagination quirks.

**StatblockGenerator (Canvas Contract):**

- Uses the standardized Canvas wrappers:
  - `.dm-canvas-responsive → .dm-canvas-wrapper → .dm-canvas-renderer → .dm-canvas-pages`
- Print contract lives in: `LandingPage/src/styles/canvas/canvas-print.css`
- Key feature: print rules target `.dm-canvas-pages .page` and normalize page size + breaks.

**PlayerCharacterGenerator (PHB Page Contract):**

- Pages are already PHB pages:
  - `.page.phb.character-sheet` (and variants for background/inventory/spells)
- We must implement a PCG print contract in:
  - `LandingPage/src/components/PlayerCharacterGenerator/sheetComponents/CharacterSheet.css`
- Key feature: print rules must target `.page.phb.character-sheet` and preserve PHB layout expectations.

### 3.2 “Visibility Contract” vs “Display Contract” (Firefox leading blank page)

**Problem:** A pure visibility contract (`visibility: hidden`) can leave hidden UI in-flow.  
**Symptom:** Firefox prints an initial blank page before the first real page.  
**Root cause:** hidden app chrome still occupies layout space, pushing the print surface to page 2.

**Solution:** Use a **display contract** at the app root (PCG-specific):

```css
@media print {
  .generator-layout > * { display: none !important; }
  .generator-layout > .generator-canvas-container { display: block !important; }
}
```

**Lesson:** If you see an initial blank page in Firefox, assume “hidden-but-still-in-flow” first.

### 3.3 Break Strategy: Prefer `break-after` in Firefox to avoid “between page” blanks

**Problem:** `break-before` on each non-first page can generate blank pages between real pages in Firefox.  
**Symptom:** PDF has 8 pages: 4 real pages + 4 blanks (often brown/wood or parchment) between/around them.  
**Root cause:** `break-before` interactions + container flex/gap/padding can cause a forced “separator page.”

**Solution:** Prefer `break-after` on all-but-last page:

```css
@media print {
  .character-sheet-container > .page.phb.character-sheet:not(:last-child) {
    break-after: page !important;
    page-break-after: always !important;
  }
  .character-sheet-container > .page.phb.character-sheet:last-child {
    break-after: avoid !important;
    page-break-after: avoid !important;
  }
}
```

**Lesson:** For Firefox, “break after page N” is often safer than “break before page N+1”.

### 3.4 Flex + Gap in Print is a Recurring Footgun

**Problem:** Containers with `display: flex` and `gap` behave inconsistently under pagination.  
**Symptom:** Phantom blank pages, sometimes colored (wrapper background), between real pages.  
**Root cause:** Print engines paginate flex layouts differently, and `gap` can become “extra content”.

**Solution:**
- Set `.character-sheet-container` to `display: block` in print.
- Force `gap: 0` with enough specificity to beat screen `!important` rules.

**Important:** If screen CSS has a more specific `!important` selector like:

```css
.character-canvas-renderer .character-sheet-container {
  gap: 32px !important;
}
```

Your print override must match/exceed specificity to win (Firefox):

```css
@media print {
  .character-canvas-renderer .character-sheet-container { gap: 0 !important; }
}
```

**Lesson:** “Specificity beats intent.” In print, always search for `!important` selectors that still apply.

### 3.5 Evidence-First Debugging: Capture the Print Preview DOM

**Problem:** Iterating only via print preview is slow and misleading.  
**Solution:** Add a dev-only “snapshot” tool that captures the exact DOM/CSS state print preview receives.

**Implementation:**
- `LandingPage/src/components/PlayerCharacterGenerator/printDebug.ts`
  - clones `.generator-canvas-container`
  - optionally inlines computed styles (to make the snapshot inspectable standalone)
  - includes current document `<link rel="stylesheet">` + `<style>` blocks
- Wired via PCG toolbox dev tools

**Lesson:** Treat print debugging like Canvas debugging: capture state, compare snapshots, then make one surgical change.

### 3.6 Practical Decision: Wrap PCG in Canvas wrappers (Backlog improvement)

**Observation:** StatblockGenerator is stable partly because its print surface is standardized (`.dm-canvas-responsive`).  
**Backlog direction:** Consider migrating PCG canvas structure to reuse Canvas wrappers (even if PCG keeps static pages) so `canvas-print.css` applies uniformly.

**Lesson:** Standardizing the print surface reduces per-feature CSS and prevents “rediscovering” the same blank-page bugs.

#### Benefits

1. **Predictable print output** - Main pages always look the same
2. **Simpler CSS** - No complex measurement-based positioning
3. **Better mobile** - Static pages decompose cleanly
4. **Faster rendering** - No measurement pass for main content
5. **Overflow is rare** - Most characters fit on main pages

#### Implementation

```typescript
// Main pages: Static React components, no Canvas layout
<CharacterSheet character={character} />   // Fixed layout
<InventorySheet character={character} />   // Fixed layout
<SpellSheet character={character} />       // Fixed layout

// Overflow pages: Canvas-driven when needed
{featuresOverflow.length > 0 && (
  <OverflowPage 
    title="Features (Continued)"
    items={featuresOverflow}
  />  // Uses Canvas measurement
)}
```

---

### 1.4 Multi-Sheet Organization

**Date:** December 7, 2025  
**Context:** Organizing character information across pages  
**Impact:** Clean separation of concerns, easier mobile adaptation

#### The Learning

**Separate dedicated sheets beat cramming everything onto one page.** Each sheet has a focused purpose and can be independently optimized.

#### Sheet Organization

| Sheet | Purpose | Content |
|-------|---------|---------|
| **CharacterSheet** | Core mechanics | Abilities, saves, skills, combat stats, HP |
| **BackgroundPersonalitySheet** | Roleplay | Traits, ideals, bonds, flaws, notes |
| **InventorySheet** | Possessions | Equipment, weapons, armor, currency, treasure |
| **SpellSheet** | Magic | Slots, cantrips, prepared/known spells by level |

#### Why This Works

1. **Print optimization** - Each sheet is a clean 8.5"×11" page
2. **Mobile adaptation** - Sheets become vertical scroll sections
3. **Conditional rendering** - Non-casters skip SpellSheet
4. **Focused editing** - User edits one domain at a time
5. **Future proofing** - Easy to add sheets (Companions, Vehicles)

#### Code Organization

```
sheetComponents/
├── CharacterSheet.tsx           ← Main orchestrator
├── CharacterSheetPage.tsx       ← Page container with PHB frame
├── CharacterHeader.tsx          ← Shared across sheets
│
├── BackgroundPersonalitySheet.tsx
├── InventorySheet.tsx
├── SpellSheet.tsx
│
├── column1/                     ← CharacterSheet sections
├── column2/
├── column3/
│
├── inventory/                   ← InventorySheet sections
│   ├── InventoryHeader.tsx
│   ├── InventoryBlock.tsx
│   └── ItemRow.tsx
│
└── spells/                      ← SpellSheet sections
    ├── SpellLevelSection.tsx
    ├── SpellSlotTracker.tsx
    └── SpellList.tsx
```

---

### 1.5 Task Granularity Matters

**Date:** December 2, 2025  
**Context:** Original T066 was "Implement calculateDerivedStats()"  
**Impact:** Hidden complexity, unclear scope

#### The Learning

**Large tasks should be broken down when they contain multiple calculation types or can be independently tested.**

#### Before (Too Coarse)

```markdown
- [ ] T066 Implement `calculateDerivedStats()` in DnD5eRuleEngine.ts
```

This hides:
- AC calculation (multiple formulas: armor, natural, unarmored)
- HP calculation (hit die + CON per level)
- Initiative calculation (DEX mod)
- Passive scores (Perception/Investigation/Insight)
- Speed (race-based)

#### After (Right Granularity)

```markdown
- [ ] T066a Implement `calculateArmorClass(character)` 
- [ ] T066b Implement `calculateHP(character)` 
- [ ] T066c Implement `calculateInitiative(character)` 
- [ ] T066d Implement `calculatePassiveScores(character)` 
- [ ] T066e Wire all into `calculateDerivedStats()` + tests
```

Each subtask:
- Has one responsibility
- Can be independently tested
- Fits in ~30-45 min
- Has clear success criteria

---

### 1.6 Implementation-Ready Handoffs Work

**Date:** December 7, 2025  
**Context:** Preparing handoffs for fresh agents to continue work  
**Impact:** One-shot implementations with zero rework

#### The Learning

**A handoff is a treasure map, not just requirements.** Tell the agent WHERE to find pieces, not just WHAT to build.

#### Handoff Elements That Enable One-Shot Success

| Element | Purpose | Example |
|---------|---------|---------|
| **File paths** | No searching needed | `src/components/PCG/sheetComponents/CharacterSheet.css` |
| **Line numbers** | Jump directly to code | `CharacterHeader.tsx (lines 12-45)` |
| **Code snippets** | Show patterns to reuse | "Adapt this grid pattern from AbilityScoresRow" |
| **ASCII layouts** | Unambiguous visual target | 3-column grid diagram |
| **CSS variables** | No hunting for values | `var(--phb-border-radius), var(--stat-font-size)` |
| **Reference implementations** | "Copy this, modify that" | "Use InventorySheet pattern for SpellSheet" |

#### Evidence

**BackgroundPersonalitySheet Implementation:**
- Handoff: 15 min (file paths, code snippets, layout diagram)
- Implementation: 20 min (one-shot, zero rework)
- Agent read 5 files in parallel → 4 surgical edits → done

#### Anti-Pattern: Vague Handoffs

```markdown
❌ BAD:
"Build a spell sheet component that shows spells by level"

✅ GOOD:
"Build SpellSheet.tsx:
- Copy structure from InventorySheet.tsx (lines 15-80)
- Use SpellLevelSection pattern from prototypes/spell-sheet.html
- CSS in CharacterSheet.css (search 'spell-level-')
- Wire into CharacterCanvas.tsx at line 142"
```

---

## 📚 Patterns Documented

### Completed
- [x] HTML-First component building workflow (Section 1.2)
- [x] Static pages + overflow architecture (Section 1.3)
- [x] Multi-sheet organization (Section 1.4)
- [x] CSS extraction from HTML prototypes
- [x] Print contract for native PDF export (Section 3.x)
- [x] Print preview snapshot debugging tool (Section 3.5)

### Future
- [ ] Rule Engine interface design
- [ ] Validation system architecture
- [ ] Wizard step state management
- [ ] Overflow page measurement patterns
- [ ] Interactivity patterns (spell slots, HP tracking)

---

## 🔗 Related Documents

### Design Documents
- `specs/PlayerCharacterGenerator/tasks.md` - Task tracking
- `specs/PlayerCharacterGenerator/spec.md` - Project specification
- `specs/PlayerCharacterGenerator/DESIGN-Canvas-Character-Sheet-Integration.md` - Canvas architecture
- `specs/PlayerCharacterGenerator/ANALYSIS-Page-Layout-Components.md` - Component breakdown

### Handoffs
- `specs/PlayerCharacterGenerator/HANDOFF-Component-Implementation.md` - Component build guide
- `specs/PlayerCharacterGenerator/HANDOFF-Mobile-Responsiveness.md` - Mobile conversion

### Related Learnings
- `LEARNINGS-StatblockGenerator-Rebuild-2025.md` - Canvas patterns origin
- `LEARNINGS-Mobile-Canvas-Conversion-2025.md` - Mobile adaptation patterns

---

### 1.7 Measurement Portal Must Return Elements, Not Components

**Date:** December 7, 2025  
**Context:** Implementing features overflow with DOM measurement  
**Impact:** Critical bug that caused infinite re-render loop

#### The Learning

**When creating measurement hooks, return the portal as a `React.ReactNode` (element) from `useMemo`, NOT as a component function from `useCallback`.**

#### The Problem

```typescript
// ❌ WRONG: useCallback returns a function
const MeasurementPortal: React.FC = useCallback(() => {
    return createPortal(<div>...</div>, node);
}, [items]); // Dependencies cause function recreation

// Usage creates new component type each render
return <MeasurementPortal />;
```

This causes:
1. New component type on each render
2. React unmounts old portal
3. Measurements reset to 0
4. State change triggers re-render
5. **Infinite loop**

#### The Fix

```typescript
// ✅ CORRECT: useMemo returns an element
const measurementPortal = useMemo<React.ReactNode>(() => {
    if (!portalNode) return null;
    return <PortalContent items={items} />;
}, [items, portalNode]);

// Usage renders the element directly
return <>{measurementPortal}</>;
```

#### Why This Matters for PCG

The `useFeaturesOverflow` hook measures feature heights to split content across pages. The measurement portal must remain stable to accumulate measurements.

**See:** `LEARNINGS-Canvas-Measurement-Pagination-2025.md` Issue 15 for full technical details.

---

### 1.8 Multi-Column Pagination Must Track Per-Column Heights

**Date:** December 8, 2025  
**Context:** Inventory overflow was creating premature page breaks  
**Impact:** Items that fit on page 1 were being pushed to page 2

#### The Problem

The pagination algorithm treated the page as a single column:

```typescript
// ❌ WRONG: Single height tracking for 3-column layout
let currentPageHeight = 0;

for (const category of categories) {
    if (currentPageHeight + categoryHeight > MAX_PAGE_HEIGHT) {
        startNewPage(); // Too aggressive!
    }
    currentPageHeight += categoryHeight;
}
```

This caused premature breaks because:
- Page has 3 columns, not 1
- First category fills "column 1" height
- Second category exceeds total height → new page
- But columns 2 and 3 are completely empty!

#### The Fix

Track height per column, place in shortest column:

```typescript
// ✅ CORRECT: Track each column separately
const columnHeights = [0, 0, 0];

for (const category of categories) {
    // Find shortest column
    const shortestIdx = columnHeights.indexOf(Math.min(...columnHeights));
    
    // Check if shortest column has room
    if (columnHeights[shortestIdx] + categoryHeight > MAX_PAGE_HEIGHT) {
        // ALL columns are full - start new page
        startNewPage();
        columnHeights.fill(0);
    }
    
    columnHeights[shortestIdx] += categoryHeight;
}
```

#### Key Insight

**Pagination logic must mirror the actual CSS layout.** If CSS uses flexbox with `flex-direction: column` and 3 columns, the algorithm must track 3 separate heights.

---

### 1.9 Avoid Double-Processing Display Flags

**Date:** December 8, 2025  
**Context:** Category titles showed "Consumables (Continued) (Continued)"  
**Impact:** User-visible bug, embarrassing output

#### The Problem

Both the hook AND the component added the "(Continued)" suffix:

```typescript
// Hook: Adds "(Continued)" to title
const categoryData = {
    title: isContinued ? `${title} (Continued)` : title,
    // ...
};

// Component: ALSO adds "(Continued)"
<h3>{category.isContinued ? `${category.title} (Continued)` : category.title}</h3>
```

Result: `"Consumables (Continued) (Continued)"`

#### The Fix

**Single responsibility:** Hook sets a flag, component renders it.

```typescript
// ✅ Hook: Sets flag only
const categoryData = {
    title,
    isContinued: true,  // Just the flag
    // ...
};

// ✅ Component: Reads flag, formats display
<h3>
    {category.title}
    {category.isContinued && ' (Continued)'}
</h3>
```

#### The Pattern

| Layer | Responsibility |
|-------|---------------|
| **Hook/Logic** | Determine state (set flags, compute values) |
| **Component** | Format display (add suffixes, apply styles) |

Never let both layers modify the same output.

---

### 1.10 Hide Empty Sections Improves UX

**Date:** December 8, 2025  
**Context:** Level 1 wizards saw empty 5th-9th level spell sections  
**Impact:** Cleaner sheets, less visual clutter

#### The Learning

**Show sections only when they have content OR slots.** Empty sections waste space and confuse users.

#### Implementation

```typescript
// Helper function
const shouldShowLevel = (level: number, spells: SpellEntry[], slots: SpellSlotLevel[]) => {
    // Has spells at this level
    if (spells.length > 0) return true;
    
    // Has slots at this level (character can eventually cast these)
    if (level > 0) {
        const slotInfo = slots.find(s => s.level === level);
        if (slotInfo?.total > 0) return true;
    }
    
    return false;
};

// Usage: Conditional rendering
{shouldShowLevel(5, level5Spells, spellSlots) && (
    <SpellLevelBlock level={5} spells={level5Spells} ... />
)}
```

#### Applied To

| Component | Before | After |
|-----------|--------|-------|
| SpellSheet | All 10 levels always shown | Only levels with spells or slots |
| SpellSlotTracker | All 9 slot levels | Only levels with slots |

#### Edge Cases Handled

- **Cantrips (level 0):** Only show if character has cantrips
- **Prepared casters:** Show empty levels if they have slots (can prepare later)
- **Low-level casters:** Hide 5th-9th level entirely until they reach that level

---

## 📚 Patterns Documented

### Completed
- [x] HTML-First component building workflow (Section 1.2)
- [x] Static pages + overflow architecture (Section 1.3)
- [x] Multi-sheet organization (Section 1.4)
- [x] CSS extraction from HTML prototypes
- [x] Measurement portal element pattern (Section 1.7)
- [x] Multi-column pagination tracking (Section 1.8)
- [x] Display flag single-responsibility (Section 1.9)
- [x] Conditional section visibility (Section 1.10)

### Future
- [ ] Rule Engine interface design
- [ ] Validation system architecture
- [ ] Wizard step state management
- [ ] Interactivity patterns (spell slots, HP tracking)

---

## 🔗 Related Documents

### Design Documents
- `specs/PlayerCharacterGenerator/tasks.md` - Task tracking
- `specs/PlayerCharacterGenerator/spec.md` - Project specification
- `specs/PlayerCharacterGenerator/DESIGN-Canvas-Character-Sheet-Integration.md` - Canvas architecture
- `specs/PlayerCharacterGenerator/ANALYSIS-Page-Layout-Components.md` - Component breakdown

### Handoffs
- `specs/PlayerCharacterGenerator/HANDOFF-Component-Implementation.md` - Component build guide
- `specs/PlayerCharacterGenerator/HANDOFF-Pagination-Integration.md` - Pagination patterns
- `specs/PlayerCharacterGenerator/HANDOFF-Mobile-Responsiveness.md` - Mobile conversion

### Related Learnings
- `LEARNINGS-Canvas-Measurement-Pagination-2025.md` - Canvas measurement patterns
- `LEARNINGS-StatblockGenerator-Rebuild-2025.md` - Canvas patterns origin
- `LEARNINGS-Mobile-Canvas-Conversion-2025.md` - Mobile adaptation patterns

---

### 1.11 Case Sensitivity in ID Lookups

**Date:** December 11, 2025  
**Context:** Spell selection not appearing for Warlock (and all casters)  
**Impact:** Step 4 (Spells) was being skipped entirely

#### The Problem

```typescript
// ❌ WRONG: Class name is "Warlock", but class IDs are "warlock"
const isSpellcaster = (): boolean => {
    const primaryClass = character.dnd5eData.classes[0];
    const classData = ruleEngine.getClassById(primaryClass.name);  // Returns undefined!
    return classData?.spellcasting !== undefined;  // false for ALL classes
};
```

The wizard navigation used this to skip Step 4 for non-casters. But since it returned `false` for everyone, ALL casters had spell selection skipped.

#### The Fix

```typescript
// ✅ CORRECT: Normalize to lowercase before lookup
const classData = ruleEngine.getClassById(primaryClass.name.toLowerCase());
```

#### The Pattern

**Defensive ID lookups:** When looking up by ID, always normalize case.

```typescript
// Option 1: Normalize at call site
const data = engine.getById(id.toLowerCase());

// Option 2: Normalize inside the method
getById(id: string): T | undefined {
    const normalizedId = id.toLowerCase();
    return this.data.find(item => item.id === normalizedId);
}
```

#### Debugging Approach

1. Added console.log to trace data flow
2. Found `spellcastingInfo.isSpellcaster = false` even for Warlock
3. Traced to `getSpellcastingClass()` → `getClassById()` returning undefined
4. Checked class data: `id: 'warlock'` vs lookup: `getClassById('Warlock')`

**Lesson:** When lookups return `undefined`, check case sensitivity first.

---

### 1.12 Consistent UX Patterns Across Features

**Date:** December 11, 2025  
**Context:** Implementing skill overlap replacement and weapon sub-selection  
**Impact:** Users recognize patterns, implementation is faster

#### The Learning

**Reuse successful UX patterns across similar interactions.** When users see consistent behavior, they learn faster.

#### The Pattern: Selection → Confirmation Box

```
BEFORE SELECTION:
Replace Athletics with:
○ Acrobatics  ○ Arcana  ○ History  ...

AFTER SELECTION:
┌────────────────────────────────────────┐
│ ✓  Athletics → Arcana         [Change] │
│    (green background)                  │
└────────────────────────────────────────┘
```

#### Applied To

| Feature | Where | Pattern |
|---------|-------|---------|
| Skill overlap | Background step | Radio → Green confirmation box |
| Weapon sub-selection | Equipment choices | Dropdown → Green confirmation box |
| Equipment choice | Class step | Radio → Left border highlight |

#### Implementation Template

```tsx
{selectedValue ? (
    // Show confirmation box when selected
    <Box p="xs" style={{
        backgroundColor: 'var(--mantine-color-green-0)',
        border: '1px solid var(--mantine-color-green-4)',
        borderRadius: 'var(--mantine-radius-sm)'
    }}>
        <Group justify="space-between">
            <Group gap="xs">
                <IconCheck size={14} color="var(--mantine-color-green-6)" />
                <Text>{selectedLabel}</Text>
            </Group>
            <Text size="xs" c="blue" style={{ cursor: 'pointer' }}
                onClick={() => clearSelection()}>
                Change
            </Text>
        </Group>
    </Box>
) : (
    // Show selection options
    <Radio.Group value="" onChange={handleSelect}>
        {options.map(opt => <Radio key={opt.id} ... />)}
    </Radio.Group>
)}
```

**Lesson:** Extract successful patterns and apply consistently.

---

### 1.13 Three-Option Design Exploration

**Date:** December 11, 2025  
**Context:** Deciding how to implement spell selection  
**Impact:** Clear decision framework, backlog for future enhancements

#### The Learning

**Present three design options before implementing complex features:**
1. **Standard** - Familiar, low risk, quick to build
2. **Polished** - Better UX, more effort, worth doing eventually
3. **Novel** - Innovative, highest effort, differentiating

#### Example: Spell Selection

| Option | Description | Estimate | When |
|--------|-------------|----------|------|
| **Standard** | Checkbox grid with counters | 2-3 hours | Now |
| **Polished** | Side-by-side spell browser with filters | 4-6 hours | Later |
| **Novel** | AI-powered spell advisor | 8-12 hours | Future |

#### Benefits

1. **Prevents scope creep** - "Let's just add this" has a clear answer
2. **Creates backlog naturally** - Options 2 and 3 become documented future work
3. **Sets expectations** - User understands trade-offs
4. **Faster decisions** - Concrete options vs abstract discussion

#### When to Use

✅ **Use when:**
- Feature has multiple valid approaches
- UX quality matters significantly
- User might want "more" than minimum viable

❌ **Skip when:**
- Only one reasonable approach
- Fixing a bug (just fix it)
- Very small feature (<1 hour)

**Lesson:** Three options → informed decision → backlog for the rest.

---

### 1.14 Nested ScrollArea Anti-Pattern

**Date:** December 11, 2025  
**Context:** Drawer content was cut off at bottom on some steps  
**Impact:** Content unreachable, poor UX

#### The Problem

Some wizard steps had their own ScrollArea:

```tsx
// ❌ WRONG: Nested scroll areas
<Drawer>
    <Box style={{ overflowY: 'auto' }}>  {/* Parent scroll */}
        <ClassSelectionStep />
    </Box>
</Drawer>

// Inside ClassSelectionStep.tsx:
<Stack gap="md" h="100%">
    <ScrollArea style={{ flex: 1 }}>  {/* Child scroll - PROBLEM */}
        {classCards}
    </ScrollArea>
</Stack>
```

This caused:
- Parent's bottom padding didn't apply to child ScrollArea
- Child consumed all height, nothing left for parent's padding
- Content cut off at bottom

#### The Fix

Let parent handle all scrolling:

```tsx
// ✅ CORRECT: Single scroll container
<Drawer>
    <Box style={{ 
        overflowY: 'auto',
        paddingBottom: '100px'  // Now applies to ALL content
    }}>
        <ClassSelectionStep />
    </Box>
</Drawer>

// Inside ClassSelectionStep.tsx:
<Stack gap="md">  {/* No h="100%", no ScrollArea */}
    {classCards}
</Stack>
```

#### The Pattern

| Layer | Responsibility |
|-------|---------------|
| **Drawer/Modal** | Scroll container, padding, max-height |
| **Step components** | Content only, natural height |

#### Applied To

Removed nested ScrollArea from:
- ClassSelectionStep
- RaceSelectionStep
- BackgroundSelectionStep
- EquipmentStep
- SpellSelectionStep

**Lesson:** One scroll container per view. Child components flow naturally.

---

### 1.15 Visual Markers for Step Completion

**Date:** December 11, 2025  
**Context:** User unsure if they'd scrolled to bottom of wizard steps  
**Impact:** Inconsistent UX, confusion about step completeness

#### The Learning

**Add consistent footer message to all steps** as a visual "end of content" marker.

#### Implementation

```tsx
// Added to ALL 8 wizard steps:
<Stack gap="md">
    {/* Step content */}
    
    {/* Footer marker - always last */}
    <Text size="xs" c="dimmed" ta="center">
        Changes are saved automatically and shown on the character sheet.
    </Text>
</Stack>
```

#### Benefits

1. **Visual completion signal** - User knows they've seen everything
2. **Reassurance** - "It's saving, I won't lose work"
3. **Debugging aid** - Developer can confirm scroll is working
4. **Consistent UX** - Same marker on every step

#### Variation for Final Step

```tsx
// Review step (Step 7):
<Text size="xs" c="dimmed" ta="center">
    Your character is saved automatically. Close the drawer to view the full sheet.
</Text>
```

**Lesson:** Small consistent markers improve perceived polish significantly.

---

### 1.16 Knowing When to Punt

**Date:** December 11, 2025  
**Context:** User asked about adding leveling up to the wizard  
**Impact:** Avoided scope creep, maintained focus

#### The Learning

**Large scope expansions get their own backlog item, not a "while we're here" implementation.**

#### Decision Framework

| Signal | Action |
|--------|--------|
| Related to current work | Consider including |
| Same codebase area | Consider including |
| Adds 2-4 hours | Consider including |
| New feature domain | **Punt to backlog** |
| Adds 20+ hours | **Punt to backlog** |
| Changes data model significantly | **Punt to backlog** |

#### Example: Leveling Up

```
Current scope: L1 character creation wizard
Leveling up would add:
  - HP increases (new UI)
  - ASI/Feat selection (new step?)
  - Spell progression (new rules)
  - Subclass timing (L2/L3 classes)
  - Multiclassing (completely new)
  
Estimate: 20-40 hours
Decision: Punt to backlog as P2
```

#### How to Punt Well

1. **Acknowledge the value** - "Yes, that's important"
2. **Explain the scope** - "It's 20-40 hours because..."
3. **Create backlog item** - Document it properly
4. **Identify dependencies** - "Should finish L1 first"
5. **Move on** - Don't dwell

**Lesson:** Focused sessions finish things. Scope creep finishes nothing.

---

## 📚 Patterns Documented

### Completed
- [x] HTML-First component building workflow (Section 1.2)
- [x] Static pages + overflow architecture (Section 1.3)
- [x] Multi-sheet organization (Section 1.4)
- [x] CSS extraction from HTML prototypes
- [x] Measurement portal element pattern (Section 1.7)
- [x] Multi-column pagination tracking (Section 1.8)
- [x] Display flag single-responsibility (Section 1.9)
- [x] Conditional section visibility (Section 1.10)
- [x] Case sensitivity in ID lookups (Section 1.11)
- [x] Consistent UX patterns (Section 1.12)
- [x] Three-option design exploration (Section 1.13)
- [x] Nested ScrollArea anti-pattern (Section 1.14)
- [x] Visual markers for step completion (Section 1.15)
- [x] Knowing when to punt (Section 1.16)

### Future
- [ ] Rule Engine interface design
- [ ] Validation system architecture
- [ ] Wizard step state management
- [ ] Interactivity patterns (spell slots, HP tracking)

---

## 🔗 Related Documents

### Design Documents
- `specs/PlayerCharacterGenerator/tasks.md` - Task tracking
- `specs/PlayerCharacterGenerator/spec.md` - Project specification
- `specs/PlayerCharacterGenerator/DESIGN-Canvas-Character-Sheet-Integration.md` - Canvas architecture
- `specs/PlayerCharacterGenerator/ANALYSIS-Page-Layout-Components.md` - Component breakdown

### Handoffs
- `specs/PlayerCharacterGenerator/HANDOFF-Component-Implementation.md` - Component build guide
- `specs/PlayerCharacterGenerator/HANDOFF-Pagination-Integration.md` - Pagination patterns
- `specs/PlayerCharacterGenerator/HANDOFF-Mobile-Responsiveness.md` - Mobile conversion
- `specs/PlayerCharacterGenerator/HANDOFF-Wizard-Polish.md` - Wizard polish tasks
- `specs/PlayerCharacterGenerator/HANDOFF-Spell-Selection-Wizard.md` - Spell selection fix

### Related Learnings
- `LEARNINGS-Canvas-Measurement-Pagination-2025.md` - Canvas measurement patterns
- `LEARNINGS-StatblockGenerator-Rebuild-2025.md` - Canvas patterns origin
- `LEARNINGS-Mobile-Canvas-Conversion-2025.md` - Mobile adaptation patterns

---

**Last Updated:** December 14, 2025 (Session - Added PCG PDF/Print contract learnings)  
**Next Review:** After Leveling Up implementation

