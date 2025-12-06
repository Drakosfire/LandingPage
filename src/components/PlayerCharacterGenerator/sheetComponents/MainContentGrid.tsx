/**
 * MainContentGrid Component
 * 
 * 3-column grid layout for the main character sheet content.
 * Matches the HTML prototype structure.
 * 
 * Layout (grid-template-columns: 200px 240px 200px):
 * ┌─────────────┬─────────────┬─────────────┐
 * │  Column 1   │  Column 2   │  Column 3   │
 * │             │             │             │
 * │ Inspiration │ Combat Row  │ Personality │
 * │ Prof Bonus  │ HP Section  │ Ideals      │
 * │ Saves       │ Hit Dice    │ Bonds       │
 * │ Skills      │ Death Saves │ Flaws       │
 * │ Passive     │ Attacks     │ Features    │
 * │ Proficiency │ Equipment   │             │
 * └─────────────┴─────────────┴─────────────┘
 * 
 * @module PlayerCharacterGenerator/sheetComponents
 */

import React from 'react';

export interface MainContentGridProps {
    /** Content for column 1 (Saves, Skills, etc.) */
    column1: React.ReactNode;
    /** Content for column 2 (Combat, HP, Equipment) */
    column2: React.ReactNode;
    /** Content for column 3 (Personality, Features) */
    column3: React.ReactNode;
}

/**
 * MainContentGrid - 3-column layout for main sheet content
 */
export const MainContentGrid: React.FC<MainContentGridProps> = ({
    column1,
    column2,
    column3
}) => {
    return (
        <div className="main-content" data-testid="main-content-grid">
            <div className="column-1" data-testid="column-1">
                {column1}
            </div>
            <div className="column-2" data-testid="column-2">
                {column2}
            </div>
            <div className="column-3" data-testid="column-3">
                {column3}
            </div>
        </div>
    );
};

export default MainContentGrid;

