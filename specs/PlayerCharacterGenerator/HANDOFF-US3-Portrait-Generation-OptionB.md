# Handoff: US3 - Character Portrait Generation (Option B: “Locks + Gallery + Recipe”)
**Date:** 2025-12-14  
**Type:** Feature  
**Last Updated:** 2025-12-14  (updated for completion + portrait layering fix)  

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

### What Was Broken ❌ (Now Fixed ✅)
- **Portrait looked faded and/or disappeared** in the PCG sheet header.

### Root Cause ✅
- The global PHB stylesheet applies:
  - `.page img { z-index: -1; }`
  - File: `LandingPage/public/dnd-static/style.css`
- Our portrait is a normal `<img>` inside `.page.phb.character-sheet`, so it was being pushed behind the portrait slot background/other layers.
  - When the portrait slot background was translucent it looked “washed out”.
  - When the portrait slot background was made opaque, the image effectively became invisible.

### Fix ✅
- Override that global z-index for the portrait image only (desktop + mobile):
  - `LandingPage/src/components/PlayerCharacterGenerator/sheetComponents/CharacterSheet.css`
  - `LandingPage/src/components/PlayerCharacterGenerator/shared/MobileCharacterCanvas.css`

### Commit (LandingPage repo) ✅
- `83acf75` — `feat(pcg): portrait generation + upload (US3)`

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
| **US3-01a** | In `CharacterCanvas.tsx`, pass `portraitUrl={character.portrait}` instead of `undefined` | ✅ |
| **US3-01b** | In `MobileCharacterCanvas.tsx`, pass `portraitUrl={character.portrait}` instead of `undefined` | ✅ |

### Phase 2 — Data schema + persistence safety

| Task | Description | Status |
|------|-------------|--------|
| **US3-02a** | Extend `Character` type with Option B fields (`portraitCaption`, `portraitAlt`, `portraitMeta`, `portraitGallery`) | ✅ |
| **US3-02b** | Verify `createEmptyCharacter()` still works (no required initialization) | ✅ |

### Phase 3 — Replace Portrait placeholder with real tab

| Task | Description | Status |
|------|-------------|--------|
| **US3-03a** | Create `PortraitGenerationTab.tsx` in `creationDrawerComponents/` | ✅ |
| **US3-03b** | Wire tab in `PlayerCharacterCreationDrawer.tsx` | ✅ |
| **US3-03c** | Use provider (`character`, `updateCharacter`) for persistence | ✅ |

### Phase 4 — Generation flow (reuse Statblock patterns)

| Task | Description | Status |
|------|-------------|--------|
| **US3-04a** | Reuse generate flow (abort + errors + `num_images: 4`) calling `POST /api/statblockgenerator/generate-image` | ✅ |
| **US3-04b** | Store results in `character.portraitGallery` | ✅ |
| **US3-04c** | Select image → set `character.portrait` + `portraitPrompt` + `portraitMeta` | ✅ |

### Phase 5 — Delightful extras (still v1)

| Task | Description | Status |
|------|-------------|--------|
| **US3-05a** | Locks UI (soft locks in prompt composition) | ✅ |
| **US3-05b** | Recipe panel + copy (preserve newlines) | ✅ |

### Phase 6 — Upload + Cloud Save Trigger + Layer Fix (follow-ups discovered during implementation)

| Task | Description | Status |
|------|-------------|--------|
| **US3-06a** | Upload: drag/drop + browse, compress to JPG data URL (local-first) | ✅ |
| **US3-06b** | Ensure cloud autosave triggers on portrait changes when signed in (hash includes portrait fingerprints/counts) | ✅ |
| **US3-06c** | Fix portrait invisibility by overriding global `.page img { z-index: -1; }` for portrait images | ✅ |

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
  - Portrait tab wired to `PortraitGenerationTab`

LandingPage/src/components/PlayerCharacterGenerator/shared/CharacterCanvas.tsx
  - Passes `portraitUrl={character.portrait}` into `CharacterSheet`

LandingPage/src/components/PlayerCharacterGenerator/shared/MobileCharacterCanvas.tsx
  - Passes `portraitUrl={character.portrait}` into `CharacterSheet` (mobile)

LandingPage/src/components/PlayerCharacterGenerator/types/character.types.ts
  - Character includes `portraitCaption`, `portraitAlt`, `portraitMeta`, `portraitGallery`

LandingPage/src/components/PlayerCharacterGenerator/creationDrawerComponents/PortraitGenerationTab.tsx
  - Portrait upload + generation + gallery + recipe + locks

LandingPage/src/components/PlayerCharacterGenerator/sheetComponents/CharacterSheet.css
  - Portrait slot styling + z-index override for portrait `<img>`

LandingPage/src/components/PlayerCharacterGenerator/shared/MobileCharacterCanvas.css
  - Portrait z-index override for mobile

LandingPage/src/components/StatBlockGenerator/generationDrawerComponents/ImageGenerationTab.tsx
  - Proven image generation flow + request body (L139-L152)

DungeonMindServer/routers/statblockgenerator_router.py
  - /generate-image exists and requires auth (L97-L111)
```

---

## Backlog (Option C ideas — intentionally deferred)
- “Commission modes” (Wanted poster / dossier / token crop)
- Multi-output variants per mode


