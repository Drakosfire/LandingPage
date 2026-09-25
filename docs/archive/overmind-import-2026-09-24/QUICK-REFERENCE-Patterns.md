> **Historical import from DungeonOverMind — 2026-09-24.** This document records an older DungeonMind Web/product implementation state. It is not current LandingPage architecture or sequencing authority. Re-anchor against current code before applying it.

# StatblockGenerator: Quick Reference - Patterns & Workflows

**Last Updated:** December 10, 2025  
**For detailed explanations:** See `LEARNINGS-StatblockGenerator-Rebuild-2025.md`, `LEARNINGS-PlayerCharacterGenerator-2025.md`

---

## 🎯 When to Use What

| Situation | Pattern to Use | Reference |
|-----------|---------------|-----------|
| Starting new feature | Spec-Driven Development | Section: Spec-Driven Development |
| Breaking up large task | Phased Implementation | Section: Phased Implementation Strategy |
| Bug that's hard to reproduce | Empirical Debugging | Section: Empirical Debugging Methodology |
| Need responsive layout | Two-Layer Rendering | Section: Canvas Architecture - Two-Layer Rendering |
| Content changes during edit | Dynamic Component Locking | Section: Canvas Architecture - Dynamic Locking |
| Pagination runs twice | Measure-First Flow | Section: Canvas Architecture - Measure-First |
| State oscillates/loops | Stable Home Regions | Section: Canvas Architecture - Stable Home Regions |
| Tutorial costs money | Tutorial Guards | Section: Tutorial System - Tutorial Mode Flag |
| Race condition with state | useRef Instead of useState | Section: Tutorial System - State Timing Issues |
| Need to persist data | Dual-Layer Persistence | Section: Save System Architecture |
| Ending work session | Handoff Document | Section: Phased Implementation - Handoff Documents |
| Building new visual layout | HTML-First Development | Section: HTML-First Workflow |
| Multi-column pagination wrong | Track Per-Column Heights | Section: Multi-Column Pagination |
| Hook + component double-format | Display Flag Single-Responsibility | Section: Display Flag Separation |
| Portal causes infinite loop | Return Elements, Not Components | Section: Measurement Portal Pattern |

---

## 📝 Document Templates

### Design Document (Start of Feature)

```markdown
# [Feature Name] - Implementation Plan
**Date:** YYYY-MM-DD
**Status:** Draft / Locked / In Progress
**Estimated:** X-Y hours

## Executive Summary
- Current: [What exists now]
- Target: [What we want]
- Why: [Business value]

## Architecture
[Diagrams, data flow, component relationships]

## Files to Create
- `path/to/new/file.tsx` - Purpose

## Files to Modify
- `path/to/existing.tsx` (lines 100-150) - Changes summary

## Implementation Phases
### Phase 1: [Name] (2-3 hours)
- [ ] Task 1
- [ ] Task 2

## Testing Checklist
- [ ] Unit: Function X works
- [ ] Integration: Feature Y works end-to-end
- [ ] UX: User can do Z

## Success Criteria
- [ ] Observable outcome 1
- [ ] Measurable outcome 2

## Risks
- Risk A → Mitigation strategy
```

### Handoff Document (End of Session)

```markdown
# [Feature] - Phase N Complete Handoff
**Date:** YYYY-MM-DD
**Status:** Ready for Next Phase / Blocked
**Time Spent:** X hours

## Completed This Session
- [x] Task 1 - Evidence: [log output / screenshot]
- [x] Task 2 - Evidence: [verification steps]

## Current State
**What Works:**
- Feature A (verified with test X)
- Feature B (console shows Y)

**Known Issues:**
- Bug 1 (see investigation doc)
- Incomplete: Feature C

## Files Changed
- `path/to/file1.tsx` (+50 lines)
- `path/to/file2.py` (-10, +30 lines)

## Next Steps
**Immediate:**
1. Fix bug 1 (see line 250 of file.tsx)
2. Complete feature C (waiting on decision about X)

**Next Phase:**
- Implement Phase N+1 (see design doc section Y)

## How to Continue
1. Read this handoff
2. Load files: [list]
3. Run: `npm start` and verify state
4. Proceed with Phase N+1
```

### Bug Investigation Document

```markdown
# [Bug Name] Investigation
**Date:** YYYY-MM-DD
**Priority:** P0 / P1 / P2
**Status:** Investigating / Fixed / Verified

## Reproduction
**Expected:** [What should happen]
**Actual:** [What actually happens]
**Steps:**
1. Action 1
2. Action 2
3. Observe X

## Evidence
- Screenshot: [attach]
- Console logs: [paste]
- Network: [relevant requests]

## Hypotheses
1. **Root cause theory 1**
   - Evidence supporting: [observations]
   - Evidence against: [observations]
   - Test: [how to verify]

2. **Root cause theory 2**
   - ...

## Root Cause (After Investigation)
**File:** `path/to/file.tsx`
**Line:** 267
**Issue:** [One sentence summary]
**Why:** [Explanation with context]

## Fix Applied
```typescript
// BEFORE (line 267)
const broken = oldWay();

// AFTER (line 267)
const fixed = newWay();

// REASONING: [Why this fixes it]
```

## Verification
- [ ] Linter passes
- [ ] Bug no longer reproduces
- [ ] No regressions in X
- [ ] Console logs show Y
```

---

## 🔧 Code Patterns

### Dynamic Component Locking (Edit Mode)

```typescript
// Component with 2-second idle timer
const EditableComponent = ({ id, isEditMode, onUpdate }) => {
    const { requestComponentLock, releaseComponentLock } = useProvider();
    const [isEditing, setIsEditing] = useState(false);
    const editTimerRef = useRef<NodeJS.Timeout | null>(null);

    const handleEditStart = useCallback(() => {
        if (!isEditing && isEditMode) {
            setIsEditing(true);
            requestComponentLock(id); // Lock measurements
        }
    }, [isEditing, isEditMode, id]);

    const handleEditChange = useCallback(() => {
        // Reset timer on each keystroke
        if (editTimerRef.current) clearTimeout(editTimerRef.current);
        editTimerRef.current = setTimeout(() => {
            releaseComponentLock(id); // Unlock after 2s idle
            setIsEditing(false);
        }, 2000);
    }, [id]);

    // Cleanup
    useEffect(() => {
        return () => {
            if (editTimerRef.current) clearTimeout(editTimerRef.current);
            if (isEditing) releaseComponentLock(id);
        };
    }, [isEditing, id]);

    return (
        <EditableText
            value={data}
            onChange={onUpdate}
            onFocus={handleEditStart}
            onInput={handleEditChange}
            isEditMode={isEditMode}
        />
    );
};
```

### Measure-First Flow (Pagination)

```typescript
// State: Gate pagination until measurements arrive
const recomputeEntries = (state: CanvasLayoutState) => {
    // Detect: no measurements yet + have components
    if (state.measurements.size === 0 && state.components.length > 0) {
        const measurementEntries = createInitialMeasurementEntries({
            instances: state.components,
            // ... other params
        });

        return {
            ...state,
            buckets: new Map(), // Empty - don't build yet
            measurementEntries,
            waitingForInitialMeasurements: true,
            isLayoutDirty: false, // Don't trigger pagination
        };
    }

    // Have measurements - build buckets normally
    const { buckets, measurementEntries } = buildCanvasEntries({...});
    return { ...state, buckets, measurementEntries };
};

// Reducer: Check completeness and trigger rebuild
case 'MEASUREMENTS_UPDATED': {
    // ... update measurements map

    const allMeasured = checkAllComponentsMeasured(components, measurements);
    const wasWaiting = state.waitingForInitialMeasurements;
    const nowComplete = wasWaiting && allMeasured;

    if (nowComplete) {
        const recomputed = recomputeEntries(state);
        return { ...recomputed, isLayoutDirty: true }; // Now paginate
    }

    return { ...state, measurements, measurementVersion: v + 1 };
}

// Pagination: Skip if waiting
case 'RECALCULATE_LAYOUT': {
    if (state.waitingForInitialMeasurements) {
        console.debug('Skipping pagination - waiting for measurements');
        return state;
    }
    // ... run pagination
}
```

### Tutorial Guards (Prevent Real API Calls)

```typescript
// 1. Flow flag through stack
interface DrawerState {
    opened: boolean;
    isTutorialMode?: boolean;
}

const openDrawer = (options: { isTutorialMode?: boolean }) => {
    setDrawerState({ opened: true, isTutorialMode: options.isTutorialMode });
};

// 2. Guard at API boundary
const handleGenerateCreature = async () => {
    if (isTutorialMode) {
        console.log('🎓 Tutorial mode - skipping real API call');
        onGenerationComplete?.(); // Notify without calling API
        return;
    }
    
    // Real generation...
    const result = await fetch('/api/generate', {...});
};

// 3. Check tutorial cookie in THREE places
const getInitialState = () => {
    if (!tutorialCookies.hasCompletedTutorial()) {
        return EMPTY_STATE; // Blank canvas for first-time users
    }
    return restoreFromLocalStorage();
};
```

### useRef for Synchronous Guards

```typescript
// Problem: useState is async, callback fires before flag is set
const [guardFlag, setGuardFlag] = useState(false); // ❌

const triggerAction = () => {
    setGuardFlag(true);  // Schedules update (async)
    doAction();          // Callback sees flag = false
};

// Solution: useRef updates immediately
const guardFlagRef = useRef(false); // ✅

const triggerAction = () => {
    guardFlagRef.current = true;  // Updates immediately (sync)
    doAction();                   // Callback sees flag = true
};
```

### Dual-Layer Persistence (Save System)

```typescript
// 1. Immediate localStorage
useEffect(() => {
    localStorage.setItem('app_state', JSON.stringify({
        data: currentData,
        timestamp: Date.now()
    }));
}, [currentData]);

// 2. Debounced Firestore (2s)
useEffect(() => {
    if (!isLoggedIn) return;
    
    if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = setTimeout(async () => {
        setSaveStatus('saving');
        await saveToFirestore(currentData);
        setSaveStatus('saved');
    }, 2000);
    
    return () => clearTimeout(debounceTimerRef.current);
}, [currentData, isLoggedIn]);

// 3. Manual save (bypass debounce)
const saveNow = () => {
    if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
    }
    await saveToFirestore(currentData);
};
```

### Stable Home Regions (Prevent Oscillation)

```typescript
interface CanvasLayoutState {
    // Immutable: Where components START (canonical)
    homeRegions: Map<string, HomeRegionAssignment>;
    
    // Volatile: Where components END UP (pagination result)
    assignedRegions: Map<string, SlotAssignment>;
}

// Bucket building: ALWAYS use homeRegion (stable)
const buildBuckets = (state: CanvasLayoutState) => {
    instances.forEach(instance => {
        const persisted = state.assignedRegions.get(instance.id);
        
        // ✅ Use stable home region
        const baseLocation = persisted 
            ? persisted.homeRegion  // Canonical starting position
            : resolvedHome;
        
        // ❌ DON'T use volatile region (causes loops)
        // const baseLocation = persisted.region;
        
        // ... place in bucket based on baseLocation
    });
};
```

### HTML-First Workflow (Rapid UI Development)

**Prototype in static HTML before building React components.**

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

**When to use:**
- ✅ Building new visual layouts
- ✅ Complex CSS with many interacting elements
- ✅ Themed styling (borders, backgrounds)
- ❌ Skip for: Reusing existing components, simple data display, logic-heavy forms

**Evidence:** All PCG sheets completed in ~2 days vs estimated 1-2 weeks (50% faster).

### Measurement Portal Pattern (Prevent Infinite Loops)

**Return portal as `React.ReactNode` from `useMemo`, NOT as component function from `useCallback`.**

```typescript
// ❌ WRONG: useCallback returns a function → infinite loop
const MeasurementPortal: React.FC = useCallback(() => {
    return createPortal(<div>...</div>, node);
}, [items]); // Dependencies cause function recreation

return <MeasurementPortal />; // New type each render → unmount → remeasure → loop

// ✅ CORRECT: useMemo returns an element (stable)
const measurementPortal = useMemo<React.ReactNode>(() => {
    if (!portalNode) return null;
    return <PortalContent items={items} />;
}, [items, portalNode]);

return <>{measurementPortal}</>; // Same element reference
```

**Why:** `useCallback` returns a new function on dependency change, creating a new component type. React unmounts the old portal, measurements reset, state changes, re-render → infinite loop.

### Multi-Column Pagination (Track Per-Column Heights)

**Pagination logic must mirror the actual CSS layout.**

```typescript
// ❌ WRONG: Single height for 3-column layout → premature breaks
let currentPageHeight = 0;
for (const item of items) {
    if (currentPageHeight + itemHeight > MAX_HEIGHT) {
        startNewPage(); // Columns 2 & 3 are empty!
    }
    currentPageHeight += itemHeight;
}

// ✅ CORRECT: Track each column separately
const columnHeights = [0, 0, 0];
for (const item of items) {
    const shortestIdx = columnHeights.indexOf(Math.min(...columnHeights));
    
    if (columnHeights[shortestIdx] + itemHeight > MAX_HEIGHT) {
        // ALL columns are full - now start new page
        startNewPage();
        columnHeights.fill(0);
    }
    columnHeights[shortestIdx] += itemHeight;
}
```

### Display Flag Single-Responsibility

**Hook sets flags, component formats display. Never both.**

```typescript
// ❌ WRONG: Both hook AND component add suffix
// Hook:
const data = { title: isContinued ? `${title} (Continued)` : title };
// Component:
<h3>{data.isContinued ? `${data.title} (Continued)` : data.title}</h3>
// Result: "Consumables (Continued) (Continued)"

// ✅ CORRECT: Hook sets flag, component formats
// Hook:
const data = { title, isContinued: true };
// Component:
<h3>{data.title}{data.isContinued && ' (Continued)'}</h3>
```

| Layer | Responsibility |
|-------|---------------|
| Hook/Logic | Determine state (set flags, compute values) |
| Component | Format display (add suffixes, apply styles) |

---

## 🐛 Debugging Workflows

### Quick Diagnostic Script

```javascript
// Paste in browser console
{
    const meas = document.querySelector('.measurement-layer .component');
    const vis = document.querySelector('.visible-layer .component');
    
    console.table({
        'Measurement': { height: meas?.offsetHeight || 0 },
        'Visible': { height: vis?.offsetHeight || 0 },
        'Difference': { height: Math.abs((meas?.offsetHeight || 0) - (vis?.offsetHeight || 0)) }
    });
    
    // CSS comparison
    const measStyle = window.getComputedStyle(meas);
    const visStyle = window.getComputedStyle(vis);
    
    console.table({
        'Measurement': {
            padding: measStyle.padding,
            margin: measStyle.margin,
            fontSize: measStyle.fontSize,
            lineHeight: measStyle.lineHeight,
        },
        'Visible': {
            padding: visStyle.padding,
            margin: visStyle.margin,
            fontSize: visStyle.fontSize,
            lineHeight: visStyle.lineHeight,
        }
    });
}
```

### Systematic Debugging Steps

```markdown
1. **Reproduce (5-10 min)**
   - Capture: Expected vs Actual
   - Evidence: Screenshot + console logs

2. **Form Hypotheses (10-15 min)**
   - List 2-3 possible root causes
   - Identify tests to validate each

3. **Test Systematically (varies)**
   - Write diagnostic script
   - Capture actual values
   - Compare to expected
   - Rule in/out hypothesis

4. **Identify Root Cause (varies)**
   - File + Line number
   - One sentence summary
   - Why it matters
   - Evidence

5. **Implement Fix (varies)**
   - BEFORE/AFTER code
   - Reasoning

6. **Verify (10-15 min)**
   - Linter passes
   - Bug doesn't reproduce
   - No regressions
   - Console logs correct
```

### Common Logging Patterns

```typescript
// Namespaced logging for grep-ability
console.log('[paginate]', 'run-start', { data });
console.log('[measurement-flush]', { count: 13 });
console.log('[layout-dirty]', 'MEASUREMENTS_UPDATED', { trigger });
console.log('[measure-first]', 'All measurements complete');

// State transitions with context
console.log('[ComponentName] State:', {
    prop1,
    prop2,
    timestamp: Date.now()
});

// Conditional debug logging
if (process.env.NODE_ENV !== 'production') {
    console.debug('[system]', 'Debug info', data);
}
```

---

## ✅ Verification Checklists

### Before Claiming Success

- [ ] Run `npm run lint` - zero errors
- [ ] Check TypeScript - zero errors
- [ ] Test in browser - works as expected
- [ ] Check console - no errors/warnings
- [ ] Check network tab - API calls correct
- [ ] Test edge cases - handles gracefully
- [ ] Screenshot/record evidence
- [ ] Document what changed

### Before Ending Session

- [ ] Write handoff document
- [ ] List files changed with line counts
- [ ] Document current state (works/broken)
- [ ] List next steps clearly
- [ ] Commit code with descriptive message
- [ ] Tag phase completion

### Before Starting Next Phase

- [ ] Read previous handoff
- [ ] Verify current state
- [ ] Run app to confirm baseline
- [ ] Check linter passes
- [ ] Review phase goals
- [ ] Estimate time needed

---

## 🎯 Decision Trees

### Should I write a design doc?

```
Is this a new feature? → YES → Write design doc
    ↓ NO
Is this >2 hours work? → YES → Write design doc
    ↓ NO
Is this architecturally complex? → YES → Write design doc
    ↓ NO
Is this debugging? → YES → Write investigation doc
    ↓ NO
Just do it (but document after)
```

### Should I start a new session?

```
Is context >50 messages? → YES → New session with handoff doc
    ↓ NO
Switching to unrelated task? → YES → New session
    ↓ NO
Design doc ready? → YES → New session to implement
    ↓ NO
Phase complete? → YES → New session for next phase
    ↓ NO
Continue current session
```

### Should I use useState or useRef?

```
Do I need re-renders on change? → YES → useState
    ↓ NO
Is this a guard flag for callbacks? → YES → useRef (sync updates)
    ↓ NO
Do I need immediate updates? → YES → useRef (sync updates)
    ↓ NO
useState (default choice)
```

### Should I pre-measure or measure on-demand?

```
Is this initial load? → YES → Measure-first (pre-measure)
    ↓ NO
Is content changing? → YES → Measure on-demand (re-measure)
    ↓ NO
Already have measurements? → YES → Use cached
    ↓ NO
Measure on-demand
```

---

## 📁 File Organization

```
specs/[Service]/[Feature]/
├── PLAN-[feature].md             # Design doc (before coding)
├── HANDOFF-[name].md             # Implementation-ready handoff
└── tasks.md                      # Task breakdown / checklist (optional)

[project-root]/src/[module]/debug/
├── verifyMeasurementAccuracy.js  # Diagnostic script
├── diagnoseSplit.js              # Algorithm checker
└── diagnoseMeasurementCSS.js     # CSS comparison
```

---

## 🚀 Starting a New Project

### Checklist

**Before Any Code:**
- [ ] Write problem statement
- [ ] Define success criteria
- [ ] Identify similar systems
- [ ] Sketch architecture
- [ ] Break into phases (2-4 hours each)
- [ ] Write design document
- [ ] Get approval/review

**During Implementation:**
- [ ] Implement one phase at a time
- [ ] Test empirically at each phase
- [ ] Write handoff after each phase
- [ ] Start fresh sessions with handoffs
- [ ] Log extensively

**After Completion:**
- [ ] Write learnings document
- [ ] Update architecture docs
- [ ] Clean up debug logs
- [ ] Archive working documents
- [ ] Plan next iteration

---

## 🎓 Key Principles

### The Golden Rules

1. **Empirical Verification:** Don't claim it works until you prove it
2. **Spec-First Development:** Design before code
3. **Phased Execution:** 2-4 hour chunks
4. **Fresh Context:** New sessions with handoff docs
5. **Living Documentation:** Docs evolve with code
6. **Measure-First:** Accurate on first try
7. **Stable Immutables:** Separate volatile from canonical
8. **Guard Expensive Ops:** Tutorial mode, debouncing, caching
9. **Evidence-Based:** Screenshots, logs, network traces
10. **Iterate and Refine:** Test → Feedback → Fix → Verify

### Anti-Patterns

1. ❌ "Should work" claims without testing
2. ❌ Long unstructured sessions
3. ❌ Implementation before design
4. ❌ Mixing mutable and immutable state
5. ❌ Silent failures (swallow errors)
6. ❌ Stale documentation
7. ❌ Skipping verification steps
8. ❌ Changing requirements mid-phase
9. ❌ Assumptions without validation
10. ❌ No handoff between sessions

---

**For detailed explanations and examples, see:**
- `LEARNINGS-StatblockGenerator-Rebuild-2025.md` - Canvas architecture, dynamic locking, pagination
- `LEARNINGS-PlayerCharacterGenerator-2025.md` - HTML-first workflow, multi-sheet organization, overflow patterns

**Last Updated:** December 10, 2025

