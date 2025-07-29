# CardGenerator Next Steps & Improvements

## ✅ Recently Fixed Issues

### 1. Firestore Save Error - FIXED
**Problem:** `400 Property selectedAssets contains an invalid nested entity` - templateBlob base64 was exceeding Firestore's 1MB document size limit
**Solution:** Modified `firestorePersistence.ts` to exclude templateBlob from Firestore storage, only store in localStorage
**Files Modified:**
- `LandingPage/src/utils/firestorePersistence.ts` - Updated saveCardSession to exclude templateBlob from Firestore
**Status:** ✅ Fixed - Save functionality should now work without size limit errors

Still to do : No load function, and display some details about the project. 

## 🚨 High Priority (Critical UX Issues)




### 5. Assembly Page Non-Functional
**Problem:** Card assembly page completely broken
**Impact:** Users can't complete card creation workflow
**Action Items:**
- [ ] Fix card preview rendering
- [ ] Implement final card generation
- [ ] Add download/export functionality
- [ ] Test complete workflow end-to-end

## 🎯 Medium Priority (Feature Enhancements)

### 6. Workflow Reorganization
**Problem:** Card back generation should be bonus step, front is priority
**Impact:** Better user experience with focused workflow
**Action Items:**
- [ ] Move card back generation to bonus/optional step
- [ ] Make front card generation Step 4 (after text addition)
- [ ] Update step navigation to reflect new flow
- [ ] Add clear indication of required vs optional steps
- [ ] Update progress indicators

### 7. Logout Button Visibility
**Problem:** Logout button not visible or functional
**Impact:** Users can't log out, security concern
**Action Items:**
- [ ] Debug logout button in NavBar.tsx
- [ ] Check browser console for errors
- [ ] Ensure proper authentication state handling
- [ ] Test logout functionality end-to-end

## 🔧 Lower Priority (Technical Improvements)

### 8. Upgrade Bottom Header to Mantine
**Problem:** Current header not using Mantine components
**Impact:** Inconsistent design system
**Action Items:**
- [ ] Identify current "bottom header" component (FloatingHeader?)
- [ ] Refactor to use Mantine Header, Group, Button components
- [ ] Apply consistent theme tokens and spacing
- [ ] Ensure responsive behavior with Mantine breakpoints
- [ ] Update hover states and interactions
- [ ] Test with new step tab navigation

### 9. Image Persistence Debugging
**Problem:** Image state not persisting across navigation/refresh
**Impact:** Users lose generated images
**Action Items:**
- [ ] Add console.log to image state changes
- [ ] Track where persistence breaks
- [ ] Fix image data in state saves
- [ ] Update firestorePersistence.ts for image handling
- [ ] Test image persistence across all steps

## 📋 Implementation Strategy

### Phase 1: Critical Fixes (Week 1)
1. **Image Gallery Display** - Fix overflow and aspect ratio issues
2. **Image Removal** - Add X buttons and removal functionality
3. **Project State Management** - Fix save/load and isolate per project
4. **Assembly Page** - Debug and restore functionality

### Phase 2: Workflow Improvements (Week 2)
5. **Workflow Reorganization** - Move card back to bonus step
6. **Logout Button** - Debug and fix authentication issues

### Phase 3: Polish & Debug (Week 3)
7. **Mantine Header Upgrade** - Design system consistency
8. **Image Persistence** - Debug state management

## 🎯 Success Metrics

- [ ] **All image galleries display complete images without cropping**
- [ ] **Users can remove unwanted images with X buttons**
- [ ] **Project save/load works correctly with isolated state**
- [ ] **Assembly page functional and generates final cards**
- [ ] **Card back generation moved to bonus step**
- [ ] **Logout button visible and functional**
- [ ] **Zero data loss on navigation/refresh**

## 🔍 Key Files to Focus On

```
LandingPage/src/components/
├── NavBar.tsx                    # Fix logout button
├── CardGenerator/
│   ├── CardGenerator.tsx        # Project state management
│   ├── FloatingHeader.tsx       # Tab navigation, Mantine upgrade
│   ├── StepNavigation.tsx       # Workflow reorganization
│   ├── steps/
│   │   ├── Step2CoreImage.tsx   # Image gallery display fixes
│   │   ├── Step3BorderGeneration.tsx # Image removal functionality
│   │   └── Step4TextAddition.tsx # New step for text addition
│   ├── ImageGallery.tsx         # Fix overflow and add remove buttons
│   ├── CoreImageGallery.tsx     # Fix overflow and add remove buttons
│   ├── BorderGallery.tsx        # Fix overflow and add remove buttons
│   ├── CardWithTextGallery.tsx  # Fix overflow and add remove buttons
│   └── MyProjectsSidebar.tsx    # Project save/load with isolated state
├── utils/
│   └── firestorePersistence.ts  # ✅ Fixed - templateBlob size issue
└── context/
    └── AuthContext.tsx          # Debug logout functionality
```

## 💡 Quick Wins to Start With

1. **Debug image gallery CSS** - Check overflow and aspect-ratio properties
2. **Add remove buttons to galleries** - Simple X button with state removal
3. **Test project save functionality** - Add console.log to track save process
4. **Debug assembly page** - Check component rendering and data flow

---

*Updated: [Current Date]*
*Priority: Focus on Phase 1 items first for maximum user impact* 