# Handoff: LandingPage Page Centering Investigation

**Date:** 2025-12-14  
**Type:** Bug Investigation  
**Last Updated:** 2025-12-14  
**Status:** 🔄 Investigation Needed  

---

## 🚨 CURRENT STATE

### What's Working ✅
- Canvas pages (StatblockGenerator, PlayerCharacterGenerator) center correctly
- Canvas CSS layer architecture is functioning
- Generator routes have proper layout

### What's NOT Working ❌
- **All non-generator pages no longer center** - Home page, About sections, Blog pages
- **Suspected cause**: Global CSS reset added for Canvas compatibility is too aggressive
- **Affected pages**: `/`, `/blog`, `/blog/:id`, `/ruleslawyer`, `/cardgenerator` (non-canvas areas)

### Suspected Causes

**Primary Hypothesis: Global CSS Reset Too Aggressive**

The global reset in `src/styles/App.css` (lines 22-25) sets `margin: 0` on all body children:

```css
body *:not(.dm-canvas-responsive *):not(.dm-canvas-measurement-layer *):not(.character-sheet *) {
  box-sizing: inherit;
  margin: 0;
}
```

**Problem:** This removes margins from elements that need `margin: 0 auto` for centering.

**Secondary Hypothesis: Missing Width Constraint**

The `.main-content` class (lines 28-33) has `width: 100%` commented out:

```css
.main-content {
  /* width: 100%; */
  margin: 0 auto;
  padding: 0;
}
```

**Problem:** `margin: 0 auto` only centers when there's a width constraint (either explicit width or max-width).

**Tertiary Hypothesis: Class Name Conflict**

There are TWO `.app-container` definitions:
1. `src/styles/App.css` (lines 43-47): Has `max-width: 1200px; margin: 0 auto;`
2. `src/components/AppLinks.css` (lines 1-4): Only has `padding: 20px; margin-top: 80px;`

**Problem:** The second definition may be overriding the first, removing centering.

---

## 🔍 Debug Steps for Next Session

### Step 1: Verify the Issue
```bash
cd /home/drakosfire/Projects/DungeonOverMind/LandingPage
pnpm dev
# Open http://localhost:3000
# Inspect home page sections visually
```

**What to check:**
- Are sections left-aligned instead of centered?
- Do sections extend full width instead of max-width?
- Check browser DevTools → Elements → Computed styles for `.app-container` and sections

### Step 2: Inspect CSS Cascade
```bash
# Check which .app-container rule is winning
grep -r "\.app-container" src/
```

**Files to inspect:**
- `src/styles/App.css:43-47` - Should have `max-width: 1200px; margin: 0 auto;`
- `src/components/AppLinks.css:1-4` - May be overriding with only padding

**Expected:** `.app-container` should have `max-width: 1200px` and `margin: 0 auto` applied.

### Step 3: Test Global Reset Impact

**In browser DevTools:**
1. Select a section element (e.g., `#app-links`)
2. Check Computed styles → `margin`
3. Verify if `margin: 0` is being applied from the global reset

**Test case:**
```css
/* If this rule is removing margins: */
body *:not(.dm-canvas-responsive *):not(.dm-canvas-measurement-layer *):not(.character-sheet *) {
  margin: 0;  /* ← This removes margin: 0 auto from .app-container */
}
```

### Step 4: Check Section Structure

**Inspect DOM structure:**
```html
<div class="main-content">
  <div>
    <section id="app-links">
      <!-- AppLinks component -->
    </section>
    <section id="about-me">
      <!-- AboutMe component -->
    </section>
    <section id="about-dungeonmind">
      <!-- AboutDungeonMind component -->
    </section>
  </div>
</div>
```

**Questions:**
- Do sections have `.app-container` class? (They should)
- Is `.main-content` getting `margin-left: 80px` on desktop? (It should, but only when NavBar is visible)
- Are sections direct children of `.main-content` or wrapped in another div?

### Step 5: Verify CSS Specificity

**Check if Canvas CSS is affecting non-canvas pages:**

```bash
# Search for any global rules that might affect centering
grep -r "margin.*0" src/styles/canvas/
grep -r "max-width" src/styles/canvas/
```

**Expected:** Canvas CSS should only affect `.dm-canvas-responsive` and `.dm-canvas-measurement-layer` elements.

---

## 📋 Key Files

### Primary Suspects
```
src/styles/App.css:22-25          # Global margin reset (likely culprit)
src/styles/App.css:28-33          # .main-content (missing width?)
src/styles/App.css:43-47          # .app-container definition
src/components/AppLinks.css:1-4   # Conflicting .app-container definition
```

### Related Files
```
src/App.tsx:58-73                  # MainContent wrapper component
src/components/AppLinks.tsx        # Uses .app-links (not .app-container)
src/components/AboutMe.tsx         # Uses section#about
src/components/AboutDungeonMind.tsx # Uses .about-dungeon-mind#about
src/components/AboutDungeonMind.css:4-5  # Has max-width: 800px; margin: 0 auto
```

### Canvas CSS (for reference)
```
src/styles/canvas/canvas-base.css:22-33    # .dm-canvas-responsive centering
src/styles/canvas/index.css                # Canvas CSS imports
```

---

## 🎯 Investigation Checklist

- [ ] **Verify issue exists** - Open home page, confirm sections are not centered
- [ ] **Check computed styles** - Inspect `.app-container` and sections in DevTools
- [ ] **Compare CSS definitions** - Check which `.app-container` rule wins
- [ ] **Test global reset** - Temporarily comment out `margin: 0` in global reset
- [ ] **Check DOM structure** - Verify sections have proper classes and structure
- [ ] **Test fix** - Apply fix, verify centering works on all pages

---

## 🔧 Potential Fixes

### Fix 1: Exclude Container Classes from Global Reset

**File:** `src/styles/App.css:22-25`

**Current:**
```css
body *:not(.dm-canvas-responsive *):not(.dm-canvas-measurement-layer *):not(.character-sheet *) {
  box-sizing: inherit;
  margin: 0;
}
```

**Proposed:**
```css
body *:not(.dm-canvas-responsive *):not(.dm-canvas-measurement-layer *):not(.character-sheet *):not(.app-container):not(.main-content) {
  box-sizing: inherit;
  margin: 0;
}
```

**Rationale:** Preserve `margin: 0 auto` on container classes that need centering.

---

### Fix 2: Restore Width to .main-content

**File:** `src/styles/App.css:28-33`

**Current:**
```css
.main-content {
  /* width: 100%; */
  margin: 0 auto;
  padding: 0;
}
```

**Proposed:**
```css
.main-content {
  width: 100%;
  margin: 0 auto;
  padding: 0;
}
```

**Rationale:** `margin: 0 auto` requires a width constraint to center.

---

### Fix 3: Consolidate .app-container Definitions

**File:** `src/components/AppLinks.css:1-4`

**Current:**
```css
.app-container {
    padding: 20px;
    margin-top: 80px;
}
```

**Proposed:**
```css
.app-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    margin-top: 80px;
}
```

**Rationale:** Ensure `.app-container` always has centering, regardless of which file defines it.

**OR** remove `.app-container` from `AppLinks.css` and use a different class name (e.g., `.app-links-container`).

---

### Fix 4: Add Explicit Centering to Sections

**File:** `src/styles/App.css` (add new rule)

**Proposed:**
```css
/* Ensure sections with max-width center properly */
section:not(.dm-canvas-responsive section):not(.dm-canvas-measurement-layer section) {
  padding: 3rem 0;
  max-width: 1200px;
  margin: 0 auto;
}
```

**Rationale:** Explicitly center sections that aren't canvas-related.

---

## 🧪 Testing Plan

### Test Cases

1. **Home Page (`/`)**
   - [ ] `#app-links` section is centered
   - [ ] `#about-me` section is centered
   - [ ] `#about-dungeonmind` section is centered

2. **Blog Pages (`/blog`, `/blog/:id`)**
   - [ ] Blog list is centered
   - [ ] Blog post content is centered

3. **Rules Lawyer (`/ruleslawyer`)**
   - [ ] Main content area is centered

4. **Card Generator (`/cardgenerator`)**
   - [ ] Non-canvas areas (if any) are centered
   - [ ] Canvas areas remain unaffected

5. **Generator Routes (should be unaffected)**
   - [ ] `/statblockgenerator` - Canvas still centers correctly
   - [ ] `/charactergenerator` - Canvas still centers correctly

### Browser Testing
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (if available)

### Responsive Testing
- [ ] Desktop (> 1024px) - Sections centered, NavBar visible
- [ ] Tablet (768px - 1024px) - Sections centered
- [ ] Mobile (< 768px) - Sections stack, no NavBar margin

---

## 📚 Related Context

### Canvas CSS Architecture

The Canvas CSS uses CSS layers to control cascade priority:
1. `canvas-reset` - Browser normalization (lowest)
2. `canvas-structure` - Column widths, flexbox (Canvas owns)
3. `theme` - Colors, fonts, backgrounds (Themes own)
4. `canvas-overrides` - Structural overrides (highest)

**Key Point:** Canvas CSS should NOT affect non-canvas pages. The global reset in `App.css` was added to prevent Canvas styles from leaking, but it may be too aggressive.

### Previous Changes

**When:** Canvas styling abstraction (November 2025)  
**What:** Added global reset to exclude canvas areas from margin resets  
**Why:** Prevent Canvas CSS from affecting other pages  
**Issue:** The exclusion may not be comprehensive enough

---

## 🎯 Success Criteria

**Fixed when:**
- ✅ All non-generator pages have centered content
- ✅ Sections respect `max-width` constraints
- ✅ Canvas pages remain unaffected
- ✅ Responsive behavior works on all viewport sizes
- ✅ No visual regressions on generator routes

---

## 📝 Notes

- The global reset was added to support Canvas, but it may have broken existing centering
- `.app-container` is defined in two places - this is a code smell
- `.main-content` has `width: 100%` commented out - may be intentional for full-width layouts
- Sections may not be using `.app-container` class - need to verify DOM structure

---

## 🔗 References

- **Canvas CSS Architecture:** `Docs/roadmaps/Canvas/02-PHASE2-CSS-LAYER-ARCHITECTURE.md`
- **Canvas Styling Abstraction:** `Docs/ProjectDiary/2025/CharacterGenerator/2025-11-05-COMPLETE-Canvas-Styling-Abstraction.md`
- **App.css Global Reset:** `src/styles/App.css:22-25`
- **Canvas Base Styles:** `src/styles/canvas/canvas-base.css`

---

**Next Action:** Start with Step 1 (Verify the Issue) to confirm the problem before applying fixes.

