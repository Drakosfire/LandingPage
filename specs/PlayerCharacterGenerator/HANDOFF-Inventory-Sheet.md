# Handoff: Inventory Sheet

**Date:** December 7, 2025  
**Type:** Feature  
**Estimated Effort:** 6-8 hours  
**Prototype:** `specs/PlayerCharacterGenerator/prototypes/inventory-sheet.html`

---

## Context

A dedicated inventory sheet provides organized tracking of equipment, currency, encumbrance, and magical item attunement. This is a common second page for D&D character sheets and keeps the main sheet focused on combat/ability mechanics.

---

## Goal

Create an `InventorySheet` page component with PHB styling that contains:
- **Header:** Title + Character info (name, class/level, strength)
- **Top Row:** Currency, Encumbrance, Attunement sections
- **Main Content:** 3-column inventory grid with categorized items
- **Notes:** 2-column notes section at bottom

---

## Reference: HTML Prototype Structure

### Header
```html
<div class="phb-page-title">Inventory</div>
<div class="inventory-header">
    <div class="character-info">
        <div class="labeled-box">...</div>  <!-- Character Name -->
        <div class="labeled-box narrow">...</div>  <!-- Class & Level -->
        <div class="labeled-box narrow">...</div>  <!-- Strength -->
    </div>
</div>
```

### Top Row (3 sections)
```
┌────────────────────┬────────────────────┬────────────────────────────────┐
│     CURRENCY       │   ENCUMBRANCE      │         ATTUNEMENT             │
│ ┌──┬──┬──┬──┬──┐  │ Current: 108 lb    │ ● +1 Longsword                 │
│ │CP│SP│EP│GP│PP│  │ Capacity: 240 lb   │ ● Cloak of Protection          │
│ │45│120│0│347│12│ │ Push: 480 lb       │ ○ _______________              │
│ └──┴──┴──┴──┴──┘  │ [████████░░░░]     │                                │
│ Total: 482gp 6sp  │                    │        (3 max)                 │
└────────────────────┴────────────────────┴────────────────────────────────┘
```

### Main Content (3 Columns)
```
┌────────────────────────┬────────────────────────┬────────────────────────┐
│       COLUMN 1         │       COLUMN 2         │       COLUMN 3         │
├────────────────────────┼────────────────────────┼────────────────────────┤
│ ┌────────────────────┐ │ ┌────────────────────┐ │ ┌────────────────────┐ │
│ │ WEAPONS      12 lb │ │ │ ADVENTURING GEAR   │ │ │ TREASURE & VALUABL │ │
│ │ Qty│Item│Wt│Value  │ │ │     18 lb          │ │ │ Item│Value         │ │
│ │ 1 │+1 Longsw│3│—   │ │ │ Qty│Item│Wt│Value  │ │ │ Gold Ring│250 gp   │ │
│ │ 1 │Javelin│2│5sp   │ │ │ 1 │Backpack│5│2gp  │ │ │ Candlesticks│50 gp │ │
│ │ 3 │Handaxe│6│15gp  │ │ │ 10│Rations│20│5gp  │ │ │ Deed│???           │ │
│ └────────────────────┘ │ │ 50│Rope│10│1gp     │ │ └────────────────────┘ │
│ ┌────────────────────┐ │ │ ...                │ │ ┌────────────────────┐ │
│ │ ARMOR & SHIELDS    │ │ └────────────────────┘ │ │ CONSUMABLES        │ │
│ │     71 lb          │ │ ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐ │ │     1 lb           │ │
│ │ Qty│Item│Wt│AC     │ │ │ 📦 BACKPACK        │ │ │ Qty│Item│Wt│Uses   │ │
│ │ 1 │Chain Mail│55│16│ │ │   8/30 lb          │ │ │ 2 │Potion│1│2d4+2  │ │
│ │ 1 │Shield│6│+2     │ │ │ Healer's Kit│3 lb  │ │ │ 1 │Antitoxin│—│1   │ │
│ │ 1 │Cloak Prot│—│+1 │ │ │ Climber's Kit│5 lb │ │ │ 3 │Holy Water│3│3  │ │
│ └────────────────────┘ │ └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘ │ └────────────────────┘ │
│ ┌────────────────────┐ │                        │ ┌────────────────────┐ │
│ │ MAGIC ITEMS  1 lb  │ │                        │ │ OTHER ITEMS  3 lb  │ │
│ │ Qty│Item│Wt│Rarity │ │                        │ │ Qty│Item│Wt│Notes  │ │
│ │ 2 │Potion Heal│1│C │ │                        │ │ 1 │Prayer Book│1│— │ │
│ │ 1 │Scroll Rev│—│U  │ │                        │ │ 1 │Map│—│—         │ │
│ │ (flex-grow)        │ │                        │ │ (flex-grow)        │ │
│ └────────────────────┘ │                        │ └────────────────────┘ │
└────────────────────────┴────────────────────────┴────────────────────────┘
```

### Notes Section
```
┌──────────────────────────────────────────────────────────────────────────┐
│                           INVENTORY NOTES                                │
│ ┌────────────────────────────────┬─────────────────────────────────────┐ │
│ │ Storage Locations:             │ Owed / Debts:                       │ │
│ │ Horse: Saddlebags at inn       │ Owes 50gp to Merchant's Guild       │ │
│ │ Bank: 500gp in Waterdeep       │                                     │ │
│ └────────────────────────────────┴─────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## File Locations

### Existing Components to Reference
```
LandingPage/src/components/PlayerCharacterGenerator/sheetComponents/
├── CharacterSheet.css          # CSS variables, section patterns
├── CharacterSheetPage.tsx      # Page container (.page.phb wrapper)
├── CharacterHeader.tsx         # Header pattern (labeled-box)
└── index.ts                    # Exports
```

### HTML Prototype
```
LandingPage/specs/PlayerCharacterGenerator/prototypes/
├── inventory-sheet.html        # SOURCE OF TRUTH for this task
└── phb-prototype.css           # Shared PHB foundation styles
```

---

## Key CSS Patterns from Prototype

### Top Row Layout (line 47-51)
```css
.top-row {
    display: flex;
    gap: 15px;
    margin-bottom: 15px;
}
```

### Currency Grid (line 59-62)
```css
.currency-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 6px;
}
```

### Encumbrance Bar (line 126-140)
```css
.encumbrance-bar {
    height: 12px;
    background: #e8e0d0;
    border: 1px solid var(--border-color);
    border-radius: 6px;
    overflow: hidden;
}
.encumbrance-fill {
    background: linear-gradient(90deg, #4a9c4a 0%, #c9a227 60%, #c94a4a 100%);
    width: 45%;  /* dynamic based on current/capacity */
}
```

### Attunement Slots (line 148-179)
```css
.attunement-slot {
    display: flex;
    align-items: center;
    gap: 8px;
}
.attunement-marker {
    width: 14px;
    height: 14px;
    border: 2px solid var(--border-color);
    border-radius: 50%;
}
.attunement-marker.active {
    background: var(--border-color);
}
```

### Item Row Grid (line 211-219)
```css
.item-row {
    display: grid;
    grid-template-columns: 30px 1fr 40px 35px;  /* qty | name | wt | value */
    gap: 4px;
    padding: 3px 0;
    border-bottom: 1px dotted var(--border-light);
    font-size: 10px;
}
```

### Block-Specific Grid Overrides
```css
/* Treasure: 2 columns (no qty/wt) */
.treasure-block .item-row {
    grid-template-columns: 1fr 60px;
}

/* Consumables: tighter qty/wt, wider "Uses" for dice notation */
.consumables-block .item-row {
    grid-template-columns: 20px 1fr 20px 50px;
}
```

### Container Block (dashed border) (line 271-279)
```css
.container-block {
    border: 2px dashed var(--border-light) !important;
    background: rgba(255, 255, 255, 0.5) !important;
    background-image: none !important;
}
```

---

## Data Interfaces

```typescript
// Currency
interface Currency {
    cp: number;
    sp: number;
    ep: number;
    gp: number;
    pp: number;
}

// Encumbrance
interface Encumbrance {
    currentWeight: number;
    carryingCapacity: number;  // STR * 15
    pushDragLift: number;      // STR * 30
}

// Attunement
interface AttunedItem {
    name: string;
    active: boolean;
}

// Inventory Item
interface InventoryItem {
    id: string;
    name: string;
    quantity: number;
    weight?: number;       // in pounds
    value?: string;        // "5 gp", "—", etc.
    notes?: string;        // AC, rarity, uses, etc.
    attuned?: boolean;     // Shows ✦ if true
    containerId?: string;  // If stored in a container
}

// Container (Backpack, Bag of Holding, etc.)
interface Container {
    id: string;
    name: string;
    currentWeight: number;
    capacityWeight: number;
    capacityVolume?: string;  // "1 cu. ft."
    items: InventoryItem[];
}

// Full Inventory Sheet Props
interface InventorySheetProps {
    characterName: string;
    classAndLevel: string;
    strength: number;
    
    currency: Currency;
    attunedItems: AttunedItem[];
    
    weapons: InventoryItem[];
    armor: InventoryItem[];
    magicItems: InventoryItem[];
    adventuringGear: InventoryItem[];
    treasure: InventoryItem[];
    consumables: InventoryItem[];
    otherItems: InventoryItem[];
    
    containers: Container[];
    
    notes?: string;
}
```

---

## Implementation Plan

### Step 1: Create InventorySheet.tsx

**File:** `sheetComponents/InventorySheet.tsx`

Main component structure:
```tsx
export const InventorySheet: React.FC<InventorySheetProps> = (props) => {
    return (
        <CharacterSheetPage className="inventory-sheet">
            <div className="phb-page-title">Inventory</div>
            <InventoryHeader {...} />
            <TopRow {...} />
            <MainContent {...} />
            <NotesSection {...} />
        </CharacterSheetPage>
    );
};
```

### Step 2: Create Sub-Components

**Files to create:**
- `inventory/InventoryHeader.tsx` - Character info row
- `inventory/CurrencySection.tsx` - Currency grid
- `inventory/EncumbranceSection.tsx` - Weight tracking with bar
- `inventory/AttunementSection.tsx` - Attuned items list
- `inventory/InventoryBlock.tsx` - Reusable item list block
- `inventory/ContainerBlock.tsx` - Container with dashed border
- `inventory/ItemRow.tsx` - Single item row (reusable)
- `inventory/InventoryNotes.tsx` - 2-column notes

### Step 3: Add CSS to CharacterSheet.css

Append inventory-specific styles from prototype (lines 12-317).

Key sections to add:
- `.inventory-sheet` - page-level overrides
- `.inventory-header` - header layout
- `.top-row` - currency/encumbrance/attunement row
- `.currency-section`, `.currency-grid`, `.currency-item`
- `.encumbrance-section`, `.encumbrance-bar`, `.encumbrance-fill`
- `.attunement-section`, `.attunement-slot`, `.attunement-marker`
- `.inventory-column`, `.inventory-block`
- `.item-row`, `.item-row.header`, `.item-row.empty`
- `.container-block`, `.container-info`
- `.notes-section`, `.notes-box`, `.notes-column`

### Step 4: Wire into CharacterCanvas

Update `CharacterCanvas.tsx` to render inventory sheet as additional page.

### Step 5: Update Exports

Add to `sheetComponents/index.ts`:
```tsx
export { InventorySheet } from './InventorySheet';
export * from './inventory';
```

---

## Files to Create

| File | Purpose |
|------|---------|
| `sheetComponents/InventorySheet.tsx` | Main inventory page |
| `sheetComponents/inventory/InventoryHeader.tsx` | Character info header |
| `sheetComponents/inventory/CurrencySection.tsx` | Currency grid (CP/SP/EP/GP/PP) |
| `sheetComponents/inventory/EncumbranceSection.tsx` | Weight tracking + bar |
| `sheetComponents/inventory/AttunementSection.tsx` | Attuned items (3 slots) |
| `sheetComponents/inventory/InventoryBlock.tsx` | Generic item list section |
| `sheetComponents/inventory/ContainerBlock.tsx` | Container with contents |
| `sheetComponents/inventory/ItemRow.tsx` | Single item row |
| `sheetComponents/inventory/InventoryNotes.tsx` | 2-column notes |
| `sheetComponents/inventory/index.ts` | Exports |

## Files to Modify

| File | Changes |
|------|---------|
| `sheetComponents/CharacterSheet.css` | Add inventory-specific styles (~200 lines) |
| `sheetComponents/index.ts` | Export InventorySheet |
| `shared/CharacterCanvas.tsx` | Render inventory as additional page |

---

## Testing Checklist

- [ ] InventorySheet renders with demo data
- [ ] PHB styling matches main character sheet (parchment, border)
- [ ] Currency grid shows all 5 coin types with inputs
- [ ] Currency total calculates correctly
- [ ] Encumbrance bar fills proportionally to current/capacity
- [ ] Attunement markers show filled (●) vs empty (○)
- [ ] Item rows display qty, name, weight, value columns
- [ ] Container blocks have dashed border styling
- [ ] Item rows with `.empty` class provide blank lines
- [ ] Notes section has 2-column layout
- [ ] Page fits within canvas bounds
- [ ] Print styles work

---

## Success Criteria

1. InventorySheet renders with same PHB aesthetic as main sheet
2. All 3 top-row sections render correctly (currency, encumbrance, attunement)
3. 3-column item grid displays categorized inventory
4. Item rows follow prototype grid template (30px qty | 1fr name | 40px wt | 35px value)
5. Container blocks have distinct dashed border
6. Encumbrance bar shows dynamic fill based on weight ratio
7. CSS uses existing variables where possible
8. Build passes, no lint errors

---

## Demo Data Structure

```typescript
const DEMO_INVENTORY: InventorySheetProps = {
    characterName: "Thoradin Fireforge",
    classAndLevel: "Paladin 5",
    strength: 16,
    
    currency: { cp: 45, sp: 120, ep: 0, gp: 347, pp: 12 },
    
    attunedItems: [
        { name: "+1 Longsword", active: true },
        { name: "Cloak of Protection", active: true },
        { name: "", active: false }
    ],
    
    weapons: [
        { id: "w1", name: "+1 Longsword ✦", quantity: 1, weight: 3, value: "—", attuned: true },
        { id: "w2", name: "Javelin", quantity: 1, weight: 2, value: "5 sp" },
        { id: "w3", name: "Handaxe", quantity: 3, weight: 6, value: "15 gp" }
    ],
    
    armor: [
        { id: "a1", name: "Chain Mail (worn)", quantity: 1, weight: 55, notes: "AC 16" },
        { id: "a2", name: "Shield (worn)", quantity: 1, weight: 6, notes: "+2" },
        { id: "a3", name: "Cloak of Protection ✦", quantity: 1, notes: "+1" }
    ],
    
    // ... (see prototype for full demo data)
    
    containers: [{
        id: "c1",
        name: "Backpack",
        currentWeight: 8,
        capacityWeight: 30,
        capacityVolume: "1 cu. ft.",
        items: [
            { id: "bp1", name: "Healer's Kit (10 uses)", quantity: 1, weight: 3, value: "5 gp" },
            { id: "bp2", name: "Climber's Kit", quantity: 1, weight: 5, value: "25 gp" }
        ]
    }],
    
    notes: "Storage: Horse at inn\nBank: 500gp in Waterdeep\n\nDebts: 50gp to Merchant's Guild"
};
```

---

## References

- **HTML Prototype:** `specs/PlayerCharacterGenerator/prototypes/inventory-sheet.html` (SOURCE OF TRUTH)
- **PHB Foundation CSS:** `specs/PlayerCharacterGenerator/prototypes/phb-prototype.css`
- **Existing Page Pattern:** `sheetComponents/CharacterSheetPage.tsx`
- **CSS Variables:** `CharacterSheet.css` lines 22-70
- **Similar Component:** `CharacterHeader.tsx` (labeled-box pattern)

