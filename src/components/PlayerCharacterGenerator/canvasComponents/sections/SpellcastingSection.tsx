/**
 * SpellcastingSection Component
 * 
 * Full-width spellcasting page with spell stats, slots, and spell list.
 * Uses .wide class for full-page span.
 * 
 * @module PlayerCharacterGenerator/canvasComponents/sections/SpellcastingSection
 */

import React from 'react';
import type { DnD5eSpellcasting } from '../../types/dnd5e/character.types';
import type { DnD5eSpell } from '../../types/dnd5e/spell.types';

/** Extended spell with prepared status for display */
interface DisplaySpell extends DnD5eSpell {
    prepared?: boolean;
}

export interface SpellcastingSectionProps {
    /** Spellcasting data */
    spellcasting: DnD5eSpellcasting;
    /** Spellcasting ability (e.g., 'charisma') */
    spellcastingAbility: string;
    /** Spell save DC */
    spellSaveDC: number;
    /** Spell attack bonus */
    spellAttackBonus: number;
    /** Known/prepared spells */
    spells?: DisplaySpell[];
    /** Cantrips known */
    cantrips?: DisplaySpell[];
}

/**
 * Format ability name
 */
function formatAbility(ability: string): string {
    const abbrevMap: Record<string, string> = {
        strength: 'STR',
        dexterity: 'DEX',
        constitution: 'CON',
        intelligence: 'INT',
        wisdom: 'WIS',
        charisma: 'CHA'
    };
    return abbrevMap[ability.toLowerCase()] || ability.toUpperCase().slice(0, 3);
}

/**
 * Format spell attack bonus
 */
function formatBonus(bonus: number): string {
    return bonus >= 0 ? `+${bonus}` : `${bonus}`;
}

/**
 * Get spell level label
 */
function getSpellLevelLabel(level: number): string {
    if (level === 0) return 'Cantrips (at will)';

    const suffix = level === 1 ? 'st' : level === 2 ? 'nd' : level === 3 ? 'rd' : 'th';
    return `${level}${suffix} Level`;
}

/**
 * SpellcastingSection - Full-width spell page
 */
export const SpellcastingSection: React.FC<SpellcastingSectionProps> = ({
    spellcasting,
    spellcastingAbility,
    spellSaveDC,
    spellAttackBonus,
    spells = [],
    cantrips = []
}) => {
    // Group spells by level
    const spellsByLevel: Record<number, DisplaySpell[]> = {};

    // Add cantrips as level 0
    if (cantrips.length > 0) {
        spellsByLevel[0] = cantrips;
    }

    // Group other spells
    spells.forEach(spell => {
        const level = spell.level ?? 1;
        if (!spellsByLevel[level]) spellsByLevel[level] = [];
        spellsByLevel[level].push(spell);
    });

    // Get spell slots
    const slots = spellcasting.spellSlots || {};

    return (
        <div className="block character frame wide" id="spellcasting">
            <h2 className="wide" style={{
                textAlign: 'center',
                marginBottom: '0.3cm',
                color: 'var(--dm-text-header-brown, #58180d)'
            }}>
                Spellcasting
            </h2>

            {/* Spellcasting Stats */}
            <div className="spellcasting-header">
                <div className="spellcasting-stats">
                    <div className="spellcasting-stat">
                        <span className="spellcasting-stat-label">Spellcasting Ability:</span>
                        <span className="spellcasting-stat-value">
                            {formatAbility(spellcastingAbility)}
                        </span>
                    </div>
                    <div className="spellcasting-stat">
                        <span className="spellcasting-stat-label">Spell Save DC:</span>
                        <span className="spellcasting-stat-value">{spellSaveDC}</span>
                    </div>
                    <div className="spellcasting-stat">
                        <span className="spellcasting-stat-label">Spell Attack:</span>
                        <span className="spellcasting-stat-value">
                            {formatBonus(spellAttackBonus)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Spell Slots Tracker */}
            {Object.keys(slots).length > 0 && (
                <div style={{ marginBottom: '0.4cm' }}>
                    <h5>Spell Slots</h5>
                    {Object.entries(slots).map(([levelStr, slotData]) => {
                        const level = parseInt(levelStr, 10);
                        if (level === 0 || !slotData.total) return null;

                        return (
                            <div key={level} className="spell-slot-tracker">
                                <span className="spell-slot-level">{level}</span>
                                <div className="spell-slot-boxes">
                                    {Array.from({ length: slotData.total }).map((_, idx) => (
                                        <span
                                            key={idx}
                                            className={`spell-slot ${idx < slotData.used ? 'used' : ''}`}
                                        />
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Spell List */}
            <div className="spellList wide">
                {Object.keys(spellsByLevel)
                    .map(Number)
                    .sort((a, b) => a - b)
                    .map(level => {
                        const levelSpells = spellsByLevel[level];
                        if (!levelSpells || levelSpells.length === 0) return null;

                        return (
                            <div key={level} className="spell-level-group">
                                <div className="spell-level-header">
                                    {getSpellLevelLabel(level)}
                                    {level > 0 && slots[level as keyof typeof slots]?.total && (
                                        <span> ({slots[level as keyof typeof slots]?.total} slots)</span>
                                    )}
                                </div>
                                <div className="spell-list-items">
                                    {levelSpells.map((spell, idx) => (
                                        <React.Fragment key={spell.id || idx}>
                                            {idx > 0 && ', '}
                                            <span
                                                className={[
                                                    'spell-entry',
                                                    spell.prepared ? 'prepared' : '',
                                                    spell.ritual ? 'ritual' : '',
                                                    spell.concentration ? 'concentration' : ''
                                                ].filter(Boolean).join(' ')}
                                            >
                                                {spell.name}
                                            </span>
                                        </React.Fragment>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
            </div>

            {Object.keys(spellsByLevel).length === 0 && (
                <p style={{ fontStyle: 'italic', color: '#666', textAlign: 'center' }}>
                    No spells known
                </p>
            )}
        </div>
    );
};

export default SpellcastingSection;

