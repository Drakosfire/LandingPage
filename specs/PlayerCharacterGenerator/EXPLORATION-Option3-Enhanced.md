# Option 3 Enhanced: Compact Static Column + Expandable Content Area

**Date:** December 6, 2025  
**Type:** Design Exploration  
**Based On:** Option 3 from Layout Reorganization Options  
**Status:** In Development

---

## Core Design Principles

### 1. Static vs Expandable Components

**Static Components (fixed content, predictable size):**
- Saving Throws (always 6)
- Skills (always 18)
- Proficiencies (text list, wraps naturally)
- Passive Perception (single value)
- Inspiration (checkbox)
- Proficiency Bonus (single value)
- Hit Dice (single value + type)
- Death Saves (always 3+3 circles)
- AC, Initiative, Speed (single values each)
- HP Max/Current/Temp (single values)

**Expandable Components (variable content):**
- Attacks & Spellcasting (1-10+ attacks depending on class/level)
- Equipment (highly variable, could be 5-50+ items)
- Features & Traits (grows significantly with level, multiclass)

### 2. Column Width Analysis

**Column 1 - Static Content:**
- Current: 200px
- Content needs: Skills are the widest element
  - "+2 ○ Animal Handling (WIS)" ≈ 180px at 12px font
- **Could narrow to 180px or even 160px** if we abbreviate abilities

**Column 2 - Expandable Content:**
- Current: 240px
- Should expand to absorb Column 1 savings
- **Could widen to 260-280px**

**Column 3 - Features:**
- Current: 200px
- Features need vertical space, not width
- **Keep at 200px or slightly wider**

---

## Proposed Layout: Option 3 Enhanced

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              HEADER + PORTRAIT                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                           ABILITY SCORES ROW                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│    COLUMN 1 (160px)     │      COLUMN 2 (280px)       │  COLUMN 3 (200px)   │
│  ┌───────────────────┐  │  ┌─────────────────────────┐│ ┌─────────────────┐ │
│  │  SAVING THROWS    │  │  │  ══ COMBAT STATUS ══    ││ │                 │ │
│  │  +5 ● STR         │  │  │ ┌────┐ ┌────┐ ┌──────┐  ││ │                 │ │
│  │  +2 ○ DEX         │  │  │ │ 16 │ │ +2 │ │ 30ft │  ││ │                 │ │
│  │  +4 ● CON         │  │  │ │ AC │ │Init│ │Speed │  ││ │                 │ │
│  │  +0 ○ INT         │  │  │ └────┘ └────┘ └──────┘  ││ │                 │ │
│  │  +1 ○ WIS         │  │  │  HP: 12/12  Temp: ___   ││ │   FEATURES &    │ │
│  │  -1 ○ CHA         │  │  └─────────────────────────┘│ │     TRAITS      │ │
│  └───────────────────┘  │  ┌─────────────────────────┐│ │                 │ │
│  ┌───────────────────┐  │  │  ATTACKS & SPELLCAST    ││ │ • Second Wind   │ │
│  │     SKILLS        │  │  │  Name    │Atk│ Damage   ││ │                 │ │
│  │  +2 ○ Acrobat DEX │  │  │  ────────┼───┼───────── ││ │ • Fighting      │ │
│  │  +1 ○ Animal  WIS │  │  │  Longswrd│+5 │1d8+3 sl  ││ │   Style         │ │
│  │  +0 ○ Arcana  INT │  │  │  Javelin │+5 │1d6+3 pi  ││ │                 │ │
│  │  +5 ● Athlet  STR │  │  │  [expandable rows]      ││ │ • Dwarven       │ │
│  │  -1 ○ Decept  CHA │  │  │                         ││ │   Resilience    │ │
│  │  +0 ○ History INT │  │  │                         ││ │                 │ │
│  │  +3 ● Insght  WIS │  │  └─────────────────────────┘│ │                 │ │
│  │  +1 ● Intim   CHA │  │  ┌─────────────────────────┐│ │                 │ │
│  │  +0 ○ Invest  INT │  │  │      EQUIPMENT          ││ │                 │ │
│  │  +1 ○ Medic   WIS │  │  │  ┌──────────┬─────────┐ ││ │                 │ │
│  │  +0 ○ Nature  INT │  │  │  │Chain mail│Longsword│ ││ │                 │ │
│  │  +1 ○ Percep  WIS │  │  │  │Shield    │Javelin  │ ││ │                 │ │
│  │  +1 ○ Perfrm  CHA │  │  │  │Javelin   │Javelin  │ ││ │                 │ │
│  │  -1 ○ Persua  CHA │  │  │  │Backpack  │Bedroll  │ ││ │                 │ │
│  │  +0 ○ Relgn   INT │  │  │  │Rations x5│Waterskin│ ││ │                 │ │
│  │  +2 ○ Sleigh  DEX │  │  │  │[more...] │         │ ││ │                 │ │
│  │  +2 ○ Stlth   DEX │  │  │  └──────────┴─────────┘ ││ │                 │ │
│  │  +1 ○ Surv    WIS │  │  │  ─────────────────────  ││ │                 │ │
│  └───────────────────┘  │  │  GP: 15 │ SP: 0 │ CP: 0 ││ │                 │ │
│  ┌───────────────────┐  │  └─────────────────────────┘│ └─────────────────┘ │
│  │  PROFICIENCIES    │  │                             │                     │
│  │  Lang: Common,    │  │                             │                     │
│  │        Dwarvish   │  │                             │                     │
│  │  Armor: Lt, Med,  │  │                             │                     │
│  │         Hvy, Shld │  │                             │                     │
│  │  Weap: Simple,    │  │                             │                     │
│  │        Martial    │  │                             │                     │
│  └───────────────────┘  │                             │                     │
├─────────────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ ○ INSP │ +2 PROF │ 10 PASSIVE │ 1d10 HIT DICE │ DEATH ○○○ ✓  ○○○ ✗     │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Footer Bar Design

The footer consolidates all "reference" stats that:
- Are checked occasionally during play
- Don't change frequently
- Need to be visible but not prominent

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ○ INSP │ +2 PROF │ 10 PASSIVE │ 1d10 HIT DICE │ DEATH ○○○ ✓  ○○○ ✗         │
│ └──┬──┘  └──┬───┘  └────┬────┘  └─────┬──────┘  └────────┬────────┘        │
│    │        │           │             │                  │                  │
│ Inspiration Prof Bonus  Passive      Hit Dice          Death Saves         │
│ (checkbox)  (derived)   Perception   (class-based)     (combat tracker)    │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Footer Height:** ~30-35px (compact but readable)

---

## Column 1: Narrower Static Column

**Current Width:** 200px  
**Proposed Width:** 160-180px

### Skill Abbreviation Options

**Option A: Abbreviated Ability (current-ish)**
```
+2 ○ Acrobatics (DEX)     → +2 ○ Acrobat DEX
+1 ○ Animal Handling (WIS) → +1 ○ Animal WIS
```

**Option B: No Ability Shown (very compact)**
```
+2 ○ Acrobatics
+1 ○ Animal Handling
```
*Pros: Narrowest. Cons: Need to memorize which ability governs each skill.*

**Option C: Ability as Superscript/Small**
```
+2 ○ Acrobatics^DEX
+1 ○ Animal Handling^WIS
```

**Recommendation:** Option A with 6-character abbreviations for skills:
```
Acrobat, Animal, Arcana, Athlet, Decept, History
Insght, Intim, Invest, Medic, Nature, Percep
Perfrm, Persua, Relgn, Sleigh, Stlth, Surv
```

---

## Column 2: Expandable Content

### Attacks & Spellcasting

**Design Considerations:**
- Fighter at level 1: 2-3 attacks
- Fighter at level 20 with multiclass: 8-10+ attacks
- Spellcasters: Attack cantrips + weapon attacks

**Layout:**
```
┌─────────────────────────────────────────┐
│       ATTACKS & SPELLCASTING            │
├──────────────────┬─────┬────────────────┤
│ Name             │ Atk │ Damage         │
├──────────────────┼─────┼────────────────┤
│ Longsword        │ +5  │ 1d8+3 slashing │
│ Javelin          │ +5  │ 1d6+3 piercing │
│ Javelin (thrown) │ +5  │ 1d6+3 piercing │
│ Unarmed Strike   │ +5  │ 4 bludgeoning  │
│ ________________ │ ___ │ ______________ │  ← Empty rows for expansion
│ ________________ │ ___ │ ______________ │
└──────────────────┴─────┴────────────────┘
```

**Minimum rows:** 3 (covers most level 1 characters)  
**Default rows:** 5 (comfortable for most builds)  
**Max before scroll/overflow:** 8-10

---

### Equipment: Two-Column Layout

**Design Considerations:**
- Starting equipment: 8-15 items
- Adventured character: 20-50+ items
- Currency needs visibility but not prominence

**Layout Option A: Side-by-side columns with currency footer**
```
┌─────────────────────────────────────────┐
│              EQUIPMENT                   │
├────────────────────┬────────────────────┤
│ Chain mail         │ Longsword          │
│ Shield             │ Javelin ×3         │
│ Backpack           │ Bedroll            │
│ Mess kit           │ Tinderbox          │
│ Torches ×10        │ Rations ×10        │
│ Waterskin          │ Hempen rope (50ft) │
│ ________________   │ ________________   │
├────────────────────┴────────────────────┤
│ GP: 15  │  SP: 0  │  EP: 0  │  CP: 0    │
└─────────────────────────────────────────┘
```

**Layout Option B: Currency at top**
```
┌─────────────────────────────────────────┐
│ GP: 15  │  SP: 0  │  EP: 0  │  CP: 0    │
├────────────────────┬────────────────────┤
│              EQUIPMENT                   │
├────────────────────┼────────────────────┤
│ Chain mail         │ Longsword          │
│ Shield             │ Javelin ×3         │
│ ...                │ ...                │
└────────────────────┴────────────────────┘
```

**Layout Option C: Currency integrated inline**
```
┌─────────────────────────────────────────┐
│              EQUIPMENT                   │
├────────────────────┬────────────────────┤
│ 💰 15 GP, 0 SP     │ Chain mail         │
│ Longsword          │ Shield             │
│ Javelin ×3         │ Backpack           │
│ ...                │ ...                │
└────────────────────┴────────────────────┘
```

**Recommendation:** Option A (currency footer)
- Currency is reference info, not frequently changed during session
- Equipment list is the primary content
- Footer placement mirrors the page footer pattern

---

## Data Flow: Equipment from Inventory Page

```
┌─────────────────┐      ┌──────────────────┐      ┌─────────────────┐
│  Inventory Page │ ───► │  Character State │ ───► │ Character Sheet │
│   (full CRUD)   │      │   (dnd5eData)    │      │  (display only) │
└─────────────────┘      └──────────────────┘      └─────────────────┘
        │                         │                        │
        │ • Add/remove items      │ • equipment[]          │ • 2-column list
        │ • Manage quantities     │ • currency{}           │ • Currency footer
        │ • Organize/sort         │ • weapons[]            │ • Read-only view
        └─────────────────────────┴────────────────────────┘
```

**Sheet displays:**
- All items from `equipment[]` array
- Currency from `currency{}` object
- Weapons separately in Attacks section (already happens)

**NOT on sheet:**
- Item management
- Weight tracking
- Sorting/organizing

---

## Width Comparison

| Element | Current | Proposed | Delta |
|---------|---------|----------|-------|
| Column 1 | 200px | 160px | -40px |
| Column 2 | 240px | 280px | +40px |
| Column 3 | 200px | 200px | 0 |
| **Total** | **640px** | **640px** | **0** |

**Note:** Total content width stays same, just redistributed.

---

## Component Sizing Summary

### Fixed Size (won't grow)
| Component | Height | Notes |
|-----------|--------|-------|
| Header + Portrait | ~110px | Fixed |
| Ability Scores Row | ~80px | Fixed 6 scores |
| Footer Bar | ~35px | All reference stats |
| Saving Throws | ~90px | Always 6 saves |
| Skills | ~270px | Always 18 skills |
| Proficiencies | ~80px | Text wraps, but bounded |

### Variable Size (needs flex/scroll consideration)
| Component | Min Height | Typical | Max Before Scroll |
|-----------|------------|---------|-------------------|
| Combat Status (AC/HP) | 80px | 80px | 80px (fixed) |
| Attacks | 80px (3 rows) | 120px (5 rows) | 180px (8 rows) |
| Equipment | 100px | 150px | 200px |
| Features | 200px | fills remaining | scroll if needed |

---

## Next Steps

1. **Prototype the footer bar** - Test if all elements fit at 35px height
2. **Test 160px Column 1** - Verify skills still readable with abbreviations
3. **Build 2-column equipment component** - New component or modify existing
4. **Define overflow behavior** - What happens when Attacks/Equipment exceed space?

---

## Questions to Resolve

1. **Skill abbreviations:** Which option (A/B/C) feels most readable?
2. **Equipment overflow:** Scroll within box, or expand and push Features down?
3. **Currency placement:** Footer of equipment box, or top?
4. **Hit Dice display in footer:** Just "1d10" or "1/1 d10" (current/max)?
5. **Death Saves in footer:** Circles or just text counters?

---

## References

- Current CSS: `CharacterSheet.css` lines 368-387 (grid definition)
- Skills component: `column1/SkillsSection.tsx`
- Equipment component: `column2/EquipmentSection.tsx`
- Current footer: None (new component needed)

