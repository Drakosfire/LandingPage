/**
 * AbilityScoresRow Component
 * 
 * Unified stats row with Combat Status (left), 6 Ability Scores (center, 2-col grid), Meta Stats (right).
 * 
 * Layout:
 * ┌──────────────┬─────────────────────────┬────────────┐
 * │ HP Max  12   │ STR   16   +3 │ INT  11   +0 │ Insp  ○    │
 * │ Current [ ]  │ DEX   15   +2 │ WIS  13   +1 │ Prof +2    │
 * │ Temp    [ ]  │ CON   15   +2 │ CHA   9   -1 │ Passive 10 │
 * │ AC   17      ├───────────────┴──────────────┤ HD 1d10    │
 * │ Init +0      │                               │            │
 * │ Speed 30ft   │                               │            │
 * │ Death S○○○ F○○○                              │            │
 * └──────────────┴───────────────────────────────┴────────────┘
 * 
 * @module PlayerCharacterGenerator/sheetComponents
 */

import React from 'react';

export interface AbilityScores {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
}

export interface AbilityScoresRowProps {
    /** Ability scores object */
    scores: AbilityScores;
    /** Maximum HP */
    maxHP?: number;
    /** Current HP */
    currentHP?: number;
    /** Temporary HP */
    tempHP?: number;
    /** Armor Class */
    armorClass?: number;
    /** Initiative modifier */
    initiative?: number;
    /** Speed in feet */
    speed?: number;
    /** Whether character has inspiration */
    hasInspiration?: boolean;
    /** Proficiency bonus */
    proficiencyBonus?: number;
    /** Passive perception value */
    passivePerception?: number;
    /** Hit dice (e.g., "1d10") */
    hitDice?: string;
    /** Death save successes (0-3) */
    deathSaveSuccesses?: number;
    /** Death save failures (0-3) */
    deathSaveFailures?: number;
}

/**
 * Calculate ability modifier from score
 */
function calculateModifier(score: number): number {
    return Math.floor((score - 10) / 2);
}

/**
 * Format modifier with +/- sign
 */
function formatModifier(score: number): string {
    const mod = calculateModifier(score);
    return mod >= 0 ? `+${mod}` : `${mod}`;
}

function formatInitiative(init: number): string {
    return init >= 0 ? `+${init}` : `${init}`;
}

/**
 * Ability labels in standard D&D order (abbreviated)
 */
const ABILITIES: Array<{ key: keyof AbilityScores; abbrev: string }> = [
    { key: 'strength', abbrev: 'STR' },
    { key: 'dexterity', abbrev: 'DEX' },
    { key: 'constitution', abbrev: 'CON' },
    { key: 'intelligence', abbrev: 'INT' },
    { key: 'wisdom', abbrev: 'WIS' },
    { key: 'charisma', abbrev: 'CHA' }
];

/**
 * AbilityBox - Single ability score display (horizontal)
 */
interface AbilityBoxProps {
    abbrev: string;
    score: number;
}

const AbilityBox: React.FC<AbilityBoxProps> = ({ abbrev, score }) => (
    <div className="ability-box-horizontal" data-testid={`ability-${abbrev.toLowerCase()}`}>
        <span className="ability-name">{abbrev}</span>
        <span className="ability-score">{score}</span>
        <span className="ability-modifier">{formatModifier(score)}</span>
    </div>
);

/**
 * AbilityScoresGrid - 2-column layout for 6 ability scores
 */
interface AbilityScoresGridProps {
    scores: AbilityScores;
}

const AbilityScoresGrid: React.FC<AbilityScoresGridProps> = ({ scores }) => {
    // Split abilities into two columns: STR/DEX/CON (physical) and INT/WIS/CHA (mental)
    const leftColumn = ABILITIES.slice(0, 3);  // STR, DEX, CON
    const rightColumn = ABILITIES.slice(3, 6); // INT, WIS, CHA

    return (
        <div className="phb-section ability-scores-grid" data-testid="ability-scores-grid">
            <div className="ability-col">
                {leftColumn.map(({ key, abbrev }) => (
                    <AbilityBox key={key} abbrev={abbrev} score={scores[key] ?? 10} />
                ))}
            </div>
            <div className="ability-col">
                {rightColumn.map(({ key, abbrev }) => (
                    <AbilityBox key={key} abbrev={abbrev} score={scores[key] ?? 10} />
                ))}
            </div>
        </div>
    );
};

/**
 * CombatStatus - Compact HP + AC/Init/Speed + Death Saves display
 */
interface CombatStatusProps {
    maxHP: number;
    currentHP?: number;
    tempHP?: number;
    armorClass: number;
    initiative: number;
    speed: number;
    deathSaveSuccesses: number;
    deathSaveFailures: number;
}

const CombatStatus: React.FC<CombatStatusProps> = ({
    maxHP,
    currentHP,
    tempHP,
    armorClass,
    initiative,
    speed,
    deathSaveSuccesses,
    deathSaveFailures
}) => (
    <div className="phb-section combat-status-compact" data-testid="combat-status">
        <div className="combat-stats-grid">
            {/* HP Column */}
            <div className="combat-hp-col">
                <div className="hp-row">
                    <span className="hp-val">{maxHP}</span>
                    <span className="hp-lbl">HP Max</span>
                </div>
                <div className="hp-row">
                    <span className="hp-input">{currentHP ?? ''}</span>
                    <span className="hp-lbl">Current</span>
                </div>
                <div className="hp-row">
                    <span className="hp-input small">{tempHP ?? ''}</span>
                    <span className="hp-lbl">Temp</span>
                </div>
            </div>
            {/* Combat Stats Column */}
            <div className="combat-stats-col">
                <div className="stat-row">
                    <span className="stat-val">{armorClass}</span>
                    <span className="stat-lbl">AC</span>
                </div>
                <div className="stat-row">
                    <span className="stat-val">{formatInitiative(initiative)}</span>
                    <span className="stat-lbl">Init</span>
                </div>
                <div className="stat-row">
                    <span className="stat-val">{speed}<span className="speed-ft">ft</span></span>
                    <span className="stat-lbl">Speed</span>
                </div>
            </div>
        </div>
        {/* Death Saves - Bottom Row */}
        <div className="combat-death-row">
            <span className="death-lbl">Death Saves</span>
            <div className="death-group success-group">
                <span className="death-group-lbl">S</span>
                {[0, 1, 2].map(i => (
                    <span key={`s${i}`} className={`death-dot success ${i < deathSaveSuccesses ? 'filled' : ''}`} />
                ))}
            </div>
            <div className="death-group failure-group">
                <span className="death-group-lbl">F</span>
                {[0, 1, 2].map(i => (
                    <span key={`f${i}`} className={`death-dot failure ${i < deathSaveFailures ? 'filled' : ''}`} />
                ))}
            </div>
        </div>
    </div>
);

/**
 * MetaStats - Stacked column with Inspiration, Prof, Passive, Hit Dice
 */
interface MetaStatsProps {
    hasInspiration: boolean;
    proficiencyBonus: number;
    passivePerception: number;
    hitDice: string;
}

const MetaStats: React.FC<MetaStatsProps> = ({
    hasInspiration,
    proficiencyBonus,
    passivePerception,
    hitDice
}) => (
    <div className="phb-section meta-stats-compact" data-testid="meta-stats">
        <div className="meta-row">
            <span className="meta-lbl">Inspiration</span>
            <span className={`meta-box ${hasInspiration ? 'filled' : ''}`}>
                {hasInspiration ? '✓' : ''}
            </span>
        </div>
        <div className="meta-row">
            <span className="meta-lbl-stack">
                <span>Proficiency</span>
                <span>Bonus</span>
            </span>
            <span className="meta-val">+{proficiencyBonus}</span>
        </div>
        <div className="meta-row">
            <span className="meta-lbl">Passive</span>
            <span className="meta-val">{passivePerception}</span>
        </div>
        <div className="meta-row">
            <span className="meta-lbl">Hit Dice</span>
            <span className="meta-val">{hitDice}</span>
        </div>
    </div>
);

/**
 * AbilityScoresRow - Combat Status + 6 Ability Boxes + Meta Stats
 */
export const AbilityScoresRow: React.FC<AbilityScoresRowProps> = ({
    scores,
    maxHP = 1,
    currentHP,
    tempHP,
    armorClass = 10,
    initiative = 0,
    speed = 30,
    hasInspiration = false,
    proficiencyBonus = 2,
    passivePerception = 10,
    hitDice = '1d10',
    deathSaveSuccesses = 0,
    deathSaveFailures = 0
}) => {
    return (
        <div className="ability-scores-row" data-testid="ability-scores-row">
            {/* Combat Status (left) */}
            <CombatStatus
                maxHP={maxHP}
                currentHP={currentHP}
                tempHP={tempHP}
                armorClass={armorClass}
                initiative={initiative}
                speed={speed}
                deathSaveSuccesses={deathSaveSuccesses}
                deathSaveFailures={deathSaveFailures}
            />

            {/* Ability Scores (center - 2 column grid) */}
            <AbilityScoresGrid scores={scores} />

            {/* Meta Stats (right) */}
            <MetaStats
                hasInspiration={hasInspiration}
                proficiencyBonus={proficiencyBonus}
                passivePerception={passivePerception}
                hitDice={hitDice}
            />
        </div>
    );
};

export default AbilityScoresRow;

