# Handoff: US3 - Character Portrait Generation (Option B: “Locks + Gallery + Recipe”)
**Date:** 2025-12-14  
**Type:** Feature  
**Last Updated:** 2025-12-14  (updated for fade/washed-out portrait investigation)  

---

## 🚨 CURRENT STATE

### What’s Working ✅
- **Character model already supports portrait basics** (`portrait`, `portraitPrompt`) in the system-agnostic wrapper:
  - `LandingPage/src/components/PlayerCharacterGenerator/types/character.types.ts` (see `Character` fields around `portrait` / `portraitPrompt`)
- **Sheet header can render a portrait URL** via prop:
  - `LandingPage/src/components/PlayerCharacterGenerator/sheetComponents/CharacterHeader.tsx` includes `portraitUrl?: string` (L24-L41)
- **Proven image-generation UI + API contract exists** in StatblockGenerator:
  - Frontend calls `POST /api/statblockgenerator/generate-image` with `{ sd_prompt, model, num_images: 4 }`
    - `LandingPage/src/components/StatBlockGenerator/generationDrawerComponents/ImageGenerationTab.tsx` (L139-L152)
  - Backend endpoint exists and **requires auth**:
    - `DungeonMindServer/routers/statblockgenerator_router.py` (L97-L111)
  - Style suffix helper exists:
    - `LandingPage/src/constants/imageStyles.ts` (`buildFullPrompt`, `IMAGE_STYLES`)
- **PCG Portrait tab is implemented** (Option B):
  - `LandingPage/src/components/PlayerCharacterGenerator/creationDrawerComponents/PortraitGenerationTab.tsx`
  - Supports: prompt editor + style/model, soft locks, generate(4x) (auth required), gallery pick/remove, recipe+copy
- **Portrait upload is implemented (frontend-only, local-first)**:
  - Drag/drop or click-to-browse on `PortraitGenerationTab.tsx` stores the image as a data URL in `character.portrait` + `portraitGallery[]`

### What’s NOT Working ❌
- **Portrait appears “faded / washed out” in the sheet UI** (user report) even after attempted CSS changes.

### What We Tried (and why it may not have worked)
1. **Changed `.character-sheet .portrait-box img` blend mode** in `CharacterSheet.css` (desktop sheet styles).
2. **Swapped portrait box background** between `--bg-light` (semi-transparent white) and `--bg-page` (opaque parchment).
3. Outcome: **User reports it still looks faded**, and one attempted change made the image stop rendering (likely due to working on the wrong renderer / CSS not actually applied to the rendered component).

### Suspected Causes (Most Likely)
1. **Wrong portrait renderer being targeted**:
   - There are *two* portrait systems:
     - **SheetComponents header** uses `.portrait-box` styles from:
       - `LandingPage/src/components/PlayerCharacterGenerator/sheetComponents/CharacterSheet.css` (portrait styles around ~L245-L280)
     - **Canvas theme header** uses `.dm-portrait-panel` / `.dm-portrait-image` styles from:
       - `LandingPage/src/styles/canvas/canvas-dnd-theme.css` (portrait styles ~L337-L355)
2. **Canvas theme still applies “wash-out” by design**:
   - `canvas-dnd-theme.css` contains:
     - `.dm-portrait-panel { background: rgba(255, 255, 255, 0.55); }`  ← adds a permanent white wash
     - `.dm-portrait-image { mix-blend-mode: multiply; }`                ← reduces contrast/saturation on parchment
3. **CSS specificity / multiple headers**:
   - There is also a second header component under `canvasComponents/` which may be the one actually rendering the portrait.

### Debug Steps for Next Session (Concrete Checklist)
1. **Confirm which portrait renderer is on-screen**
   - In DevTools, inspect the portrait `<img>` element:
     - If classes include `.portrait-box img` → sheet CSS is relevant.
     - If classes include `.dm-portrait-image` or parent `.dm-portrait-panel` → canvas theme CSS is relevant.
2. **Check computed styles on the `<img>` and parent container**
   - Look for:
     - `mix-blend-mode`
     - `opacity`
     - `filter`
     - `background` on the containing element (semi-transparent rgba backgrounds)
3. **If it’s the canvas renderer, patch here first**
   - `LandingPage/src/styles/canvas/canvas-dnd-theme.css`:
     - `.dm-portrait-image` (currently `mix-blend-mode: multiply;`)
     - `.dm-portrait-panel` (currently `background: rgba(255, 255, 255, 0.55);`)
4. **If it’s the sheet renderer, validate variable values**
   - `--bg-light` is currently semi-transparent: `rgba(255, 255, 255, 0.5)` (this will wash out anything behind it).
   - Prefer an opaque backing for the portrait slot if the goal is full-contrast portraits.

---

## ✅ Locked Decisions (Do Not Re-litigate in Implementation)

### Option Choice
- **Option B (Delightful)** is the implementation target.
- **Option C** is explicitly deferred to backlog (do not implement now).

### Gallery vs Single
- **YES**: maintain a `portraitGallery[]` of candidates.
- **YES**: keep `character.portrait` as the single “active” portrait URL for rendering simplicity.

### Prompt Source
- **NO**: `/api/playercharactergenerator/generate` does **not** generate portrait prompt in v1.
- **YES**: Portrait tab **derives a default prompt client-side** from the generated character, then stores the exact prompt used after generation.

---

## 🎯 Target UX (Option B)

### Core behaviors
- “Portrait” tab supports:
  - **Prompt editor** + **Style** selector (reuse `IMAGE_STYLES`)
  - **Locks**: style/mood/pose/palette/background-hint (v1 can be “soft locks” implemented in prompt composition)
  - **Generate** → calls existing image endpoint and adds 4 images to `portraitGallery`
  - **Pick** image → sets `character.portrait` and `character.portraitPrompt`
  - **Recipe panel** (collapsible): shows prompt + negative prompt + model + style, with “Copy prompt”

### Text artifacts (the “image text package”)
- Store two non-technical fields for the selected portrait:
  - `portraitCaption` (short, flavorful; editable)
  - `portraitAlt` (accessibility + print fallback; editable)

---

## 🧩 Data Model (Proposed)

### Extend `Character` (system-agnostic)
Add optional fields to `LandingPage/src/components/PlayerCharacterGenerator/types/character.types.ts`:
- `portraitCaption?: string`
- `portraitAlt?: string`
- `portraitMeta?: { source: 'generated' | 'uploaded' | 'library'; model?: string; styleId?: string; negativePrompt?: string; seed?: string; createdAt?: string }`
- `portraitGallery?: Array<{ id: string; url: string; prompt: string; caption?: string; alt?: string; meta?: Character['portraitMeta'] }>`

Notes:
- Keep `createEmptyCharacter()` minimal; it does not need to initialize these fields (they’re optional):
  - `LandingPage/src/components/PlayerCharacterGenerator/types/character.types.ts` (L110-L122)

---

## 🔌 API Contract (Reuse Existing)

### Use existing endpoint (no backend changes for v1)
- `POST /api/statblockgenerator/generate-image` (**auth required**) (see `DungeonMindServer/routers/statblockgenerator_router.py` L97-L111)

Request body (from existing UI):
- `{ sd_prompt: string, model: string, num_images: 4 }`
  - see `LandingPage/src/components/StatBlockGenerator/generationDrawerComponents/ImageGenerationTab.tsx` (L139-L152)

Implementation implication:
- Portrait generation UI should follow Statblock’s pattern: show login CTA if not logged in (or mirror “tutorial mock auth” patterns if desired).

---

## 🧠 Prompt Derivation (Client-side)

Create a small helper (new file recommended):
- `LandingPage/src/components/PlayerCharacterGenerator/generation/portraitPromptBuilder.ts`

Inputs:
- `character: Character` (use `name`, `description`, `backstory`, `dnd5eData.race`, `dnd5eData.background`, `dnd5eData.classes[0]`, notable equipment when available)

Outputs:
- `basePrompt: string` (human-authored prompt)
- `caption: string` (default caption)
- `alt: string` (default alt text)

Then apply style suffix using:
- `buildFullPrompt(basePrompt, selectedStyle)` from `LandingPage/src/constants/imageStyles.ts`

---

## 🛠️ Implementation Checklist (Treasure Map)

### Phase 1 — Render plumbing (make portraits show up)

| Task | Description | Status |
|------|-------------|--------|
| **US3-01a** | In `CharacterCanvas.tsx`, pass `portraitUrl={character.portrait}` instead of `undefined` (L1151-L1161) | ⬜ |
| **US3-01b** | In `MobileCharacterCanvas.tsx`, pass `portraitUrl={character.portrait}` instead of `undefined` (L211-L220) | ⬜ |

### Phase 2 — Data schema + persistence safety

| Task | Description | Status |
|------|-------------|--------|
| **US3-02a** | Extend `Character` type with Option B fields (`portraitCaption`, `portraitAlt`, `portraitMeta`, `portraitGallery`) | ⬜ |
| **US3-02b** | Verify `createEmptyCharacter()` tests still pass | ⬜ |

### Phase 3 — Replace Portrait placeholder with real tab

| Task | Description | Status |
|------|-------------|--------|
| **US3-03a** | Create `PortraitGenerationTab.tsx` in `creationDrawerComponents/` | ⬜ |
| **US3-03b** | Replace placeholder panel in `PlayerCharacterCreationDrawer.tsx` (L233-L241) | ⬜ |
| **US3-03c** | Wire tab to provider (`character`, `setCharacter`) | ⬜ |

### Phase 4 — Generation flow (reuse Statblock patterns)

| Task | Description | Status |
|------|-------------|--------|
| **US3-04a** | Copy generate flow from `ImageGenerationTab.tsx` (request body + abort + error handling + `num_images: 4`) | ⬜ |
| **US3-04b** | Store results in `character.portraitGallery` | ⬜ |
| **US3-04c** | Set active `portrait` on selection + store `portraitPrompt` | ⬜ |

### Phase 5 — Delightful extras (still v1)

| Task | Description | Status |
|------|-------------|--------|
| **US3-05a** | Locks UI (soft locks in prompt builder) | ⬜ |
| **US3-05b** | Recipe panel: "Copy prompt" + show model/style/negative prompt | ⬜ |

---

## 🧠 Prompt Derivation Helper

Create `LandingPage/src/components/PlayerCharacterGenerator/generation/portraitPromptBuilder.ts`:

```typescript
export function derivePortraitPrompt(character: Character): {
    basePrompt: string;
    defaultCaption: string;
    defaultAlt: string;
}

// Example output:
// basePrompt: "A weathered human fighter in heavy armor, battle scars, determined expression"
// defaultCaption: "Kira Stonefist, veteran of the Iron Legion"
// defaultAlt: "Portrait of Kira Stonefist, a battle-scarred human fighter"
```

Inputs to consider:
- `character.name`
- `character.dnd5eData.race.name`
- `character.dnd5eData.classes[0].name`
- `character.dnd5eData.background.name`
- `character.backstory` (extract mood/tone)
- Notable equipment (armor type, signature weapon)

---

## Quick Pickup

### Key Files (current)
```
LandingPage/src/components/PlayerCharacterGenerator/PlayerCharacterCreationDrawer.tsx
  - Portrait tab placeholder (L233-L241)

LandingPage/src/components/PlayerCharacterGenerator/shared/CharacterCanvas.tsx
  - portraitUrl currently hardcoded undefined (L1151-L1161)

LandingPage/src/components/PlayerCharacterGenerator/shared/MobileCharacterCanvas.tsx
  - portraitUrl currently hardcoded undefined (L211-L220)

LandingPage/src/components/PlayerCharacterGenerator/types/character.types.ts
  - Character has portrait + portraitPrompt (L54-L57)

LandingPage/src/components/StatBlockGenerator/generationDrawerComponents/ImageGenerationTab.tsx
  - Proven image generation flow + request body (L139-L152)

DungeonMindServer/routers/statblockgenerator_router.py
  - /generate-image exists and requires auth (L97-L111)
```

---

## Backlog (Option C ideas — intentionally deferred)
- “Commission modes” (Wanted poster / dossier / token crop)
- Multi-output variants per mode


