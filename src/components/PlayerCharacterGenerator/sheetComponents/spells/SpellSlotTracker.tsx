/**
 * SpellSlotTracker Component
 * 
 * Horizontal row of spell slot level trackers.
 * 
 * @module PlayerCharacterGenerator/sheetComponents/spells
 */

import React from 'react';

export interface SpellSlotLevel {
    level: number;
    total: number;
    used: number;
}

export interface SpellSlotTrackerProps {
    /** Spell slots by level (1-9) */
    slots: SpellSlotLevel[];
}

/**
 * Format level ordinal
 */
const getLevelOrdinal = (level: number): string => {
    const suffixes = ['st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th', 'th'];
    return `${level}${suffixes[level - 1]}`;
};

/**
 * Single spell slot level box
 */
const SpellSlotLevelBox: React.FC<SpellSlotLevel> = ({ level, total, used }) => {
    const available = total - used;
    
    return (
        <div className="phb-section spell-slot-level">
            <div className="level-num">{getLevelOrdinal(level)}</div>
            <div className="slots-total">
                {total === 0 ? '—' : `${total} slot${total !== 1 ? 's' : ''}`}
            </div>
            <div className="slot-circles">
                {Array.from({ length: available }).map((_, idx) => (
                    <div key={`avail-${idx}`} className="slot-circle" />
                ))}
                {Array.from({ length: used }).map((_, idx) => (
                    <div key={`used-${idx}`} className="slot-circle used" />
                ))}
            </div>
        </div>
    );
};

/**
 * SpellSlotTracker - Full spell slot tracker row
 */
export const SpellSlotTracker: React.FC<SpellSlotTrackerProps> = ({ slots }) => {
    // Ensure we have slots 1-9
    const allSlots: SpellSlotLevel[] = [];
    for (let level = 1; level <= 9; level++) {
        const existing = slots.find(s => s.level === level);
        allSlots.push(existing ?? { level, total: 0, used: 0 });
    }

    return (
        <div className="spell-slots-section">
            {allSlots.map((slot) => (
                <SpellSlotLevelBox
                    key={slot.level}
                    level={slot.level}
                    total={slot.total}
                    used={slot.used}
                />
            ))}
        </div>
    );
};

export default SpellSlotTracker;

