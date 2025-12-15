# HTML Character Sheet Implementations Research

**Date:** December 4, 2025  
**Purpose:** Capture design patterns and best practices from existing HTML D&D 5e character sheet implementations  
**Status:** Research Complete - Ready for Design Extraction

---

## Overview

This document analyzes four open-source HTML character sheet implementations to extract best design patterns for our PlayerCharacterGenerator:

1. **Roll20 D&D 5th Edition Legacy** - Most comprehensive, includes sheetworkers for auto-calculation
2. **CodePen by Brandon Fulljames (YVVeMd)** - Clean CSS-only reference implementation
3. **vibhav1011/DnD-html-sheet** - Fork of CodePen with localStorage persistence
4. **lckynmbrsvn/DnD-5e-Character-Sheet** - Modern responsive design with collapsible sections

---

## 1. Roll20 D&D 5th Edition Legacy

**Source:** https://github.com/Roll20/roll20-character-sheets/tree/master/DD5thEditionLegacy  
**License:** Open source, community maintained  
**Complexity:** Very High (7000+ lines HTML, extensive JS sheetworkers)

### Key Design Patterns

#### 1.1 Page Organization with Tab System
```html
<!-- Tab buttons for multi-page navigation -->
<div class="sheet-core-btn sheet-pictos sheet-core">C</div>
<div class="sheet-bio-btn sheet-pictos sheet-bio">b</div>
<div class="sheet-spells-btn sheet-pictos sheet-spells">s</div>
<div class="sheet-options-btn sheet-pictos sheet-options">o</div>
```
**Pattern:** Use icon-based tabs (CORE, BIO, SPELLS, OPTIONS) for page navigation
**Our Application:** Good for multi-page character sheet pagination

#### 1.2 Repeating Sections for Dynamic Lists
```html
<fieldset class="repeating_attack">
    <input type="text" name="attr_atkname">
    <input type="number" name="attr_atkbonus">
    <input type="text" name="attr_atkdmgtype">
</fieldset>
```
**Pattern:** Use `repeating_*` sections for attacks, spells, inventory, features  
**Our Application:** React components with array mapping, but concept applies

#### 1.3 Ability Score Layout (Classic 6-Box)
- Large score input at top
- Smaller modifier display below
- Stacked vertically, arranged in 2 columns or 6-column row
- Visual styling with borders and backgrounds

#### 1.4 Saving Throws & Skills with Proficiency
```html
<li>
    <input type="checkbox" name="attr_strength_save_prof">
    <span class="sheet-modifier">0</span>
    <span class="sheet-label">Strength</span>
</li>
```
**Pattern:** Checkbox for proficiency + modifier value + label
**Our Application:** Proficiency markers (●/○) instead of checkboxes

#### 1.5 Sheetworkers (Auto-Calculation Logic)
Key calculations automated:
- Ability modifiers: `Math.floor((score - 10) / 2)`
- Proficiency bonus based on level
- Save/skill bonuses: modifier + (proficient ? profBonus : 0)
- Initiative: DEX modifier + bonuses
- Passive Perception: 10 + Perception bonus
- HP calculation from class hit dice + CON
- Spell save DC: 8 + profBonus + abilityMod
- Spell attack: profBonus + abilityMod

**Pattern:** Never trust the user to calculate - auto-calculate everything
**Our Application:** Rule Engine already implements this - validate pattern matches

#### 1.6 Compendium Drop Integration
```javascript
on("sheet:compendium-drop", function() {
    var data = compendiumData();
    // Parse dropped item data and populate fields
});
```
**Pattern:** Drag-and-drop from SRD compendium to auto-fill
**Our Application:** Drag from equipment/spell lists in wizard steps

---

## 2. CodePen by Brandon Fulljames (YVVeMd)

**Source:** https://codepen.io/evertras/full/YVVeMd/  
**License:** Open source  
**Complexity:** Medium (pure HTML/CSS, no JavaScript)

### Key Design Patterns

#### 2.1 Three-Column Layout
```html
<main>
    <section><!-- Column 1: Ability scores, saves, skills --></section>
    <section><!-- Column 2: Combat stats, attacks, equipment --></section>
    <section><!-- Column 3: Flavor text, features --></section>
</main>
```
**Pattern:** Organize character sheet into logical column groups
**Our Application:** Good for responsive layout planning

#### 2.2 Ability Score Box CSS
```css
form.charsheet main > section section.attributes div.scores ul li {
    height: 80px;
    width: 70px;
    background-color: white;
    border: 1px solid black;
    border-radius: 10px;
    text-align: center;
    display: flex;
    flex-direction: column;
}

form.charsheet main > section section.attributes div.scores ul li div.modifier input {
    width: 30px;
    height: 20px;
    border: 1px inset black;
    border-radius: 20px;
    text-align: center;
}
```
**Pattern:** Score box with rounded corners, modifier in circular input below
**Our Application:** Directly usable CSS for ability score styling

#### 2.3 Circular Combat Stat Boxes
```css
form.charsheet main section.combat > div.armorclass > div input {
    height: 70px;
    width: 70px;
    border-radius: 10px;
    border: 1px solid black;
    text-align: center;
    font-size: 30px;
}
```
**Pattern:** Large circular/rounded inputs for AC, Initiative, Speed
**Our Application:** Classic character sheet aesthetic

#### 2.4 Death Saves UI
```css
form.charsheet main section.combat > div.deathsaves > div div.bubbles input[type=checkbox] {
    appearance: none;
    width: 10px;
    height: 10px;
    border: 1px solid black;
    border-radius: 10px;
}
input[type=checkbox]:checked {
    background-color: black;
}
```
**Pattern:** Custom circular checkboxes, fills solid when checked
**Our Application:** Perfect for death save success/failure tracking

#### 2.5 Skill List with Proficiency Marker
```css
form.charsheet main > section section.attributes div.attr-applications div.list-section ul li input[type=checkbox] {
    appearance: none;
    width: 10px;
    height: 10px;
    border: 1px solid black;
    border-radius: 10px;
    order: 1;
}
```
**Pattern:** Order-controlled flex layout: checkbox, modifier, label
**Our Application:** Use for saves and skills lists

#### 2.6 Textblock with Bottom Label
```css
form.charsheet div.textblock {
    display: flex;
    flex-direction: column-reverse;
    width: 100%;
    align-items: center;
}
form.charsheet div.textblock label {
    border: 1px solid black;
    border-top: 0;
    border-radius: 0 0 10px 10px;
}
```
**Pattern:** Label at bottom of textarea box, like official sheet
**Our Application:** Features, background, personality textareas

#### 2.7 Money Section
```css
form.charsheet main section.equipment > div > div.money ul > li label {
    border: 1px solid black;
    border-radius: 10px 0 0 10px;
    border-right: 0;
    width: 20px;
    font-size: 8px;
}
```
**Pattern:** Compact currency display (CP, SP, EP, GP, PP) with small labels
**Our Application:** Equipment section currency tracker

---

## 3. vibhav1011/DnD-html-sheet

**Source:** https://github.com/vibhav1011/DnD-html-sheet  
**License:** MIT  
**Complexity:** Low (adds persistence to CodePen base)

### Key Design Patterns

#### 3.1 LocalStorage Persistence
```javascript
$(function () {
    $("#page1").saveMyForm({
        loadInputs: true,
    });
});
```
**Pattern:** Uses jQuery `saveMyForm` plugin for automatic form persistence
**Our Application:** We have React state management, but principle is valuable

#### 3.2 Benefits Listed in README
- Consistent display of information (no PDF rendering issues)
- Scrolling and textboxes that maintain sane sizes
- Checkboxes that work reliably
- Numbers displayed without obscuring labels

**Lessons for Our Design:**
- Test across browsers for consistent rendering
- Ensure input fields have appropriate min/max widths
- Use proper form controls (not div-based hacks)
- Label placement should not conflict with value display

#### 3.3 Planned Features (Good Ideas)
- Spellcasting table (dedicated section)
- Die roller integration
- Dark mode support
- Quick reference popup to dnd wikidot

**Our Application:** Dark mode and die roller are good Phase 2 features

---

## 4. lckynmbrsvn/DnD-5e-Character-Sheet

**Source:** https://github.com/lckynmbrsvn/DnD-5e-Character-Sheet  
**License:** Open source  
**Complexity:** Medium-High (modern responsive design)

### Key Design Patterns

#### 4.1 Responsive Layout with W3.CSS
- Uses W3's lightweight responsive CSS framework
- Works on 95% of screen sizes
- Mobile-first approach

**Our Application:** Mantine already provides responsive utilities

#### 4.2 Collapsible Section Cards
```javascript
// jQuery for expanding/collapsing panels
$(".section-header").click(function() {
    $(this).next(".section-content").slideToggle();
});
```
**Pattern:** Section cards can be collapsed to hide details
**Our Application:** Mantine Accordion or custom collapsible sections

#### 4.3 Page-Based Navigation
```javascript
// Switching between 'pages' (displaying/hiding <div>'s)
$(".nav-attributes").click(function() {
    $(".page").hide();
    $(".page-attributes").show();
});
```
**Pattern:** Multi-page layout with show/hide divs
**Our Application:** Canvas pagination handles this

#### 4.4 Persistent Header
Basic character information stays at top:
- Character Name
- Class/Level (supports multiclass)
- Race
- Background
- Player Name
- Experience
- Alignment
- Deity

**Pattern:** Header remains visible while content scrolls/changes
**Our Application:** Fixed canvas header with basic info

#### 4.5 Auto-Fill from Attributes
```javascript
// Calculate modifier from score
var mod = Math.floor((score - 10) / 2);
// Apply to all related fields
$(".str-mod").val(mod);
$(".str-save").val(mod + (proficient ? profBonus : 0));
```
**Pattern:** Changing ability scores auto-updates all dependent fields
**Our Application:** Rule Engine already does this reactively

#### 4.6 Lock Mode
```javascript
// Toggle lock to disable auto-calculation
if (locked) {
    // User can set any value manually
} else {
    // Auto-calculate from base stats
}
```
**Pattern:** Lock toggle disables scripts for manual override
**Our Application:** Matches our Edit Mode concept exactly

#### 4.7 Expertise Checkbox
```html
<div class="skill-row">
    <input type="checkbox" class="prof-checkbox">
    <input type="checkbox" class="expertise-checkbox">
    <input type="text" class="skill-bonus">
    <span>Performance</span>
</div>
```
**Pattern:** Two checkboxes: proficiency + expertise (for rogues/bards)
**Our Application:** Skills section needs double-proficiency support

#### 4.8 Resource Trackers
```html
<div class="resource-row">
    <input type="text" placeholder="Health Potion">
    <input type="checkbox" checked>
    <input type="checkbox" checked>
    <input type="checkbox">
    <input type="checkbox">
    <button class="empty">Empty</button>
    <button class="fill">Fill</button>
</div>
```
**Pattern:** Named resource with checkbox tracker (10 boxes)
**Our Application:** Good for spell slots, class features, consumables

#### 4.9 Dynamic Attack Table
```html
<table class="attacks-table">
    <tr>
        <td><input type="text" value="Sword"></td>
        <td><select><option>Strength</option><option>Dexterity</option></select></td>
        <td><input type="text" value="+5"></td>
        <td><input type="text" value="1d8+3"></td>
        <td><input type="text" value="Slashing"></td>
        <td><button>X</button></td>
    </tr>
</table>
<button class="add-attack">Add Attack</button>
```
**Pattern:** Editable table with add/remove rows
**Our Application:** Attacks section needs this pattern

---

## 5. Synthesized Design Recommendations

### 5.1 Layout Structure

**Recommended Three-Column Layout (Page 1):**
```
┌─────────────────────────────────────────────────────────────────┐
│                        CHARACTER HEADER                          │
│  Name | Class/Level | Race | Background | Player | Alignment    │
├───────────────────────┬───────────────────────┬─────────────────┤
│  ABILITY SCORES       │  COMBAT STATS         │  PERSONALITY    │
│  ┌─────┬─────┬─────┐  │  ┌───┬───┬───┐        │  Traits         │
│  │ STR │ DEX │ CON │  │  │AC │INI│SPD│        │  Ideals         │
│  ├─────┼─────┼─────┤  │  └───┴───┴───┘        │  Bonds          │
│  │ INT │ WIS │ CHA │  │  HP (Max/Current/Temp)│  Flaws          │
│  └─────┴─────┴─────┘  │  Hit Dice             │                 │
│                       │  Death Saves ○○○/○○○  │                 │
│  SAVING THROWS        ├───────────────────────┤                 │
│  ○ STR +0             │  ATTACKS & SPELLCASTING                  │
│  ● DEX +5             │  Name | Atk | Damage  │                 │
│  ○ CON +2             │  ─────┼─────┼──────   │                 │
│  ...                  │  [+]  |     |         │                 │
│                       ├───────────────────────┤                 │
│  SKILLS               │  EQUIPMENT            │                 │
│  ○ Acrobatics (Dex)   │  CP: __ SP: __ GP: __ │  FEATURES       │
│  ● Athletics (Str)    │  • Longsword          │  • Darkvision   │
│  ◐ Perception (Wis)   │  • Chain mail         │  • Second Wind  │
│  ...                  │  • Backpack           │  • ...          │
├───────────────────────┴───────────────────────┴─────────────────┤
│  OTHER PROFICIENCIES & LANGUAGES                                 │
│  Light armor, medium armor, shields, simple weapons, martial... │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 CSS Variables for Character Sheet Theme

```css
:root {
    /* Character Sheet Dimensions */
    --char-sheet-width: 816px;        /* Letter width */
    --char-sheet-height: 1056px;      /* Letter height */
    --char-column-gap: 10px;
    --char-section-padding: 8px;
    
    /* Typography */
    --char-header-font: 'NodestoCapsCondensed', serif;
    --char-body-font: 'ScalySans', sans-serif;
    --char-label-size: 8px;
    --char-value-size: 12px;
    --char-header-size: 14px;
    
    /* Ability Score Box */
    --ability-box-size: 70px;
    --ability-score-size: 36px;
    --ability-mod-size: 20px;
    
    /* Combat Stat Circles */
    --combat-stat-size: 60px;
    --combat-stat-font: 24px;
    
    /* Proficiency Markers */
    --prof-marker-size: 10px;
    --prof-marker-color: #000;
    --prof-marker-empty: #fff;
    
    /* Colors */
    --char-border: #000;
    --char-bg-light: #fff;
    --char-bg-dark: #f4f4f4;
    --char-text: #1a1a1a;
}
```

### 5.3 Component Architecture

| Component | Purpose | Key Features |
|-----------|---------|--------------|
| `AbilityScoreBox` | Display one ability | Large score, modifier badge below |
| `AbilityScoreGrid` | 6 ability scores | 2x3 or 1x6 grid layout |
| `SaveThrowItem` | Single save | Proficiency marker, modifier, name |
| `SkillItem` | Single skill | Prof marker, expertise marker, mod, name |
| `CombatStatCircle` | AC/Init/Speed | Large circular input with label |
| `HitPointsBlock` | HP tracking | Max/Current/Temp stacked |
| `DeathSaveTracker` | Death saves | 3 success, 3 failure circles |
| `AttackRow` | Single attack | Name, stat, bonus, damage, type |
| `AttacksTable` | All attacks | Repeating rows with add/delete |
| `EquipmentList` | Inventory | Currency + item list |
| `ResourceTracker` | Class resources | Name + checkbox array |
| `SpellSlotTracker` | Spell slots | Level + checkbox array per level |
| `FeatureBlock` | Single feature | Name, source, description |
| `PersonalitySection` | RP traits | Traits, Ideals, Bonds, Flaws textareas |

### 5.4 Auto-Calculation Rules

From analysis, these fields should auto-calculate:

| Field | Formula | Source |
|-------|---------|--------|
| Ability Modifier | `Math.floor((score - 10) / 2)` | All implementations |
| Proficiency Bonus | Level-based table lookup | Roll20 |
| Save Bonus | `modifier + (proficient ? profBonus : 0)` | All |
| Skill Bonus | `modifier + (proficient ? profBonus : 0) + (expertise ? profBonus : 0)` | lckynmbrsvn |
| Initiative | `dexMod + bonuses` | Roll20 |
| Passive Perception | `10 + perceptionBonus` | Roll20 |
| Spell Save DC | `8 + profBonus + spellcastingMod` | Roll20 |
| Spell Attack | `profBonus + spellcastingMod` | Roll20 |
| AC | `baseAC + dexMod + shield + other` (complex, depends on armor) | Manual recommended |
| HP | `classHitDie + conMod + (level - 1) * (avgDie + conMod)` | Roll20 |

### 5.5 Interaction Patterns

| Pattern | Implementation | Source |
|---------|---------------|--------|
| Section Collapse | Accordion or toggle visibility | lckynmbrsvn |
| Page Navigation | Tab buttons or pagination | Roll20 |
| Lock/Edit Mode | Toggle auto-calculation | lckynmbrsvn |
| Add Repeating | Button adds new row to list | Roll20, lckynmbrsvn |
| Delete Repeating | X button removes row | lckynmbrsvn |
| Drag-and-Drop | Compendium item to field | Roll20 |
| Auto-Save | Debounced save to localStorage/cloud | vibhav1011 |
| Resource Tracking | Click to toggle checkbox state | lckynmbrsvn |
| Proficiency Toggle | Click to cycle ○→●→◐→○ (none/prof/expertise) | lckynmbrsvn |

---

## 6. Assets We Can Reuse

### 6.1 From Roll20 Legacy (Open Source)
- **Images:** `DD5thEditionLegacy/images/` - Icons, backgrounds
- **SCSS:** `5th Edition Legacy.scss` - Well-organized styling
- **Translations:** Multi-language support structure

### 6.2 CSS Patterns to Extract
- Ability score box styling (CodePen)
- Death save circles (CodePen)
- Combat stat circles (CodePen)
- Skill list with proficiency (CodePen)
- Textblock with bottom label (CodePen)

### 6.3 JavaScript Patterns (Reference)
- Calculation formulas (Roll20 sheetworkers)
- Lock mode toggle (lckynmbrsvn)
- Resource tracker logic (lckynmbrsvn)

---

## 7. Implementation Priorities

### Phase 1: Core Visual Elements
1. Ability score box component with PHB styling
2. Saving throws list with proficiency markers
3. Skills list with proficiency/expertise markers
4. Combat stats (AC, Initiative, Speed) circles
5. HP block (max/current/temp)
6. Death saves tracker

### Phase 2: Combat & Equipment
1. Attacks table with repeating rows
2. Equipment list with currency
3. Proficiencies & Languages section

### Phase 3: Features & Spellcasting
1. Features & Traits section
2. Spell slots tracker
3. Spells list (by level)

### Phase 4: Polish & Interaction
1. Lock/Edit mode toggle
2. Collapsible sections
3. Resource trackers
4. Multi-page pagination
5. Dark mode option

---

## 8. Files Referenced

| File | Location | Purpose |
|------|----------|---------|
| YVVeMd.html | `research/Untitled_files/` | CodePen character sheet HTML/CSS |
| 5th Edition Legacy.html | GitHub Roll20 repo | Complete Roll20 sheet |
| 5th Edition Legacy.scss | GitHub Roll20 repo | SCSS styling |
| char.js | GitHub vibhav1011 repo | localStorage persistence |
| app.js | GitHub lckynmbrsvn repo | Modern UI interactions |

---

**Research Complete:** December 4, 2025

This document provides technical patterns for implementing a PHB-style character sheet. Use alongside:
- `../DESIGN-Canvas-Character-Sheet-Integration.md` - Primary design doc (Canvas architecture)
- `DESIGN-PHB-Character-Sheet-Implementation.md` - PHB CSS/HTML structure reference
- `HANDOFF-UI-Research-Character-Sheet-Layout.md` - Layout research


