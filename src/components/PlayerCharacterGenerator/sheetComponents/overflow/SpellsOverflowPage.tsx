/**
 * SpellsOverflowPage Component
 * 
 * Continuation page for spells that overflow from the main SpellSheet.
 * Uses the same PHB parchment styling as other character sheet pages.
 * Supports multi-page overflow with "(continued)" labels for levels
 * that span pages.
 * 
 * @module PlayerCharacterGenerator/sheetComponents/overflow
 */

import React from 'react';
import type { SpellEntry } from '../spells';
import type { SpellOverflowPageData } from '../../hooks/useSpellsOverflow';
import './SpellsOverflowPage.css';

export interface SpellsOverflowPageProps {
    /** Overflow page data with spells organized by level */
    pageData: SpellOverflowPageData;
    /** Character name for header */
    characterName?: string;
    /** Overall page number in the character sheet */
    pageNumber?: number;
    /** Current overflow page (1-indexed) within spell overflow */
    currentOverflowPage?: number;
    /** Total number of spell overflow pages */
    totalOverflowPages?: number;
    /** Callback when info button is clicked on a spell */
    onSpellInfoClick?: (spell: SpellEntry) => void;
}

/**
 * Get level title with optional "(continued)" suffix
 */
const getLevelTitle = (level: number, isContinued: boolean): string => {
    const baseTitle = level === 0 
        ? 'Cantrips' 
        : `${level}${['st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th', 'th'][level - 1]} Level`;
    
    return isContinued ? `${baseTitle} (continued)` : baseTitle;
};

/**
 * SpellsOverflowPage - Continuation page with PHB parchment styling
 * 
 * Uses the same .page.phb classes as CharacterSheetPage to get:
 * - Parchment background texture
 * - Fancy decorative border
 * - Footer accent decoration
 */
export const SpellsOverflowPage: React.FC<SpellsOverflowPageProps> = ({
    pageData,
    characterName = 'Character',
    pageNumber,
    currentOverflowPage = 1,
    totalOverflowPages = 1,
    onSpellInfoClick
}) => {
    const { spellsByLevel, continuedLevels } = pageData;
    
    // Get sorted levels for this page
    const levels = Array.from(spellsByLevel.keys()).sort((a, b) => a - b);
    
    if (levels.length === 0) return null;
    
    // Build header text with page indicator for multi-page overflow
    const headerText = totalOverflowPages > 1
        ? `${characterName} — Spells (Continued ${currentOverflowPage}/${totalOverflowPages})`
        : `${characterName} — Spells (Continued)`;
    
    // Count total spells on this page
    const totalSpells = Array.from(spellsByLevel.values()).reduce(
        (sum, spells) => sum + spells.length, 
        0
    );
    
    return (
        <div className="page phb character-sheet overflow-page spells-overflow-page">
            {/* Header */}
            <header className="overflow-page-header">
                <h2 className="overflow-page-title">{headerText}</h2>
                {pageNumber && (
                    <span className="overflow-page-number">Page {pageNumber}</span>
                )}
            </header>
            
            {/* Spell Levels */}
            <div className="overflow-spells-list">
                {levels.map(level => {
                    const spells = spellsByLevel.get(level) || [];
                    const isContinued = continuedLevels.includes(level);
                    
                    return (
                        <div key={`level-${level}`} className="overflow-spell-level">
                            <h3 className={`overflow-level-header ${isContinued ? 'continued' : ''}`}>
                                {getLevelTitle(level, isContinued)}
                            </h3>
                            <div className="overflow-spell-level-list">
                                {spells.map((spell, idx) => (
                                    <div 
                                        key={spell.id || `spell-${idx}`} 
                                        className="overflow-spell-item"
                                        onClick={() => onSpellInfoClick?.(spell)}
                                        role={onSpellInfoClick ? 'button' : undefined}
                                        tabIndex={onSpellInfoClick ? 0 : undefined}
                                    >
                                        {/* Prepared indicator for leveled spells */}
                                        {level > 0 && spell.isPrepared !== undefined && (
                                            <span className={`prepared-indicator ${spell.isPrepared ? 'prepared' : ''}`}>
                                                {spell.isPrepared ? '●' : '○'}
                                            </span>
                                        )}
                                        
                                        <span className="spell-name">{spell.name}</span>
                                        
                                        {/* Spell tags */}
                                        {spell.isConcentration && (
                                            <span className="spell-tag concentration" title="Concentration">C</span>
                                        )}
                                        {spell.isRitual && (
                                            <span className="spell-tag ritual" title="Ritual">R</span>
                                        )}
                                        
                                        {/* Info button */}
                                        {onSpellInfoClick && (
                                            <span className="spell-info-btn" title="View spell details">ⓘ</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
            
            {/* Footer */}
            <footer className="overflow-page-footer">
                <span className="overflow-page-count">
                    {totalSpells} spell{totalSpells !== 1 ? 's' : ''} on this page
                    {totalOverflowPages > 1 && ` • Overflow page ${currentOverflowPage} of ${totalOverflowPages}`}
                </span>
            </footer>
        </div>
    );
};

export default SpellsOverflowPage;

