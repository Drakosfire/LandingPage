# D\&D 5e SRD Equipment System

## TypeScript Interface Suggestions

To implement the SRD equipment system, we propose defining structured interfaces for weapons, armor, packs, and generic items. These align with patterns used in existing 5e tools (e.g. Foundry VTT’s data model splits armor class into base, Dex bonus flag, etc.[\[1\]](https://github.com/megoth/dnd5e/blob/2ad1957c2ec9f5f3b6061bd16108214dafd4a865/src/ldo/dnd5e.typings.ts#L94-L101), and includes fields for versatile damage and properties on weapons[\[2\]](https://github.com/megoth/dnd5e/blob/2ad1957c2ec9f5f3b6061bd16108214dafd4a865/src/ldo/dnd5e.typings.ts#L1207-L1215)). Below are the suggested interfaces:

// Physical damage types might be an enum: e.g., 'slashing' | 'piercing' | 'bludgeoning'  
type DamageType \= 'slashing' | 'piercing' | 'bludgeoning' | '...';

// Standard weapon property tags in 5e SRD:  
type WeaponProperty \= 'Ammunition' | 'Finesse' | 'Heavy' | 'Light'   
                    | 'Loading' | 'Reach' | 'Special'   
                    | 'Thrown' | 'Two-Handed' | 'Versatile';

interface SRDWeapon {  
    id: string;  
    name: string;  
    category: 'simple' | 'martial';     // Simple or Martial weapon  
    type: 'melee' | 'ranged';          // Melee or Ranged weapon  
    damage: { dice: string; type: DamageType };  // e.g. { dice: "1d8", type: 'slashing' }  
    twoHandedDamage?: { dice: string; type: DamageType };  // For versatile weapons (damage when used two-handed)  
    properties: WeaponProperty\[\];      // e.g. \['Light', 'Finesse'\]  
    range?: { normal: number; long: number };    // For ranged/thrown weapons, e.g. { normal: 20, long: 60 }  
    weight: number;                   // in pounds  
    cost: { amount: number; unit: 'gp' | 'sp' | 'cp' };  
}

interface SRDArmor {  
    id: string;  
    name: string;  
    category: 'light' | 'medium' | 'heavy' | 'shield';  // Armor type  
    baseAC: number;                     // Base AC provided (e.g. 11 for leather, 16 for chain mail, 2 for shield)  
    addDexModifier: boolean;           // If Dexterity modifier is added to AC  
    dexModifierMax?: number;           // Maximum Dex bonus (only for medium armor, e.g. 2\)  
    strengthRequirement?: number;      // Strength score required to avoid speed penalty (for some heavy armor)  
    stealthDisadvantage: boolean;      // True if the armor imposes Disadvantage on Stealth checks\[3\]  
    weight: number;                    // in pounds  
    cost: { amount: number; unit: 'gp' | 'sp' | 'cp' };  
}

interface SRDItem {    
    id: string;  
    name: string;  
    category: string;                  // e.g. 'adventuring gear', 'tool', etc.  
    weight: number;  
    cost: { amount: number; unit: 'gp' | 'sp' | 'cp' };  
    // (Additional fields like description or special properties can be included as needed)  
}

interface SRDEquipmentPack {  
    id: string;  
    name: string;  
    contents: Array\<{ itemId: string; quantity: number }\>;  // References to other items (weapons, armor, or gear) by id  
    cost: { amount: number; unit: 'gp' };  
}

These interfaces separate rule-specific data for ease of use in character creation. For example, an armor’s baseAC and Dex allowance (addDexModifier/dexModifierMax) let the system calculate total AC, while stealthDisadvantage and strengthRequirement indicate any movement or stealth penalties. Weapon interfaces include damage, optional versatile damage, and property tags for rule logic (like handling **Thrown** range or **Finesse** ability modifiers). Equipment packs are essentially collections of item references with a total cost, streamlining starting equipment selection.

## Equipment Packs (SRD)

In D\&D 5e (SRD), several standard equipment packs bundle common adventuring gear. These packs are available at character creation (often granted by class/background or purchasable outright)[\[4\]](https://5thsrd.org/adventuring/equipment/equipment_packs/#:~:text=The%20starting%20equipment%20you%20get,than%20buying%20the%20items%20individually). The table below lists each SRD pack, its cost, and its contents:

| Pack Name | Cost | Contents |
| :---- | ----: | :---- |
| **Burglar’s Pack** | 16 gp | Backpack; bag of 1,000 ball bearings; 10 feet of string; bell; 5 candles; crowbar; hammer; 10 pitons; hooded lantern; 2 flasks of oil; 5 days of rations; tinderbox; waterskin; **\+** 50 feet of hempen rope (strapped to the side)[\[5\]](https://5thsrd.org/adventuring/equipment/equipment_packs/#:~:text=Burglar%27s%20Pack%20%2816%20gp%29,to%20the%20side%20of%20it). |
| **Diplomat’s Pack** | 39 gp | Chest; 2 cases for maps and scrolls; set of fine clothes; bottle of ink; ink pen; lamp; 2 flasks of oil; 5 sheets of paper; vial of perfume; sealing wax; soap[\[6\]](https://5thsrd.org/adventuring/equipment/equipment_packs/#:~:text=Diplomat%27s%20Pack%20%2839%20gp%29,perfume%2C%20sealing%20wax%2C%20and%20soap). |
| **Dungeoneer’s Pack** | 12 gp | Backpack; crowbar; hammer; 10 pitons; 10 torches; tinderbox; 10 days of rations; waterskin; **\+** 50 feet of hempen rope (strapped to the side)[\[7\]](https://5thsrd.org/adventuring/equipment/equipment_packs/#:~:text=Dungeoneer%27s%20Pack%20%2812%20gp%29,to%20the%20side%20of%20it). |
| **Entertainer’s Pack** | 40 gp | Backpack; bedroll; 2 costumes; 5 candles; 5 days of rations; waterskin; **\+** disguise kit[\[8\]](https://5thsrd.org/adventuring/equipment/equipment_packs/#:~:text=Entertainer%27s%20Pack%20%2840%20gp%29,waterskin%2C%20and%20a%20disguise%20kit). |
| **Explorer’s Pack** | 10 gp | Backpack; bedroll; mess kit; tinderbox; 10 torches; 10 days of rations; waterskin; **\+** 50 feet of hempen rope (strapped to the side)[\[9\]](https://5thsrd.org/adventuring/equipment/equipment_packs/#:~:text=candles%2C%205%20days%20of%20rations%2C,waterskin%2C%20and%20a%20disguise%20kit). |
| **Priest’s Pack** | 19 gp | Backpack; blanket; 10 candles; tinderbox; alms box; 2 blocks of incense; censer; vestments; 2 days of rations; waterskin[\[10\]](https://5thsrd.org/adventuring/equipment/equipment_packs/#:~:text=Priest%27s%20Pack%20%2819%20gp%29,of%20rations%2C%20and%20a%20waterskin). |
| **Scholar’s Pack** | 40 gp | Backpack; book of lore; bottle of ink; ink pen; 10 sheets of parchment; little bag of sand; small knife[\[11\]](https://5thsrd.org/adventuring/equipment/equipment_packs/#:~:text=Scholar%27s%20Pack%20%2840%20gp%29,sand%2C%20and%20a%20small%20knife). |

Each pack’s contents are a fixed list of items (with quantities) that come at a bundled price. Buying a pack is often cheaper than purchasing items individually[\[4\]](https://5thsrd.org/adventuring/equipment/equipment_packs/#:~:text=The%20starting%20equipment%20you%20get,than%20buying%20the%20items%20individually). For implementation, the contents field of the SRDEquipmentPack interface would list item IDs and quantities corresponding to these entries.

## Weapon Properties Reference

Weapons in 5e have various properties that affect how they are used. Below is a reference of standard SRD weapon properties and their rules[\[12\]](https://www.dandwiki.com/wiki/5e_SRD:Weapon_Properties#:~:text=Finesse,same%20modifier%20for%20both%20rolls)[\[13\]](https://www.dandwiki.com/wiki/5e_SRD:Weapon_Properties#:~:text=Thrown,dagger%20has%20the%20finesse%20property):

* **Ammunition:** Requires appropriate ammo to make a ranged attack. Firing expends one piece of ammo, and recovering half of expended ammunition after battle is possible with a minute of searching. If used to make a melee attack, the weapon counts as an improvised weapon[\[14\]](https://www.dandwiki.com/wiki/5e_SRD:Weapon_Properties#:~:text=Ammunition,minute%20to%20search%20the%20battlefield). *(E.g. bows, crossbows have this property along with a specified range.)*

* **Finesse:** You can use either Strength or Dexterity for the attack and damage rolls (whichever is higher) when using this weapon. You must use the same ability for both rolls[\[15\]](https://www.dandwiki.com/wiki/5e_SRD:Weapon_Properties#:~:text=Finesse,same%20modifier%20for%20both%20rolls). *(E.g. daggers, rapiers are finesse weapons.)*

* **Heavy:** Small creatures have disadvantage on attack rolls with heavy weapons, due to the weapon’s size and bulk[\[16\]](https://www.dandwiki.com/wiki/5e_SRD:Weapon_Properties#:~:text=Heavy,Small%20creature%20to%20use%20effectively). *(E.g. greatsword, heavy crossbow.)*

* **Light:** A light weapon is small and easy to handle, ideal for dual-wielding. It’s required for the Two-Weapon Fighting rule (off-hand weapon must be light)[\[17\]](https://www.dandwiki.com/wiki/5e_SRD:Weapon_Properties#:~:text=Light,when%20fighting%20with%20two%20weapons).

* **Loading:** Because of the time required to load, you can only fire one piece of ammunition from it per action (regardless of Extra Attack). **Loading** weapons cannot be fired multiple times in one turn[\[18\]](https://www.dandwiki.com/wiki/5e_SRD:Weapon_Properties#:~:text=Loading,attacks%20you%20can%20normally%20make). *(E.g. crossbows have this property.)*

* **Range:** Weapons with the ammunition or thrown property list a range in parentheses (normal range / long range in feet). Attacks beyond normal range (up to the long range) have disadvantage, and you cannot attack beyond the long range[\[19\]](https://www.dandwiki.com/wiki/5e_SRD:Weapon_Properties#:~:text=Range,beyond%20the%20weapon%27s%20long%20range). *(E.g. a longbow’s range is 150/600 feet.)*

* **Reach:** This weapon adds 5 feet to your reach for attacks and determining reach for opportunity attacks[\[20\]](https://www.dandwiki.com/wiki/5e_SRD:Weapon_Properties#:~:text=Reach,for%20opportunity%20attacks%20with%20it). *(E.g. whip, halberd, lance.)*

* **Special:** The weapon has unique rules explained in its description. **Special** weapons in the SRD include the net (which restrains targets) and lance (with mounted use rules)[\[21\]](https://www.dandwiki.com/wiki/5e_SRD:Weapon_Properties#:~:text=when%20determining%20your%20reach%20for,opportunity%20attacks%20with%20it).

* **Thrown:** You can throw this weapon to make a ranged attack. If it’s a melee weapon, use the same ability modifier for the attack and damage as you would in melee. *Example:* throwing a handaxe uses Strength; throwing a dagger (which is finesse) can use Strength or Dexterity[\[13\]](https://www.dandwiki.com/wiki/5e_SRD:Weapon_Properties#:~:text=Thrown,dagger%20has%20the%20finesse%20property). Thrown weapons list a range (see **Range** above).

* **Two-Handed:** Requires two hands to attack with this weapon[\[22\]](https://www.dandwiki.com/wiki/5e_SRD:Weapon_Properties#:~:text=Two,when%20you%20attack%20with%20it). *(You need a free two-handed grip to use it, e.g. greatswords.)*

* **Versatile:** Can be used one-handed or two-handed. The damage die in parentheses is used when wielding two-handed[\[23\]](https://www.dandwiki.com/wiki/5e_SRD:Weapon_Properties#:~:text=Versatile,to%20make%20a%20melee%20attack). *(E.g. a longsword does 1d8 one-handed, or 1d10 two-handed.)*

**Note:** Some weapons have multiple properties (e.g. a **Longbow** is a heavy, two-handed weapon with the ammunition property and a range). These properties are encoded in the properties: WeaponProperty\[\] field of our SRDWeapon interface, so game logic can check for them (for instance, apply disadvantage on Stealth if a heavy weapon is wielded by a Small creature, handle choice of ability for finesse weapons, etc.).

## Armor and Shields

Armor provides a base Armor Class (AC) and may impose certain requirements or penalties. The tables below summarize the standard SRD armors, their costs, AC values, Strength requirements, Stealth disadvantages, and weight[\[24\]](https://5thsrd.org/adventuring/equipment/armor/#:~:text=Light%20Armor%20Cost%20Armor%20Class,13%20lb)[\[3\]](https://5thsrd.org/adventuring/equipment/armor/#:~:text=Heavy%20Armor%20Cost%20Armor%20Class,Str%2015%20Disadvantage%2065%20lb). Shields are included separately, as they function as a one-handed defensive item rather than worn armor.

#### *Light Armor*

Light armors allow agile characters to add **full Dexterity modifier** to AC. They do not have a Dex cap, but offer lower base protection.

| Armor | Cost | AC (Armor Class) | Strength | Stealth | Weight |
| :---- | ----: | :---- | ----: | ----: | ----: |
| *Padded* | 5 gp | 11 \+ Dex modifier | — | Disadvantage | 8 lb. |
| *Leather* | 10 gp | 11 \+ Dex modifier | — | — | 10 lb. |
| *Studded Leather* | 45 gp | 12 \+ Dex modifier | — | — | 13 lb. |

#### *Medium Armor*

Medium armors provide higher base AC but limit Dexterity bonus to **\+2**. They often weigh more; some types impose **Stealth disadvantage**.

| Armor | Cost | AC (Armor Class) | Strength | Stealth | Weight |
| :---- | ----: | :---- | ----: | ----: | ----: |
| *Hide* | 10 gp | 12 \+ Dex modifier (max 2\) | — | — | 12 lb. |
| *Chain Shirt* | 50 gp | 13 \+ Dex modifier (max 2\) | — | — | 20 lb. |
| *Scale Mail* | 50 gp | 14 \+ Dex modifier (max 2\) | — | Disadvantage | 45 lb. |
| *Breastplate* | 400 gp | 14 \+ Dex modifier (max 2\) | — | — | 20 lb. |
| *Half Plate* | 750 gp | 15 \+ Dex modifier (max 2\) | — | Disadvantage | 40 lb. |

#### *Heavy Armor*

Heavy armors have a fixed AC (no Dex bonus is applied, but also no penalty for negative Dex). They provide the highest protection but are very heavy. **Strength Requirement**: If the wearer’s Strength is below the listed score, speed is reduced by 10 feet[\[25\]](https://5thsrd.org/adventuring/equipment/armor/#:~:text=Heavy%20Armor,higher%20than%20the%20listed%20score). Heavy armor always gives **Stealth disadvantage** due to bulk[\[3\]](https://5thsrd.org/adventuring/equipment/armor/#:~:text=Heavy%20Armor%20Cost%20Armor%20Class,Str%2015%20Disadvantage%2065%20lb).

| Armor | Cost | AC (Armor Class) | Strength | Stealth | Weight |
| :---- | ----: | :---- | ----: | ----: | ----: |
| *Ring Mail* | 30 gp | 14 (fixed) | — | Disadvantage | 40 lb. |
| *Chain Mail* | 75 gp | 16 (fixed) | Str 13 | Disadvantage | 55 lb. |
| *Splint* | 200 gp | 17 (fixed) | Str 15 | Disadvantage | 60 lb. |
| *Plate* | 1,500 gp | 18 (fixed) | Str 15 | Disadvantage | 65 lb. |

#### *Shields*

A shield is not body armor but can be carried in one hand to **add \+2** to Armor Class. Only one shield bonus can apply at a time[\[26\]](https://5thsrd.org/adventuring/equipment/armor/#:~:text=Shields,one%20shield%20at%20a%20time).

| Shield | Cost | AC Bonus | Strength | Stealth | Weight |
| :---- | ----: | ----: | ----: | ----: | ----: |
| *Shield* | 10 gp | \+2 | — | — | 6 lb. |

**Donning and Doffing Armor:** Putting on or removing armor takes time (important for gameplay considerations). According to the SRD, donning and doffing times are as follows[\[27\]](https://5thsrd.org/adventuring/equipment/armor/#:~:text=Category%20Don%20Doff%20Light%20Armor,Shield%201%20action%201%20action):

* **Light Armor:** 1 minute to don, 1 minute to doff.

* **Medium Armor:** 5 minutes to don, 1 minute to doff.

* **Heavy Armor:** 10 minutes to don, 5 minutes to doff.

* **Shield:** 1 action to don or doff (approximately 6 seconds in combat).

These times assume no assistance; with help, removal can be twice as fast (half the time)[\[28\]](https://5thsrd.org/adventuring/equipment/armor/#:~:text=Don,don%20the%20suit%20of%20armor). In terms of data, armor items could include a category field (light/medium/heavy/shield) so that the application can apply the correct don/doff durations and rules as needed.

## Starting Gold by Class (Alternate Starting Wealth)

Instead of taking the preset starting equipment, players may roll for starting gold based on their class, then buy equipment freely. The **Starting Wealth by Class** table from the SRD/PHB gives the random gold for each base class[\[29\]](https://www.norsefoundry.com/blogs/game-systems/starting-gold-or-adventure-package-what-should-i-do?srsltid=AfmBOopxRuCZg51Qgrl1fglbOsHotehVNIRggvjTmeaPkTvetUeDU7JP#:~:text=Barbarian)[\[30\]](https://www.norsefoundry.com/blogs/game-systems/starting-gold-or-adventure-package-what-should-i-do?srsltid=AfmBOopxRuCZg51Qgrl1fglbOsHotehVNIRggvjTmeaPkTvetUeDU7JP#:~:text=Rogue):

| Class | Starting Gold (random) |
| :---- | :---- |
| Barbarian | 2d4 × 10 gp[\[31\]](https://www.norsefoundry.com/blogs/game-systems/starting-gold-or-adventure-package-what-should-i-do?srsltid=AfmBOopxRuCZg51Qgrl1fglbOsHotehVNIRggvjTmeaPkTvetUeDU7JP#:~:text=Barbarian) |
| Bard | 5d4 × 10 gp[\[32\]](https://www.norsefoundry.com/blogs/game-systems/starting-gold-or-adventure-package-what-should-i-do?srsltid=AfmBOopxRuCZg51Qgrl1fglbOsHotehVNIRggvjTmeaPkTvetUeDU7JP#:~:text=Bard) |
| Cleric | 5d4 × 10 gp[\[33\]](https://www.norsefoundry.com/blogs/game-systems/starting-gold-or-adventure-package-what-should-i-do?srsltid=AfmBOopxRuCZg51Qgrl1fglbOsHotehVNIRggvjTmeaPkTvetUeDU7JP#:~:text=5d4%20%C3%97%2010%20gp) |
| Druid | 2d4 × 10 gp[\[34\]](https://www.norsefoundry.com/blogs/game-systems/starting-gold-or-adventure-package-what-should-i-do?srsltid=AfmBOopxRuCZg51Qgrl1fglbOsHotehVNIRggvjTmeaPkTvetUeDU7JP#:~:text=5d4%20%C3%97%2010%20gp) |
| Fighter | 5d4 × 10 gp[\[35\]](https://www.norsefoundry.com/blogs/game-systems/starting-gold-or-adventure-package-what-should-i-do?srsltid=AfmBOopxRuCZg51Qgrl1fglbOsHotehVNIRggvjTmeaPkTvetUeDU7JP#:~:text=Fighter) |
| Monk | 5d4 gp[\[36\]](https://www.norsefoundry.com/blogs/game-systems/starting-gold-or-adventure-package-what-should-i-do?srsltid=AfmBOopxRuCZg51Qgrl1fglbOsHotehVNIRggvjTmeaPkTvetUeDU7JP#:~:text=5d4%20%C3%97%2010%20gp) |
| Paladin | 5d4 × 10 gp[\[37\]](https://www.norsefoundry.com/blogs/game-systems/starting-gold-or-adventure-package-what-should-i-do?srsltid=AfmBOopxRuCZg51Qgrl1fglbOsHotehVNIRggvjTmeaPkTvetUeDU7JP#:~:text=5d4%20gp) |
| Ranger | 5d4 × 10 gp[\[38\]](https://www.norsefoundry.com/blogs/game-systems/starting-gold-or-adventure-package-what-should-i-do?srsltid=AfmBOopxRuCZg51Qgrl1fglbOsHotehVNIRggvjTmeaPkTvetUeDU7JP#:~:text=5d4%20%C3%97%2010%20gp) |
| Rogue | 4d4 × 10 gp[\[39\]](https://www.norsefoundry.com/blogs/game-systems/starting-gold-or-adventure-package-what-should-i-do?srsltid=AfmBOopxRuCZg51Qgrl1fglbOsHotehVNIRggvjTmeaPkTvetUeDU7JP#:~:text=Rogue) |
| Sorcerer | 3d4 × 10 gp[\[40\]](https://www.norsefoundry.com/blogs/game-systems/starting-gold-or-adventure-package-what-should-i-do?srsltid=AfmBOopxRuCZg51Qgrl1fglbOsHotehVNIRggvjTmeaPkTvetUeDU7JP#:~:text=Sorcerer) |
| Warlock | 4d4 × 10 gp[\[41\]](https://www.norsefoundry.com/blogs/game-systems/starting-gold-or-adventure-package-what-should-i-do?srsltid=AfmBOopxRuCZg51Qgrl1fglbOsHotehVNIRggvjTmeaPkTvetUeDU7JP#:~:text=Warlock) |
| Wizard | 4d4 × 10 gp[\[42\]](https://www.norsefoundry.com/blogs/game-systems/starting-gold-or-adventure-package-what-should-i-do?srsltid=AfmBOopxRuCZg51Qgrl1fglbOsHotehVNIRggvjTmeaPkTvetUeDU7JP#:~:text=4d4%20%C3%97%2010%20gp) |

This gold is rolled (or averaged) and then used to purchase equipment from the armor, weapons, and gear lists. For instance, a **Monk** starts with a modest 5d4 gp (no ×10, since monks generally have less need for expensive gear)[\[36\]](https://www.norsefoundry.com/blogs/game-systems/starting-gold-or-adventure-package-what-should-i-do?srsltid=AfmBOopxRuCZg51Qgrl1fglbOsHotehVNIRggvjTmeaPkTvetUeDU7JP#:~:text=5d4%20%C3%97%2010%20gp), whereas a **Paladin** or **Fighter** has 5d4 × 10 gp (to reflect the cost of heavy armor or multiple weapons)[\[35\]](https://www.norsefoundry.com/blogs/game-systems/starting-gold-or-adventure-package-what-should-i-do?srsltid=AfmBOopxRuCZg51Qgrl1fglbOsHotehVNIRggvjTmeaPkTvetUeDU7JP#:~:text=Fighter)[\[43\]](https://www.norsefoundry.com/blogs/game-systems/starting-gold-or-adventure-package-what-should-i-do?srsltid=AfmBOopxRuCZg51Qgrl1fglbOsHotehVNIRggvjTmeaPkTvetUeDU7JP#:~:text=5d4%20gp).

In a data model, these values could be stored in a lookup (e.g., a map of class name to dice formula or average gold) for use during character creation. Since this falls under class data rather than equipment data, it might not be part of the equipment interfaces above; however, it’s relevant to the equipment system as an alternative workflow. Each class entry in the system can have an associated startingGold formula, allowing the character creation process to either grant the class’s standard equipment or roll this gold and then select purchases.

**Sources:**

* D\&D 5e System Reference Document (SRD) for equipment packs, weapons, armor, and starting wealth[\[44\]](https://5thsrd.org/adventuring/equipment/equipment_packs/#:~:text=Burglar%27s%20Pack%20%2816%20gp%29,to%20the%20side%20of%20it)[\[12\]](https://www.dandwiki.com/wiki/5e_SRD:Weapon_Properties#:~:text=Finesse,same%20modifier%20for%20both%20rolls)[\[3\]](https://5thsrd.org/adventuring/equipment/armor/#:~:text=Heavy%20Armor%20Cost%20Armor%20Class,Str%2015%20Disadvantage%2065%20lb)[\[29\]](https://www.norsefoundry.com/blogs/game-systems/starting-gold-or-adventure-package-what-should-i-do?srsltid=AfmBOopxRuCZg51Qgrl1fglbOsHotehVNIRggvjTmeaPkTvetUeDU7JP#:~:text=Barbarian). All SRD content is under Creative Commons Attribution 4.0 License.

* Foundry VTT *dnd5e* data structure for reference on implementing item data (open source)[\[2\]](https://github.com/megoth/dnd5e/blob/2ad1957c2ec9f5f3b6061bd16108214dafd4a865/src/ldo/dnd5e.typings.ts#L1207-L1215)[\[1\]](https://github.com/megoth/dnd5e/blob/2ad1957c2ec9f5f3b6061bd16108214dafd4a865/src/ldo/dnd5e.typings.ts#L94-L101).

---

[\[1\]](https://github.com/megoth/dnd5e/blob/2ad1957c2ec9f5f3b6061bd16108214dafd4a865/src/ldo/dnd5e.typings.ts#L94-L101) [\[2\]](https://github.com/megoth/dnd5e/blob/2ad1957c2ec9f5f3b6061bd16108214dafd4a865/src/ldo/dnd5e.typings.ts#L1207-L1215) dnd5e.typings.ts

[https://github.com/megoth/dnd5e/blob/2ad1957c2ec9f5f3b6061bd16108214dafd4a865/src/ldo/dnd5e.typings.ts](https://github.com/megoth/dnd5e/blob/2ad1957c2ec9f5f3b6061bd16108214dafd4a865/src/ldo/dnd5e.typings.ts)

[\[3\]](https://5thsrd.org/adventuring/equipment/armor/#:~:text=Heavy%20Armor%20Cost%20Armor%20Class,Str%2015%20Disadvantage%2065%20lb) [\[24\]](https://5thsrd.org/adventuring/equipment/armor/#:~:text=Light%20Armor%20Cost%20Armor%20Class,13%20lb) [\[25\]](https://5thsrd.org/adventuring/equipment/armor/#:~:text=Heavy%20Armor,higher%20than%20the%20listed%20score) [\[26\]](https://5thsrd.org/adventuring/equipment/armor/#:~:text=Shields,one%20shield%20at%20a%20time) [\[27\]](https://5thsrd.org/adventuring/equipment/armor/#:~:text=Category%20Don%20Doff%20Light%20Armor,Shield%201%20action%201%20action) [\[28\]](https://5thsrd.org/adventuring/equipment/armor/#:~:text=Don,don%20the%20suit%20of%20armor)  Armor \- 5th Edition SRD 

[https://5thsrd.org/adventuring/equipment/armor/](https://5thsrd.org/adventuring/equipment/armor/)

[\[4\]](https://5thsrd.org/adventuring/equipment/equipment_packs/#:~:text=The%20starting%20equipment%20you%20get,than%20buying%20the%20items%20individually) [\[5\]](https://5thsrd.org/adventuring/equipment/equipment_packs/#:~:text=Burglar%27s%20Pack%20%2816%20gp%29,to%20the%20side%20of%20it) [\[6\]](https://5thsrd.org/adventuring/equipment/equipment_packs/#:~:text=Diplomat%27s%20Pack%20%2839%20gp%29,perfume%2C%20sealing%20wax%2C%20and%20soap) [\[7\]](https://5thsrd.org/adventuring/equipment/equipment_packs/#:~:text=Dungeoneer%27s%20Pack%20%2812%20gp%29,to%20the%20side%20of%20it) [\[8\]](https://5thsrd.org/adventuring/equipment/equipment_packs/#:~:text=Entertainer%27s%20Pack%20%2840%20gp%29,waterskin%2C%20and%20a%20disguise%20kit) [\[9\]](https://5thsrd.org/adventuring/equipment/equipment_packs/#:~:text=candles%2C%205%20days%20of%20rations%2C,waterskin%2C%20and%20a%20disguise%20kit) [\[10\]](https://5thsrd.org/adventuring/equipment/equipment_packs/#:~:text=Priest%27s%20Pack%20%2819%20gp%29,of%20rations%2C%20and%20a%20waterskin) [\[11\]](https://5thsrd.org/adventuring/equipment/equipment_packs/#:~:text=Scholar%27s%20Pack%20%2840%20gp%29,sand%2C%20and%20a%20small%20knife) [\[44\]](https://5thsrd.org/adventuring/equipment/equipment_packs/#:~:text=Burglar%27s%20Pack%20%2816%20gp%29,to%20the%20side%20of%20it)  Equipment packs \- 5th Edition SRD 

[https://5thsrd.org/adventuring/equipment/equipment\_packs/](https://5thsrd.org/adventuring/equipment/equipment_packs/)

[\[12\]](https://www.dandwiki.com/wiki/5e_SRD:Weapon_Properties#:~:text=Finesse,same%20modifier%20for%20both%20rolls) [\[13\]](https://www.dandwiki.com/wiki/5e_SRD:Weapon_Properties#:~:text=Thrown,dagger%20has%20the%20finesse%20property) [\[14\]](https://www.dandwiki.com/wiki/5e_SRD:Weapon_Properties#:~:text=Ammunition,minute%20to%20search%20the%20battlefield) [\[15\]](https://www.dandwiki.com/wiki/5e_SRD:Weapon_Properties#:~:text=Finesse,same%20modifier%20for%20both%20rolls) [\[16\]](https://www.dandwiki.com/wiki/5e_SRD:Weapon_Properties#:~:text=Heavy,Small%20creature%20to%20use%20effectively) [\[17\]](https://www.dandwiki.com/wiki/5e_SRD:Weapon_Properties#:~:text=Light,when%20fighting%20with%20two%20weapons) [\[18\]](https://www.dandwiki.com/wiki/5e_SRD:Weapon_Properties#:~:text=Loading,attacks%20you%20can%20normally%20make) [\[19\]](https://www.dandwiki.com/wiki/5e_SRD:Weapon_Properties#:~:text=Range,beyond%20the%20weapon%27s%20long%20range) [\[20\]](https://www.dandwiki.com/wiki/5e_SRD:Weapon_Properties#:~:text=Reach,for%20opportunity%20attacks%20with%20it) [\[21\]](https://www.dandwiki.com/wiki/5e_SRD:Weapon_Properties#:~:text=when%20determining%20your%20reach%20for,opportunity%20attacks%20with%20it) [\[22\]](https://www.dandwiki.com/wiki/5e_SRD:Weapon_Properties#:~:text=Two,when%20you%20attack%20with%20it) [\[23\]](https://www.dandwiki.com/wiki/5e_SRD:Weapon_Properties#:~:text=Versatile,to%20make%20a%20melee%20attack) 5e SRD:Weapon Properties \- D\&D Wiki

[https://www.dandwiki.com/wiki/5e\_SRD:Weapon\_Properties](https://www.dandwiki.com/wiki/5e_SRD:Weapon_Properties)

[\[29\]](https://www.norsefoundry.com/blogs/game-systems/starting-gold-or-adventure-package-what-should-i-do?srsltid=AfmBOopxRuCZg51Qgrl1fglbOsHotehVNIRggvjTmeaPkTvetUeDU7JP#:~:text=Barbarian) [\[30\]](https://www.norsefoundry.com/blogs/game-systems/starting-gold-or-adventure-package-what-should-i-do?srsltid=AfmBOopxRuCZg51Qgrl1fglbOsHotehVNIRggvjTmeaPkTvetUeDU7JP#:~:text=Rogue) [\[31\]](https://www.norsefoundry.com/blogs/game-systems/starting-gold-or-adventure-package-what-should-i-do?srsltid=AfmBOopxRuCZg51Qgrl1fglbOsHotehVNIRggvjTmeaPkTvetUeDU7JP#:~:text=Barbarian) [\[32\]](https://www.norsefoundry.com/blogs/game-systems/starting-gold-or-adventure-package-what-should-i-do?srsltid=AfmBOopxRuCZg51Qgrl1fglbOsHotehVNIRggvjTmeaPkTvetUeDU7JP#:~:text=Bard) [\[33\]](https://www.norsefoundry.com/blogs/game-systems/starting-gold-or-adventure-package-what-should-i-do?srsltid=AfmBOopxRuCZg51Qgrl1fglbOsHotehVNIRggvjTmeaPkTvetUeDU7JP#:~:text=5d4%20%C3%97%2010%20gp) [\[34\]](https://www.norsefoundry.com/blogs/game-systems/starting-gold-or-adventure-package-what-should-i-do?srsltid=AfmBOopxRuCZg51Qgrl1fglbOsHotehVNIRggvjTmeaPkTvetUeDU7JP#:~:text=5d4%20%C3%97%2010%20gp) [\[35\]](https://www.norsefoundry.com/blogs/game-systems/starting-gold-or-adventure-package-what-should-i-do?srsltid=AfmBOopxRuCZg51Qgrl1fglbOsHotehVNIRggvjTmeaPkTvetUeDU7JP#:~:text=Fighter) [\[36\]](https://www.norsefoundry.com/blogs/game-systems/starting-gold-or-adventure-package-what-should-i-do?srsltid=AfmBOopxRuCZg51Qgrl1fglbOsHotehVNIRggvjTmeaPkTvetUeDU7JP#:~:text=5d4%20%C3%97%2010%20gp) [\[37\]](https://www.norsefoundry.com/blogs/game-systems/starting-gold-or-adventure-package-what-should-i-do?srsltid=AfmBOopxRuCZg51Qgrl1fglbOsHotehVNIRggvjTmeaPkTvetUeDU7JP#:~:text=5d4%20gp) [\[38\]](https://www.norsefoundry.com/blogs/game-systems/starting-gold-or-adventure-package-what-should-i-do?srsltid=AfmBOopxRuCZg51Qgrl1fglbOsHotehVNIRggvjTmeaPkTvetUeDU7JP#:~:text=5d4%20%C3%97%2010%20gp) [\[39\]](https://www.norsefoundry.com/blogs/game-systems/starting-gold-or-adventure-package-what-should-i-do?srsltid=AfmBOopxRuCZg51Qgrl1fglbOsHotehVNIRggvjTmeaPkTvetUeDU7JP#:~:text=Rogue) [\[40\]](https://www.norsefoundry.com/blogs/game-systems/starting-gold-or-adventure-package-what-should-i-do?srsltid=AfmBOopxRuCZg51Qgrl1fglbOsHotehVNIRggvjTmeaPkTvetUeDU7JP#:~:text=Sorcerer) [\[41\]](https://www.norsefoundry.com/blogs/game-systems/starting-gold-or-adventure-package-what-should-i-do?srsltid=AfmBOopxRuCZg51Qgrl1fglbOsHotehVNIRggvjTmeaPkTvetUeDU7JP#:~:text=Warlock) [\[42\]](https://www.norsefoundry.com/blogs/game-systems/starting-gold-or-adventure-package-what-should-i-do?srsltid=AfmBOopxRuCZg51Qgrl1fglbOsHotehVNIRggvjTmeaPkTvetUeDU7JP#:~:text=4d4%20%C3%97%2010%20gp) [\[43\]](https://www.norsefoundry.com/blogs/game-systems/starting-gold-or-adventure-package-what-should-i-do?srsltid=AfmBOopxRuCZg51Qgrl1fglbOsHotehVNIRggvjTmeaPkTvetUeDU7JP#:~:text=5d4%20gp) Starting Gold or Adventure Package: What should I do? – Norse Foundry 

[https://www.norsefoundry.com/blogs/game-systems/starting-gold-or-adventure-package-what-should-i-do?srsltid=AfmBOopxRuCZg51Qgrl1fglbOsHotehVNIRggvjTmeaPkTvetUeDU7JP](https://www.norsefoundry.com/blogs/game-systems/starting-gold-or-adventure-package-what-should-i-do?srsltid=AfmBOopxRuCZg51Qgrl1fglbOsHotehVNIRggvjTmeaPkTvetUeDU7JP)