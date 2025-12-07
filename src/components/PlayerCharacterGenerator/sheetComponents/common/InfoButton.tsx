/**
 * InfoButton Component
 * 
 * Small circular button with question mark icon for triggering detail modals.
 * 
 * @module PlayerCharacterGenerator/sheetComponents/common
 */

import React from 'react';
import { IconQuestionMark } from '@tabler/icons-react';

export interface InfoButtonProps {
    /** Click handler to open detail modal */
    onClick: () => void;
    /** Button size */
    size?: 'sm' | 'md';
    /** Additional CSS class */
    className?: string;
}

/**
 * InfoButton - Circular info icon button
 */
export const InfoButton: React.FC<InfoButtonProps> = ({
    onClick,
    size = 'sm',
    className = ''
}) => {
    const sizeMap = { sm: 10, md: 12 };

    return (
        <button
            className={`info-button info-button--${size} ${className}`}
            onClick={(e) => {
                e.stopPropagation();
                onClick();
            }}
            aria-label="More information"
            type="button"
        >
            <IconQuestionMark size={sizeMap[size]} stroke={2.5} />
        </button>
    );
};

export default InfoButton;

