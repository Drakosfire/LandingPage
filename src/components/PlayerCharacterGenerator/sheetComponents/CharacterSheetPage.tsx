/**
 * CharacterSheetPage Component
 * 
 * Main page container for PHB-styled character sheets.
 * Matches the HTML prototype structure from:
 *   specs/PlayerCharacterGenerator/prototypes/character-sheet.html
 * 
 * Structure:
 * - .page.phb.character-sheet container
 * - US Letter dimensions (816px × 1056px at 96dpi)
 * - Parchment background with fancy border (from global PHB CSS)
 * - Footer accent decoration (from global PHB CSS ::after)
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
 * The parchment background, fancy border, and footer accent are all
 * provided by the global PHB CSS (public/dnd-static/style.css) via
 * the `.page.phb` selector. This component just needs the right classes.
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
    // 'page phb' triggers global PHB CSS (parchment background, border, footer)
    // 'character-sheet' adds our custom layout overrides
    const pageClasses = [
        'page',            // Base page styles
        'phb',             // PHB theme (parchment, border, footer accent)
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

