> **Historical import from DungeonOverMind — 2026-09-24.** This document records an older DungeonMind Web/product implementation state. It is not current LandingPage architecture or sequencing authority. Re-anchor against current code before applying it.

# Modal & Drawer Patterns with UnifiedHeader

**Created:** 2026-01-19  
**Context:** RulesLawyer modal overlay fix, alignment with StatblockGenerator/PlayerCharacterGenerator patterns  
**Status:** Active pattern documentation

---

## Problem Statement

When using Mantine Modal and Drawer components with the UnifiedHeader (88px on desktop, 82px tablet, 60px mobile), overlays and content can clip under the header or extend beyond the visible content area.

---

## Key Patterns

### 1. Page Layout: Use `generator-layout`

All pages with UnifiedHeader should use the shared `generator-layout` class:

```tsx
// ✅ CORRECT: Use generator-layout wrapper
import '../../styles/CardGeneratorLayout.css';

return (
    <div className="generator-layout">
        <UnifiedHeader app={...} />
        <div className="your-content-area">
            {/* Page content */}
        </div>
    </div>
);
```

**CSS (from CardGeneratorLayout.css):**
```css
.generator-layout {
    position: relative;
    min-height: 100vh;
}
```

**Reference implementations:**
- `StatBlockGenerator/StatBlockGenerator.tsx`
- `PlayerCharacterGenerator/PlayerCharacterGenerator.tsx`
- `RulesLawyer/index.tsx`

---

### 2. Modal Pattern: Responsive with yOffset and fullScreen

For modals that should not overlap the UnifiedHeader, use responsive offset and fullScreen on mobile:

```tsx
import { useMediaQuery } from '@mantine/hooks';

// Inside component:
const isMobile = useMediaQuery('(max-width: 768px)');
const isTablet = useMediaQuery('(max-width: 1024px)');

// Responsive offset: Desktop 90px, Tablet 84px, Mobile uses fullScreen
const modalYOffset = isMobile ? '0px' : isTablet ? '84px' : '90px';

// ✅ CORRECT: Responsive modal
<Modal
    opened={isOpen}
    onClose={handleClose}
    title="Modal Title"
    size="lg"
    centered
    fullScreen={isMobile}
    yOffset={modalYOffset}
>
    {/* Modal content */}
</Modal>
```

**Key props:**
- `centered` - Vertically centers the modal
- `fullScreen={isMobile}` - Full screen on mobile for better UX
- `yOffset` - Responsive offset based on header height
- Do NOT use `withinPortal={false}` - breaks positioning

**Why these offsets?**
- Desktop (88px header) → 90px offset (2px buffer)
- Tablet (82px header) → 84px offset (2px buffer)
- Mobile (60px header) → fullScreen (no offset needed)

---

### 3. Drawer Pattern: Responsive Positioning Below Header

Drawers that slide in from the side should start below the header with responsive heights:

```tsx
import { useMediaQuery } from '@mantine/hooks';

// Inside component:
const isMobile = useMediaQuery('(max-width: 768px)');
const isTablet = useMediaQuery('(max-width: 1024px)');

// Responsive header height: Desktop 88px, Tablet 82px, Mobile 60px
const headerHeight = isMobile ? 60 : isTablet ? 82 : 88;

// ✅ CORRECT: Responsive drawer positioning
<Drawer
    opened={opened}
    onClose={onClose}
    position="right"
    size="md"
    styles={{
        inner: {
            top: `${headerHeight}px`,
            height: `calc(100vh - ${headerHeight}px)`,
        },
        content: {
            height: '100%',
            maxHeight: '100%',
        },
        body: {
            height: `calc(100vh - ${headerHeight}px - 60px)`,  // Account for drawer header
            maxHeight: `calc(100vh - ${headerHeight}px - 60px)`,
            overflow: 'auto',
        },
    }}
>
    {/* Drawer content */}
</Drawer>
```

**Reference implementations:**
- `RulesLawyer/SavedRulesDrawer.tsx`
- `StatBlockGenerator/ProjectsDrawer.tsx`
- `MapGenerator/MapProjectsDrawer.tsx`
- `PlayerCharacterGenerator/PCGBuildDrawer.tsx`

---

### 4. Responsive Header Heights

The UnifiedHeader height varies by breakpoint:

| Breakpoint | Header Height | Usage |
|------------|---------------|-------|
| Desktop (>1024px) | 88px | Default |
| Tablet (768-1024px) | 82px | `isTablet` |
| Mobile (<768px) | 60px | `isMobile` |

**Source:** `UnifiedHeader.tsx` line ~167

For responsive modal/drawer positioning, you may need media queries:

```css
@media (max-width: 768px) {
    .your-drawer-styles {
        top: 60px;
        height: calc(100vh - 60px);
    }
}

@media (max-width: 1024px) {
    .your-drawer-styles {
        top: 82px;
        height: calc(100vh - 82px);
    }
}
```

---

## Anti-Patterns

### ❌ DON'T: Use `withinPortal={false}` for modals

```tsx
// ❌ WRONG: Breaks modal positioning
<Modal
    opened={isOpen}
    withinPortal={false}  // Don't do this!
    styles={{
        overlay: { position: 'absolute', ... },  // Fighting the framework
        inner: { position: 'absolute', ... },
    }}
>
```

**Why it fails:** `withinPortal={false}` renders the modal within the component DOM hierarchy instead of to `document.body`. This causes the modal to be positioned relative to its parent containers, leading to:
- Modal clipping under headers
- Overlay not covering full viewport
- Complex CSS positioning fights

### ❌ DON'T: Use custom shell wrappers for modal scoping

```tsx
// ❌ WRONG: Custom shell trying to scope modals
<div className="custom-shell" style={{ height: '100vh', display: 'flex' }}>
    <UnifiedHeader />
    <div className="content" style={{ position: 'relative', overflow: 'hidden' }}>
        {/* Content + modals */}
    </div>
</div>
```

**Why it fails:** Modals need to break out of the document flow. Trying to contain them within a layout region creates stacking context issues.

---

## Decision Tree

**"How should I handle this overlay?"**

1. **Full-screen modal (confirmation, form, etc.)**
   → Use standard `<Modal centered yOffset="90px" />`

2. **Side panel with content list (projects, saved items)**
   → Use `<Drawer>` with `styles.inner.top: '88px'`

3. **Loading overlay that blocks interaction**
   → Use `<Modal centered withCloseButton={false} closeOnClickOutside={false} />`

4. **Dropdown/popover attached to trigger**
   → Use Mantine `<Menu>`, `<Popover>`, or `<Tooltip>` (portal by default)

---

## Related Files

- `LandingPage/src/styles/CardGeneratorLayout.css` - Shared layout CSS
- `LandingPage/src/components/UnifiedHeader.tsx` - Header component with heights
- `.cursor/rules/PATTERNS-Utilities.mdc` - Drawer state hook, persistence patterns

---

## Changelog

| Date | Change |
|------|--------|
| 2026-01-19 | Initial document from RulesLawyer modal fix |
