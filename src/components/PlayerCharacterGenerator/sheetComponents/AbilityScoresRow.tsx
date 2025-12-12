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
import { usePlayerCharacterGenerator } from '../PlayerCharacterGeneratorProvider';
import { EditableText } from './EditableText';

/**
 * Wizard step constants for navigation
 */
const WIZARD_STEPS = {
    BASICS: 0,
    ABILITIES: 1,
    RACE: 2,
    CLASS: 3,
    SPELLS: 4,
    BACKGROUND: 5,
    EQUIPMENT: 6,
    REVIEW: 7
} as const;

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
 * In edit mode, clicking opens the ability scores drawer (complex edit)
 */
interface AbilityBoxProps {
    abbrev: string;
    score: number;
    onClick?: () => void;
}

const AbilityBox: React.FC<AbilityBoxProps> = ({ abbrev, score, onClick }) => (
    <div
        className="ability-box-horizontal"
        data-testid={`ability-${abbrev.toLowerCase()}`}
        data-editable="complex"
        onClick={onClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
    >
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
    onAbilityClick?: () => void;
}

const AbilityScoresGrid: React.FC<AbilityScoresGridProps> = ({ scores, onAbilityClick }) => {
    // Split abilities into two columns: STR/DEX/CON (physical) and INT/WIS/CHA (mental)
    const leftColumn = ABILITIES.slice(0, 3);  // STR, DEX, CON
    const rightColumn = ABILITIES.slice(3, 6); // INT, WIS, CHA

    return (
        <div className="phb-section ability-scores-grid" data-testid="ability-scores-grid">
            <div className="ability-col">
                {leftColumn.map(({ key, abbrev }) => (
                    <AbilityBox
                        key={key}
                        abbrev={abbrev}
                        score={scores[key] ?? 10}
                        onClick={onAbilityClick}
                    />
                ))}
            </div>
            <div className="ability-col">
                {rightColumn.map(({ key, abbrev }) => (
                    <AbilityBox
                        key={key}
                        abbrev={abbrev}
                        score={scores[key] ?? 10}
                        onClick={onAbilityClick}
                    />
                ))}
            </div>
        </div>
    );
};

/**
 * DeathSaveDot - Individual clickable death save dot
 * In edit mode, clicking toggles the save state
 */
interface DeathSaveDotProps {
    index: number;
    filled: boolean;
    type: 'success' | 'failure';
    onClick?: () => void;
    isEditMode?: boolean;
}

const DeathSaveDot: React.FC<DeathSaveDotProps> = ({ index, filled, type, onClick, isEditMode }) => (
    <span
        key={`${type}-${index}`}
        className={`death-dot ${type} ${filled ? 'filled' : ''} ${isEditMode ? 'clickable' : ''}`}
        onClick={isEditMode ? onClick : undefined}
        role={isEditMode ? 'button' : undefined}
        tabIndex={isEditMode ? 0 : undefined}
        onKeyDown={isEditMode ? (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick?.();
            }
        } : undefined}
        aria-label={isEditMode ? `Toggle death save ${type} ${index + 1}` : undefined}
    />
);

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
    /** Click handler for AC (opens Equipment step) */
    onACClick?: () => void;
    /** Click handler for Speed (opens Race step) */
    onSpeedClick?: () => void;
    /** Change handler for current HP */
    onCurrentHPChange?: (value: number) => void;
    /** Change handler for temp HP */
    onTempHPChange?: (value: number) => void;
    /** Change handler for death save successes */
    onDeathSaveSuccessClick?: (index: number) => void;
    /** Change handler for death save failures */
    onDeathSaveFailureClick?: (index: number) => void;
    /** Whether edit mode is active */
    isEditMode?: boolean;
}

const CombatStatus: React.FC<CombatStatusProps> = ({
    maxHP,
    currentHP,
    tempHP,
    armorClass,
    initiative,
    speed,
    deathSaveSuccesses,
    deathSaveFailures,
    onACClick,
    onSpeedClick,
    onCurrentHPChange,
    onTempHPChange,
    onDeathSaveSuccessClick,
    onDeathSaveFailureClick,
    isEditMode
}) => (
    <div className="phb-section combat-status-compact" data-testid="combat-status">
        <div className="combat-stats-grid">
            {/* HP Column */}
            <div className="combat-hp-col">
                <div className="hp-row">
                    <span className="hp-val">{maxHP}</span>
                    <span className="hp-lbl">HP Max</span>
                </div>
                <div className="hp-row" data-editable="quick">
                    <span className="hp-input">
                        {onCurrentHPChange ? (
                            <EditableText
                                value={currentHP ?? 0}
                                onChange={(v) => onCurrentHPChange(Number(v))}
                                type="number"
                                min={0}
                                max={maxHP}
                                placeholder="0"
                            />
                        ) : (
                            currentHP ?? ''
                        )}
                    </span>
                    <span className="hp-lbl">Current</span>
                </div>
                <div className="hp-row" data-editable="quick">
                    <span className="hp-input small">
                        {onTempHPChange ? (
                            <EditableText
                                value={tempHP ?? 0}
                                onChange={(v) => onTempHPChange(Number(v))}
                                type="number"
                                min={0}
                                placeholder="0"
                            />
                        ) : (
                            tempHP ?? ''
                        )}
                    </span>
                    <span className="hp-lbl">Temp</span>
                </div>
            </div>
            {/* Combat Stats Column */}
            <div className="combat-stats-col">
                <div
                    className="stat-row"
                    data-editable="complex"
                    onClick={onACClick}
                    role={onACClick ? 'button' : undefined}
                    tabIndex={onACClick ? 0 : undefined}
                >
                    <span className="stat-val">{armorClass}</span>
                    <span className="stat-lbl">AC</span>
                </div>
                <div className="stat-row">
                    <span className="stat-val">{formatInitiative(initiative)}</span>
                    <span className="stat-lbl">Init</span>
                </div>
                <div
                    className="stat-row"
                    data-editable="complex"
                    onClick={onSpeedClick}
                    role={onSpeedClick ? 'button' : undefined}
                    tabIndex={onSpeedClick ? 0 : undefined}
                >
                    <span className="stat-val">{speed}<span className="speed-ft">ft</span></span>
                    <span className="stat-lbl">Speed</span>
                </div>
            </div>
        </div>
        {/* Death Saves - Bottom Row */}
        <div className="combat-death-row" data-editable="quick">
            <span className="death-lbl">Death Saves</span>
            <div className="death-group success-group">
                <span className="death-group-lbl">S</span>
                {[0, 1, 2].map(i => (
                    <DeathSaveDot
                        key={`s${i}`}
                        index={i}
                        filled={i < deathSaveSuccesses}
                        type="success"
                        onClick={() => onDeathSaveSuccessClick?.(i)}
                        isEditMode={isEditMode}
                    />
                ))}
            </div>
            <div className="death-group failure-group">
                <span className="death-group-lbl">F</span>
                {[0, 1, 2].map(i => (
                    <DeathSaveDot
                        key={`f${i}`}
                        index={i}
                        filled={i < deathSaveFailures}
                        type="failure"
                        onClick={() => onDeathSaveFailureClick?.(i)}
                        isEditMode={isEditMode}
                    />
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
    /** Click handler for inspiration toggle */
    onInspirationToggle?: () => void;
    /** Whether edit mode is active */
    isEditMode?: boolean;
}

const MetaStats: React.FC<MetaStatsProps> = ({
    hasInspiration,
    proficiencyBonus,
    passivePerception,
    hitDice,
    onInspirationToggle,
    isEditMode
}) => (
    <div className="phb-section meta-stats-compact" data-testid="meta-stats">
        <div className="meta-row" data-editable="quick">
            <span className="meta-lbl">Inspiration</span>
            <span
                className={`inspiration-box ${hasInspiration ? 'filled' : ''} ${isEditMode ? 'clickable' : ''}`}
                onClick={isEditMode ? onInspirationToggle : undefined}
                role={isEditMode ? 'button' : undefined}
                tabIndex={isEditMode ? 0 : undefined}
                onKeyDown={isEditMode ? (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onInspirationToggle?.();
                    }
                } : undefined}
                aria-label={isEditMode ? `Toggle inspiration (currently ${hasInspiration ? 'on' : 'off'})` : undefined}
                aria-pressed={hasInspiration}
            >
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
 * 
 * In Edit Mode, complex fields open the wizard drawer:
 * - Ability scores → Abilities step (0)
 * - AC, Speed → Equipment step (5) since they're derived from gear
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
    const { isEditMode, openDrawerToStep, updateDnD5eData } = usePlayerCharacterGenerator();

    // Click handler for ability scores (opens Abilities step)
    const handleAbilityClick = () => {
        if (isEditMode) {
            console.log('🔗 [AbilityScoresRow] Opening Abilities step');
            openDrawerToStep(WIZARD_STEPS.ABILITIES);
        }
    };

    // Click handler for AC (opens Equipment step - armor determines AC)
    const handleACClick = () => {
        if (isEditMode) {
            console.log('🔗 [AbilityScoresRow] Opening Equipment step (AC)');
            openDrawerToStep(WIZARD_STEPS.EQUIPMENT);
        }
    };

    // Click handler for Speed (opens Race step - race determines base speed)
    const handleSpeedClick = () => {
        if (isEditMode) {
            console.log('🔗 [AbilityScoresRow] Opening Race step (Speed)');
            openDrawerToStep(WIZARD_STEPS.RACE);
        }
    };

    // Change handlers for HP (quick edit)
    // HP is stored in derivedStats.currentHp / tempHp
    const handleCurrentHPChange = (value: number) => {
        console.log('✏️ [AbilityScoresRow] Current HP changed:', value);
        // Note: This requires access to current derivedStats to properly merge
        // For now, we update through character context which has access to full state
        updateDnD5eData({
            derivedStats: {
                armorClass: armorClass,
                initiative: initiative,
                proficiencyBonus: proficiencyBonus,
                speed: { walk: speed },
                maxHp: maxHP,
                currentHp: value,
                tempHp: tempHP ?? 0,
                hitDice: { total: 1, current: 1, size: 8 },
                passivePerception: passivePerception,
                passiveInvestigation: 10,
                passiveInsight: 10
            }
        });
    };

    const handleTempHPChange = (value: number) => {
        console.log('✏️ [AbilityScoresRow] Temp HP changed:', value);
        updateDnD5eData({
            derivedStats: {
                armorClass: armorClass,
                initiative: initiative,
                proficiencyBonus: proficiencyBonus,
                speed: { walk: speed },
                maxHp: maxHP,
                currentHp: currentHP ?? maxHP,
                tempHp: value,
                hitDice: { total: 1, current: 1, size: 8 },
                passivePerception: passivePerception,
                passiveInvestigation: 10,
                passiveInsight: 10
            }
        });
    };

    // Death save click handler - toggle behavior
    // Clicking a dot toggles: if already filled at that position, unfill; otherwise fill up to that position
    const handleDeathSaveSuccessClick = (index: number) => {
        if (!isEditMode) return;

        // Toggle logic: if clicking a filled dot, reduce count; otherwise set count to index + 1
        const newCount = index < deathSaveSuccesses ? index : index + 1;
        console.log('✏️ [AbilityScoresRow] Death save success clicked:', { index, current: deathSaveSuccesses, newCount });

        updateDnD5eData({
            derivedStats: {
                armorClass: armorClass,
                initiative: initiative,
                proficiencyBonus: proficiencyBonus,
                speed: { walk: speed },
                maxHp: maxHP,
                currentHp: currentHP ?? maxHP,
                tempHp: tempHP ?? 0,
                hitDice: { total: 1, current: 1, size: 8 },
                deathSaves: { successes: newCount, failures: deathSaveFailures },
                passivePerception: passivePerception,
                passiveInvestigation: 10,
                passiveInsight: 10
            }
        });
    };

    const handleDeathSaveFailureClick = (index: number) => {
        if (!isEditMode) return;

        // Toggle logic: if clicking a filled dot, reduce count; otherwise set count to index + 1
        const newCount = index < deathSaveFailures ? index : index + 1;
        console.log('✏️ [AbilityScoresRow] Death save failure clicked:', { index, current: deathSaveFailures, newCount });

        updateDnD5eData({
            derivedStats: {
                armorClass: armorClass,
                initiative: initiative,
                proficiencyBonus: proficiencyBonus,
                speed: { walk: speed },
                maxHp: maxHP,
                currentHp: currentHP ?? maxHP,
                tempHp: tempHP ?? 0,
                hitDice: { total: 1, current: 1, size: 8 },
                deathSaves: { successes: deathSaveSuccesses, failures: newCount },
                passivePerception: passivePerception,
                passiveInvestigation: 10,
                passiveInsight: 10
            }
        });
    };

    // Inspiration toggle handler
    const handleInspirationToggle = () => {
        if (!isEditMode) return;

        const newValue = !hasInspiration;
        console.log('✏️ [AbilityScoresRow] Inspiration toggled:', newValue);

        updateDnD5eData({
            derivedStats: {
                armorClass: armorClass,
                initiative: initiative,
                proficiencyBonus: proficiencyBonus,
                speed: { walk: speed },
                maxHp: maxHP,
                currentHp: currentHP ?? maxHP,
                tempHp: tempHP ?? 0,
                hitDice: { total: 1, current: 1, size: 8 },
                deathSaves: { successes: deathSaveSuccesses, failures: deathSaveFailures },
                hasInspiration: newValue,
                passivePerception: passivePerception,
                passiveInvestigation: 10,
                passiveInsight: 10
            }
        });
    };

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
                onACClick={handleACClick}
                onSpeedClick={handleSpeedClick}
                onCurrentHPChange={handleCurrentHPChange}
                onTempHPChange={handleTempHPChange}
                onDeathSaveSuccessClick={handleDeathSaveSuccessClick}
                onDeathSaveFailureClick={handleDeathSaveFailureClick}
                isEditMode={isEditMode}
            />

            {/* Ability Scores (center - 2 column grid) */}
            <AbilityScoresGrid
                scores={scores}
                onAbilityClick={handleAbilityClick}
            />

            {/* Meta Stats (right) */}
            <MetaStats
                hasInspiration={hasInspiration}
                proficiencyBonus={proficiencyBonus}
                onInspirationToggle={handleInspirationToggle}
                isEditMode={isEditMode}
                passivePerception={passivePerception}
                hitDice={hitDice}
            />
        </div>
    );
};

export default AbilityScoresRow;

