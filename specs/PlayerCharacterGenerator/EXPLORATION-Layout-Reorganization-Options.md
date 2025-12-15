# Layout Reorganization Options

**Date:** December 6, 2025  
**Type:** Design Exploration  
**Purpose:** Explore 5 different approaches to reorganizing the character sheet layout

---

## Current State Analysis

### Identified Component Groups

**Group A: Passive/Meta Stats**
- Inspiration (checkbox)
- Proficiency Bonus (+2, etc.)
- Passive Perception (Passive Wisdom)

**Group B: Survivability/HP**
- Hit Points Maximum
- Current Hit Points
- Temporary Hit Points
- Hit Dice (total & current)
- Death Saves (successes & failures)

**Group C: Combat Readiness**
- Armor Class
- Initiative
- Speed

### Current Column Layout (200px | 240px | 200px)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              HEADER + PORTRAIT                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                           ABILITY SCORES ROW                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│      COLUMN 1 (200px)    │    COLUMN 2 (240px)     │    COLUMN 3 (200px)    │
│  ┌─────────────────────┐ │ ┌─────────────────────┐ │ ┌──────────────────┐   │
│  │ Insp | Prof Bonus   │ │ │ AC | Init | Speed   │ │ │                  │   │
│  └─────────────────────┘ │ └─────────────────────┘ │ │                  │   │
│  ┌─────────────────────┐ │ ┌─────────────────────┐ │ │                  │   │
│  │   SAVING THROWS     │ │ │     HP SECTION      │ │ │                  │   │
│  │   (6 saves)         │ │ │  Max | Curr | Temp  │ │ │   FEATURES &     │   │
│  └─────────────────────┘ │ └─────────────────────┘ │ │     TRAITS       │   │
│  ┌─────────────────────┐ │ ┌──────────┬──────────┐ │ │                  │   │
│  │      SKILLS         │ │ │ Hit Dice │ Death    │ │ │                  │   │
│  │   (18 skills)       │ │ │          │ Saves    │ │ │                  │   │
│  │                     │ │ └──────────┴──────────┘ │ │                  │   │
│  │                     │ │ ┌─────────────────────┐ │ │                  │   │
│  │                     │ │ │ ATTACKS & SPELLCAST │ │ │                  │   │
│  └─────────────────────┘ │ └─────────────────────┘ │ │                  │   │
│  ┌─────────────────────┐ │ ┌─────────────────────┐ │ │                  │   │
│  │ [10] Passive Percep │ │ │     EQUIPMENT       │ │ │                  │   │
│  └─────────────────────┘ │ │  Currency + List    │ │ │                  │   │
│  ┌─────────────────────┐ │ └─────────────────────┘ │ └──────────────────┘   │
│  │   PROFICIENCIES     │ │                         │                        │
│  │ Lang, Armor, Weap   │ │                         │                        │
│  └─────────────────────┘ │                         │                        │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Option 1: Unified Passive Stats Banner

**Concept:** Create a horizontal banner below ability scores that groups all "passive/meta" stats together.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              HEADER + PORTRAIT                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                           ABILITY SCORES ROW                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │  ○ INSPIRATION  │  +2 PROF BONUS  │  10 PASSIVE PERCEPTION (WISDOM)     │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────┤
│      COLUMN 1 (200px)    │    COLUMN 2 (240px)     │    COLUMN 3 (200px)    │
│  ┌─────────────────────┐ │ ┌─────────────────────┐ │ ┌──────────────────┐   │
│  │   SAVING THROWS     │ │ │ AC | Init | Speed   │ │ │                  │   │
│  │   (6 saves)         │ │ └─────────────────────┘ │ │                  │   │
│  └─────────────────────┘ │ ┌─────────────────────┐ │ │                  │   │
│  ┌─────────────────────┐ │ │  HP & SURVIVABILITY │ │ │   FEATURES &     │   │
│  │      SKILLS         │ │ │  Max | Curr | Temp  │ │ │     TRAITS       │   │
│  │   (18 skills)       │ │ │  ─────────────────  │ │ │                  │   │
│  │                     │ │ │  Hit Dice | Death   │ │ │                  │   │
│  │                     │ │ └─────────────────────┘ │ │                  │   │
│  │                     │ │ ┌─────────────────────┐ │ │                  │   │
│  │                     │ │ │ ATTACKS & SPELLCAST │ │ │                  │   │
│  └─────────────────────┘ │ └─────────────────────┘ │ │                  │   │
│  ┌─────────────────────┐ │ ┌─────────────────────┐ │ │                  │   │
│  │   PROFICIENCIES     │ │ │     EQUIPMENT       │ │ │                  │   │
│  │ Lang, Armor, Weap   │ │ │  Currency + List    │ │ └──────────────────┘   │
│  └─────────────────────┘ │ └─────────────────────┘ │                        │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Pros:**
- Clear visual separation of "meta" stats from combat stats
- Passive Perception gets prominent placement (frequently referenced)
- Unifies thematically related elements

**Cons:**
- Adds another horizontal row, reducing vertical space for columns
- May feel busy with three horizontal sections before columns

---

## Option 2: Integrated Survivability Block

**Concept:** Merge HP and Hit Dice/Death Saves into a single cohesive "Survivability" section in Column 2, with passive stats moved to Column 1 top.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              HEADER + PORTRAIT                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                           ABILITY SCORES ROW                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│      COLUMN 1 (200px)    │    COLUMN 2 (240px)     │    COLUMN 3 (200px)    │
│  ┌─────────────────────┐ │ ┌─────────────────────┐ │ ┌──────────────────┐   │
│  │ PASSIVE & META      │ │ │ AC | Init | Speed   │ │ │                  │   │
│  │ ○ Insp  │ +2 Prof   │ │ └─────────────────────┘ │ │                  │   │
│  │ [10] Pass. Percep.  │ │ ┌─────────────────────┐ │ │                  │   │
│  └─────────────────────┘ │ │   ═══ SURVIVAL ═══  │ │ │                  │   │
│  ┌─────────────────────┐ │ │ ┌─────────────────┐ │ │ │   FEATURES &     │   │
│  │   SAVING THROWS     │ │ │ │ HP Max: 12      │ │ │ │     TRAITS       │   │
│  │   (6 saves)         │ │ │ │ Current: [    ] │ │ │ │                  │   │
│  └─────────────────────┘ │ │ │ Temp:    [    ] │ │ │ │                  │   │
│  ┌─────────────────────┐ │ │ └─────────────────┘ │ │ │                  │   │
│  │      SKILLS         │ │ │ ┌───────┬─────────┐ │ │ │                  │   │
│  │   (18 skills)       │ │ │ │ Hit   │ Death   │ │ │ │                  │   │
│  │                     │ │ │ │ Dice  │ Saves   │ │ │ │                  │   │
│  │                     │ │ │ │ 1d10  │ ○○○/○○○ │ │ │ │                  │   │
│  │                     │ │ │ └───────┴─────────┘ │ │ │                  │   │
│  │                     │ │ └─────────────────────┘ │ │                  │   │
│  └─────────────────────┘ │ ┌─────────────────────┐ │ │                  │   │
│  ┌─────────────────────┐ │ │ ATTACKS & SPELLCAST │ │ │                  │   │
│  │   PROFICIENCIES     │ │ └─────────────────────┘ │ │                  │   │
│  │ Lang, Armor, Weap   │ │ ┌─────────────────────┐ │ └──────────────────┘   │
│  └─────────────────────┘ │ │     EQUIPMENT       │ │                        │
│                          │ └─────────────────────┘ │                        │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Pros:**
- All survivability info in one visual block
- Passive stats grouped at top of Column 1
- Clear narrative: "Meta → Defenses → Combat → Gear → Features"

**Cons:**
- Survivability block is taller, may compress attacks/equipment
- Passive Perception separated from Skills (where it conceptually belongs)

---

## Option 3: Combat Cluster with Passive Stats Footer

**Concept:** Shrink AC/Init/Speed and place them horizontally with HP max in a "Combat Ready" cluster. Move passive stats to a footer position.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              HEADER + PORTRAIT                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                           ABILITY SCORES ROW                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│      COLUMN 1 (200px)    │    COLUMN 2 (240px)     │    COLUMN 3 (200px)    │
│  ┌─────────────────────┐ │ ┌─────────────────────┐ │ ┌──────────────────┐   │
│  │   SAVING THROWS     │ │ │  ══ COMBAT READY ══ │ │ │                  │   │
│  │   (6 saves)         │ │ │  AC:16 | +2 | 30ft  │ │ │                  │   │
│  └─────────────────────┘ │ │  HP: 12/12 | Temp:0 │ │ │                  │   │
│  ┌─────────────────────┐ │ └─────────────────────┘ │ │                  │   │
│  │      SKILLS         │ │ ┌──────────┬──────────┐ │ │   FEATURES &     │   │
│  │   (18 skills)       │ │ │ Hit Dice │ Death    │ │ │     TRAITS       │   │
│  │                     │ │ │  1d10    │ Saves    │ │ │                  │   │
│  │                     │ │ └──────────┴──────────┘ │ │                  │   │
│  │                     │ │ ┌─────────────────────┐ │ │                  │   │
│  │                     │ │ │ ATTACKS & SPELLCAST │ │ │                  │   │
│  │                     │ │ │                     │ │ │                  │   │
│  │                     │ │ └─────────────────────┘ │ │                  │   │
│  └─────────────────────┘ │ ┌─────────────────────┐ │ │                  │   │
│  ┌─────────────────────┐ │ │     EQUIPMENT       │ │ │                  │   │
│  │   PROFICIENCIES     │ │ │  Currency + List    │ │ └──────────────────┘   │
│  └─────────────────────┘ │ └─────────────────────┘ │                        │
├─────────────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │  ○ INSPIRATION  │  +2 PROFICIENCY BONUS  │  10 PASSIVE PERCEPTION       │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Pros:**
- Compact "combat ready" snapshot at top of Column 2
- Passive stats in footer = always visible, easy reference
- More vertical space for Attacks and Equipment

**Cons:**
- Footer position is unconventional for character sheets
- "Combat Ready" block packs a lot of info densely

---

## Option 4: Two-Column Vertical Split

**Concept:** Major restructure to a 2-column layout with wider columns, grouping by "Character" (left) and "Combat" (right).

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              HEADER + PORTRAIT                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                           ABILITY SCORES ROW                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│         CHARACTER (320px)           │          COMBAT (320px)               │
│  ┌────────────────────────────────┐ │ ┌────────────────────────────────┐   │
│  │ ○ Insp │ +2 Prof │ 10 Passive  │ │ │    AC: 16  │  Init: +2  │ 30ft │   │
│  └────────────────────────────────┘ │ └────────────────────────────────┘   │
│  ┌────────────────────────────────┐ │ ┌────────────────────────────────┐   │
│  │        SAVING THROWS           │ │ │     ═══ HIT POINTS ═══        │   │
│  │  +5 ● STR  │  +2 ○ DEX         │ │ │  Maximum: 12                   │   │
│  │  +4 ● CON  │  +0 ○ INT         │ │ │  Current: [          ]        │   │
│  │  +1 ○ WIS  │  -1 ○ CHA         │ │ │  Temporary: [        ]        │   │
│  └────────────────────────────────┘ │ │  ─────────────────────────────  │   │
│  ┌────────────────────────────────┐ │ │  Hit Dice: 1d10  │ Death: ○○○  │   │
│  │           SKILLS               │ │ └────────────────────────────────┘   │
│  │  +2 ○ Acrobatics (DEX)         │ │ ┌────────────────────────────────┐   │
│  │  +5 ● Athletics (STR)          │ │ │    ATTACKS & SPELLCASTING      │   │
│  │  ... (18 skills in 2 cols)     │ │ │  Name      │ Atk │ Damage      │   │
│  │                                │ │ │  Longsword │ +5  │ 1d8+3 sl    │   │
│  │                                │ │ │  Javelin   │ +5  │ 1d6+3 pi    │   │
│  │                                │ │ │                                │   │
│  └────────────────────────────────┘ │ └────────────────────────────────┘   │
│  ┌────────────────────────────────┐ │ ┌────────────────────────────────┐   │
│  │       PROFICIENCIES            │ │ │         EQUIPMENT              │   │
│  │ Languages: Common, Dwarvish    │ │ │ CP│SP│EP│GP│PP │ Chain mail   │   │
│  │ Armor: Light, Medium, Heavy    │ │ │  0│ 0│ 0│15│ 0 │ Longsword    │   │
│  │ Weapons: Simple, Martial       │ │ │              │ Shield         │   │
│  └────────────────────────────────┘ │ └────────────────────────────────┘   │
│  ┌────────────────────────────────┐ │ ┌────────────────────────────────┐   │
│  │     FEATURES & TRAITS          │ │ │         FEATURES (cont.)       │   │
│  │ • Second Wind                  │ │ │ • Action Surge                 │   │
│  │   Short rest, regain 1d10+1    │ │ │   Take additional action       │   │
│  └────────────────────────────────┘ │ └────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Pros:**
- Clear conceptual split: "Who you are" vs "What you do in combat"
- Wider columns = more readable, less cramped
- Features can span both columns if needed

**Cons:**
- Major departure from PHB layout
- Skills in 2 columns may be harder to scan
- Features split across columns could be confusing

---

## Option 5: Card-Based Modular Layout

**Concept:** Radical redesign using a card/tile system. Each major section is a distinct "card" that can be arranged in a responsive grid. Maintains the PHB aesthetic but with modern layout flexibility.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ═══ IDENTITY BANNER ═══                              │
│  ┌──────────┐  ┌──────────────────────────────────────────────────────────┐ │
│  │ PORTRAIT │  │ MARCUS STEELHAND                                         │ │
│  │  100x100 │  │ Fighter 1 • Mountain Dwarf • Soldier • Lawful Good       │ │
│  └──────────┘  └──────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────┤
│                         ═══ ABILITY CARDS ═══                                │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │   STR   │ │   DEX   │ │   CON   │ │   INT   │ │   WIS   │ │   CHA   │   │
│  │   16    │ │   14    │ │   15    │ │   10    │ │   12    │ │    8    │   │
│  │   +3    │ │   +2    │ │   +2    │ │   +0    │ │   +1    │ │   -1    │   │
│  │ ● Save  │ │ ○ Save  │ │ ● Save  │ │ ○ Save  │ │ ○ Save  │ │ ○ Save  │   │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘   │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────────────────┐ │
│  │  ══ DEFENSES ══  │ │  ══ VITALITY ══  │ │      ══ META STATS ══        │ │
│  │                  │ │                  │ │                              │ │
│  │  ┌────┐ ┌────┐   │ │  HP: 12/12       │ │  ○ Inspiration               │ │
│  │  │ 16 │ │ +2 │   │ │  Temp: ____      │ │  +2 Proficiency Bonus        │ │
│  │  │ AC │ │Init│   │ │  ─────────────   │ │  10 Passive Perception       │ │
│  │  └────┘ └────┘   │ │  Hit Dice: 1d10  │ │                              │ │
│  │    30ft Speed    │ │  Death: ○○○/○○○  │ │                              │ │
│  └──────────────────┘ └──────────────────┘ └──────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────┐ ┌──────────────────────────────────┐│
│  │         ══ SKILLS ══               │ │      ══ ATTACKS ══              ││
│  │                                    │ │                                  ││
│  │  +2 ○ Acrobatics    +3 ● Insight   │ │  Longsword  │ +5 │ 1d8+3 slash  ││
│  │  +1 ○ Animal Hand.  +1 ● Intim.    │ │  Javelin    │ +5 │ 1d6+3 pierc  ││
│  │  +0 ○ Arcana        +0 ○ Invest.   │ │                                  ││
│  │  +5 ● Athletics     +0 ○ Medicine  │ │                                  ││
│  │  -1 ○ Deception     +0 ○ Nature    │ │                                  ││
│  │  +0 ○ History       +1 ○ Percep.   │ └──────────────────────────────────┘│
│  │                     +1 ○ Perform   │ ┌──────────────────────────────────┐│
│  │  (condensed 2-col   -1 ○ Persuade  │ │      ══ EQUIPMENT ══            ││
│  │   skill layout)     +0 ○ Religion  │ │                                  ││
│  │                     +2 ○ Sleight   │ │  GP: 15  │ Chain mail           ││
│  │                     +2 ○ Stealth   │ │          │ Longsword            ││
│  │                     +1 ○ Survival  │ │          │ Shield               ││
│  └────────────────────────────────────┘ │          │ 3 Javelins           ││
│                                         │          │ Explorer's Pack      ││
│                                         └──────────────────────────────────┘│
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────┐ ┌──────────────────────────────────┐│
│  │      ══ PROFICIENCIES ══           │ │    ══ FEATURES & TRAITS ══       ││
│  │                                    │ │                                  ││
│  │  Languages: Common, Dwarvish       │ │  • Second Wind                   ││
│  │  Armor: Light, Medium, Heavy,      │ │    Short rest recovery           ││
│  │         Shields                    │ │                                  ││
│  │  Weapons: Simple, Martial          │ │  • Fighting Style: Defense       ││
│  │  Tools: Smith's tools, vehicles    │ │    +1 AC when wearing armor      ││
│  │         (land)                     │ │                                  ││
│  │                                    │ │  • Dwarven Resilience             ││
│  │                                    │ │    Advantage vs poison           ││
│  └────────────────────────────────────┘ └──────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────┘
```

**Key Design Principles:**

1. **Semantic Grouping**: Each "card" represents a conceptual domain
   - Identity (who you are)
   - Abilities (your core stats + saves integrated)
   - Defenses (AC, Init, Speed)
   - Vitality (HP, Hit Dice, Death Saves)
   - Meta Stats (Inspiration, Prof Bonus, Passive Perception)
   - Skills (condensed 2-column)
   - Combat (Attacks)
   - Gear (Equipment + Currency simplified)
   - Knowledge (Proficiencies)
   - Capabilities (Features)

2. **Integrated Ability Cards**: Each ability score card includes:
   - Score value
   - Modifier
   - Save proficiency indicator
   - Eliminates separate "Saving Throws" section

3. **Information Density Optimization**:
   - Skills in 2 columns (fits 18 skills more compactly)
   - Currency simplified (just GP shown, others on hover/expand)
   - Equipment as clean list without separate currency section

4. **Visual Hierarchy**:
   - Banner sections with `══ TITLE ══` pattern
   - Cards grouped by flow: Identity → Stats → Combat → Resources

5. **Responsive Potential**:
   - Cards can reflow for different screen sizes
   - Print layout can use fixed positions
   - Digital layout can be drag-to-arrange

**Pros:**
- Modern, clean aesthetic while maintaining PHB feel
- Clearer information architecture
- Scalable for different character complexities
- Could support custom card arrangements per user preference

**Cons:**
- Significant implementation effort
- Departure from traditional PHB layout
- Integrated ability/save cards are non-standard
- May require new CSS grid system

---

## Summary Comparison

| Option | Passive Stats | HP/Survival | Column Structure | Effort |
|--------|---------------|-------------|------------------|--------|
| **1: Banner** | Horizontal row | Unified block | 3-column | Low |
| **2: Integrated** | Col 1 top | Single block | 3-column | Low |
| **3: Footer** | Bottom banner | Combat cluster | 3-column | Medium |
| **4: Two-Col** | Left column | Right column | 2-column | High |
| **5: Cards** | Dedicated card | Dedicated card | Modular grid | Very High |

---

## Recommendation for Next Steps

1. **Sketch in HTML/CSS**: Create static mockups of Options 1, 2, and 5
2. **User Testing**: Which layout makes info fastest to find?
3. **Print Testing**: Verify all options work at 816x1056px

---

**References:**
- Current layout: `CharacterSheet.css` lines 368-387
- Column components: `sheetComponents/column1/`, `column2/`, `column3/`
- PHB styling: `CharacterSheetPage.tsx` + global PHB CSS


