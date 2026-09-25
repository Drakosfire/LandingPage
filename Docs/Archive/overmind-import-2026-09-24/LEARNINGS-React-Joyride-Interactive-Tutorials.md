> **Historical import from DungeonOverMind — 2026-09-24.** This document records an older DungeonMind Web/product implementation state. It is not current LandingPage architecture or sequencing authority. Re-anchor against current code before applying it.

# React Joyride Interactive Tutorials: Learnings & Patterns

**Project:** DungeonMind StatblockGenerator Tutorial  
**Library:** react-joyride v2.x  
**Timeline:** October 2025  
**Status:** Production-Ready  
**Purpose:** Comprehensive guide to creating sophisticated interactive tutorials with react-joyride

---

## 🎯 Executive Summary

Building an interactive tutorial is more than just pointing at UI elements. This document captures the hard-won patterns, anti-patterns, and best practices discovered while building a production-grade tutorial system with:

- **Auto-animations** (typing, clicking, checking boxes)
- **State management** across tutorial steps
- **Cost protection** (preventing real API calls)
- **User flow control** (manual vs automated progression)
- **Cross-session persistence** (cookie-based completion tracking)

### Key Achievements

- ✅ 13-step interactive tutorial with smart drawer automation
- ✅ Auto-animation system (typing, clicking, form manipulation)
- ✅ Zero API costs during tutorial (guards prevent real calls)
- ✅ Smooth user experience (pause/resume, skip, restart)
- ✅ Guest vs logged-in user flow handling
- ✅ 30-day completion tracking via cookies

---

## 📐 Core Architecture Patterns

### Pattern 1: Tutorial Mode Flag Propagation

**Problem:** Tutorial actions shouldn't trigger real API calls or modify production data.

**Solution:** Flow a `isTutorialMode` flag through the entire call stack.

```typescript
// 1. Tutorial trigger opens drawer WITH flag
const startTutorial = () => {
    openGenerationDrawer({ isTutorialMode: true });
};

// 2. Provider stores flag in drawer state
interface GenerationDrawerState {
    opened: boolean;
    isTutorialMode?: boolean;
}

// 3. Drawer passes flag to child components
<GenerationDrawer 
    opened={drawerState.opened}
    isTutorialMode={drawerState.isTutorialMode}
/>

// 4. Child component guards expensive operations
const handleGenerateCreature = async () => {
    if (isTutorialMode) {
        console.log('🎓 Tutorial mode - skipping real API call');
        // Load demo data instead
        loadDemoStatblock(HERMIONE_DEMO_STATBLOCK);
        onGenerationComplete?.();
        return;
    }
    
    // Real generation with OpenAI
    const result = await fetch('/api/generate-statblock', {...});
};
```

**Key Benefits:**
- ✅ No accidental API costs during tutorial
- ✅ Fast demo experience (instant, no latency)
- ✅ Consistent behavior (same demo every time)
- ✅ Clear separation of tutorial vs production code paths

---

### Pattern 2: First-Time User Detection (Triple Check)

**Problem:** Tutorial should auto-start for new users but not for returning users, and new users should see a blank canvas.

**Solution:** Check tutorial completion cookie in THREE strategic places.

```typescript
import Cookies from 'js-cookie';

// Cookie management
const TUTORIAL_COOKIE_KEY = 'statblock_tutorial_completed';
const TUTORIAL_VERSION = 'v1'; // Increment to re-show after updates

export const tutorialCookies = {
    hasCompletedTutorial(): boolean {
        return Cookies.get(TUTORIAL_COOKIE_KEY) === TUTORIAL_VERSION;
    },
    
    markTutorialCompleted(): void {
        Cookies.set(TUTORIAL_COOKIE_KEY, TUTORIAL_VERSION, { expires: 30 });
    },
    
    resetTutorial(): void {
        Cookies.remove(TUTORIAL_COOKIE_KEY);
    },
};

// CHECK 1: Skip localStorage restore for first-time users
const getInitialState = () => {
    if (!tutorialCookies.hasCompletedTutorial()) {
        console.log('🎓 First-time user - skipping localStorage restore');
        return null; // Force fresh start
    }
    
    // Returning users get their saved state
    const saved = localStorage.getItem('app_state');
    return saved ? JSON.parse(saved) : null;
};

// CHECK 2: Initialize with empty state for first-time users
const [creatureDetails, setCreatureDetails] = useState(() => {
    if (!tutorialCookies.hasCompletedTutorial()) {
        console.log('🎓 First-time user - starting with blank canvas');
        return EMPTY_STATBLOCK; // Blank canvas
    }
    
    // Returning users might get a demo
    const restored = getInitialState();
    return restored || getRandomDemoStatblock();
});

// CHECK 3: Don't auto-load demo for first-time users
useEffect(() => {
    if (!tutorialCookies.hasCompletedTutorial()) {
        console.log('🎓 First-time user - let tutorial control state');
        return; // Tutorial will load demo at appropriate step
    }
    
    // Returning users without saved state get demo
    if (!hasExistingState) {
        loadDemoStatblock();
    }
}, []);

// CHECK 4: Auto-start tutorial after delay
useEffect(() => {
    const hasCompleted = tutorialCookies.hasCompletedTutorial();
    
    if (!hasCompleted) {
        const timer = setTimeout(() => {
            console.log('🎓 Auto-starting tutorial for first-time user');
            setRunTutorial(true);
        }, 1500); // 1.5s delay to let page settle
        
        return () => clearTimeout(timer);
    }
}, []);
```

**Key Benefits:**
- ✅ New users see blank canvas → tutorial shows them how to create
- ✅ Returning users see their saved work or demo
- ✅ Tutorial auto-starts for new users after brief delay
- ✅ No confusion from pre-loaded content

---

### Pattern 3: useState vs useRef for Guard Flags

**Problem:** React's `useState` is asynchronous. When you set a state variable and immediately trigger a callback, the callback sees the OLD value, causing race conditions.

**Example of the Problem:**
```typescript
// ❌ BROKEN: useState is async
const [justAdvancedToStep4, setJustAdvancedToStep4] = useState(false);

const advanceToStep4 = () => {
    setJustAdvancedToStep4(true);  // Schedules update (async)
    setStepIndex(4);                // Triggers callback
    setRun(true);                   // Callback executes NOW
};

// Callback handler (fires BEFORE state updates)
const handleCallback = (data) => {
    if (data.index === 4 && data.action === 'next') {
        // justAdvancedToStep4 is STILL false here! ❌
        console.log(justAdvancedToStep4); // false (OLD value)
        
        if (!justAdvancedToStep4) {
            // This runs even though we just set it to true!
            advanceAgain(); // ❌ Unwanted double-advance
        }
    }
};
```

**Solution:** Use `useRef` for synchronous guard flags.

```typescript
// ✅ FIXED: useRef updates immediately
const justAdvancedToStep4Ref = useRef(false);

const advanceToStep4 = () => {
    justAdvancedToStep4Ref.current = true;  // Updates immediately (sync)
    console.log('🚩 Set guard flag = true');
    setStepIndex(4);                         // Triggers callback
    setRun(true);                            // Callback executes NOW
};

// Callback handler (sees updated ref immediately)
const handleCallback = (data) => {
    if (data.index === 4 && data.action === 'next') {
        console.log('🔍 Guard flag:', justAdvancedToStep4Ref.current);
        
        if (justAdvancedToStep4Ref.current) {
            console.log('⏭️ Just advanced programmatically, ignoring callback');
            return; // ✅ Correctly prevents double-advance
        }
        
        // User manually clicked Next - proceed
        advanceToNextStep();
    }
};

// Clear guard flag after step renders (use useEffect)
useEffect(() => {
    if (stepIndex === 4 && justAdvancedToStep4Ref.current) {
        console.log('⏰ Step 4 rendered, clearing guard flag after 200ms');
        const timer = setTimeout(() => {
            justAdvancedToStep4Ref.current = false;
            console.log('✅ Guard flag cleared, ready for user interaction');
        }, 200);
        return () => clearTimeout(timer);
    }
}, [stepIndex]);
```

**When to Use Each:**

| Situation | Use | Reason |
|-----------|-----|--------|
| Need re-renders on change | `useState` | React needs to update UI |
| Guard flag for callbacks | `useRef` | Callback needs immediate value |
| Animation in progress | `useRef` | Prevents re-triggering |
| Counter/tracker (no UI) | `useRef` | No re-render needed |
| Form input (controlled) | `useState` | UI must reflect value |

---

### Pattern 4: Auto-Trigger Animation System

**Problem:** Tutorial steps should demonstrate actions automatically (typing, clicking, checking) rather than requiring user to perform them.

**Solution:** Use `useEffect` hooks that watch `stepIndex` and trigger animations after a delay.

#### The Auto-Trigger Pattern

```typescript
// 1. Add state flag to track if animation has run
const [isAnimationTriggered, setIsAnimationTriggered] = useState(false);

// 2. Create useEffect that watches stepIndex
useEffect(() => {
    // Guard: Only trigger if we're on target step, tutorial is running, and not already triggered
    if (stepIndex === TARGET_STEP && run && !isAnimationTriggered) {
        console.log('🎯 [Tutorial] Step X loaded, auto-triggering animation in 1.5s');
        
        const animationTimer = setTimeout(async () => {
            setIsAnimationTriggered(true); // Mark as triggered
            setRun(false); // Disable Next button during animation
            console.log('🎬 [Tutorial] Auto-starting animation');
            
            try {
                // Run animation
                if (onAnimationCallback) {
                    await onAnimationCallback(/* params */);
                    console.log('✅ [Tutorial] Animation complete');
                }
            } catch (error) {
                console.error('❌ [Tutorial] Animation error:', error);
            } finally {
                // Re-enable Next button
                setRun(true);
            }
        }, 1500); // Delay for user to read step

        // Cleanup
        return () => clearTimeout(animationTimer);
    }
}, [stepIndex, run, isAnimationTriggered, onAnimationCallback]);

// 3. Reset flag when tutorial starts/restarts
useEffect(() => {
    if (forceRun) {
        setIsAnimationTriggered(false); // Reset flag
        setRun(true);
    }
}, [forceRun]);

// 4. Reset flag on completion/close
const handleCallback = (data) => {
    const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];
    
    if (finishedStatuses.includes(data.status)) {
        setIsAnimationTriggered(false); // Reset for next tutorial run
        setRun(false);
        tutorialCookies.markTutorialCompleted();
        onComplete?.();
    }
};
```

#### Auto-Trigger Checklist

When implementing a new auto-animation:

- [ ] **State Flag**: Create `is[Animation]Triggered` state (starts as `false`)
- [ ] **useEffect Hook**: Watch `stepIndex`, `run`, and the flag
- [ ] **Target Check**: `if (stepIndex === X && run && !isAnimationTriggered)`
- [ ] **Delay Timer**: Use `setTimeout` with appropriate delay (1000-2000ms)
- [ ] **Set Flag**: `setIsAnimationTriggered(true)` immediately in timer
- [ ] **Disable Next**: `setRun(false)` to lock button during animation
- [ ] **Run Animation**: `await onAnimationCallback(...)` with try/catch
- [ ] **Re-enable**: `setRun(true)` after animation completes
- [ ] **Cleanup**: `return () => clearTimeout(animationTimer)`
- [ ] **Reset on Start**: Reset flag in tutorial start useEffect
- [ ] **Reset on Complete**: Reset flag in completion/close handlers

---

### Pattern 5: Sequential Animation Chaining

**Problem:** Tutorial needs to perform multiple animations in sequence (type text → check boxes → click button) at a single step.

**Solution:** Chain animations with `async/await` and pause tutorial during the sequence.

```typescript
// When user clicks "Next" on step 2, trigger BOTH typing + checkbox animations
if (index === 2 && action === 'next' && type === 'step:after') {
    console.log('📝 [Tutorial] Triggering typing + checkbox demos');
    setRun(false); // Pause tour during animations

    // Run animations sequentially
    (async () => {
        try {
            // Mark both as triggered to prevent useEffects from firing
            setIsTypingDemoTriggered(true);
            setIsCheckboxDemoTriggered(true);

            // 1. Type description
            if (onSimulateTyping) {
                console.log('🎬 [Tutorial] Auto-typing description...');
                const description = 'A mystical storm grey British Shorthair cat...';
                await onSimulateTyping('[data-tutorial="text-generation-input"]', description);
                console.log('✅ [Tutorial] Typing complete');
            }

            // Small delay before checkboxes
            await new Promise(r => setTimeout(r, 500));

            // 2. Check all three boxes sequentially
            if (onTutorialCheckbox) {
                console.log('🎬 [Tutorial] Auto-checking boxes...');

                await onTutorialCheckbox('[data-tutorial="legendary-checkbox"]');
                await new Promise(r => setTimeout(r, 400));

                await onTutorialCheckbox('[data-tutorial="lair-checkbox"]');
                await new Promise(r => setTimeout(r, 400));

                await onTutorialCheckbox('[data-tutorial="spellcasting-checkbox"]');
                await new Promise(r => setTimeout(r, 400));

                console.log('✅ [Tutorial] All boxes checked');
            }

            // 3. Move to generate button step (step 3)
            console.log('➡️ [Tutorial] Moving to generate button step');
            setStepIndex(3);
            setRun(true); // Resume tutorial
        } catch (error) {
            console.error('❌ [Tutorial] Animation error:', error);
            setStepIndex(3); // Move to next step even on error
            setRun(true);
        }
    })();
    return;
}
```

**Key Principles:**
- ✅ **Pause tutorial**: `setRun(false)` before starting animations
- ✅ **Sequential execution**: Use `await` between animations
- ✅ **Visible delays**: 400-500ms between actions (feels natural)
- ✅ **Resume tutorial**: `setRun(true)` after all animations complete
- ✅ **Error handling**: Move to next step even if animation fails
- ✅ **Set flags early**: Mark animations as triggered to prevent re-triggering

---

### Pattern 6: User-Controlled vs Auto-Triggered Steps

**Problem:** Some steps should auto-advance after animation, others should wait for user to click "Next".

**Discovery:** Auto-triggered steps feel rushed. User-controlled steps feel better for learning.

**Solution:** Let user click "Next" to trigger animations, don't auto-advance.

```typescript
// ❌ BAD: Auto-trigger after timeout
useEffect(() => {
    if (stepIndex === 3) {
        setTimeout(() => {
            triggerGeneration(); // Auto-fires without user input
        }, 1000);
    }
}, [stepIndex]);

// ✅ GOOD: Trigger on user click
const handleCallback = (data) => {
    // Wait for user to click "Next" on step 3
    if (data.index === 3 && data.action === 'next' && data.type === 'step:after') {
        console.log('➡️ [Tutorial] User clicked Next, triggering generation demo');
        setRun(false); // Pause for animation
        
        (async () => {
            if (onTutorialClickButton) {
                await onTutorialClickButton('[data-tutorial="generate-button"]');
                await new Promise(r => setTimeout(r, 2000)); // Simulate loading
                replaceCreatureDetails(DEMO_STATBLOCK);
                setStepIndex(4); // Advance to next step
                setRun(true); // Resume
            }
        })();
    }
};
```

**When to Use Each:**

| Step Type | Approach | User Experience |
|-----------|----------|-----------------|
| **Informational** | User-controlled | User reads, clicks Next when ready |
| **Demonstration** | User-triggered animation | User clicks Next → watches animation |
| **Long animation** | User-triggered | User controls when to proceed |
| **Quick highlight** | User-controlled | User just needs to see element |

**Key Insight:** Give user control over pacing. Tutorial should feel guided, not rushed.

---

## 🎬 Animation Implementation Patterns

### Animation 1: Typing Simulation

**Use Case:** Auto-fill a textarea with character-by-character typing effect.

```typescript
const handleTutorialSimulateTyping = async (targetSelector: string, text: string) => {
    console.log(`📝 [Tutorial Typing] Targeting: ${targetSelector}`);
    const element = document.querySelector(targetSelector) as HTMLTextAreaElement;
    
    if (!element) {
        console.error(`❌ [Tutorial Typing] Element not found: ${targetSelector}`);
        return;
    }
    
    // Focus and clear
    element.focus();
    element.value = '';
    
    // Type character by character
    for (let i = 0; i < text.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 50)); // 50ms per character
        element.value = text.substring(0, i + 1);
        
        // Dispatch events for React to detect change
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
    }
    
    // Wait before blurring (show complete text)
    await new Promise(resolve => setTimeout(resolve, 800));
    element.blur();
    
    console.log('✅ [Tutorial Typing] Complete');
};
```

**Key Details:**
- **50ms per character** - Natural typing speed
- **Dispatch both events** - `input` + `change` for React compatibility
- **800ms final delay** - Let user see completed text
- **Use `substring()`** - Builds string progressively (not `+=`)

---

### Animation 2: Checkbox Clicking

**Use Case:** Auto-check checkboxes with visual feedback.

```typescript
const handleTutorialCheckbox = async (selector: string) => {
    console.log(`☑️ [Tutorial Checkbox] Targeting: ${selector}`);
    const checkbox = document.querySelector(selector) as HTMLInputElement;
    
    if (!checkbox) {
        console.error(`❌ [Tutorial Checkbox] Not found: ${selector}`);
        return;
    }
    
    if (!checkbox.checked) {
        console.log('✅ [Tutorial Checkbox] Clicking checkbox');
        
        // Click to trigger Mantine/React handler
        checkbox.click();
        
        // Also dispatch change event for compatibility
        checkbox.dispatchEvent(new Event('change', { bubbles: true }));
        
        // Small delay for visual feedback
        await new Promise(resolve => setTimeout(resolve, 100));
    } else {
        console.log('⏭️ [Tutorial Checkbox] Already checked, skipping');
    }
};
```

**Key Details:**
- **Check current state** - Don't re-check already checked boxes
- **Use `.click()`** - Triggers UI library handlers (Mantine, Material-UI, etc.)
- **Also dispatch event** - Redundancy for compatibility
- **100ms delay** - Let checkbox animation play

---

### Animation 3: Button Clicking

**Use Case:** Auto-click a button with visual feedback.

```typescript
const handleTutorialClickButton = async (selector: string) => {
    console.log(`🖱️ [Tutorial Click] Targeting: ${selector}`);
    const button = document.querySelector(selector) as HTMLButtonElement;
    
    if (!button) {
        console.error(`❌ [Tutorial Click] Button not found: ${selector}`);
        return;
    }
    
    if (button.disabled) {
        console.error(`❌ [Tutorial Click] Button is disabled: ${selector}`);
        return;
    }
    
    console.log('✅ [Tutorial Click] Clicking button');
    button.click();
    
    // Small delay for visual feedback
    await new Promise(resolve => setTimeout(resolve, 100));
};
```

**Key Details:**
- **Check disabled state** - Don't click disabled buttons
- **Just use `.click()`** - Triggers all React handlers properly
- **100ms delay** - Let button animation play

---

### Animation 4: Text Editing (ContentEditable)

**Use Case:** Edit text in a `contentEditable` element with typing effect.

```typescript
const handleTutorialEditText = async (targetSelector: string, newText: string) => {
    console.log(`✍️ [Tutorial Edit] Targeting: ${targetSelector}`);
    
    // Find the parent container
    const container = document.querySelector(targetSelector);
    if (!container) {
        console.error(`❌ [Tutorial Edit] Container not found: ${targetSelector}`);
        return;
    }
    
    // Find contenteditable element inside
    const editableElement = container.querySelector('[contenteditable="true"]') as HTMLElement;
    if (!editableElement) {
        console.error(`❌ [Tutorial Edit] No contenteditable element found in ${targetSelector}`);
        return;
    }
    
    // Click to focus and enter edit mode
    console.log('🖱️ [Tutorial Edit] Clicking to focus');
    editableElement.click();
    editableElement.focus();
    await new Promise(r => setTimeout(r, 300)); // Wait for edit mode

    // Select all existing text
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(editableElement);
    selection?.removeAllRanges();
    selection?.addRange(range);
    await new Promise(r => setTimeout(r, 100));

    // Clear existing content
    editableElement.textContent = '';
    
    // Type new text character by character
    for (let i = 0; i < newText.length; i++) {
        await new Promise(r => setTimeout(r, 50)); // 50ms per character
        editableElement.textContent = newText.substring(0, i + 1);
        
        // Dispatch input event for React
        editableElement.dispatchEvent(new Event('input', { bubbles: true }));
    }
    
    // Wait to show result
    await new Promise(r => setTimeout(r, 300));
    
    // Blur to trigger save
    console.log('🔒 [Tutorial Edit] Blurring to save');
    editableElement.blur();
    
    console.log('✅ [Tutorial Edit] Complete');
};
```

**Key Details:**
- **Find nested element** - `contenteditable` might be child of target
- **Use Selection API** - Properly select all text before replacing
- **50ms per character** - Consistent with textarea typing speed
- **300ms "processing time"** - Let user see result before blur
- **Blur to save** - Triggers component's save handler

---

## 🎨 Joyride Integration Patterns

### Pattern 7: Drawer/Modal Step Coordination

**Problem:** Tutorial needs to open drawers/modals and highlight elements inside them, but Joyride can't target elements that don't exist yet.

**Solution:** Pause tutorial, open drawer, wait for element to render, then resume.

```typescript
const handleCallback = (data) => {
    // User clicked "Next" on generation button (step 0)
    if (data.index === 0 && data.action === 'next' && data.type === 'step:after') {
        setRun(false); // Pause the tour
        onOpenGenerationDrawer?.(); // Open drawer

        // Wait for drawer to open and element to be positioned
        const waitForElement = () => {
            const element = document.querySelector('[data-tutorial="generation-drawer-title"]');
            
            // Check element exists AND is properly positioned (not hidden)
            if (element && element.getBoundingClientRect().top > 0) {
                setStepIndex(1); // Move to drawer title step
                
                // Small additional delay before showing spotlight
                setTimeout(() => {
                    setRun(true); // Resume tour
                }, 100);
            } else {
                // Keep checking until element is properly positioned
                setTimeout(waitForElement, 50);
            }
        };

        // Start checking after initial animation delay
        setTimeout(waitForElement, 400);
        return;
    }
};
```

**Key Principles:**
- ✅ **Pause before opening** - `setRun(false)`
- ✅ **Poll for element** - Check existence + position in loop
- ✅ **Check position** - `getBoundingClientRect().top > 0` (not hidden/animating)
- ✅ **Initial delay** - 400ms for drawer open animation
- ✅ **Resume with delay** - 100ms buffer before spotlight appears
- ✅ **50ms poll interval** - Fast enough to feel instant, not CPU-intensive

---

### Pattern 8: Back Button Handling

**Problem:** User clicks "Back" button in tutorial - need to maintain proper state (close drawers, reset flags, etc.).

**Solution:** Handle `action === 'prev'` in callback with custom logic per step.

```typescript
const handleCallback = (data) => {
    if (data.action === 'prev') {
        // Step 1 → 0: Going back from drawer to generation button
        if (data.index === 1) {
            console.log('⬅️ [Tutorial] Back: closing drawer');
            onCloseGenerationDrawer?.();
        }
        
        // Step 2 → 1: Going back from text tab
        else if (data.index === 2) {
            console.log('⬅️ [Tutorial] Back: resetting typing/checkbox demos');
            setIsTypingDemoTriggered(false); // Allow re-trigger
            setIsCheckboxDemoTriggered(false);
        }
        
        // Step 4 → 3: Going back from canvas to generate button
        else if (data.index === 4) {
            console.log('⬅️ [Tutorial] Back: reopening drawer, resetting generation demo');
            setRun(false);
            setStepIndex(3); // Move to generate button
            setIsGenerationDemoTriggered(false); // Allow replay
            justAdvancedToStep4Ref.current = false; // Reset guard
            onOpenGenerationDrawer?.();

            // Wait for drawer to reopen before continuing
            const waitForDrawer = () => {
                const element = document.querySelector('[data-tutorial="generate-button"]');
                if (element && element.getBoundingClientRect().top > 0) {
                    setTimeout(() => setRun(true), 100);
                } else {
                    setTimeout(waitForDrawer, 50);
                }
            };
            setTimeout(waitForDrawer, 400);
            return;
        }
        
        // Step 7 → 6: Going back to creature name
        else if (data.index === 7) {
            console.log('⬅️ [Tutorial] Back: re-enabling edit mode');
            onToggleEditMode?.(true); // Turn edit mode back on
            setIsEditDemoTriggered(false); // Allow replay
        }
    }
    
    // Normal navigation for other steps
    if (data.type === 'step:after' && data.action === 'prev') {
        setStepIndex(data.index - 1);
    }
};
```

**Key Principles:**
- ✅ **Reset animation flags** - Allow replay when going back
- ✅ **Restore UI state** - Reopen drawers, toggle modes, etc.
- ✅ **Maintain flow** - User should be able to go back/forward smoothly
- ✅ **Guard flag handling** - Reset guards to prevent issues on replay

---

### Pattern 9: Conditional Steps (Guest vs Logged-In)

**Problem:** Some tutorial steps target elements that only exist for logged-in users (save button, projects, upload).

**Solution:** Filter steps dynamically and skip conditionally.

```typescript
const { isLoggedIn } = useAuth();

// Filter steps - remove elements that don't exist
const filterAvailableSteps = () => {
    // List of selectors that are conditionally rendered
    const conditionalSelectors = [
        '[data-tutorial="save-button"]',      // Only visible when logged in
        '[data-tutorial="projects-button"]',  // Only visible when logged in
    ];

    const availableSteps = tutorialSteps.filter(step => {
        const target = typeof step.target === 'string' ? step.target : '';
        if (!target) return true; // Keep steps without specific targets

        // Only check conditionally rendered elements
        if (!conditionalSelectors.includes(target)) {
            return true; // Keep all other steps
        }

        // For conditional elements, check if they exist
        const element = document.querySelector(target);
        const exists = element !== null;
        if (!exists) {
            console.log(`⏭️ Skipping step - element not available: ${target}`);
        }
        return exists;
    });

    console.log(`📋 Tutorial: ${availableSteps.length}/${tutorialSteps.length} steps available`);
    return availableSteps;
};

// Apply filter when starting tutorial
useEffect(() => {
    if (forceRun || (!hasCompleted && shouldAutoStart)) {
        const availableSteps = filterAvailableSteps();
        setSteps(availableSteps); // Use filtered steps
        setStepIndex(0);
        setRun(true);
    }
}, [forceRun, isLoggedIn]);

// Handle skip in callback
const handleCallback = (data) => {
    // When user clicks "Next" on step 8 (image generation tab)
    if (data.index === 8 && data.action === 'next' && data.type === 'step:after') {
        // GUEST USERS: Skip upload step (requires login)
        if (!isLoggedIn) {
            console.log('⏩ [Tutorial] Guest user - skipping upload step');
            setRun(false);

            (async () => {
                onCloseGenerationDrawer?.();
                await new Promise(r => setTimeout(r, 300));
                setStepIndex(10); // Skip to save button
                setRun(true);
            })();
            return;
        }

        // LOGGED-IN USERS: Show upload demonstration
        console.log('📤 [Tutorial] Logged-in user - showing image upload');
        // ... continue with upload step
    }
};
```

**Key Principles:**
- ✅ **Filter on startup** - Remove unavailable steps before starting
- ✅ **Check DOM** - Use `document.querySelector()` to verify existence
- ✅ **Skip in callback** - Jump over steps dynamically during tutorial
- ✅ **Update step content** - Clarify login requirements in tooltip text

---

## 🎯 Tutorial Step Design Best Practices

### Attribute Naming Convention

Use consistent `data-tutorial` attributes for targetable elements.

```tsx
// ✅ GOOD: Descriptive, kebab-case
<Button data-tutorial="generation-button">Generate</Button>
<Switch data-tutorial="edit-mode-toggle" />
<div data-tutorial="canvas-area" />
<Title data-tutorial="generation-drawer-title">AI Generation</Title>

// ❌ BAD: Generic, unclear, camelCase
<Button data-tour="btn1">Generate</Button>
<Switch id="toggleEditMode" />  // Don't use id
<div className="canvas" />       // Don't rely on classes
```

**Convention:**
- Use `data-tutorial="descriptive-name"` (kebab-case)
- Name reflects element purpose, not just type
- Unique per element (no duplicates)
- Stable (don't change with refactors)

---

### Step Content Guidelines

**Tooltip Content Structure:**
```typescript
{
    target: '[data-tutorial="element-id"]',
    content: '🎨 Short headline! Explanation of what this is or does. Optional: what will happen next.',
    placement: 'bottom',
    styles: {
        tooltip: {
            maxWidth: '340px',  // Readable line length
            marginTop: '10px',   // Breathing room
        },
    },
}
```

**Content Formula:**
1. **Emoji** - Visual anchor (🎨 🎲 📜 ✨ 🖼️)
2. **Short headline** - What is this? (5-10 words)
3. **Explanation** - What does it do? (1-2 sentences)
4. **Optional: Next action** - What will happen? (if auto-animation)

**Good Examples:**
```typescript
'👋 Welcome to StatBlock Generator! Click here to create your first creature using AI.'
'🎲 We\'ve entered a description! Now we\'ll click Generate to create Hermione.'
'📜 Here\'s Hermione! Your generated statblock appears here, fully formatted.'
```

**Bad Examples:**
```typescript
❌ 'This is the generation button. You can click it to generate a creature.'  // Too verbose
❌ 'Click here.'  // Too short, no context
❌ 'The AI uses OpenAI GPT-4 to analyze your description...'  // Too technical
```

---

### Step Placement Strategy

**Placement Options:**
- `'bottom'` - Default, works for most header buttons
- `'bottom-start'` - Left-aligned, good for left-side drawers
- `'right'` - Side elements in drawers
- `'left'` - Controls on right side (edit toggle, save)
- `'top'` - Elements at bottom of viewport
- `'center'` - Large areas (canvas, full-page content)

**Offset Adjustment:**
```typescript
{
    placement: 'bottom-start',
    offset: 10,  // 10px down from element
    styles: {
        tooltip: {
            marginTop: '15px',  // Additional spacing
        },
    },
}
```

**Rules of Thumb:**
- Header buttons → `'bottom'`
- Drawer titles → `'bottom-start'` with offset
- Canvas/large areas → `'center'`
- Right-side controls → `'left'`
- Drawer internal elements → `'right'`

---

## 📝 Tutorial Specification Template

When planning a new tutorial, use this template:

```markdown
# Tutorial Specification: [Feature Name]

**Date:** YYYY-MM-DD  
**Target Users:** [First-time users / Returning users / Feature-specific]  
**Estimated Steps:** X-Y steps  
**Key Features to Demonstrate:** [List 3-5 core features]

---

## 🎯 Goals

**Primary Goal:**
[What should users understand after completing tutorial?]

**Secondary Goals:**
- [ ] Goal 1
- [ ] Goal 2

**Non-Goals:**
- [What are we NOT teaching in this tutorial?]

---

## 👤 User Personas

### Persona 1: Completely New User
- **Tech Level:** Basic
- **Familiarity:** Never seen the app before
- **Needs:** Understand core workflow, see one complete example

### Persona 2: Returning User (Optional)
- **Tech Level:** Intermediate
- **Familiarity:** Used the app before, needs feature-specific help
- **Needs:** Learn new feature, quick refresher

---

## 📋 Tutorial Flow

### Step 1: [Element Name]
**Target:** `[data-tutorial="element-id"]`  
**Content:** "🎨 Content text here..."  
**Placement:** `'bottom'`  
**User Action:** Click "Next" to continue  
**Auto-Animation:** None

---

### Step 2: [Element Name]
**Target:** `[data-tutorial="another-element"]`  
**Content:** "✨ Content text..."  
**Placement:** `'right'`  
**User Action:** Click "Next" to trigger animation  
**Auto-Animation:** 
- Open drawer
- Wait for element to render
- Advance to next step

---

### Step 3: [Element Name]
**Target:** `[data-tutorial="text-input"]`  
**Content:** "📝 Watch as we auto-fill this field!"  
**Placement:** `'bottom'`  
**User Action:** Watch animation, click "Next" when done  
**Auto-Animation:**
- Type text at 50ms/char: "Example text here"
- Wait 800ms
- Blur field

---

### Step N: [Completion]
**Target:** `[data-tutorial="help-button"]`  
**Content:** "❓ Click here anytime to restart this tutorial!"  
**Placement:** `'bottom'`  
**User Action:** Click "Finish" to complete  
**Auto-Animation:** Mark tutorial completed, show success message

---

## 🎬 Animations Required

### Animation 1: Text Typing
**Function:** `handleTutorialSimulateTyping(selector, text)`  
**Target:** `[data-tutorial="text-input"]`  
**Text:** "Example creature description here..."  
**Speed:** 50ms per character  
**Estimated Duration:** 5-7 seconds

### Animation 2: Checkbox Checking
**Function:** `handleTutorialCheckbox(selector)`  
**Targets:**
- `[data-tutorial="checkbox1"]`
- `[data-tutorial="checkbox2"]`
**Delay Between:** 400ms  
**Estimated Duration:** 1 second

### Animation 3: Button Click + Loading
**Function:** `handleTutorialClickButton(selector) + loadDemoData()`  
**Target:** `[data-tutorial="generate-button"]`  
**Loading Time:** 2000ms (simulated)  
**Demo Data:** `DEMO_STATBLOCK_NAME`  
**Estimated Duration:** 2-3 seconds

---

## 🛡️ Tutorial Guards Required

### API Call Guards
- [ ] `/api/generate-creature` - Skip if `isTutorialMode`
- [ ] `/api/upload-image` - Skip if `isTutorialMode`
- [ ] `/api/save-project` - Skip if `isTutorialMode`

### State Guards
- [ ] localStorage restore - Skip for first-time users
- [ ] Auto-load demo - Skip for first-time users
- [ ] Initialization - Use `EMPTY_STATE` for new users

---

## 🍪 Cookie Management

**Cookie Name:** `[feature]_tutorial_completed`  
**Version:** `v1` (increment when tutorial changes significantly)  
**Expiry:** 30 days  
**Auto-Start:** Yes, for first-time users after 1.5s delay

---

## 🧪 Testing Checklist

### Functional Tests
- [ ] Tutorial auto-starts for first-time users
- [ ] Tutorial does NOT auto-start for returning users
- [ ] Help button can manually restart tutorial
- [ ] Skip button works at any step
- [ ] Close (X) button works at any step
- [ ] Back button navigates correctly
- [ ] Next button advances correctly

### Animation Tests
- [ ] Animation 1 runs smoothly
- [ ] Animation 2 runs smoothly
- [ ] Animation N runs smoothly
- [ ] Next button is disabled during animations
- [ ] Animations can be replayed via back button

### State Tests
- [ ] No real API calls during tutorial
- [ ] Demo data loads correctly
- [ ] Canvas renders demo properly
- [ ] Drawer opens/closes at correct steps
- [ ] Edit mode toggles correctly

### User Flow Tests
- [ ] Guest user flow works (skips auth-only steps)
- [ ] Logged-in user flow works (all steps shown)
- [ ] Tutorial completion sets cookie correctly
- [ ] Tutorial can be completed multiple times (after clearing cookie)

### Edge Cases
- [ ] Tutorial works on mobile viewport
- [ ] Tutorial works with drawer already open
- [ ] Tutorial works if user clicks around during it
- [ ] Tutorial recovers from errors gracefully

---

## 📊 Success Metrics

**Tutorial is successful when:**
- [ ] >80% of first-time users complete tutorial
- [ ] <5% of users report confusion
- [ ] Zero API costs from tutorial usage
- [ ] Users can perform core workflow after completion

---

## 🚀 Implementation Tasks

### Phase 1: Setup (1-2 hours)
- [ ] Create tutorial cookie utilities
- [ ] Add tutorial mode flag to provider
- [ ] Add data-tutorial attributes to elements
- [ ] Create demo data constants

### Phase 2: Step Definitions (1 hour)
- [ ] Define all tutorial steps in `tutorialSteps.ts`
- [ ] Write tooltip content
- [ ] Test placement and styling

### Phase 3: Animations (2-3 hours)
- [ ] Implement typing animation
- [ ] Implement checkbox animation
- [ ] Implement button click animation
- [ ] Implement [custom animation]

### Phase 4: Flow Control (2-3 hours)
- [ ] Implement drawer open/close coordination
- [ ] Implement step advancement logic
- [ ] Implement back button handling
- [ ] Add tutorial guards to API calls

### Phase 5: Testing & Polish (2-3 hours)
- [ ] Test complete flow
- [ ] Test back button at every step
- [ ] Test skip/close
- [ ] Test first-time vs returning user
- [ ] Test guest vs logged-in flow
- [ ] Polish timing and delays

**Total Estimated Time:** 8-12 hours

---

## 🔗 Related Files

**Tutorial Logic:**
- `src/components/[Feature]/TutorialTour.tsx` - Main tutorial component
- `src/constants/tutorialSteps.ts` - Step definitions
- `src/utils/tutorialCookies.ts` - Cookie management
- `src/constants/demoData.ts` - Demo statblock/data

**Animation Functions:**
- `src/components/[Feature]/[Feature].tsx` - Animation handlers

**Provider:**
- `src/components/[Feature]/[Feature]Provider.tsx` - Tutorial mode flag

**Components to Modify:**
- [List components that need data-tutorial attributes]
```

---

## 🎓 Lessons Learned

### What Worked Well

1. **Auto-animations with user control**
   - Let user click "Next" to trigger → feels guided, not rushed
   - Animations happen between steps → clear cause and effect

2. **Tutorial mode guards**
   - Zero API costs during tutorial
   - Fast, consistent demo experience
   - Easy to test (just load demo data)

3. **useRef for guard flags**
   - Solved all race condition issues
   - Synchronous updates prevent double-advances
   - Clean pattern: flag → wait for render → clear flag

4. **Cookie-based completion**
   - Works across sessions and devices (if cookie syncs)
   - 30-day expiry feels right (not too pushy to re-show)
   - Version number allows forcing re-tutorial on major updates

5. **Guest vs logged-in flow handling**
   - Filter steps dynamically based on auth
   - Skip unavailable steps in callback
   - Clear messaging about login requirements

### What Didn't Work

1. **Auto-trigger steps without user control**
   - Users felt rushed
   - Hard to go back and see again
   - Solution: Let user click "Next" to trigger

2. **useState for guard flags**
   - Race conditions everywhere
   - Async updates caused double-advances
   - Solution: Use useRef for synchronous updates

3. **Relying on class names for targeting**
   - Classes change with refactors
   - CSS modules make classes unpredictable
   - Solution: Use data-tutorial attributes

4. **Long tooltip content**
   - Users don't read walls of text
   - Solution: 1-2 sentences max, emoji for visual anchor

5. **Too many steps**
   - 15+ steps felt overwhelming
   - Users would skip before completion
   - Solution: 10-13 steps ideal, focus on core workflow

---

## 🚫 Anti-Patterns

### ❌ Don't: Auto-advance through important steps
```typescript
// BAD: Rushes user through demo
setTimeout(() => {
    setStepIndex(stepIndex + 1);
    triggerAnimation();
    setStepIndex(stepIndex + 2);
}, 1000);
```

**Why:** Users can't control pacing, miss content, feel rushed.

### ❌ Don't: Use useState for guard flags
```typescript
// BAD: Async state causes race conditions
const [guardFlag, setGuardFlag] = useState(false);
setGuardFlag(true);
doAction(); // Callback sees old value
```

**Why:** Callbacks fire before state updates, causing bugs.

### ❌ Don't: Assume elements exist
```typescript
// BAD: Crashes if element doesn't exist
const element = document.querySelector(selector)!;
element.click();
```

**Why:** Conditional rendering, slow DOM updates, or refactors break tutorial.

**Fix:** Always check + log:
```typescript
const element = document.querySelector(selector);
if (!element) {
    console.error(`❌ Element not found: ${selector}`);
    return;
}
element.click();
```

### ❌ Don't: Rely on class names for targeting
```typescript
// BAD: Classes change, CSS modules obfuscate
target: '.button-primary'
```

**Why:** Refactors, UI libraries, CSS-in-JS all break class-based targeting.

**Fix:** Use `data-tutorial` attributes:
```typescript
target: '[data-tutorial="generation-button"]'
```

### ❌ Don't: Make real API calls during tutorial
```typescript
// BAD: Costs money, adds latency, inconsistent results
const result = await fetch('/api/generate-creature', {
    body: JSON.stringify(description)
});
```

**Why:** API costs accumulate, slow UX, flaky if API fails.

**Fix:** Guard with tutorial mode flag:
```typescript
if (isTutorialMode) {
    loadDemoStatblock(DEMO_DATA);
    return;
}
// Real API call...
```

---

## 📚 Related Documentation

- **Main Learnings:** `LEARNINGS-StatblockGenerator-Rebuild-2025.md` (Section: Tutorial System Pattern)
- **Quick Reference:** `QUICK-REFERENCE-Patterns.md` (Section: Tutorial Guards)
- **Handoff Documents:**
  - `2025-10-11-tutorial-animation-handoff.md` - Auto-trigger pattern deep-dive
  - `2025-10-10-tutorial-positioning-handoff.md` - Joyride positioning mechanics
  - `2025-10-11-tutorial-polish-handoff.md` - Complete tutorial status

---

## 🔄 Document Maintenance

**Last Updated:** October 21, 2025  
**Next Review:** After implementing next tutorial system  
**Maintainer:** Solo developer  
**Status:** Living document

**Update Triggers:**
- New tutorial patterns discovered
- Better solutions to existing problems found
- react-joyride library updates
- User feedback on tutorial UX

---

**This document represents hard-won knowledge from building a production tutorial. Use it, refine it, share it!** 🚀

