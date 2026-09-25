> **Historical import from DungeonOverMind — 2026-09-24.** This document records an older DungeonMind Web/product implementation state. It is not current LandingPage architecture or sequencing authority. Re-anchor against current code before applying it.

# StatblockGenerator Rebuild: Learnings & Patterns (2025)

**Project:** DungeonMind StatblockGenerator  
**Timeline:** September - October 2025  
**Status:** Production-Ready  
**Purpose:** Capture development patterns, workflows, and architectural insights from the rebuild

---

## 🎯 Executive Summary

The StatblockGenerator rebuild represents a successful migration from an isolated project to a fully integrated DungeonMind service, introducing the **Canvas** concept - a sophisticated layout system for dynamic content rendering. This document captures the **proven patterns and workflows** that made this rebuild successful.

### Key Achievements

- ✅ Built novel Canvas layout system with dynamic pagination
- ✅ Implemented measure-first architecture (eliminated double pagination)
- ✅ Developed spec-driven development workflow
- ✅ Created phased implementation strategy with clear handoffs
- ✅ Established empirical debugging methodology
- ✅ Delivered tutorial/onboarding system with production polish

### Document Goals

1. **Preserve Knowledge:** Capture what worked (and what didn't)
2. **Enable Replication:** Provide patterns for future similar projects
3. **Guide AI Agents:** Document effective human-AI collaboration workflows
4. **Prevent Repetition:** Record solved problems and their solutions

---

## 📐 The Spec-Driven Development Pattern

### What It Is

**Spec-first coding** = Write a detailed design document BEFORE implementing, treating it as a contract between planning and execution sessions.

### Core Components

#### 1. Design Document Structure

```markdown
# [Feature Name] - Implementation Plan

## Executive Summary
- Current state
- Target state  
- Key benefits

## Architecture Overview
- Diagrams (before/after)
- Layer definitions
- Data flow

## Files to Create
- File 1: path/to/file.tsx (purpose)

## Files to Modify  
- File 1: Changes summary with LINE NUMBERS

## Implementation Steps
### Step 1: [Name] (time estimate)
- Detailed instructions
- Code snippets with EXACT line numbers
- Key decisions documented

## Testing Checklist
- [ ] Test case 1
- [ ] Test case 2

## Success Criteria
- Measurable outcomes
- Observable behavior

## Risks & Mitigations
- Risk 1 → Mitigation strategy
```

#### 2. File Reference Pattern

**Always include:**
- Full file path from project root
- Specific line numbers or ranges
- Function/class names
- Existing code context

**Example:**
```
File: LandingPage/src/components/StatBlockGenerator/StatBlockGeneratorProvider.tsx
Lines: 250-268
Function: releaseComponentLock()
Context: Dynamic locking system for edit mode
```

#### 3. Code Snippet Format

```typescript
// BEFORE (broken): Explanation
const oldApproach = async () => {
    // Problematic code
};

// AFTER (fixed): Explanation  
const newApproach = async () => {
    // Solution code
};

// WHY: Detailed reasoning about the change
```

### Benefits Observed

1. **Context Preservation:** New agent sessions start immediately without ramp-up
2. **Reduced Rework:** Design issues caught before coding
3. **Clear Success Criteria:** No ambiguity about "done"
4. **Documentation Artifact:** Design doc becomes permanent reference

### Anti-Patterns to Avoid

❌ **Vague descriptions:** "Update the handler"  
✅ **Precise instructions:** "In handleJoyrideCallback (line 210), add guard check before action dispatch"

❌ **Missing context:** "Fix the bug"  
✅ **Root cause analysis:** "Race condition between setState (async) and callback (sync) - use useRef instead"

❌ **No verification plan:** "Should work now"  
✅ **Observable criteria:** "Console log shows 'guard activated', network tab shows zero API calls"

---

## 🔄 Phased Implementation Strategy

### The Pattern

Break large features into **2-4 hour phases** with clear deliverables, handoffs, and verification steps.

### Phase Template

```markdown
## Phase N: [Feature Name] ([Time Estimate])

### Goals
1. Primary goal (measurable)
2. Secondary goal (measurable)

### Tasks
- [ ] Task 1 (file: path/to/file, lines: 100-150)
- [ ] Task 2 (file: path/to/file, lines: 200-250)

### Verification Steps
1. Run command X
2. Check console for log Y
3. Verify UI shows Z

### Success Criteria
- [ ] Criterion 1 (how to verify)
- [ ] Criterion 2 (how to verify)

### Files Modified
- path/to/file1 (+50 lines)
- path/to/file2 (-20 lines, +30 lines)

### Next Phase Blockers
- Issue A must be resolved before Phase N+1
- Decision B must be made
```

### Example: EditableComponents Implementation

**Phase 0:** Data model (IDs) - 4 hours  
**Phase 1:** Dynamic locking infrastructure - 3 hours  
**Phase 2:** Initial 5 components editable - 6 hours  
**Phase 2.5:** Remaining 7 components - 3 hours  
**Phase 3:** Save & sync system - 8 hours

**Key Insight:** Phase 2.5 discovered mid-execution when reality diverged from plan - adapt, document, continue.

### Handoff Documents

**Purpose:** Enable seamless transitions between sessions or agents.

**Structure:**
```markdown
# [Feature] - Phase N Complete Handoff

## What Was Done
- Completed task list
- Files changed summary
- Evidence of completion (screenshots, logs)

## Current State
- What works (verified)
- What doesn't work (known issues)
- What's partially done

## Next Steps
- Immediate priorities
- Blockers to resolve
- Questions to answer

## How to Continue
1. Read this document
2. Load file X
3. Run command Y to verify state
4. Proceed with Phase N+1 tasks
```

### Benefits Observed

1. **Manageable Chunks:** 2-4 hours = single focused session
2. **Clear Progress:** Each phase is verifiable milestone
3. **Recovery Points:** Can resume from any phase boundary
4. **Quality Gates:** Verify before proceeding

---

## 🐛 Empirical Debugging Methodology

### Core Principle

**Never declare victory without proof.** Always run, observe, verify.

### The Diagnostic Workflow

#### Step 1: Reproduction (5-10 min)
```markdown
**Expected:** Component places all items in Column 1
**Actual:** Component splits across columns unnecessarily
**Reproduce:** Load statblock, observe canvas placement
**Evidence:** Screenshot + console logs
```

#### Step 2: Hypothesis Formation (10-15 min)
```markdown
**Hypothesis 1:** Measurement discrepancy (height off by N pixels)
**Hypothesis 2:** Pagination logic using wrong region height
**Hypothesis 3:** CSS difference between layers
```

#### Step 3: Systematic Testing (varies)

**For each hypothesis:**
1. Write diagnostic script (browser console)
2. Capture actual values
3. Compare to expected
4. Rule in/out hypothesis

**Example Diagnostic Script:**
```javascript
// Verify measurement accuracy
{
    const meas = document.querySelector('.measurement-layer .component');
    const vis = document.querySelector('.visible-layer .component');
    console.table({
        'Measurement': { height: meas.offsetHeight },
        'Visible': { height: vis.offsetHeight },
        'Difference': { height: Math.abs(meas.offsetHeight - vis.offsetHeight) }
    });
}
```

#### Step 4: Root Cause Identification (varies)
```markdown
## Root Cause: [One sentence summary]

**File:** path/to/file.tsx  
**Line:** 267  
**Issue:** Using `region` (mutable) instead of `homeRegion` (stable)

**Why it matters:** Causes oscillation between pagination runs

**Evidence:** Console logs show regionKey changing each cycle
```

#### Step 5: Fix Implementation (varies)
```typescript
// BEFORE (line 267)
const baseLocation = persisted ? persisted.region : resolvedHome;

// AFTER (line 267)  
const baseLocation = persisted ? persisted.homeRegion : resolvedHome;

// REASONING: homeRegion is stable canonical position,
// region is volatile pagination output
```

#### Step 6: Verification (10-15 min)
```markdown
## Verification Checklist
- [ ] Run diagnostic script - difference now <5px
- [ ] Console logs show stable placement
- [ ] Multiple statblocks tested
- [ ] No regressions in other components
```

### Debugging Document Structure

Observed in: `2025-10-03-measurement-debugging-guide.md`

```markdown
# [Bug Name] Debugging Guide

## Quick Diagnostic Workflow
[Copy-paste scripts for rapid diagnosis]

## Step-by-Step Investigation
[Decision tree based on symptoms]

## Common Fix Patterns  
[Solutions for recurring issues]

## Success Criteria
[How to know it's truly fixed]
```

### Key Techniques

#### 1. Logging Strategy

**Multi-level namespaces:**
```typescript
console.log('[paginate]', 'run-start', data);      // Pagination
console.log('[measurement-flush]', data);           // Measurements
console.log('[layout-dirty]', action, data);        // State changes
console.log('[measure-first]', message, data);      // Flow control
```

**Benefits:**
- Grep-able by subsystem
- Filterable in browser console
- Temporal correlation across systems

#### 2. Diagnostic Scripts

**Save in repository:**
```
LandingPage/src/canvas/debug/
├── verifyMeasurementAccuracy.js
├── diagnoseSplit.js
└── diagnoseMeasurementCSS.js
```

**Format:**
```javascript
// File: verifyMeasurementAccuracy.js
// Purpose: Compare measurement layer vs visible layer
// Usage: Paste into browser console during bug investigation

{
    // Self-contained, no dependencies
    const results = {/* ... */};
    console.table(results);
}
```

#### 3. State Inspection Helpers

```typescript
// Add to component for debugging
useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
        console.log('[ComponentName] State:', {
            prop1,
            prop2,
            timestamp: Date.now()
        });
    }
}, [prop1, prop2]);
```

### Anti-Patterns

❌ **"Should work" coding:** Make change, assume success  
✅ **"Verify empirically" coding:** Make change, run, observe, confirm

❌ **Blind debugging:** Try random things until it works  
✅ **Hypothesis-driven debugging:** Form theory, test, refine

❌ **Console.log soup:** Random logs everywhere  
✅ **Structured logging:** Namespaced, consistent format

---

## 🏗️ Canvas Architecture Pattern

### The Innovation

**Canvas** = Dynamic layout system that measures real rendered content and paginates based on actual dimensions.

### Core Concepts

#### 1. Two-Layer Rendering

```
┌─────────────────────────────┐
│ Visible Layer               │
│ - User sees this            │
│ - Scaled via CSS transform  │
│ - Always renders at base    │
│   dimensions then scales    │
└─────────────────────────────┘

┌─────────────────────────────┐
│ Measurement Layer (hidden)  │
│ - Measures component heights│
│ - Always base dimensions    │
│ - No scaling (scale: 1)     │
└─────────────────────────────┘
```

**Key Insight:** Render twice - once for measurement, once for display. Keeps measurements consistent across all resolutions.

#### 2. Measure-First Flow

**Problem:** Original flow ran pagination twice (estimate → measure → re-paginate).

**Solution:** Measure ALL components BEFORE first pagination run.

```
Traditional Flow:
1. Build buckets with estimates (200px default)
2. Paginate (wrong)
3. Measure real heights
4. Paginate again (correct)

Measure-First Flow:  
1. Create measurement entries from raw components
2. Wait for ALL measurements
3. Build buckets with real measurements
4. Paginate ONCE (correct first time)
```

**Implementation Pattern:**
```typescript
// State flag gates pagination
if (state.waitingForInitialMeasurements) {
    console.debug('Skipping pagination - waiting for measurements');
    return state; // Don't run pagination yet
}

// Measurement completion triggers bucket building
if (allComponentsMeasured && wasWaitingForMeasurements) {
    console.debug('All measurements complete, building buckets');
    const recomputed = recomputeEntries(state);
    return { ...recomputed, isLayoutDirty: true }; // Now paginate
}
```

#### 3. Dynamic Component Locking

**Problem:** Editing text causes measurements to change, triggering re-layout, which disrupts editing.

**Solution:** Lock measurements during active editing with 2-second idle timeout.

```typescript
// Edit timer pattern
const [isEditing, setIsEditing] = useState(false);
const editTimerRef = useRef<NodeJS.Timeout | null>(null);

const handleEditStart = () => {
    if (!isEditing) {
        setIsEditing(true);
        requestComponentLock(componentId); // Lock measurements
    }
};

const handleEditChange = () => {
    // Reset timer on each keystroke
    if (editTimerRef.current) clearTimeout(editTimerRef.current);
    editTimerRef.current = setTimeout(handleEditComplete, 2000);
};

const handleEditComplete = () => {
    releaseComponentLock(componentId); // Unlock, trigger re-measurement
    setIsEditing(false);
};
```

**Benefits:**
- No visible UI complexity (no Edit/Done buttons)
- Measurements update automatically after user stops typing
- Smooth, invisible locking

#### 4. Stable Home Regions

**Problem:** Pagination output was used as input to next pagination cycle, causing oscillation.

**Solution:** Separate immutable home regions from volatile placement results.

```typescript
interface CanvasLayoutState {
    // Immutable: Where components START (from template)
    homeRegions: Map<string, HomeRegionAssignment>;
    
    // Volatile: Where components END UP (from pagination)
    assignedRegions: Map<string, SlotAssignment>;
}

// Bucket building ALWAYS uses homeRegions
const baseLocation = persisted 
    ? persisted.homeRegion  // ✅ Stable
    : resolvedHome;

// NOT this (caused infinite loops):
// const baseLocation = persisted.region; // ❌ Volatile
```

### Reusable Patterns

#### Pattern 1: ResizeObserver-Based Scaling

```typescript
useLayoutEffect(() => {
    const observer = new ResizeObserver((entries) => {
        const availableWidth = entries[0].contentRect.width - paddingX;
        const scale = clamp(availableWidth / baseWidthPx, MIN_SCALE, MAX_SCALE);
        setScale(scale);
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
}, [baseWidthPx]);
```

#### Pattern 2: Measurement Coordinator

```typescript
class MeasurementCoordinator {
    private observers = new Map<string, MeasurementObserver>();
    
    lockComponent(componentId: string) {
        const observer = this.observers.get(componentId);
        observer?.lock(); // Buffer measurements, don't dispatch
    }
    
    unlockComponent(componentId: string) {
        const observer = this.observers.get(componentId);
        observer?.unlock(); // Dispatch buffered measurements
    }
}
```

#### Pattern 3: Gated State Transitions

```typescript
// Don't allow action A until condition B is met
if (!preconditionMet) {
    console.debug('[system] Skipping action - precondition not met');
    return currentState; // Stay in current state
}

// Proceed with action
console.debug('[system] Precondition met, proceeding with action');
return nextState;
```

### Architectural Decisions

**✅ DO:**
- Measure in hidden layer at base dimensions
- Use refs for synchronous state updates when needed
- Gate actions on preconditions (don't assume)
- Log state transitions with context

**❌ DON'T:**
- Mix measurement and display concerns
- Use volatile state as input to next cycle
- Assume timing (always verify with logs)
- Skip verification steps

---

## 🧪 The Tutorial System Pattern

**📚 For comprehensive tutorial creation guide, see:**  
**`Docs/Learnings/LEARNINGS-React-Joyride-Interactive-Tutorials.md`**

This section provides a brief overview. For detailed patterns, animations, specifications, and best practices, refer to the dedicated tutorial learnings document above.

---

### The Challenge

Create interactive onboarding that:
1. Doesn't cost money (no real API calls)
2. Doesn't corrupt user data (isolated state)
3. Works across sessions (cookie-based)
4. Can be restarted/skipped

### Solution Architecture

#### 1. Tutorial Mode Flag Pattern

**Flow tutorial mode through entire stack:**
```
StatBlockGenerator (opens drawer with flag)
  ↓
Provider (tracks in generationDrawerState)
  ↓  
GenerationDrawer (passes through)
  ↓
TextGenerationTab (guards API calls)
```

**Guard at API boundary:**
```typescript
const handleGenerateCreature = async () => {
    if (isTutorialMode) {
        console.log('🎓 Tutorial mode - skipping real API call');
        onGenerationComplete?.();
        return; // Don't call OpenAI
    }
    
    // Real generation...
};
```

#### 2. First-Time User Detection

**Check tutorial cookie in THREE places:**
```typescript
// 1. Skip localStorage restore
const getInitialState = () => {
    if (!tutorialCookies.hasCompletedTutorial()) {
        return null; // Force fresh start
    }
    // ... restore from localStorage
};

// 2. Initialize with empty state
const [data, setData] = useState(() => {
    if (!tutorialCookies.hasCompletedTutorial()) {
        return EMPTY_STATE; // Blank canvas
    }
    return getRandomDemo(); // Only for returning users
});

// 3. Don't auto-load demo
useEffect(() => {
    if (!tutorialCookies.hasCompletedTutorial()) {
        console.log('First-time user - let tutorial control state');
        return; // Don't load demo
    }
    loadDemoData();
}, []);
```

#### 3. State Timing Issues

**Problem:** React's `useState` is asynchronous, causing race conditions with synchronous callbacks.

**Solution:** Use `useRef` for guard flags that need immediate updates.

```typescript
// BEFORE (broken): Async state update
const [guardFlag, setGuardFlag] = useState(false);

const triggerAction = () => {
    setGuardFlag(true);  // Schedules update (async)
    doAction();          // Fires callback BEFORE flag is true
};

// Callback sees guardFlag = false ❌

// AFTER (fixed): Sync ref update
const guardFlagRef = useRef(false);

const triggerAction = () => {
    guardFlagRef.current = true;  // Updates immediately (sync)
    doAction();                   // Fires callback AFTER flag is true
};

// Callback sees guardFlagRef.current = true ✅
```

**When to use each:**
- `useState`: When you need re-renders on change
- `useRef`: When you need synchronous updates for guards/flags

#### 4. Cookie-Based Persistence

```typescript
// utils/tutorialCookies.ts
const TUTORIAL_COOKIE_KEY = 'statblock_tutorial_completed';
const TUTORIAL_VERSION = 'v1'; // Increment to re-show after updates

export const hasCompletedTutorial = (): boolean => {
    return Cookies.get(TUTORIAL_COOKIE_KEY) === TUTORIAL_VERSION;
};

export const markTutorialComplete = (): void => {
    Cookies.set(TUTORIAL_COOKIE_KEY, TUTORIAL_VERSION, { expires: 30 });
};

export const resetTutorial = (): void => {
    Cookies.remove(TUTORIAL_COOKIE_KEY);
};
```

#### 5. Auto-Trigger vs User-Trigger Steps

**Discovery:** Auto-triggered steps feel rushed and lose user control.

**Solution:** Let user click "Next" to trigger actions.

```typescript
// BEFORE: Auto-trigger after timeout
useEffect(() => {
    if (stepIndex === 3) {
        setTimeout(() => {
            triggerGeneration(); // Auto-fires
        }, 1000);
    }
}, [stepIndex]);

// AFTER: Trigger on user click
const handleCallback = (data) => {
    if (data.index === 3 && data.action === 'next') {
        triggerGeneration(); // User-initiated
    }
};
```

**Lesson:** Give user control over pace, especially for demos/animations.

### Tutorial Flow Best Practices

**✅ DO:**
- Guard expensive operations (API calls, database writes)
- Provide demo data that showcases features
- Allow skip/restart at any time
- Use cookies for completion tracking (not localStorage)
- Test both first-time and returning user paths

**❌ DON'T:**
- Auto-advance through important steps
- Use real data/APIs in tutorial mode
- Assume state - always check tutorial cookie
- Block users from skipping
- Mix tutorial state with production state

---

## 💾 Save System Architecture

### The Pattern

**Dual-layer persistence:** Immediate local + debounced cloud.

```
User Edit
    ↓
Local State (immediate)
    ↓
localStorage (immediate)
    ↓
Firestore (2s debounce, auth required)
```

### Implementation

#### 1. Immediate localStorage

```typescript
useEffect(() => {
    const stateSnapshot = {
        data: currentData,
        projectId: currentProject?.id,
        timestamp: Date.now()
    };
    localStorage.setItem('app_state', JSON.stringify(stateSnapshot));
}, [currentData, currentProject]);
```

**Benefits:**
- No debounce = never lose recent edits
- Works offline
- No auth required
- Instant save

#### 2. Debounced Firestore

```typescript
useEffect(() => {
    if (!isLoggedIn || !userId) return;
    if (!data?.name?.trim()) return; // Skip empty
    
    // Clear existing timer
    if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
    }
    
    // Set new timer (2 seconds)
    debounceTimerRef.current = setTimeout(async () => {
        setSaveStatus('saving');
        try {
            await saveToFirestore(data, projectId, userId);
            setSaveStatus('saved');
        } catch (err) {
            setSaveStatus('error');
        }
    }, 2000);
    
    return () => clearTimeout(debounceTimerRef.current);
}, [data, projectId, isLoggedIn, userId]);
```

**Benefits:**
- Reduces Firestore writes (cost savings)
- Groups rapid changes into single save
- Auth-required for security
- Shows save status to user

#### 3. Manual Save Button

```typescript
const saveNow = useCallback(async () => {
    if (!isLoggedIn) {
        setError('Please log in to save');
        return;
    }
    
    // Clear pending debounced save
    if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
    }
    
    // Save immediately
    await saveToFirestore(data, projectId, userId);
}, [isLoggedIn, data, projectId, userId]);
```

**Benefits:**
- User control over timing
- Bypasses debounce delay
- Clear feedback (loading state)

#### 4. Save Status Indicator

```typescript
const SaveStatusBadge = useMemo(() => {
    if (saveStatus === 'saving') {
        return <Badge color="blue">Saving...</Badge>;
    }
    if (saveStatus === 'saved') {
        return <Badge color="green">Saved</Badge>;
    }
    if (saveStatus === 'error') {
        return <Badge color="red">Save Failed</Badge>;
    }
    if (lastSaved) {
        const minutesAgo = Math.floor((Date.now() - lastSaved) / 60000);
        return <Text>Saved {minutesAgo}m ago</Text>;
    }
    return null;
}, [saveStatus, lastSaved]);
```

### Backend ID Normalization

**Problem:** Frontend may send data without IDs for list items.

**Solution:** Backend ensures all list items have IDs before saving.

```python
def normalize_statblock_ids(statblock: dict) -> dict:
    """Ensure all list items have stable IDs"""
    if "actions" in statblock:
        statblock["actions"] = [
            {**action, "id": action.get("id") or str(uuid4())}
            for action in statblock["actions"]
        ]
    # ... normalize other lists
    return statblock
```

**Benefits:**
- Frontend can send partial data
- Backend guarantees consistency
- IDs are stable across saves

### Key Learnings

**✅ DO:**
- Save locally immediately (never lose data)
- Debounce cloud saves (reduce costs)
- Provide manual save option
- Show save status clearly
- Normalize data on backend

**❌ DON'T:**
- Only save to cloud (fails offline)
- Save every keystroke to Firestore (expensive)
- Assume data is valid (normalize first)
- Hide save errors from user

---

## 🔬 Testing Philosophy

### Empirical Verification

**Core Principle:** Don't claim it works until you've proven it works.

#### Testing Checklist Template

```markdown
## Testing Checklist

### Unit Verification
- [ ] Component renders without errors
- [ ] Props flow correctly
- [ ] State updates as expected
- [ ] Edge cases handled

### Integration Verification  
- [ ] Feature works end-to-end
- [ ] No console errors/warnings
- [ ] Network requests succeed
- [ ] Data persists correctly

### User Experience Verification
- [ ] UI is responsive
- [ ] Loading states show
- [ ] Error messages are clear
- [ ] Keyboard navigation works
- [ ] Mobile view works

### Performance Verification
- [ ] No memory leaks
- [ ] Renders within 60fps
- [ ] API calls are optimized
- [ ] Bundle size acceptable
```

#### Evidence Requirements

**For each verification:**
1. **Screenshot** or **screen recording** (visual proof)
2. **Console logs** (state proof)
3. **Network tab** (API proof)
4. **Linter output** (code quality proof)

**Example:**
```markdown
## Verification: Save System

✅ localStorage saves immediately
- Evidence: Application tab shows key after edit
- Screenshot: [attached]

✅ Firestore saves after 2s debounce
- Evidence: Network tab shows POST after delay
- Screenshot: [attached]

✅ Manual save bypasses debounce
- Evidence: POST fires immediately on button click
- Console log: "Save button clicked, bypassing debounce"
```

### Debugging Before Claiming Success

**Process:**
1. Make code change
2. Run linter (`npm run lint`)
3. Check for TypeScript errors
4. Start dev server
5. Test in browser
6. Verify console logs match expectations
7. Check network tab for API calls
8. Test edge cases
9. Document evidence
10. **THEN** claim success

### Hot Reload Verification

**Problem:** Hot reload can cache old code.

**Solution:**
```bash
# Always verify fresh load
1. Make change
2. Save file
3. Wait for hot reload
4. Hard refresh browser (Ctrl+Shift+R)
5. Test again
```

**If still broken:**
```bash
# Clear caches
rm -rf node_modules/.cache
npm start
```

---

## 📚 Documentation Patterns

### Living Documentation

**Principle:** Docs should evolve with code, not become stale artifacts.

#### Types of Documents

**1. Design Docs (Plan-First)**
- Purpose: Spec out work before coding
- Update: Mark LOCKED when ready to implement
- Location: `specs/[Feature]/PLAN-[feature].md`

**2. Handoff Docs (Session-End)**
- Purpose: Enable next session to continue
- Update: After each phase completion
- Location: `specs/[Feature]/HANDOFF-[name].md`

**3. Investigation Docs (Debugging)**
- Purpose: Capture bug analysis and solution
- Update: During debugging, finalize when fixed
- Location: `Docs/YYYY-MM-DD-[bug]-investigation.md`

**4. Architecture Deep-Dives (Reference)**
- Purpose: Explain complex systems
- Update: When architecture changes
- Location: `Docs/architecture/[system]_Architecture.md`

**5. Learnings Docs (Retrospective)**
- Purpose: Capture patterns and insights
- Update: After major milestones
- Location: `Docs/Learnings/LEARNINGS-[project]-YYYY.md`

#### Documentation Workflow

```
1. Start Feature
   ↓
2. Write Design Doc (PLAN.md)
   ↓
3. Implement Phase 1
   ↓
4. Write Handoff Doc (phase1-HANDOFF.md)
   ↓
5. Implement Phase 2
   ↓
6. Update Handoff Doc (phase2-HANDOFF.md)
   ↓
7. Feature Complete
   ↓
8. Write Learnings Doc (LEARNINGS.md)
```

#### Key Document Attributes

**Every doc should have:**
- **Date** - When written
- **Status** - Complete / In Progress / Blocked
- **Type** - Plan / Handoff / Investigation / Reference
- **Related Docs** - Links to other relevant docs
- **Files Changed** - List with line counts
- **Next Steps** - What to do after reading

### Code Comments

**When to comment:**
```typescript
// ✅ DO: Explain WHY, not WHAT
// CRITICAL: Use homeRegion (stable) not region (volatile)
// to prevent oscillation between pagination runs
const baseLocation = persisted ? persisted.homeRegion : resolvedHome;

// ❌ DON'T: Restate the obvious
// Set baseLocation to homeRegion if persisted exists
const baseLocation = persisted ? persisted.homeRegion : resolvedHome;
```

**Link to documentation:**
```typescript
// For complex systems, reference the deep-dive doc
// See: Docs/architecture/Canvas_Architecture.md
class MeasurementCoordinator { ... }
```

---

## 🎓 Human-AI Collaboration Patterns

### What Worked Well

#### 1. Spec-First Approach

**Human Provides:**
- High-level goals
- Constraints and requirements
- Context about existing system
- Approval of design

**AI Provides:**
- Detailed design document
- Implementation plan with steps
- Code snippets with line numbers
- Testing strategy

**Handoff:**
```
Human: "We need editable components with invisible locking like StoreGenerator"
  ↓
AI: Writes 50-page design doc with architecture, phases, code examples
  ↓
Human: Reviews, approves, or requests changes
  ↓
AI: Implements Phase 0 (4 hours of work)
  ↓
Human: Tests, verifies, approves
  ↓
AI: Implements Phase 1...
```

#### 2. Fresh Context Sessions

**When to start new session:**
- ✅ After completing a phase
- ✅ When switching to unrelated task
- ✅ After finding context is too noisy (>50 messages)
- ✅ When design doc exists as canonical reference

**How to start:**
1. Provide design doc or handoff doc
2. Reference specific files to read
3. State current phase and goals
4. Ask agent to verify understanding before proceeding

#### 3. Iterative Refinement

**Pattern:**
```
1. AI implements solution
2. Human tests
3. Human reports specific failure
4. AI debugs with diagnostic tools
5. AI proposes fix with reasoning
6. Human approves or provides more info
7. Loop until verification passes
```

**Key:** Human provides empirical evidence (console logs, screenshots), AI provides hypothesis and fix.

#### 4. Documentation as Contract

**Human writes planning docs:**
- Goals and constraints
- User requirements
- Architecture decisions

**AI writes implementation docs:**
- Step-by-step plan
- Code snippets
- Testing strategy

**Both review together** before implementation starts.

### What Didn't Work

❌ **Long unstructured conversations:** Context becomes noisy  
❌ **"Figure it out":** Too vague, leads to wrong assumptions  
❌ **"Should work" without testing:** Wastes time on broken code  
❌ **Changing requirements mid-phase:** Confuses scope and goals

### Recommendations for Future Work

**For Humans:**
1. Write clear problem statements with context
2. Provide relevant file paths and line numbers
3. Test AI's work and provide specific feedback
4. Approve design docs before implementation
5. Start fresh sessions with handoff docs

**For AI Agents:**
1. Write detailed design docs before coding
2. Provide evidence of changes (before/after code)
3. Include verification steps in every change
4. Log extensively during implementation
5. Document decisions and trade-offs

---

## 🔄 The Canvas Concept

### Vision

**Canvas** = Reusable pattern for dynamic, content-aware layout systems.

### What Makes It Special

1. **Content-Driven:** Layout adapts to actual rendered content
2. **Measurement-Based:** Uses real DOM measurements, not estimates
3. **Resolution-Independent:** Consistent at any viewport size
4. **Edit-Aware:** Locks measurements during editing
5. **Accessible:** Works with screen readers, keyboard navigation

### Potential Applications

**Beyond StatblockGenerator:**
- Card layouts (trading cards, playing cards)
- Form builders (dynamic field positioning)
- Newsletter templates (content-aware columns)
- Document generators (legal docs, reports)
- Dashboard builders (widget positioning)

### Generalization Path

```typescript
// Generic Canvas System
interface CanvasConfig {
    baseWidthPx: number;
    baseHeightPx: number;
    columnCount: number;
    components: ComponentDefinition[];
    measurementLayer: 'hidden' | 'visible';
    editMode: boolean;
}

const Canvas: React.FC<CanvasConfig> = (config) => {
    // Measurement system
    // Pagination engine
    // Dynamic scaling
    // Edit locking
    // Render layers
};
```

### Next Evolution

**Ideas for improvement:**
- **Progressive rendering:** Show partial layout while measuring
- **Virtualization:** Only render visible pages
- **Collaborative editing:** Multiple users editing simultaneously
- **Undo/redo:** Time-travel through layout states
- **Templates:** Pre-built layouts for common use cases

---

## 📊 Metrics & Outcomes

### Development Velocity

**StatblockGenerator Rebuild:**
- **Timeline:** September - October 2025 (~6 weeks)
- **Phases Completed:** 7 major phases + polish
- **Lines of Code:** ~15,000 (frontend) + ~5,000 (backend)
- **Features Delivered:**
  - Canvas layout system
  - 12 editable components
  - AI generation integration
  - Tutorial/onboarding
  - Project management
  - Image generation with 3 models

**Time Breakdown:**
- Phase 0 (IDs): 4h
- Phase 1 (Locking): 3h
- Phase 2 (Initial Edit): 6h
- Phase 2.5 (Complete Edit): 3h
- Phase 3 (Save System): 8h
- Phase 4-6 (Polish): ~15h
- **Total:** ~39 hours of focused implementation

### Code Quality Indicators

**Linter Errors:** 0 (enforced at every phase)  
**TypeScript Errors:** 0 (strict mode)  
**Console Warnings:** 0 in production  
**Test Coverage:** Not measured (focus on empirical testing)

### Architectural Wins

1. **Measure-First:** Eliminated double pagination (2x faster initial load)
2. **Stable Home Regions:** Fixed infinite loop bugs
3. **Dynamic Locking:** Seamless editing without mode buttons
4. **Tutorial Guards:** Zero API costs during onboarding

### User Experience Wins

1. **Responsive Scaling:** Works on mobile, tablet, desktop
2. **Invisible Editing:** No "Edit Mode" button clutter
3. **Auto-Save:** Never lose work
4. **Tutorial:** First-time users see guided workflow

---

## 🚀 Recommendations for Future Projects

### Start-of-Project Checklist

- [ ] Write problem statement and goals
- [ ] Identify similar systems to learn from
- [ ] Sketch architecture diagrams
- [ ] Break into phases (2-4 hours each)
- [ ] Identify key technical risks
- [ ] Plan verification strategy

### During Implementation

- [ ] Write design doc before coding
- [ ] Implement in phases with handoffs
- [ ] Test empirically at each phase
- [ ] Document decisions and trade-offs
- [ ] Start fresh sessions with handoff docs
- [ ] Log extensively during development

### End-of-Phase Checklist

- [ ] Run linter (zero errors)
- [ ] Test in browser (with evidence)
- [ ] Write handoff document
- [ ] Commit code with descriptive message
- [ ] Tag phase completion in docs

### End-of-Project Checklist

- [ ] Write learnings document
- [ ] Update architecture docs
- [ ] Clean up debug logs
- [ ] Write user documentation
- [ ] Plan next project using learnings

---

## 🎯 Key Takeaways

### Top 10 Patterns

1. **Spec-Driven Development:** Design doc before code
2. **Phased Implementation:** 2-4 hour chunks with verification
3. **Empirical Debugging:** Hypothesis → Test → Verify
4. **Measure-First Architecture:** Accurate on first try
5. **Dynamic Locking:** Invisible to user, smooth UX
6. **Stable Home Regions:** Immutable starting positions
7. **Dual-Layer Rendering:** Measurement vs display
8. **Tutorial Guards:** Protect expensive operations
9. **Debounced Saves:** Immediate local, delayed cloud
10. **Living Documentation:** Docs evolve with code

### Top 5 Mistakes to Avoid

1. ❌ **"Should work" claims:** Always verify empirically
2. ❌ **Long sessions:** Keep phases 2-4 hours max
3. ❌ **Vague requirements:** Be specific with context
4. ❌ **Skipping design docs:** Rework is more expensive
5. ❌ **Mixing volatile state:** Separate mutable from immutable

### Success Factors

**What made this project successful:**
- Clear phases with verification gates
- Detailed design docs as contracts
- Empirical testing at every step
- Fresh sessions with handoff docs
- Logging for observability
- Iterative refinement based on evidence

---

## 📖 Related Documents

### Primary References

- **Design Specs:**
  - `2025-10-04-editable-components-FINAL-DESIGN.md`
  - `2025-09-30-measure-first-plan.md`
  
- **Architecture:**
  - `CanvasLayout_DeepDive.md`
  - `2025-10-08-statblock-prelaunch-polish-HANDOFF.md`

- **Debugging:**
  - `2025-10-03-measurement-debugging-guide.md`
  - `2025-10-12-step4-autoadvance-bug.md`

- **Implementation Phases:**
  - `2025-10-05-phase3-save-sync-implementation.md`
  - `2025-10-11-tutorial-api-guard-implementation.md`

### Templates

Located in `Docs/Templates/`:
- `PROJECT_SCRATCHPAD_TEMPLATE.md` - Design doc template
- `HANDOFF_TEMPLATE.md` - Phase handoff template
- `BUG_INVESTIGATION_TEMPLATE.md` - Debugging doc template

---

## 🔄 Document Maintenance

**Last Updated:** October 15, 2025  
**Next Review:** When starting next major project  
**Maintainer:** Solo developer  
**Status:** Living document

**Update Triggers:**
- Major architectural changes to Canvas
- New patterns discovered in future work
- Refinements to development workflow
- Successful application of these patterns to new projects

**How to Use This Document:**
1. **Starting new project:** Read "Recommendations for Future Projects"
2. **Mid-project debugging:** Reference "Empirical Debugging Methodology"
3. **Architecture decisions:** Review "Canvas Architecture Pattern"
4. **Team onboarding:** Share "Key Takeaways" section
5. **Retrospectives:** Use as checklist for what worked/didn't

---

**This document captures hard-won knowledge. Use it, refine it, share it.**


