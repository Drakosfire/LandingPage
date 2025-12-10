/**
 * SpellItem Component
 * 
 * Single spell entry with prepared checkbox, name, and markers.
 * 
 * @module PlayerCharacterGenerator/sheetComponents/spells
 */

import React from 'react';
import { InfoButton } from '../common';

export interface SpellItemProps {
    /** Spell name */
    name?: string;
    /** Whether spell is prepared (for prepared casters) */
    isPrepared?: boolean;
    /** Whether this is a ritual spell */
    isRitual?: boolean;
    /** Whether this spell requires concentration */
    isConcentration?: boolean;
    /** Whether to show the prepared checkbox (false for cantrips) */
    showPrepared?: boolean;
    /** Whether this is an empty placeholder row */
    isEmpty?: boolean;
    /** Callback for info button click */
    onInfoClick?: () => void;
    /** Whether the row is clickable (edit mode) */
    isClickable?: boolean;
}

/**
 * SpellItem - Single spell entry
 */
export const SpellItem: React.FC<SpellItemProps> = ({
    name = '',
    isPrepared = false,
    isRitual = false,
    isConcentration = false,
    showPrepared = true,
    isEmpty = false,
    onInfoClick,
    isClickable = false
}) => {
    const itemClasses = [
        'spell-item',
        isEmpty && 'empty',
        isClickable && 'clickable'
    ].filter(Boolean).join(' ');

    const preparedClasses = [
        'spell-prepared',
        isPrepared && 'checked'
    ].filter(Boolean).join(' ');

    const handleClick = () => {
        if (isClickable && onInfoClick) {
            onInfoClick();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (isClickable && onInfoClick && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onInfoClick();
        }
    };

    return (
        <div 
            className={itemClasses}
            onClick={isClickable ? handleClick : undefined}
            onKeyDown={isClickable ? handleKeyDown : undefined}
            role={isClickable ? 'button' : undefined}
            tabIndex={isClickable ? 0 : undefined}
        >
            {showPrepared && <div className={preparedClasses} />}
            <div className="spell-name">
                {name}
                {onInfoClick && !isEmpty && !isClickable && <InfoButton onClick={onInfoClick} size="sm" />}
            </div>
            {(isRitual || isConcentration) && !isEmpty && (
                <div className="spell-markers">
                    {isRitual && <span className="spell-marker" title="Ritual">R</span>}
                    {isConcentration && <span className="spell-marker" title="Concentration">C</span>}
                </div>
            )}
        </div>
    );
};

export default SpellItem;

