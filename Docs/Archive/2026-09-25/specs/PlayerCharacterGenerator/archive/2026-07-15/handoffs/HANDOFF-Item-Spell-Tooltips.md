# Handoff: Item & Spell Info Modals
**Date:** 2025-12-07  
**Type:** Feature  
**Estimated Effort:** 4-6 hours

---

## Context

The character sheet now renders inventory items and spells, but they display minimal information. Users need to see full details (description, dice rolls, image) without navigating away or cluttering the sheet layout.

## Goal

Add a small **info button** (ⓘ question mark in circle) next to each item and spell that opens a **detail modal** showing full metadata including description, rolls, and optional image.

**Why modal over hover tooltip:**
- More accessible (works on touch/mobile)
- User-initiated (no accidental triggers)
- Can show more content without viewport constraints
- Easier to read and interact with

---

## Reference: Existing Patterns to Compose

### File Locations

```
LandingPage/src/components/PlayerCharacterGenerator/
├── types/dnd5e/
│   ├── equipment.types.ts      # DnD5eEquipmentItem, DnD5eWeapon, DnD5eArmor
│   ├── spell.types.ts          # DnD5eSpell interface
│   └── character.types.ts      # DnD5eSpellcasting
├── sheetComponents/
│   ├── inventory/
│   │   ├── ItemRow.tsx         # Where item tooltips will trigger
│   │   └── InventoryBlock.tsx  # Contains ItemRow lists
│   ├── spells/
│   │   ├── SpellItem.tsx       # Where spell tooltips will trigger
│   │   └── SpellLevelBlock.tsx # Contains SpellItem lists
│   └── CharacterSheet.css      # PHB styling
└── canvasComponents/demoData/
    ├── DEMO_FIGHTER.ts         # Equipment data examples
    └── DEMO_WIZARD.ts          # Spell data examples
```

### Key Data Types

**From `equipment.types.ts`:**
```typescript
export interface DnD5eEquipmentItem {
    id: string;
    name: string;
    type: EquipmentType;
    quantity?: number;
    weight?: number;
    value?: number;
    description?: string;
    isMagical?: boolean;
    requiresAttunement?: boolean;
    rarity?: MagicItemRarity;
}

export interface DnD5eWeapon extends DnD5eEquipmentItem {
    damage: string;           // e.g., '1d8+1'
    damageType: DamageType;
    properties: string[];
    range?: { normal: number; long: number };
}
```

**From `spell.types.ts`:**
```typescript
export interface DnD5eSpell {
    id: string;
    name: string;
    level: number;
    school: SpellSchool;
    castingTime: string;
    range: string;
    components: {
        verbal: boolean;
        somatic: boolean;
        material: boolean;
        materialDescription?: string;
    };
    duration: string;
    description: string;
    higherLevels?: string;
    ritual?: boolean;
    concentration?: boolean;
    damage?: { type: DamageType; dice: string };
    healing?: { dice: string };
    classes: string[];
    source: string;
}
```

### Existing ItemRow Component (from `ItemRow.tsx`)

```tsx
export const ItemRow: React.FC<ItemRowProps> = ({
    name,
    quantity = 1,
    weight,
    value,
    notes,
    isMagical = false
}) => {
    return (
        <div className={`item-row ${isMagical ? 'magical' : ''}`}>
            <span className="item-name">{name}</span>
            {/* ... other fields */}
        </div>
    );
};
```

### Existing SpellItem Component (from `SpellItem.tsx`)

```tsx
export const SpellItem: React.FC<SpellItemProps> = ({
    name,
    prepared = false,
    ritual = false,
    concentration = false
}) => {
    return (
        <div className={`spell-item ${prepared ? 'prepared' : ''}`}>
            <span className="spell-name">{name}</span>
            {/* ... icons */}
        </div>
    );
};
```

---

## Data Model Updates

### Add Optional Image URL to Types

**Update `equipment.types.ts`:**
```typescript
export interface DnD5eEquipmentItem {
    // ... existing fields ...
    imageUrl?: string;    // Optional URL to item image
}
```

**Update `spell.types.ts`:**
```typescript
export interface DnD5eSpell {
    // ... existing fields ...
    imageUrl?: string;    // Optional URL to spell art
}
```

---

## Target Component: InfoButton

### Visual Design

Small circular button with question mark icon, positioned inline with item/spell name.

```
┌─────────────────────────────────────────────────────┐
│  +1 Longsword  ⓘ                    3 lb    15 gp  │
└─────────────────────────────────────────────────────┘
     Item Name   ^-- Info button (question mark in circle)
```

### Button Styling

```css
.info-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    border: 1px solid var(--border-color);
    background: var(--bg-paper);
    color: var(--text-muted);
    font-size: 10px;
    font-weight: bold;
    cursor: pointer;
    margin-left: 4px;
    transition: all 0.15s ease;
}

.info-button:hover {
    background: var(--bg-highlight);
    color: var(--text-primary);
    border-color: var(--border-dark);
}
```

---

## Target Component: ItemDetailModal

### Visual Layout (ASCII)

```
┌─────────────────────────────────────────────────────────────┐
│                                                         [×] │
│  ┌──────────┐                                               │
│  │  IMAGE   │  +1 LONGSWORD                      ★ Uncommon │
│  │ (if set) │  ────────────────────────────────────────────│
│  │  120x120 │  Martial Weapon (Melee)                       │
│  └──────────┘                                               │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  ⚔️ Damage    │  1d8+1 slashing                         ││
│  │  📏 Range     │  Melee (5 ft)                           ││
│  │  🏷️ Properties │  Versatile (1d10)                       ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│  You have a +1 bonus to attack and damage rolls made with   │
│  this magic weapon.                                         │
│                                                             │
│  ───────────────────────────────────────────────────────────│
│  ⚖️ Weight: 3 lb  •  💰 Value: —  •  🔮 Requires Attunement │
└─────────────────────────────────────────────────────────────┘
```

### Props Interface

```typescript
interface ItemDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    
    // Core item data
    name: string;
    type: EquipmentType;
    description?: string;
    imageUrl?: string;
    
    // Equipment stats
    weight?: number;
    value?: number;
    quantity?: number;
    
    // Magic item properties
    isMagical?: boolean;
    rarity?: MagicItemRarity;
    requiresAttunement?: boolean;
    
    // Weapon-specific
    damage?: string;
    damageType?: DamageType;
    properties?: string[];
    range?: { normal: number; long: number };
    
    // Armor-specific
    armorClass?: number;
    armorCategory?: string;
    stealthDisadvantage?: boolean;
}
```

---

## Target Component: SpellDetailModal

### Visual Layout (ASCII)

```
┌─────────────────────────────────────────────────────────────┐
│                                                         [×] │
│  ┌──────────┐                                               │
│  │  IMAGE   │  FIREBALL                          3rd Level  │
│  │ (if set) │  ────────────────────────────────────────────│
│  │  120x120 │  Evocation                         [C] [R]    │
│  └──────────┘                                               │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  ⏱️ Casting Time │  1 action                            ││
│  │  📏 Range        │  150 feet                            ││
│  │  🔤 Components   │  V, S, M (bat guano and sulfur)      ││
│  │  ⏳ Duration     │  Instantaneous                       ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│  A bright streak flashes from your pointing finger to a     │
│  point you choose within range and then blossoms with a     │
│  low roar into an explosion of flame...                     │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  🎲 DAMAGE: 8d6 fire                                    ││
│  │     (DEX save for half)                                 ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│  ───────────────────────────────────────────────────────────│
│  📈 At Higher Levels                                        │
│  When you cast this spell using a spell slot of 4th level   │
│  or higher, the damage increases by 1d6 for each slot       │
│  level above 3rd.                                           │
│                                                             │
│  ───────────────────────────────────────────────────────────│
│  Source: SRD                                                │
└─────────────────────────────────────────────────────────────┘
```

### Props Interface

```typescript
interface SpellDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    
    // From DnD5eSpell
    name: string;
    level: number;
    school: SpellSchool;
    castingTime: string;
    range: string;
    components: {
        verbal: boolean;
        somatic: boolean;
        material: boolean;
        materialDescription?: string;
    };
    duration: string;
    description: string;
    higherLevels?: string;
    ritual?: boolean;
    concentration?: boolean;
    damage?: { type: DamageType; dice: string };
    healing?: { dice: string };
    imageUrl?: string;
    source?: string;
}
```

---

## Implementation Plan

### Step 1: Update Type Definitions (15 min)

1. Add `imageUrl?: string` to `DnD5eEquipmentItem` in `equipment.types.ts`
2. Add `imageUrl?: string` to `DnD5eSpell` in `spell.types.ts`

### Step 2: Create InfoButton Component (30 min)

**Create `sheetComponents/common/InfoButton.tsx`:**
```tsx
import React from 'react';
import { IconQuestionMark } from '@tabler/icons-react';

interface InfoButtonProps {
    onClick: () => void;
    size?: 'sm' | 'md';
    className?: string;
}

export const InfoButton: React.FC<InfoButtonProps> = ({ 
    onClick, 
    size = 'sm',
    className = '' 
}) => {
    const sizeMap = { sm: 14, md: 18 };
    
    return (
        <button 
            className={`info-button info-button--${size} ${className}`}
            onClick={(e) => {
                e.stopPropagation();
                onClick();
            }}
            aria-label="More information"
            type="button"
        >
            <IconQuestionMark size={sizeMap[size]} stroke={2.5} />
        </button>
    );
};
```

### Step 3: Create Modal Components (2 hours)

**Create `sheetComponents/modals/ItemDetailModal.tsx`:**
- Uses Mantine `<Modal>` component for accessibility
- Accepts `ItemDetailModalProps`
- Renders rich item details with optional image
- Shows damage dice, properties, rarity badge
- PHB-styled content

**Create `sheetComponents/modals/SpellDetailModal.tsx`:**
- Uses Mantine `<Modal>` component
- Accepts `SpellDetailModalProps`  
- Renders full spell card with components breakdown
- Shows damage/healing dice prominently
- Concentration/Ritual badges
- Higher level scaling section

**Create `sheetComponents/modals/index.ts`:**
- Export both modal components

### Step 4: Add Modal & Button CSS (1 hour)

**Append to `CharacterSheet.css`:**
```css
/* Info Button */
.info-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    border: 1px solid var(--border-color);
    background: var(--bg-paper);
    color: var(--text-muted);
    cursor: pointer;
    margin-left: 6px;
    padding: 0;
    transition: all 0.15s ease;
    vertical-align: middle;
}

.info-button:hover {
    background: var(--bg-highlight);
    color: var(--text-primary);
    border-color: var(--border-dark);
}

.info-button--sm {
    width: 16px;
    height: 16px;
}

.info-button--md {
    width: 20px;
    height: 20px;
}

/* Detail Modal Styling */
.detail-modal {
    font-family: var(--font-body);
}

.detail-modal-header {
    display: flex;
    gap: var(--space-md);
    margin-bottom: var(--space-md);
}

.detail-modal-image {
    width: 120px;
    height: 120px;
    object-fit: cover;
    border: 2px solid var(--border-dark);
    border-radius: 4px;
    flex-shrink: 0;
}

.detail-modal-image-placeholder {
    width: 120px;
    height: 120px;
    background: var(--bg-highlight);
    border: 2px dashed var(--border-color);
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-muted);
    flex-shrink: 0;
}

.detail-modal-title-block {
    flex: 1;
}

.detail-modal-title {
    font-family: var(--font-title);
    font-size: 1.5em;
    font-weight: bold;
    color: var(--text-title);
    margin: 0 0 4px 0;
}

.detail-modal-subtitle {
    font-size: 0.95em;
    color: var(--text-muted);
    font-style: italic;
    margin: 0;
}

.detail-modal-badges {
    display: flex;
    gap: 6px;
    margin-top: 8px;
}

.detail-modal-stats {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 8px 16px;
    background: var(--bg-highlight);
    padding: var(--space-sm) var(--space-md);
    border-radius: 4px;
    margin-bottom: var(--space-md);
    font-size: 0.95em;
}

.detail-modal-stat-label {
    color: var(--text-muted);
    display: flex;
    align-items: center;
    gap: 6px;
}

.detail-modal-stat-value {
    font-weight: 500;
}

.detail-modal-description {
    line-height: 1.6;
    margin-bottom: var(--space-md);
}

.detail-modal-dice-box {
    background: linear-gradient(135deg, #8b4513 0%, #654321 100%);
    color: white;
    padding: var(--space-sm) var(--space-md);
    border-radius: 4px;
    margin-bottom: var(--space-md);
}

.detail-modal-dice-label {
    font-size: 0.85em;
    opacity: 0.9;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.detail-modal-dice-value {
    font-size: 1.3em;
    font-weight: bold;
}

.detail-modal-section {
    border-top: 1px solid var(--border-light);
    padding-top: var(--space-md);
    margin-top: var(--space-md);
}

.detail-modal-section-title {
    font-weight: bold;
    margin-bottom: var(--space-xs);
    color: var(--text-title);
}

.detail-modal-footer {
    border-top: 1px solid var(--border-light);
    margin-top: var(--space-md);
    padding-top: var(--space-sm);
    font-size: 0.85em;
    color: var(--text-muted);
    display: flex;
    gap: var(--space-md);
    flex-wrap: wrap;
}

/* Rarity badges */
.rarity-badge {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 3px;
    font-size: 0.8em;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.rarity-common { background: #e0e0e0; color: #333; }
.rarity-uncommon { background: #1eff00; color: #000; }
.rarity-rare { background: #0070dd; color: white; }
.rarity-very-rare { background: #a335ee; color: white; }
.rarity-legendary { background: #ff8000; color: white; }

/* Spell badges */
.spell-badge {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 3px;
    font-size: 0.75em;
    font-weight: bold;
}

.badge-concentration {
    background: #ffd700;
    color: #333;
}

.badge-ritual {
    background: #9370db;
    color: white;
}

.badge-level {
    background: var(--border-dark);
    color: white;
}
```

### Step 5: Create Modal State Hook (20 min)

**Create `hooks/useDetailModal.ts`:**
```typescript
import { useState, useCallback } from 'react';

export function useDetailModal<T>() {
    const [isOpen, setIsOpen] = useState(false);
    const [data, setData] = useState<T | null>(null);
    
    const openModal = useCallback((modalData: T) => {
        setData(modalData);
        setIsOpen(true);
    }, []);
    
    const closeModal = useCallback(() => {
        setIsOpen(false);
        // Delay clearing data so close animation completes
        setTimeout(() => setData(null), 200);
    }, []);
    
    return { isOpen, data, openModal, closeModal };
}
```

### Step 6: Integrate InfoButton into ItemRow (30 min)

**Update `ItemRow.tsx`:**
- Add InfoButton next to item name
- Accept `onInfoClick` callback prop

**Pattern:**
```tsx
export const ItemRow: React.FC<ItemRowProps> = ({
    name,
    // ... other props
    onInfoClick
}) => {
    return (
        <div className="item-row">
            <span className="item-name">
                {name}
                {onInfoClick && <InfoButton onClick={onInfoClick} />}
            </span>
            {/* ... rest of row */}
        </div>
    );
};
```

### Step 7: Integrate InfoButton into SpellItem (30 min)

**Update `SpellItem.tsx`:**
- Add InfoButton next to spell name
- Accept `onInfoClick` callback prop

### Step 8: Wire Modals in Parent Components (45 min)

**Update `InventorySheet.tsx`:**
- Add modal state with `useDetailModal` hook
- Render `<ItemDetailModal>` at sheet level
- Pass `onInfoClick` handlers to item rows

**Update `SpellSheet.tsx`:**
- Add modal state with `useDetailModal` hook
- Render `<SpellDetailModal>` at sheet level
- Pass `onInfoClick` handlers to spell items

---

## Files to Create/Modify

| File | Action | Notes |
|------|--------|-------|
| `types/dnd5e/equipment.types.ts` | Modify | Add `imageUrl?: string` |
| `types/dnd5e/spell.types.ts` | Modify | Add `imageUrl?: string` |
| `sheetComponents/common/InfoButton.tsx` | Create | Circular ? button component |
| `sheetComponents/common/index.ts` | Create | Export common components |
| `sheetComponents/modals/ItemDetailModal.tsx` | Create | Rich item detail modal |
| `sheetComponents/modals/SpellDetailModal.tsx` | Create | Rich spell detail modal |
| `sheetComponents/modals/index.ts` | Create | Export modals |
| `sheetComponents/CharacterSheet.css` | Append | Modal & button styling |
| `hooks/useDetailModal.ts` | Create | Modal open/close state hook |
| `sheetComponents/inventory/ItemRow.tsx` | Modify | Add InfoButton, `onInfoClick` prop |
| `sheetComponents/spells/SpellItem.tsx` | Modify | Add InfoButton, `onInfoClick` prop |
| `sheetComponents/InventorySheet.tsx` | Modify | Render modal, wire state |
| `sheetComponents/SpellSheet.tsx` | Modify | Render modal, wire state |
| `sheetComponents/index.ts` | Modify | Export modal & common components |

---

## Testing Checklist

- [ ] Info button (ⓘ) appears next to each item name
- [ ] Info button (ⓘ) appears next to each spell name
- [ ] Clicking info button opens modal (not the row itself)
- [ ] Modal shows item name, type, description
- [ ] Modal shows damage dice for weapons
- [ ] Modal shows AC for armor
- [ ] Modal shows rarity badge for magic items
- [ ] Modal shows image if `imageUrl` provided
- [ ] Modal shows placeholder if no image
- [ ] Spell modal shows full casting info (time, range, components, duration)
- [ ] Spell modal shows description text
- [ ] Spell modal shows damage/healing dice in prominent box
- [ ] Spell modal shows "At Higher Levels" section if present
- [ ] Concentration badge shows [C] for concentration spells
- [ ] Ritual badge shows [R] for ritual spells
- [ ] Modal closes on X button click
- [ ] Modal closes on backdrop click
- [ ] Modal closes on Escape key
- [ ] Modal is accessible (focus trap, aria labels)
- [ ] Works on mobile/touch (button is tappable)

---

## Success Criteria

- [ ] Clicking ⓘ button on any item shows full details
- [ ] Clicking ⓘ button on any spell shows full spell card
- [ ] Dice rolls are clearly visible in styled box
- [ ] Optional images display when provided
- [ ] Modal interaction feels natural and responsive
- [ ] PHB styling consistent with rest of sheet
- [ ] Works on both desktop and mobile

---

## Future Enhancements (Out of Scope)

- Roll dice directly from modal
- Edit item/spell from modal
- Link to external SRD/wiki URLs
- Spell slot tracking from modal
- Print single item/spell card

---

## References

- **Item Types:** `types/dnd5e/equipment.types.ts`
- **Spell Types:** `types/dnd5e/spell.types.ts`
- **Demo Data:** `canvasComponents/demoData/DEMO_WIZARD.ts` (spell examples)
- **Demo Data:** `canvasComponents/demoData/DEMO_FIGHTER.ts` (item examples)
- **CSS Foundation:** `sheetComponents/CharacterSheet.css`

