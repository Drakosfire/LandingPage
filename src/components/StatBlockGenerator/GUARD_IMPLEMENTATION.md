# Generation Guard Implementation

**Date:** 2025-11-02  
**Problem:** User lost work when generating within a saved project - no warning before overwrite

## Solution

Added a guard modal that intercepts generation requests when a saved project is loaded.

### Files Changed

1. **`GenerateWithProjectGuard.tsx`** (NEW)
   - Modal component that presents 3 options:
     - **Create New Project** (recommended) - clears currentProject, generates in new project
     - **Overwrite Current Project** (destructive) - replaces statblock in loaded project
     - **Cancel** - abort generation

2. **`StatBlockGeneratorProvider.tsx`**
   - Added `checkBeforeGenerate()` method to context
   - Returns Promise<'proceed' | 'create-new' | 'cancel'>
   - Manages guard modal state and user choice
   - Renders `GenerateWithProjectGuard` component

3. **`generationDrawerComponents/TextGenerationTab.tsx`**
   - Calls `checkBeforeGenerate()` before starting generation
   - Skips guard during tutorial mode
   - Respects user choice (cancel/proceed/create-new)

4. **`steps/Step1CreatureDescription.tsx`**
   - Same guard check as TextGenerationTab
   - Ensures both generation entry points are protected

## How It Works

### Flow Diagram

```
User clicks "Generate"
    ↓
Is tutorial mode?
    ├─ YES → Skip guard, proceed with simulated generation
    └─ NO → checkBeforeGenerate()
              ↓
         Is currentProject loaded?
              ├─ NO → Return 'proceed' immediately
              └─ YES → Show modal with 3 options
                        ↓
                   User chooses:
                        ├─ Create New → setCurrentProject(null), return 'create-new'
                        ├─ Overwrite  → return 'proceed'
                        └─ Cancel     → return 'cancel'
                              ↓
                   Handler receives result:
                        ├─ 'cancel' → abort generation, return early
                        ├─ 'create-new' → proceed (new project will be created on save)
                        └─ 'proceed' → continue with generation (overwrites current)
```

### Code Example

```typescript
const handleGenerateCreature = async () => {
    // Guard check (skipped for tutorial)
    if (!isTutorialMode) {
        const guardResult = await checkBeforeGenerate();
        
        if (guardResult === 'cancel') {
            console.log('❌ Generation cancelled by user');
            return; // Abort
        }
        
        if (guardResult === 'create-new') {
            console.log('📁 Creating new project');
            // currentProject already cleared by guard handler
        }
        
        // If 'proceed', user confirmed overwrite
    }
    
    // Continue with generation...
};
```

## Testing

### Manual Test Cases

1. **No Project Loaded**
   - Generate → Should proceed immediately (no modal)
   
2. **Project Loaded - Create New**
   - Load existing project
   - Click Generate
   - Choose "Create New Project"
   - Verify: Modal closes, generation proceeds, new project created on save
   
3. **Project Loaded - Overwrite**
   - Load existing project
   - Click Generate
   - Choose "Overwrite Current Project"
   - Verify: Modal closes, generation proceeds, existing project updated
   
4. **Project Loaded - Cancel**
   - Load existing project
   - Click Generate
   - Choose "Cancel"
   - Verify: Modal closes, no generation, project unchanged

5. **Tutorial Mode**
   - Start tutorial
   - Trigger generation step
   - Verify: No guard modal, simulated generation proceeds

## Future Enhancements

- [ ] Add keyboard shortcuts (Enter = Create New, Esc = Cancel)
- [ ] Remember user preference per session ("Always create new" checkbox)
- [ ] Show project last modified time in modal
- [ ] Add "Save As..." option to create fork of current project

## Related Issues

- Prevents data loss bug reported by user
- Aligns with engineering principles: defensive programming, explicit user intent
- Follows pattern from CardGenerator project management

## Success Metrics

✅ Zero accidental overwrites of saved projects  
✅ User explicitly confirms destructive actions  
✅ Tutorial flow unaffected  
✅ No breaking changes to existing workflows

