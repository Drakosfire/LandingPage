# PlayerCharacterGenerator Manual Test Checklist

**Date:** 2025-12-02  
**URL:** http://localhost:3000/charactergenerator  
**Purpose:** Systematically exercise each step of character creation to identify issues

---

## Pre-Test Setup

- [ ] Dev server running (`npm start`)
- [ ] Browser console open (F12)
- [ ] Clear localStorage for clean state: `localStorage.removeItem('charactergen_wizard_step')`

---

## Step 0: Initial Load

### Page Load
- [ ] Page loads without console errors
- [ ] UnifiedHeader displays correctly
- [ ] App icon/title visible
- [ ] Creation drawer button visible (or auto-opens)
- [ ] Canvas area visible (even if empty)

### Console Check
- [ ] No "Cannot read property" errors
- [ ] No "undefined" errors
- [ ] Note any warnings: _______________

**Issues Found:**
```
(paste any errors here)
```

---

## Step 1: Ability Scores

### Navigation
- [ ] Step 1 is active in stepper
- [ ] "Abilities" label visible
- [ ] Previous button disabled (first step)
- [ ] Next button enabled

### Point Buy Method
- [ ] Point Buy tab/option available
- [ ] Starting points displayed (27)
- [ ] All 6 abilities show default value (8)
- [ ] Can increase STR
- [ ] Can decrease STR
- [ ] Points remaining updates correctly
- [ ] Cannot go below 8
- [ ] Cannot go above 15
- [ ] Cost increases correctly (13+ costs 2 points)

### Standard Array Method
- [ ] Standard Array tab/option available
- [ ] Values shown: 15, 14, 13, 12, 10, 8
- [ ] Can assign values to abilities
- [ ] Each value can only be used once
- [ ] All abilities get assigned

### Roll Method
- [ ] Roll option available
- [ ] Roll button works
- [ ] 6 values generated
- [ ] Values in reasonable range (3-18)
- [ ] Can assign rolled values to abilities

### Validation
- [ ] Cannot proceed with incomplete assignments
- [ ] Error message shows if validation fails

**Issues Found:**
```

```

---

## Step 2: Race Selection

### Navigation
- [ ] Can navigate from Step 1 → Step 2
- [ ] Step 2 is active in stepper
- [ ] "Race" label visible
- [ ] Previous button works (goes to Step 1)

### Race List
- [ ] Races displayed as scrollable list
- [ ] Human visible
- [ ] Dwarf visible (with subraces)
- [ ] Elf visible (with subraces)
- [ ] Halfling visible (with subraces)
- [ ] Dragonborn visible
- [ ] Gnome visible (with subraces)
- [ ] Half-Elf visible
- [ ] Half-Orc visible
- [ ] Tiefling visible

### Race Selection (No Subraces)
- [ ] Click Human → Human selected
- [ ] Selection indicator shows
- [ ] Ability bonuses displayed (+1 to all)
- [ ] Traits collapsible/expandable
- [ ] Selection summary shows at bottom

### Race Selection (With Subraces)
- [ ] Click Dwarf → Expands to show subraces
- [ ] Hill Dwarf option visible
- [ ] Mountain Dwarf option visible
- [ ] Select Hill Dwarf → Hill Dwarf selected
- [ ] Bonuses show correctly (+2 CON, +1 WIS)

### Half-Elf Flexible Bonuses
- [ ] Select Half-Elf
- [ ] +2 CHA shown as fixed
- [ ] Flexible bonus selector appears
- [ ] Can select 2 additional abilities
- [ ] Cannot select Charisma (excluded)
- [ ] Cannot select more than 2
- [ ] Validation shows if not enough selected

### Validation
- [ ] Cannot proceed without race selected
- [ ] Error shows if subrace required but not selected

**Issues Found:**
```

```

---

## Step 3: Class Selection

### Navigation
- [ ] Can navigate from Step 2 → Step 3
- [ ] Step 3 is active in stepper
- [ ] "Class" label visible

### Class List
- [ ] 12 classes displayed
- [ ] Barbarian, Bard, Cleric, Druid visible
- [ ] Fighter, Monk, Paladin, Ranger visible
- [ ] Rogue, Sorcerer, Warlock, Wizard visible

### Class Selection (No L1 Subclass)
- [ ] Select Fighter
- [ ] Fighter highlighted/selected
- [ ] Hit Die shown (d10)
- [ ] Saving throws shown (STR, CON)
- [ ] Proficiencies shown (all armor, shields, all weapons)
- [ ] Features collapsible

### Skills Section
- [ ] Skill selector appears for Fighter
- [ ] Shows "Choose 2" (or correct count)
- [ ] Available skills listed
- [ ] Can select skills
- [ ] Cannot select more than allowed
- [ ] Selected count updates

### Equipment Section
- [ ] Equipment choices appear
- [ ] Radio buttons for each choice group
- [ ] Can select one option per group
- [ ] Selected equipment shown

### L1 Subclass (Cleric/Sorcerer/Warlock)
- [ ] Select Cleric
- [ ] Subclass selector appears immediately
- [ ] Life Domain visible
- [ ] Select Life Domain
- [ ] Domain features shown
- [ ] Bonus spells mentioned

### Spellcaster Notice
- [ ] Select Wizard
- [ ] "Spellcaster" badge visible
- [ ] Notice about spell selection in next step

### Validation
- [ ] Cannot proceed without class selected
- [ ] Cleric without subclass shows error
- [ ] Skills not selected shows warning/error

**Issues Found:**
```

```

---

## Step 4: Spell Selection (Casters Only)

### Skip Logic (Non-Caster)
- [ ] With Fighter selected, Step 4 skips automatically
- [ ] Goes directly to Step 5 (Background)
- [ ] Going back from Step 5 goes to Step 3

### Navigation (Caster)
- [ ] With Wizard selected, Step 4 accessible
- [ ] Step 4 is active in stepper
- [ ] "Spells" label visible

### Spellcasting Info
- [ ] Spellcasting ability shown (INT for Wizard)
- [ ] Spell Save DC calculated
- [ ] Spell Attack Bonus calculated

### Cantrip Selection
- [ ] Cantrips tab visible
- [ ] Available cantrips listed (Fire Bolt, Light, etc.)
- [ ] Can select cantrips
- [ ] Count shown (X/3 for Wizard)
- [ ] Cannot select more than allowed
- [ ] School badges visible (Evocation, etc.)

### Spell Selection
- [ ] Spells tab visible
- [ ] 1st level spells listed
- [ ] Can select spells
- [ ] Count shown correctly
- [ ] Spell details expandable

### Validation
- [ ] Warning if not enough cantrips selected
- [ ] Warning if not enough spells selected

**Issues Found:**
```

```

---

## Step 5: Background Selection

### Navigation
- [ ] Can navigate to Step 5
- [ ] Step 5 is active in stepper
- [ ] "Background" label visible

### Background List
- [ ] 6 backgrounds displayed
- [ ] Acolyte visible
- [ ] Criminal visible
- [ ] Folk Hero visible
- [ ] Noble visible
- [ ] Sage visible
- [ ] Soldier visible

### Background Selection
- [ ] Click Soldier → Soldier selected
- [ ] Skills shown (Athletics, Intimidation)
- [ ] Tools shown (Gaming set, Land vehicles)
- [ ] Feature expandable
- [ ] "Military Rank" feature description

### Skill Overlap Detection
- [ ] Select Fighter (Step 3) with Athletics
- [ ] Select Soldier (Step 5)
- [ ] Skill overlap warning appears
- [ ] Replacement skill selector shown
- [ ] Can select replacement skill

### Validation
- [ ] Cannot proceed without background selected

**Issues Found:**
```

```

---

## Step 6: Equipment Summary

### Navigation
- [ ] Can navigate to Step 6
- [ ] Step 6 is active in stepper
- [ ] "Equipment" label visible

### Equipment Display
- [ ] Weapons section shows selected weapons
- [ ] Armor section shows selected armor
- [ ] Gear section shows other equipment
- [ ] Background equipment included
- [ ] Source badges (Class/Background)

### Starting Gold
- [ ] Starting gold displayed or note about it

**Issues Found:**
```

```

---

## Step 7: Review & Finalize

### Navigation
- [ ] Can navigate to Step 7
- [ ] Step 7 is active in stepper
- [ ] "Review" label visible
- [ ] "Finish" button visible (not "Next")

### Character Name
- [ ] Name input field visible
- [ ] Can enter name
- [ ] Name persists

### Character Summary
- [ ] Race displayed correctly
- [ ] Class displayed correctly
- [ ] Subclass displayed (if applicable)
- [ ] Background displayed correctly

### Ability Scores
- [ ] All 6 scores shown
- [ ] Modifiers calculated correctly
- [ ] Racial bonuses applied

### Combat Stats
- [ ] HP calculated (hit die + CON mod)
- [ ] AC shown (10 + DEX or based on armor)
- [ ] Initiative shown
- [ ] Speed shown
- [ ] Proficiency bonus (+2)

### Proficiencies
- [ ] Skills listed
- [ ] Saving throws listed
- [ ] Languages listed

### Spellcasting (if caster)
- [ ] Spell Save DC shown
- [ ] Spell Attack shown
- [ ] Cantrips listed
- [ ] Known/Prepared spells listed

### Validation Status
- [ ] Green "Ready to finalize" if complete
- [ ] Red errors listed if incomplete
- [ ] All errors clickable/actionable

### Finish Button
- [ ] Finish button clickable when valid
- [ ] Finish button disabled/warning when invalid

**Issues Found:**
```

```

---

## Cross-Step Tests

### State Persistence
- [ ] Refresh page → Returns to last step
- [ ] Data persists after refresh
- [ ] Can navigate back and forth without losing data

### Changing Selections
- [ ] Change race → Clears flexible bonuses
- [ ] Change class → Clears skills/equipment
- [ ] Change to non-caster → Clears spells

### Canvas Preview
- [ ] Canvas updates as data changes
- [ ] Character name shows on canvas
- [ ] Stats reflect current selections

---

## Summary

### Blocking Issues (Must Fix)
1. 
2. 
3. 

### High Priority Issues
1. 
2. 
3. 

### Low Priority / Polish
1. 
2. 
3. 

### Notes
```

```

---

**Tested By:** _______________  
**Date Completed:** _______________

