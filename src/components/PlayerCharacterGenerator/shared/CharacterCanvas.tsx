/**
 * CharacterCanvas Component
 * 
 * Canvas-based character sheet display for CharacterGenerator.
 * Uses the new PHB-styled sheetComponents built from HTML prototypes.
 * 
 * @module PlayerCharacterGenerator/shared/CharacterCanvas
 */

import React, { useMemo } from 'react';
import { usePlayerCharacterGenerator } from '../PlayerCharacterGeneratorProvider';

// Import the new PHB-styled sheet components
// CSS is imported via CharacterSheetPage component
import {
    CharacterSheet,
    CharacterSheetPage,
    CharacterSheetContainer,
    BackgroundPersonalitySheet,
    InventorySheet,
    type Attack,
    type Feature
} from '../sheetComponents';

const CharacterCanvas: React.FC = () => {
    const { character } = usePlayerCharacterGenerator();

    const canvasContent = useMemo(() => {
        const dnd5e = character?.dnd5eData;
        const hasCharacter = character?.name && character.name.trim().length > 0;
        const hasAbilityScores = dnd5e?.abilityScores &&
            Object.values(dnd5e.abilityScores).some(v => v > 0);

        if (hasCharacter && hasAbilityScores && dnd5e) {
            // Build class and level string
            const classAndLevel = dnd5e.classes?.length > 0
                ? dnd5e.classes.map(c => `${c.name} ${c.level}`).join(' / ')
                : 'Unknown';

            // Build attacks array from weapons
            const attacks: Attack[] = (dnd5e.weapons || []).map(weapon => {
                const strMod = Math.floor(((dnd5e.abilityScores?.strength ?? 10) - 10) / 2);
                const dexMod = Math.floor(((dnd5e.abilityScores?.dexterity ?? 10) - 10) / 2);
                const profBonus = dnd5e.derivedStats?.proficiencyBonus ?? 2;

                // Use DEX for finesse/ranged, STR otherwise
                const isFinesse = weapon.properties?.includes('finesse');
                const isRanged = weapon.weaponType === 'ranged';
                const abilityMod = (isFinesse || isRanged) ? Math.max(strMod, dexMod) : strMod;

                const attackBonus = abilityMod + profBonus;
                const damageMod = abilityMod >= 0 ? `+${abilityMod}` : `${abilityMod}`;

                return {
                    name: weapon.name,
                    attackBonus: `+${attackBonus}`,
                    damage: `${weapon.damage}${damageMod} ${weapon.damageType?.slice(0, 5) || ''}`
                };
            });

            // Build features array
            const features: Feature[] = [];

            // Add class features
            dnd5e.classes?.forEach(cls => {
                cls.features?.forEach(f => {
                    features.push({
                        name: f.name,
                        description: f.description
                    });
                });
            });

            // Add racial/background features
            dnd5e.features?.forEach(f => {
                features.push({
                    name: f.name,
                    description: f.description
                });
            });

            // Build equipment list
            const equipmentList: string[] = [];
            if (dnd5e.armor) equipmentList.push(dnd5e.armor.name);
            if (dnd5e.shield) equipmentList.push('Shield');
            dnd5e.weapons?.forEach(w => equipmentList.push(w.name));
            dnd5e.equipment?.forEach(e => equipmentList.push(e.name));

            // Build personality strings
            const traits = dnd5e.personality?.traits?.join(' ') || '';
            const ideals = dnd5e.personality?.ideals?.join(' ') || '';
            const bonds = dnd5e.personality?.bonds?.join(' ') || '';
            const flaws = dnd5e.personality?.flaws?.join(' ') || '';

            // Calculate passive perception
            const wisMod = Math.floor(((dnd5e.abilityScores?.wisdom ?? 10) - 10) / 2);
            const isProficientPerception = dnd5e.proficiencies?.skills?.includes('Perception');
            const passivePerception = 10 + wisMod + (isProficientPerception ? (dnd5e.derivedStats?.proficiencyBonus ?? 2) : 0);

            return (
                <CharacterSheetContainer>
                    {/* Page 1: Main Character Sheet */}
                    <CharacterSheet
                        // Header
                        name={character.name}
                        classAndLevel={classAndLevel}
                        race={dnd5e.race?.name || 'Unknown'}
                        background={dnd5e.background?.name || 'Unknown'}
                        playerName=""
                        alignment={dnd5e.alignment || ''}
                        xp={0}
                        portraitUrl={undefined}

                        // Ability Scores
                        abilityScores={dnd5e.abilityScores}

                        // Proficiency
                        proficiencyBonus={dnd5e.derivedStats?.proficiencyBonus ?? 2}
                        proficientSaves={dnd5e.proficiencies?.savingThrows || []}
                        proficientSkills={dnd5e.proficiencies?.skills || []}
                        hasInspiration={false}
                        passivePerception={passivePerception}

                        // Languages & Proficiencies
                        languages={dnd5e.proficiencies?.languages || ['Common']}
                        armorProficiencies={dnd5e.proficiencies?.armor || []}
                        weaponProficiencies={dnd5e.proficiencies?.weapons || []}
                        toolProficiencies={dnd5e.proficiencies?.tools || []}

                        // Combat
                        armorClass={dnd5e.derivedStats?.armorClass ?? 10}
                        initiative={dnd5e.derivedStats?.initiative ?? 0}
                        speed={dnd5e.derivedStats?.speed?.walk ?? 30}
                        maxHP={dnd5e.derivedStats?.maxHp ?? 1}
                        currentHP={dnd5e.derivedStats?.currentHp}
                        tempHP={dnd5e.derivedStats?.tempHp}
                        hitDiceTotal={dnd5e.classes?.length > 0
                            ? `${dnd5e.classes[0].level}d${dnd5e.classes[0].hitDie || 10}`
                            : '1d10'}

                        // Attacks & Equipment
                        attacks={attacks}
                        currency={dnd5e.currency}
                        equipment={equipmentList}

                        // Features
                        features={features}
                    />

                    {/* Page 2: Background & Personality */}
                    <BackgroundPersonalitySheet
                        characterName={character.name}
                        backgroundName={dnd5e.background?.name}
                        traits={traits}
                        ideals={ideals}
                        bonds={bonds}
                        flaws={flaws}
                    />

                    {/* Page 3: Inventory Sheet */}
                    <InventorySheet
                        characterName={character.name}
                        classAndLevel={classAndLevel}
                        strength={dnd5e.abilityScores?.strength ?? 10}
                        currency={{
                            cp: dnd5e.currency?.cp ?? 0,
                            sp: dnd5e.currency?.sp ?? 0,
                            ep: dnd5e.currency?.ep ?? 0,
                            gp: dnd5e.currency?.gp ?? 0,
                            pp: dnd5e.currency?.pp ?? 0
                        }}
                        attunedItems={(() => {
                            // Build attunement slots from character data
                            const maxSlots = dnd5e.attunement?.maxSlots ?? 3;
                            const attunedIds = dnd5e.attunement?.attunedItemIds ?? [];

                            // Look up item names from IDs
                            const allItems = [
                                ...(dnd5e.weapons || []),
                                ...(dnd5e.equipment || []),
                                ...(dnd5e.armor ? [dnd5e.armor] : [])
                            ];

                            const slots = attunedIds.map(itemId => {
                                const item = allItems.find(i => i.id === itemId);
                                return { name: item?.name ?? itemId, active: true };
                            });

                            // Pad with empty slots
                            while (slots.length < maxSlots) {
                                slots.push({ name: '', active: false });
                            }

                            return slots;
                        })()}
                        weapons={(dnd5e.weapons || []).map((w, idx) => {
                            const isAttuned = dnd5e.attunement?.attunedItemIds?.includes(w.id);
                            return {
                                id: w.id || `weapon-${idx}`,
                                name: w.name,
                                quantity: 1,
                                weight: w.weight,
                                value: w.value ? `${w.value} gp` : '—',
                                attuned: isAttuned
                            };
                        })}
                        armor={dnd5e.armor ? [{
                            id: dnd5e.armor.id || 'armor-1',
                            name: dnd5e.armor.name + ' (worn)',
                            quantity: 1,
                            weight: dnd5e.armor.weight,
                            notes: `AC ${dnd5e.armor.armorClass}`,
                            attuned: dnd5e.attunement?.attunedItemIds?.includes(dnd5e.armor.id)
                        }] : []}
                        magicItems={(dnd5e.equipment || [])
                            .filter(e => e.isMagical || e.type === 'wondrous item')
                            .filter(e => e.type !== 'weapon' && e.type !== 'armor' && e.type !== 'consumable')
                            .map((e, idx) => ({
                                id: e.id || `magic-${idx}`,
                                name: e.name,
                                quantity: e.quantity || 1,
                                weight: e.weight,
                                notes: e.rarity?.charAt(0).toUpperCase() || '—',
                                attuned: dnd5e.attunement?.attunedItemIds?.includes(e.id)
                            }))}
                        adventuringGear={(dnd5e.equipment || [])
                            .filter(e => e.type === 'adventuring gear' || e.type === 'container')
                            .filter(e => !e.isMagical)
                            .map((e, idx) => ({
                                id: e.id || `equip-${idx}`,
                                name: e.name,
                                quantity: e.quantity || 1,
                                weight: e.weight,
                                value: e.value ? `${e.value} gp` : '—'
                            }))}
                        treasure={(dnd5e.equipment || [])
                            .filter(e => e.type === 'treasure')
                            .map((e, idx) => ({
                                id: e.id || `treasure-${idx}`,
                                name: e.name,
                                quantity: e.quantity || 1,
                                weight: e.weight,
                                value: e.value ? `${e.value} gp` : '—'
                            }))}
                        consumables={(dnd5e.equipment || [])
                            .filter(e => e.type === 'consumable')
                            .map((e, idx) => ({
                                id: e.id || `consumable-${idx}`,
                                name: e.name,
                                quantity: e.quantity || 1,
                                weight: e.weight,
                                notes: e.description?.slice(0, 20) || '—'
                            }))}
                        otherItems={[]}
                        containers={[]}
                    />
                </CharacterSheetContainer>
            );
        }

        // Empty state - show blank sheet
        return (
            <CharacterSheetPage>
                <div
                    style={{
                        textAlign: 'center',
                        padding: '3rem 2rem',
                        fontFamily: 'BookInsanityRemake, serif'
                    }}
                >
                    <h2
                        style={{
                            fontFamily: 'NodestoCapsCondensed, serif',
                            fontSize: '2.4rem',
                            color: 'var(--text-red, #58180D)',
                            margin: '0 0 1rem',
                            letterSpacing: '0.02em'
                        }}
                    >
                        📜 Character Sheet
                    </h2>
                    <p
                        style={{
                            fontFamily: 'ScalySansRemake, sans-serif',
                            fontSize: '1.1rem',
                            color: 'rgba(43, 29, 15, 0.8)',
                            lineHeight: 1.5,
                            margin: 0
                        }}
                    >
                        Create a new character to see the character sheet preview.
                        <br />
                        <br />
                        Click <strong style={{ color: '#a11d18' }}>&quot;Generate&quot;</strong> in the header to start building your character,
                        <br />
                        or use <strong style={{ color: '#a11d18' }}>Dev Tools → Load Demo Character</strong> in the toolbox.
                    </p>
                </div>
            </CharacterSheetPage>
        );
    }, [character]);

    return (
        <div className="character-canvas-area" data-testid="character-canvas">
            {canvasContent}
        </div>
    );
};

export default CharacterCanvas;
