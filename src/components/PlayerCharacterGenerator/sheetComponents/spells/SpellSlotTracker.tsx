/**
 * SpellSlotTracker Component
 * 
 * Horizontal row of spell slot level trackers.
 * 
 * Edit Mode Support:
 * - Click on slot circles to toggle used/available (Quick Edit)
 * 
 * @module PlayerCharacterGenerator/sheetComponents/spells
 */

import React from 'react';
import { usePlayerCharacterGenerator } from '../../PlayerCharacterGeneratorProvider';

export interface SpellSlotLevel {
    level: number;
    total: number;
    used: number;
}

export interface SpellSlotTrackerProps {
    /** Spell slots by level (1-9) */
    slots: SpellSlotLevel[];
    /** Callback when slot usage changes */
    onSlotUsageChange?: (level: number, used: number) => void;
}

/**
 * Format level ordinal
 */
const getLevelOrdinal = (level: number): string => {
    const suffixes = ['st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th', 'th'];
    return `${level}${suffixes[level - 1]}`;
};

interface SpellSlotLevelBoxProps extends SpellSlotLevel {
    /** Callback when slot usage changes */
    onSlotUsageChange?: (used: number) => void;
    /** Whether edit mode is active */
    isEditMode?: boolean;
}

/**
 * Single spell slot level box
 * In edit mode, clicking a circle toggles its state
 */
const SpellSlotLevelBox: React.FC<SpellSlotLevelBoxProps> = ({ 
    level, 
    total, 
    used, 
    onSlotUsageChange,
    isEditMode 
}) => {
    const available = total - used;

    // Click handler for slot circles
    // Clicking an available slot marks it as used
    // Clicking a used slot marks it as available
    const handleSlotClick = (slotIndex: number, isUsed: boolean) => {
        if (!isEditMode || !onSlotUsageChange) return;
        
        if (isUsed) {
            // Clicking a used slot: reduce used count (marks rightmost used as available)
            const newUsed = Math.max(0, used - 1);
            console.log(`✏️ [SpellSlotTracker] Level ${level}: ${used} → ${newUsed} used`);
            onSlotUsageChange(newUsed);
        } else {
            // Clicking an available slot: increase used count
            const newUsed = Math.min(total, used + 1);
            console.log(`✏️ [SpellSlotTracker] Level ${level}: ${used} → ${newUsed} used`);
            onSlotUsageChange(newUsed);
        }
    };
    
    return (
        <div 
            className="phb-section spell-slot-level"
            data-editable={onSlotUsageChange ? "quick" : undefined}
        >
            <div className="level-num">{getLevelOrdinal(level)}</div>
            <div className="slots-total">
                {total === 0 ? '—' : `${total} slot${total !== 1 ? 's' : ''}`}
            </div>
            <div className="slot-circles">
                {/* Available slots (clickable to mark as used) */}
                {Array.from({ length: available }).map((_, idx) => (
                    <div 
                        key={`avail-${idx}`} 
                        className={`slot-circle ${isEditMode ? 'clickable' : ''}`}
                        onClick={() => handleSlotClick(idx, false)}
                        role={isEditMode ? 'button' : undefined}
                        tabIndex={isEditMode ? 0 : undefined}
                        onKeyDown={isEditMode ? (e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                handleSlotClick(idx, false);
                            }
                        } : undefined}
                        aria-label={isEditMode ? `Mark slot ${idx + 1} as used` : undefined}
                    />
                ))}
                {/* Used slots (clickable to mark as available) */}
                {Array.from({ length: used }).map((_, idx) => (
                    <div 
                        key={`used-${idx}`} 
                        className={`slot-circle used ${isEditMode ? 'clickable' : ''}`}
                        onClick={() => handleSlotClick(idx, true)}
                        role={isEditMode ? 'button' : undefined}
                        tabIndex={isEditMode ? 0 : undefined}
                        onKeyDown={isEditMode ? (e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                handleSlotClick(idx, true);
                            }
                        } : undefined}
                        aria-label={isEditMode ? `Mark slot ${idx + 1} as available` : undefined}
                    />
                ))}
            </div>
        </div>
    );
};

/**
 * SpellSlotTracker - Full spell slot tracker row
 * Only shows slot levels that have at least 1 slot
 * 
 * In Edit Mode, clicking circles toggles used/available state
 */
export const SpellSlotTracker: React.FC<SpellSlotTrackerProps> = ({ slots, onSlotUsageChange }) => {
    const { isEditMode } = usePlayerCharacterGenerator();

    // Filter to only show levels with slots
    const visibleSlots = slots
        .filter(s => s.total > 0)
        .sort((a, b) => a.level - b.level);

    // Don't render anything if no slots
    if (visibleSlots.length === 0) return null;

    // Handler for individual level slot usage changes
    const handleLevelUsageChange = (level: number, used: number) => {
        if (onSlotUsageChange) {
            onSlotUsageChange(level, used);
        }
    };

    return (
        <div className="spell-slots-section">
            {visibleSlots.map((slot) => (
                <SpellSlotLevelBox
                    key={slot.level}
                    level={slot.level}
                    total={slot.total}
                    used={slot.used}
                    onSlotUsageChange={onSlotUsageChange ? (used) => handleLevelUsageChange(slot.level, used) : undefined}
                    isEditMode={isEditMode}
                />
            ))}
        </div>
    );
};

export default SpellSlotTracker;

