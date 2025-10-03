# Canvas Layout Debugging Tools

## Overview

This directory contains diagnostic tools for debugging canvas layout and pagination issues in the DungeonMind statblock system.

## Files

### `layoutDiagnostic.js`

**Purpose:** Comprehensive diagnostic script that compares measurement layer vs visible layer to identify layout discrepancies.

**Usage:**
1. Open browser DevTools (F12)
2. Go to Sources → Snippets
3. Create a new snippet with the contents of `layoutDiagnostic.js`
4. Run the snippet whenever layout issues occur

**What it checks:**
- Measurement layer width matches visible layer
- Component height measurements vs actual rendering
- Overflow detection across all columns
- Cursor position accuracy
- Column width analysis

**Output:** Detailed console report with tables, warnings, and recommendations.

### `compareLayerStyles.ts`

**Purpose:** Compare computed styles between measurement and visible layers for a specific component.

**Usage:** Import and call `compareComponentStyles(componentId)` in your code.

---

## Common Issues & Solutions

### Issue 1: Measurement Layer Width Mismatch

**Symptom:**
- Components overflow columns
- Pagination places items incorrectly
- Cumulative cursor position error grows

**Root Cause:**
The measurement layer's `.canvas-column` width doesn't match the visible layer's column width, causing incorrect text wrapping and height calculations.

**Diagnosis:**
Run `layoutDiagnostic.js` and check SECTION 1 for width mismatch warnings.

**Solution:**
Ensure measurement layer column width is set to match visible layer:

```typescript
// In StatblockPage.tsx
const [measuredColumnWidth, setMeasuredColumnWidth] = useState<number | null>(null);

// Measure visible column width
const visibleColumn = visibleFrame.querySelector('.canvas-column');
if (visibleColumn) {
    setMeasuredColumnWidth(visibleColumn.getBoundingClientRect().width);
}

// Apply to measurement layer
<div className="canvas-column" style={{
    width: measuredColumnWidth ? `${measuredColumnWidth}px` : 'auto',
    flex: 'none',
}}>
```

**Fixed in:** Commit 2025-10-03 (StatblockPage.tsx lines 74, 259-268, 506-508)

---

### Issue 2: Measurement Layer Collapsed (width: 0)

**Symptom:**
- All measurements 20-30% too small
- Severe cumulative error

**Root Cause:**
Measurement layer container had `width: 0, height: 0, overflow: hidden` which collapsed the entire layer.

**Solution:**
```typescript
// WRONG:
style={{
    width: 0,
    height: 0,
    overflow: 'hidden',
}}

// CORRECT:
style={{
    top: '-9999px',
    left: '-9999px',
    width: `${baseWidthPx}px`,
    height: `${baseHeightPx}px`,
    overflow: 'visible',
    visibility: 'hidden',
}}
```

**Fixed in:** Commit 2025-10-03 (StatblockPage.tsx lines 468-475)

---

### Issue 3: Split Logic Using Estimates Instead of Measurements

**Symptom:**
- Components with measurements still show incorrect heights
- Split decisions use estimates even when measurements exist

**Root Cause:**
When splitting a list component (e.g., 3 items → 2 items + 1 item), the split variant measurement key doesn't exist, so the code falls back to estimates.

**Solution:**
Calculate proportionally from full measurement before falling back to estimates:

```typescript
// In paginate.ts, findBestListSplit()
if (!measured && splitAt < items.length) {
    // Look up full component measurement
    const fullMeasured = measurements.get(fullMeasurementKey);
    if (fullMeasured) {
        proportionalHeight = (fullMeasured.height / items.length) * splitAt;
    }
}

const firstSegmentHeight = measured?.height ?? proportionalHeight ?? estimated;
```

**Fixed in:** Commit 2025-10-03 (paginate.ts lines 243-274)

---

## Debugging Workflow

When layout issues occur:

1. **Run diagnostic script**
   ```javascript
   // In browser console
   // Paste contents of layoutDiagnostic.js and press Enter
   ```

2. **Check SECTION 1: Width Configuration**
   - Is measurement layer width matching visible layer?
   - If NO → Check StatblockPage.tsx measurement layer setup

3. **Check SECTION 2: Measurement Accuracy**
   - Is cumulative error < 10px?
   - If NO → Investigate width mismatch or CSS differences

4. **Check SECTION 3: Overflows**
   - Are any components overflowing?
   - If YES → Check pagination logs for split decisions

5. **Check Console Logs**
   - Look for `[paginate]` logs
   - Compare `cursorAfter` with actual component positions
   - Look for `📐 Proportional calculation` logs

6. **Compare with Expected Behavior**
   - Should measurements match visible heights ± 1px
   - Cursor position error should be < 10px cumulative
   - No components should overflow columns

---

## History

### 2025-10-03: Major Layout System Fix

**Problem:** Component-10 (legendary actions) was overflowing column boundary by ~25px despite split logic claiming it would fit at 94.2% of column height.

**Root Causes Identified:**

1. **Measurement layer width mismatch** (PRIMARY)
   - Measurement layer: 390.85px (calculated from page width)
   - Visible layer: 234.60px (actual flex column width)
   - Result: Text wrapped differently → wrong heights → 20-30% underestimation

2. **Measurement layer container collapsed**
   - Container had `width: 0, height: 0`
   - Children couldn't render properly

3. **Split logic using estimates**
   - No measurements for split variants (e.g., 2 items of 3)
   - Fell back to unreliable estimates instead of proportional calculation

**Fixes Applied:**

1. Fixed measurement layer container positioning and sizing
2. Added dynamic column width measurement from visible layer
3. Applied measured width to measurement layer column
4. Added proportional calculation for split variants

**Result:** All components now render within column boundaries. Measurement accuracy improved to < 1px error.

**Evidence:**
- Before: Cumulative error ~97px, component-10 overflowed 25px
- After: Cumulative error < 5px, no overflows detected

---

## Future Enhancements

- [ ] Add visual overlay showing column boundaries in development mode
- [ ] Add real-time measurement validation in CI/CD
- [ ] Create automated tests that run diagnostic checks
- [ ] Add performance metrics (measurement time, render time)
- [ ] Create visual diff tool for comparing layers

---

## Resources

- **Root Debugging Rules:** `/Docs/ROOT_DEBUGGING_RULES.md`
- **Canvas Architecture:** `/Docs/architecture/StatblockCanvas_Architecture.md`
- **Pagination Logic:** `/LandingPage/src/canvas/layout/paginate.ts`
- **Measurement System:** `/LandingPage/src/canvas/layout/measurement.tsx`

---

## Contact

For questions or issues with these debugging tools, refer to the DungeonMind development documentation or check the project diary entries dated 2025-10-03.

