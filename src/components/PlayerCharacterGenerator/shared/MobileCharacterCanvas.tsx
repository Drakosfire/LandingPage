/**
 * MobileCharacterCanvas Component
 * 
 * Mobile-optimized character sheet display.
 * Renders sections in a vertical scroll layout for native mobile experience.
 * 
 * Used when viewport < 800px. Desktop/tablet uses the scaled page layout.
 * 
 * @module PlayerCharacterGenerator/shared/MobileCharacterCanvas
 */

import React, { useMemo } from 'react';
import { usePlayerCharacterGenerator } from '../PlayerCharacterGeneratorProvider';

// Import section components
import {
    CharacterHeader,
    AbilityScoresRow,
    Column1Content,
    Column2Content,
    FeaturesSection,
    type Attack,
    type Feature
} from '../sheetComponents';

// Import inventory sub-components (not full InventorySheet page)
import {
    CurrencySection,
    EncumbranceSection,
    AttunementSection,
    InventoryBlock,
    type InventoryItem,
    type Currency
} from '../sheetComponents/inventory';

// Import spell sub-components (not full SpellSheet page)
import {
    SpellHeader,
    SpellSlotTracker,
    SpellLevelBlock,
    type SpellSlotLevel,
    type SpellEntry
} from '../sheetComponents/spells';

// Import detail modals for item/spell info
import { ItemDetailModal, SpellDetailModal } from '../sheetComponents/modals';
import { useDetailModal } from '../hooks/useDetailModal';

// Import the CharacterSheet CSS for component styling
import '../sheetComponents/CharacterSheet.css';
import './MobileCharacterCanvas.css';

// ============================================================================
// MobileCharacterCanvas Component
// ============================================================================

const MobileCharacterCanvas: React.FC = () => {
    const { character } = usePlayerCharacterGenerator();

    // Modal state for item and spell details
    const {
        isOpen: isItemModalOpen,
        data: selectedItem,
        openModal: openItemModal,
        closeModal: closeItemModal
    } = useDetailModal<InventoryItem>();

    const {
        isOpen: isSpellModalOpen,
        data: selectedSpell,
        openModal: openSpellModal,
        closeModal: closeSpellModal
    } = useDetailModal<SpellEntry>();

    const content = useMemo(() => {
        const dnd5e = character?.dnd5eData;
        const hasCharacter = character?.name && character.name.trim().length > 0;
        const hasAbilityScores = dnd5e?.abilityScores &&
            Object.values(dnd5e.abilityScores).some(v => v > 0);

        if (!hasCharacter || !hasAbilityScores || !dnd5e) {
            return (
                <div className="mobile-empty-state">
                    <h2>📜 Character Sheet</h2>
                    <p>
                        Create a new character to see the character sheet preview.
                        <br /><br />
                        Click <strong>"Generate"</strong> in the header to start building your character,
                        or use <strong>Dev Tools → Load Demo Character</strong> in the toolbox.
                    </p>
                </div>
            );
        }

        // Build class and level string
        const classAndLevel = dnd5e.classes?.length > 0
            ? dnd5e.classes.map(c => `${c.name} ${c.level}`).join(' / ')
            : 'Unknown';

        // Build attacks array from weapons
        const attacks: Attack[] = (dnd5e.weapons || []).map(weapon => {
            const strMod = Math.floor(((dnd5e.abilityScores?.strength ?? 10) - 10) / 2);
            const dexMod = Math.floor(((dnd5e.abilityScores?.dexterity ?? 10) - 10) / 2);
            const profBonus = dnd5e.derivedStats?.proficiencyBonus ?? 2;

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
        dnd5e.classes?.forEach(cls => {
            cls.features?.forEach(f => {
                features.push({ name: f.name, description: f.description });
            });
        });
        dnd5e.features?.forEach(f => {
            features.push({ name: f.name, description: f.description });
        });

        // Build equipment list
        const equipmentList: string[] = [];
        if (dnd5e.armor) equipmentList.push(dnd5e.armor.name);
        if (dnd5e.shield) equipmentList.push('Shield');
        dnd5e.weapons?.forEach(w => equipmentList.push(w.name));
        dnd5e.equipment?.forEach(e => equipmentList.push(e.name));

        // Calculate passive perception
        const wisMod = Math.floor(((dnd5e.abilityScores?.wisdom ?? 10) - 10) / 2);
        const isProficientPerception = dnd5e.proficiencies?.skills?.includes('Perception');
        const passivePerception = 10 + wisMod + (isProficientPerception ? (dnd5e.derivedStats?.proficiencyBonus ?? 2) : 0);

        return (
            <>
                {/* Header: Name, Class, Race */}
                <section className="mobile-section">
                    <CharacterHeader
                        name={character.name}
                        classAndLevel={classAndLevel}
                        race={dnd5e.race?.name || 'Unknown'}
                        background={dnd5e.background?.name || 'Unknown'}
                        playerName={character.playerName || ''}
                        alignment={dnd5e.alignment || ''}
                        xp={character.xp || 0}
                        portraitUrl={undefined}
                    />
                </section>

                {/* Combat Stats + Ability Scores (unified row component) */}
                <section className="mobile-section mobile-section-stats">
                    <AbilityScoresRow
                        scores={dnd5e.abilityScores}
                        maxHP={dnd5e.derivedStats?.maxHp ?? 1}
                        currentHP={dnd5e.derivedStats?.currentHp}
                        tempHP={dnd5e.derivedStats?.tempHp}
                        armorClass={dnd5e.derivedStats?.armorClass ?? 10}
                        initiative={dnd5e.derivedStats?.initiative ?? 0}
                        speed={dnd5e.derivedStats?.speed?.walk ?? 30}
                        hasInspiration={false}
                        proficiencyBonus={dnd5e.derivedStats?.proficiencyBonus ?? 2}
                        passivePerception={passivePerception}
                        hitDice={dnd5e.classes?.length > 0
                            ? `${dnd5e.classes[0].level}d${dnd5e.classes[0].hitDie || 10}`
                            : '1d10'}
                        deathSaveSuccesses={0}
                        deathSaveFailures={0}
                    />
                </section>

                {/* Attacks & Equipment */}
                <section className="mobile-section">
                    <h3 className="mobile-section-title">Combat & Equipment</h3>
                    <Column2Content
                        attacks={attacks}
                        currency={dnd5e.currency}
                        equipment={equipmentList}
                    />
                </section>

                {/* Saves, Skills, Proficiencies */}
                <section className="mobile-section">
                    <h3 className="mobile-section-title">Saves & Skills</h3>
                    <Column1Content
                        abilityScores={dnd5e.abilityScores}
                        proficiencyBonus={dnd5e.derivedStats?.proficiencyBonus ?? 2}
                        proficientSaves={dnd5e.proficiencies?.savingThrows || []}
                        proficientSkills={dnd5e.proficiencies?.skills || []}
                        languages={dnd5e.proficiencies?.languages || ['Common']}
                        armorProficiencies={dnd5e.proficiencies?.armor || []}
                        weaponProficiencies={dnd5e.proficiencies?.weapons || []}
                        toolProficiencies={dnd5e.proficiencies?.tools || []}
                    />
                </section>

                {/* Features */}
                {features.length > 0 && (
                    <section className="mobile-section">
                        <h3 className="mobile-section-title">Features & Traits</h3>
                        <FeaturesSection features={features} />
                    </section>
                )}

                {/* Personality (if present) */}
                {dnd5e.personality && (
                    <section className="mobile-section">
                        <h3 className="mobile-section-title">Personality</h3>
                        <div className="mobile-personality">
                            {dnd5e.personality.traits && dnd5e.personality.traits.length > 0 && (
                                <div className="mobile-personality-item">
                                    <strong>Traits:</strong> {dnd5e.personality.traits.join(' ')}
                                </div>
                            )}
                            {dnd5e.personality.ideals && dnd5e.personality.ideals.length > 0 && (
                                <div className="mobile-personality-item">
                                    <strong>Ideals:</strong> {dnd5e.personality.ideals.join(' ')}
                                </div>
                            )}
                            {dnd5e.personality.bonds && dnd5e.personality.bonds.length > 0 && (
                                <div className="mobile-personality-item">
                                    <strong>Bonds:</strong> {dnd5e.personality.bonds.join(' ')}
                                </div>
                            )}
                            {dnd5e.personality.flaws && dnd5e.personality.flaws.length > 0 && (
                                <div className="mobile-personality-item">
                                    <strong>Flaws:</strong> {dnd5e.personality.flaws.join(' ')}
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* Inventory Sections - Individual mobile-section wrappers */}
                <section className="mobile-section">
                    <h3 className="mobile-section-title">Currency & Carrying</h3>
                    <div className="mobile-inventory-stats">
                        <CurrencySection
                            currency={{
                                cp: dnd5e.currency?.cp ?? 0,
                                sp: dnd5e.currency?.sp ?? 0,
                                ep: dnd5e.currency?.ep ?? 0,
                                gp: dnd5e.currency?.gp ?? 0,
                                pp: dnd5e.currency?.pp ?? 0
                            }}
                        />
                        <EncumbranceSection
                            currentWeight={0}
                            strength={dnd5e.abilityScores?.strength ?? 10}
                        />
                    </div>
                </section>

                {/* Weapons */}
                {(dnd5e.weapons?.length ?? 0) > 0 && (
                    <section className="mobile-section">
                        <InventoryBlock
                            title="Weapons"
                            items={(dnd5e.weapons || []).map((w, idx) => ({
                                id: w.id || `weapon-${idx}`,
                                name: w.name,
                                quantity: 1,
                                weight: w.weight,
                                value: w.value ? `${w.value} gp` : '—',
                                // Extended fields for modal
                                type: 'weapon' as const,
                                description: w.description,
                                isMagical: w.isMagical,
                                rarity: w.rarity,
                                requiresAttunement: w.requiresAttunement,
                                damage: w.damage,
                                damageType: w.damageType,
                                properties: w.properties,
                                range: w.range,
                                weaponCategory: w.weaponCategory,
                                weaponType: w.weaponType,
                                valueNumber: w.value
                            }))}
                            emptyRows={0}
                            onItemInfoClick={openItemModal}
                        />
                    </section>
                )}

                {/* Armor */}
                {dnd5e.armor && (
                    <section className="mobile-section">
                        <InventoryBlock
                            title="Armor"
                            items={[{
                                id: dnd5e.armor.id || 'armor-1',
                                name: dnd5e.armor.name + ' (worn)',
                                quantity: 1,
                                weight: dnd5e.armor.weight,
                                value: `AC ${dnd5e.armor.armorClass}`,
                                // Extended fields for modal
                                type: 'armor' as const,
                                description: dnd5e.armor.description,
                                isMagical: dnd5e.armor.isMagical,
                                rarity: dnd5e.armor.rarity,
                                requiresAttunement: dnd5e.armor.requiresAttunement,
                                armorClass: dnd5e.armor.armorClass,
                                armorCategory: dnd5e.armor.armorCategory,
                                stealthDisadvantage: dnd5e.armor.stealthDisadvantage,
                                valueNumber: dnd5e.armor.value
                            }]}
                            headers={['Qty', 'Item', 'Wt.', 'AC']}
                            emptyRows={0}
                            onItemInfoClick={openItemModal}
                        />
                    </section>
                )}

                {/* Adventuring Gear */}
                {(dnd5e.equipment?.filter(e =>
                    (e.type === 'adventuring gear' || e.type === 'container') && !e.isMagical
                ).length ?? 0) > 0 && (
                        <section className="mobile-section">
                            <InventoryBlock
                                title="Adventuring Gear"
                                items={(dnd5e.equipment || [])
                                    .filter(e => (e.type === 'adventuring gear' || e.type === 'container') && !e.isMagical)
                                    .map((e, idx) => ({
                                        id: e.id || `equip-${idx}`,
                                        name: e.name,
                                        quantity: e.quantity || 1,
                                        weight: e.weight,
                                        value: e.value ? `${e.value} gp` : '—',
                                        // Extended fields for modal
                                        type: e.type,
                                        description: e.description,
                                        valueNumber: e.value
                                    }))}
                                emptyRows={0}
                                onItemInfoClick={openItemModal}
                            />
                        </section>
                    )}

                {/* Magic Items */}
                {(dnd5e.equipment?.filter(e =>
                    (e.isMagical || e.type === 'wondrous item') &&
                    e.type !== 'weapon' && e.type !== 'armor' && e.type !== 'consumable'
                ).length ?? 0) > 0 && (
                        <section className="mobile-section">
                            <InventoryBlock
                                title="Magic Items"
                                items={(dnd5e.equipment || [])
                                    .filter(e => (e.isMagical || e.type === 'wondrous item') &&
                                        e.type !== 'weapon' && e.type !== 'armor' && e.type !== 'consumable')
                                    .map((e, idx) => ({
                                        id: e.id || `magic-${idx}`,
                                        name: e.name,
                                        quantity: e.quantity || 1,
                                        weight: e.weight,
                                        value: e.rarity?.charAt(0).toUpperCase() || '—',
                                        // Extended fields for modal
                                        type: e.type,
                                        description: e.description,
                                        isMagical: e.isMagical,
                                        rarity: e.rarity,
                                        requiresAttunement: e.requiresAttunement,
                                        valueNumber: e.value
                                    }))}
                                headers={['Qty', 'Item', 'Wt.', 'Rarity']}
                                emptyRows={0}
                                onItemInfoClick={openItemModal}
                            />
                        </section>
                    )}

                {/* Spellcasting Sections - Individual mobile-section wrappers */}
                {dnd5e.spellcasting && (
                    <>
                        {/* Spellcasting Stats */}
                        <section className="mobile-section">
                            <h3 className="mobile-section-title">Spellcasting</h3>
                            <SpellHeader
                                spellcastingClass={dnd5e.spellcasting.class}
                                spellcastingAbility={dnd5e.spellcasting.ability.substring(0, 3).toUpperCase()}
                                spellSaveDC={dnd5e.spellcasting.spellSaveDC}
                                spellAttackBonus={dnd5e.spellcasting.spellAttackBonus}
                            />
                        </section>

                        {/* Spell Slots */}
                        <section className="mobile-section">
                            <h3 className="mobile-section-title">Spell Slots</h3>
                            <SpellSlotTracker
                                slots={(() => {
                                    const slots: SpellSlotLevel[] = [];
                                    const spellSlots = dnd5e.spellcasting?.spellSlots;
                                    if (spellSlots) {
                                        for (let level = 1; level <= 9; level++) {
                                            const slotData = spellSlots[level as keyof typeof spellSlots];
                                            if (slotData) {
                                                slots.push({ level, total: slotData.total, used: slotData.used });
                                            }
                                        }
                                    }
                                    return slots;
                                })()}
                            />
                        </section>

                        {/* Cantrips */}
                        {(dnd5e.spellcasting.cantrips?.length ?? 0) > 0 && (
                            <section className="mobile-section">
                                <SpellLevelBlock
                                    level={0}
                                    spells={(dnd5e.spellcasting.cantrips || []).map(spell => ({
                                        id: spell.id,
                                        name: spell.name,
                                        isConcentration: spell.concentration,
                                        isRitual: spell.ritual,
                                        // Extended fields for modal
                                        level: spell.level,
                                        school: spell.school,
                                        castingTime: spell.castingTime,
                                        range: spell.range,
                                        components: spell.components,
                                        duration: spell.duration,
                                        description: spell.description,
                                        damage: spell.damage,
                                        source: spell.source
                                    }))}
                                    emptyRows={0}
                                    onSpellInfoClick={openSpellModal}
                                />
                            </section>
                        )}

                        {/* Level 1 Spells */}
                        {(dnd5e.spellcasting.spellsKnown?.filter(s => s.level === 1).length ?? 0) > 0 && (
                            <section className="mobile-section">
                                <SpellLevelBlock
                                    level={1}
                                    spells={(dnd5e.spellcasting.spellsKnown || []).filter(s => s.level === 1).map(spell => ({
                                        id: spell.id,
                                        name: spell.name,
                                        isPrepared: dnd5e.spellcasting?.spellsPrepared?.includes(spell.id),
                                        isConcentration: spell.concentration,
                                        isRitual: spell.ritual,
                                        // Extended fields for modal
                                        level: spell.level,
                                        school: spell.school,
                                        castingTime: spell.castingTime,
                                        range: spell.range,
                                        components: spell.components,
                                        duration: spell.duration,
                                        description: spell.description,
                                        higherLevels: spell.higherLevels,
                                        damage: spell.damage,
                                        source: spell.source
                                    }))}
                                    emptyRows={0}
                                    onSpellInfoClick={openSpellModal}
                                />
                            </section>
                        )}

                        {/* Level 2 Spells */}
                        {(dnd5e.spellcasting.spellsKnown?.filter(s => s.level === 2).length ?? 0) > 0 && (
                            <section className="mobile-section">
                                <SpellLevelBlock
                                    level={2}
                                    spells={(dnd5e.spellcasting.spellsKnown || []).filter(s => s.level === 2).map(spell => ({
                                        id: spell.id,
                                        name: spell.name,
                                        isPrepared: dnd5e.spellcasting?.spellsPrepared?.includes(spell.id),
                                        isConcentration: spell.concentration,
                                        isRitual: spell.ritual,
                                        // Extended fields for modal
                                        level: spell.level,
                                        school: spell.school,
                                        castingTime: spell.castingTime,
                                        range: spell.range,
                                        components: spell.components,
                                        duration: spell.duration,
                                        description: spell.description,
                                        higherLevels: spell.higherLevels,
                                        damage: spell.damage,
                                        source: spell.source
                                    }))}
                                    emptyRows={0}
                                    onSpellInfoClick={openSpellModal}
                                />
                            </section>
                        )}

                        {/* Level 3+ Spells - only render if they exist */}
                        {[3, 4, 5, 6, 7, 8, 9].map(level => {
                            const spellsAtLevel = (dnd5e.spellcasting?.spellsKnown || []).filter(s => s.level === level);
                            if (spellsAtLevel.length === 0) return null;
                            return (
                                <section key={level} className="mobile-section">
                                    <SpellLevelBlock
                                        level={level}
                                        spells={spellsAtLevel.map(spell => ({
                                            id: spell.id,
                                            name: spell.name,
                                            isPrepared: dnd5e.spellcasting?.spellsPrepared?.includes(spell.id),
                                            isConcentration: spell.concentration,
                                            isRitual: spell.ritual,
                                            // Extended fields for modal
                                            level: spell.level,
                                            school: spell.school,
                                            castingTime: spell.castingTime,
                                            range: spell.range,
                                            components: spell.components,
                                            duration: spell.duration,
                                            description: spell.description,
                                            higherLevels: spell.higherLevels,
                                            damage: spell.damage,
                                            source: spell.source
                                        }))}
                                        emptyRows={0}
                                        onSpellInfoClick={openSpellModal}
                                    />
                                </section>
                            );
                        })}
                    </>
                )}
            </>
        );
    }, [character]);

    return (
        <>
            <div
                className="mobile-character-canvas character-sheet"
                data-testid="mobile-character-canvas"
            >
                {content}
            </div>

            {/* Item Detail Modal */}
            {selectedItem && (
                <ItemDetailModal
                    isOpen={isItemModalOpen}
                    onClose={closeItemModal}
                    name={selectedItem.name}
                    type={selectedItem.type || 'other'}
                    description={selectedItem.description}
                    weight={selectedItem.weight}
                    value={selectedItem.valueNumber}
                    quantity={selectedItem.quantity}
                    isMagical={selectedItem.isMagical}
                    rarity={selectedItem.rarity}
                    requiresAttunement={selectedItem.requiresAttunement}
                    damage={selectedItem.damage}
                    damageType={selectedItem.damageType}
                    properties={selectedItem.properties}
                    range={selectedItem.range}
                    weaponCategory={selectedItem.weaponCategory}
                    weaponType={selectedItem.weaponType}
                    armorClass={selectedItem.armorClass}
                    armorCategory={selectedItem.armorCategory}
                    stealthDisadvantage={selectedItem.stealthDisadvantage}
                />
            )}

            {/* Spell Detail Modal */}
            {selectedSpell && (
                <SpellDetailModal
                    isOpen={isSpellModalOpen}
                    onClose={closeSpellModal}
                    name={selectedSpell.name}
                    level={selectedSpell.level ?? 0}
                    school={selectedSpell.school ?? 'evocation'}
                    castingTime={selectedSpell.castingTime ?? '1 action'}
                    range={selectedSpell.range ?? 'Self'}
                    components={selectedSpell.components ?? { verbal: true, somatic: true, material: false }}
                    duration={selectedSpell.duration ?? 'Instantaneous'}
                    description={selectedSpell.description ?? 'No description available.'}
                    higherLevels={selectedSpell.higherLevels}
                    ritual={selectedSpell.isRitual}
                    concentration={selectedSpell.isConcentration}
                    damage={selectedSpell.damage}
                    source={selectedSpell.source}
                />
            )}
        </>
    );
};

export default MobileCharacterCanvas;

