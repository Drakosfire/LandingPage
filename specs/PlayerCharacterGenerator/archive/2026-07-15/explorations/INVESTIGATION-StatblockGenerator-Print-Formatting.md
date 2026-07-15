# Deep Investigation: StatblockGenerator Print Formatting

**Date:** 2025-12-14  
**Purpose:** Understand how StatblockGenerator prepares content for print to apply same patterns to PCG

---

## 🎯 Executive Summary

StatblockGenerator uses a **CSS-only print contract** (`canvas-print.css`) that:
1. Hides all UI chrome via visibility tricks
2. Uses precise page break rules to prevent blank pages
3. Removes gaps and pseudo-elements that interfere with print
4. Requires **zero JavaScript preparation** - just calls `window.print()`

**Key Insight:** The canvas system (`dungeonmind-canvas`) provides built-in print support via shared CSS. PCG needs to follow the same pattern but with its own page structure.

---

## 📋 Print Handler Implementation

### JavaScript Handler (Minimal)

```101:120:LandingPage/src/components/StatBlockGenerator/StatBlockGenerator.tsx
    const handleExportPDF = useCallback(() => {
        // Use browser's native print dialog
        // For best results, users should use Firefox and select "Save as PDF"
        const isFirefox = navigator.userAgent.toLowerCase().includes('firefox');

        if (!isFirefox) {
            const proceed = window.confirm(
                'For best PDF results, we recommend using Firefox.\n\n' +
                'Firefox provides the most accurate rendering of the statblock layout.\n\n' +
                'Click OK to continue with browser print, or Cancel to switch browsers.'
            );

            if (!proceed) {
                return;
            }
        }

        console.log('📄 Opening browser print dialog...');
        window.print();
    }, []);
```

**Key Points:**
- ✅ **No font loading wait** - relies on CSS print styles
- ✅ **No DOM manipulation** - pure CSS handles everything
- ✅ **Firefox recommendation** - user-facing guidance only
- ✅ **Simple `window.print()` call** - browser handles the rest

---

## 🎨 Print CSS Contract (`canvas-print.css`)

### 1. Page Setup

```16:19:LandingPage/src/styles/canvas/canvas-print.css
    @page {
        size: letter portrait;
        margin: 0.25in;
    }
```

**Standard US Letter with 0.25in margins.**

### 2. Visibility Contract (Hide Everything Except Canvas)

```21:43:LandingPage/src/styles/canvas/canvas-print.css
    @media print {
        body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
        }

        body,
        body * {
            visibility: hidden !important;
            overflow: visible !important;
        }

        .generator-canvas-container,
        .generator-canvas-container *,
        .statblock-canvas-area,
        .statblock-canvas-area *,
        .mantine-Card-root,
        .mantine-Card-root *,
        .dm-canvas-responsive,
        .dm-canvas-responsive * {
            visibility: visible !important;
        }
```

**Pattern:** Hide everything, then selectively show canvas elements. Uses `visibility` (not `display`) to preserve layout calculations.

### 3. Hide UI Chrome

```45:60:LandingPage/src/styles/canvas/canvas-print.css
        nav,
        header,
        footer,
        button,
        .no-print,
        .mantine-AppShell-root,
        .mantine-AppShell-navbar,
        .mantine-AppShell-main,
        .mantine-Drawer-root,
        .mantine-Modal-root,
        .mantine-Notification-root,
        .mantine-AppShell-navbar,
        .no-print {
            display: none !important;
            visibility: hidden !important;
        }
```

**Explicitly hides:** nav, header, footer, buttons, drawers, modals, notifications.

### 4. Remove Container Styling

```62:86:LandingPage/src/styles/canvas/canvas-print.css
        .mantine-AppShell-main,
        .generator-layout,
        .generator-main-content,
        .generator-canvas-container,
        .statblock-canvas-area {
            display: block !important;
            visibility: visible !important;
            margin: 0 !important;
            padding: 0 !important;
        }

        .mantine-AppShell-main {
            padding-top: 0 !important;
        }

        .mantine-Card-root {
            all: unset !important;
            display: block !important;
            visibility: visible !important;
            box-shadow: none !important;
            border: none !important;
            background: transparent !important;
            padding: 0 !important;
            margin: 0 !important;
        }
```

**Key:** Removes all margins/padding from containers, unstyles Mantine Card components.

### 5. Canvas Positioning for Print

```88:111:LandingPage/src/styles/canvas/canvas-print.css
        .dm-canvas-responsive {
            position: absolute !important;
            top: 0 !important;
            left: 50% !important;
            transform: translateX(-50%) !important;
            width: 8in !important;
            height: auto !important;
            box-sizing: border-box !important;
            margin: 0 !important;
            padding: 0 !important;
        }

        .dm-canvas-wrapper {
            transform: none !important;
            position: static !important;
            width: 100% !important;
            height: auto !important;
        }

        .dm-canvas-renderer {
            box-shadow: none !important;
            border: none !important;
            background: transparent !important;
        }
```

**Key:** Removes transforms, positions canvas at top-center, sets explicit width (8in = US Letter).

### 6. Page Container Setup

```113:131:LandingPage/src/styles/canvas/canvas-print.css
        .dm-canvas-pages,
        .dm-canvas-pages-content {
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
            position: static !important;
        }

        .dm-canvas-pages-content {
            gap: 0 !important;
        }

        .dm-canvas-pages::after,
        .dm-canvas-pages-content::after {
            display: none !important;
            content: none !important;
        }
```

**Critical:** Removes gaps between pages (`gap: 0`) and removes `::after` pseudo-elements that could create blank pages.

### 7. Hide Measurement Layer

```133:142:LandingPage/src/styles/canvas/canvas-print.css
        .dm-canvas-measurement-layer,
        .dm-canvas-measurement-layer * {
            display: none !important;
            visibility: hidden !important;
            position: absolute !important;
            left: -99999px !important;
            width: 0 !important;
            height: 0 !important;
            overflow: hidden !important;
        }
```

**Hides offscreen measurement elements completely.**

### 8. Hide Pagination Markers

```144:146:LandingPage/src/styles/canvas/canvas-print.css
        .dm-pagination-marker {
            display: none !important;
        }
```

**Pagination markers (e.g., "Page 1") are hidden in print.**

### 9. Page Break Rules (Prevents Blank Pages)

```148:194:LandingPage/src/styles/canvas/canvas-print.css
        .dm-canvas-pages .page,
        .dm-canvas-pages .page.phb,
        .dm-canvas-responsive .page,
        .dm-canvas-responsive .page.phb {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
            width: var(--dm-page-width, 8in) !important;
            max-width: var(--dm-page-width, 8in) !important;
            height: var(--dm-page-height) !important;
            margin: 0 !important;
            padding: var(--dm-page-top-margin, 0) var(--dm-page-right-margin, 0) var(--dm-page-bottom-margin, 0) var(--dm-page-left-margin, 0) !important;
            position: relative !important;
            display: block !important;
            box-sizing: border-box !important;
            overflow: hidden !important;
            background-position: top center !important;
            background-size: cover !important;
        }

        .dm-canvas-responsive .page .columnWrapper,
        .dm-canvas-responsive .page .monster.frame.wide {
            height: 900 !important;
            max-height: 900 !important;
        }

        .dm-canvas-pages .page:first-child {
            break-before: avoid !important;
            page-break-before: avoid !important;
        }

        .dm-canvas-pages .page:not(:first-child) {
            break-before: page !important;
            page-break-before: always !important;
        }

        .dm-canvas-pages .page:last-child {
            break-after: avoid !important;
            page-break-after: avoid !important;
            margin-bottom: 0 !important;
        }

        .dm-canvas-pages .page .columnWrapper,
        .dm-canvas-pages .page .monster,
        .dm-canvas-pages .page .canvas-column {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
        }
```

**Critical Page Break Pattern:**
- ✅ **First page:** `break-before: avoid` (no break before)
- ✅ **Non-first pages:** `break-before: always` (force page break)
- ✅ **Last page:** `break-after: avoid` (no break after)
- ✅ **All pages:** `break-inside: avoid` (prevent splitting within page)

**This pattern prevents blank pages by:**
1. Only adding breaks **between** pages (not before first or after last)
2. Removing gaps (`gap: 0`)
3. Removing pseudo-elements (`::after` removed)
4. Using `break-inside: avoid` to keep page content together

---

## 🏗️ Page Structure (DOM Hierarchy)

### StatblockGenerator Structure

```1122:1138:LandingPage/src/components/StatBlockGenerator/StatblockPage.tsx
    return (
        <>
            <div className="dm-canvas-responsive" ref={containerRef} style={containerStyle}>
                <div className="dm-canvas-wrapper" style={transformWrapperStyle}>
                    <div className="dm-canvas-renderer" style={canvasRendererStyle}>
                        <div className="dm-canvas-pages">
                            <div className="dm-canvas-pages-content">
                                <CanvasPage
                                    layoutPlan={layout.plan}
                                    renderEntry={renderWithProps}
                                    columnWidthPx={measurementColumnWidthPx}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
```

**Hierarchy:**
```
.dm-canvas-responsive
  └─ .dm-canvas-wrapper (transform wrapper)
      └─ .dm-canvas-renderer
          └─ .dm-canvas-pages
              └─ .dm-canvas-pages-content
                  └─ CanvasPage (renders .page.phb elements)
```

### CanvasPage Renders Pages

From `Canvas/src/components/CanvasPage.tsx`:
- Maps over `layoutPlan.pages`
- Renders each as `<div className="page phb" data-page-number={page.pageNumber}>`
- Adds pagination markers (hidden in print)
- Wraps content in `.columnWrapper`

**Key:** Pages are direct children of `.dm-canvas-pages-content`, which has `gap: 0` in print.

---

## 🔍 Key Differences: StatblockGenerator vs PCG

| Aspect | StatblockGenerator | PCG (Current) |
|--------|-------------------|---------------|
| **Page Container** | `.dm-canvas-pages-content` | `.character-sheet-container` |
| **Page Class** | `.page.phb` | `.page.phb.character-sheet` |
| **Print CSS** | Shared `canvas-print.css` | Custom `CharacterSheet.css` |
| **Page Break Rules** | `:first-child` / `:not(:first-child)` | Applied to all pages (causes blank pages) |
| **Gap Removal** | `gap: 0` on `.dm-canvas-pages-content` | Not applied |
| **Pseudo-elements** | `::after` removed on containers | Not removed |

---

## ✅ Recommended Fixes for PCG

### 1. Update Print CSS to Match Canvas Pattern

**Current PCG print CSS:**
```css
.character-sheet {
    page-break-before: always;
    page-break-after: always;  /* ❌ Causes blank pages */
}
```

**Should be:**
```css
.character-sheet-container > .character-sheet:not(:first-child) {
    page-break-before: always;  /* ✅ Only between pages */
}

.character-sheet-container > .character-sheet:not(:last-child) {
    page-break-after: always;  /* ✅ Only between pages */
}
```

### 2. Remove Gaps

```css
.character-sheet-container {
    gap: 0 !important;  /* ✅ Remove gaps between pages */
}
```

### 3. Remove Pseudo-elements

```css
.character-sheet-container::after {
    display: none !important;
    content: none !important;
}
```

### 4. Add Page Boundary Markers (Optional)

```css
.character-sheet::before,
.character-sheet::after {
    content: '';
    display: block;
    height: 0;
    width: 0;
    overflow: hidden;
}
```

**Note:** These markers help browsers recognize page boundaries without creating blank pages.

---

## 📊 Print Preparation Checklist

### ✅ StatblockGenerator Approach (CSS-Only)

- [x] **No JavaScript font loading** - relies on CSS
- [x] **No DOM manipulation** - pure CSS handles everything
- [x] **Visibility contract** - hide all, show canvas
- [x] **Page break rules** - first/last child exceptions
- [x] **Gap removal** - `gap: 0` on container
- [x] **Pseudo-element removal** - `::after` removed
- [x] **Measurement layer hidden** - offscreen elements hidden
- [x] **Pagination markers hidden** - UI elements hidden

### ❌ PCG Current Approach (Needs Fixes)

- [x] JavaScript font loading (optional improvement)
- [ ] Page break rules (currently causes blank pages)
- [ ] Gap removal (not applied)
- [ ] Pseudo-element removal (not applied)
- [x] Print CSS exists (but needs refinement)

---

## 🎯 Key Takeaways

1. **CSS-Only Solution:** StatblockGenerator uses zero JavaScript for print preparation. All formatting is handled by CSS.

2. **Page Break Pattern:** The critical pattern is:
   - First page: no break before
   - Middle pages: break before always
   - Last page: no break after
   - This prevents blank pages

3. **Gap Removal:** Removing gaps (`gap: 0`) and pseudo-elements (`::after`) is essential to prevent blank pages.

4. **Visibility Contract:** Hide everything, then selectively show canvas elements. Uses `visibility` (not `display`) to preserve layout.

5. **Shared CSS:** The canvas system provides `canvas-print.css` as a shared contract. PCG should follow the same patterns but with its own selectors.

---

## 🔗 Related Files

- **Print CSS:** `LandingPage/src/styles/canvas/canvas-print.css`
- **StatblockGenerator Handler:** `LandingPage/src/components/StatBlockGenerator/StatBlockGenerator.tsx` (L101-120)
- **CanvasPage Component:** `Canvas/src/components/CanvasPage.tsx`
- **PCG Print CSS:** `LandingPage/src/components/PlayerCharacterGenerator/sheetComponents/CharacterSheet.css` (L2969-3000)

---

**Last Updated:** 2025-12-14  
**Status:** Complete investigation - ready for PCG implementation

