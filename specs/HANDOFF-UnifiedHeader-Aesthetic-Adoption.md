# HANDOFF: Complete LandingPage Visual Refresh

**Date:** December 17, 2025  
**Status:** 🟡 READY FOR IMPLEMENTATION  
**Complexity:** High (complete aesthetic overhaul)  
**Estimated Time:** 16-24 hours across 5-6 phases

---

## 🎯 Goal

**Complete visual refresh** of the entire LandingPage to match the polished aesthetic of StatblockGenerator and PlayerCharacterGenerator.

### The Problem

The site has **two distinct visual eras**:

**Modern (Target Aesthetic):**
- StatblockGenerator & PlayerCharacterGenerator
- Parchment textures, Balgruf headings, medieval feel
- UnifiedHeader with NavigationDrawer
- Mantine theme integration
- Consistent design tokens

**Legacy (Needs Refresh):**
- Home page, Blog, CardGenerator, RulesLawyer
- Conflicting CSS `:root` variables
- Montserrat fonts, purple/mauve palette
- NavBar sidebar (80px left margin)
- Hardcoded colors, inconsistent styling

---

## 📊 Current vs Target State

### Routes Overview

| Route | Current | Target |
|-------|---------|--------|
| `/` (Home) | NavBar + AppLinks + AboutMe + AboutDungeonMind | UnifiedHeader + Modernized sections |
| `/blog` | NavBar + legacy Blog.css | UnifiedHeader + parchment-styled cards |
| `/blog/:id` | NavBar + legacy Blog.css | UnifiedHeader + styled article |
| `/ruleslawyer` | NavBar + bare h1 + chat | UnifiedHeader + themed interface |
| `/cardgenerator` | NavBar + FloatingHeader | UnifiedHeader + toolbox |
| `/statblockgenerator` | ✅ UnifiedHeader | No change |
| `/playercharactergenerator` | ✅ UnifiedHeader | No change |

### CSS Conflicts to Resolve

**App.css `:root`** (legacy palette):
```css
--primary-color: #4a4e69;      /* Purple-gray */
--secondary-color: #9a8c98;    /* Mauve */
--accent-color: #c9ada7;       /* Dusty rose */
--background-color: #f2e9e4;   /* Cream */
--text-color: #22223b;         /* Dark purple */
```

**Blog.css `:root`** (duplicate, also conflicting):
```css
--primary-color: #4a4e69;
--secondary-color: #9a8c98;
/* ... same legacy palette */
```

**Target (Mantine theme from `mantineTheme.ts`):**
```css
--mantine-color-blue-4: #4a90e2;           /* Primary blue */
--mantine-color-parchment-3: #f4f1e8;      /* Parchment base */
/* Balgruf font for headings */
/* System fonts for body */
```

---

## 📁 File Inventory

### Pattern Sources (READ FIRST)
```
src/components/UnifiedHeader.tsx              ← Header pattern
src/components/StatBlockGenerator/            ← Reference implementation
  StatBlockGenerator.tsx                      ← How to wire UnifiedHeader
  statblockToolboxConfig.tsx                  ← Toolbox pattern
src/components/PlayerCharacterGenerator/      ← Another reference
  PlayerCharacterGenerator.tsx
  characterToolboxConfig.tsx
src/config/mantineTheme.ts                    ← Design tokens
```

### Files to DELETE (after migration)
```
src/components/NavBar.tsx                     ← Legacy sidebar nav
src/components/CardGenerator/FloatingHeader.tsx
```

### Files to REWRITE
```
src/App.tsx                                   ← Remove ConditionalNavBar, simplify
src/styles/App.css                            ← Remove legacy :root, clean up
src/Blog/Blog.css                             ← Complete restyle
src/Blog/BlogList.tsx                         ← Add UnifiedHeader, restyle
src/Blog/BlogPost.tsx                         ← Add UnifiedHeader, restyle
src/components/AppLinks.tsx                   ← Modernize card grid
src/components/AppLinks.css                   ← Use Mantine tokens
src/components/AboutMe.tsx                    ← Restyle with theme
src/components/AboutDungeonMind.tsx           ← Restyle, update content
src/components/RulesLawyer/index.tsx          ← Add UnifiedHeader
src/components/RulesLawyer/RulesLawyer.css    ← Restyle
src/components/CardGenerator/CardGeneratorRefactored.tsx  ← Replace FloatingHeader
```

### Files to CREATE
```
src/components/CardGenerator/cardToolboxConfig.tsx
src/components/RulesLawyer/rulesLawyerToolboxConfig.tsx
src/pages/HomePage.tsx                        ← New home page component (optional)
```

---

## 🎨 Design System

### Color Palette (from `mantineTheme.ts`)

```css
/* PRIMARY */
--dm-blue: #4a90e2;
--dm-blue-dark: #357abd;

/* SURFACES */
--dm-parchment: #f4f1e8;
--dm-surface-white: #ffffff;
--dm-surface-light: #f7f7f7;

/* TEXT */
--dm-text-primary: #333333;
--dm-text-muted: #666666;
--dm-text-light: #999999;

/* ACCENTS */
--dm-success: #7ed321;
--dm-error: #d0021b;
--dm-warning: #f5a623;

/* BORDERS */
--dm-border-light: #e0e0e0;
--dm-border-medium: #cccccc;
```

### Typography

| Element | Font | Weight | Size |
|---------|------|--------|------|
| H1 | Balgruf | 700 | 2rem |
| H2 | Balgruf | 600 | 1.5rem |
| H3 | Balgruf | 600 | 1.125rem |
| Body | System stack | 400 | 1rem |
| Small | System stack | 400 | 0.875rem |

### Spacing Scale
```css
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */
```

### Component Patterns

**Card (for AppLinks, Blog posts):**
```css
.dm-card {
    background: var(--mantine-color-parchment-3);
    border: 2px solid var(--mantine-color-blue-4);
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.dm-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}
```

**Section Container:**
```css
.dm-section {
    max-width: 1200px;
    margin: 0 auto;
    padding: var(--space-8) var(--space-4);
}
```

---

## 📐 Layout Architecture

### Before (Legacy)

```
┌─────────────────────────────────────────────────────────────┐
│ [NavBar - 80px fixed left]                                  │
│ ┌─────────────┐  ┌─────────────────────────────────────────┐│
│ │ DM Logo     │  │ Content (margin-left: 80px)             ││
│ │ Home        │  │                                          ││
│ │ Blog        │  │  [FloatingHeader for CardGen]            ││
│ │ CardGen     │  │                                          ││
│ │ StatBlock   │  │  [Main Content]                          ││
│ │ CharGen     │  │                                          ││
│ │ RulesLawyer │  │                                          ││
│ └─────────────┘  └─────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### After (Unified)

```
┌─────────────────────────────────────────────────────────────┐
│ [UnifiedHeader - sticky top]                                │
│ ┌───────────────────────────────────────────────────────────┐
│ │ ☰ DM │ Page Title │        │ [Toolbox▼] │ 💾 │ [?] │ 👤 │
│ └───────────────────────────────────────────────────────────┘
│                                                             │
│ ┌───────────────────────────────────────────────────────────┐
│ │                     CONTENT                               │
│ │  - Full width (no left margin)                            │
│ │  - Centered max-width container where needed              │
│ │  - Parchment/surface backgrounds                          │
│ └───────────────────────────────────────────────────────────┘
│                                                             │
│ [Footer]                                                    │
└─────────────────────────────────────────────────────────────┘

☰ opens NavigationDrawer (slides from left):
┌─────────────────┐
│ DungeonMind     │
├─────────────────┤
│ 🏠 Home         │
│ 📝 Blog         │
│ 🎴 Card Gen     │
│ 👹 Statblock    │
│ 🧙 Character    │
│ ⚖️ Rules Lawyer │
├─────────────────┤
│ About           │
│ Contact         │
└─────────────────┘
```

---

## 📋 Implementation Phases

### Phase 0: CSS Cleanup & Foundation (2-3 hours)

**Goal:** Remove conflicting CSS, establish clean foundation

**Steps:**
1. **Remove duplicate `:root` from `Blog.css`** - delete lines 1-9
2. **Update `App.css` `:root`** - replace legacy palette with Mantine token references:
   ```css
   :root {
     /* Legacy variables mapped to Mantine - for gradual migration */
     --primary-color: var(--mantine-color-blue-4);
     --background-color: var(--mantine-color-parchment-3);
     --text-color: #333333;
     /* Remove secondary-color, accent-color - use Mantine directly */
   }
   ```
3. **Remove Montserrat font declaration** - let Mantine theme handle fonts
4. **Clean up margin-left: 80px** - will be removed when NavBar goes

**Success Criteria:**
- [ ] No duplicate `:root` definitions
- [ ] Legacy colors mapped to Mantine tokens
- [ ] Font declarations removed from App.css

---

### Phase 1: App.tsx Simplification (2-3 hours)

**Goal:** Remove ConditionalNavBar, simplify layout

**Steps:**
1. **Read** `StatBlockGenerator.tsx` to see UnifiedHeader pattern
2. **Modify `App.tsx`:**
   - Remove `ConditionalNavBar` component entirely
   - Remove `NavBar` import
   - Simplify `MainContent` - remove conditional margin logic
   - All routes now full-width by default
3. **Verify** StatblockGenerator and PlayerCharacterGenerator still work
4. **Test** NavigationDrawer still accessible (it's in UnifiedHeader)

**Before:**
```tsx
<ConditionalNavBar />
<MainContent>
  <Routes>...</Routes>
</MainContent>
```

**After:**
```tsx
<MainContent>
  <Routes>...</Routes>
</MainContent>
```

**Success Criteria:**
- [ ] NavBar completely removed
- [ ] No 80px margin-left anywhere
- [ ] STG and PCG still work perfectly
- [ ] NavigationDrawer accessible from those pages

---

### Phase 2: Home Page Modernization (3-4 hours)

**Goal:** Restyle Home page sections

**Steps:**
1. **Add UnifiedHeader to home route** in App.tsx:
   ```tsx
   <Route path="/" element={
     <>
       <UnifiedHeader 
         app={{ id: 'home', name: 'DungeonMind', icon: DM_LOGO_URL }}
         showAuth={true}
       />
       <AppLinks />
       <AboutMe />
       <AboutDungeonMind />
     </>
   } />
   ```

2. **Restyle `AppLinks.tsx` and `AppLinks.css`:**
   - Use CSS Grid for responsive card layout
   - Apply `.dm-card` pattern
   - Use Mantine color tokens
   - Update hover effects

   **Target Layout:**
   ```
   ┌─────────────────────────────────────────────────────┐
   │                   OUR TOOLS                         │
   ├─────────────────────────────────────────────────────┤
   │ ┌───────────┐ ┌───────────┐ ┌───────────┐          │
   │ │ Store Gen │ │ Card Gen  │ │ StatBlock │          │
   │ │   [img]   │ │   [img]   │ │   [img]   │          │
   │ └───────────┘ └───────────┘ └───────────┘          │
   │ ┌───────────┐ ┌───────────┐                        │
   │ │ Character │ │ Rules Law │                        │
   │ │   [img]   │ │   [img]   │                        │
   │ └───────────┘ └───────────┘                        │
   └─────────────────────────────────────────────────────┘
   ```

3. **Restyle `AboutMe.tsx`:**
   - Use Mantine Paper component
   - Styled CTA buttons with Mantine Button

4. **Update `AboutDungeonMind.tsx`:**
   - Update content (statblocks, cards, rules lawyer are now ported!)
   - Use Mantine components

**Success Criteria:**
- [ ] Home page has UnifiedHeader
- [ ] AppLinks uses parchment cards with blue borders
- [ ] About sections use Mantine Paper styling
- [ ] Responsive grid layout works

---

### Phase 3: Blog Modernization (2-3 hours)

**Goal:** Restyle Blog with DungeonMind aesthetic

**Steps:**
1. **Modify `BlogList.tsx`:**
   - Add UnifiedHeader
   - Wrap content in Mantine Container
   - Use Mantine Card for each post preview

2. **Modify `BlogPost.tsx`:**
   - Add UnifiedHeader
   - Style article content with Mantine Typography
   - Add parchment background to content area

3. **Rewrite `Blog.css`:**
   - Remove all `:root` declarations
   - Use Mantine/DM tokens only
   - Style for readability (max-width, line-height)

**Target Blog Card:**
```
┌─────────────────────────────────────────┐
│ [Post Title in Balgruf]                 │
├─────────────────────────────────────────┤
│ [Preview snippet text...]               │
│                                         │
│ [Read More →]              [Date]       │
└─────────────────────────────────────────┘
```

**Success Criteria:**
- [ ] Blog list has UnifiedHeader
- [ ] Blog posts have UnifiedHeader
- [ ] Cards use parchment + blue border pattern
- [ ] Typography uses Balgruf for headings

---

### Phase 4: RulesLawyer & CardGenerator (3-4 hours)

**Goal:** Add UnifiedHeader to remaining generators

#### RulesLawyer:
1. Create `rulesLawyerToolboxConfig.tsx`:
   - Embedding selector control
   - Clear chat button
2. Modify `index.tsx`:
   - Add UnifiedHeader
   - Remove h1 (header shows title)
3. Update `RulesLawyer.css`:
   - Use Mantine tokens
   - Style chat interface with parchment feel

#### CardGenerator:
1. Create `cardToolboxConfig.tsx`:
   - Step navigation
   - Save status
   - Projects button
2. Modify `CardGeneratorRefactored.tsx`:
   - Replace FloatingHeader with UnifiedHeader
   - Remove 80px left margin logic
3. Delete `FloatingHeader.tsx`

**Success Criteria:**
- [ ] RulesLawyer has UnifiedHeader with toolbox
- [ ] CardGenerator has UnifiedHeader with toolbox
- [ ] FloatingHeader.tsx deleted
- [ ] Step navigation works via toolbox

---

### Phase 5: Cleanup & Polish (2-3 hours)

**Goal:** Final consistency pass, delete dead code

**Steps:**
1. **Delete `NavBar.tsx`**
2. **Clean up CSS files:**
   - Remove unused selectors
   - Remove old color variables
   - Consolidate common patterns
3. **Test all routes:**
   - [ ] Home (`/`)
   - [ ] Blog (`/blog`)
   - [ ] Blog Post (`/blog/:id`)
   - [ ] RulesLawyer (`/ruleslawyer`)
   - [ ] CardGenerator (`/cardgenerator`)
   - [ ] StatblockGenerator (`/statblockgenerator`)
   - [ ] CharacterGenerator (`/playercharactergenerator`)
4. **Responsive testing:**
   - [ ] Mobile (< 768px)
   - [ ] Tablet (768-1024px)
   - [ ] Desktop (> 1024px)
5. **Accessibility check:**
   - [ ] Color contrast
   - [ ] Keyboard navigation
   - [ ] Screen reader labels

**Success Criteria:**
- [ ] No dead code
- [ ] All routes styled consistently
- [ ] Responsive on all breakpoints
- [ ] No console errors

---

## ⚠️ Critical Warnings

### Don't Break These
1. **StatblockGenerator** - Already perfect, don't touch
2. **PlayerCharacterGenerator** - Already perfect, don't touch
3. **Authentication** - UnifiedHeader handles this, wire correctly
4. **Tutorial system** - Preserve data-tutorial attributes
5. **Save functionality** - Wire saveStatus props correctly

### Watch For
1. **z-index conflicts** - NavBar was z-index: 1000, UnifiedHeader is also 1000
2. **Margin inheritance** - Many components assume 80px left margin
3. **CSS specificity** - Legacy !important rules may override Mantine

### Test Authentication
After each phase:
1. Log out → Log in works
2. Auth state persists across navigation
3. Protected actions work (save, etc.)

---

## 📚 Reference Code

### UnifiedHeader for Non-Generator Pages
```tsx
// Minimal header for home/blog pages
<UnifiedHeader
    app={{
        id: 'home',
        name: 'DungeonMind',
        icon: 'https://imagedelivery.net/.../dm-logo.png'
    }}
    showAuth={true}
    showHelp={false}
    // No toolbox needed for content pages
/>
```

### UnifiedHeader for Generator Pages
```tsx
// Full header with toolbox
<UnifiedHeader
    app={CARD_GENERATOR_APP}
    toolboxSections={toolboxSections}
    saveStatus={saveStatus}
    saveError={error}
    showProjects={true}
    onProjectsClick={handleOpenProjects}
    showGeneration={true}
    onGenerationClick={handleOpenGeneration}
    showAuth={true}
/>
```

### Mantine Card Pattern
```tsx
import { Card, Text, Title, Group } from '@mantine/core';

<Card 
    shadow="sm" 
    radius="md" 
    withBorder
    style={{ 
        backgroundColor: 'var(--mantine-color-parchment-3)',
        borderColor: 'var(--mantine-color-blue-4)',
        borderWidth: 2
    }}
>
    <Title order={3}>Card Title</Title>
    <Text>Card content...</Text>
</Card>
```

---

## 🔧 Debugging

### If header doesn't render
1. Check AppProvider wraps component tree
2. Verify import path for UnifiedHeader
3. Check for CSS hiding sticky elements

### If colors look wrong
1. Check for leftover `:root` declarations
2. Verify Mantine tokens are loading
3. Look for inline styles overriding

### If layout breaks
1. Check for remaining margin-left: 80px
2. Verify no position: fixed conflicts
3. Check z-index stacking

---

**Agent Instructions:**
1. Execute phases in order (0 → 5)
2. Commit after each phase
3. Run `pnpm lint` after each phase
4. Test in browser after each phase
5. Don't touch StatblockGenerator or PlayerCharacterGenerator
