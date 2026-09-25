# Character Sheet Page Layout & Component Analysis

**Date:** December 5, 2025  
**Purpose:** Catalog shared page structure and classify components as STATIC vs DYNAMIC for Canvas integration

---

## 🎯 Shared Page Structure (All 3 Sheets)

All three pages share this layout hierarchy:

```
┌─────────────────────────────────────────────────────────────┐
│  PHB Page Container (.phb-page)                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Page Title (.phb-page-title)                         │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Header Section (page-specific)                       │  │
│  │  - Character: Portrait + Info boxes                   │  │
│  │  - Spell: Class/Ability/DC/Attack                     │  │
│  │  - Inventory: Name/Class/Strength                     │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Sub-Header Row (page-specific)                       │  │
│  │  - Character: 6 Ability Score boxes                   │  │
│  │  - Spell: 9 Spell Slot trackers                       │  │
│  │  - Inventory: Currency/Encumbrance/Attunement         │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌─────────────┬─────────────┬─────────────────────────┐  │
│  │  Column 1   │  Column 2   │  Column 3               │  │
│  │             │             │                         │  │
│  │  (STATIC &  │  (STATIC &  │  (STATIC & DYNAMIC)     │  │
│  │   DYNAMIC)  │   DYNAMIC)  │                         │  │
│  │             │             │                         │  │
│  └─────────────┴─────────────┴─────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Footer Section (optional notes)                      │  │
│  └───────────────────────────────────────────────────────┘  │
│  [PHB Footer Accent]                                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Static vs Dynamic Classification

### Legend
- 🔒 **STATIC**: Fixed size, bounded content, will never overflow
- 📈 **DYNAMIC**: Can grow, may require pagination
- ⚠️ **SEMI-STATIC**: Technically bounded but could get dense

---

## Character Sheet Components

### 🔒 STATIC Components (Never Grow)

| Component | Location | Size Constraint | Notes |
|-----------|----------|-----------------|-------|
| **Portrait** | Header | 100×100px | Fixed image slot |
| **Character Name** | Header | Single line | Name + label |
| **Class & Level** | Header | Single line | Bounded by game (20 levels max) |
| **Race** | Header | Single line | Fixed D&D races |
| **Background** | Header | Single line | Fixed D&D backgrounds |
| **Player Name** | Header | Single line | |
| **Alignment** | Header | 2 letters typical | LG, NG, CG, etc. |
| **XP** | Header | Number | |
| **Ability Scores** | Sub-header | 6 boxes | STR, DEX, CON, INT, WIS, CHA |
| **Inspiration** | Column 1 | Circle + label | 0 or 1 |
| **Proficiency Bonus** | Column 1 | Circle + label | +2 to +6 |
| **Saving Throws** | Column 1 | 6 rows | Fixed 6 abilities |
| **Skills** | Column 1 | 18 rows | Fixed 18 skills |
| **Passive Perception** | Column 1 | Single value | |
| **AC** | Column 2 | Single value | |
| **Initiative** | Column 2 | Single value | |
| **Speed** | Column 2 | Single value | |
| **HP Max** | Column 2 | Single value | |
| **HP Current** | Column 2 | Input field | |
| **HP Temp** | Column 2 | Input field | |
| **Hit Dice** | Column 2 | Total + current | |
| **Death Saves** | Column 2 | 6 circles | 3 success, 3 failure |
| **Currency** | Column 2 | 5 coins | CP, SP, EP, GP, PP |

### 📈 DYNAMIC Components (Can Grow)

| Component | Location | Growth Potential | Pagination Strategy |
|-----------|----------|------------------|---------------------|
| **Attacks** | Column 2 | High | 3 typical → 10+ for martial |
| **Equipment** | Column 2 | Very High | Adventurers carry LOTS |
| **Personality** | Column 3 | Medium | Text can be verbose |
| **Ideals** | Column 3 | Medium | Text can be verbose |
| **Bonds** | Column 3 | Medium | Text can be verbose |
| **Flaws** | Column 3 | Medium | Text can be verbose |
| **Features & Traits** | Column 3 | **VERY HIGH** | Level 20 = many features |
| **Proficiencies** | Column 1 | Medium | Languages + tools + weapons |
| **Notes** | Footer | Unlimited | User-defined |

---

## Spell Sheet Components

### 🔒 STATIC Components

| Component | Location | Size Constraint | Notes |
|-----------|----------|-----------------|-------|
| **Spellcasting Class** | Header | Single line | |
| **Spell Ability** | Header | 3 letters | INT, WIS, CHA |
| **Spell Save DC** | Header | 2 digits | 8-20 range |
| **Spell Attack** | Header | +X format | |
| **Spell Slot Tracker** | Sub-header | 9 level boxes | Fixed by D&D rules |

### 📈 DYNAMIC Components

| Component | Location | Growth Potential | Pagination Strategy |
|-----------|----------|------------------|---------------------|
| **Cantrips** | Column 1 | Low-Medium | 2-5 typical |
| **1st Level Spells** | Column 1 | Medium | 6-12 typical |
| **2nd Level Spells** | Column 2 | Medium | 4-10 typical |
| **3rd Level Spells** | Column 2 | Medium | 4-10 typical |
| **4th Level Spells** | Column 2 | Medium | 4-8 typical |
| **5th Level Spells** | Column 3 | Medium | 3-6 typical |
| **6th Level Spells** | Column 3 | Low | 2-4 typical |
| **7th Level Spells** | Column 3 | Low | 2-4 typical |
| **8th Level Spells** | Column 3 | Low | 1-3 typical |
| **9th Level Spells** | Column 3 | Low | 1-2 typical |

**Special Case**: Wizards can learn **100+ spells** in their spellbook. Prepared caster list is more bounded.

---

## Inventory Sheet Components

### 🔒 STATIC Components

| Component | Location | Size Constraint | Notes |
|-----------|----------|-----------------|-------|
| **Character Name** | Header | Single line | |
| **Class & Level** | Header | Single line | |
| **Strength** | Header | 2 digits | For carrying capacity |
| **Currency** | Top row | 5 coins + total | Fixed D&D currency types |
| **Encumbrance** | Top row | 3 values + bar | Current/Max/Push-Drag |
| **Attunement** | Top row | 3 slots max | D&D rules cap at 3 |

### 📈 DYNAMIC Components

| Component | Location | Growth Potential | Pagination Strategy |
|-----------|----------|------------------|---------------------|
| **Weapons** | Column 1 | Medium | 4-8 typical |
| **Armor & Shields** | Column 1 | Low | 2-4 typical |
| **Magic Items** | Column 1 | High | Depends on campaign |
| **Adventuring Gear** | Column 2 | **VERY HIGH** | 20+ items common |
| **Container Contents** | Column 2 | High | Nested inventory |
| **Treasure/Valuables** | Column 3 | High | Quest rewards |
| **Consumables** | Column 3 | High | Potions, scrolls, etc. |
| **Other Items** | Column 3 | High | Miscellaneous |
| **Notes** | Footer | Unlimited | Storage locations, debts |

---

## 🎯 Overflow Strategy: Static Pages + Overflow Pages

### Core Principle

> **Page layouts are STATIC. Only content within bounded sections can overflow.**

Each page type (Character, Spells, Inventory) has:
1. A **main page** with fixed layout (all components have fixed positions)
2. An **overflow page** (only created if needed) for content that doesn't fit

### Page Flow

```
┌─────────────────────────────────────────────────────────────┐
│  CHARACTER MAIN PAGE (Static Layout)                        │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ Header, Ability Scores, Saves, Skills (ALWAYS FIT)     ││
│  │ AC, HP, Combat Stats (ALWAYS FIT)                      ││
│  │ ─────────────────────────────────────────────────────  ││
│  │ Features [MAX 8 items] ← BOUNDED                       ││
│  │ Attacks [MAX 5 items] ← BOUNDED                        ││
│  │ Equipment [MAX 12 items] ← BOUNDED                     ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                         ↓ if overflow exists
┌─────────────────────────────────────────────────────────────┐
│  CHARACTER OVERFLOW PAGE (Dynamic)                          │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ Features & Traits (cont.) [remaining items]            ││
│  │ Attacks & Spellcasting (cont.) [remaining items]       ││
│  │ Equipment (cont.) [remaining items]                    ││
│  └─────────────────────────────────────────────────────────┘│
│  (This page CAN chain to more overflow pages if needed)     │
└─────────────────────────────────────────────────────────────┘
                         ↓ then
┌─────────────────────────────────────────────────────────────┐
│  SPELL MAIN PAGE (Static Layout)                            │
│  ... same pattern ...                                       │
└─────────────────────────────────────────────────────────────┘
```

### Implementation: Component-Level Pagination

**No Canvas modifications needed.** Simple slice-based pagination:

```typescript
// Constants based on available height in each section
const LIMITS = {
    features: 8,      // ~200px available
    attacks: 5,       // ~120px available  
    equipment: 12,    // ~180px available
    spellsPerLevel: 8, // ~varies by level
};

const CharacterSheetDocument = ({ character }) => {
    // Slice data for main page
    const featuresMain = character.features.slice(0, LIMITS.features);
    const featuresOverflow = character.features.slice(LIMITS.features);
    
    const attacksMain = character.attacks.slice(0, LIMITS.attacks);
    const attacksOverflow = character.attacks.slice(LIMITS.attacks);
    
    const equipmentMain = character.equipment.slice(0, LIMITS.equipment);
    const equipmentOverflow = character.equipment.slice(LIMITS.equipment);
    
    // Check if overflow page needed
    const hasOverflow = 
        featuresOverflow.length > 0 || 
        attacksOverflow.length > 0 || 
        equipmentOverflow.length > 0;
    
    // Build page array
    return [
        <CharacterMainPage
            character={character}
            features={featuresMain}
            attacks={attacksMain}
            equipment={equipmentMain}
            hasMore={{
                features: featuresOverflow.length > 0,
                attacks: attacksOverflow.length > 0,
                equipment: equipmentOverflow.length > 0,
            }}
        />,
        
        hasOverflow && (
            <CharacterOverflowPage
                features={featuresOverflow}
                attacks={attacksOverflow}
                equipment={equipmentOverflow}
            />
        ),
        
        character.isSpellcaster && <SpellMainPage ... />,
        spellOverflow.length > 0 && <SpellOverflowPage ... />,
        
        <InventoryMainPage ... />,
        inventoryOverflow.length > 0 && <InventoryOverflowPage ... />,
        
    ].filter(Boolean);
};
```

### Why This Works

| Question | Answer |
|----------|--------|
| How to detect overflow? | `items.length > LIMIT` |
| How to split content? | `slice(0, LIMIT)` + `slice(LIMIT)` |
| How to show "more exists"? | `hasMore` prop → "(see page 2)" or "..." |
| How to render overflow? | List components with `(cont.)` headers |
| Is Canvas needed? | NO for static sections, OPTIONAL for overflow |

### Overflow Page Design

Overflow pages are simple list containers:

```typescript
const CharacterOverflowPage = ({ features, attacks, equipment }) => (
    <div className="phb-page character-overflow">
        <div className="phb-page-title">Character Details (cont.)</div>
        
        {features.length > 0 && (
            <FeaturesList 
                items={features} 
                title="Features & Traits (cont.)"
            />
        )}
        
        {attacks.length > 0 && (
            <AttacksList 
                items={attacks}
                title="Attacks (cont.)"
            />
        )}
        
        {equipment.length > 0 && (
            <EquipmentList
                items={equipment}
                title="Equipment (cont.)"
            />
        )}
    </div>
);
```

### Complexity Assessment

**This is SIMPLER than full Canvas pagination:**

| Full Canvas | This Approach |
|-------------|---------------|
| Measure every component | Only measure bounded sections |
| Calculate column overflow | No columns to overflow |
| Region fitting algorithm | Simple slice operations |
| Complex state management | Simple array slicing |

**The only "complexity":** Determining `LIMIT` constants. Solutions:
1. **Empirical**: Test and adjust until it looks right
2. **Calculated**: `availableHeight / estimatedRowHeight`
3. **Conservative**: Err toward smaller limits (overflow is fine)

### When Canvas IS Useful

Canvas pagination can still help with **overflow pages** that might themselves overflow:

```typescript
// If overflow page has 50+ features, use Canvas for that page
<CanvasPage template={overflowTemplate}>
    <FeaturesList items={featuresOverflow} />
</CanvasPage>
```

This gives us "best of both worlds":
- Static main pages (simple, predictable)
- Canvas-paginated overflow pages (handles long lists)

---

## 📋 Component Priority for Implementation

### Phase 1: Character Sheet Core (All Static)
1. Character Header (Portrait + Info)
2. Ability Scores Row
3. Inspiration/Proficiency
4. Saving Throws
5. Skills
6. Passive Perception
7. AC/Init/Speed
8. HP Section
9. Hit Dice/Death Saves

### Phase 2: Character Sheet Dynamic
10. Attacks Section
11. Equipment Section
12. Personality/Ideals/Bonds/Flaws
13. Features & Traits
14. Proficiencies
15. Notes

### Phase 3: Spell Sheet
16. Spell Header
17. Spell Slot Tracker
18. Spell Level Blocks (paginated)

### Phase 4: Inventory Sheet
19. Inventory Header
20. Currency/Encumbrance/Attunement
21. Inventory Category Blocks (paginated)
22. Container Blocks
23. Notes

---

## ✅ Resolved Design Decisions

### Q1: Multi-page character sheet strategy?
**DECIDED**: Static Main Page + Overflow Pages
- Page 1 = Static layout with bounded sections
- Page 1.1 = Overflow (only if content exceeds bounds)
- Then Spells, then Spells Overflow, then Inventory, etc.

### Q2: Cross-column flow for overflow?
**DECIDED**: No cross-column flow
- Each bounded section overflows to overflow page
- Overflow pages are simple list containers
- No complex column fitting needed

### Q3: Printable considerations?
**DECIDED**: 
- Static sections ALWAYS stay together on main page
- Dynamic sections show first N items, overflow the rest
- Each page is a complete, printable unit

### Q4: Template variations?
**DECIDED**: Start with split sheets
- Character Main + Character Overflow
- Spells Main + Spells Overflow  
- Inventory Main + Inventory Overflow
- Future: Could add "condensed all-in-one" variant

---

## 🤔 Remaining Questions

1. **LIMIT constants**: How many items fit in each bounded section?
   - Features & Traits: ~8 items? (need to test)
   - Attacks: ~5 items?
   - Equipment: ~12 items?
   - Spells per level: ~8 items?

2. **"See more" indicator**: How to show that content continues?
   - Small "(cont. on next page)" text?
   - "..." at bottom of section?
   - Page number reference?

3. **Overflow page layout**: Single column or multi-column?
   - Single column = simpler, more space
   - Multi-column = matches main page aesthetic

---

## 📊 Component Count Summary

| Page | Static | Dynamic | Total |
|------|--------|---------|-------|
| Character Sheet | 24 | 9 | 33 |
| Spell Sheet | 5 | 10 | 15 |
| Inventory Sheet | 6 | 9 | 15 |
| **TOTAL** | **35** | **28** | **63** |

**Key Insight**: ~56% of components are static and can be rendered without pagination complexity. Focus on these first for rapid progress.

---

**Next Steps**:
1. Review this analysis and confirm component classifications
2. Decide on multi-page/overflow strategy
3. Begin implementing static components using GUIDE-Canvas-Component-Building.md


