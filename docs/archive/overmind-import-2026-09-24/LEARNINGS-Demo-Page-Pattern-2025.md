> **Historical import from DungeonOverMind — 2026-09-24.** This document records an older DungeonMind Web/product implementation state. It is not current LandingPage architecture or sequencing authority. Re-anchor against current code before applying it.

# Learnings: Demo Page Pattern
**Date:** 2025-12-30  
**Context:** Standalone demo pages for testing features before main app integration  
**Status:** ✅ COMPLETE

---

## Overview

Demo pages are standalone test harnesses that exercise features in isolation before integrating with the main application. This pattern has proven invaluable for reusable engines, complex features, and services that need thorough testing.

**Template Location:** `Docs/Templates/DEMO_PAGE_TEMPLATE.tsx`

---

## Key Takeaways

### 1. Demo Pages Catch Bugs Early (10x ROI)

**Pattern:** Build a demo page BEFORE integrating with services.

**Validated Examples:**
- **GenerationDrawerEngine Demo:** 2-hour investment, caught 13 bugs before production integration
- **Map Canvas Demo:** Isolated canvas bugs before main app integration
- **Zero post-integration rework** in both cases

**Why It Works:**
- Isolates engine from service-specific context
- Provides reproducible test environment
- Enables rapid iteration without full app context
- Creates documentation by example

**ROI Calculation:**
- Demo page time: 2-4 hours
- Bugs caught early: 13+ bugs
- Debugging time saved per bug: ~1 hour average
- **Total savings: 13+ hours vs 2-4 hour investment = 3-6x ROI minimum**

---

### 2. Checklist Component as Living Documentation

**Pattern:** Interactive checklist with localStorage persistence serves as both QA tool and feature specification.

**Benefits:**
- **Systematic verification** - Don't forget edge cases
- **Progress tracking** - See 0/46 → 46/46 as you test
- **Regression catching** - Re-run after changes
- **Onboarding** - New devs learn capabilities by testing them
- **Documentation** - Checklist IS the feature specification

**Implementation Pattern:**
```typescript
// Checklist with localStorage persistence
const STORAGE_KEY = '[serviceName]Demo_checklist';

function loadChecklistFromStorage(): Set<string> {
  // Load synchronously on mount to avoid race conditions
  // ...
}

function ChecklistSection() {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(() => 
    loadChecklistFromStorage()
  );
  const [isInitialized, setIsInitialized] = useState(false);

  // Save only after initialization to avoid overwriting on mount
  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(checkedItems)));
  }, [checkedItems, isInitialized]);

  // Group by category for organization
  const itemsByCategory = useMemo(() => {
    // Group logic...
  }, []);

  // Progress calculation
  const progressPercent = totalItems > 0 
    ? Math.round((totalChecked / totalItems) * 100) 
    : 0;
}
```

**Key Insights:**
- Initialize state synchronously from localStorage (prevents race conditions)
- Only save after first render (`isInitialized` flag)
- Group items by category for better UX
- Show progress percentage for motivation
- Completion badge when 100% complete

---

### 3. State Viewer for Debugging

**Pattern:** JSON viewer showing internal state in real-time.

**Benefits:**
- See state changes as you interact with the demo
- Debug state management issues quickly
- Verify state updates match expectations
- Understand data flow without console logs

**Implementation Pattern:**
```typescript
function StateViewer() {
  const context = useService();

  const stateForDisplay = useMemo(() => {
    return {
      projectId: context?.projectId,
      isLoading: context?.isLoading,
      error: context?.error,
      // Extract relevant state for display
    };
  }, [context]);

  return (
    <Paper p="md" withBorder>
      <pre style={{ fontSize: '12px', maxHeight: '600px', overflow: 'auto' }}>
        {JSON.stringify(stateForDisplay, null, 2)}
      </pre>
    </Paper>
  );
}
```

**When to Include:**
- Complex state management (multiple providers, derived state)
- Debugging state synchronization issues
- Understanding data flow for new developers
- Verifying state updates match design

**When to Skip:**
- Simple state (single useState, no derived state)
- No debugging needed
- State is obvious from UI

---

### 4. Provider-Wrapped Demo Content

**Pattern:** Wrap demo content with service provider to match production structure.

**Benefits:**
- Tests provider state management
- Matches production component structure
- Catches provider bugs early
- Verifies context wiring

**Structure:**
```typescript
export default function ServiceDemo() {
  return (
    <ServiceProvider>
      <DemoHeader /> {/* Uses useService() hook */}
      <ServiceDemoContent /> {/* Uses useService() hook */}
    </ServiceProvider>
  );
}
```

**Key Insight:** Demo header uses the same context hooks as production, catching integration issues early.

---

### 5. UnifiedHeader Integration

**Pattern:** Use UnifiedHeader for consistent navigation and save status.

**Benefits:**
- Consistent UX across all services
- Tests UnifiedHeader integration
- Shows save status, auth state, drawer controls
- Matches production header behavior

**Implementation:**
```typescript
function DemoHeader() {
  const {
    openGenerationDrawer,
    openProjectsDrawer,
    saveStatus,
    saveNow,
    projectId,
  } = useService();

  const isUnsaved = !!baseImageUrl && !projectId;

  return (
    <UnifiedHeader
      app={{ id: 'service-demo', name: 'Service Demo', icon: DEMO_ICON_URL }}
      showGeneration={true}
      onGenerationClick={openGenerationDrawer}
      showProjects={true}
      onProjectsClick={openProjectsDrawer}
      showAuth={true}
      saveStatus={saveStatus}
      onSaveClick={saveNow}
      showSaveButton={!!baseImageUrl}
      isUnsaved={isUnsaved}
    />
  );
}
```

---

### 6. Tabs for Organization

**Pattern:** Use Mantine Tabs to organize demo content and debugging tools.

**Structure:**
- **Demo Canvas Tab:** Main feature demonstration
- **State Viewer Tab:** Debugging and state inspection

**Benefits:**
- Keeps UI clean (not everything visible at once)
- Easy to switch between demo and debugging views
- Matches production tab patterns

---

### 7. Console Logging for Debugging

**Pattern:** Emoji-coded console logs tell a story.

**Emoji Legend:**
- 🎯 Component mounting
- 📋 Checklist operations
- 💾 Save operations
- 🚀 Generation/actions
- 📂 Project operations
- ❌ Errors
- ⏱️ Generation time tracking
- 📊 Statistics/analytics

**Benefits:**
- Visual scanning (emoji patterns jump out in console)
- Domain prefixes organize by subsystem
- Logs tell execution story, not just event stream
- Makes debugging narrative ("what happened?") vs detective work

---

### 8. Generation Time Tracking for Progress Bar Improvement

**Pattern:** Track actual generation durations and progressively improve progress bar timing based on real data.

**Problem:** Hardcoded `estimatedDurationMs` in progress config doesn't match real API call durations. Progress bar is inaccurate, finishes too early or too late.

**Solution:** Track generation start/end times, store durations in localStorage, calculate statistics (mean, median, percentiles), and use P95 for recommended estimate.

**Implementation:**

```typescript
// 1. Track generation times
const textTimeTracking = useGenerationTimeTracking({
  service: 'map',
  generationType: 'text',
  maxRecords: 100,
  recommendedPercentile: 95 // Use P95 for safety margin
});

// 2. Record duration on generation complete
const handleGenerationComplete = (type: 'text' | 'image') => {
  if (type === 'text' && textGenerationStartRef.current) {
    const duration = performance.now() - textGenerationStartRef.current;
    textTimeTracking.recordDuration(duration);
    textGenerationStartRef.current = null;
  }
};

// 3. Use recommended estimate for progress bar
const progressConfig = {
  estimatedDurationMs: textTimeTracking.recommendedEstimatedMs || 7000, // Fallback if no data
  milestones: [...]
};
```

**Benefits:**
- **Progressive improvement** - More generations = more accurate estimates
- **Statistical safety** - P95 ensures 95% of generations complete before progress bar finishes
- **Data-driven** - No more guessing about timing
- **Per-service accuracy** - Each service tracks its own durations
- **Per-type accuracy** - Text and image generation tracked separately

**Statistics Calculated:**
- Mean (average) duration
- Median (P50) duration
- P75, P95, P99 percentiles
- Min/Max durations
- Recommended estimate (default: P95)

**Storage:**
- localStorage keyed by `service_generationType` (e.g., `map_text`, `statblock_image`)
- Stores last 100 records (configurable)
- Persists across page refreshes

**Usage in Demo Pages:**
1. Include `useGenerationTimeTracking` hook
2. Track generation start time with `performance.now()`
3. Record duration on completion using `recordDuration(duration)`
4. Display stats in a separate "Generation Times" tab
5. Use `recommendedEstimatedMs` to update `progressConfig.estimatedDurationMs`

**Example Stats Panel:**
```typescript
function GenerationTimeStatsPanel({ textStats, imageStats }) {
  return (
    <Stack gap="md">
      {textStats.stats && (
        <Paper p="md" withBorder>
          <Title order={5}>Text Generation</Title>
          <Badge color="green">
            Recommended: {Math.round(textStats.recommendedEstimatedMs)}ms
          </Badge>
          <Text>Mean: {Math.round(textStats.stats.meanMs)}ms</Text>
          <Text>P95: {Math.round(textStats.stats.p95Ms)}ms</Text>
        </Paper>
      )}
    </Stack>
  );
}
```

**Key Insight:** Demo pages should track generation times automatically and use the statistics to progressively improve progress bar timing. No more hardcoded estimates!

---

## Anti-Patterns to Avoid

### ❌ Anti-Pattern 1: No Checklist

**Problem:** Testing without a checklist leads to missed edge cases and forgotten features.

**Solution:** Always include a categorized checklist with localStorage persistence.

---

### ❌ Anti-Pattern 2: Skipping Demo Page

**Problem:** Integrating directly into production catches bugs late, requires more debugging.

**Solution:** Build demo page first, even for "simple" features. ROI is always positive.

---

### ❌ Anti-Pattern 3: Not Using Provider

**Problem:** Testing components without provider doesn't catch state management issues.

**Solution:** Always wrap demo content with service provider, match production structure.

---

### ❌ Anti-Pattern 4: Hardcoding Test Data

**Problem:** Hardcoded data doesn't exercise real data flows.

**Solution:** Use real API endpoints with mock data OR use demo endpoints that return realistic data.

---

### ❌ Anti-Pattern 5: No State Viewer

**Problem:** Debugging state issues requires console logs and guesswork.

**Solution:** Include state viewer for complex features, especially with multiple providers or derived state.

---

## Template Usage

### Step 1: Copy Template

```bash
cp Docs/Templates/DEMO_PAGE_TEMPLATE.tsx LandingPage/src/pages/[Service]Demo.tsx
```

### Step 2: Replace Placeholders

- `[Service Name]` → Your service name
- `[serviceName]` → camelCase service name
- `[service-id]` → kebab-case service ID
- `[Service]` → PascalCase component/service name
- `[route-path]` → Route path for the demo page

### Step 3: Implement TODOs

1. **Import your service provider and hooks**
2. **Add checklist items** (categorized by feature area)
3. **Implement StateViewer** (extract relevant state)
4. **Implement DemoHeader** (wire up UnifiedHeader with real hooks)
5. **Implement demo content** (add your service content component)

### Step 4: Add Route

```typescript
// LandingPage/src/App.tsx or routing config
<Route path="/[route-path]" element={<[Service]Demo />} />
```

### Step 5: Test Systematically

1. Go through checklist items one by one
2. Check items as you verify features
3. Use state viewer to debug issues
4. Update checklist as you discover edge cases

---

## Checklist Categories

Based on existing demo pages, common categories include:

- **Core Features** - Primary functionality
- **Generation Flow** - AI generation workflows
- **State Management** - State persistence, synchronization
- **UI Controls** - Interactive elements, toggles, inputs
- **Export/Import** - Data export, project loading
- **Navigation** - Drawer controls, tab switching
- **Accessibility** - Keyboard shortcuts, focus management
- **Error Handling** - Error states, validation
- **Integration** - Backend health, API calls

---

## Success Metrics

### You're Doing It Right When:
- ✅ Demo page catches bugs before production integration
- ✅ Checklist serves as both QA tool and documentation
- ✅ State viewer helps debug issues quickly
- ✅ Demo page matches production structure (provider, hooks)
- ✅ Console logs tell a clear story of what happened

### Warning Signs:
- ❌ Skipping demo page "because it's simple"
- ❌ Testing without a checklist
- ❌ Not using provider in demo
- ❌ Hardcoded data that doesn't match production
- ❌ No state viewer for complex features

---

## Related Documents

- **Template:** `Docs/Templates/DEMO_PAGE_TEMPLATE.tsx`
- **Development Workflow:** `.cursor/rules/development.mdc` (Phase 3.4: Demo Page First)
- **Reusable Engine Learnings:** `Docs/Learnings/LEARNINGS-Reusable-Engine-Development-2025.md`
- **Example Implementations:**
  - `LandingPage/src/pages/MapCanvasDemo.tsx`
  - `LandingPage/src/pages/GenerationDrawerDemo.tsx`

---

**Last Updated:** December 30, 2025  
**Status:** Template created, learnings documented
