# TDD Quick Start - Implementing with Tests

**This guide shows how to use tests to implement Phase 2 handlers.**

---

## 🚀 Quick Overview

You have 130+ tests that specify exactly what code should do.

**The workflow:**
```
Read Test → Implement Code → Run Test → ✅ Passing
```

---

## 📖 Read the Test First

Tests tell you **what to build**:

```typescript
// From chunkExecution.test.ts - tells you what WELCOME chunk should do
describe('Setup phase', () => {
  it('should call setup before executing chunk', async () => {
    const setupSpy = jest.spyOn(WELCOME_CHUNK, 'setup');
    
    await executor.runSetup(WELCOME_CHUNK);
    
    expect(setupSpy).toHaveBeenCalled();  // TEST EXPECTS THIS
  });
});
```

**This test says:** "WELCOME_CHUNK.setup() must be callable and execute"

---

## 💻 Implement to Make Test Pass

Make the test happy:

```typescript
// In welcome.ts
export const WELCOME_CHUNK: TutorialChunk = {
  // ...
  setup: async () => {
    console.log('🔧 WELCOME chunk setup started');  // Makes test pass!
  },
  // ...
};
```

**The test** `jest.spyOn(WELCOME_CHUNK, 'setup')` will track that setup was called ✅

---

## ✅ Run the Test

Verify it passes:

```bash
npm test -- chunkExecution.test.ts
```

**Result:**
```
PASS  src/tutorial/__tests__/chunkExecution.test.ts
  Chunk Execution Lifecycle
    Setup phase
      ✓ should call setup before executing chunk
```

**Green test = correct implementation!** ✅

---

## 🔄 Repeat for Next Feature

Next test might say: "Handlers should execute when called"

```typescript
it('should execute handler for specific step', async () => {
  const mockData: Partial<CallBackProps> = { action: 'next' };
  
  await executor.runHandler(
    WELCOME_CHUNK,
    TUTORIAL_STEP_NAMES.WELCOME,
    mockData as CallBackProps
  );

  expect(executor.getHandlersExecuted()).toContain(TUTORIAL_STEP_NAMES.WELCOME);
});
```

**This requires:** handlers object with WELCOME step

```typescript
handlers: {
  [TUTORIAL_STEP_NAMES.WELCOME]: async (data) => {
    // Handler implementation - test calls this!
  }
}
```

Run test → ✅ Passes

---

## 🎯 Phase 2 Implementation Sequence

### 1. Start with WELCOME_CHUNK (simplest)

```bash
# Read these tests to understand what to build
- chunkExecution.test.ts (Lifecycle)
- stateManagement.test.ts (State requirements)
- handlerIntegration.test.ts (Callbacks)

# Implement WELCOME_CHUNK handlers
# Run tests after each handler

npm test -- chunkExecution.test.ts
npm test -- stateManagement.test.ts
npm test -- handlerIntegration.test.ts
```

When all WELCOME tests ✅ pass, move to TEXT_GENERATION_CHUNK

### 2. TEXT_GENERATION_CHUNK (more complex)

Same process:
1. Read tests
2. Implement handlers
3. Run tests
4. All green? → Next chunk

### 3. Repeat for EDITING, IMAGE_GENERATION, COMPLETION

### 4. Wire Up TutorialTour.tsx

When all chunk handlers are done:
- Import chunks and utilities
- Refactor main callback to delegate
- All 130+ tests pass

---

## 📝 Example: Implementing TEXT_TAB Handler

### Step 1: Read What Test Expects

```typescript
// From handlerIntegration.test.ts
it('should handle typing demo sequence', async () => {
  const mockData: CallBackProps = { ... };

  const textTabHandler = async (data: CallBackProps) => {
    if (data.action === 'next') {
      // Auto-fill form
      await callbacks.onSimulateTyping(
        '[data-tutorial="creature-description"]',
        'A mystical creature...'
      );
      
      // Check checkboxes
      await callbacks.onTutorialCheckbox('[data-tutorial="legendary-actions"]');
      await callbacks.onTutorialCheckbox('[data-tutorial="lair-actions"]');
      await callbacks.onTutorialCheckbox('[data-tutorial="spellcasting"]');
    }
  };

  await textTabHandler(mockData);
  
  expect(callbacks.onSimulateTyping).toHaveBeenCalled();  // TEST EXPECTS THIS
  expect(callbacks.onTutorialCheckbox).toHaveBeenCalledTimes(3);  // AND THIS
});
```

### Step 2: Implement Handler

```typescript
// In textGeneration.ts
handlers: {
  [TUTORIAL_STEP_NAMES.TEXT_TAB]: async (data: CallBackProps) => {
    if (data.action === 'next') {
      // Callbacks will be provided by TutorialTour.tsx wrapper
      // For now, just implement the logic
      
      console.log('📍 TEXT_TAB: Auto-filling form');
      
      // When integrated, this will call callbacks:
      // await callbacks.onSimulateTyping(...);
      // await callbacks.onTutorialCheckbox(...);
    }
  }
}
```

### Step 3: Run Tests

```bash
npm test -- handlerIntegration.test.ts
```

Expected result:
- Some tests pass (basic tests)
- Some tests fail (need callback integration)

That's OK! Tests guide you step-by-step.

---

## 🧠 TDD Mindset

### Tests are the Spec

Instead of guessing "what should the handler do?", **the test tells you:**
- What parameters it receives
- What it should do with those parameters  
- What callbacks to invoke
- What result is expected

### Green Tests = Correct Code

When test passes ✅, you know:
- The function was called
- It received right parameters
- It executed correctly
- It produced expected result

### Each Test is a Contract

Test says: "If you do this, then that should happen"

You implement code that honors that contract.

---

## 📊 Using Test Output

### When Test Passes ✅
```
PASS  src/tutorial/__tests__/chunkExecution.test.ts
  Chunk Execution Lifecycle
    Handler execution
      ✓ should execute handler for specific step (45ms)
      ✓ should execute correct handler for each step (32ms)
      ✓ should handle handler with action=next (28ms)

Test Suites: 1 passed, 1 total
Tests:       3 passed, 3 total
```

**Great!** Move to next test

### When Test Fails ❌
```
FAIL  src/tutorial/__tests__/chunkExecution.test.ts
  Chunk Execution Lifecycle
    Handler execution
      ✗ should execute handler for specific step
        
        Expected: 'WELCOME' to be in ['TEXT_TAB', 'CANVAS']
        
        Received: ['TEXT_TAB', 'CANVAS']
```

**Test shows:** Handler didn't execute for WELCOME step

**Fix:** Implement the WELCOME handler

---

## 💡 Pro Tips

### Tip 1: Run One Test at a Time
```bash
# Instead of running all tests, focus on one
npm test -- -t "should execute handler for specific step"
```

This isolates your work and gives faster feedback.

### Tip 2: Watch Mode
```bash
npm test -- --watch src/tutorial/__tests__/
```

Tests auto-run when you save files. Instant feedback!

### Tip 3: Read the Entire Test Suite
Before implementing, read all tests for that chunk:

```typescript
describe('TEXT_GENERATION chunk handlers', () => {
  // Read ALL tests here to understand full scope
});
```

Then implement to make them all pass.

### Tip 4: Comment Out Callbacks for Now
While implementing logic (not callbacks):

```typescript
handlers: {
  [TUTORIAL_STEP_NAMES.TEXT_TAB]: async (data) => {
    if (data.action === 'next') {
      // TODO: Call callbacks later
      // callbacks.onSimulateTyping(...);
      
      // Implement the logic first
      console.log('Doing text generation steps...');
    }
  }
}
```

### Tip 5: Implement in Order
1. Chunk setup logic
2. Handler logic
3. Callback integration (when wiring TutorialTour)
4. Cleanup logic

Tests guide this order!

---

## 🎯 Success Checklist

### For Each Chunk:
- [ ] Read all 3 test suites (execution, state, integration)
- [ ] Implement setup() method
- [ ] Implement all handlers
- [ ] Implement cleanup() method
- [ ] Run chunkExecution.test.ts → all green ✅
- [ ] Run stateManagement.test.ts → all green ✅
- [ ] Run handlerIntegration.test.ts → all green ✅
- [ ] Move to next chunk

### For Phase 2 Complete:
- [ ] All 5 chunks have passing tests
- [ ] chunkInfrastructure.test.ts still passing ✅
- [ ] 130+ tests all passing ✅
- [ ] Ready to integrate with TutorialTour.tsx

---

## 📞 Test-Driven Workflow Summary

```
START
  ↓
Read Test ← Tells you what to implement
  ↓
Implement Code ← Make test pass
  ↓
Run Test ← Verify it works
  ↓
✅ Green? → YES → Next Test
  ↓ NO
  ↓
Fix Code ← Debug and fix
  ↓
Run Test ← Try again
  ↓
Loop until ✅ green
  ↓
REPEAT for next chunk
  ↓
DONE when all 130+ tests passing
```

---

## 🚀 You're Ready!

You have:
- ✅ Clear specs (tests)
- ✅ Implementation guide (test details)
- ✅ Verification method (run tests)

**Just follow the tests, one by one, and you'll build the entire Phase 2.**

**Good luck! 🎉**

