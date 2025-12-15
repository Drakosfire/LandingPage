# Handoff: Editable Equipment Modal (Inventory Management)
**Date:** 2025-12-09  
**Type:** Feature  
**Last Updated:** 2025-12-09 16:00  

---

## 🎯 Goal

Transform the read-only `ItemDetailModal` into an **editable equipment management system** for the Inventory Sheet. This is separate from the wizard-based character creation flow—this is for **session-to-session item management** (loot, purchases, consumables).

---

## 🚨 CURRENT STATE

### What's Working ✅
- `ItemDetailModal` displays item details (read-only)
- `InventoryBlock` renders categorized item lists
- `InventorySheet` has 7 item categories + containers
- Currency has quick edit (inline number inputs)
- Item info click opens detail modal

### What's NOT Working ❌
- Modal is **read-only** (no edit capability)
- No way to **add new items** to inventory
- No way to **delete items**
- No way to **modify existing items** (quantity, name, notes)

---

## 📋 Requirements

### User Flow
1. **Edit Mode ON** → "+" button appears on first empty row in each category
2. **Click "+"** → Opens `ItemEditModal` with empty form (add mode)
3. **Click existing item** → Opens `ItemEditModal` pre-filled (edit mode)
4. **Save** → Updates inventory state, closes modal
5. **Delete** → Removes item from inventory (with confirmation)
6. **Cancel** → Closes modal without changes

### Modal Behavior
- **Add Mode**: Empty form, "Add Item" button
- **Edit Mode**: Pre-filled form, "Save Changes" + "Delete" buttons
- Form fields adapt based on item category (weapons show damage, armor shows AC, etc.)

---

## 🏗️ Architecture

### Component Hierarchy

```
InventorySheet
├── InventoryBlock (×7 categories)
│   ├── ItemRow (existing items) → onClick → ItemEditModal (edit mode)
│   └── AddItemRow (edit mode) → onClick → ItemEditModal (add mode)
└── ItemEditModal (new component)
    ├── Form fields (contextual by category)
    ├── Save/Cancel buttons
    └── Delete button (edit mode only)
```

### State Flow

```
User Action → ItemEditModal → onSave/onDelete callback → CharacterCanvas
                                                              ↓
                                                    updateDnD5eData()
                                                              ↓
                                                    dnd5eData.equipment.*
```

---

## 📁 Key Files

### Existing (to modify)

```
LandingPage/src/components/PlayerCharacterGenerator/sheetComponents/
├── modals/
│   └── ItemDetailModal.tsx          # Base to transform → ItemEditModal
├── inventory/
│   ├── InventoryBlock.tsx           # Add onAddItem, onItemClick props
│   ├── ItemRow.tsx                  # Make row clickable in edit mode
│   └── index.ts                     # Export new component
├── InventorySheet.tsx               # Wire up callbacks
└── CharacterSheet.css               # Modal and button styles
```

### To Create

```
LandingPage/src/components/PlayerCharacterGenerator/sheetComponents/
├── modals/
│   └── ItemEditModal.tsx            # New editable modal component
├── inventory/
│   └── AddItemRow.tsx               # "+" button row component
```

### State Handler (CharacterCanvas.tsx)

```
LandingPage/src/components/PlayerCharacterGenerator/shared/
└── CharacterCanvas.tsx              # Add handlers for inventory CRUD
```

---

## 🎨 Design Specifications

### ItemEditModal Layout

```
┌─────────────────────────────────────────────────────────────┐
│ [X]                                                         │
│                                                             │
│  ┌─────────────┐  Item Name                                │
│  │   [Icon]    │  ─────────────────────────                │
│  │             │  [_____________________]                   │
│  └─────────────┘                                           │
│                                                             │
│  Category        Quantity        Weight                     │
│  [dropdown ▼]    [___]           [___] lb                  │
│                                                             │
│  ─────────── Weapon Stats (if weapon) ───────────          │
│  Damage          Type            Properties                 │
│  [1d8]           [slashing ▼]    [☑ versatile] [☑ ...]    │
│                                                             │
│  ─────────── Armor Stats (if armor) ───────────            │
│  AC               Category        Stealth                   │
│  [__]             [medium ▼]      [☐ disadvantage]         │
│                                                             │
│  ─────────── Magic Properties ───────────                  │
│  [☐ Magical]     Rarity          [☐ Requires Attunement]   │
│                  [rare ▼]                                   │
│                                                             │
│  Description                                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                      │   │
│  │                                                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Value: [___] gp                                           │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────────┐  │
│  │  Cancel  │  │  Delete  │  │  Save Changes / Add Item │  │
│  └──────────┘  └──────────┘  └──────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Add Item Button Row

```
┌────────────────────────────────────────────────────────────┐
│  [+]  Add Item...                                          │
└────────────────────────────────────────────────────────────┘
```

- Appears as last row in each InventoryBlock when `isEditMode`
- Blue dashed border (quick edit style)
- Hover: darker blue, slight scale
- Keyboard accessible (Enter/Space to activate)

### CSS Variables to Use

```css
/* From existing CharacterSheet.css */
--border-color: #9c2b1b;
--text-red: #58180d;
--bg-light: #f8f5e6;
--border-light: #d4c9a8;

/* Edit mode colors (already defined) */
/* Quick edit: #3b82f6 (blue) */
/* Complex edit: #8b5cf6 (purple) */
```

---

## 📝 Implementation Plan

### Phase 1: AddItemRow Component
**Time:** ~30 min

1. Create `AddItemRow.tsx` with "+" button styling
2. Add to `InventoryBlock` when `isEditMode && onAddItem`
3. Wire up click handler to open modal

### Phase 2: ItemEditModal Component
**Time:** ~2-3 hours

1. Copy `ItemDetailModal.tsx` → `ItemEditModal.tsx`
2. Convert display elements to form inputs
3. Add form state management (useState or react-hook-form)
4. Add Save/Cancel/Delete buttons
5. Implement conditional field display (weapon/armor/magic)

### Phase 3: InventoryBlock Integration
**Time:** ~1 hour

1. Add props: `onAddItem`, `onItemEdit`, `onItemDelete`
2. Make item rows clickable in edit mode
3. Pass item data to modal on click

### Phase 4: CharacterCanvas Handlers
**Time:** ~1 hour

1. Create `handleAddInventoryItem(category, item)`
2. Create `handleEditInventoryItem(category, itemId, updates)`
3. Create `handleDeleteInventoryItem(category, itemId)`
4. Wire through InventorySheet → InventoryBlock

### Phase 5: Polish & Testing
**Time:** ~1 hour

1. Keyboard navigation
2. Form validation
3. Delete confirmation
4. Visual polish

---

## 🔧 Type Definitions

### Existing InventoryItem (inventory/InventoryBlock.tsx:15-51)

```typescript
export interface InventoryItem {
    id: string;
    name: string;
    quantity: number;
    weight?: number;
    value?: string;
    notes?: string;
    attuned?: boolean;
    containerId?: string;
    
    // Type-specific fields
    type?: EquipmentType;
    description?: string;
    isMagical?: boolean;
    rarity?: MagicItemRarity;
    requiresAttunement?: boolean;
    
    // Weapon-specific
    damage?: string;
    damageType?: DamageType;
    properties?: WeaponProperty[];
    // ... etc
}
```

### New Props for InventoryBlock

```typescript
interface InventoryBlockProps {
    // ... existing props ...
    
    /** Callback when add button is clicked (edit mode) */
    onAddItem?: () => void;
    /** Callback when existing item is clicked (edit mode) */
    onItemEdit?: (item: InventoryItem) => void;
}
```

### ItemEditModal Props

```typescript
interface ItemEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    
    /** Mode: 'add' for new item, 'edit' for existing */
    mode: 'add' | 'edit';
    
    /** Category being added to (for add mode) */
    category?: InventoryCategory;
    
    /** Existing item data (for edit mode) */
    item?: InventoryItem;
    
    /** Save callback */
    onSave: (item: InventoryItem) => void;
    
    /** Delete callback (edit mode only) */
    onDelete?: (itemId: string) => void;
}

type InventoryCategory = 
    | 'weapons'
    | 'armor'
    | 'magicItems'
    | 'adventuringGear'
    | 'treasure'
    | 'consumables'
    | 'otherItems';
```

---

## 🎯 Success Criteria

- [ ] "+" button appears in edit mode on each inventory category
- [ ] Clicking "+" opens modal in add mode
- [ ] Clicking existing item opens modal in edit mode
- [ ] Form fields adapt to item category
- [ ] Save creates/updates item in correct category
- [ ] Delete removes item (with confirmation)
- [ ] Changes persist (via CharacterCanvas state)
- [ ] Keyboard accessible throughout
- [ ] PHB parchment styling maintained

---

## ⚠️ Edge Cases to Handle

1. **Empty name**: Validate name is required
2. **Negative quantity**: Validate quantity >= 0
3. **Delete last item**: Should work without breaking layout
4. **Container items**: Items in containers need containerId preserved
5. **Attuned items**: Max 3 attuned, warn if exceeding

---

## 📚 References

### Pattern Sources
- `EditableText.tsx` - Inline edit pattern with forwardRef
- `SpellSlotTracker.tsx` - Click-to-toggle in edit mode
- `BackgroundPersonalitySheet.tsx` - EditableTextarea pattern

### Existing Modal Styles
- `CharacterSheet.css:2200-2350` - `.detail-modal-*` classes

### Related Handoffs
- `HANDOFF-Edit-Mode-Expansion.md` - Edit mode patterns
- `HANDOFF-Inventory-Sheet.md` - Inventory architecture

---

## Quick Pickup

### Commands
```bash
cd /home/drakosfire/Projects/DungeonOverMind/LandingPage
pnpm dev
# Navigate to Character Generator, load demo character
# Toggle Edit Mode, observe Inventory Sheet
```

### Key Files to Start
```
sheetComponents/modals/ItemDetailModal.tsx    # Copy as base for ItemEditModal
sheetComponents/inventory/InventoryBlock.tsx  # Add onAddItem prop
sheetComponents/inventory/ItemRow.tsx         # Make clickable in edit mode
shared/CharacterCanvas.tsx                    # Add inventory CRUD handlers
```

---

## Status

| Phase | Status | Description |
|-------|--------|-------------|
| Phase 1 | ✅ Complete | AddItemRow component |
| Phase 2 | ✅ Complete | ItemEditModal component |
| Phase 3 | ✅ Complete | InventoryBlock integration |
| Phase 4 | ✅ Complete | CharacterCanvas handlers |
| Phase 5 | 🔄 In Progress | Polish & testing |

---

**Total Estimated Time:** 5-6 hours

