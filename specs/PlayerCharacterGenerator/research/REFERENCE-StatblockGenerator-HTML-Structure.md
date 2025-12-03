# StatblockGenerator HTML/CSS Structure Reference

**Purpose**: Document the StatblockGenerator canvas structure for adapting to PlayerCharacterGenerator  
**Created**: December 2025  
**Task**: T068

---

## 1. HTML Structure Hierarchy

```html
<div class="dm-canvas-responsive">              <!-- Responsive container with CSS vars -->
    <div class="dm-canvas-wrapper">             <!-- Transform wrapper for scaling -->
        <div class="dm-canvas-renderer">        <!-- Fixed dimensions -->
            <div class="dm-canvas-pages">       <!-- Page collection -->
                <div class="dm-canvas-pages-content">
                    <!-- CanvasPage renders here -->
                    <div class="dm-canvas-page page phb">   <!-- Single page with PHB theme -->
                        <div class="columnWrapper">          <!-- Two-column flexbox container -->
                            <div class="monster frame wide"> <!-- Frame with D&D styling -->
                                <div class="canvas-column">  <!-- Left column -->
                                    <!-- Components render here -->
                                </div>
                                <div class="canvas-column">  <!-- Right column -->
                                    <!-- Components render here -->
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
```

---

## 2. CSS Variables (canvas-base.css)

```css
.dm-canvas-responsive {
    --dm-page-scale: 1;           /* Responsive scaling factor */
    --dm-page-width: 816px;       /* US Letter width at 96dpi */
    --dm-page-height: 1056px;     /* US Letter height at 96dpi */
    --dm-column-count: 2;         /* Two-column layout */
    --dm-column-gap: 12px;        /* Gap between columns */
}
```

---

## 3. D&D Theme Colors (canvas-dnd-theme.css)

```css
:root {
    --dm-text-dark-brown: #2b1d0f;      /* Body text */
    --dm-text-header-brown: #58180d;    /* Headers */
    --dm-text-maroon-red: #a11d18;      /* Accent red */
    --dm-accent-gold: #C0AD6A;          /* Gold accents */
    --dm-accent-red: #9C2B1B;           /* Red accents */
    --dm-white-overlay: rgba(255, 255, 255, 0.7);
}
```

---

## 4. D&D Theme Fonts

```css
/* Header/Name fonts */
font-family: 'BookInsanityRemake', 'NodestoCapsCondensed', serif;

/* Body/Stats fonts */
font-family: 'ScalySansRemake', 'Open Sans', sans-serif;
```

**Font loading**: Uses `usePHBTheme` hook with `DND_CSS_BASE_URL` for remote font hosting.

---

## 5. Key Component CSS Classes

### Identity Header
```css
.dm-identity-header          /* Container */
.dm-monster-name             /* Name heading (2.2rem) */
.dm-monster-meta             /* Subtitle (1rem) */
```

### Ability Scores
```css
.dm-ability-table            /* Full-width table */
.dm-ability-table th         /* Red gradient header */
.dm-ability-table td         /* Score cells */
.dm-ability-value            /* Flexbox score + modifier */
```

### Stat Summary
```css
.dm-stat-summary             /* Container with left red border */
.dm-stat-summary dt          /* Label */
.dm-stat-summary dd          /* Value */
```

### Content Sections
```css
.dm-action-section           /* Actions container */
.dm-trait-section            /* Traits container */
.dm-section-heading          /* Section title (maroon, uppercase) */
.dm-action-term              /* Action name */
.dm-action-description       /* Action text */
```

---

## 6. Frame Configuration (StatblockPage.tsx)

```typescript
const PHB_FRAME_CONFIG: FrameConfig = {
    verticalBorderPx: 12.5,       /* CSS border: 6.25px top + bottom */
    horizontalBorderPx: 10,       /* CSS border: 5px left + right */
    columnPaddingPx: 10,          /* CSS padding: 5px left + right */
    columnVerticalPaddingPx: 16,  /* CSS padding: 8px top + bottom */
    componentGapPx: 12,           /* CSS gap between components */
    pageFontSizePx: 12.8504,      /* .page.phb computed font-size */
    frameFontSizePx: 12.0189,     /* .monster.frame computed font-size */
};
```

---

## 7. Multi-Page Rendering

**Key Components:**
- `CanvasPage` from `dungeonmind-canvas` - Renders paginated layout
- `MeasurementPortal` - Measures component heights for pagination
- `PageBreakManager` (implicit in dungeonmind-canvas) - Calculates breaks

**Page Gap**: 48px between pages (`dm-canvas-pages-content { gap: 48px }`)

---

## 8. Differences for PC Sheets

| StatblockGenerator | PlayerCharacterGenerator |
|--------------------|--------------------------|
| `.monster.frame.wide` | Need `.character-sheet` frame |
| Single creature | Multiple pages (sheet, spells, backstory) |
| Inline ability table | 6-box ability score layout |
| Action-centric sections | Skill/Save checkboxes |
| Portrait block | Character appearance section |

---

## 9. D&D Beyond Reference (from PDF)

**Sections to implement:**
- Senses (Passive Perception, Insight, Investigation)
- Attacks table (Name, Hit, Damage/Type, Notes)
- Features & Traits (Class + Species)
- Personality (Traits, Ideals, Bonds, Flaws)
- Spells table (Prep, Name, Source, Save/ATK, Time, Range, Components, Duration)

---

## 10. Next Steps

1. ✅ T068: Document StatblockGenerator structure
2. 🔄 T069: Get visual reference of target PHB layout
3. T070: Create `CharacterSheetPage.tsx` adapting `.page.phb` for PC sheets
4. T071: Implement page break logic for PC content (2-3 pages expected)
5. T073: Create PC-specific section components (SkillsGrid, SavesGrid, etc.)
6. T074: Add/extend CSS for PC-specific elements

---

**References:**
- `src/styles/canvas/canvas-base.css` - Canvas structure
- `src/styles/canvas/canvas-dnd-theme.css` - D&D styling
- `src/styles/StatblockComponents.css` - Statblock-specific
- `src/components/StatBlockGenerator/StatblockPage.tsx` - Page rendering

