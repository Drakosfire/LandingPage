# Pagination Logging Reference Card

Quick guide to interpreting pagination debug output in browser console.

---

## 📊 Main Statistics Summary

Appears at end of each pagination run:

```javascript
📊 PAGINATION STATISTICS: {
    runId: 123,                    // Unique ID for this pagination run
    componentsPlaced: 15,          // Total components successfully placed
    splitDecisions: 8,             // Number of list components that were split
    bottomZoneRejections: 2,       // Times bottom 20% threshold rejected placement
    heightCalculations: {
        total: 24,                 // Total height calculations performed
        measured: "12 (50.0%)",    // Used exact DOM measurement
        proportional: "10 (41.7%)", // Calculated from full measurement
        estimate: "2 (8.3%)"       // Fell back to constant estimates
    },
    insights: {
        mostCommonHeightSource: "measured",
        bottomZoneImpact: "2 rejections - threshold is active",
        estimateUsage: "⚠️ 2 estimates used - measurements incomplete"
    }
}
```

### Key Metrics to Watch

| Metric | Good Value | Bad Value | Meaning |
|--------|------------|-----------|---------|
| `estimate` % | 0-10% | >20% | Higher % means measurements are incomplete |
| `bottomZoneRejections` | 0 | >5 | Higher number means threshold is actively preventing placements |
| `splitDecisions` | Low | High | More splits = more complexity, consider simplification |
| `componentsPlaced` | Matches total | Fewer | Missing components indicate pagination issues |

---

## 🎨 Console Log Emoji Guide

### Height Calculation Logs

**📐 Height calculation:**
```javascript
{
    component: 'component-8',
    splitAt: 3,              // Trying to place 3 items from list
    heightSource: 'proportional', // Which calculation path was used
    proportional: 245.8,     // Proportional calculation result
    estimated: 280,          // What estimate would have been
    finalHeight: 245.8,      // Actual height used
}
```
- **heightSource values:**
  - `'measured'` = Exact measurement exists for this split ✅ Best
  - `'proportional'` = Calculated from full component ⚡ Good
  - `'estimate'` = Using constants ⚠️ Fallback

**📏 Height discrepancy:**
```javascript
{
    measured: 245.8,
    estimated: 280,
    error: -34.2,            // Negative = estimate was too large
    errorPercent: '-13.9%',
    heightSource: 'measured'
}
```
- Shows when measurements differ significantly from estimates
- Large errors indicate estimates need adjustment
- Only logged when error > 10px

### Split Decision Logs

**✅ Successful split:**
```javascript
{
    component: 'component-8',
    splitAt: 3,              // Placing 3 items in this region
    totalItems: 5,           // Total items in component
    heightSource: 'proportional',
    height: 245.8,
    topPercent: '45.2%',     // Starts at 45% down the column
    bottomPercent: '78.5%',  // Ends at 78% (fits with margin)
    remainingItems: 2        // 2 items move to next region
}
```
- Normal case: component split successfully
- Check `topPercent` and `bottomPercent` to understand placement
- `remainingItems` shows continuation is created

**🔄 Overflow, trying fewer items:**
```javascript
{
    component: 'component-8',
    splitAt: 4,              // Tried 4 items
    bottom: 812,             // Would end at 812px
    regionHeight: 785,       // Region only 785px tall
    excess: 27               // 27px too large, try fewer items
}
```
- Algorithm is iterating to find best fit
- Multiple of these in a row is normal for lists
- Eventually finds optimal split or minimum-1-item

**🎯 Bottom zone minimum rule triggered:**
```javascript
{
    component: 'component-8',
    splitAt: 1,              // Only 1 item left to try
    top: 750,                // Would start at 750px
    topPercent: '95.5%',     // In bottom 5% of region
    threshold: '80%',        // Normally can't start below 80%
    willOverflow: true       // May exceed boundary but placed anyway
}
```
- Edge case: Component starts too low but placed anyway (minimum rule)
- Prevents components from never being placed
- If you see this often, threshold may be too strict

**⚠️ Bottom zone rejection:**
```javascript
{
    component: 'component-8',
    splitAt: 2,              // Tried 2 items
    top: 680,                // Would start at 680px
    topPercent: '86.6%',     // Below 80% threshold
    threshold: '80%',
    action: 'trying fewer items'
}
```
- Threshold preventing placement
- Algorithm will try fewer items (or move to next region)
- **If you never see this across tests, threshold is unnecessary**

### Other Logs

**❌ No valid split found:**
```javascript
{
    component: 'component-8',
    itemCount: 5,
    currentOffset: 720,
    regionHeight: 785
}
```
- **This should never happen** due to minimum-1-item rule
- If you see this, algorithm has a bug
- Report immediately with reproduction steps

---

## 🔍 Spacing Measurement Script Output

After running `measureSpacing.js`:

```javascript
📊 SPACING STATISTICS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Min gap:     10.50px       // Smallest gap found
  Max gap:     13.25px       // Largest gap found
  Average:     11.87px       // Mean of all gaps
  Median:      12.00px       // Middle value (50th percentile)
  Total gaps:  14            // Number of gaps measured
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔧 CURRENT CONSTANT:
  COMPONENT_VERTICAL_SPACING_PX = 12

💡 RECOMMENDATION:
  ✅ Current constant (12px) is accurate
```

### Interpreting Results

| Average Gap | Recommendation | Action |
|-------------|----------------|--------|
| 11-13px | ✅ Accurate | No change needed |
| 8-10px | Consider reducing | Test with `COMPONENT_VERTICAL_SPACING_PX = 10` |
| 14-16px | Consider increasing | Test with `COMPONENT_VERTICAL_SPACING_PX = 14` |
| <8px or >16px | Investigate | May indicate measurement error or visual issue |

---

## 🎯 What to Look For

### Optimization Opportunities

**1. High Estimate Usage (>10%)**
```
estimateUsage: "⚠️ 15 estimates used - measurements incomplete"
```
**→ Action:** Investigate why measurements are missing. Consider pre-measuring common splits.

**2. Zero Bottom Zone Rejections**
```
bottomZoneImpact: "No rejections - threshold may be unnecessary"
```
**→ Action:** Test removing `BOTTOM_THRESHOLD` check entirely (lines 330-372 in paginate.ts)

**3. High Proportional Usage (>60%)**
```
proportional: "18 (75.0%)"
```
**→ Action:** Proportional calculation is working well. Consider removing estimate fallback if estimate % is also low.

**4. Spacing Mismatch**
```
Average:     10.25px  (vs constant: 12px)
```
**→ Action:** Reduce `COMPONENT_VERTICAL_SPACING_PX` to match actual rendering.

### Red Flags

**1. High Estimate Usage + Height Discrepancies**
```
estimate: "8 (33.3%)"
📏 Height discrepancy: { error: -45, errorPercent: '-18.2%' }
```
**→ Problem:** Measurements missing AND estimates inaccurate
**→ Solution:** Fix measurement layer first before optimizing pagination

**2. Frequent Minimum Rule Triggers**
```
🎯 Bottom zone minimum rule triggered: (appears 5+ times)
```
**→ Problem:** Threshold too strict, forcing edge case often
**→ Solution:** Reduce threshold from 80% to 85-90%

**3. Components Never Placed**
```
componentsPlaced: 12  (but expected 15)
```
**→ Problem:** Pagination algorithm dropping components
**→ Solution:** Check overflow warnings, review routing logic

---

## 📋 Data Collection Template

Copy this template to track statistics across multiple statblocks:

```markdown
| Statblock | Components | Measured % | Proportional % | Estimate % | Bottom Rejections | Avg Spacing |
|-----------|------------|------------|----------------|------------|-------------------|-------------|
| Goblin    | 12         | 45%        | 50%            | 5%         | 0                 | 11.8px      |
| Dragon    | 18         | 60%        | 35%            | 5%         | 2                 | 12.1px      |
| Wizard    | 15         | 50%        | 45%            | 5%         | 1                 | 11.9px      |
| ...       | ...        | ...        | ...            | ...        | ...               | ...         |
```

### Analysis Questions

After collecting 5-10 samples:

1. **Is measured + proportional consistently >90%?**
   - ✅ Yes → Can likely remove estimate fallback
   - ❌ No → Keep estimate as safety net

2. **Are bottom zone rejections consistently 0-1?**
   - ✅ Yes → Threshold may be unnecessary, test removal
   - ❌ No (5+) → Threshold is actively useful, keep it

3. **Is average spacing consistently 11-13px?**
   - ✅ Yes → Current constant is accurate
   - ❌ No → Adjust constant to match measurements

4. **Do complex statblocks (15+ components) behave differently?**
   - Look for patterns in statistics based on complexity
   - May need different strategies for simple vs complex layouts

---

## 🚀 Quick Start

**Step 1:** Load StatBlock Generator with a test statblock

**Step 2:** Open DevTools Console (F12)

**Step 3:** Look for the summary at bottom of console:
```javascript
📊 PAGINATION STATISTICS: { ... }
```

**Step 4:** Copy/paste `measureSpacing.js` script, press Enter

**Step 5:** Record both outputs in data collection template

**Step 6:** Repeat for 5-10 different statblocks

**Step 7:** Analyze patterns and answer questions above

**Step 8:** Make data-driven decisions about simplification

---

## 📞 Need Help?

**Console too noisy?**
- Filter by `[paginate]` prefix
- Or filter by emoji (e.g., search for "📊")
- Can comment out specific log lines in `paginate.ts`

**Numbers don't make sense?**
- Verify measurement layer width is correct (234.6px)
- Run `layoutDiagnostic.js` to check for issues
- Review previous session notes in ProjectDiary

**Ready to optimize?**
- See `2025-10-03-next-session-handoff.md` for investigation plan
- See `2025-10-03-pagination-optimization-start.md` for Phase 2 instructions

---

**Last Updated:** October 3, 2025  
**Related Files:**
- `paginate.ts` - Pagination algorithm with logging
- `measureSpacing.js` - Spacing measurement script
- `layoutDiagnostic.js` - General layout diagnostic
- `README.md` - Debug tools overview

