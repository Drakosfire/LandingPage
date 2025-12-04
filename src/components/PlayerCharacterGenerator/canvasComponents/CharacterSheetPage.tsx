/**
 * CharacterSheetPage Component
 * 
 * Single page wrapper using PHB styling conventions.
 * Wraps content in .page.phb + .columnWrapper structure.
 * 
 * Based on Homebrewery HTML structure:
 * <div class="page phb" id="pageN">
 *   <div class="columnWrapper">
 *     <!-- content -->
 *   </div>
 * </div>
 * 
 * @module PlayerCharacterGenerator/canvasComponents/CharacterSheetPage
 */

import React from 'react';

export interface CharacterSheetPageProps {
    /** Page number (1-indexed) */
    pageNumber: number;
    /** Total number of pages */
    totalPages: number;
    /** Page content (sections/frames) */
    children: React.ReactNode;
    /** Optional: Use two-column layout (default: true) */
    twoColumn?: boolean;
    /** Optional: Additional CSS classes for the page */
    className?: string;
}

/**
 * Single page wrapper for PHB-style character sheets.
 * 
 * Usage:
 * ```tsx
 * <CharacterSheetPage pageNumber={1} totalPages={3}>
 *   <div className="block character frame">
 *     <!-- content -->
 *   </div>
 * </CharacterSheetPage>
 * ```
 */
export const CharacterSheetPage: React.FC<CharacterSheetPageProps> = ({
    pageNumber,
    totalPages,
    children,
    twoColumn = true,
    className = ''
}) => {
    const pageClasses = [
        'page',
        'phb',
        className
    ].filter(Boolean).join(' ');

    return (
        <div
            className={pageClasses}
            id={`page${pageNumber}`}
            data-page-number={pageNumber}
            data-total-pages={totalPages}
        >
            <div className={twoColumn ? 'columnWrapper' : ''}>
                {children}
            </div>

            {/* Page number footer */}
            <div className="page-number">
                {pageNumber}
            </div>
        </div>
    );
};

/**
 * Container for multiple pages (brewRenderer pattern)
 */
export interface CharacterSheetContainerProps {
    /** Page components */
    children: React.ReactNode;
    /** Optional: Additional CSS classes */
    className?: string;
}

export const CharacterSheetContainer: React.FC<CharacterSheetContainerProps> = ({
    children,
    className = ''
}) => {
    const containerClasses = [
        'brewRenderer',
        'dm-canvas-responsive',
        className
    ].filter(Boolean).join(' ');

    return (
        <div className={containerClasses}>
            <div className="pages">
                {children}
            </div>
        </div>
    );
};

/**
 * Character frame block - wrapper for content sections
 * Uses .character.frame instead of .monster.frame
 */
export interface CharacterFrameProps {
    /** Frame content */
    children: React.ReactNode;
    /** Frame ID for targeting */
    id?: string;
    /** Span both columns */
    wide?: boolean;
    /** Section title */
    title?: string;
    /** Additional CSS classes */
    className?: string;
}

export const CharacterFrame: React.FC<CharacterFrameProps> = ({
    children,
    id,
    wide = false,
    title,
    className = ''
}) => {
    const frameClasses = [
        'block',
        'character',
        'frame',
        wide ? 'wide' : '',
        className
    ].filter(Boolean).join(' ');

    return (
        <div className={frameClasses} id={id}>
            {title && <h4>{title}</h4>}
            {children}
        </div>
    );
};

export default CharacterSheetPage;

