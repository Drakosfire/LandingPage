# PlayerCharacterGenerator UI Design Document

**Date:** December 2, 2025  
**Status:** 🔒 LOCKED - Design Decisions Finalized

---

## Design Decisions Summary

| Decision | Choice | Notes |
|----------|--------|-------|
| App Icon | New (placeholder for now) | User will create |
| Header Background | Same texture, different tint | PCG-specific color palette |
| Projects/Generation Icons | Reuse existing | Same as StatblockGen |
| Equipment Choices | Separate subsection | Within class step |
| Spell Selection | Separate step | Step 4 in new flow |
| Class Step Complexity | Single step | Start simple |
| Race/Class Cards | Scrollable list | Not grid |
| Subrace Selection | Inline radio buttons | Under race card |
| Trait Preview | Collapsed by default | Expandable |
| Portrait Placement | Canvas header | Integrated |
| Edit Mode | Yes, with validation warning | Disable validation when editing |

---

## 1. Overview

### 1.1 Design Philosophy
- **Canvas-first**: Character sheet is always visible, updated in real-time
- **Wizard-guided**: Step-by-step character creation with validation
- **Reuse over rebuild**: Leverage existing StatblockGenerator patterns
- **D&D aesthetic**: PHB-style parchment, red/gold accents, fantasy fonts

### 1.2 Key Components (Reuse Map)

| Component | Source | Reuse Level | Notes |
|-----------|--------|-------------|-------|
| `UnifiedHeader` | Shared | **RESTYLE** | Update colors/icons for PCG theme |
| `GenerationDrawer` | StatblockGen | **CLONE & MODIFY** | Replace Text/Image tabs with Character/Portrait |
| `ProjectsDrawer` | StatblockGen | **CLONE & MODIFY** | Update data types for characters |
| `CharacterCreationWizard` | PlayerCharGen | **EXPAND** | Add race/class/background step content |
| `CharacterCanvas` | PlayerCharGen | **EXPAND** | Add more sections (skills, features, etc.) |
| `AppToolbox` | Shared | **REUSE** | Same pattern as StatblockGen |

---

## 2. Layout Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        UnifiedHeader                              │
│  [DM Logo] [Auth] │ [PCG Icon + Title] │ [Projects] [Gen] [Menu] │
└──────────────────────────────────────────────────────────────────┘

┌─────────────────────┐ ┌──────────────────────────────────────────┐
│                     │ │                                          │
│  Creation Drawer    │ │           Character Canvas               │
│  (Left, lg)         │ │                                          │
│                     │ │   ┌──────────────────────────────────┐   │
│  ┌───────────────┐  │ │   │                                  │   │
│  │ [Tab: Create] │  │ │   │    PHB-Style Character Sheet     │   │
│  │ [Tab: Portrait]│ │ │   │                                  │   │
│  └───────────────┘  │ │   │    - Name / Race / Class         │   │
│                     │ │   │    - Ability Scores Table        │   │
│  ┌───────────────┐  │ │   │    - Combat Stats                │   │
│  │   Wizard      │  │ │   │    - Skills & Proficiencies      │   │
│  │   Stepper     │  │ │   │    - Features & Traits           │   │
│  │               │  │ │   │    - Equipment                   │   │
│  │  [Step N]     │  │ │   │    - Spells (if caster)          │   │
│  │               │  │ │   │                                  │   │
│  └───────────────┘  │ │   └──────────────────────────────────┘   │
│                     │ │                                          │
│  [← Prev] [Next →]  │ │                                          │
└─────────────────────┘ └──────────────────────────────────────────┘

                       ┌─────────────────────┐
                       │  Projects Drawer    │
                       │  (Right, md)        │
                       │                     │
                       │  [New Character]    │
                       │  [Search]           │
                       │                     │
                       │  ┌───────────────┐  │
                       │  │ CharacterCard │  │
                       │  │ - Name        │  │
                       │  │ - Race/Class  │  │
                       │  │ - Level       │  │
                       │  │ [Load][Del]   │  │
                       │  └───────────────┘  │
                       │                     │
                       └─────────────────────┘
```

---

## 3. Component Specifications

### 3.1 UnifiedHeader (Style Updates)

**Current State:** Uses StatblockGenerator icon and colors

**Updates Needed:**
- [ ] **App Icon**: Use PCG-specific icon (character silhouette or shield?)
- [ ] **Header Background**: Same texture, potentially different tint?
- [ ] **Projects Icon**: Custom PCG projects icon?
- [ ] **Generation Icon**: Custom PCG generation icon (wand? dice? sparkle?)

**Configuration:**
```typescript
const CHARACTER_GENERATOR_APP: AppMetadata = {
    id: 'character-generator',
    name: 'Character Generator',
    path: '/character-generator',
    icon: '...', // NEW ICON URL
    iconFallback: undefined,
    description: 'D&D 5e Player Character Creator'
};
```

**Questions for User:**
1. Do we want a distinct header background tint for PCG?
2. Should Projects/Generation icons be PCG-specific or reuse StatblockGen icons?
3. Any specific icon ideas for PCG?

---

### 3.2 PlayerCharacterCreationDrawer

**Current State:** Basic drawer with Creation/Portrait tabs

**Structure:**
```
┌─────────────────────────────────────────────┐
│  [X] Character Creation                      │
├─────────────────────────────────────────────┤
│  [🧙 Character Creation] [🖼️ Portrait]       │  ← Tabs
├─────────────────────────────────────────────┤
│                                             │
│  (Tab Content)                              │
│                                             │
└─────────────────────────────────────────────┘
```

**Tab 1: Character Creation**
- Wizard with 5 steps (see 3.3)
- Navigation: Prev/Next buttons
- Stepper shows progress

**Tab 2: Portrait (Phase 2)**
- Clone `ImageGenerationTab` from StatblockGenerator
- Prompt suggestions for character appearance
- Image history/gallery

**Questions for User:**
1. Any AI text generation needed? (StatblockGen has Text + Image tabs)
2. Should portrait generation have character-aware prompts (e.g., "Generate portrait for Elven Wizard")?

---

### 3.3 CharacterCreationWizard (6 Steps - Updated)

**Updated Flow:**
1. Ability Scores
2. Race Selection
3. Class Selection (with L1 subclass, skills, equipment subsections)
4. Spells (casters only, skip for non-casters)
5. Background Selection
6. Review & Finalize

#### Step 1: Ability Scores ✅ (Exists)
**Current:** Point Buy / Standard Array / Dice Roller interfaces
**Expand:** 
- [ ] Show running total (Point Buy)
- [ ] Visual indicator of rolled stats
- [ ] Validation feedback (must assign all 6)

#### Step 2: Race Selection
**Components Needed:**
- `RaceSelectionStep.tsx` - Main step container
- `RaceCard.tsx` - Race display (scrollable list, collapsible details)
- `SubraceSelector.tsx` - Inline radio buttons under selected race
- `FlexibleAbilityBonusSelector.tsx` - Half-Elf +1/+1 picker

**Layout (Scrollable List):**
```
┌─────────────────────────────────────────────┐
│  Race Selection                              │
│                                              │
│  ┌─────────────────────────────────────────┐│
│  │ ● Dwarf                       +2 CON    ││
│  │   Speed: 25 ft. | Size: Medium          ││
│  │   ▾ Traits (expanded)                   ││
│  │   ┌───────────────────────────────────┐ ││
│  │   │ • Darkvision (60 ft.)             │ ││
│  │   │ • Dwarven Resilience              │ ││
│  │   │ • Dwarven Combat Training         │ ││
│  │   │ • Stonecunning                    │ ││
│  │   └───────────────────────────────────┘ ││
│  │                                         ││
│  │   Subrace:                              ││
│  │   ● Hill Dwarf (+1 WIS, +1 HP/level)   ││
│  │   ○ Mountain Dwarf (+2 STR, armor)     ││
│  ├─────────────────────────────────────────┤│
│  │ ○ Elf                         +2 DEX    ││
│  │   Speed: 30 ft. | Size: Medium          ││
│  │   ▸ Traits (collapsed)                  ││
│  ├─────────────────────────────────────────┤│
│  │ ○ Human                       +1 All    ││
│  │   Speed: 30 ft. | Size: Medium          ││
│  │   ▸ Traits (collapsed)                  ││
│  ├─────────────────────────────────────────┤│
│  │ ○ Half-Elf        +2 CHA, +1/+1 choice  ││
│  │   Speed: 30 ft. | Size: Medium          ││
│  │   ▸ Traits (collapsed)                  ││
│  │   (Shows FlexibleAbilityBonusSelector)  ││
│  └─────────────────────────────────────────┘│
│                                              │
│  Selected: Hill Dwarf                       │
│  Bonuses: +2 CON, +1 WIS                    │
└─────────────────────────────────────────────┘
```

**Decisions Applied:**
- ✅ Scrollable list (not grid of cards)
- ✅ Inline radio buttons for subraces
- ✅ Traits collapsed by default, expandable

#### Step 3: Class Selection
**Components Needed:**
- `ClassSelectionStep.tsx` - Main step container
- `ClassCard.tsx` - Class display (scrollable list, collapsible details)
- `SubclassSelector.tsx` - Inline radio buttons for L1 subclasses
- `SkillSelector.tsx` - Checkbox selection for class skills
- `EquipmentChoiceSelector.tsx` - Grouped equipment choices (separate subsection)

**Layout (Scrollable List with Subsections):**
```
┌─────────────────────────────────────────────┐
│  Class Selection                             │
│                                              │
│  ┌─────────────────────────────────────────┐│
│  │ ○ Fighter                    d10 HP     ││
│  │   Fighting Style, Second Wind           ││
│  │   ▸ Show details                        ││
│  ├─────────────────────────────────────────┤│
│  │ ● Cleric                     d8 HP      ││
│  │   Spellcasting, Divine Domain           ││
│  │   ⚠️ Requires subclass at L1            ││
│  │   ▾ Details (expanded)                  ││
│  │   ┌───────────────────────────────────┐ ││
│  │   │ Hit Die: d8                       │ ││
│  │   │ Saving Throws: WIS, CHA           │ ││
│  │   │ Armor: Light, medium, shields     │ ││
│  │   │ Weapons: Simple weapons           │ ││
│  │   └───────────────────────────────────┘ ││
│  ├─────────────────────────────────────────┤│
│  │ ○ Wizard                     d6 HP      ││
│  │   ▸ Show details                        ││
│  └─────────────────────────────────────────┘│
│                                              │
│  ═══════════════════════════════════════════│
│  SUBCLASS (required for Cleric)             │
│  ○ Life Domain - Healing bonus, heavy armor │
│  ═══════════════════════════════════════════│
│                                              │
│  ═══════════════════════════════════════════│
│  SKILLS - Choose 2 from:                    │
│  □ History  ☑ Insight  ☑ Medicine           │
│  □ Persuasion  □ Religion                   │
│  ═══════════════════════════════════════════│
│                                              │
│  ═══════════════════════════════════════════│
│  STARTING EQUIPMENT                          │
│  Choice 1: ○ (a) Mace  ● (b) Warhammer     │
│  Choice 2: ● (a) Scale mail  ○ (b) Leather │
│  Choice 3: ○ (a) Crossbow  ● (b) Simple wpn│
│  Also receive: Shield, Holy symbol, Pack   │
│  ═══════════════════════════════════════════│
└─────────────────────────────────────────────┘
```

**Decisions Applied:**
- ✅ Scrollable list (not grid of cards)
- ✅ Collapsible trait preview (collapsed by default)
- ✅ Equipment as separate subsection within step
- ✅ Spells moved to separate Step 4

#### Step 4: Spells (Casters Only)
**Components Needed:**
- `SpellSelectionStep.tsx` - Main step container
- `SpellSelector.tsx` - Cantrip and spell selection
- `SpellCard.tsx` - Spell details with school, level, description

**Layout:**
```
┌─────────────────────────────────────────────┐
│  Spell Selection (Cleric)                    │
│                                              │
│  Spellcasting Ability: Wisdom               │
│  Spell Save DC: 12  |  Attack Bonus: +4     │
│                                              │
│  ═══════════════════════════════════════════│
│  CANTRIPS - Choose 3:                       │
│  ☑ Light          □ Mending                 │
│  ☑ Sacred Flame   □ Spare the Dying         │
│  ☑ Thaumaturgy    □ Guidance                │
│  ═══════════════════════════════════════════│
│                                              │
│  ═══════════════════════════════════════════│
│  PREPARED SPELLS - Choose 3 (WIS + Level):  │
│  □ Bless*         ☑ Command                 │
│  □ Cure Wounds*   ☑ Guiding Bolt            │
│  ☑ Healing Word   □ Sanctuary               │
│  □ Shield of Faith                          │
│  (* = Domain spell, always prepared)        │
│  ═══════════════════════════════════════════│
│                                              │
│  Note: Clerics prepare spells daily. You    │
│  can change prepared spells after a rest.   │
└─────────────────────────────────────────────┘
```

**Skip Logic:** Non-casters (Fighter, Barbarian, Rogue, Monk) skip this step automatically.

#### Step 5: Background Selection
**Components Needed:**
- `BackgroundSelectionStep.tsx`
- `BackgroundCard.tsx` - Scrollable list with collapsible details

**Layout (Scrollable List):**
```
┌─────────────────────────────────────────────┐
│  Background Selection                        │
│                                              │
│  ┌─────────────────────────────────────────┐│
│  │ ○ Acolyte                               ││
│  │   Skills: Insight, Religion             ││
│  │   Languages: 2 of your choice           ││
│  │   ▸ Details (collapsed)                 ││
│  ├─────────────────────────────────────────┤│
│  │ ○ Criminal                              ││
│  │   Skills: Deception, Stealth            ││
│  │   Tools: Gaming set, Thieves' tools     ││
│  │   ▸ Details (collapsed)                 ││
│  ├─────────────────────────────────────────┤│
│  │ ● Soldier                               ││
│  │   Skills: Athletics, Intimidation       ││
│  │   Tools: Gaming set, Land vehicles      ││
│  │   ▾ Details (expanded)                  ││
│  │   ┌───────────────────────────────────┐ ││
│  │   │ Feature: Military Rank            │ ││
│  │   │ You have a military rank. Soldiers│ ││
│  │   │ loyal to your former organization │ ││
│  │   │ recognize your authority...       │ ││
│  │   └───────────────────────────────────┘ ││
│  └─────────────────────────────────────────┘│
│                                              │
│  ═══════════════════════════════════════════│
│  ⚠️ SKILL OVERLAP DETECTED                  │
│  Athletics is granted by both Fighter       │
│  and Soldier. Choose a replacement:         │
│  ○ Acrobatics  ○ Animal Handling           │
│  ○ Perception  ○ Survival                  │
│  ═══════════════════════════════════════════│
└─────────────────────────────────────────────┘
```

**Decisions Applied:**
- ✅ Scrollable list (consistent with Race/Class steps)
- ✅ Collapsible details (collapsed by default)
- ✅ Clear skill overlap warning with replacement selector

#### Step 6: Review & Finalize
**Layout:**
```
┌─────────────────────────────────────────────┐
│  Review Character                            │
│                                              │
│  Name: ________________________              │
│                                              │
│  ┌─────────────────────────────────────────┐│
│  │ Race: Hill Dwarf                        ││
│  │ Class: Cleric (Life Domain) Level 1    ││
│  │ Background: Soldier                     ││
│  │                                         ││
│  │ Ability Scores:                         ││
│  │ STR 14 (+2) | DEX 10 (+0) | CON 16 (+3)││
│  │ INT 12 (+1) | WIS 15 (+2) | CHA  8 (-1)││
│  │                                         ││
│  │ Proficiency Bonus: +2                   ││
│  │ Skills: History, Insight, Religion...   ││
│  │ Languages: Common, Dwarvish             ││
│  │                                         ││
│  │ HP: 11 (8 + 3 CON)                     ││
│  │ AC: 18 (chain mail + shield)           ││
│  │                                         ││
│  │ Spells: Light, Sacred Flame, Thaumaturgy││
│  │ Prepared: Bless, Cure Wounds (+ domain)││
│  └─────────────────────────────────────────┘│
│                                              │
│  [✓ Finish] → Save character                │
└─────────────────────────────────────────────┘
```

---

### 3.4 CharacterCanvas (Parchment Character Sheet)

**Current State:** Basic PHB-style with name and ability scores

**Sections to Add:**
1. **Header Block**: Name, Race, Class, Level, Background
2. **Ability Scores Table**: Already exists ✅
3. **Combat Stats Block**: AC, HP, Initiative, Speed, Prof Bonus
4. **Saving Throws Block**: 6 saves with proficiency markers
5. **Skills Block**: 18 skills with proficiency/expertise markers
6. **Features & Traits Block**: Racial traits, class features
7. **Proficiencies Block**: Armor, weapons, tools, languages
8. **Equipment Block**: Weapons, armor, gear
9. **Spellcasting Block** (if applicable): Spell save DC, attack bonus, slots, spells

**Two-Column Layout:**
```
┌────────────────────────────────────────────────────────────┐
│  ═══════════════════════════════════════════════════════  │
│                    THORIN IRONFORGE                        │
│            Level 1 Hill Dwarf Cleric (Life Domain)         │
│  ═══════════════════════════════════════════════════════  │
├──────────────────────────┬─────────────────────────────────┤
│ ABILITY SCORES           │ COMBAT STATS                    │
│ ┌───┬───┬───┬───┬───┬───┐│ Armor Class: 18                │
│ │STR│DEX│CON│INT│WIS│CHA││ Hit Points: 11/11              │
│ │14 │10 │16 │12 │15 │ 8 ││ Initiative: +0                 │
│ │+2 │+0 │+3 │+1 │+2 │-1 ││ Speed: 25 ft.                  │
│ └───┴───┴───┴───┴───┴───┘│ Prof. Bonus: +2                │
├──────────────────────────┼─────────────────────────────────┤
│ SAVING THROWS            │ SKILLS                          │
│ ○ STR +2                 │ ○ Acrobatics +0                 │
│ ○ DEX +0                 │ ○ Animal Handling +2            │
│ ○ CON +3                 │ ● History +3                    │
│ ○ INT +1                 │ ● Insight +4                    │
│ ● WIS +4 ★               │ ● Medicine +4                   │
│ ● CHA +1 ★               │ ● Religion +3                   │
│ (★ = proficient)         │ (● = proficient)                │
├──────────────────────────┼─────────────────────────────────┤
│ FEATURES & TRAITS        │ EQUIPMENT                       │
│ Darkvision (60 ft.)      │ • Warhammer (1d8+2)             │
│ Dwarven Resilience       │ • Chain mail (AC 16)            │
│ Dwarven Combat Training  │ • Shield (+2 AC)                │
│ Stonecunning             │ • Holy symbol                   │
│ Spellcasting             │ • Priest's pack                 │
│ Divine Domain: Life      │                                 │
│ Disciple of Life         │                                 │
├──────────────────────────┴─────────────────────────────────┤
│ SPELLCASTING (Wisdom)                                      │
│ Spell Save DC: 12  |  Spell Attack: +4                    │
│ Cantrips: Light, Sacred Flame, Thaumaturgy                │
│ 1st Level (2 slots): Bless, Cure Wounds, Shield of Faith  │
│                      + Bless*, Cure Wounds* (domain)       │
└────────────────────────────────────────────────────────────┘
```

---

### 3.5 ProjectsDrawer

**Clone from:** `StatBlockGenerator/ProjectsDrawer.tsx`

**Modifications:**
1. Change data type from `StatBlockProjectSummary` to `CharacterProjectSummary`
2. Update card display: Race/Class instead of CreatureType/CR
3. Update search to filter by name, race, class
4. Character-specific thumbnail (portrait if available)

**Data Type:**
```typescript
interface CharacterProjectSummary {
    id: string;
    name: string;          // Character name
    raceName: string;      // e.g., "Hill Dwarf"
    className: string;     // e.g., "Cleric (Life Domain)"
    level: number;
    portraitUrl?: string;  // Optional character portrait
    createdAt: string;
    updatedAt: string;
}
```

---

## 4. Styling Guidelines

### 4.1 Color Palette (D&D PHB Theme)

```css
:root {
    /* Backgrounds */
    --pcg-parchment: #EEE5CE;
    --pcg-parchment-dark: #D4C4A8;
    
    /* Accents */
    --pcg-red-primary: #A11D18;      /* D&D red */
    --pcg-red-dark: #58180D;         /* Dark maroon */
    --pcg-gold: #C9AD6A;             /* Gold accents */
    
    /* Text */
    --pcg-text-dark: #2B1D0F;        /* Main text */
    --pcg-text-light: #FDF6EA;       /* Light text on dark */
    
    /* UI */
    --pcg-border: #A11D18;
    --pcg-shadow: rgba(43, 29, 15, 0.3);
}
```

### 4.2 Typography

```css
/* Headers */
font-family: 'BookInsanityRemake', serif;

/* Body */
font-family: 'ScalySansRemake', 'Open Sans', sans-serif;

/* Tables / Stats */
font-family: 'ScalySansSmallCapsRemake', 'Open Sans', sans-serif;
```

### 4.3 Component Styling Consistency

- **Cards**: Rounded corners (8px), subtle shadow, parchment background
- **Buttons**: D&D red primary, gold accent on hover
- **Steppers**: Red active step, parchment inactive
- **Validation errors**: Red border/text, warning icon
- **Success states**: Green checkmark, subtle glow

---

## 5. Edit Mode Behavior

### 5.1 Overview
Like StatblockGenerator, CharacterGenerator will support direct canvas editing. However, D&D character sheets have rules that should be validated during guided creation but may be overridden by experienced users.

### 5.2 Edit Mode Behavior

**When Edit Mode is OFF (Wizard-Guided):**
- All changes go through wizard steps
- Full validation is active
- Invalid combinations are prevented
- Character must pass all validation to be "complete"

**When Edit Mode is ON (Direct Editing):**
- Direct canvas field editing enabled
- Validation is **suspended** (not enforced)
- Warning banner displayed at top of canvas
- User can create "house rule" characters

### 5.3 Warning Banner (Edit Mode)

```
┌─────────────────────────────────────────────────────────────────┐
│ ⚠️ EDIT MODE - Validation Suspended                             │
│ Changes are not being validated against D&D 5e rules.           │
│ Some combinations may not be SRD-compliant.                     │
│ [Validate Now] [Dismiss]                                        │
└─────────────────────────────────────────────────────────────────┘
```

### 5.4 Validation on Demand
- "Validate Now" button runs full validation
- Shows validation panel with errors/warnings
- Does NOT prevent saving (user choice)

### 5.5 Edit Mode Toggle Location
- In AppToolbox (like StatblockGen)
- Or in canvas header
- Visual indicator when active (colored border?)

---

## 6. Implementation Priority

### Phase 1: Foundation (Current) ✅
- [x] Basic wizard structure
- [x] Ability scores step
- [x] Canvas ability scores display
- [x] Rule Engine with validation

### Phase 2: Wizard Steps (Next)
- [ ] Step 2: Race selection (scrollable list, radio subraces, collapsible traits)
- [ ] Step 3: Class selection (L1 subclass, skills subsection, equipment subsection)
- [ ] Step 4: Spell selection (casters only, skip for non-casters)
- [ ] Step 5: Background selection (skill overlap handling)
- [ ] Step 6: Review & Finalize

### Phase 3: Canvas Expansion
- [ ] Combat stats block (AC, HP, Initiative, Speed)
- [ ] Skills block (18 skills with proficiency markers)
- [ ] Features & Traits block
- [ ] Equipment block
- [ ] Spellcasting block (if applicable)
- [ ] Portrait in header

### Phase 4: Edit Mode & Projects
- [ ] Edit mode toggle
- [ ] Validation warning banner
- [ ] "Validate Now" feature
- [ ] Projects drawer (clone from StatblockGen)
- [ ] Toolbox expansion (save, export)

### Phase 5: Portrait & AI
- [ ] Portrait generation (lift from StatblockGen)
- [ ] Character-aware prompts
- [ ] AI character generation suggestions

### Phase 6: Polish
- [ ] Tutorial system
- [ ] Character sheet PDF export
- [ ] Print styling

---

## 7. Next Steps

**Design is LOCKED. Ready for implementation.**

Immediate priorities:
1. Update `CharacterCreationWizard.tsx` to 6-step flow
2. Create `RaceSelectionStep.tsx` with scrollable list
3. Create `RaceCard.tsx` with collapsible details
4. Create `SubraceSelector.tsx` with inline radio buttons
5. Wire race selection to context and canvas

---

**Design Locked:** December 2, 2025

