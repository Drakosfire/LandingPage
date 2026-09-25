# Handoff: Column Layout Optimization

**Date:** December 6, 2025  
**Type:** Polish/Refactor  
**Estimated Effort:** 2-4 hours  
**Depends On:** `HANDOFF-Background-Personality-Sheet.md` (personality moved to separate page)

---

## Context

After moving Personality Traits, Ideals, Bonds, and Flaws to the Background & Personality sheet, Column 3 on the main character sheet has significant unused space. This handoff addresses optimizing the layout to better utilize available space.

**Current State:** Column 3 contains only Features & Traits (formerly also had personality content).

---

## Current Layout (ASCII Render)

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                      HEADER                                          │
│  ┌─────────┐  ┌─────────────────────────────────┬────────────────────┬──────────┐   │
│  │ Portrait│  │ Character Name                  │ Player Name        │   XP     │   │
│  │ 100x100 │  ├─────────────────────────────────┴────────────────────┴──────────┤   │
│  │         │  │ Class & Level  │  Race  │  Background  │  Alignment             │   │
│  └─────────┘  └──────────────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                              ABILITY SCORES ROW                                      │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐           │
│  │   STR   │ │   DEX   │ │   CON   │ │   INT   │ │   WIS   │ │   CHA   │           │
│  │   16    │ │   14    │ │   15    │ │   10    │ │   12    │ │    8    │           │
│  │   +3    │ │   +2    │ │   +2    │ │   +0    │ │   +1    │ │   -1    │           │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘           │
├─────────────────────────────────────────────────────────────────────────────────────┤
│           COLUMN 1            │        COLUMN 2         │       COLUMN 3            │
│           (200px)             │        (240px)          │        (200px)            │
│  ┌──────────────────────────┐ │ ┌─────────────────────┐ │ ┌────────────────────────┐│
│  │ ○ Insp  │ +2 Prof Bonus  │ │ │ AC │ Init │ Speed   │ │ │                        ││
│  └──────────────────────────┘ │ │ 16 │  +2  │  30ft   │ │ │   FEATURES & TRAITS    ││
│  ┌──────────────────────────┐ │ └─────────────────────┘ │ │                        ││
│  │    SAVING THROWS         │ │ ┌─────────────────────┐ │ │  • Second Wind         ││
│  │  +5 ● Strength           │ │ │ HP Maximum: 12      │ │ │    (short rest)        ││
│  │  +2 ○ Dexterity          │ │ │ Current HP: [    ]  │ │ │                        ││
│  │  +4 ● Constitution       │ │ │ Temp HP:    [    ]  │ │ │  • Fighting Style:     ││
│  │  +0 ○ Intelligence       │ │ └─────────────────────┘ │ │    Defense             ││
│  │  +1 ○ Wisdom             │ │ ┌──────────┬──────────┐ │ │                        ││
│  │  -1 ○ Charisma           │ │ │ Hit Dice │ Death    │ │ │                        ││
│  └──────────────────────────┘ │ │  1d10    │ Saves    │ │ │                        ││
│  ┌──────────────────────────┐ │ │          │ ○○○ Succ │ │ │                        ││
│  │         SKILLS           │ │ │          │ ○○○ Fail │ │ │                        ││
│  │  +2 ○ Acrobatics (DEX)   │ │ └──────────┴──────────┘ │ │                        ││
│  │  +1 ○ Animal Hand. (WIS) │ │ ┌─────────────────────┐ │ │                        ││
│  │  +0 ○ Arcana (INT)       │ │ │ ATTACKS & SPELLCAST │ │ │                        ││
│  │  +5 ● Athletics (STR)    │ │ │ Name  │Atk│ Damage  │ │ │                        ││
│  │  -1 ○ Deception (CHA)    │ │ │ Longsw│ +5│ 1d8+3 sl│ │ │                        ││
│  │  +0 ○ History (INT)      │ │ │ Javeli│ +5│ 1d6+3 pi│ │ │ ┌──────────────────┐  ││
│  │  +3 ● Insight (WIS)      │ │ └─────────────────────┘ │ │ │                  │  ││
│  │  +1 ● Intimidation (CHA) │ │ ┌─────────────────────┐ │ │ │                  │  ││
│  │  ... (all 18 skills)     │ │ │ CP│SP│EP│GP│PP│     │ │ │ │  WASTED SPACE    │  ││
│  │                          │ │ │  0│ 0│ 0│15│ 0│     │ │ │ │                  │  ││
│  └──────────────────────────┘ │ │ ─────────────────── │ │ │ │                  │  ││
│  ┌──────────────────────────┐ │ │ Longsword           │ │ │ │                  │  ││
│  │ [10] Passive Perception  │ │ │ 3 Javelins          │ │ │ │                  │  ││
│  └──────────────────────────┘ │ │ Chain mail          │ │ │ └──────────────────┘  ││
│  ┌──────────────────────────┐ │ │ Explorer's Pack     │ │ │                        ││
│  │ PROFICIENCIES            │ │ │ ────────────────── │ │ │                        ││
│  │ Languages: Common        │ │ │      Equipment      │ │ │                        ││
│  │ Armor: Light, Medium...  │ │ └─────────────────────┘ │ └────────────────────────┘│
│  │ Weapons: Simple, Martial │ │                         │                           │
│  └──────────────────────────┘ │                         │                           │
└─────────────────────────────────────────────────────────────────────────────────────┘

Current grid: 200px | 240px | 200px = 640px + gaps
```

---

## Problem

With personality content removed, Column 3 has significant wasted space below Features & Traits. The current layout doesn't efficiently use the available vertical space.

---

## Proposed Solution: Expand Features

**Option A: Let Features expand to fill Column 3**

Simply remove the min-height constraint and let Features & Traits section expand to fill available space. This provides more room for characters with many features (multiclass, high level, etc.)

```
┌────────────────────────────────────────────────────────────────────────────────────┐
│        COLUMN 1           │       COLUMN 2          │       COLUMN 3               │
│         (200px)           │        (240px)          │        (200px)               │
│  ┌──────────────────────┐ │ ┌─────────────────────┐ │ ┌────────────────────────┐   │
│  │ ○ Insp │ +2 Prof     │ │ │ AC │ Init │ Speed   │ │ │                        │   │
│  └──────────────────────┘ │ │ 16 │  +2  │  30ft   │ │ │   FEATURES & TRAITS    │   │
│  ┌──────────────────────┐ │ └─────────────────────┘ │ │                        │   │
│  │   SAVING THROWS      │ │ ┌─────────────────────┐ │ │  • Second Wind         │   │
│  │ ... (6 saves)        │ │ │ HP Section          │ │ │    You have a limited  │   │
│  └──────────────────────┘ │ └─────────────────────┘ │ │    well of stamina... │   │
│  ┌──────────────────────┐ │ ┌──────────┬──────────┐ │ │                        │   │
│  │      SKILLS          │ │ │ Hit Dice │ Death    │ │ │  • Fighting Style:     │   │
│  │ ... (18 skills)      │ │ └──────────┴──────────┘ │ │    Defense             │   │
│  │                      │ │ ┌─────────────────────┐ │ │    +1 AC when wearing  │   │
│  │                      │ │ │ Attacks & Spellcast │ │ │    armor               │   │
│  │                      │ │ └─────────────────────┘ │ │                        │   │
│  └──────────────────────┘ │ ┌─────────────────────┐ │ │  • Proficiencies       │   │
│  ┌──────────────────────┐ │ │ Equipment           │ │ │    (from background)   │   │
│  │ [10] Passive Percep. │ │ │                     │ │ │                        │   │
│  └──────────────────────┘ │ │                     │ │ │  • (Room for more      │   │
│  ┌──────────────────────┐ │ │                     │ │ │    features as char    │   │
│  │ PROFICIENCIES        │ │ │                     │ │ │    levels up)          │   │
│  │ Languages, Armor...  │ │ │                     │ │ │                        │   │
│  └──────────────────────┘ │ └─────────────────────┘ │ └────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────────────────┘
```

---

## File Locations

```
LandingPage/src/components/PlayerCharacterGenerator/sheetComponents/
├── CharacterSheet.css                  # Grid layout, column styles
├── CharacterSheet.tsx                  # Main component (props)
├── MainContentGrid.tsx                 # Grid container (grid-template-columns)
├── column3/
│   ├── Column3Content.tsx              # Column content aggregator
│   ├── PersonalitySection.tsx          # TO BE REMOVED from this column
│   └── FeaturesSection.tsx             # TO BE EXPANDED
└── index.ts                            # Exports
```

### Key CSS (CharacterSheet.css)

Current grid definition (line 369-374):
```css
.character-sheet .sheet-main-content {
    display: grid;
    grid-template-columns: 200px 240px 200px;
    gap: var(--column-gap);
    margin-top: var(--space-1);
}
```

Features box min-height (line ~780):
```css
.character-sheet .features-box .text-area {
    flex: 1;
    min-height: var(--min-height-textarea-md);  /* 80px - can be removed */
    padding: var(--padding-box-sm);
    font-size: 12px;
}
```

---

## Implementation Plan

### Step 1: Remove PersonalitySection from Column3Content

Update `column3/Column3Content.tsx`:
- Remove import of `PersonalitySection`
- Remove personality props (traits, ideals, bonds, flaws)
- Only render `FeaturesSection`

### Step 2: Update Column3Content Props

Remove personality-related props from interface.

### Step 3: Update CharacterSheet.tsx

Remove personality props from `Column3Content` usage.

### Step 4: Update Features CSS

In `CharacterSheet.css`:
- Remove min-height constraint from `.features-box .text-area`
- Add `flex: 1` to `.features-box` so it expands to fill available space

### Step 5: Clean Up (Optional)

- Remove `PersonalitySection.tsx` from column3/
- Update column3/index.ts exports

---

## Files to Modify

| File | Changes |
|------|---------|
| `column3/Column3Content.tsx` | Remove PersonalitySection, update props |
| `CharacterSheet.tsx` | Remove personality props from Column3Content |
| `CharacterSheet.css` | Remove min-height from features, add flex:1 |
| `column3/index.ts` | Remove PersonalitySection export (optional) |

## Files to Delete (Optional)

| File | Reason |
|------|--------|
| `column3/PersonalitySection.tsx` | Moved to BackgroundPersonalitySheet |

---

## Testing Checklist

- [ ] Column 3 renders only Features & Traits
- [ ] Features section expands to fill available vertical space
- [ ] No layout breaking when features list is short
- [ ] No layout breaking when features list is long
- [ ] Demo character renders correctly
- [ ] Print layout still works

---

## Success Criteria

1. PersonalitySection removed from Column 3
2. FeaturesSection expands to fill column height
3. No wasted space in Column 3
4. Demo character (Marcus Steelhand) renders correctly
5. Build passes, no lint errors

---

## Future Considerations (Out of Scope)

- Moving more content between columns
- Adjusting column widths (currently 200/240/200)
- Adding new sections to freed space
- Responsive layout adjustments

---

## References

- **Current Column3:** `sheetComponents/column3/Column3Content.tsx`
- **CSS Variables:** `CharacterSheet.css` lines 22-70
- **Grid Layout:** `CharacterSheet.css` lines 368-374
- **Features CSS:** `CharacterSheet.css` lines 780-795
- **Depends On:** `HANDOFF-Background-Personality-Sheet.md`

