# Phase 2: Handler Extraction & Joyride Integration

**Estimated Duration:** 3-4 hours  
**Goal:** Extract handlers from monolithic callback and integrate with Joyride

---

## 🎯 Overview

Phase 2 connects the chunk infrastructure (Phase 1) to the existing Joyride implementation in `TutorialTour.tsx`.

### What Needs to Happen
1. ✍️ Implement each chunk's `handlers` object with real logic
2. 🔌 Refactor `handleJoyrideCallback` to delegate to chunks
3. ✅ Test that behavior matches existing implementation
4. 🎨 No visual changes to user experience

### Result
- Main callback shrinks from 200+ lines to ~20 lines
- Each handler is ~20-50 lines (testable, maintainable)
- Existing Joyride behavior completely preserved

---

## 📍 Integration Points

### 1. Chunk Handler Implementation

Each chunk's `handlers` object needs implementation. Example:

```typescript
// Before: In TutorialTour.tsx handleJoyrideCallback
if (index === 0 && action === 'next') {
  // Welcome step logic
}

// After: In chunk definition
handlers: {
  [TUTORIAL_STEP_NAMES.WELCOME]: async (data: CallBackProps) => {
    if (data.action === 'next') {
      console.log('Moving to drawer step');
      // Any setup needed for next step happens here
    }
  }
}
```

### 2. Main Callback Refactoring

Replace the giant if/else chain with delegation:

```typescript
// OLD (200+ lines)
const handleJoyrideCallback = (data: CallBackProps) => {
  const { status, index, action } = data;
  
  if (index === 0 && action === 'next') { ... }
  else if (index === 1 && action === 'next') { ... }
  // ... repeat 15 more times
};

// NEW (20 lines)
const handleJoyrideCallback = async (data: CallBackProps) => {
  const { status, action } = data;
  
  // Check for completion first
  if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
    setRun(false);
    setStepIndex(0);
    // ... cleanup logic
    return;
  }
  
  // Delegate to chunk
  const currentChunk = getCurrentChunk(stepIndex, steps);
  const stepName = getStepName(stepIndex);
  
  if (currentChunk?.handlers[stepName]) {
    await currentChunk.handlers[stepName](data);
  }
};
```

---

## 🔧 Implementation Checklist

### Part 1: Add Imports to TutorialTour.tsx

```typescript
// Add these imports at the top
import {
  getCurrentChunk,
  getCurrentStepName,
} from './tutorial/utils/chunkUtilities';
import { getStepName } from './constants/tutorialSteps';
```

### Part 2: Implement Each Chunk's Handlers

Start with WELCOME chunk:

```typescript
// In welcome.ts
handlers: {
  [TUTORIAL_STEP_NAMES.WELCOME]: async (data: CallBackProps) => {
    if (data.action === 'next') {
      console.log('📍 WELCOME step, user clicked next');
      // WELCOME step just shows message, no action needed
    }
  },
  
  [TUTORIAL_STEP_NAMES.DRAWER]: async (data: CallBackProps) => {
    if (data.action === 'next') {
      console.log('📍 Opening drawer');
      // Need callback from TutorialTour to handle this
      // This will be wired up in TutorialTour refactoring
    }
  }
}
```

### Part 3: Refactor Main Callback

```typescript
const handleJoyrideCallback = async (data: CallBackProps) => {
  const { status, action, index, type } = data;
  const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];
  
  // Handle completion
  if (finishedStatuses.includes(status)) {
    setRun(false);
    setStepIndex(0);
    // ... existing cleanup logic
    return;
  }
  
  // New: Delegate to chunk
  const currentChunk = getCurrentChunk(stepIndex, steps);
  const stepName = getStepName(stepIndex);
  
  if (currentChunk && stepName && currentChunk.handlers[stepName]) {
    try {
      await currentChunk.handlers[stepName](data);
    } catch (error) {
      console.error(`❌ Handler error in ${currentChunk.name}:`, error);
    }
  }
};
```

---

## 🔗 Connecting Callbacks

The chunk handlers need access to callback functions from TutorialTour. This will be handled through closure/params.

### Option 1: Closure Pattern (Recommended)
```typescript
// In TutorialTour, create handler wrapper
const createChunkHandlers = (callbacks: {
  onOpenGenerationDrawer: () => void;
  onCloseGenerationDrawer: () => void;
  // ... other callbacks
}) => {
  return {
    [TUTORIAL_STEP_NAMES.DRAWER]: async (data: CallBackProps) => {
      if (data.action === 'next') {
        callbacks.onOpenGenerationDrawer();
      }
    },
    // ... other handlers
  };
};
```

### Option 2: Dependency Injection
```typescript
// Pass callbacks when setting up chunks
const setupChunks = (callbacks: TutorialCallbacks) => {
  // Each chunk handler can access callbacks
};
```

---

## 📋 Handler Implementation Order

### Recommended Order (Dependencies)
1. **WELCOME** - Simplest, no complex state
2. **TEXT_GENERATION** - Builds on WELCOME state
3. **EDITING** - Builds on TEXT_GENERATION state
4. **IMAGE_GENERATION** - Complex, but independent logic
5. **COMPLETION** - Final cleanup

### Estimated Time Per Chunk
- WELCOME: 20 minutes
- TEXT_GENERATION: 45 minutes
- EDITING: 30 minutes
- IMAGE_GENERATION: 60 minutes
- COMPLETION: 15 minutes
- Main callback refactoring: 45 minutes
- Testing & debugging: 30 minutes

**Total:** ~3.5 hours

---

## 🧪 Testing During Implementation

### Unit Test Each Handler
```typescript
describe('WELCOME chunk handlers', () => {
  it('should handle WELCOME step next action', async () => {
    const mockData: Partial<CallBackProps> = {
      action: 'next',
      index: 0,
    };
    
    await WELCOME_CHUNK.handlers[TUTORIAL_STEP_NAMES.WELCOME](
      mockData as CallBackProps
    );
    
    // Verify expected side effect (logged, callback called, etc.)
  });
});
```

### Integration Test Callback Integration
```typescript
it('should call onOpenGenerationDrawer on DRAWER handler', async () => {
  const mockCallback = jest.fn();
  const data: Partial<CallBackProps> = { action: 'next' };
  
  // Call handler (will need to inject callback somehow)
  
  expect(mockCallback).toHaveBeenCalled();
});
```

---

## ⚠️ Common Pitfalls

### 1. Async/Await Issues
**Problem:** Handlers are async but Joyride callback might not await  
**Solution:** Make callback async, await chunk handler calls

```typescript
const handleJoyrideCallback = async (data: CallBackProps) => {
  // async keyword allows awaiting
  await currentChunk?.handlers[stepName]?.(data);
};
```

### 2. Closure Variable Scoping
**Problem:** `stepIndex` might change during async operations  
**Solution:** Use the index from CallBackProps instead

```typescript
// ❌ Bad: stepIndex changes
const stepName = getStepName(stepIndex);

// ✅ Good: Use stable index from data
const stepName = getStepName(data.index);
```

### 3. Callback Timing
**Problem:** Need to wait for DOM updates before proceeding  
**Solution:** Use timeouts or event listeners

```typescript
// Some handlers need to wait
await new Promise(resolve => setTimeout(resolve, 100));
```

### 4. State Consistency
**Problem:** React state updates are async  
**Solution:** Use refs for immediate values if needed

```typescript
const isTypingDemoTriggeredRef = useRef(false);

// Later in handler
if (data.action === 'next' && !isTypingDemoTriggeredRef.current) {
  isTypingDemoTriggeredRef.current = true;
  // Do something
}
```

---

## 📊 Validation Checklist

Before finishing Phase 2:

- [ ] All 5 chunks have handlers implemented
- [ ] Main callback delegates to chunks
- [ ] No behavior change vs. current implementation
- [ ] Console logs match existing pattern
- [ ] 0 linter errors
- [ ] All tests passing
- [ ] Manual tutorial test passes:
  - [ ] Welcome step shows correctly
  - [ ] Drawer opens
  - [ ] Form auto-fills
  - [ ] Generation triggers
  - [ ] Edit mode works
  - [ ] Image generation flow works
  - [ ] Completion message shows
- [ ] No memory leaks (check with React DevTools)
- [ ] Performance is acceptable

---

## 📖 Reference: Current Handler Logic

These are the patterns from TutorialTour.tsx that need extraction:

### Typing Demo
```typescript
if (isTypingDemoTriggered) return;
setIsTypingDemoTriggered(true);
await onSimulateTyping?.('[selector]', 'text');
await onTutorialCheckbox?.('[selector]');
```

### Generation Demo
```typescript
if (isGenerationDemoTriggered) return;
setIsGenerationDemoTriggered(true);
await onTutorialClickButton?.('[selector]');
// Wait for generation
```

### Edit Mode Demo
```typescript
if (isEditDemoTriggered) return;
setIsEditDemoTriggered(true);
onToggleEditMode?.(true);
// Wait for toggle
await onTutorialEditText?.('[selector]', 'new text');
onToggleEditMode?.(false);
```

### Image Generation
```typescript
// Open drawer and switch tabs
onOpenGenerationDrawer?.();
onSwitchDrawerTab?.('image');
// Trigger generation
await onTutorialClickButton?.('[generate-button]');
// Select image
await onTutorialClickButton?.('[image-selector]');
```

---

## 🚀 Getting Started

### Step 1: Open Files
1. `LandingPage/src/components/StatBlockGenerator/TutorialTour.tsx` - Current implementation
2. `LandingPage/src/tutorial/chunks/welcome.ts` - First chunk to implement

### Step 2: Extract First Handler
Copy logic from TutorialTour.tsx for WELCOME steps and paste into welcome.ts handlers

### Step 3: Wire Up Callbacks
Determine how to pass callbacks (onOpenGenerationDrawer, etc.) to handlers

### Step 4: Refactor Main Callback
Replace if/else chain with chunk delegation

### Step 5: Test
Run full tutorial, verify all steps work

---

## 📞 Integration Pattern

The final TutorialTour.tsx will look like:

```typescript
// Setup chunks with callbacks
const setupTutorialChunks = () => {
  // Each chunk handler can access these callbacks
  const callbacks = {
    onOpenGenerationDrawer,
    onCloseGenerationDrawer,
    onToggleEditMode,
    onSimulateTyping,
    onTutorialCheckbox,
    onTutorialClickButton,
    onTutorialEditText,
    onSwitchDrawerTab,
    onSwitchImageTab,
    onSetGenerationCompleteCallback,
    onSetMockAuthState,
  };
  
  // Return configured chunks (TODO: decide on pattern)
};

// Main callback becomes simple
const handleJoyrideCallback = async (data: CallBackProps) => {
  // Completion check
  // Chunk delegation
  // That's it!
};
```

---

## ✅ Success Criteria for Phase 2

1. **Code Reduction**
   - Main callback: 200+ lines → 20-30 lines ✅
   - Handlers: <50 lines each ✅

2. **Behavior**
   - All existing behavior preserved ✅
   - No visual changes ✅
   - Same console logs (for debugging) ✅

3. **Quality**
   - 0 linter errors ✅
   - Type safety maintained ✅
   - All tests passing ✅

4. **Performance**
   - No degradation vs. current ✅
   - Smooth step transitions ✅
   - No memory leaks ✅

---

**Phase 2 is the "integration phase" - combining Phase 1 infrastructure with existing Joyride logic.**

Ready to implement? Start with WELCOME chunk in `LandingPage/src/tutorial/chunks/welcome.ts`!
