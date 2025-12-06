/**
 * Column2Content Component
 * 
 * Aggregates all Column 2 content: Combat Stats, HP, Hit Dice, Death Saves, Attacks, Equipment.
 * 
 * @module PlayerCharacterGenerator/sheetComponents/column2
 */

import React from 'react';
import { CombatStatsRow } from './CombatStatsRow';
import { HPSection } from './HPSection';

export interface Currency {
    cp?: number;
    sp?: number;
    ep?: number;
    gp?: number;
    pp?: number;
}

export interface Attack {
    name: string;
    attackBonus: string;
    damage: string;
}

export interface Column2ContentProps {
    /** Armor Class */
    armorClass: number;
    /** Initiative modifier */
    initiative: number;
    /** Speed in feet */
    speed: number;
    /** Maximum HP */
    maxHP: number;
    /** Current HP */
    currentHP?: number;
    /** Temporary HP */
    tempHP?: number;
    /** Hit dice total (e.g., "2d10") */
    hitDiceTotal: string;
    /** Current hit dice */
    hitDiceCurrent: string;
    /** Death save successes (0-3) */
    deathSaveSuccesses?: number;
    /** Death save failures (0-3) */
    deathSaveFailures?: number;
    /** Attacks list */
    attacks?: Attack[];
    /** Currency */
    currency?: Currency;
    /** Equipment list */
    equipment?: string[];
}

export const Column2Content: React.FC<Column2ContentProps> = ({
    armorClass,
    initiative,
    speed,
    maxHP,
    currentHP,
    tempHP,
    hitDiceTotal,
    hitDiceCurrent,
    deathSaveSuccesses = 0,
    deathSaveFailures = 0,
    attacks = [],
    currency = {},
    equipment = []
}) => {
    return (
        <>
            {/* Combat Stats Row */}
            <CombatStatsRow
                armorClass={armorClass}
                initiative={initiative}
                speed={speed}
            />

            {/* HP Section */}
            <HPSection
                maxHP={maxHP}
                currentHP={currentHP}
                tempHP={tempHP}
            />

            {/* Hit Dice & Death Saves */}
            <div className="hitdice-death-row">
                <div className="phb-section hitdice-box">
                    <div className="hitdice-total">Total: {hitDiceTotal}</div>
                    <div className="hitdice-value">{hitDiceCurrent}</div>
                    <div className="hitdice-label">Hit Dice</div>
                </div>
                <div className="phb-section death-saves-box">
                    <div className="death-saves-content">
                        <div className="death-saves-row">
                            <span>Successes</span>
                            {[0, 1, 2].map(i => (
                                <div
                                    key={`success-${i}`}
                                    className={`death-circle ${i < deathSaveSuccesses ? 'filled' : ''}`}
                                />
                            ))}
                        </div>
                        <div className="death-saves-row">
                            <span>Failures</span>
                            {[0, 1, 2].map(i => (
                                <div
                                    key={`failure-${i}`}
                                    className={`death-circle ${i < deathSaveFailures ? 'filled' : ''}`}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="death-saves-label">Death Saves</div>
                </div>
            </div>

            {/* Attacks Section */}
            <div className="phb-section attacks-section">
                <div className="attacks-title">Attacks & Spellcasting</div>
                <div className="attacks-header">
                    <div>Name</div>
                    <div>Atk Bonus</div>
                    <div>Damage/Type</div>
                </div>
                {attacks.length > 0 ? (
                    attacks.map((attack, idx) => (
                        <div key={idx} className="attack-row">
                            <div className="attack-field">{attack.name}</div>
                            <div className="attack-field">{attack.attackBonus}</div>
                            <div className="attack-field">{attack.damage}</div>
                        </div>
                    ))
                ) : (
                    <>
                        <div className="attack-row">
                            <div className="attack-field">—</div>
                            <div className="attack-field">—</div>
                            <div className="attack-field">—</div>
                        </div>
                    </>
                )}
            </div>

            {/* Equipment Section */}
            <div className="phb-section equipment-section">
                <div className="equipment-content">
                    <div className="currency-column">
                        {(['cp', 'sp', 'ep', 'gp', 'pp'] as const).map(coin => (
                            <div key={coin} className="currency-item">
                                <div className="currency-label">{coin.toUpperCase()}</div>
                                <div className="currency-value">{currency[coin] ?? 0}</div>
                            </div>
                        ))}
                    </div>
                    <div className="equipment-list">
                        {equipment.length > 0
                            ? equipment.map((item, idx) => (
                                <React.Fragment key={idx}>
                                    {item}<br />
                                </React.Fragment>
                            ))
                            : <span style={{ color: 'var(--text-muted)' }}>No equipment</span>
                        }
                    </div>
                </div>
                <div className="equipment-title">Equipment</div>
            </div>
        </>
    );
};

export default Column2Content;

