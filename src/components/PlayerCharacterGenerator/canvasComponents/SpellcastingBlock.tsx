/**
 * SpellcastingBlock Component
 * 
 * Displays spellcasting information for casters:
 * - Spell Save DC and Spell Attack Bonus
 * - Cantrips known
 * - Spells known/prepared
 * - Spell slots by level
 * 
 * @module PlayerCharacterGenerator/canvasComponents/SpellcastingBlock
 */

import React from 'react';
import type { DnD5eSpellcasting } from '../types/dnd5e/character.types';

export interface SpellcastingBlockProps {
    /** Spellcasting data from character */
    spellcasting: DnD5eSpellcasting;
    /** Spell save DC */
    spellSaveDC?: number;
    /** Spell attack bonus */
    spellAttackBonus?: number;
    /** Whether edit mode is enabled (Phase 2+) */
    isEditMode?: boolean;
}

/**
 * Format modifier with +/- sign
 */
function formatModifier(value: number): string {
    return value >= 0 ? `+${value}` : `${value}`;
}

/**
 * Spell slot tracker component
 */
interface SpellSlotRowProps {
    level: number;
    total: number;
    used: number;
}

const SpellSlotRow: React.FC<SpellSlotRowProps> = ({ level, total, used }) => {
    const remaining = total - used;

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.2rem 0',
                fontSize: '0.85rem'
            }}
            data-testid={`spell-slots-level-${level}`}
        >
            {/* Level label */}
            <span
                style={{
                    width: '50px',
                    fontWeight: 600,
                    color: '#58180d'
                }}
            >
                {level === 0 ? 'Cantrip' : `${level}${getOrdinalSuffix(level)}`}
            </span>

            {/* Slot circles */}
            <div style={{ display: 'flex', gap: '4px' }}>
                {Array.from({ length: total }).map((_, i) => (
                    <span
                        key={i}
                        style={{
                            width: '14px',
                            height: '14px',
                            borderRadius: '50%',
                            border: '2px solid #58180d',
                            background: i < remaining ? '#58180d' : 'transparent',
                            display: 'inline-block'
                        }}
                        title={i < remaining ? 'Available' : 'Used'}
                    />
                ))}
            </div>

            {/* Count label */}
            <span
                style={{
                    fontSize: '0.75rem',
                    color: 'rgba(43, 29, 15, 0.6)',
                    marginLeft: 'auto'
                }}
            >
                {remaining}/{total}
            </span>
        </div>
    );
};

/**
 * Get ordinal suffix for number
 */
function getOrdinalSuffix(n: number): string {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
}

/**
 * SpellcastingBlock - Spellcasting information display
 * 
 * Layout:
 * ┌─────────────────────────────────┐
 * │ Spellcasting                    │
 * │ Spellcasting Ability: CHA       │
 * │                                 │
 * │   DC      Attack                │
 * │   13       +5                   │
 * │                                 │
 * │ CANTRIPS                        │
 * │ Light, Mage Hand, Prestidig...  │
 * │                                 │
 * │ SPELL SLOTS                     │
 * │ 1st  ●●○○    2/4                │
 * │ 2nd  ●●      2/2                │
 * │                                 │
 * │ SPELLS KNOWN                    │
 * │ Charm Person, Detect Magic...   │
 * └─────────────────────────────────┘
 */
const SpellcastingBlock: React.FC<SpellcastingBlockProps> = ({
    spellcasting,
    spellSaveDC,
    spellAttackBonus,
    isEditMode = false
}) => {
    const {
        ability: spellcastingAbility,
        cantrips = [],
        spellsKnown = [],
        spellsPrepared = [],
        spellSlots
    } = spellcasting;

    // Use prepared spells if available, otherwise known spells
    const displaySpells = spellsPrepared && spellsPrepared.length > 0 ? spellsPrepared : spellsKnown;

    // Format ability name
    const abilityLabel = spellcastingAbility 
        ? spellcastingAbility.charAt(0).toUpperCase() + spellcastingAbility.slice(1, 3).toUpperCase()
        : 'N/A';

    return (
        <div
            className="dm-spellcasting-block spellcasting-block"
            data-testid="spellcasting-block"
            data-tutorial="spellcasting"
        >
            {/* Section Header */}
            <h3
                style={{
                    fontFamily: 'BookInsanityRemake, serif',
                    color: '#a11d18',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    margin: '0 0 0.4rem',
                    fontSize: '0.95rem',
                    borderBottom: '1px solid rgba(161, 29, 24, 0.3)',
                    paddingBottom: '0.3rem'
                }}
            >
                Spellcasting
            </h3>

            {/* Spellcasting Ability */}
            <div
                style={{
                    fontSize: '0.85rem',
                    color: 'rgba(43, 29, 15, 0.8)',
                    marginBottom: '0.5rem'
                }}
            >
                Spellcasting Ability: <strong>{abilityLabel}</strong>
            </div>

            {/* DC and Attack Bonus */}
            <div
                style={{
                    display: 'flex',
                    gap: '1rem',
                    marginBottom: '0.75rem'
                }}
            >
                {/* Spell Save DC */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        padding: '0.4rem 0.75rem',
                        background: 'rgba(161, 29, 24, 0.1)',
                        borderRadius: '4px'
                    }}
                >
                    <span
                        style={{
                            fontSize: '0.7rem',
                            color: '#58180d',
                            textTransform: 'uppercase',
                            fontWeight: 600
                        }}
                    >
                        Spell Save DC
                    </span>
                    <span
                        style={{
                            fontSize: '1.2rem',
                            fontWeight: 700,
                            color: '#2b1d0f'
                        }}
                        data-testid="spell-save-dc"
                    >
                        {spellSaveDC ?? '-'}
                    </span>
                </div>

                {/* Spell Attack Bonus */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        padding: '0.4rem 0.75rem',
                        background: 'rgba(161, 29, 24, 0.1)',
                        borderRadius: '4px'
                    }}
                >
                    <span
                        style={{
                            fontSize: '0.7rem',
                            color: '#58180d',
                            textTransform: 'uppercase',
                            fontWeight: 600
                        }}
                    >
                        Spell Attack
                    </span>
                    <span
                        style={{
                            fontSize: '1.2rem',
                            fontWeight: 700,
                            color: '#2b1d0f'
                        }}
                        data-testid="spell-attack-bonus"
                    >
                        {spellAttackBonus !== undefined ? formatModifier(spellAttackBonus) : '-'}
                    </span>
                </div>
            </div>

            {/* Cantrips */}
            {cantrips.length > 0 && (
                <div style={{ marginBottom: '0.75rem' }}>
                    <h4
                        style={{
                            fontFamily: 'BookInsanityRemake, serif',
                            color: '#58180d',
                            fontSize: '0.85rem',
                            margin: '0 0 0.25rem',
                            textTransform: 'uppercase'
                        }}
                    >
                        Cantrips
                    </h4>
                    <div
                        style={{
                            fontSize: '0.85rem',
                            color: '#2b1d0f',
                            lineHeight: 1.4
                        }}
                        data-testid="cantrips-list"
                    >
                        {cantrips.map(c => typeof c === 'string' ? c : c.name).join(', ')}
                    </div>
                </div>
            )}

            {/* Spell Slots */}
            {spellSlots && (
                <div style={{ marginBottom: '0.75rem' }}>
                    <h4
                        style={{
                            fontFamily: 'BookInsanityRemake, serif',
                            color: '#58180d',
                            fontSize: '0.85rem',
                            margin: '0 0 0.25rem',
                            textTransform: 'uppercase'
                        }}
                    >
                        Spell Slots
                    </h4>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(level => {
                        const slot = spellSlots[level as keyof typeof spellSlots];
                        if (!slot || slot.total === 0) return null;
                        return (
                            <SpellSlotRow
                                key={level}
                                level={level}
                                total={slot.total}
                                used={slot.used}
                            />
                        );
                    })}
                </div>
            )}

            {/* Spells Known/Prepared */}
            {displaySpells.length > 0 && (
                <div>
                    <h4
                        style={{
                            fontFamily: 'BookInsanityRemake, serif',
                            color: '#58180d',
                            fontSize: '0.85rem',
                            margin: '0 0 0.25rem',
                            textTransform: 'uppercase'
                        }}
                    >
                        {spellsPrepared.length > 0 ? 'Prepared Spells' : 'Spells Known'}
                    </h4>
                    <div
                        style={{
                            fontSize: '0.85rem',
                            color: '#2b1d0f',
                            lineHeight: 1.4
                        }}
                        data-testid="spells-list"
                    >
                        {displaySpells.map(s => typeof s === 'string' ? s : s.name).join(', ')}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SpellcastingBlock;

// Export for testing
export { formatModifier, getOrdinalSuffix };

