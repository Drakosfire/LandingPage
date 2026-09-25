> **Historical import from DungeonOverMind — 2026-09-24.** This document records an older DungeonMind Web/product implementation state. It is not current LandingPage architecture or sequencing authority. Re-anchor against current code before applying it.

# Extractable Patterns & Code Templates

**Source:** DungeonMind StatblockGenerator (October 2025)  
**Purpose:** Ready-to-use code patterns for new projects  
**Status:** Production-tested, proven patterns

---

## 🎯 Quick Reference: When to Use What

| Need | Use Pattern | See Section |
|------|-------------|-------------|
| Interactive tutorial/onboarding | Tutorial Mode Flag + Auto-Animations | 1.1, 1.2, 1.3 |
| First-time user detection | Triple-Check Cookie Pattern | 1.4 |
| Prevent race conditions in callbacks | useRef Guard Flags | 1.5 |
| Smooth animation sequences | Sequential Chaining Pattern | 1.6 |
| Canvas/layout with editing | Component Registry + Hydration | 2.1, 2.2 |
| Edit without layout thrashing | Dynamic Component Locking | 2.3 |
| Multi-level data sync | localStorage + Firestore Pattern | 3.1 |
| List management | Backend ID Pattern | 3.2 |
| Better than wizard steps | Drawer Architecture | 3.3 |

---

## 📐 Part 1: Tutorial System Templates

### 1.1 Tutorial Mode Flag Utilities

```typescript
// File: src/utils/tutorialMode.ts

/**
 * Tutorial mode utilities
 * Prevents real API calls, enables demo data
 */

export interface TutorialModeConfig {
    isTutorialMode: boolean;
    mockAuthEnabled?: boolean;
    mockData?: any;
}

export const createTutorialGuard = <T extends (...args: any[]) => any>(
    realFn: T,
    demoFn: T,
    config: TutorialModeConfig
): T => {
    return ((...args: any[]) => {
        if (config.isTutorialMode) {
            console.log('🎓 Tutorial mode - using demo implementation');
            return demoFn(...args);
        }
        return realFn(...args);
    }) as T;
};

// Usage example
const handleGenerate = createTutorialGuard(
    // Real implementation
    async (prompt: string) => {
        const result = await fetch('/api/generate', {
            body: JSON.stringify({ prompt })
        });
        return result.json();
    },
    // Demo implementation
    async (prompt: string) => {
        await new Promise(r => setTimeout(r, 1000)); // Simulate delay
        return DEMO_DATA;
    },
    { isTutorialMode: true }
);
```

---

### 1.2 Tutorial Auto-Animation Hooks

```typescript
// File: src/hooks/useTutorialAnimation.ts

import { useState, useEffect, useRef } from 'react';

export interface AutoTriggerConfig {
    targetStep: number;
    currentStep: number;
    isRunning: boolean;
    delay?: number;
}

export const useTutorialAutoTrigger = (
    config: AutoTriggerConfig,
    animationFn: () => Promise<void>
) => {
    const [isTriggered, setIsTriggered] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    
    useEffect(() => {
        const { targetStep, currentStep, isRunning, delay = 1500 } = config;
        
        if (currentStep === targetStep && isRunning && !isTriggered) {
            console.log(`🎯 [Auto-Trigger] Step ${targetStep} - waiting ${delay}ms`);
            
            timerRef.current = setTimeout(async () => {
                setIsTriggered(true);
                console.log('🎬 [Auto-Trigger] Starting animation');
                
                try {
                    await animationFn();
                    console.log('✅ [Auto-Trigger] Complete');
                } catch (error) {
                    console.error('❌ [Auto-Trigger] Error:', error);
                }
            }, delay);
            
            return () => {
                if (timerRef.current) clearTimeout(timerRef.current);
            };
        }
    }, [config.currentStep, config.isRunning, isTriggered]);
    
    const reset = () => setIsTriggered(false);
    
    return { isTriggered, reset };
};

// Usage example
const MyTutorial: React.FC = () => {
    const [stepIndex, setStepIndex] = useState(0);
    const [run, setRun] = useState(true);
    
    const typingAnimation = useTutorialAutoTrigger(
        {
            targetStep: 2,
            currentStep: stepIndex,
            isRunning: run,
            delay: 1500
        },
        async () => {
            setRun(false); // Pause tutorial
            await simulateTyping('[data-tutorial="input"]', 'Demo text');
            setRun(true); // Resume
        }
    );
    
    // Reset when tutorial starts
    useEffect(() => {
        if (run) {
            typingAnimation.reset();
        }
    }, [run]);
};
```

---

### 1.3 Animation Implementations

```typescript
// File: src/utils/tutorialAnimations.ts

/**
 * Typing simulation - types character by character
 */
export const simulateTyping = async (
    selector: string,
    text: string,
    speed: number = 50
): Promise<void> => {
    const element = document.querySelector(selector) as HTMLTextAreaElement | HTMLInputElement;
    
    if (!element) {
        console.error(`❌ [Typing] Element not found: ${selector}`);
        return;
    }
    
    console.log(`📝 [Typing] Starting: ${selector}`);
    
    element.focus();
    element.value = '';
    
    // Type character by character
    for (let i = 0; i < text.length; i++) {
        await new Promise(r => setTimeout(r, speed));
        element.value = text.substring(0, i + 1);
        
        // Dispatch events for React
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
    }
    
    // Show complete text
    await new Promise(r => setTimeout(r, 800));
    element.blur();
    
    console.log('✅ [Typing] Complete');
};

/**
 * Checkbox clicking - toggles checkbox with visual feedback
 */
export const simulateCheckbox = async (
    selector: string,
    delay: number = 100
): Promise<void> => {
    const checkbox = document.querySelector(selector) as HTMLInputElement;
    
    if (!checkbox) {
        console.error(`❌ [Checkbox] Not found: ${selector}`);
        return;
    }
    
    if (!checkbox.checked) {
        console.log(`☑️ [Checkbox] Clicking: ${selector}`);
        checkbox.click();
        checkbox.dispatchEvent(new Event('change', { bubbles: true }));
        await new Promise(r => setTimeout(r, delay));
    } else {
        console.log(`⏭️ [Checkbox] Already checked: ${selector}`);
    }
};

/**
 * Button clicking - clicks button with validation
 */
export const simulateButtonClick = async (
    selector: string,
    delay: number = 100
): Promise<void> => {
    const button = document.querySelector(selector) as HTMLButtonElement;
    
    if (!button) {
        console.error(`❌ [Button] Not found: ${selector}`);
        return;
    }
    
    if (button.disabled) {
        console.error(`❌ [Button] Disabled: ${selector}`);
        return;
    }
    
    console.log(`🖱️ [Button] Clicking: ${selector}`);
    button.click();
    await new Promise(r => setTimeout(r, delay));
};

/**
 * Sequential animation chain - runs animations in order
 */
export const chainAnimations = async (
    animations: Array<() => Promise<void>>,
    delayBetween: number = 400
): Promise<void> => {
    console.log(`🎬 [Chain] Starting ${animations.length} animations`);
    
    for (let i = 0; i < animations.length; i++) {
        console.log(`🎬 [Chain] Animation ${i + 1}/${animations.length}`);
        await animations[i]();
        
        if (i < animations.length - 1) {
            await new Promise(r => setTimeout(r, delayBetween));
        }
    }
    
    console.log('✅ [Chain] All animations complete');
};

// Usage example
const runDemoSequence = async () => {
    await chainAnimations([
        () => simulateTyping('[data-tutorial="input"]', 'Mystical cat creature'),
        () => simulateCheckbox('[data-tutorial="legendary"]'),
        () => simulateCheckbox('[data-tutorial="lair"]'),
        () => simulateButtonClick('[data-tutorial="generate"]'),
    ], 400);
};
```

---

### 1.4 Tutorial Cookie Management

```typescript
// File: src/utils/tutorialCookies.ts

import Cookies from 'js-cookie';

export interface TutorialCookieConfig {
    key: string;
    version: string;
    expiryDays?: number;
}

export const createTutorialCookies = (config: TutorialCookieConfig) => {
    const { key, version, expiryDays = 30 } = config;
    
    return {
        hasCompleted(): boolean {
            return Cookies.get(key) === version;
        },
        
        markCompleted(): void {
            Cookies.set(key, version, { expires: expiryDays });
            console.log(`🍪 [Tutorial] Marked complete: ${key}=${version}`);
        },
        
        reset(): void {
            Cookies.remove(key);
            console.log(`🍪 [Tutorial] Reset: ${key}`);
        },
        
        getVersion(): string | undefined {
            return Cookies.get(key);
        },
        
        needsUpdate(): boolean {
            const current = Cookies.get(key);
            return current !== undefined && current !== version;
        }
    };
};

// Usage example
const tutorialCookies = createTutorialCookies({
    key: 'app_tutorial_completed',
    version: 'v2', // Increment to force re-show
    expiryDays: 30
});

// In component
useEffect(() => {
    if (!tutorialCookies.hasCompleted()) {
        // Auto-start tutorial for first-time users
        setTimeout(() => setRunTutorial(true), 1500);
    }
}, []);
```

---

### 1.5 useRef Guard Flag Pattern

```typescript
// File: src/hooks/useGuardFlag.ts

import { useRef, useEffect } from 'react';

/**
 * Synchronous guard flag for preventing race conditions
 * Use this instead of useState for flags that need immediate updates
 */
export const useGuardFlag = (initialValue: boolean = false) => {
    const flagRef = useRef(initialValue);
    
    const set = (value: boolean) => {
        console.log(`🚩 [Guard] ${value ? 'SET' : 'CLEAR'} flag`);
        flagRef.current = value;
    };
    
    const get = () => flagRef.current;
    
    const setWithTimeout = (value: boolean, delay: number) => {
        set(value);
        return setTimeout(() => set(!value), delay);
    };
    
    return {
        set,
        get,
        setWithTimeout,
        ref: flagRef
    };
};

// Usage example
const MyComponent: React.FC = () => {
    const justAdvanced = useGuardFlag(false);
    
    const advance = () => {
        justAdvanced.set(true); // Immediate (synchronous)
        setStepIndex(4); // Triggers callback
    };
    
    const handleCallback = (data: CallbackProps) => {
        if (data.index === 4) {
            if (justAdvanced.get()) {
                console.log('⏭️ Just advanced programmatically, ignoring');
                return;
            }
            // User manually clicked Next
            handleManualAdvance();
        }
    };
    
    // Clear guard after step renders
    useEffect(() => {
        if (stepIndex === 4 && justAdvanced.get()) {
            const timer = justAdvanced.setWithTimeout(false, 200);
            return () => clearTimeout(timer);
        }
    }, [stepIndex]);
};
```

---

### 1.6 Drawer/Modal Coordination Pattern

```typescript
// File: src/utils/tutorialDrawerCoordination.ts

/**
 * Wait for drawer to open and element to be properly positioned
 */
export const waitForDrawerElement = (
    selector: string,
    options: {
        maxWaitMs?: number;
        pollInterval?: number;
        onFound?: () => void;
        onTimeout?: () => void;
    } = {}
): Promise<Element | null> => {
    const {
        maxWaitMs = 5000,
        pollInterval = 50,
        onFound,
        onTimeout
    } = options;
    
    return new Promise((resolve) => {
        const startTime = Date.now();
        
        const checkElement = () => {
            const element = document.querySelector(selector);
            
            // Check exists AND is properly positioned (not hidden/animating)
            if (element && element.getBoundingClientRect().top > 0) {
                console.log(`✅ [Drawer] Element found and positioned: ${selector}`);
                onFound?.();
                resolve(element);
                return;
            }
            
            // Timeout check
            if (Date.now() - startTime > maxWaitMs) {
                console.error(`❌ [Drawer] Timeout waiting for: ${selector}`);
                onTimeout?.();
                resolve(null);
                return;
            }
            
            // Keep checking
            setTimeout(checkElement, pollInterval);
        };
        
        checkElement();
    });
};

// Usage in tutorial
const openDrawerAndAdvance = async (
    onOpenDrawer: () => void,
    targetSelector: string,
    nextStepIndex: number
) => {
    setRun(false); // Pause tutorial
    onOpenDrawer(); // Open drawer
    
    // Wait for drawer animation (initial delay)
    await new Promise(r => setTimeout(r, 400));
    
    // Wait for target element
    const element = await waitForDrawerElement(targetSelector, {
        onFound: () => {
            setStepIndex(nextStepIndex);
            // Small buffer before showing spotlight
            setTimeout(() => setRun(true), 100);
        },
        onTimeout: () => {
            // Advance anyway to prevent tutorial getting stuck
            setStepIndex(nextStepIndex);
            setRun(true);
        }
    });
};
```

---

## 📐 Part 2: Canvas Architecture Templates

### 2.1 Component Registry Pattern

```typescript
// File: src/canvas/registry/ComponentRegistry.ts

export interface ComponentMetadata<T = any> {
    id: string;
    displayName: string;
    description: string;
    category: string;
    implementation: React.ComponentType<T>;
    defaultProps?: Partial<T>;
    previewThumbnail?: string;
}

export class ComponentRegistry<T = any> {
    private components = new Map<string, ComponentMetadata<T>>();
    
    register(metadata: ComponentMetadata<T>): void {
        if (this.components.has(metadata.id)) {
            console.warn(`⚠️ [Registry] Overwriting component: ${metadata.id}`);
        }
        this.components.set(metadata.id, metadata);
        console.log(`✅ [Registry] Registered: ${metadata.id}`);
    }
    
    get(id: string): ComponentMetadata<T> | undefined {
        return this.components.get(id);
    }
    
    getAll(): ComponentMetadata<T>[] {
        return Array.from(this.components.values());
    }
    
    getByCategory(category: string): ComponentMetadata<T>[] {
        return this.getAll().filter(c => c.category === category);
    }
    
    has(id: string): boolean {
        return this.components.has(id);
    }
    
    unregister(id: string): boolean {
        return this.components.delete(id);
    }
}

// Create registry instance
export const COMPONENT_REGISTRY = new ComponentRegistry();

// Register components
COMPONENT_REGISTRY.register({
    id: 'header',
    displayName: 'Header',
    description: 'Page header with title',
    category: 'layout',
    implementation: HeaderComponent,
    defaultProps: { alignment: 'center' }
});

// Usage
const getComponent = (id: string) => {
    const metadata = COMPONENT_REGISTRY.get(id);
    if (!metadata) {
        throw new Error(`Component not found: ${id}`);
    }
    return metadata.implementation;
};
```

---

### 2.2 Data Hydration Builder Pattern

```typescript
// File: src/canvas/data/PageDocumentBuilder.ts

export interface DataSource {
    sourceId: string;
    dataType: string;
    data: any;
}

export interface PageTemplate {
    id: string;
    componentInstances: ComponentInstance[];
    dataSources?: DataSource[];
}

export interface PageDocument extends PageTemplate {
    dataSources: DataSource[];
}

export const buildPageDocument = (
    template: PageTemplate,
    liveDataSources: Record<string, any>
): PageDocument => {
    console.log('🔨 [Builder] Building page document');
    
    // Replace template data sources with live data
    const dataSources: DataSource[] = Object.entries(liveDataSources).map(
        ([sourceId, data]) => ({
            sourceId,
            dataType: typeof data,
            data
        })
    );
    
    // Component instances reference live data sources
    const componentInstances = template.componentInstances.map(instance => ({
        ...instance,
        dataSources: dataSources.filter(ds => 
            instance.dataPath?.startsWith(ds.sourceId)
        )
    }));
    
    console.log(`✅ [Builder] Built with ${dataSources.length} data sources`);
    
    return {
        ...template,
        dataSources,
        componentInstances
    };
};

// Usage in component
const MyCanvas: React.FC = () => {
    const { creatureDetails, selectedAssets } = useProvider();
    
    const pageDocument = useMemo(
        () => buildPageDocument(template, {
            'primary-data': creatureDetails,
            'assets': selectedAssets
        }),
        [template, creatureDetails, selectedAssets]
    );
    
    return <CanvasRenderer document={pageDocument} />;
};
```

---

### 2.3 Dynamic Component Locking System

```typescript
// File: src/canvas/layout/MeasurementCoordinator.ts

export class MeasurementObserver {
    private isLocked = false;
    private pendingMeasurement: number | null = null;
    private dispatcher: (key: string, value: number) => void;
    private key: string;
    
    constructor(key: string, dispatcher: (key: string, value: number) => void) {
        this.key = key;
        this.dispatcher = dispatcher;
    }
    
    lock(): void {
        console.log(`🔒 [Measurement] Locked: ${this.key}`);
        this.isLocked = true;
    }
    
    unlock(): void {
        console.log(`🔓 [Measurement] Unlocked: ${this.key}`);
        this.isLocked = false;
        
        // Dispatch pending measurement if changed
        if (this.pendingMeasurement !== null) {
            console.log(`📏 [Measurement] Dispatching pending: ${this.pendingMeasurement}px`);
            this.dispatcher(this.key, this.pendingMeasurement);
            this.pendingMeasurement = null;
        }
    }
    
    measure(height: number): void {
        if (this.isLocked) {
            console.log(`📦 [Measurement] Buffered: ${height}px (locked)`);
            this.pendingMeasurement = height;
        } else {
            console.log(`📏 [Measurement] Dispatched: ${height}px`);
            this.dispatcher(this.key, height);
        }
    }
}

export class MeasurementCoordinator {
    private observers = new Map<string, MeasurementObserver>();
    
    register(key: string, observer: MeasurementObserver): void {
        this.observers.set(key, observer);
        console.log(`📝 [Coordinator] Registered: ${key}`);
    }
    
    unregister(key: string): void {
        this.observers.delete(key);
        console.log(`🗑️ [Coordinator] Unregistered: ${key}`);
    }
    
    lockComponent(componentId: string): void {
        // Lock all observers whose keys include componentId
        for (const [key, observer] of this.observers.entries()) {
            if (key.includes(componentId)) {
                observer.lock();
            }
        }
    }
    
    unlockComponent(componentId: string): void {
        for (const [key, observer] of this.observers.entries()) {
            if (key.includes(componentId)) {
                observer.unlock();
            }
        }
    }
}

// Usage in provider
const coordinator = useMemo(() => new MeasurementCoordinator(), []);

const requestComponentLock = useCallback((componentId: string) => {
    coordinator.lockComponent(componentId);
}, [coordinator]);

const releaseComponentLock = useCallback((componentId: string) => {
    coordinator.unlockComponent(componentId);
}, [coordinator]);
```

---

### 2.4 Edit Timer Pattern for Components

```typescript
// File: src/components/EditableComponent.tsx

import { useState, useRef, useEffect, useCallback } from 'react';
import { useProvider } from './Provider';

interface EditableComponentProps {
    id: string;
    isEditMode: boolean;
    onUpdateData?: (updates: any) => void;
}

export const EditableComponent: React.FC<EditableComponentProps> = ({
    id,
    isEditMode,
    onUpdateData
}) => {
    const { requestComponentLock, releaseComponentLock } = useProvider();
    
    // Edit state management
    const [isEditing, setIsEditing] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const editTimerRef = useRef<NodeJS.Timeout | null>(null);
    const componentId = `editable-${id}`;
    
    // Handle edit start
    const handleEditStart = useCallback(() => {
        if (!isEditing && isEditMode) {
            console.log(`✏️ [Edit] Started: ${componentId}`);
            setIsEditing(true);
            requestComponentLock(componentId);
        }
    }, [isEditing, isEditMode, componentId, requestComponentLock]);
    
    // Handle edit change
    const handleEditChange = useCallback(() => {
        setHasChanges(true);
        
        // Reset 2-second idle timer
        if (editTimerRef.current) {
            clearTimeout(editTimerRef.current);
        }
        
        editTimerRef.current = setTimeout(handleEditComplete, 2000);
    }, []);
    
    // Handle edit complete
    const handleEditComplete = useCallback(() => {
        if (hasChanges) {
            console.log(`💾 [Edit] Complete: ${componentId}`);
            releaseComponentLock(componentId);
            setIsEditing(false);
            setHasChanges(false);
        }
    }, [hasChanges, componentId, releaseComponentLock]);
    
    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (editTimerRef.current) {
                clearTimeout(editTimerRef.current);
            }
            if (isEditing) {
                releaseComponentLock(componentId);
            }
        };
    }, [isEditing, componentId, releaseComponentLock]);
    
    return (
        <div className="dm-editable-component">
            <EditableText
                value={data.name}
                onChange={(value) => {
                    onUpdateData?.({ name: value });
                    handleEditChange();
                }}
                isEditMode={isEditMode}
                onEditStart={handleEditStart}
            />
        </div>
    );
};
```

---

## 📐 Part 3: General Utilities

### 3.1 Multi-Level Persistence Hook

```typescript
// File: src/hooks/usePersistence.ts

import { useState, useEffect, useMemo, useCallback } from 'react';
import { debounce } from 'lodash';

export interface PersistenceConfig<T> {
    localKey: string;
    cloudEndpoint?: string;
    debounceMs?: number;
    authRequired?: boolean;
}

export const usePersistence = <T extends object>(
    initialData: T,
    config: PersistenceConfig<T>,
    isLoggedIn: boolean = false
) => {
    const { localKey, cloudEndpoint, debounceMs = 2000, authRequired = true } = config;
    
    const [data, setData] = useState<T>(() => {
        // Restore from localStorage on mount
        try {
            const saved = localStorage.getItem(localKey);
            if (saved) {
                console.log(`📦 [Persistence] Restored from localStorage: ${localKey}`);
                return JSON.parse(saved);
            }
        } catch (err) {
            console.warn('❌ [Persistence] Failed to restore:', err);
        }
        return initialData;
    });
    
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
    
    // Save to localStorage (immediate)
    useEffect(() => {
        try {
            const snapshot = JSON.stringify(data);
            localStorage.setItem(localKey, snapshot);
            console.log(`💾 [Persistence] Saved to localStorage: ${localKey}`);
        } catch (err) {
            console.error('❌ [Persistence] localStorage save failed:', err);
        }
    }, [data, localKey]);
    
    // Debounced cloud save
    const debouncedCloudSave = useMemo(
        () => debounce(async (dataToSave: T) => {
            if (!cloudEndpoint) return;
            if (authRequired && !isLoggedIn) {
                console.log('⏭️ [Persistence] Skipping cloud save (not logged in)');
                return;
            }
            
            try {
                setSaveStatus('saving');
                console.log('☁️ [Persistence] Saving to cloud...');
                
                const response = await fetch(cloudEndpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify(dataToSave)
                });
                
                if (!response.ok) throw new Error('Cloud save failed');
                
                setSaveStatus('saved');
                console.log('✅ [Persistence] Cloud save complete');
                
                // Reset to idle after 2s
                setTimeout(() => setSaveStatus('idle'), 2000);
            } catch (err) {
                console.error('❌ [Persistence] Cloud save failed:', err);
                setSaveStatus('error');
                setTimeout(() => setSaveStatus('idle'), 2000);
            }
        }, debounceMs),
        [cloudEndpoint, isLoggedIn, authRequired, debounceMs]
    );
    
    // Trigger debounced cloud save on changes
    useEffect(() => {
        if (cloudEndpoint) {
            debouncedCloudSave(data);
        }
    }, [data, debouncedCloudSave]);
    
    // Manual save (flush debounce)
    const saveNow = useCallback(() => {
        debouncedCloudSave.flush();
    }, [debouncedCloudSave]);
    
    return {
        data,
        setData,
        saveStatus,
        saveNow
    };
};

// Usage example
const MyComponent: React.FC = () => {
    const { isLoggedIn } = useAuth();
    
    const {
        data: creatureDetails,
        setData: setCreatureDetails,
        saveStatus,
        saveNow
    } = usePersistence(
        EMPTY_CREATURE,
        {
            localKey: 'statblock_state',
            cloudEndpoint: '/api/save-project',
            debounceMs: 2000,
            authRequired: true
        },
        isLoggedIn
    );
    
    return (
        <div>
            <div>Status: {saveStatus}</div>
            <button onClick={saveNow}>Save Now</button>
        </div>
    );
};
```

---

### 3.2 Backend ID Normalization

```typescript
// File: backend/utils/normalization.py

from uuid import uuid4
from typing import Any, Dict, List

def ensure_id(item: Dict[str, Any]) -> Dict[str, Any]:
    """Ensure item has an ID, generate if missing"""
    if "id" not in item or not item["id"]:
        item["id"] = str(uuid4())
    return item

def normalize_list_items(data: Dict[str, Any], list_keys: List[str]) -> Dict[str, Any]:
    """Ensure all items in specified lists have IDs"""
    normalized = data.copy()
    
    for key in list_keys:
        if key in normalized and isinstance(normalized[key], list):
            normalized[key] = [ensure_id(item) for item in normalized[key]]
            print(f"✅ [Normalize] {key}: {len(normalized[key])} items")
    
    return normalized

# Usage in API endpoint
@router.post("/save-project")
async def save_project(request: SaveProjectRequest):
    # Normalize before saving
    normalized_data = normalize_list_items(
        request.statblock,
        list_keys=["actions", "spells", "legendary_actions", "lair_actions"]
    )
    
    # Save to database
    await db.collection("projects").document(project_id).set({
        "statblock": normalized_data,
        "updated_at": datetime.now().isoformat()
    })
    
    return {"success": True, "project_id": project_id}
```

```typescript
// File: frontend/utils/normalization.ts

import { v4 as uuidv4 } from 'uuid';

export const ensureId = <T extends { id?: string }>(item: T): T & { id: string } => {
    return {
        ...item,
        id: item.id || uuidv4()
    };
};

export const normalizeListItems = <T extends { id?: string }>(
    items: T[]
): Array<T & { id: string }> => {
    return items.map(ensureId);
};

// Usage
const normalizedActions = normalizeListItems(statblock.actions);
```

---

### 3.3 Drawer State Management Hook

```typescript
// File: src/hooks/useDrawerState.ts

import { useState, useCallback } from 'react';

export interface DrawerState {
    opened: boolean;
    metadata?: Record<string, any>;
}

export const useDrawerState = (initialState: DrawerState = { opened: false }) => {
    const [state, setState] = useState<DrawerState>(initialState);
    
    const open = useCallback((metadata?: Record<string, any>) => {
        console.log('📂 [Drawer] Opening');
        setState({ opened: true, metadata });
    }, []);
    
    const close = useCallback(() => {
        console.log('📂 [Drawer] Closing');
        setState({ opened: false });
    }, []);
    
    const toggle = useCallback(() => {
        setState(prev => ({
            ...prev,
            opened: !prev.opened
        }));
    }, []);
    
    const updateMetadata = useCallback((metadata: Record<string, any>) => {
        setState(prev => ({
            ...prev,
            metadata: { ...prev.metadata, ...metadata }
        }));
    }, []);
    
    return {
        state,
        open,
        close,
        toggle,
        updateMetadata,
        isOpen: state.opened
    };
};

// Usage
const MyComponent: React.FC = () => {
    const generationDrawer = useDrawerState();
    const projectsDrawer = useDrawerState();
    
    return (
        <>
            <button onClick={() => generationDrawer.open({ isTutorialMode: true })}>
                Open Generation
            </button>
            
            <GenerationDrawer
                opened={generationDrawer.isOpen}
                onClose={generationDrawer.close}
                isTutorialMode={generationDrawer.state.metadata?.isTutorialMode}
            />
        </>
    );
};
```

---

## 🎓 Usage Guidelines

### When to Use These Patterns

**Tutorial Patterns:**
- ✅ Building onboarding for complex apps
- ✅ Need to demo features without API costs
- ✅ Want smooth, polished tutorial experience
- ✅ Guest vs logged-in user flows
- ✅ Mobile-responsive tutorials

**Canvas Patterns:**
- ✅ Building layout engines (reports, documents, dashboards)
- ✅ Need automatic pagination
- ✅ Complex measurement requirements
- ✅ Template-based rendering
- ✅ User-editable layouts

**Persistence Patterns:**
- ✅ Need offline-first architecture
- ✅ Want automatic cloud sync
- ✅ Auth-gated premium features
- ✅ Multi-device sync requirements

---

## 🚀 Quick Start Examples

### Example 1: Add Tutorial to Existing App

```typescript
// 1. Install dependencies
npm install react-joyride js-cookie

// 2. Create cookie utilities
import { createTutorialCookies } from './utils/tutorialCookies';
const tutorialCookies = createTutorialCookies({
    key: 'my_app_tutorial',
    version: 'v1'
});

// 3. Add tutorial component
import Joyride from 'react-joyride';
import { tutorialSteps } from './constants/tutorialSteps';

const MyApp = () => {
    const [run, setRun] = useState(!tutorialCookies.hasCompleted());
    
    return (
        <>
            <Joyride
                steps={tutorialSteps}
                run={run}
                continuous
                callback={(data) => {
                    if (data.status === 'finished') {
                        tutorialCookies.markCompleted();
                    }
                }}
            />
            <MyAppContent />
        </>
    );
};
```

### Example 2: Add Component Registry

```typescript
// 1. Create registry
import { ComponentRegistry } from './canvas/registry';
const registry = new ComponentRegistry();

// 2. Register components
registry.register({
    id: 'header',
    displayName: 'Header',
    category: 'layout',
    implementation: HeaderComponent
});

// 3. Use in renderer
const ComponentRenderer = ({ componentId }) => {
    const Component = registry.get(componentId)?.implementation;
    if (!Component) return null;
    return <Component />;
};
```

### Example 3: Add Multi-Level Persistence

```typescript
// 1. Create hook instance
import { usePersistence } from './hooks/usePersistence';

const MyComponent = () => {
    const { isLoggedIn } = useAuth();
    
    const { data, setData, saveStatus } = usePersistence(
        { name: '', content: '' },
        {
            localKey: 'my_data',
            cloudEndpoint: '/api/save',
            debounceMs: 2000
        },
        isLoggedIn
    );
    
    // 2. Use like normal state
    return (
        <div>
            <input
                value={data.name}
                onChange={(e) => setData({ ...data, name: e.target.value })}
            />
            <div>Status: {saveStatus}</div>
        </div>
    );
};
```

---

## 📚 Related Documentation

- **Main Lessons:** `LESSONS-LEARNED-StatblockGenerator-October-2025.md`
- **Tutorial Deep-Dive:** `LEARNINGS-React-Joyride-Interactive-Tutorials.md`
- **Workflow Patterns:** `development.mdc`
- **Engineering Standards:** `engineering-principles.mdc`

---

**Last Updated:** November 1, 2025  
**Status:** Production-tested patterns ready for extraction  
**Next:** Build standalone npm packages from these patterns

