# Handoff: Unified Equipment Data Model
**Date:** 2025-12-10  
**Type:** Refactor  
**Last Updated:** 2025-12-10 11:00  

---

## 🎯 Goal

Unify Page 1 Equipment and Inventory Sheet to use **single source of truth**. Page 1 shows "equipped" items filtered from the canonical inventory.

**Key Principle:** Inventory Sheet is the source of truth. Page 1 is a filtered view.

---

## 🚨 CURRENT STATE

### Page 1 (Column2Content)
- **Attacks**: Array of `{ name, attackBonus, damage }` - separate data
- **Equipment**: Simple `string[]` - separate from inventory
- **Edit behavior**: Opens wizard (WIZARD_STEPS.EQUIPMENT)

### Inventory Sheet
- **Items**: Full `InventoryItem[]` with all metadata
- **Edit behavior**: Opens ItemEditModal for CRUD
- **No "equipped" field** currently

### Problems
1. Two separate data sources for equipment
2. Page 1 equipment is just strings (no rich data)
3. Attacks separate from weapons in inventory
4. Changes in one place don't reflect in other

---

## 🎯 Target State

```
┌─────────────────────────────────────────────────────────────┐
│                    SINGLE DATA SOURCE                        │
│                                                              │
│   dnd5eData.equipment: InventoryItem[]                      │
│        │                                                     │
│        ├── equipped: true  ────► Page 1 Equipment           │
│        │                                                     │
│        ├── type: 'weapon' + equipped ────► Page 1 Attacks   │
│        │                                                     │
│        └── all items ────► Inventory Sheet (all categories) │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

```
User equips item in Inventory
        ↓
Set item.equipped = true
        ↓
Page 1 automatically shows it (filtered view)
        ↓
If weapon, shows in Attacks section too
```

---

## 📋 Requirements

### Data Model Changes

**Add to `InventoryItem`:**
```typescript
interface InventoryItem {
    // ... existing fields ...
    
    /** Is this item currently equipped/carried? Shows on Page 1 */
    equipped?: boolean;
}
```

### Page 1 Behavior

| Section | Shows | Edit Click | "+" Button |
|---------|-------|------------|------------|
| Attacks | Equipped weapons | ItemEditModal | ❌ None |
| Equipment | All equipped items | ItemEditModal | ❌ None |

**Key Rules:**
- No "+" on Page 1 → Add items via Inventory Sheet
- "Remove" on Page 1 = Unequip (not delete)
- Click item → Opens ItemEditModal (same as Inventory)

### Attacks Section

**Compute from equipped weapons:**
```typescript
// Derive attacks from equipped weapons
const attacks = equipment
    .filter(item => item.equipped && item.type === 'weapon')
    .map(weapon => ({
        id: weapon.id,
        name: weapon.name,
        attackBonus: calculateAttackBonus(weapon, character),
        damage: `${weapon.damage} ${weapon.damageType}`
    }));
```

### Equipment List (Page 1)

**Show all equipped items (including weapons):**
```typescript
const equippedItems = equipment.filter(item => item.equipped);
```

---

## 🏗️ Implementation Plan

### Phase 1: Data Model Update
**Time:** ~30 min

1. Add `equipped?: boolean` to `InventoryItem` interface
2. Update demo data to include equipped flags
3. Ensure ItemEditModal can toggle equipped status

### Phase 2: CharacterCanvas Refactor
**Time:** ~1-2 hours

1. Remove separate `attacks` and `equipment` string arrays
2. Derive both from unified `dnd5eData.equipment`
3. Add helper functions:
   - `getEquippedItems()`
   - `getEquippedWeapons()`
   - `computeAttacks()`

### Phase 3: Column2Content Update
**Time:** ~1-2 hours

1. Change props from `attacks: Attack[]` to receive `InventoryItem[]`
2. Compute attacks display from equipped weapons
3. Make items clickable → Opens ItemEditModal
4. Remove complex edit (no more wizard navigation)
5. Remove "+" button logic (not needed on Page 1)

### Phase 4: Inventory Sheet Integration
**Time:** ~1 hour

1. Add "Equipped" checkbox/toggle to ItemEditModal
2. Visual indicator for equipped items in list (e.g., ⚔️ icon)
3. Quick "Equip/Unequip" action

### Phase 5: Polish
**Time:** ~30 min

1. Ensure data flows correctly on save
2. Test add/edit/equip/unequip cycle
3. Verify Page 1 updates when inventory changes

---

## 📁 Key Files

### To Modify

```
LandingPage/src/components/PlayerCharacterGenerator/
├── sheetComponents/
│   ├── inventory/
│   │   └── InventoryBlock.tsx         # Already has InventoryItem - add equipped
│   ├── column2/
│   │   └── Column2Content.tsx         # Refactor to use InventoryItem[]
│   └── modals/
│       └── ItemEditModal.tsx          # Add equipped toggle
├── shared/
│   └── CharacterCanvas.tsx            # Derive attacks from equipment
└── types/dnd5e/
    └── equipment.types.ts             # May need updates
```

---

## 🎨 UI Changes

### ItemEditModal - Add Equipped Toggle

```
┌─────────────────────────────────────────────────────────────┐
│ Edit Item: Longsword                                   [X]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [Fields as before...]                                      │
│                                                             │
│  ─────────── Status ───────────                            │
│  [✓] Equipped (show on Page 1)                             │
│  [☐] Attuned                                               │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────────┐  │
│  │  Cancel  │  │  Delete  │  │    Save Changes          │  │
│  └──────────┘  └──────────┘  └──────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Page 1 Equipment Section (edit mode)

```
┌────────────────────────────────────────────────────────────┐
│ ATTACKS & SPELLCASTING                                     │
│ ┌──────────────────────────────────────────────────────┐   │
│ │ Name           │ Atk Bonus │ Damage/Type              │   │
│ ├────────────────┼───────────┼──────────────────────────┤   │
│ │ Longsword      │ +5        │ 1d8+3 slashing     [⚙️] │   │
│ │ Longbow        │ +4        │ 1d8+2 piercing     [⚙️] │   │
│ └──────────────────────────────────────────────────────┘   │
│                                                             │
│ EQUIPMENT                                                   │
│ ┌──────────────────────────────────────────────────────┐   │
│ │ Chain Mail                                     [⚙️]  │   │
│ │ Shield                                         [⚙️]  │   │
│ │ Adventurer's Pack                              [⚙️]  │   │
│ │ Longsword                                      [⚙️]  │   │
│ │ Longbow                                        [⚙️]  │   │
│ └──────────────────────────────────────────────────────┘   │
│                                                             │
│ 💡 Add items in Inventory Sheet, then equip them           │
└────────────────────────────────────────────────────────────┘
```

**Notes:**
- No "+" button on Page 1
- [⚙️] opens ItemEditModal
- Weapons appear in both Attacks AND Equipment sections
- Small hint text guides users to Inventory for adding

### Inventory Sheet - Equipped Indicator

```
┌────────────────────────────────────────────────────────────┐
│ WEAPONS                                           2.5 lbs  │
├────────────────────────────────────────────────────────────┤
│ Qty │ Item                          │ Wt.  │ Value │      │
│  1  │ ⚔️ Longsword (equipped)        │ 3 lb │ 15 gp │ [⚙️] │
│  1  │ ⚔️ Longbow (equipped)          │ 2 lb │ 50 gp │ [⚙️] │
│  1  │    Dagger                      │ 1 lb │ 2 gp  │ [⚙️] │
│ [+] Add Weapon...                                          │
└────────────────────────────────────────────────────────────┘
```

- ⚔️ icon shows equipped items
- "(equipped)" text label for clarity

---

## 🔧 Type Changes

### Updated InventoryItem

```typescript
// inventory/InventoryBlock.tsx
export interface InventoryItem {
    id: string;
    name: string;
    quantity: number;
    weight?: number;
    value?: string;
    notes?: string;
    attuned?: boolean;
    containerId?: string;
    
    // NEW: Equipment status
    equipped?: boolean;           // Shows on Page 1 when true
    
    // Type determines what section it appears in
    type?: EquipmentType;         // 'weapon' | 'armor' | 'shield' | ...
    
    // ... rest of fields unchanged ...
}
```

### Column2Content Props Change

```typescript
// BEFORE
interface Column2ContentProps {
    attacks?: Attack[];           // Separate attack data
    currency?: Currency;
    equipment?: string[];         // Just strings
    onCurrencyChange?: (currency: Currency) => void;
}

// AFTER
interface Column2ContentProps {
    equippedItems?: InventoryItem[];  // Full item data
    currency?: Currency;
    onCurrencyChange?: (currency: Currency) => void;
    onItemEdit?: (item: InventoryItem) => void;  // Opens modal
}
```

### Helper Functions (CharacterCanvas)

```typescript
// Derive equipped items
const getEquippedItems = (equipment: InventoryItem[]): InventoryItem[] => {
    return equipment.filter(item => item.equipped);
};

// Derive attacks from equipped weapons
const computeAttacks = (
    equipment: InventoryItem[],
    character: Character
): DisplayAttack[] => {
    return equipment
        .filter(item => item.equipped && item.type === 'weapon')
        .map(weapon => ({
            id: weapon.id,
            name: weapon.name,
            attackBonus: formatAttackBonus(weapon, character),
            damage: formatDamage(weapon)
        }));
};

// Format attack bonus (e.g., "+5")
const formatAttackBonus = (weapon: InventoryItem, character: Character): string => {
    const profBonus = character.proficiencyBonus;
    const abilityMod = weapon.weaponType === 'ranged' 
        ? character.abilityModifiers.dex 
        : character.abilityModifiers.str;
    const total = profBonus + abilityMod;
    return total >= 0 ? `+${total}` : `${total}`;
};

// Format damage (e.g., "1d8+3 slashing")
const formatDamage = (weapon: InventoryItem): string => {
    const damage = weapon.damage || '—';
    const type = weapon.damageType || '';
    return `${damage} ${type}`.trim();
};
```

---

## 🎯 Success Criteria

- [ ] Single `InventoryItem[]` is source of truth
- [ ] Page 1 shows only items with `equipped: true`
- [ ] All equipped weapons appear in Attacks section
- [ ] Clicking item on Page 1 opens ItemEditModal
- [ ] No "+" button on Page 1
- [ ] Equip toggle works in ItemEditModal
- [ ] Unequipping item removes from Page 1 (keeps in Inventory)
- [ ] Equipped indicator visible in Inventory Sheet

---

## ⚠️ Edge Cases

1. **No equipped items**: Show "No equipment equipped" message
2. **Weapon unequipped**: Remove from both Attacks and Equipment on Page 1
3. **Non-weapon equipped**: Shows only in Equipment section (not Attacks)
4. **Multiple weapons**: All equipped weapons show in Attacks
5. **Data migration**: Existing characters may need equipped flags added

---

## 📚 References

### Related Handoffs
- `HANDOFF-Editable-Equipment-Modal.md` - ItemEditModal implementation
- `HANDOFF-Edit-Mode-Expansion.md` - Edit mode framework

### Key Files
- `Column2Content.tsx:46-55` - Current props definition
- `InventoryBlock.tsx:21-57` - InventoryItem interface

---

## Status

| Phase | Status | Description |
|-------|--------|-------------|
| Phase 1 | ⬜ Not Started | Data model update (add equipped) |
| Phase 2 | ⬜ Not Started | CharacterCanvas refactor |
| Phase 3 | ⬜ Not Started | Column2Content update |
| Phase 4 | ⬜ Not Started | Inventory Sheet integration |
| Phase 5 | ⬜ Not Started | Polish & testing |

---

**Total Estimated Time:** 4-5 hours

**Dependencies:** Requires `ItemEditModal` from equipment handoff to be complete first.


