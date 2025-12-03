# PHB Character Sheet Implementation Design

**Status**: 🔒 LOCKED - Ready for Implementation  
**Design Locked**: December 3, 2025  
**Based On**: Deep Research Document (PHB-Style Multi-Page D&D 5e Character Sheets)

---

## Executive Summary

Implement a 3-page PHB-style character sheet using Homebrewery CSS conventions with a new `.character.frame` class to avoid monster-specific styling conflicts.

**Key Decision**: Create `.character.frame` instead of reusing `.monster.frame`

---

## 1. HTML Structure (Confirmed)

```html
<div class="brewRenderer">
  <div class="pages">
    
    <!-- Page 1: Core Stats -->
    <div class="page phb" id="page1">
      <div class="columnWrapper">
        <h1 class="wide">Character Name</h1>
        
        <div class="block character frame" id="abilities">
          <!-- 6 ability score boxes -->
        </div>
        
        <div class="block character frame" id="saves-skills">
          <!-- Saving throws and skills list -->
        </div>
        
        <div class="block character frame" id="combat-stats">
          <!-- AC, Initiative, Speed -->
        </div>
        
        <div class="block character frame" id="hp-hitdice-death">
          <!-- HP, Hit Dice, Death Saves -->
        </div>
        
        <div class="block character frame" id="attacks">
          <!-- Weapon attacks table -->
        </div>
      </div>
    </div>
    
    <!-- Page 2: Features & Equipment -->
    <div class="page phb" id="page2">
      <div class="columnWrapper">
        <div class="block character frame" id="proficiencies">
          <h4>Proficiencies & Languages</h4>
          <!-- List -->
        </div>
        
        <div class="block character frame" id="features">
          <h4>Features & Traits</h4>
          <!-- Class/Race features -->
        </div>
        
        <div class="block character frame" id="equipment">
          <h4>Equipment</h4>
          <!-- Inventory list -->
        </div>
        
        <div class="block character frame" id="background">
          <h4>Background & Personality</h4>
          <!-- Traits, Ideals, Bonds, Flaws -->
        </div>
      </div>
    </div>
    
    <!-- Page 3: Spellcasting (if caster) -->
    <div class="page phb" id="page3">
      <div class="columnWrapper">
        <div class="block character frame wide" id="spellcasting">
          <h2 class="wide">Spellcasting</h2>
          <p><strong>Spellcasting Ability:</strong> CHA | <strong>Spell Save DC:</strong> 14 | <strong>Spell Attack:</strong> +6</p>
          
          <div class="spellList wide">
            <h5>Cantrips (at-will)</h5>
            <p>Fire Bolt, Light, Mage Hand</p>
            
            <h5>1st-Level Spells (4 slots)</h5>
            <p>Detect Magic ✔, Shield, Thunderwave ✔</p>
          </div>
        </div>
      </div>
    </div>
    
  </div>
</div>
```

---

## 2. CSS Classes Reference

### Existing Homebrewery Classes (Reuse)

| Class | Purpose | Notes |
|-------|---------|-------|
| `.page.phb` | Single page container | 215.9mm × 279.4mm, two-column, parchment bg |
| `.columnWrapper` | Column flow container | Inherits column settings from page |
| `.wide` | Span both columns | `column-span: all` |
| `.block` | Generic content block | Base spacing |
| `.frame` | Bordered parchment box | Background #faf2cc |
| `.spellList` | Multi-column spell list | 3-4 columns when `.wide` |

### New Classes (Create)

| Class | Purpose | Why New |
|-------|---------|---------|
| `.character.frame` | PC sheet sections | Avoid `.monster` font overrides |
| `.ability-box` | Individual ability score | 6-box iconic layout |
| `.skill-item` | Skill with proficiency | ●/○ marker + modifier |
| `.save-item` | Save with proficiency | ●/○ marker + modifier |
| `.death-saves` | Death save checkboxes | ○○○ success/failure |
| `.spell-slot-tracker` | Slot checkboxes | ■■■□□ used/available |

---

## 3. CSS Implementation

```css
/* CharacterComponents.css */

/* ===== Character Frame (New - Replaces monster.frame for PCs) ===== */
.page .character.frame {
    background-color: #faf2cc;  /* Same parchment as monster */
    border: 0.5mm solid #000;
    border-radius: 4px;
    padding: 0.3cm;
    margin-bottom: 0.4cm;
    break-inside: avoid-column;  /* Prevent mid-frame page breaks */
}

.page .character.frame h4 {
    font-family: 'BookInsanityRemake', serif;
    font-variant: small-caps;
    font-size: 1.1rem;
    margin: 0 0 0.3cm 0;
    border-bottom: 1px solid #d7c598;
    padding-bottom: 0.1cm;
}

/* ===== Ability Score Boxes ===== */
.ability-scores-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 0.2cm;
    text-align: center;
}

.ability-box {
    border: 1px solid #000;
    border-radius: 4px;
    padding: 0.2cm;
    background: rgba(255, 255, 255, 0.5);
}

.ability-box .ability-label {
    font-family: 'ScalySansRemake', sans-serif;
    font-size: 0.7rem;
    font-weight: bold;
    text-transform: uppercase;
}

.ability-box .ability-score {
    font-family: 'BookInsanityRemake', serif;
    font-size: 1.4rem;
    font-weight: bold;
}

.ability-box .ability-modifier {
    font-family: 'ScalySansRemake', sans-serif;
    font-size: 0.9rem;
    color: #58180d;
}

/* ===== Skills & Saves List ===== */
.skills-list, .saves-list {
    list-style: none;
    padding: 0;
    margin: 0;
    font-family: 'ScalySansRemake', sans-serif;
    font-size: 0.85rem;
    columns: 2;
    column-gap: 0.5cm;
}

.skill-item, .save-item {
    display: flex;
    align-items: center;
    gap: 0.2cm;
    margin-bottom: 0.15cm;
    break-inside: avoid;
}

.proficiency-marker {
    font-size: 0.6rem;
}

.proficiency-marker.proficient::before {
    content: '●';
}

.proficiency-marker:not(.proficient)::before {
    content: '○';
}

/* ===== Death Saves ===== */
.death-saves {
    display: flex;
    gap: 0.5cm;
}

.death-saves-group {
    display: flex;
    gap: 0.1cm;
}

.death-save-box::before {
    content: '○';
    font-size: 0.8rem;
}

.death-save-box.filled::before {
    content: '●';
}

/* ===== Spell Slots ===== */
.spell-slot-tracker {
    display: flex;
    gap: 0.15cm;
}

.spell-slot::before {
    content: '□';
    font-size: 0.9rem;
}

.spell-slot.used::before {
    content: '■';
}

/* ===== Combat Stats Grid ===== */
.combat-stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.3cm;
    text-align: center;
}

.combat-stat-box {
    border: 1px solid #000;
    padding: 0.2cm;
    background: rgba(255, 255, 255, 0.3);
}

.combat-stat-box .stat-label {
    font-family: 'ScalySansRemake', sans-serif;
    font-size: 0.65rem;
    text-transform: uppercase;
}

.combat-stat-box .stat-value {
    font-family: 'BookInsanityRemake', serif;
    font-size: 1.2rem;
    font-weight: bold;
}

/* ===== Print Optimization ===== */
@media print {
    .page.phb {
        page-break-before: always;
        page-break-after: always;
    }
    
    .character.frame {
        break-inside: avoid;
    }
}
```

---

## 4. Component Architecture

### File Structure

```
canvasComponents/
├── CharacterSheetPage.tsx      # Single page wrapper (T070)
├── CharacterSheetRenderer.tsx  # Multi-page orchestrator (T072)
├── sections/
│   ├── AbilityScoresSection.tsx    # 6-box ability layout
│   ├── SavesSkillsSection.tsx      # Combined saves + skills
│   ├── CombatStatsSection.tsx      # AC, Init, Speed, HP
│   ├── AttacksSection.tsx          # Weapon attacks table
│   ├── FeaturesSection.tsx         # Class/Race features
│   ├── EquipmentSection.tsx        # Inventory
│   ├── ProficienciesSection.tsx    # Languages, tools, etc.
│   ├── BackgroundSection.tsx       # Personality, backstory
│   └── SpellcastingSection.tsx     # Full-width spell page
└── CharacterComponents.css         # PHB character styles
```

### Component Props

```typescript
interface CharacterSheetPageProps {
    pageNumber: number;
    totalPages: number;
    children: React.ReactNode;
}

interface CharacterSheetRendererProps {
    character: DnD5eCharacter;
    showSpellPage?: boolean;  // Auto-detect from character.spellcasting
}
```

---

## 5. Page Layout Specifications

### Page 1: Core Stats

| Section | Column | Height Est. |
|---------|--------|-------------|
| Character Name (h1.wide) | Both | 1.5cm |
| Ability Scores | Left | 3cm |
| Saving Throws | Left | 3cm |
| Skills | Left→Right | 8cm |
| Combat Stats (AC/Init/Speed) | Right top | 2.5cm |
| HP / Hit Dice / Death Saves | Right | 3cm |
| Attacks Table | Right | 4cm |

### Page 2: Features & Equipment

| Section | Column | Height Est. |
|---------|--------|-------------|
| Proficiencies & Languages | Left | 3cm |
| Features & Traits | Left→Right | 12cm |
| Equipment | Right | 5cm |
| Background & Personality | Right | 5cm |

### Page 3: Spellcasting (Full Width)

| Section | Width | Height Est. |
|---------|-------|-------------|
| Spellcasting Header | Full | 2cm |
| Spell Stats (DC, Attack) | Full | 1cm |
| Spell Slots Tracker | Full | 2cm |
| Spell List (.spellList.wide) | Full (4 cols) | 18cm |

---

## 6. Implementation Order

1. **T070**: Create `CharacterSheetPage.tsx` - wrapper with `.page.phb` + `.columnWrapper`
2. **T074**: Create `CharacterComponents.css` - all new styles above
3. **T073**: Create section components (AbilityScoresSection, etc.)
4. **T072**: Create `CharacterSheetRenderer.tsx` - orchestrates 1-3 pages
5. **T071**: Add `PageBreakManager.ts` if needed (may not be required with fixed layout)
6. **T075**: Test with DEMO_FIGHTER

---

## 7. Key Implementation Notes

### From Research Document

1. **Use `.character.frame` not `.monster.frame`** - avoids ScalySans font override
2. **Add `break-inside: avoid-column`** on frames to prevent awkward splits
3. **Use `.wide` on h1/h2 and spellcasting section** for full-width spans
4. **Spell list uses `.spellList.wide`** for automatic 4-column layout
5. **Page dimensions are 215.9mm × 279.4mm** (US Letter)
6. **Column gap is 0.9cm** - don't override
7. **Print with background graphics enabled** for parchment effect

### Integration with Existing Canvas

Our current `CharacterCanvas.tsx` uses:
```html
<div class="page phb">
  <div class="columnWrapper">
    <div class="monster frame wide">
```

**Change to**:
```html
<div class="brewRenderer">
  <div class="pages">
    <div class="page phb" id="page1">
      <div class="columnWrapper">
        <div class="block character frame">
```

---

## 8. Data Model Additions

Based on research, add to `DnD5eCharacter`:

```typescript
interface DnD5eCharacter {
    // Existing fields...
    
    // Add for personality (Page 2 backstory section)
    personality?: {
        traits?: string[];
        ideals?: string;
        bonds?: string;
        flaws?: string;
    };
    
    // Add for appearance
    appearance?: {
        age?: string;
        height?: string;
        weight?: string;
        eyes?: string;
        hair?: string;
        skin?: string;
        description?: string;
    };
}
```

---

## References

- [Homebrewery GitHub](https://github.com/naturalcrit/homebrewery)
- [GM Binder Styling Reference](https://www.gmbinder.com/share/-L0WUSjJyFHG7PDyIFta)
- Research Document: `PHB-Style Multi-Page D&D 5e Character Sheets_ Technical Research.docx.md`

