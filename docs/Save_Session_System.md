# CardGenerator Save & Session System Documentation

## Overview

The CardGenerator uses a multi-layered persistence system designed to prevent data loss while providing seamless user experience. The system combines immediate localStorage backup, debounced server saves, and session recovery.

## Architecture

### 1. Three-Layer Persistence Strategy

```
User Action → Immediate localStorage → Debounced Server Save → Project Storage
     |              |                        |                      |
   0ms            Instant                   2 seconds           Persistent
```

#### Layer 1: Immediate localStorage Backup
- **Purpose**: Prevent data loss from browser crashes/tab closures
- **Trigger**: Every state change (immediate)
- **Storage**: Browser localStorage
- **Retention**: 24 hours
- **Key**: `cardGenerator_sessionBackup`

#### Layer 2: Debounced Server Save
- **Purpose**: Persistent storage with reduced server load
- **Trigger**: 2 seconds after last state change
- **Storage**: Firestore + Project API
- **Retention**: Permanent (user projects)
- **Fallback**: localStorage if server fails

#### Layer 3: Project Storage
- **Purpose**: Named, organized project management
- **Trigger**: Manual save or auto-save with project context
- **Storage**: Backend database via Project API
- **Retention**: Until deleted by user

### 2. State Management

#### Tracked State Variables
All state changes trigger both localStorage and debounced saves:

```typescript
// Core workflow state
currentStepId: string
itemDetails: ItemDetails

// Asset selections
selectedFinalImage: string
selectedBorder: string
selectedSeedImage: string
templateBlob: Blob | null

// Generated content
generatedImages: GeneratedImage[]
generatedCardImages: string[]          // Step 3 card variations
selectedGeneratedCardImage: string     // Selected card from Step 3
renderedCards: RenderedCard[]

// Project context
currentProject: Project | null
sessionId: string
```

#### Save Status Indicators
Visual feedback shows current save state:
- **🔄 Saving...** - Server save in progress
- **✅ Saved** - Successfully saved to server (3-second display)
- **❌ Save Error** - Server save failed (5-second display)
- **Idle** - No visual indicator

### 3. Session Recovery

#### On Page Load/Refresh
1. Check for recent localStorage backup (< 24 hours old)
2. If found and contains meaningful data (itemDetails.name exists):
   - Restore state from backup
   - Continue where user left off
3. If no backup or expired:
   - Start fresh session
   - Generate new sessionId

#### Recovery Conditions
- Backup age < 24 hours
- Backup contains valid state structure
- ItemDetails has a non-empty name (indicates user progress)

## Data Flow Examples

### Example 1: User Generates Images in Step 3

```
1. User clicks "Generate 4 Variations" in Step 3
   ↓
2. generatedCardImages state updates with new URLs
   ↓
3. IMMEDIATE: localStorage backup saves new state
   ↓
4. DEBOUNCED (2s later): Server save with new images
   ↓
5. Visual indicator: "⏳ Saving..." → "✅ Saved"
```

### Example 2: User Accidentally Closes Tab

```
1. User has generated images and selected one
   ↓
2. All state was backed up to localStorage immediately
   ↓
3. User accidentally closes browser tab
   ↓
4. User reopens application
   ↓
5. System detects recent localStorage backup
   ↓
6. State restored: user continues from where they left off
```

### Example 3: Server Save Fails

```
1. State change triggers save attempt
   ↓
2. localStorage backup succeeds (immediate)
   ↓
3. Server save fails (network/auth issue)
   ↓
4. Visual indicator: "❌ Save Error"
   ↓
5. Data still safe in localStorage backup
   ↓
6. Next successful save will sync all changes
```

## Implementation Details

### State Capture Function

```typescript
const getCurrentState = (): CardGeneratorState => ({
    sessionId,
    projectId: currentProject?.id,
    currentStep: currentStepId,
    stepCompletion: {
        'text-generation': !!(itemDetails.name?.trim()),
        'core-image': !!selectedFinalImage,
        'border-generation': !!selectedBorder && !!selectedFinalImage,
        'card-back': true,
        'final-assembly': false
    },
    itemDetails,
    selectedAssets: {
        finalImage: selectedFinalImage,
        border: selectedBorder,
        seedImage: selectedSeedImage,
        generatedCardImages,      // ✅ Now included
        selectedGeneratedCardImage // ✅ Now included
    },
    generatedContent: {
        images: generatedImages,
        renderedCards
    },
    metadata: {
        lastSaved: Date.now().toString(),
        version: '1.0.0',
        platform: navigator.userAgent
    }
});
```

### Auto-Save Trigger

```typescript
useEffect(() => {
    if (initialLoadComplete.current && !isRestoringState.current) {
        // Immediate localStorage backup
        saveToLocalStorage();
        
        // Debounced server save
        debouncedSave();
    }
}, [
    // All state variables that should trigger saves
    currentStepId, itemDetails, selectedFinalImage, selectedBorder,
    selectedSeedImage, templateBlob, generatedImages, renderedCards,
    generatedCardImages, selectedGeneratedCardImage,  // ✅ Fixed: was missing
    saveToLocalStorage, debouncedSave
]);
```

## Common Issues & Solutions

### Issue: Data Loss After Image Generation
**Cause**: Auto-save wasn't triggered by Step 3 state changes  
**Solution**: ✅ Fixed - Added missing state variables to auto-save dependency array

### Issue: Save Takes Too Long
**Cause**: 5-second debounce felt unresponsive  
**Solution**: ✅ Fixed - Reduced to 2-second debounce + immediate localStorage

### Issue: No Visual Feedback
**Cause**: Users didn't know if their work was saved  
**Solution**: ✅ Fixed - Added save status indicators in header

### Issue: Complete Data Loss on Browser Crash
**Cause**: Only server saves, no local backup  
**Solution**: ✅ Fixed - Added immediate localStorage backup with 24-hour recovery

## Critical Step 3 Persistence Issues (Fixed July 2025)

### Issue: Step 3 Generated Card Images Not Persisting
**Problem**: Users would generate card variations in Step 3, select one, but after page refresh all generated images would disappear.

**Root Causes**:
1. **Missing Auto-save Callback**: `handleSelectedGeneratedCardImageChange` only updated local state but didn't trigger server saves
2. **Race Condition**: `isRestoringState` blocked auto-saves for 1000ms, creating a dangerous window where project restoration could overwrite unsaved changes  
3. **Session Recovery Override**: Project initialization always loaded server state, overwriting session recovery that had correctly restored card images

**Symptoms**:
```
💾 Auto-save SKIPPED: { isRestoringState: true, generatedCardImages: 4 }
🔄 restoreProjectState called with: { cardImages: 0, selectedCard: false }
🎯 Step3: Syncing persisted images: { persistedCount: 0, currentCount: 4 }
```

**Solutions Implemented**:

#### 1. Added Auto-save to Card Selection
```typescript
// Before: Only updated state
const handleSelectedGeneratedCardImageChange = (image: string) => setSelectedGeneratedCardImage(image);

// After: Updates state + triggers save
const handleSelectedGeneratedCardImageChange = (image: string) => {
    setSelectedGeneratedCardImage(image);
    
    // Force immediate save when card image is selected
    if (currentProject && userId && initialLoadComplete.current && !isRestoringState.current) {
        setTimeout(() => saveCurrentProject(), 100);
    }
};
```

#### 2. Reduced Auto-save Blocking Window
```typescript
// Before: 1000ms blocking window
setTimeout(() => {
    isRestoringState.current = false;
}, 1000);

// After: 100ms blocking window  
setTimeout(() => {
    isRestoringState.current = false;
}, 100);
```

#### 3. Session Recovery Priority System
```typescript
// Before: Always loaded project state (overwrote session recovery)
await switchToProject(mostRecent.id);

// After: Session recovery takes precedence
const hasRecentSession = recoveredState && recoveredState.itemDetails?.name?.trim();

if (hasRecentSession) {
    console.log('⚠️ Skipping project load - session recovery takes precedence');
} else {
    await switchToProject(mostRecent.id);
}
```

**Impact**: 
- ✅ Card images now persist through page refreshes
- ✅ Session recovery preserves unsaved work
- ✅ Auto-save triggers properly for all Step 3 actions
- ✅ Race conditions eliminated

**Testing**: Generate cards in Step 3 → select one → refresh page → cards should still be there
5## Testing Scenarios

### Manual Testing Checklist

1. **Basic Save Flow**
   - [ ] Enter item details → see immediate localStorage backup
   - [ ] Wait 2 seconds → see "⏳ Saving..." → "✅ Saved"
   - [ ] Check that save status clears after 3 seconds

2. **Step 3 Critical Path** (High Priority - Previous Major Issue)
   - [ ] Generate images in Step 3 → immediate localStorage backup
   - [ ] Select an image → localStorage updates immediately  
   - [ ] Wait 2 seconds → server save triggers with new selection
   - [ ] **Critical**: Refresh page → verify all generated images persist
   - [ ] **Critical**: Verify selected card remains selected after refresh
   - [ ] Check logs show "⚠️ Skipping project load - session recovery takes precedence"

3. **Session Recovery**
   - [ ] Start card creation, add details and generate images
   - [ ] Close browser tab (simulate crash)
   - [ ] Reopen application → state should be restored
   - [ ] Verify all generated images and selections are preserved

4. **Error Handling**
   - [ ] Disconnect network → see "❌ Save Error"
   - [ ] Reconnect → next change should trigger successful save
   - [ ] Verify data preserved throughout network issues

5. **Project Integration**
   - [ ] Create named project → verify server save
   - [ ] Load existing project → verify state restoration
   - [ ] Make changes to loaded project → verify updates save correctly

## Configuration

### Timing Constants
```typescript
const DEBOUNCE_DELAY = 2000;          // Server save delay (2 seconds)
const BACKUP_RETENTION = 24 * 60 * 60 * 1000; // 24 hours
const SAVE_STATUS_CLEAR_DELAY = 3000; // Success indicator (3 seconds)  
const ERROR_STATUS_CLEAR_DELAY = 5000; // Error indicator (5 seconds)

// Critical: Auto-save blocking windows (Fixed Dec 2024)
const RESTORE_STATE_DELAY = 100;      // Was 1000ms - reduced to prevent race conditions
const IMMEDIATE_SAVE_DELAY = 100;     // For forced saves after user actions
const DIFF_DETECTION_SAVE_DELAY = 200; // Was 500ms - faster conflict resolution
```

### localStorage Keys
```typescript
const STORAGE_KEYS = {
    SESSION_BACKUP: 'cardGenerator_sessionBackup'
};
```

## Future Improvements

1. **Conflict Resolution**: Handle multiple browser tabs
2. **Offline Support**: Queue saves when offline
3. **Compression**: Reduce localStorage backup size
4. **Analytics**: Track save success rates
5. **Migration**: Handle state schema changes

---

**Last Updated**: December 2024  
**Version**: 1.0  
**Status**: Implemented ✅ 