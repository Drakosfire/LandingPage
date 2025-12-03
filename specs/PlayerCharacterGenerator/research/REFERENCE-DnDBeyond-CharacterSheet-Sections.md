# D&D Beyond Character Sheet Reference

**Purpose**: Document the D&D Beyond character sheet layout for comparison  
**Source**: `drakosfire_120943402.pdf` (Aarakocra Sorcerer - Joe)  
**Task**: T069

---

## 1. Observed Sections (from PDF)

### Page 1: Core Character Sheet

| Section | Contents |
|---------|----------|
| **Senses** | Passive Perception (10), Passive Insight (10), Passive Investigation (11) |
| **Attacks** | Table: Name, Hit, Damage/Type, Notes |
| **Features & Traits** | Class features (Sorcerer), Species traits (Aarakocra) |

### Page 2: Character Details

| Section | Contents |
|---------|----------|
| **Header** | DungeonMind branding, Character Name |
| **Character Info** | Gender, Age, Alignment, Faith, Sex, Height, Weight, Eyes, Hair |
| **Personality** | Traits, Ideals, Bonds, Flaws |
| **Appearance** | Character appearance description |
| **Allies & Organizations** | Organization affiliations |

### Page 3+: Spells

| Section | Contents |
|---------|----------|
| **Spell Table** | Prep, Spell Name, Source, Save/ATK, Time, Range, Comp, Duration, Notes |

---

## 2. Example Character Data

**Character**: Joe (Aarakocra Sorcerer Level 1)

### Senses
```
Passive Perception: 10
Passive Insight: 10
Passive Investigation: 11
```

### Attacks
| Name | Hit | Damage/Type | Notes |
|------|-----|-------------|-------|
| Unarmed Strike | +1 | 0 Bludgeoning | |
| Talons | +1 | 1d4-1 Slashing | |

### Features & Traits

**Sorcerer Features (PHB 100-102):**
- Hit Points
- Proficiencies
- Spellcasting (CHA, DC 12, +4 attack, arcane focus)
- Sorcerous Origin → Draconic Bloodline
- Dragon Ancestor (speak Draconic, 2x prof on CHA checks with dragons)
- Draconic Resilience (+1 HP, AC 15 when unarmored)

**Aarakocra Species Traits (EE):**
- DEX +2, WIS +1
- Speed: Walking, Flying 50 ft (no medium/heavy armor)
- Talons: 1d4-1 slashing unarmed strike

---

## 3. Section Mapping to Our Components

| D&D Beyond Section | Our Component | Notes |
|--------------------|---------------|-------|
| Senses | `CombatStatsBlock` | Add passive scores |
| Attacks | `EquipmentBlock` | Weapon attacks table |
| Features & Traits | `FeaturesBlock` | Collapsible class/race features |
| Personality | **NEW: `PersonalityBlock`** | Traits, Ideals, Bonds, Flaws |
| Character Appearance | **NEW: `AppearanceBlock`** | Physical description |
| Spell Table | `SpellcastingBlock` | Enhance with full spell table |

---

## 4. Missing Components (Need to Create)

### T073 Expansion

1. **PersonalityBlock.tsx**
   - Personality Traits
   - Ideals
   - Bonds
   - Flaws

2. **AppearanceBlock.tsx**
   - Physical description
   - Portrait image slot

3. **OrganizationsBlock.tsx** (optional, later phase)
   - Allies & Organizations

4. **PassiveSensesBlock.tsx** (or integrate into CombatStatsBlock)
   - Passive Perception
   - Passive Insight  
   - Passive Investigation

---

## 5. Layout Differences: D&D Beyond vs PHB Style

| Aspect | D&D Beyond | PHB Style (Our Target) |
|--------|------------|------------------------|
| **Layout** | Clean digital | Parchment texture |
| **Fonts** | Modern sans-serif | BookInsanity, ScalySans |
| **Colors** | Blue/white theme | Red/brown/parchment |
| **Borders** | Minimal | Ornate D&D borders |
| **Pages** | Continuous scroll | Fixed page breaks |

---

## 6. Recommended PC Sheet Page Layout

### Page 1: Character Summary
- Header (Name, Class, Level, Race)
- Ability Scores (6-box layout)
- Combat Stats (HP, AC, Init, Speed)
- Saving Throws (6 with proficiency)
- Skills (18 with proficiency)
- Passive Senses

### Page 2: Features & Equipment
- Features & Traits (Class, Race, Background)
- Equipment (Weapons, Armor, Gear)
- Proficiencies (Languages, Tools, Armor, Weapons)

### Page 3: Spellcasting (if caster)
- Spellcasting Info (Ability, DC, Attack)
- Cantrips
- Spell Slots by Level
- Prepared/Known Spells

### Page 4: Background (optional)
- Personality Traits
- Ideals, Bonds, Flaws
- Backstory
- Organizations

---

## 7. Data Model Gaps

Based on D&D Beyond sections, we may need to add to `DnD5eCharacter`:

```typescript
interface DnD5eCharacter {
    // Existing...
    
    // Add for personality/backstory:
    personalityTraits?: string[];
    ideals?: string;
    bonds?: string;
    flaws?: string;
    backstory?: string;
    
    // Add for appearance:
    appearance?: {
        age?: string;
        height?: string;
        weight?: string;
        eyes?: string;
        hair?: string;
        skin?: string;
        description?: string;
    };
    
    // Add for organizations:
    organizations?: Array<{
        name: string;
        description?: string;
    }>;
}
```

---

**Next**: Create visual mockup of target PHB-style layout before implementing T070-T074.

