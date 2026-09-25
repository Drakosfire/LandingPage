# Handoff: US6 — PDF Export (Print → Save as PDF)
**Date:** 2025-12-14  
**Type:** Feature  
**Last Updated:** 2025-12-14  

---

## 🚨 CURRENT STATE

### What’s Working ✅
- **Browser-print export pattern exists and is proven** in StatblockGenerator (pattern source):

```84:120:LandingPage/src/components/StatBlockGenerator/StatBlockGenerator.tsx
// Export handlers for UnifiedHeader AppToolbox integration
const handleExportPDF = useCallback(() => {
    // Use browser's native print dialog
    // For best results, users should use Firefox and select "Save as PDF"
    const isFirefox = navigator.userAgent.toLowerCase().includes('firefox');

    if (!isFirefox) {
        const proceed = window.confirm(
            'For best PDF results, we recommend using Firefox.\n\n' +
            'Firefox provides the most accurate rendering of the statblock layout.\n\n' +
            'Click OK to continue with browser print, or Cancel to switch browsers.'
        );

        if (!proceed) {
            return;
        }
    }

    console.log('📄 Opening browser print dialog...');
    window.print();
}, []);
```

- **PCG Print / Save PDF is implemented** (native browser print, Firefox recommended):
  - Toolbox action: **Export → Print / Save PDF**
  - Handler uses `window.print()` with Firefox recommendation + font readiness wait + temporary edit-mode disable.

- **PCG has a dev-only print debugging tool**:
  - Toolbox action (dev only): **Dev Tools → Capture Print Snapshot (HTML)**
  - Captures the print-preview DOM/CSS state for evidence-driven debugging.

- **PCG uses print-specific CSS** to prevent the recurring print bugs we saw in Firefox:
  - Prevent “blank pages between pages” (flex+gap quirks)
  - Prevent “blank first page” (visibility-hidden UI still in-flow)
  - Preserve PHB page layout (avoid print rules that collapse flex layouts)

```1:120:LandingPage/src/styles/canvas/canvas-print.css
@layer canvas-overrides {
    @page {
        size: letter portrait;
        margin: 0.25in;
    }

    @media print {
        body,
        body * {
            visibility: hidden !important;
            overflow: visible !important;
        }

        .generator-canvas-container,
        .generator-canvas-container * {
            visibility: visible !important;
        }
        // ... hides header/footer/drawers via display:none !important ...
    }
}
```

- **PCG canvas is wrapped in the exact class that the shared print contract expects** (`.generator-canvas-container`):

```114:156:LandingPage/src/components/PlayerCharacterGenerator/PlayerCharacterGenerator.tsx
return (
    <div className="generator-layout" data-testid="player-character-generator">
        {/* UnifiedHeader */}
        <UnifiedHeader
            // ...
        />

        {/* Canvas Content Area */}
        <div
            className="generator-canvas-container"
            style={{ /* ... */ }}
        >
            <div style={{ /* ... */ }}>
                <CharacterCanvas />
            </div>
        </div>
        // ...
    </div>
);
```

### What’s NOT Working ❌
- None known at this time for the core export flow. If you see regressions, use the snapshot tool to capture evidence.

### Primary Goal (V1 Launch)
- Add **Print → Save as PDF** for PCG (multi-page: Main + Background + Inventory + Spells).
- Reuse the **StatblockGenerator approach**: call `window.print()` and rely on print CSS to hide app chrome.

---

## ✅ Recommended Approach (Use Browser Print)

**Why this approach:** It’s fast, reliable, and matches the existing “canvas print contract” (`canvas-print.css`). Also, “PDF generation libraries” vary across browsers and are unnecessary for V1.

### User flow target
1. User clicks **Export → Save as PDF** (or **Print / Save PDF**) in the header/toolbox.
2. App opens native print dialog.
3. User chooses **Save to PDF**.

**Recommendation shown to user:** Prefer **Firefox** for best layout fidelity (same approach used in StatblockGenerator).

---

## 🛠️ Implementation Checklist (Treasure Map)

### Phase 1 — Add Print action to toolbox (PCG)

1. Add a “Print / Save as PDF” control to the PCG toolbox.
   - File: `LandingPage/src/components/PlayerCharacterGenerator/characterToolboxConfig.tsx`
   - Current state: only Dev Tools + Help; “Actions” section is commented out.

```26:115:LandingPage/src/components/PlayerCharacterGenerator/characterToolboxConfig.tsx
export interface CharacterToolboxConfigProps {
    // Help
    handleHelpTutorial?: () => void;

    // Dev Tools
    loadDemoCharacter?: (key: string) => void;
    demoCharacterOptions?: DemoCharacterOption[];

    // Phase 2+: Save, Export, etc.
    // isLoggedIn?: boolean;
    // saveNow?: () => void;
    // saveStatus?: 'idle' | 'saving' | 'saved' | 'error';
}
```

✅ **Implemented:**
- Extended `CharacterToolboxConfigProps` with `handlePrintPDF?: () => void`
- Added **Export → Print / Save PDF** menu item wired to `handlePrintPDF`
- Added (dev-only) **Dev Tools → Capture Print Snapshot (HTML)** menu item

2. Wire the handler from the main PCG component:
   - File: `LandingPage/src/components/PlayerCharacterGenerator/PlayerCharacterGenerator.tsx`
   - Add `handlePrintPDF` similar to StatblockGenerator’s `handleExportPDF`
   - Pass it into `createCharacterToolboxSections({ ... })`

### Phase 2 — Print handler behavior (PCG)

✅ **Implemented:**
- **Firefox recommendation prompt** (copy of StatblockGenerator behavior)
- **Wait for fonts** (`await document.fonts.ready` when available) before printing
- **Disable edit overlays for print** (temporarily toggles edit mode off before print and restores after)
- Adds small delay to allow reflow before invoking `window.print()`

### Phase 3 — Verify print output (the actual “export”)

Manual checklist (expected output):
- **4 pages are present** (Main + Background + Inventory + Spells), including overflow pages if they exist.
- **Background images + border art print** (print-color-adjust already enabled).
- **Portrait renders correctly** (watch for any global `.page img` z-index issues).
- **No app chrome** in print output (header, drawers, footer hidden by `canvas-print.css`).

---

## Debug / Verification

### Quick manual test
1. Open PCG route.
2. Load demo character (Dev Tools).
3. Click **Print / Save PDF**.
4. In print preview: confirm multiple pages and correct styling.

### Known gotchas
- **Browser differences**: Chrome print can rasterize/scale differently than Firefox.
- **Font timing**: printing before fonts load can slightly change layout.
- **Mobile canvas**: printing while viewport is in “mobile mode” may produce a different layout; best to print from desktop viewport.
- **Firefox quirks** (recurring pattern):
  - Flex + `gap` containers can create blank pages between pages in print preview.
  - Visibility-only “hide UI” can create a blank first page (hidden UI still affects layout).

---

## Key Files

```
LandingPage/src/components/PlayerCharacterGenerator/PlayerCharacterGenerator.tsx
  - UnifiedHeader wiring + generator-canvas-container wrapper (L114-L156)
  - Print handler + snapshot debug wiring

LandingPage/src/components/PlayerCharacterGenerator/characterToolboxConfig.tsx
  - Where to add a “Print / Save PDF” toolbox menu item (L26-L115)
  - Also includes dev-only snapshot menu item

LandingPage/src/components/PlayerCharacterGenerator/printDebug.ts
  - Print snapshot capture utility (dev-only)

LandingPage/src/styles/canvas/canvas-print.css
  - Print contract that hides UI and reveals the canvas container (L14-L120)

LandingPage/src/components/PlayerCharacterGenerator/sheetComponents/CharacterSheet.css
  - Per-sheet print rules (starts ~L2969)

LandingPage/src/components/StatBlockGenerator/StatBlockGenerator.tsx
  - Reference print handler pattern using `window.print()` (L84-L120)
```

---

## Status

| Phase | Status | Description |
|-------|--------|-------------|
| Phase 1 | ✅ Complete | Added “Print / Save PDF” action to PCG toolbox (+ dev snapshot tool) |
| Phase 2 | ✅ Complete | Implemented print handler (Firefox nudge + font wait + edit mode toggle) |
| Phase 3 | ✅ Complete | Print CSS hardened for Firefox (no blank pages, PHB layout preserved) |

---

## ✅ Completion Notes

- **Primary user path**: UnifiedHeader → Toolbox → Export → Print / Save PDF → Firefox “Save to PDF”.
- **Debugging path** (dev only): Toolbox → Dev Tools → Capture Print Snapshot (HTML) → diff snapshots to diagnose print regressions.

## Commits

- **LandingPage**: `f5b0847` — `feat(pcg): print/save PDF + print debug snapshot`
- **Root**: `bd4c284` — `feat(landing): update LandingPage for PCG PDF export`


