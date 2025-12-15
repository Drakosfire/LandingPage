# Handoff: Background & Personality Sheet

**Date:** December 6, 2025  
**Type:** Feature  
**Estimated Effort:** 4-6 hours

---

## Context

The current character sheet design allocates Column 3 to personality traits, ideals, bonds, flaws, and features. In practice, mechanical information (features, abilities) is more pertinent during gameplay than roleplay elements.

**Decision:** Create a separate "Background & Personality" sheet page for roleplay-focused content, freeing Column 3 on the main sheet for mechanical features.

---

## Goal

Create a new `BackgroundPersonalitySheet` page component that contains:
- Personality Traits
- Ideals
- Bonds
- Flaws
- Notes (multi-column layout)

**Out of Scope:** Rearranging columns on the main character sheet (separate task).

---

## Reference: Existing Page Structure

### File Locations
```
LandingPage/src/components/PlayerCharacterGenerator/sheetComponents/
├── CharacterSheet.css          # All PHB styling (CSS variables, sections)
├── CharacterSheet.tsx          # Main sheet orchestrator
├── CharacterSheetPage.tsx      # Page container (.page.phb wrapper)
├── CharacterHeader.tsx         # Header section
├── AbilityScoresRow.tsx        # Ability scores
├── MainContentGrid.tsx         # 3-column layout
├── column1/                    # Saves, Skills
├── column2/                    # Combat, HP, Equipment
├── column3/                    # Personality, Features (to be split)
└── index.ts                    # Exports
```

### Page Container Pattern

The `CharacterSheetPage.tsx` provides the PHB-styled page wrapper:

```tsx
// CharacterSheetPage.tsx - lines 47-68
export const CharacterSheetPage: React.FC<CharacterSheetPageProps> = ({
    children,
    className = '',
    testId = 'character-sheet-page'
}) => {
    const pageClasses = [
        'page',            // Base page styles
        'phb',             // PHB theme (parchment, border, footer accent)
        'character-sheet', // Our custom styles
        className
    ].filter(Boolean).join(' ');

    return (
        <div className={pageClasses} data-testid={testId}>
            {children}
        </div>
    );
};
```

### CSS Variables (Already Defined)

From `CharacterSheet.css` lines 22-70:
- Spacing scale: `--space-1` through `--space-24`
- Semantic spacing: `--padding-box`, `--padding-section`, `--gap-sm`, etc.
- PHB colors: `--HB_Color_Background`, `--border-color`, `--text-red`, etc.
- Min heights: `--min-height-textarea-sm`, `--min-height-textarea-md`

### Existing Personality Components

From `column3/PersonalitySection.tsx`:

```tsx
export interface PersonalitySectionProps {
    traits: string;
    ideals: string;
    bonds: string;
    flaws: string;
}
```

CSS classes (already in CharacterSheet.css):
- `.personality-box` - container with flex column
- `.personality-box .text-area` - text content area
- `.box-label` - bottom label styling

---

## Implementation Plan

### Step 1: Create BackgroundPersonalitySheet Component

**File:** `sheetComponents/BackgroundPersonalitySheet.tsx`

```tsx
interface BackgroundPersonalitySheetProps {
    // Personality
    traits: string;
    ideals: string;
    bonds: string;
    flaws: string;
    
    // Notes (optional, for future)
    notes?: string;
}
```

**Structure:**
```
┌─────────────────────────────────────────────────────────────┐
│                  BACKGROUND & PERSONALITY                    │
├─────────────────────────────────────────────────────────────┤
│ ┌───────────────────────┐  ┌───────────────────────────────┐│
│ │   PERSONALITY TRAITS  │  │           IDEALS              ││
│ │                       │  │                               ││
│ │                       │  │                               ││
│ └───────────────────────┘  └───────────────────────────────┘│
│ ┌───────────────────────┐  ┌───────────────────────────────┐│
│ │        BONDS          │  │           FLAWS               ││
│ │                       │  │                               ││
│ │                       │  │                               ││
│ └───────────────────────┘  └───────────────────────────────┘│
├─────────────────────────────────────────────────────────────┤
│                         NOTES                                │
│ ┌─────────────────┬─────────────────┬─────────────────────┐ │
│ │                 │                 │                     │ │
│ │                 │                 │                     │ │
│ │                 │                 │                     │ │
│ └─────────────────┴─────────────────┴─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Step 2: Add CSS for New Layout

**File:** `CharacterSheet.css` (append)

New classes needed:
- `.background-personality-sheet` - page-specific overrides
- `.personality-grid` - 2x2 grid for traits/ideals/bonds/flaws
- `.sheet-title` - page title styling (similar to `.section-title`)

### Step 3: Wire into CharacterCanvas

Update `CharacterCanvas.tsx` to render both pages:
1. Main character sheet (existing)
2. Background & Personality sheet (new)

Use the existing `CharacterSheetContainer` for multi-page layout.

### Step 4: Update Exports

Add to `sheetComponents/index.ts`:
```tsx
export { BackgroundPersonalitySheet } from './BackgroundPersonalitySheet';
```

---

## Files to Create

| File | Purpose |
|------|---------|
| `sheetComponents/BackgroundPersonalitySheet.tsx` | New page component |

## Files to Modify

| File | Changes |
|------|---------|
| `sheetComponents/CharacterSheet.css` | Add `.personality-grid`, `.sheet-title` styles |
| `sheetComponents/index.ts` | Export new component |
| `shared/CharacterCanvas.tsx` | Render second page after main sheet |

---

## Testing Checklist

- [ ] BackgroundPersonalitySheet renders with demo data
- [ ] PHB styling matches main character sheet (parchment, border, fonts)
- [ ] 2x2 grid for personality boxes renders correctly
- [ ] Notes section spans full width with 3-column layout
- [ ] Multi-page container shows both sheets with proper spacing
- [ ] Print styles work for both pages

---

## Success Criteria

1. New page renders with same PHB aesthetic as main sheet
2. Personality traits, ideals, bonds, flaws display in 2x2 grid
3. Notes section available with 3-column layout
4. Both pages visible in canvas area with proper spacing
5. CSS uses existing variables (no new magic numbers)

---

## References

- **Existing Page:** `sheetComponents/CharacterSheetPage.tsx`
- **Existing Personality:** `sheetComponents/column3/PersonalitySection.tsx`
- **CSS Variables:** `CharacterSheet.css` lines 22-70
- **HTML Prototype:** `specs/PlayerCharacterGenerator/prototypes/character-sheet.html`

