> **Historical import from DungeonOverMind — 2026-09-24.** This document records an older DungeonMind Web/product implementation state. It is not current LandingPage architecture or sequencing authority. Re-anchor against current code before applying it.

# Learnings: Reusable Engine Development Patterns
**Date:** 2025-12-27  
**Context:** GenerationDrawerEngine development and refinement  
**Last Updated:** 2025-12-31 (Final Review: 46 learnings, 22 anti-patterns)  
**Status:** ✅ COMPLETE - Spec 001 closed  

---

## Overview

This document captures patterns learned while developing reusable engines (GenerationDrawerEngine) and the demo page approach for testing them. These patterns apply to future engines like CRUD Engine and Project Drawer.

---

## Key Takeaways

### Architecture & Testing
1. **Demo pages are invaluable** - Build a dedicated test harness before integrating with services
2. **Manual test checklists are documentation** - 46 categorized test cases = living feature specification
3. **Generic endpoints trump service-specific** - `/api/images/generate` beats `/api/statblockgenerator/generate-image`
4. **Shared configuration is essential** - Single source of truth prevents drift between routers
5. **Health checks reveal integration issues** - Show all service statuses in demo page
6. **Service selector enables targeted testing** - Toggle between StatBlock/PCG to test different integrations

### API Contracts & Data Flow
7. **Contract alignment catches bugs early** - Frontend-backend field names must match exactly
8. **Normalize response shapes at boundaries** - Handle nested responses and snake_case → camelCase
9. **Dual transforms for different modes** - Text vs Image generation need different request bodies
10. **skipTransform when engine needs raw response** - Bypass output transform for image extraction

### State Management
11. **Optimistic updates for delete** - Update UI immediately, backend is best-effort
12. **Unified state for multiple views** - Add to both gallery AND library explicitly
13. **React key fallbacks** - `id || url || index` for items without stable IDs
14. **Callback pipelines for cross-state sync** - When shared hooks modify data also held in provider state, use callbacks to keep them in sync
15. **Debounced save race conditions** - Deletes must update provider state to prevent debounced saves from re-adding deleted items

### Service Integration (StatBlock Migration Learnings)
16. **Factory pattern for automatic wiring** - Encapsulate `setIsGenerating` calls in factory to prevent forgetting
17. **onGeneratingChange prop** - Engine syncs internal generation state to parent automatically
18. **beforeunload for OAuth redirects** - useEffect won't fire before page unload, use beforeunload event
19. **Always clear stale derived state** - Use `|| ''` to clear previous values, don't conditionally skip
20. **Relative paths for API endpoints** - Let HTTP layer add base URL once
21. **Async vs sync in Python** - Every I/O in async function must be awaited, or blocks event loop
22. **Deduplication hash completeness** - Include ALL persisted data in auto-save hash

### PCG Migration Learnings
23. **Mantine Select in Drawer z-index** - Use `comboboxProps={{ withinPortal: true, zIndex: 500 }}` for Select dropdowns in drawers
24. **Per-tab validation** - IMAGE tabs need different validation than TEXT tabs; don't reuse text field validators
25. **Input field conventions** - Engine uses `description` field for image prompts; add this field to your input type
26. **Prompt shaping for API limits** - Truncate long content (description, backstory) to stay under API character limits
27. **Composition vs Style separation** - Base prompt describes subject/composition; style dropdown adds art style suffix
28. **Build vs Generate drawers** - These are different interaction patterns; separate them rather than force into one
29. **Auto-switch tabs after generation** - Guide user to next logical step (e.g., image tab after text generation)
30. **Clear project state for new generations** - Call `clearCurrentProject()` before applying AI output
31. **Distinct callbacks for batch vs single** - `onImagesGenerated` (batch) vs `onImageSelected` (single item)
32. **DrawerShell zIndex conventions** - Base drawers: 400, Combobox portals: 500, Modals: 500+ (must be ABOVE drawers)
33. **Modal z-index above drawer** - ImageModal needs `zIndex={500}` to appear above DrawerShell (400)
34. **Reset modal state on drawer close** - Call `setModalOpened(false)` in drawer close handler
35. **Modal source tracking** - Use `modalSource` state to share modal between project gallery and library
36. **useCallback declaration order** - Functions in dependency arrays must be declared before the callback that uses them
37. **Git-based deps for Docker** - Local path deps fail in Docker; use `{ git = "..." }` in `[tool.uv.sources]`

### Process & Retrospective Learnings
38. **State location mapping in Phase 0** - Explicitly map where state lives and how mutations propagate before building engines
39. **Demo page ROI is 10x** - 2 hours invested saves 10+ hours debugging; build demo page FIRST
40. **TDD vs Demo Page testing** - Demo pages catch integration bugs better; TDD catches logic bugs better; be honest about which will get done
41. **300-line file threshold** - Check file sizes explicitly; >300 lines should trigger extraction consideration
42. **Handoff document separation** - Keep session handoffs, bug tracking, and status in separate documents

### Backend & Infrastructure Learnings
43. **OpenAI Structured Outputs** - Use `response_format.json_schema` for guaranteed schema compliance instead of manual JSON parsing
44. **Feature flag rollback pattern** - Add `USE_NEW_X` flags for major migrations; enables instant rollback without deploy
45. **Remove unused dependencies** - Storybook peer dependency conflicts fixed by removing Storybook entirely (wasn't used)
46. **Docker git for git-based deps** - Add `git` to `apt-get install` in Dockerfile when using git-based Python dependencies

---

## 1. Demo Page Pattern

**Problem:** Testing a reusable engine in the context of a real service (StatBlockGenerator) couples too many things. Hard to isolate engine bugs from service integration bugs.

**Solution:** Create a dedicated demo page that:
- Uses mock data by default (no backend required)
- Has "Live Mode" toggle to hit real endpoints
- Shows all service health statuses
- Has service selector to test different integrations
- Logs everything to console for debugging

```typescript
// Demo page structure
const GenerationDrawerDemo = () => {
  const [liveMode, setLiveMode] = useState(false);
  const [selectedService, setSelectedService] = useState<'statblock' | 'pcg'>('statblock');
  const { health, checkHealth } = useBackendHealth();
  
  // Toggle between mock and real endpoints
  const config = createDemoConfig({
    liveMode,
    selectedService,
    onGenerate: liveMode ? realEndpoint : mockEndpoint
  });
  
  return (
    <>
      <ServiceSelector value={selectedService} onChange={setSelectedService} />
      <HealthStatusPanel health={health} />
      <LiveModeToggle enabled={canEnableLiveMode} value={liveMode} />
      <GenerationDrawerEngine config={config} />
    </>
  );
};
```

**Lesson:** Build the test harness first. It pays for itself 10x in debugging time saved.

### Manual Test Checklist Pattern

The demo page includes a comprehensive **Manual Test Checklist** with categorized test cases:

```typescript
// Checklist categories from GenerationDrawerDemo
const TEST_CATEGORIES = [
  { name: 'Drawer Shell', count: 4 },
  { name: 'Tab Navigation', count: 3 },
  { name: 'Input Form', count: 4 },
  { name: 'Generation Flow', count: 4 },
  { name: 'Text Generation Results', count: 3 },
  { name: 'Image Generation Results', count: 5 },
  { name: 'State Persistence', count: 4 },
  { name: 'Accessibility', count: 2 },
  { name: 'Console Verification', count: 1 },
  { name: 'Upload Tab', count: 4 },
  { name: 'Library Tab', count: 3 },
  { name: 'Project Gallery', count: 5 },
  { name: 'Live Mode', count: 4 },
];
// Total: 46 test cases
```

**Benefits:**
- **Systematic verification** - Don't forget edge cases
- **Progress tracking** - See 0/46 → 46/46 as you test
- **Regression catching** - Re-run after changes
- **Onboarding** - New devs learn capabilities by testing them
- **Documentation** - Checklist IS the feature specification

**Key Insight:** The checklist serves double duty as both QA tool AND living documentation of what the engine should do.

---

## 2. Generic vs Service-Specific Endpoints

**Problem:** Started with `/api/statblockgenerator/generate-image`. As other services (PCG, CardGen) needed image generation, this coupling became awkward.

```
❌ WRONG: Service-specific image endpoints
/api/statblockgenerator/generate-image
/api/playercharactergenerator/generate-image  (duplication!)
/api/cardgenerator/generate-image  (duplication!)
```

**Solution:** Extract to generic endpoint that all services use.

```
✅ CORRECT: Generic image endpoints
/api/images/
├── capabilities  GET   - available models/styles
├── generate      POST  - AI image generation
├── upload        POST  - file upload
└── delete        DELETE
```

**Benefits:**
- Single implementation to maintain
- Consistent API contract across all services
- Easy to add new services without new endpoints
- Clear separation: images are images, regardless of what service uses them

**Lesson:** If two services need the same capability, extract it immediately. Don't wait for a third.

---

## 3. Shared Configuration Pattern

**Problem:** Model mappings were duplicated in multiple routers. When adding new models, had to update in multiple places.

```python
# ❌ WRONG: Duplicated in each router
# statblockgenerator_router.py
model_map = {
    "flux-pro": ImageModel.FLUX_PRO,
    "imagen4": ImageModel.IMAGEN4,  # Easy to forget this one
}

# image_management_router.py  
model_map = {
    "flux-pro": ImageModel.FLUX_PRO,
    # Oops, forgot imagen4 here!
}
```

**Solution:** Single source of truth in shared module.

```python
# ✅ CORRECT: shared/image_models.py
MODEL_MAP = {
    "flux-pro": ImageModel.FLUX_PRO,
    "hunyuan": ImageModel.HUNYUAN,
    "dreamina": ImageModel.DREAMINA,
    "flux-kontext": ImageModel.FLUX_KONTEXT,
    "nano-banana": ImageModel.NANO_BANANA,
    "openai": ImageModel.OPENAI,
}

IMAGE_CAPABILITIES = {
    "models": [...],
    "styles": [...],
    "maxImages": 4
}

# Routers import from shared
from shared.image_models import MODEL_MAP, IMAGE_CAPABILITIES
```

**Lesson:** DRY applies to configuration too. If you type the same mapping twice, extract it.

---

## 4. Health Check Panel Pattern

**Problem:** "Is it the frontend, the backend, or the specific service?" Hard to diagnose when something doesn't work.

**Solution:** Health check panel that shows all relevant services at a glance.

```typescript
// useBackendHealth hook
const checkHealth = async () => {
  const [api, sbg, pcg, imgCap] = await Promise.all([
    checkEndpoint('/api/health'),
    checkEndpoint('/api/statblockgenerator/health'),
    checkEndpoint('/api/playercharactergenerator/health'),
    checkEndpoint('/api/images/capabilities')
  ]);
  
  return { api, sbg, pcg, imgCap, anyOnline, allOnline };
};

// UI Component
<SimpleGrid cols={4}>
  <StatusIndicator label="API" status={health.api.status} />
  <StatusIndicator label="StatBlock" status={health.sbg.status} />
  <StatusIndicator label="PCG" status={health.pcg.status} />
  <StatusIndicator label="Images" status={health.imgCap.status} />
</SimpleGrid>
```

**Lesson:** Make system health visible. Red/green indicators save hours of "is it running?" debugging.

---

## 5. Frontend-Backend Contract Alignment

**Problem:** Frontend sends `sd_prompt`, backend expects `prompt`. 422 Validation Error.

```typescript
// ❌ WRONG: Field name mismatch
// Frontend
imageTransformInput: (input) => ({
  sd_prompt: input.description  // Old field name
})

// Backend expects:
class ImageGenerateRequest(BaseModel):
    prompt: str  # New field name!
```

**Symptom:** `422 Unprocessable Content` with cryptic error object

**Solution:** Use the canonical field name from the API contract.

```typescript
// ✅ CORRECT: Match the API contract
imageTransformInput: liveMode 
    ? (input) => ({ prompt: input.description })      // Live: /api/images/generate
    : (input) => ({ sd_prompt: input.description })   // Demo: mock endpoint
```

**Lesson:** When debugging 422 errors, compare request payload field names with Pydantic model field names character-by-character.

---

## 6. OpenAI GPT-Image API Gotchas

**Problem:** OpenAI's newer GPT-Image models (`gpt-image-1`, `gpt-image-1-mini`) have different API parameters than DALL-E.

```python
# ❌ WRONG: DALL-E parameters don't work with GPT-Image
response = client.images.generate(
    model="gpt-image-1-mini",
    prompt=prompt,
    response_format="b64_json",  # ❌ Unknown parameter!
)
```

**Error:** `Unknown parameter: 'response_format'`

**Solution:** GPT-Image returns b64_json by default, no need to specify.

```python
# ✅ CORRECT: GPT-Image parameters
if is_gpt_image:
    response = client.images.generate(
        model="gpt-image-1-mini",
        prompt=prompt,
        n=num_images,
        size="1024x1024",  # Only specific sizes supported
    )
    # Returns b64_json by default
else:
    # DALL-E can specify response_format
    response = client.images.generate(
        model="dall-e-3",
        response_format="b64_json",
        ...
    )
```

**Key differences:**
| Parameter | GPT-Image | DALL-E |
|-----------|-----------|--------|
| `response_format` | Not supported | Supported |
| Return format | b64_json default | URL default |
| Sizes | 1024x1024, 1536x1024, 1024x1536 | Various |

**Lesson:** Read the API docs for each model family. Don't assume parameters are universal.

---

## 7. Service Selector for Multi-Service Testing

**Problem:** Demo page only tested StatBlock integration. PCG integration might have different bugs.

**Solution:** Add service selector to toggle between service configurations.

```typescript
// SegmentedControl for service selection
<SegmentedControl
  value={selectedService}
  onChange={setSelectedService}
  data={[
    { label: 'StatBlock', value: 'statblock' },
    { label: 'PCG', value: 'pcg' }
  ]}
/>

// Config changes based on selection
const canEnableLiveMode = selectedService === 'statblock' 
    ? health.statblockgenerator.status === 'online'
    : health.playercharactergenerator.status === 'online';
```

**Lesson:** If an engine serves multiple services, test all of them from the demo page.

---

## 8. Response Shape Normalization

**Problem:** Backend returns nested responses with different field names than frontend expects.

```typescript
// Backend returns:
{ success: true, data: { images: [...] } }  // Nested under data
{ image: { id, url, ... } }                  // Nested under image
{ created_at: "..." }                        // Snake case

// Frontend expects:
{ images: [...] }                            // Direct
{ id, url, ... }                            // Direct
{ createdAt: "..." }                        // Camel case
```

**Symptom:** "Upload success: undefined" or images not appearing in gallery.

**Solution:** Normalize at the extraction point.

```typescript
// ✅ CORRECT: Try multiple response patterns
const responseData = await response.json();

// Handle nested: { image: { ... } } vs { id, url, ... }
const uploadedImage = responseData.image || responseData;

// Handle nested: { data: { images: [...] } } vs { images: [...] }
let rawImages: GeneratedImage[] | undefined;
if (outputObj?.data && typeof outputObj.data === 'object') {
  const dataObj = outputObj.data as Record<string, unknown>;
  if (Array.isArray(dataObj.images)) {
    rawImages = dataObj.images;  // Pattern 1: data.images
  }
} else if (Array.isArray(outputObj?.images)) {
  rawImages = outputObj.images;  // Pattern 2: images
}

// Normalize field names
const newImages = rawImages.map((img) => ({
  ...img,
  createdAt: img.createdAt || img.created_at || new Date().toISOString(),
  sessionId: img.sessionId || imageConfig?.sessionId || '',
}));
```

**Lesson:** Document the exact response shape in API contracts. When they differ, normalize at the boundary.

---

## 9. Optimistic Updates for Delete

**Problem:** Delete → API call → fetchLibrary() would refresh and overwrite local state before the user saw the deletion.

```typescript
// ❌ WRONG: Refresh after delete can race
const deleteImage = async (imageId: string) => {
  await fetch(`/api/images/delete/${imageId}`, { method: 'DELETE' });
  await fetchLibrary(currentPage);  // Race condition!
};
```

**Symptom:** Deleted item briefly disappears, then reappears.

**Solution:** Optimistic update - modify UI immediately, backend call is best-effort.

```typescript
// ✅ CORRECT: Optimistic update pattern
const deleteImage = async (imageId: string) => {
  // 1. Remove from UI immediately
  setImages(prev => prev.filter(img => img.id !== imageId));
  setTotal(prev => Math.max(0, prev - 1));
  
  // 2. Backend delete is best-effort (don't block on it)
  try {
    await fetch(`/api/images/delete/${imageId}`, { method: 'DELETE' });
  } catch (err) {
    // Log but don't restore - item is already gone from UI
    console.error('Backend delete failed:', err);
  }
  // 3. DON'T call fetchLibrary - local state is already correct
};
```

**Lesson:** For delete operations, update UI first. Users expect instant feedback.

---

## 10. Dual Transform Pattern (Text vs Image)

**Problem:** Text generation and image generation need different request body formats, but the engine has a single `transformInput`.

```typescript
// Text generation needs:
{ description: "...", name: "...", challengeRating: 5 }

// Image generation needs:
{ sd_prompt: "...", num_images: 4, model: "flux-pro" }
```

**Solution:** Add `imageTransformInput` alongside `transformInput`.

```typescript
// ✅ CORRECT: Separate transforms per generation type
interface GenerationDrawerConfig {
  transformInput: (input: TInput) => Record<string, unknown>;      // Text
  imageTransformInput?: (input: TInput) => Record<string, unknown>; // Image
}

// In engine:
const isImageGeneration = activeGenerationType === GenerationType.IMAGE;
const transformOverride = isImageGeneration && imageTransformInput
  ? imageTransformInput
  : undefined;

await generation.generate(inputValue, { transformOverride });
```

**Lesson:** When different modes need different request formats, make transforms mode-aware.

---

## 11. skipTransform for Raw Response Access

**Problem:** `transformOutput` converts raw API response before engine can extract images.

```typescript
// transformOutput does this:
{ success: true, data: { images: [...] } }  →  { statblock: {...}, images: [] }

// Engine then checks output.images → empty!
```

**Symptom:** Generation succeeds but images don't appear in gallery.

**Solution:** Add `skipTransform` option for image generation to get raw response.

```typescript
// In useGeneration hook:
interface GenerateOptions {
  skipTransform?: boolean;  // Return raw response
}

const output = options?.skipTransform 
  ? responseData as TOutput      // Raw for image extraction
  : config.transformOutput(responseData);  // Transformed for text

// In engine:
const skipTransform = activeGenerationType === GenerationType.IMAGE;
await generation.generate(inputValue, { skipTransform });
```

**Lesson:** When the engine needs to process raw response (not the transformed one), bypass the transform.

---

## 12. Unified State: Gallery + Library

**Problem:** Generated images appeared in Project Gallery but not in Library tab.

**Root cause:** Images were added to `generatedImages` state but not `imageLibrary.images` state.

**Solution:** Add to both states explicitly.

```typescript
// ✅ CORRECT: Add to both gallery AND library
if (rawImages && rawImages.length > 0) {
  const newImages = rawImages.map(normalize);
  
  // Add to project gallery
  setGeneratedImages((prev) => [...prev, ...newImages]);
  
  // Add to library as well
  imageLibrary.addImages(newImages);
  
  // Notify service
  imageConfig?.onImageGenerated?.(newImages);
}

// useImageLibrary hook needs addImages function:
const addImages = useCallback((newImages: SessionImage[]) => {
  setImages(prev => {
    const existingIds = new Set(prev.map(img => img.id));
    const uniqueNew = newImages.filter(img => !existingIds.has(img.id));
    return [...uniqueNew, ...prev];  // Newest first
  });
  setTotal(prev => prev + newImages.length);
}, []);
```

**Lesson:** When content appears in multiple views (gallery, library), explicitly add to each view's state.

---

## 13. React Key Fallbacks

**Problem:** `key={image.id}` fails when `image.id` is undefined, causing React warnings.

```
Warning: Each child in a list should have a unique "key" prop.
```

**Symptom:** Happens with freshly generated/uploaded images before backend assigns ID.

**Solution:** Cascade through fallback keys.

```typescript
// ✅ CORRECT: Fallback key chain
{images.map((image, index) => {
  const imageKey = image.id || image.url || `gallery-${index}`;
  return <Card key={imageKey}>...</Card>;
})}
```

**Priority:** `id` (stable) → `url` (usually unique) → `index` (last resort)

**Lesson:** Always have fallback keys for dynamically created items that might not have IDs yet.

---

## 14. Debounced Save Race Condition with Delete

**Problem:** User deletes image from library. Backend successfully removes from Firestore. But after refresh, deleted image reappears!

```typescript
// ❌ WRONG: Delete from backend but not from provider state
const deleteImage = async (imageId: string) => {
  // Remove from local hook state (optimistic)
  setImages(prev => prev.filter(img => img.id !== imageId));
  
  // Delete from Firestore via backend
  await fetch(`/api/images/delete?image_url=${url}`, { method: 'DELETE' });
  
  // ❌ MISSING: Provider's generatedContent.images still has the deleted image!
};

// Meanwhile, in the provider (runs every 2 seconds):
useEffect(() => {
  debouncedSave(generatedContent);  // Re-saves the deleted image!
}, [generatedContent]);
```

**Symptom:** 
- Delete succeeds (verified via read-after-write)
- Frontend shows image removed
- Refresh → image reappears

**Root Cause:** Two state locations for the same data:
1. `useImageLibrary.images` - Hook-local state (updated on delete)
2. `StatBlockGeneratorProvider.generatedContent.images` - Provider state (NOT updated on delete)

The debounced save fires after delete and writes the old provider state (which still has the image) back to Firestore.

**Solution:** Add callback pipeline to sync delete across all state locations.

```typescript
// ✅ CORRECT: Callback pipeline syncs delete to provider

// 1. Add callback to hook config
interface UseImageLibraryConfig {
  onImageDeleted?: (imageId: string, imageUrl: string) => void;  // NEW
}

// 2. Call callback after successful delete
const deleteImage = async (imageId: string) => {
  setImages(prev => prev.filter(img => img.id !== imageId));
  
  await fetch(`/api/images/delete?...`);
  
  // Notify provider to update its state too
  if (onImageDeleted) {
    onImageDeleted(imageId, imageToDelete.url);
  }
};

// 3. Wire through engine and factory to provider
// factory.tsx
handleImageDeleted: (ctx, imageId, imageUrl) => {
  const imageInProject = ctx.generatedContent.images.find(
    img => img.id === imageId || img.url === imageUrl
  );
  if (imageInProject) {
    ctx.removeGeneratedImage(imageInProject.id);  // Updates provider state
  }
}
```

**Data Flow After Fix:**
```
User clicks Delete
    ↓
useImageLibrary.deleteImage()
├── Removes from hook state
├── Calls backend DELETE
└── Calls onImageDeleted callback ← NEW
        ↓
    handleImageDeleted(ctx, imageId, imageUrl)
        ↓
    ctx.removeGeneratedImage(imageId)
        ↓
    Provider's generatedContent.images updated
        ↓
    Debounced save writes CORRECT state
        ↓
    Refresh → Image stays deleted ✅
```

**Files Affected:**
- `types.ts` - Add `onImageDeleted` to ImageConfig
- `useImageLibrary.ts` - Add config option and call it
- `GenerationDrawerEngine.tsx` - Pass through to hook
- `factory.tsx` - Add `handleImageDeleted` factory config
- `StatBlockGenerationDrawer.tsx` - Implement handler

**Lesson:** When data exists in multiple state locations (hook + provider), any mutation must update ALL locations. Debounced saves are especially dangerous because they race with other operations.

---

## 15. Callback Pipeline Pattern for Multi-State Sync

**Problem:** Reusable hooks/engines manage their own state but the consuming service also has state. How do you keep them in sync?

**Example:** `useImageLibrary` hook has `images` state. `StatBlockGeneratorProvider` has `generatedContent.images`. Both represent "images in the current project."

**Pattern:** Callback pipeline that flows from hook → engine → factory → service.

```
┌─────────────────────────────────────────────────────────────────┐
│                        Callback Pipeline                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  useImageLibrary (hook)                                         │
│       │                                                         │
│       ├── onImageDeleted(id, url)   ← Fires after delete        │
│       ▼                                                         │
│  GenerationDrawerEngine (engine)                                │
│       │                                                         │
│       ├── config.imageConfig.onImageDeleted                     │
│       ▼                                                         │
│  createServiceDrawer (factory)                                  │
│       │                                                         │
│       ├── factoryConfig.handleImageDeleted(ctx, id, url)        │
│       ▼                                                         │
│  Service Context (provider)                                     │
│       │                                                         │
│       └── ctx.removeGeneratedImage(id)  ← State updated         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Implementation:**

```typescript
// 1. Hook defines callback in config
interface UseImageLibraryConfig {
  onImageDeleted?: (imageId: string, imageUrl: string) => void;
}

// 2. Engine passes through from its config
const imageLibrary = useImageLibrary({
  ...endpoints,
  onImageDeleted: resolvedImageConfig?.onImageDeleted
});

// 3. Factory creates wrapped handler with context
const handleImageDelete = useCallback((imageId: string, imageUrl: string) => {
  handleImageDeleted?.(ctx, imageId, imageUrl);  // Factory config
}, [ctx]);

// 4. Factory wires into engine config
imageConfig: {
  ...engineConfig.imageConfig,
  onImageDeleted: handleImageDelete
}

// 5. Service implements the handler
const FactoryStatBlockDrawer = createServiceDrawer({
  handleImageDeleted: (ctx, imageId, imageUrl) => {
    const img = ctx.generatedContent.images.find(i => i.id === imageId);
    if (img) ctx.removeGeneratedImage(img.id);
  }
});
```

**When to Use:**
- Reusable component/hook has its own state
- Consuming service ALSO has state for the same data
- Operations in the reusable component must sync to service state

**Operations that Need Callbacks:**
- `onImageGenerated` - Add to provider's generatedContent
- `onImageSelected` - Update provider's selectedAssets
- `onImageDeleted` - Remove from provider's generatedContent ← Commonly forgotten!

**Lesson:** For every operation that modifies shared data, ask: "Where else is this data stored? Does that location also need to be updated?"

---

## Patterns for Future Engines

### CRUD Engine & Project Drawer

Apply these patterns when building:

1. **Demo Page First**
   - Create `/demo/crud-engine` or `/demo/project-drawer`
   - Mock mode by default
   - Live mode toggle
   - Service selector (which service's CRUD to test)
   - **Manual Test Checklist** with all features categorized

2. **Generic Endpoints**
   ```
   /api/projects/
   ├── list      GET
   ├── create    POST
   ├── read      GET /:id
   ├── update    PUT /:id
   └── delete    DELETE /:id
   ```

3. **Shared Configuration**
   ```python
   # shared/project_config.py
   PROJECT_TYPES = { ... }
   DEFAULT_PAGINATION = { ... }
   ```

4. **Health Checks**
   - Add relevant endpoints to `useBackendHealth`
   - Show in demo page status panel

5. **Callback Pipelines for State Sync**
   - Identify all state locations for shared data
   - Add callbacks: `onItemCreated`, `onItemUpdated`, `onItemDeleted`
   - Wire through: hook → engine → factory → service context
   - Test: Modify data → verify ALL state locations update

---

## 16. Factory Pattern: Automatic Context Wiring

**Problem:** Manual wrapper components for GenerationDrawerEngine require remembering to:
1. Extract `setIsGenerating` from context and call it at start/end
2. Wire all callbacks correctly
3. Transform output and update context state

This is error-prone. The StatBlock migration initially failed because `setIsGenerating` wasn't called, causing the canvas to not re-render.

```typescript
// ❌ WRONG: Manual wrapper - easy to forget setIsGenerating
const StatBlockGenerationDrawer = ({ opened, onClose }) => {
    const { replaceCreatureDetails } = useStatBlockGenerator();
    // MISSING: setIsGenerating from context!
    
    return (
        <GenerationDrawerEngine
            config={config}
            opened={opened}
            onClose={onClose}
            onGenerationComplete={(output) => {
                replaceCreatureDetails(output.statblock);
                // MISSING: setIsGenerating(false)!
            }}
        />
    );
};
```

**Solution:** Create a factory that automatically wires context integration.

```typescript
// ✅ CORRECT: Factory pattern handles wiring automatically
export function createServiceDrawer<TContext, TInput, TOutput>(
    factoryConfig: ServiceDrawerFactoryConfig<TContext, TInput, TOutput>
): React.FC<ServiceDrawerProps> {
    return function FactoryDrawer({ opened, onClose }) {
        const ctx = factoryConfig.useContext();
        
        // Automatic isGenerating sync via onGeneratingChange
        const handleGeneratingChange = useCallback((isGenerating: boolean) => {
            factoryConfig.getIsGeneratingSetter(ctx)(isGenerating);
        }, [ctx]);
        
        return (
            <GenerationDrawerEngine
                {...resolvedConfig}
                onGeneratingChange={handleGeneratingChange}  // ← Automatic!
                onGenerationComplete={(output) => {
                    factoryConfig.handleOutput(ctx, output);
                }}
            />
        );
    };
}

// Service implementation is now ~40 lines instead of ~120
export const StatBlockGenerationDrawer = createServiceDrawer({
    serviceId: 'statblock',
    InputForm: StatBlockInputForm,
    engineConfig: statblockEngineConfig,
    useContext: useStatBlockGenerator,
    getIsGeneratingSetter: (ctx) => ctx.setIsGenerating,
    handleOutput: (ctx, output) => {
        ctx.replaceCreatureDetails(output.statblock);
        ctx.setImagePrompt(output.imagePrompt || '');
    }
});
```

**Benefits:**
- **Impossible to forget `setIsGenerating`** - Factory handles it via `onGeneratingChange`
- **67% code reduction** - ~120 lines → ~40 lines per service
- **Type-safe** - Factory config is fully typed with context type
- **Consistent logging** - Factory can add standard logging

**Lesson:** When a pattern requires remembering multiple steps (like calling `setIsGenerating` at start AND end), encapsulate it in a factory/wrapper that makes it automatic.

---

## 17. Engine Enhancement: onGeneratingChange Prop

**Problem:** Parent components need to know when generation starts/stops, but the engine manages generation state internally via `useGeneration` hook.

**Solution:** Add `onGeneratingChange` prop that syncs internal state to parent.

```typescript
// types.ts - Add to engine props
export interface GenerationDrawerEngineProps<TInput, TOutput> {
    // ... existing props
    /** Sync generation state to parent (called when isGenerating changes) */
    onGeneratingChange?: (isGenerating: boolean) => void;
}

// GenerationDrawerEngine.tsx - Auto-sync generation state
export function GenerationDrawerEngine<TInput, TOutput>(props: Props) {
    const { onGeneratingChange } = props;
    const generation = useGeneration<TInput, TOutput>(...);
    
    // NEW: Auto-sync generation state to parent
    useEffect(() => {
        onGeneratingChange?.(generation.isGenerating);
    }, [generation.isGenerating, onGeneratingChange]);
    
    // ... rest unchanged
}
```

**Why This Matters for StatBlock:**

`StatBlockCanvas.tsx` checks `isGenerating` from context to decide whether to show loading state:
```typescript
if (isGenerating) {
    return <Card><Text>🎲 Generating Creature...</Text></Card>;
}
// Otherwise render the statblock
```

Without setting this flag, the canvas doesn't know to unmount/remount, and `useMemo` can return stale content.

**Lesson:** When an engine manages internal state that parents need, provide a sync callback prop rather than expecting parents to set state manually.

---

## 18. State Persistence Across OAuth Redirects

**Problem:** User generates content while logged out, then clicks "Login" → content is lost.

**Root Cause:** OAuth login uses `window.location.href` redirect, which unloads the page. React's `useEffect` for localStorage save is queued but never executes before unload.

```typescript
// ❌ WRONG: useEffect doesn't run before page unload
useEffect(() => {
    localStorage.setItem('state', JSON.stringify(state));
}, [state]);

// When OAuth redirect happens:
// 1. window.location.href = "https://oauth.provider/..."
// 2. Page unloads IMMEDIATELY
// 3. useEffect was queued but never runs
// 4. State is lost!
```

**Solution:** Use `beforeunload` event to save state synchronously.

```typescript
// ✅ CORRECT: beforeunload saves state before page unloads
// Keep a ref with latest state (no deps, always current)
const latestStateRef = useRef(state);
useEffect(() => {
    latestStateRef.current = state;
}, [state]);

// Save on beforeunload
useEffect(() => {
    const handleBeforeUnload = () => {
        localStorage.setItem('state', JSON.stringify(latestStateRef.current));
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
}, []);  // Empty deps - never re-registers
```

**Why Ref:** The `beforeunload` handler is registered once. Without a ref, it would capture stale state from initial render. The ref always has current state.

**Lesson:** For OAuth/redirect flows, `beforeunload` is the last chance to persist state. Regular `useEffect` won't fire in time.

---

## 19. Always Clear Stale Derived State

**Problem:** After generating a new creature, the image prompt from the PREVIOUS creature is still shown.

**Root Cause:** Conditional state setting that only fires on truthy values.

```typescript
// ❌ WRONG: Stale prompt persists when new creature has empty sdPrompt
const handleOutput = (output) => {
    ctx.replaceCreatureDetails(output.statblock);
    if (output.imagePrompt) {  // ← Only sets if truthy!
        ctx.setImagePrompt(output.imagePrompt);
    }
};

// Scenario:
// 1. Generate "Dr. Jupiter" → sdPrompt = "A cosmic wizard..."
// 2. Generate "Goblin" → sdPrompt = "" (empty)
// 3. Image tab still shows "A cosmic wizard..."!
```

**Solution:** Always set derived state, using empty string as default.

```typescript
// ✅ CORRECT: Always set, clear stale values
const handleOutput = (output) => {
    ctx.replaceCreatureDetails(output.statblock);
    ctx.setImagePrompt(output.imagePrompt || '');  // ← Always set!
};
```

**Lesson:** When setting derived state from new data, always set it - don't conditionally skip on falsy values. Use `|| ''` or `|| default` to ensure previous values are cleared.

---

## 20. Relative Paths for Internal API Endpoints

**Problem:** Double URL prefix in API calls.

**Symptom:** `Cross-Origin Request Blocked: https://dev.dungeonmind.nethttps//dev.dungeonmind.net/api/images/upload`

**Root Cause:** Engine config used full URL, but hook also prepends the base URL.

```typescript
// ❌ WRONG: Full URL in config
const config = {
    uploadEndpoint: `${DUNGEONMIND_API_URL}/api/images/upload`  // Full URL
};

// Hook also prepends:
const url = `${DUNGEONMIND_API_URL}${config.uploadEndpoint}`;
// Result: https://example.com + https://example.com/api/... = broken!
```

**Solution:** Use relative paths in config, let hook add base URL.

```typescript
// ✅ CORRECT: Relative path in config
const config = {
    uploadEndpoint: '/api/images/upload'  // Relative
};

// Hook prepends base URL once:
const url = `${DUNGEONMIND_API_URL}${config.uploadEndpoint}`;
// Result: https://example.com + /api/images/upload = correct!
```

**Lesson:** Establish a convention: all endpoint configs are relative paths. The HTTP layer adds the base URL exactly once.

---

## 21. Async vs Sync in Python Async Functions

**Problem:** Entire backend hangs during image generation (186s+). All other requests fail.

**Symptom:** Theme CSS fails to load, health checks timeout, everything blocked.

**Root Cause:** Using synchronous function inside async endpoint.

```python
# ❌ WRONG: Blocking call in async function
async def generate_images(request: ImageRequest):
    # This blocks the ENTIRE event loop!
    result = fal_client.subscribe(...)  # SYNC - blocks 186 seconds!
    return result
```

**Solution:** Use async version of the library function.

```python
# ✅ CORRECT: Non-blocking async call
async def generate_images(request: ImageRequest):
    result = await fal_client.subscribe_async(...)  # ASYNC - non-blocking!
    return result
```

**How to Detect:**
- Multiple endpoints fail simultaneously
- "The operation was aborted" errors on unrelated requests
- Health checks timeout during long operations
- Look for `client.method()` without `await` inside `async def`

**Lesson:** In async Python, every I/O operation must be `await`ed. A single blocking call freezes everything. Check library docs for async variants (`subscribe` vs `subscribe_async`).

---

## 22. Deduplication Hash Must Include All Persisted Data

**Problem:** Image generated and uploaded successfully, but library count doesn't increase.

**Root Cause:** Auto-save deduplication hash didn't include image count.

```typescript
// ❌ WRONG: Hash only checks statblock fields
const contentHash = JSON.stringify({
    name: statblock.name,
    type: statblock.type,
    actions: statblock.actions.length,
    // MISSING: generatedContent.images!
});

// Scenario:
// 1. Generate creature "Goblin" → save to Firestore
// 2. Generate image for Goblin → add to generatedContent.images
// 3. Auto-save fires → hash unchanged (only checks statblock) → SKIPPED!
// 4. Refresh → image is gone
```

**Solution:** Include all data that should trigger saves.

```typescript
// ✅ CORRECT: Hash includes image count
const contentHash = JSON.stringify({
    name: statblock.name,
    type: statblock.type,
    actions: statblock.actions.length,
    imagesCount: generatedContent.images.length  // ← ADDED!
});
```

**General Pattern:**
```
deduplicationHash = hash(ALL fields that should trigger persistence)
```

**Lesson:** When using hash-based deduplication for auto-save, the hash must include ALL data that should be persisted. If adding new persisted fields, update the hash.

---

## 23. Mantine Select in Drawer Z-Index (PCG Migration)

**Problem:** Select dropdowns in GenerationPanel look clickable but don't open when inside a Drawer.

```typescript
// ❌ WRONG: Select without portal config
<Select
  label="Art Style"
  data={styleOptions}
  value={selectedStyle}
  onChange={setSelectedStyle}
/>
```

**Symptom:** Clicking Select shows focus state but dropdown never appears. HTML shows `readonly` attribute.

**Root Cause:** Mantine Select uses a Combobox portal that renders at default z-index. When inside a Drawer (z-index 400), the dropdown renders BEHIND the drawer overlay.

**Solution:**

```typescript
// ✅ CORRECT: Add comboboxProps for portal and z-index
<Select
  label="Art Style"
  data={styleOptions}
  value={selectedStyle}
  onChange={setSelectedStyle}
  comboboxProps={{ withinPortal: true, zIndex: 500 }}  // ← REQUIRED
/>
```

**Lesson:** All Mantine Select/MultiSelect/Autocomplete components inside Drawers need `comboboxProps={{ withinPortal: true, zIndex: 500 }}`.

---

## 24. Per-Tab Validation for IMAGE vs TEXT Tabs

**Problem:** Generate button stays disabled on Portrait (IMAGE) tab even with valid prompt entered.

```typescript
// ❌ WRONG: Same validateInput for all tabs
<GenerationPanel
  input={input}
  validateInput={validateInput}  // Validates concept + classId (TEXT fields)
  generationType={GenerationType.IMAGE}
/>
```

**Symptom:** IMAGE tab has filled prompt but button disabled. Console shows validation failing on `concept`.

**Root Cause:** TEXT tab validates `concept` and `classId`. IMAGE tab uses `description` field for prompt. Same validator checks wrong fields.

**Solution:**

```typescript
// ✅ CORRECT: Different validation for IMAGE tabs
{tab.generationType === GenerationType.IMAGE && (
  <GenerationPanel
    input={input}
    validateInput={(inp) => {
      // For image generation, validate the description/prompt field
      const prompt = (inp as Record<string, unknown>)?.description as string || '';
      if (!prompt || prompt.trim().length < 5) {
        return { 
          valid: false, 
          errors: { description: 'Image prompt must be at least 5 characters' } 
        };
      }
      return { valid: true };
    }}
    generationType={tab.generationType}
  />
)}
```

**Lesson:** TEXT and IMAGE tabs have different input semantics; don't share validators.

---

## 25. Input Field Conventions for Image Tab

**Problem:** Image generation sends empty prompt to API even though user typed in textarea.

```typescript
// ❌ WRONG: imageTransformInput uses wrong field
imageTransformInput: (input: PCGInput) => ({
    prompt: input.concept  // concept is for TEXT tab!
}),
```

**Symptom:** Backend receives `prompt: ''`. Error: `string_too_short`.

**Root Cause:** The engine's IMAGE tab textarea writes to `input.description`, but config reads from `input.concept`.

**Solution:**

```typescript
// ✅ CORRECT: Use description field (and add to type)
interface PCGInput {
    concept: string;
    classId: string;
    // ... other TEXT fields ...
    description?: string;  // ← ADD THIS for image tab
}

imageTransformInput: (input: PCGInput) => ({
    prompt: input.description || ''  // ← Use description
}),
```

**Lesson:** The engine stores IMAGE tab prompts in `input.description`. Add this field to your input type and use it in `imageTransformInput`.

---

## 26. Prompt Shaping for API Character Limits

**Problem:** Image generation fails with `string_too_long` error.

```
prompt
  String should have at most 2000 characters [type=string_too_long]
```

**Root Cause:** Portrait prompt includes full `description` (can be 500+ chars) and full `backstory` (can be 1000+ chars), easily exceeding 2000 char API limit.

**Solution:** Truncate long content and leave room for style suffix.

```typescript
const MAX_PROMPT_LENGTH = 1500;  // Leave room for style suffix
const MAX_DESCRIPTION_LENGTH = 400;
const MAX_BACKSTORY_LENGTH = 400;

function truncateAtWord(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    const truncated = text.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    if (lastSpace > maxLength * 0.5) {
        return truncated.substring(0, lastSpace) + '...';
    }
    return truncated.substring(0, maxLength - 3) + '...';
}

// Use in prompt builder
const descriptionExcerpt = extractVisualExcerpt(description, MAX_DESCRIPTION_LENGTH);
const backstoryExcerpt = extractVisualExcerpt(backstory, MAX_BACKSTORY_LENGTH);
```

**Lesson:** Shape prompts at the source (prompt builder) rather than truncating at the API call. Leave headroom for style suffixes to be appended.

---

## 27. Composition vs Style Separation in Prompts

**Problem:** Hardcoded art style in base prompt doesn't respect user's style dropdown selection.

```typescript
// ❌ WRONG: Art style hardcoded in base prompt
const promptParts = [
    `A fantasy character portrait...`,
    'painterly fantasy art style, dramatic lighting, professional D&D art'  // ← Hardcoded!
];
```

**Symptom:** User selects "Anime Style" but gets painterly fantasy art.

**Root Cause:** Base prompt overrides the style suffix that gets appended by the engine.

**Solution:**

```typescript
// ✅ CORRECT: Base prompt = composition/subject only
const promptParts = [
    `An RPG character portrait headshot of a ${identityBits}`,
    `named ${name}`,
    gearBits,
    descriptionExcerpt,
    'Close-up head and shoulders portrait, detailed expressive face, eye contact with viewer'
    // NO art style here - comes from dropdown suffix
];
```

The engine appends style suffix from dropdown:
```typescript
// In GenerationDrawerEngine.tsx
if (styleSuffix) {
    mergedResult.prompt = `${mergedResult.prompt}, ${styleSuffix}`;
}
```

**Lesson:** Base prompt describes WHAT (subject, composition). Style dropdown describes HOW (art style, rendering technique). Keep them separate.

---

## 28. Build vs Generate Drawer Separation

**Problem:** Trying to put Build wizard inside GenerationDrawerEngine feels wrong and requires "CUSTOM" tab type.

**Context:** PCG had 3 tabs: Generate, Build, Portrait. Build is a multi-step form wizard. Generate/Portrait are AI generation.

**Analysis:**

| Aspect | Generate | Build |
|--------|----------|-------|
| Auth required | Yes (images) | No |
| Progress bars | Yes | No |
| API calls | Yes | No (local state) |
| State pattern | Input → Generate → Output | Step-by-step form |

**Solution:** Separate drawers for separate patterns.

```typescript
// Header buttons
<Button onClick={() => setGenerationOpen(true)}>Generate</Button>
<Button onClick={() => setBuildOpen(true)}>Build</Button>

// Separate drawers
<PCGGenerationDrawer opened={generationOpen} onClose={...} />
<PCGBuildDrawer opened={buildOpen} onClose={...} />
```

**Benefits:**
- Each drawer has single responsibility
- No need for "CUSTOM" generation type hack
- Cleaner code (~150 lines each vs ~300 lines combined)
- Can evolve independently

**Lesson:** If a feature doesn't fit the engine's pattern (generate → progress → output), it probably deserves its own drawer. Don't force everything into GenerationDrawerEngine.

---

## 29. Auto-Switch Tabs After Generation

**Problem:** After text generation completes, user must manually click Portrait tab to generate image.

**Symptom:** Users don't discover image generation exists.

**Solution:** Engine auto-switches to image tab after text generation completes.

```typescript
// In GenerationDrawerEngine.tsx - after text generation success
useEffect(() => {
    if (generation.result && activeGenerationType === GenerationType.TEXT) {
        // Find first IMAGE tab and switch to it
        const imageTab = config.tabs?.find(t => t.generationType === GenerationType.IMAGE);
        if (imageTab) {
            setActiveTab(imageTab.id);
            console.log('🔄 Auto-switched to image tab after text generation');
        }
    }
}, [generation.result]);
```

**Benefits:**
- Guides user to next logical step (generate portrait)
- Image prompt is pre-populated from text generation
- Increases feature discovery

**Lesson:** After successful generation, consider auto-navigating to the next logical step in the workflow.

---

## 30. Clear Project State for New Generations

**Problem:** AI-generated content gets mixed with previously saved project.

**Context:** User loads saved character, then clicks "Generate New" → gets hybrid of old and new data.

**Solution:** Call `clearCurrentProject()` before applying new generation output.

```typescript
// In factory config handleOutput
handleOutput: (ctx, character) => {
    ctx.clearCurrentProject();  // ← Clear FIRST, before setting new data
    ctx.setCharacter(character);
    ctx.updateCharacter({ portraitPrompt: derivePortraitPrompt(character).basePrompt });
},
```

**Why This Matters:**
1. `projectId` gets cleared → treated as new/unsaved work
2. Old character data doesn't leak into new generation
3. User sees clean state after generation

**Lesson:** Generation should produce fresh state. Clear project context before applying AI output so old data doesn't contaminate new.

---

## 31. Distinct Callbacks: onImagesGenerated vs onImageSelected

**Problem:** Need to handle two different image operations: batch generation and individual selection.

**Solution:** Use distinct callback signatures for different operations.

```typescript
// For batch generation results (adds to gallery)
handleImagesGenerated: (ctx, images: SessionImage[]) => {
    ctx.updateCharacter({
        portraitGallery: [...(ctx.character?.portraitGallery || []), ...images],
    });
},

// For single image selection (sets active portrait)
handleImageSelected: (ctx, image: SessionImage) => {
    ctx.updateCharacter({
        portrait: image.url,
    });
},
```

**When Each Fires:**
- `onImagesGenerated` → After successful image generation (batch of 1-4)
- `onImageSelected` → User clicks "Select" on specific image in gallery

**Lesson:** Different user actions need different handlers even if they operate on the same data type. Don't conflate batch operations with single-item operations.

---

## 32. DrawerShell zIndex for Proper Layering

**Problem:** Drawers appear behind other UI elements or modals.

**Context:** PCG had generation drawer and build drawer. Overlapping z-index caused visual bugs.

**Solution:** Set explicit zIndex on DrawerShell.

```typescript
// DrawerShell.tsx
<Drawer
  opened={opened}
  onClose={onClose}
  position="right"
  size="xl"
  zIndex={400}  // ← Explicit z-index
  withCloseButton={false}
>
```

**Convention established:**
- Base drawers: `zIndex={400}`
- Combobox portals inside drawers: `zIndex: 500` (must be higher)
- Modals/overlays: `zIndex={300}` (lower, so drawers appear above)

**Lesson:** Establish z-index conventions early. Document them. Drawers containing portaled components need explicit layering rules.

---

## 33. Modal Z-Index Must Exceed Drawer Z-Index

**Problem:** ImageModal opens but appears BEHIND the drawer. Users click but nothing seems to happen.

```typescript
// ❌ WRONG: Modal uses default z-index (200), Drawer is 400
<DrawerShell zIndex={400}>
  ...
</DrawerShell>

<Modal opened={opened}>  {/* Default z-index ~200 */}
  ...
</Modal>
```

**Symptom:** Click image → drawer still visible → modal invisible (it's rendered but hidden behind)

**Root Cause:** Mantine Modal default z-index (200) is lower than DrawerShell (400).

**Solution:**

```typescript
// ✅ CORRECT: Modal z-index higher than drawer
<Modal
  opened={opened}
  onClose={onClose}
  zIndex={500}  // ← Above drawer (400)
  ...
>
```

**Lesson:** When nesting modals inside drawers, the modal z-index must exceed the drawer z-index. Document the z-index hierarchy.

---

## 34. Reset Modal State on Drawer Close

**Problem:** Close drawer while modal is open → modal stays visible, floating in space.

```typescript
// ❌ WRONG: Modal state not reset when drawer closes
useEffect(() => {
  if (wasOpened && !opened) {
    generation.clearError();
    // MISSING: setModalOpened(false)!
  }
}, [opened]);
```

**Symptom:** Modal persists after drawer closes. Clicking anywhere dismisses it awkwardly.

**Solution:**

```typescript
// ✅ CORRECT: Close modal when drawer closes
useEffect(() => {
  if (wasOpened && !opened) {
    generation.clearError();
    setModalOpened(false);  // ← Always close modal with drawer
  }
}, [opened]);
```

**Lesson:** Child UI elements (modals, popovers, dropdowns) should close when their parent container closes.

---

## 35. Modal Source Tracking for Shared Modal

**Problem:** Need single ImageModal that works with both Project Gallery and Library, showing different image sets.

```typescript
// ❌ WRONG: Modal hardcoded to one image source
<ImageModal
  images={generatedImages}  // Always project images
  ...
/>
```

**Symptom:** Modal always shows project images, even when triggered from Library tab.

**Solution:** Track modal source and conditionally select images.

```typescript
// ✅ CORRECT: Track modal source with state
const [modalSource, setModalSource] = useState<'project' | 'library'>('project');

// Project gallery click
const handleImageClick = (image, index) => {
  setModalSource('project');
  setModalIndex(index);
  setModalOpened(true);
};

// Library click
const handleLibraryImageClick = (image, index) => {
  setModalSource('library');
  setModalIndex(index);
  setModalOpened(true);
};

// Modal uses correct images
<ImageModal
  images={modalSource === 'library' ? imageLibrary.images : generatedImages}
  ...
/>

// Select handler behaves differently per source
const handleModalSelect = (url, index) => {
  if (modalSource === 'library') {
    handleAddFromLibrary(currentImage);  // Add to project first
  }
  onImageSelected(url, index);  // Then select
};
```

**Lesson:** When a modal/component serves multiple contexts, track which context triggered it and adapt behavior accordingly.

---

## 36. useCallback Declaration Order Matters

**Problem:** TypeScript error: "Block-scoped variable 'X' used before its declaration."

```typescript
// ❌ WRONG: handleAddFromLibrary declared AFTER handleModalSelect
const handleModalSelect = useCallback((url, index) => {
  handleAddFromLibrary(currentImage);  // Uses function declared below!
}, [handleAddFromLibrary]);

const handleAddFromLibrary = useCallback((image) => {
  // ...
}, []);
```

**Error:** `TS2448: Block-scoped variable 'handleAddFromLibrary' used before its declaration`

**Root Cause:** In JavaScript, `const` declarations are block-scoped and not hoisted like `function` declarations. You cannot reference a `const` before its declaration.

**Solution:** Reorder declarations so dependencies come first.

```typescript
// ✅ CORRECT: Declare dependencies before consumers
const handleAddFromLibrary = useCallback((image) => {
  // ...
}, []);

const handleModalSelect = useCallback((url, index) => {
  handleAddFromLibrary(currentImage);  // Now safe - declared above
}, [handleAddFromLibrary]);
```

**Lesson:** When one `useCallback` depends on another, declare the dependency first. Follow a bottom-up ordering where leaf functions come before their callers.

---

## 37. Git-Based Dependencies for Docker Builds

**Problem:** Docker build fails: "Distribution not found at: file:///home/user/GenerationEngine"

```toml
# ❌ WRONG: Local path dependency in pyproject.toml
[tool.uv.sources]
generationengine = { path = "../GenerationEngine", editable = true }
```

**Symptom:** `uv pip compile` fails because `../GenerationEngine` doesn't exist in Docker container.

**Root Cause:** Docker builds happen in isolated containers. Only files explicitly `COPY`ed exist. Relative paths to sibling directories don't resolve.

**Solution:** Use git-based dependency for production builds.

```toml
# ✅ CORRECT: Git-based dependency works in Docker
[tool.uv.sources]
generationengine = { git = "https://github.com/Drakosfire/GenerationEngine.git" }
```

**How it works:**
1. `uv pip compile` sees git URL, not local path
2. Clones repository from GitHub during build
3. Reads `pyproject.toml` from cloned repo
4. Builds and installs package
5. No local filesystem dependency needed

**For local development:** Override with `uv.toml` (gitignored):
```toml
# uv.toml (local dev override)
[sources]
generationengine = { path = "../GenerationEngine", editable = true }
```

**Important:** Push changes to GenerationEngine GitHub BEFORE deploying, since Docker will fetch from the remote.

**Lesson:** Production builds need network-accessible dependencies. Local path dependencies only work in development. Use git sources or published packages for production.

---

## 38. State Location Mapping Before Building Reusable Engines

**Problem:** Callback pipeline issue (Learning #14, #15) was discovered late, during migration. Could have been caught in Phase 0/1 if state locations had been explicitly mapped.

**Root Cause:** When designing the GenerationDrawerEngine, the focus was on the engine's internal state. The interaction between engine state and service provider state wasn't analyzed upfront.

**Symptom:** 
- Bug: "Deleted image reappears after refresh"
- Required: 5-file change to add callback pipeline
- Discovery: During migration, not during design

**Solution:** Add "State Location Mapping" as explicit Phase 0 deliverable.

```markdown
## State Location Mapping (Phase 0 Deliverable)

### For each data type managed by the engine:

| Data | Engine Location | Service Location | Sync Mechanism |
|------|-----------------|------------------|----------------|
| Images | generatedImages (useState) | ctx.generatedContent.images | ❓ TBD |
| Generation status | useGeneration.isGenerating | ctx.isGenerating | onGeneratingChange prop |
| Selected image | selectedImageId | ctx.selectedCreatureImageIndex | onImageSelected callback |

### For each mutation operation:

| Operation | Updates Engine State | Updates Service State | Callback Needed |
|-----------|---------------------|----------------------|-----------------|
| Add image | ✅ setGeneratedImages | ❓ | onImageGenerated |
| Delete image | ✅ setGeneratedImages | ❓ | onImageDeleted ← MISSING! |
| Select image | ✅ setSelectedImageId | ❓ | onImageSelected |
```

**When ❓ appears in "Updates Service State" column → Design the callback.**

**Lesson:** Before building any reusable engine that manages state, explicitly map WHERE state lives and HOW mutations propagate to all locations. The callback pipeline design emerges naturally from this analysis.

---

## 39. Demo Page ROI: 10x Debugging Time Savings

**Problem:** Integration bugs are hard to isolate when testing through a full service.

**Symptom:** "Is it the engine? The service wrapper? The provider? The backend?"

**Evidence from this spec:**
- 46 test cases in demo page
- All 13 bugs were reproducible in demo page before production integration
- Demo page enabled: Live mode toggle, health checks, service selector
- Development velocity increased significantly once demo page existed

**Quantified benefits:**

| Without Demo Page | With Demo Page |
|-------------------|----------------|
| Test in full app context | Test engine in isolation |
| 5+ files to check when debugging | 1-2 files (demo + engine) |
| Backend required for any test | Mock mode by default |
| Can't test other services easily | Service selector toggles |
| "Is it running?" guessing | Health check panel |

**Demo page investment:**
- ~200 lines of code
- ~2 hours to build
- Saved: ~10+ hours of debugging over 2 migrations

**Lesson:** For any reusable engine, build the demo page FIRST. The 2-hour investment pays for itself 5-10x in debugging time saved.

---

## 40. TDD Reality Check: Tests After vs Tests Before

**Problem:** The plan specified TDD approach, but tests actually lagged implementation.

**Evidence:**

```markdown
# From tasks.md plan:
> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

# Reality:
- T055 [P] Create integration test ... - [ ] NOT DONE
- T056 [P] Create unit test ...        - [ ] NOT DONE  
- T063 [P] Create integration test ... - [ ] NOT DONE
```

**Root Cause:** Demo page with manual test checklist provided "good enough" coverage during development. Formal tests felt redundant.

**Impact analysis:**

| Bug | Would TDD have caught it? |
|-----|---------------------------|
| Select dropdown z-index | ❌ No - visual/integration issue |
| Validation mismatch (IMAGE tabs) | ✅ Yes - unit test would specify field |
| Empty prompt to API | ✅ Yes - unit test would verify transform |
| Debounced save race condition | ❓ Maybe - complex state interaction |
| Async blocking event loop | ❌ No - backend issue, Python side |

**Honest assessment:** 2-3 bugs might have been caught earlier with TDD. But demo page caught ALL bugs before production.

**Revised guidance:**

```markdown
## When TDD is Worth It:
- Complex transform logic (transformInput, transformOutput)
- Validation functions
- State machine logic
- Pure functions with edge cases

## When Demo Page Testing is Sufficient:
- Visual/layout issues
- Integration wiring
- z-index and layering
- Modal/drawer interactions
- Auth gating flows
```

**Lesson:** TDD and demo page testing serve different purposes. For UI engines, the demo page may catch more bugs than unit tests. Be honest about which testing approach will actually get done, and optimize for what catches bugs rather than what feels "correct."

---

## 41. Large File Detection: The 300-Line Rule

**Problem:** `GenerationDrawerEngine.tsx` grew to 855 lines. Harder to navigate, understand, and modify.

**How it happened:**
- Started small (~200 lines)
- Each feature added incrementally: image handling, upload, library, modal, auth gate
- No explicit check for file size during development
- Felt "fine" because additions were small

**Detection pattern:**

```bash
# Quick check for large files in a directory
wc -l LandingPage/src/shared/GenerationDrawerEngine/*.tsx | sort -n
```

**Threshold guidance:**

| Lines | Status | Action |
|-------|--------|--------|
| <200 | ✅ Healthy | Continue |
| 200-300 | ⚠️ Watch | Consider extraction at next major addition |
| 300-500 | 🟡 Large | Extract before next feature |
| >500 | 🔴 Too large | Refactor now |

**Extraction candidates from GenerationDrawerEngine:**

| Candidate | Lines | Reason |
|-----------|-------|--------|
| Image handling logic | ~100 | Distinct responsibility |
| Tab content rendering | ~150 | Complex switch logic |
| Upload handling | ~80 | Self-contained |
| Modal state management | ~50 | Could be custom hook |

**Lesson:** Check file size explicitly during development. The 300-line threshold should trigger "pause and consider extraction" before adding more code.

---

## 42. Handoff Document Types: Separate Concerns

**Problem:** HANDOFF-*.md files mixed multiple concerns, making them harder to use.

**Evidence:**

```markdown
# HANDOFF-StatBlock-PCG-Migration.md contains:
- Session context (good for handoff)
- Bug tracking (better in separate file)
- Implementation details (good for handoff)
- Testing checklists (good)
- Status updates over multiple days (confusing)
```

**Symptom:** Hard to find "what should I do next?" vs "what was already done?"

**Revised handoff structure:**

```markdown
## Handoff Document Types

### HANDOFF-{Feature}.md
- Session context for next agent
- Key files to read
- Commands to run
- Current state (working/not working)
- Next steps

### BUGS-{Feature}.md (separate)
- Symptoms
- Root causes
- Fixes applied
- Regression tests

### STATUS in tasks.md only
- Task completion status
- Phase progress
- Blockers
```

**Benefits:**
- Handoffs stay focused on "what to do"
- Bug tracking has history without cluttering handoffs
- Status is authoritative in one place (tasks.md)

**Lesson:** Separate handoff (context transfer) from bug tracking (historical record) from status (authoritative progress). Each document type has one job.

---

## 43. OpenAI Structured Outputs for Guaranteed Schema Compliance

**Problem:** AI generates JSON that doesn't match Pydantic schema - wrong enum case, missing fields, different structure.

```python
# ❌ WRONG: Manual JSON parsing and normalization
response = client.chat.completions.create(...)
text = response.choices[0].message.content
json_data = extract_json(text)  # Custom extraction
normalized = normalize_statblock(json_data)  # Manual fixes
validated = StatBlockDetails(**normalized)  # Still might fail
```

**Symptoms:**
- `ValidationError: 10 errors for StatBlockDetails`
- Enum case mismatch (`"Fey"` vs `"fey"`)
- Field name mismatch (`ability_scores` vs `abilities`)
- Missing required fields

**Solution:** Use OpenAI's Structured Outputs feature.

```python
# ✅ CORRECT: Structured outputs guarantee schema compliance
response = client.responses.create(
    model="gpt-4.1",
    input=messages,
    text={
        "format": {
            "type": "json_schema",
            "name": "statblock",
            "schema": schema_utils.make_schema_strict(StatBlockDetails.model_json_schema()),
            "strict": True
        }
    }
)
# Response is GUARANTEED to match schema - no parsing needed
statblock = StatBlockDetails.model_validate_json(response.output_text)
```

**Key insight:** Move validation from application layer to API layer. Let OpenAI constrain its output.

**Lesson:** When AI output must conform to a schema, use structured outputs. Eliminates entire categories of bugs.

---

## 44. Feature Flag Pattern for Safe Migrations

**Problem:** Major refactor (new GenerationDrawerEngine) might break production. Need instant rollback.

```typescript
// ❌ WRONG: Deploy and hope
export const StatBlockGenerationDrawer = () => {
    return <NewDrawerEngine {...props} />;  // No way back!
};
```

**Solution:** Feature flag with conditional rendering.

```typescript
// config.ts
export const USE_NEW_GENERATION_DRAWER = 
    import.meta.env.VITE_USE_NEW_GENERATION_DRAWER === 'true';

// StatBlockGenerationDrawer.tsx
export const StatBlockGenerationDrawer = (props) => {
    if (USE_NEW_GENERATION_DRAWER) {
        return <NewDrawerEngine {...props} />;
    }
    return <LegacyDrawer {...props} />;  // Rollback path
};
```

**Rollback process:**
1. Set env var to `false`
2. Rebuild (or use runtime config)
3. Old behavior restored instantly

**Cleanup (after 7 days stable):**
1. Remove feature flag from config
2. Delete legacy component
3. Remove conditional rendering

**Lesson:** Major migrations get feature flags. Cost: ~10 lines. Benefit: instant rollback without deploy.

---

## 45. Remove Unused Dependencies to Fix Conflicts

**Problem:** npm install fails with peer dependency conflict.

```
npm error ERESOLVE could not resolve
npm error While resolving: @storybook/react@8.6.15
npm error Found: @storybook/test@8.6.14
npm error peerOptional @storybook/test@"8.6.15" from @storybook/react@8.6.15
```

**First instinct:** `--legacy-peer-deps` or manually pin versions.

**Better question:** "Do we actually use Storybook?"

**Investigation:**
```bash
# Check if Storybook is imported anywhere
grep -r "storybook" src/ --include="*.tsx" --include="*.ts"
# Result: No imports found
```

**Solution:** Remove the unused dependency entirely.

```json
// package.json - BEFORE
"devDependencies": {
    "@storybook/react": "^8.4.7",
    "@storybook/addon-essentials": "^8.4.7",
    // 8 more storybook packages...
}

// package.json - AFTER
"devDependencies": {
    // No storybook - problem solved
}
```

**Lesson:** Before debugging dependency conflicts, ask: "Do we use this?" Removing unused dependencies is cleaner than working around conflicts.

---

## 46. Docker Git Installation for Git-Based Dependencies

**Problem:** Docker build fails when Python package uses git-based dependency.

```
Failed to download and build generationengine @ git+https://github.com/...
Git executable not found. Ensure that Git is installed and available.
```

**Root cause:** Default Python Docker images don't include git.

**Solution:** Add git to apt-get install in Dockerfile.

```dockerfile
# ❌ WRONG: Missing git
RUN apt-get update && apt-get install -y \
    curl \
    build-essential

# ✅ CORRECT: Include git for git-based deps
RUN apt-get update && apt-get install -y \
    curl \
    build-essential \
    git  # ← Required for git-based Python deps
```

**When this matters:**
- `pyproject.toml` has: `generationengine = { git = "https://github.com/..." }`
- Any git-based dependency in requirements

**Lesson:** If using git-based Python dependencies, the Docker image needs git installed. Add to Dockerfile before `uv pip install`.

---

## Lessons for Future Specs

*Meta-learnings about the spec process itself.*

### What Worked Well

| Practice | Impact | Evidence |
|----------|--------|----------|
| Demo page first | Caught 13 bugs before production | All bugs reproducible in demo |
| Factory pattern | 67% code reduction | ~120 lines → ~40 lines per service |
| Learnings in real-time | 46 entries captured | This document |
| Feature flag | Safe migration | Rollback available entire time |
| Spec-first approach | Clear requirements | User stories drove implementation |

### What to Do Differently

| Issue | Next Time |
|-------|-----------|
| State location mapping late | Add to Phase 0 checklist explicitly |
| TDD planned but skipped | Be honest: demo page is the testing strategy |
| 855-line file grew unchecked | Check file sizes at PR review |
| Handoffs mixed concerns | Separate: context, bugs, status |
| Missing structured outputs initially | Check API capabilities before building workarounds |

### Spec 002 Recommendations

For the next spec (CRUD Engine, Project Drawer, or other):

1. **Phase 0 must include:**
   - State location mapping table
   - Callback pipeline design
   - File size budget (max lines per file)

2. **Demo page is Phase 1**, not optional:
   - Manual test checklist from day 1
   - Health check panel
   - Service selector if multi-service

3. **Feature flag from start:**
   - Add flag in Phase 1
   - All development behind flag
   - Remove only after 7-day stability

4. **Structured outputs first:**
   - If AI generates structured data, use API's schema features
   - Don't build custom parsing until API options exhausted

---

## Anti-Pattern Quick Reference

*From 46 learnings, distilled into quick-lookup table for common mistakes.*

| Anti-Pattern | Symptom | Fix | # |
|--------------|---------|-----|---|
| Blocking call in async Python | All requests hang | Use `await client.method_async()` | 21 |
| useState for guard flags | Race conditions | Use `useRef` | — |
| Hardcoded API URLs in config | Double prefix errors | Relative paths only | 20 |
| Same validator for all tabs | Wrong fields validated | Per-tab validators | 24 |
| Conditional state updates | Stale data persists | Always set, use `\|\| ''` | 19 |
| Missing hash fields | Autosave skips changes | Include ALL persisted fields | 22 |
| Select in Drawer | Dropdown behind overlay | `comboboxProps={{ zIndex: 500 }}` | 23 |
| Modal default z-index | Modal hidden behind drawer | `zIndex={500}` on Modal | 33 |
| Child UI not reset on parent close | Modal floats after drawer closes | Reset child state in close handler | 34 |
| Manual context wiring | Forgot setIsGenerating | Use factory pattern | 16 |
| useEffect for OAuth state save | State lost on redirect | Use beforeunload event | 18 |
| No state location mapping | Late discovery of sync bugs | Map state locations in Phase 0 | 38 |
| Tests lagging implementation | Bugs caught late | Demo page first, TDD for logic | 40 |
| Files growing unchecked | 800+ line components | Check at 300 lines, extract | 41 |
| Mixed handoff documents | Hard to find current status | Separate concerns by doc type | 42 |
| Single image source for shared modal | Wrong images displayed | Track modalSource state | 35 |
| Wrong useCallback order | TS error: used before declaration | Declare dependencies first | 36 |
| Local path deps in pyproject.toml | Docker build fails | Use git-based dependencies | 37 |
| Manual JSON parsing from AI | Schema validation errors | Use structured outputs | 43 |
| No rollback path for migrations | Stuck with broken code | Feature flags | 44 |
| Debugging dependency conflicts | Time wasted on unused code | Remove unused deps first | 45 |
| Missing git in Docker | Git-based deps fail | Add git to apt-get | 46 |

---

## Related Documents

### Spec & Implementation
- **Spec:** `specs/001-generation-drawer-engine/spec.md` - Original feature specification
- **Plan:** `specs/001-generation-drawer-engine/plan.md` - Phased implementation plan
- **Tasks:** `specs/001-generation-drawer-engine/tasks.md` - Task breakdown and status

### Contracts
- **GenerationDrawerEngine Contract:** `Docs/contracts/CONTRACT-GenerationDrawerEngine.md` ⭐

### Handoffs
- **Phase 10-11 (Current):** `specs/001-generation-drawer-engine/HANDOFF-Phase10-11-Deploy.md`
- **StatBlock + PCG Migration:** `specs/001-generation-drawer-engine/HANDOFF-StatBlock-PCG-Migration.md`
- **PCG Migration Details:** `specs/001-generation-drawer-engine/HANDOFF-PCG-GenerationDrawer.md`
- **GenerationDrawerEngine Handoff:** `specs/001-generation-drawer-engine/HANDOFF-Dynamic-Image-Capabilities.md`
- **Firestore Delete Bug Handoff:** `specs/001-generation-drawer-engine/HANDOFF-Firestore-Update-Not-Persisting.md`
- **Factory Design:** `specs/001-generation-drawer-engine/DESIGN-ServiceDrawerFactory.md`

### Other Learnings
- **OpenAI API Learnings:** `Docs/Learnings/LEARNINGS-OpenAI-Responses-API-Migration-2025.md`
- **StatBlock Patterns:** `Docs/Learnings/EXTRACTABLE-PATTERNS-StatblockGenerator.md`

---

## Metrics Summary (Spec 001 Retrospective)

| Metric | Value | Notes |
|--------|-------|-------|
| **Estimated Time** | 38-40 hours | Original plan |
| **Bug Count** | 13 (8 SBG + 5 PCG) | All caught before production |
| **Code Reduction** | 67% per service | Exceeded 60% goal |
| **Learnings Captured** | 46 | This document (final) |
| **Files Created** | ~20 | Engine + factory + configs + components |
| **Services Migrated** | 2 (StatBlock, PCG) | CardGenerator pending |
| **Demo Page Tests** | 46 | Manual test checklist |
| **Anti-Patterns Catalogued** | 22 | Quick reference table |

**Key Success Factors:**
1. Demo page built early (caught all bugs before production)
2. Factory pattern emerged from pain (automatic wiring)
3. Learnings captured in real-time (46 entries)
4. Spec-first approach (clear requirements)
5. Feature flag enabled safe migration with rollback path

**Key Improvement Areas:**
1. TDD planned but not executed (demo page was actual testing strategy)
2. State location mapping should be Phase 0
3. Large files (855 lines) need earlier decomposition
4. Handoff documents mixed concerns
5. Structured outputs should have been explored earlier (before building JSON parsing)

