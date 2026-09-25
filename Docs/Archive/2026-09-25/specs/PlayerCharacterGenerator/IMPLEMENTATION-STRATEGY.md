# Character Sheet Implementation Strategy

**Date:** December 4, 2025  
**Status:** Active Implementation Guide  
**Approach:** HTML-First → Canvas Componentization

---

## 🎯 The Strategy

**Build it twice, ship it once.**

1. **Phase 0:** Static HTML prototype (design target)
2. **Phase 1:** Extract CSS to production stylesheet
3. **Phase 2:** Build React components matching HTML sections
4. **Phase 3:** Wire components into Canvas system
5. **Phase 4:** Polish and iterate

---

## Phase 0: Static HTML Prototype ✅

**Location:** `prototypes/character-sheet.html`

Open this file directly in browser to see the visual target:
```bash
firefox specs/PlayerCharacterGenerator/prototypes/character-sheet.html
# or
google-chrome specs/PlayerCharacterGenerator/prototypes/character-sheet.html
```

### Why HTML First?

| Problem | HTML-First Solution |
|---------|---------------------|
| "I don't know what it should look like" | Edit HTML, refresh, see immediately |
| "My components don't line up" | Get the CSS right first, then componentize |
| "Canvas layout is confusing" | Understand the visual before engineering |
| "I keep reworking styles" | Finalize CSS in prototype, copy to production |

---

## Phase 1: CSS Extraction (30 mins)

Once the prototype looks right, extract the CSS:

### 1.1 Copy CSS Variables
```css
/* From prototype → CharacterSheet.css */
:root {
    --char-page-width: 816px;
    --char-column-gap: 10px;
    --char-border-radius: 8px;
    /* ... */
}
```

### 1.2 Create Component-Specific Classes
Group CSS by the component it belongs to:

```
CharacterSheet.css
├── .char-header { ... }
├── .char-ability-box { ... }
├── .char-saves-section { ... }
├── .char-skills-section { ... }
├── .char-combat-stats { ... }
├── .char-hp-section { ... }
├── .char-attacks-section { ... }
├── .char-equipment-section { ... }
├── .char-personality-box { ... }
├── .char-features-box { ... }
└── .char-proficiencies-box { ... }
```

---

## Phase 2: Component Decomposition (4-6 hours)

### 2.1 Component Mapping

The HTML prototype naturally divides into these components:

| HTML Section | React Component | Canvas Type |
|--------------|-----------------|-------------|
| `.header` | `CharacterHeader.tsx` | Block |
| `.ability-box` × 6 | `AbilityScoreBox.tsx` | Block |
| `.saves-section` | `SavingThrowsSection.tsx` | Block |
| `.skills-section` | `SkillsSection.tsx` | Block |
| `.combat-stats-row` | `CombatStatsRow.tsx` | Block |
| `.hp-section` | `HitPointsSection.tsx` | Block |
| `.hitdice-box` + `.death-saves-box` | `HitDiceDeathSaves.tsx` | Block |
| `.attacks-section` | `AttacksSection.tsx` | List |
| `.equipment-section` | `EquipmentSection.tsx` | List |
| `.personality-box` × 4 | `PersonalitySection.tsx` | Block |
| `.features-box` | `FeaturesSection.tsx` | List |
| `.proficiencies-box` | `ProficienciesSection.tsx` | Block |

### 2.2 Component Template

Each component follows this pattern:

```tsx
// components/sections/AbilityScoreBox.tsx

import type { CanvasComponentProps } from 'dungeonmind-canvas';
import type { DnD5eAbilityScores } from '../../types/dnd5e/character.types';
import './CharacterSheet.css';

interface AbilityScoreBoxProps extends CanvasComponentProps {
    ability: keyof DnD5eAbilityScores;
    score: number;
    modifier: number;
}

export const AbilityScoreBox: React.FC<AbilityScoreBoxProps> = ({
    ability,
    score,
    modifier,
}) => {
    const modifierStr = modifier >= 0 ? `+${modifier}` : `${modifier}`;
    
    return (
        <div className="char-ability-box">
            <div className="ability-name">{ability}</div>
            <div className="ability-score">{score}</div>
            <div className="ability-modifier">{modifierStr}</div>
        </div>
    );
};
```

### 2.3 Build Order

Build components in this order (dependencies first):

```
1. CharacterHeader (standalone, top of sheet)
2. AbilityScoreBox (standalone, data from character.abilityScores)
3. SavingThrowsSection (needs ability modifiers)
4. SkillsSection (needs ability modifiers + proficiencies)
5. CombatStatsRow (needs derived stats)
6. HitPointsSection (needs derivedStats.hp)
7. HitDiceDeathSaves (needs class hit die)
8. PersonalitySection (standalone text fields)
9. ProficienciesSection (needs character.proficiencies)
10. AttacksSection (needs weapons array)
11. EquipmentSection (needs equipment array)
12. FeaturesSection (needs features array)
```

---

## Phase 3: Canvas Integration (2-4 hours)

### 3.1 Register Components

```typescript
// canvasComponents/characterRegistry.ts

export const CHARACTER_CANVAS_REGISTRY: Record<string, ComponentRegistryEntry> = {
    'character-header': {
        type: 'character-header',
        component: CharacterHeader,
        displayName: 'Character Header',
    },
    'ability-scores': {
        type: 'ability-scores',
        component: AbilityScoresBlock,
        displayName: 'Ability Scores',
    },
    // ... etc
};
```

### 3.2 Template Configuration

```typescript
// templates/phbCharacterTemplate.ts

export const PHB_CHARACTER_TEMPLATE: TemplateConfig = {
    id: 'phb-character-sheet',
    pageWidth: 816,
    pageHeight: 1056,
    columnCount: 1, // Single "column" but internal grid layout
    
    regions: [
        {
            id: 'page1-main',
            pageIndex: 0,
            zone: 'wide',
            components: [
                'character-header',
                'main-stats-grid', // Contains ability scores + saves/skills + combat + personality
            ],
        },
        {
            id: 'page2-features',
            pageIndex: 1,
            zone: 'wide',
            components: ['features-section', 'spellcasting-section'],
            conditional: 'hasFeatures',
        },
    ],
};
```

### 3.3 Grid vs Canvas Columns

**Key Insight:** The character sheet uses a complex internal grid, not simple Canvas columns.

**Solution:** Create a `MainStatsGrid` wrapper component that handles the 4-column layout internally:

```tsx
// components/MainStatsGrid.tsx

export const MainStatsGrid: React.FC<CanvasComponentProps> = (props) => {
    return (
        <div className="char-main-grid">
            <div className="char-col-abilities">
                <AbilityScoresColumn {...props} />
            </div>
            <div className="char-col-saves-skills">
                <SavesSkillsColumn {...props} />
            </div>
            <div className="char-col-combat">
                <CombatColumn {...props} />
            </div>
            <div className="char-col-personality">
                <PersonalityColumn {...props} />
            </div>
        </div>
    );
};
```

---

## Phase 4: Polish & Iterate (2-4 hours)

### 4.1 Typography
- Load PHB fonts (Nodesto, Scaly Sans) 
- Apply font-family to appropriate elements

### 4.2 Theming
- Parchment background texture
- Box shadows for depth
- Border styles matching PHB aesthetic

### 4.3 Responsive
- Scale for different viewport sizes
- Print styles for PDF export

### 4.4 Edit Mode
- Click-to-edit fields
- Validation indicators
- Save/revert controls

---

## 🎨 Creative Variations

### Variation 1: Dark Mode
```css
.character-sheet.dark-mode {
    --bg-page: #1a1a1a;
    --bg-light: #2d2d2d;
    --text-dark: #e0e0e0;
    --border-color: #555;
}
```

### Variation 2: Compact (Single Page)
- Reduce font sizes by 20%
- Collapse personality section
- Stack equipment horizontally

### Variation 3: Spellcaster Focus
- Expand spellcasting section
- Add spell slot tracker
- Shrink equipment/attacks

---

## 📁 File Structure After Implementation

```
PlayerCharacterGenerator/
├── canvasComponents/
│   ├── sections/
│   │   ├── CharacterHeader.tsx
│   │   ├── AbilityScoreBox.tsx
│   │   ├── AbilityScoresBlock.tsx
│   │   ├── SavingThrowsSection.tsx
│   │   ├── SkillsSection.tsx
│   │   ├── CombatStatsRow.tsx
│   │   ├── HitPointsSection.tsx
│   │   ├── HitDiceDeathSaves.tsx
│   │   ├── AttacksSection.tsx
│   │   ├── EquipmentSection.tsx
│   │   ├── PersonalitySection.tsx
│   │   ├── FeaturesSection.tsx
│   │   ├── ProficienciesSection.tsx
│   │   └── SpellcastingSection.tsx
│   ├── MainStatsGrid.tsx          # Layout orchestrator
│   ├── characterRegistry.ts
│   └── index.ts
├── styles/
│   └── CharacterSheet.css          # Extracted from prototype
├── templates/
│   ├── phbCharacterTemplate.ts
│   └── compactCharacterTemplate.ts
└── prototypes/
    └── character-sheet.html        # Visual reference
```

---

## 🚀 Next Immediate Action

1. **Open the prototype in browser:**
   ```bash
   firefox specs/PlayerCharacterGenerator/prototypes/character-sheet.html
   ```

2. **Iterate on the HTML/CSS** until it matches your vision

3. **When satisfied, extract CSS** to `CharacterSheet.css`

4. **Build components one at a time**, starting with `CharacterHeader`

---

## References

- **Prototype:** `prototypes/character-sheet.html`
- **CSS Patterns:** `research/RESEARCH-HTML-CharacterSheet-Implementations.md`
- **Canvas Architecture:** `DESIGN-Canvas-Character-Sheet-Integration.md`
- **PHB Structure:** `research/DESIGN-PHB-Character-Sheet-Implementation.md`

---

**Last Updated:** December 4, 2025



