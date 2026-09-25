> **Historical import from DungeonOverMind — 2026-09-24.** This document records an older DungeonMind Web/product implementation state. It is not current LandingPage architecture or sequencing authority. Re-anchor against current code before applying it.

# React State Architecture Learnings

**Project:** DungeonMind - Player Character Generator  
**Last Updated:** December 8, 2025  
**Status:** Active

---

## Overview

Learnings about when and how to architect React state management, particularly around timing decisions for building out state structure versus adding incrementally.

---

## Key Takeaways

1. **Design state shape upfront with all expected fields** - Even if you don't implement features immediately, having the type structure prevents painful retrofits
2. **Build persistence early, but get the timing right** - localStorage persistence should be in the provider from day one, but debounce timing needs careful consideration
3. **Deep merge utilities prevent update bugs** - Reconstructing entire nested objects for each update is error-prone
4. **Always pair debounced saves with beforeunload** - Users will refresh before your debounce fires

---

## 1. When to Build State: Upfront vs. Incremental

**Context:** Player Character Generator - Death Saves & Inspiration Implementation (December 2025)

### The Situation

We had a working character state structure with `DnD5eDerivedStats`, but fields like `deathSaves` and `hasInspiration` weren't included in the initial type definition. When we implemented clickable UI for these features, we had to:

1. Add fields to the TypeScript interface
2. Update the `createEmptyDnD5eCharacter()` factory
3. Wire data flow through 3+ component layers
4. Fix persistence issues that emerged

### What Went Wrong

```typescript
// ❌ INCREMENTAL: Fields added when features were implemented
export interface DnD5eDerivedStats {
    armorClass: number;
    initiative: number;
    // ... other fields
    // deathSaves was missing!
    // hasInspiration was missing!
}
```

**Symptoms:**
- Had to modify types mid-feature
- Had to update factory functions
- Persistence "magically worked" because the whole character was serialized, but we didn't realize it until testing
- Each update handler had to reconstruct entire `derivedStats` object

### Better Approach

```typescript
// ✅ UPFRONT: Define all expected fields, even if not yet implemented
export interface DnD5eDerivedStats {
    // Combat stats
    armorClass: number;
    initiative: number;
    proficiencyBonus: number;
    speed: SpeedObject;
    
    // Hit points
    maxHp: number;
    currentHp: number;
    tempHp?: number;
    
    // Hit dice
    hitDice: { total: number; current: number; size: number; };
    
    // Death saves (PHB p. 197) - INCLUDE FROM START
    deathSaves?: { successes: number; failures: number; };
    
    // Inspiration (PHB p. 125) - INCLUDE FROM START
    hasInspiration?: boolean;
    
    // Passive scores
    passivePerception: number;
    passiveInvestigation: number;
    passiveInsight: number;
}
```

### Decision Framework: When to Define State Fields

| Signal | Action |
|--------|--------|
| Field appears in source material (PHB, rules) | Define in types now |
| Field will be displayed on character sheet | Define in types now |
| Field is trackable during play | Define in types now |
| Field is speculative future feature | Wait, add when needed |

**Lesson:** If it's on the character sheet or in the PHB, define it in your types from day one. The cost of adding an optional field upfront is near-zero; the cost of retrofitting is time + bugs.

---

## 2. Persistence Timing: The Debounce + BeforeUnload Pattern

**Problem:** Character state wasn't persisting on refresh

```typescript
// ❌ PROBLEM: 2-second debounce means quick edits + refresh = lost data
useEffect(() => {
    const timer = setTimeout(() => {
        localStorage.setItem(KEY, JSON.stringify(character));
    }, 2000); // Too long!
    return () => clearTimeout(timer);
}, [character]);
```

**Symptom:** User clicks death save dot, refreshes within 2 seconds, change is lost.

**Root Cause:** Debounce timer hadn't fired yet when page unloaded.

**Solution:** Reduce debounce + add beforeunload handler

```typescript
// ✅ CORRECT: Shorter debounce + guaranteed save on unload
useEffect(() => {
    if (!character) return;
    const timer = setTimeout(() => {
        localStorage.setItem(KEY, JSON.stringify(character));
    }, 500); // Reduced from 2000ms
    return () => clearTimeout(timer);
}, [character]);

// Catch pending changes on page close/refresh
useEffect(() => {
    const handleBeforeUnload = () => {
        if (character) {
            localStorage.setItem(KEY, JSON.stringify(character));
        }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
}, [character]);
```

**Lesson:** Always pair debounced persistence with a `beforeunload` handler. Users WILL refresh before your debounce fires.

---

## 3. The Verbose Update Handler Anti-Pattern

**Problem:** Each state update required reconstructing entire nested objects

```typescript
// ❌ VERBOSE: Must reconstruct entire derivedStats for every change
const handleDeathSaveSuccessClick = (index: number) => {
    updateDnD5eData({ 
        derivedStats: { 
            armorClass: armorClass,           // Must include
            initiative: initiative,           // Must include
            proficiencyBonus: proficiencyBonus, // Must include
            speed: { walk: speed },           // Must include
            maxHp: maxHP,                     // Must include
            currentHp: currentHP ?? maxHP,    // Must include
            tempHp: tempHP ?? 0,              // Must include
            hitDice: { total: 1, current: 1, size: 8 }, // Must include
            deathSaves: { successes: newCount, failures: deathSaveFailures }, // Actual change
            passivePerception: passivePerception, // Must include
            passiveInvestigation: 10,         // Must include
            passiveInsight: 10                // Must include
        } 
    });
};
```

**Issues:**
- ~15 lines of boilerplate for changing 1 field
- Easy to forget a field or use wrong default
- Must update every handler when new fields are added
- Props must be passed down for reconstruction

**Better Pattern: Deep Merge Utility**

```typescript
// ✅ BETTER: Use a deep merge utility in the provider
const updateDnD5eData = useCallback((updates: DeepPartial<DnD5eCharacter>) => {
    setCharacter(prev => {
        if (!prev?.dnd5eData) return prev;
        return {
            ...prev,
            dnd5eData: deepMerge(prev.dnd5eData, updates),
            updatedAt: new Date().toISOString()
        };
    });
}, []);

// Then handlers are clean:
const handleDeathSaveSuccessClick = (index: number) => {
    updateDnD5eData({ 
        derivedStats: { 
            deathSaves: { successes: newCount }  // Only what changed!
        } 
    });
};
```

**Lesson:** If your update handlers exceed 5 lines, you need a deep merge utility. The pattern of reconstructing entire objects is a code smell.

---

## 4. Was This the Right Time? Assessment

### What We Did Right ✅

1. **Persistence was in the provider from the start** - The localStorage save/restore pattern was already built before we added features
2. **Context pattern was established** - `usePlayerCharacterGenerator()` hook made accessing state easy
3. **Type system caught most issues** - TypeScript errors guided us to add missing fields

### What We Should Have Done Earlier ⚠️

1. **Define all D&D 5e character sheet fields upfront** - Death saves, inspiration, exhaustion, etc. are standard PHB fields
2. **Implement deep merge for nested state** - Would have made every feature faster to implement
3. **Test persistence with quick interactions** - Would have caught the debounce timing issue earlier

### Timing Verdict

**State structure:** Waited too long. Should have mapped out all PHB character sheet fields when designing the type.

**Persistence:** Built at the right time (in provider), but timing parameters (debounce) needed refinement.

**Update utilities:** Waited too long. Deep merge should have been added when `derivedStats` was created.

---

## Checklist: Before Building a Feature with State

- [ ] Are all relevant fields already in the type definition?
- [ ] Does the factory function include sensible defaults?
- [ ] Is persistence already wired up in the provider?
- [ ] Do update handlers have access to current state (for partial updates)?
- [ ] Is there a beforeunload handler for debounced persistence?
- [ ] Can you update a single nested field without reconstructing the parent?

---

## Related Documents

- `PATTERNS-Utilities.mdc` - Multi-level persistence hook pattern
- `engineering-principles.mdc` - React state management (useState vs useRef)
- `LandingPage/specs/PlayerCharacterGenerator/HANDOFF-LocalStorage-Persistence.md` - Implementation details

---

**Document Status:** Living document - add new state architecture learnings as discovered

