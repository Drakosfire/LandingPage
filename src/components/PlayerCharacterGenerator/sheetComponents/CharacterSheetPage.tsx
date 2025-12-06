/**
 * CharacterSheetPage Component
 * 
 * Main page container for PHB-styled character sheets.
 * Matches the HTML prototype structure from:
 *   specs/PlayerCharacterGenerator/prototypes/character-sheet.html
 * 
 * Structure:
 * - .phb-page.character-sheet container
 * - US Letter dimensions (816px × 1056px at 96dpi)
 * - Parchment background with fancy border
 * - Footer accent decoration
 * 
 * @module PlayerCharacterGenerator/sheetComponents
 */

import React from 'react';
import './CharacterSheet.css';

export interface CharacterSheetPageProps {
    /** Page content */
    children: React.ReactNode;
    /** Optional additional CSS class */
    className?: string;
    /** Test ID for testing */
    testId?: string;
}

/**
 * CharacterSheetPage - PHB-styled page container
 * 
 * Usage:
 * ```tsx
 * <CharacterSheetPage>
 *   <CharacterHeader character={character} />
 *   <AbilityScoresRow scores={scores} />
 *   <MainContentGrid>
 *     // Column content
 *   </MainContentGrid>
 * </CharacterSheetPage>
 * ```
 */
export const CharacterSheetPage: React.FC<CharacterSheetPageProps> = ({
    children,
    className = '',
    testId = 'character-sheet-page'
}) => {
    // 'page' and 'phb' classes are needed for global PHB CSS to apply backgrounds/borders
    // 'character-sheet' adds our custom layout overrides
    const pageClasses = [
        'page',           // Required for global PHB CSS
        'phb',            // Required for global PHB CSS  
        'phb-page',       // Additional hook
        'character-sheet', // Our custom styles
        className
    ].filter(Boolean).join(' ');

    return (
        <div
            className={pageClasses}
            data-testid={testId}
        >
            {children}
        </div>
    );
};

/**
 * CharacterSheetContainer - Wrapper for multiple pages
 * Used when character data spans multiple pages (spell lists, etc.)
 */
export interface CharacterSheetContainerProps {
    children: React.ReactNode;
    className?: string;
}

export const CharacterSheetContainer: React.FC<CharacterSheetContainerProps> = ({
    children,
    className = ''
}) => {
    const containerClasses = [
        'character-sheet-container',
        className
    ].filter(Boolean).join(' ');

    return (
        <div className={containerClasses}>
            {children}
        </div>
    );
};

export default CharacterSheetPage;

