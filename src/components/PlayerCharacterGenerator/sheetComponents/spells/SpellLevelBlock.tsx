/**
 * SpellLevelBlock Component
 * 
 * Block containing spells of a specific level with header.
 * Supports edit mode for adding and editing spells.
 * 
 * @module PlayerCharacterGenerator/sheetComponents/spells
 */

import React from 'react';
import { SpellItem } from './SpellItem';
import { AddSpellRow } from './AddSpellRow';
import { usePlayerCharacterGenerator } from '../../PlayerCharacterGeneratorProvider';
import type { SpellSchool } from '../../types/dnd5e/spell.types';
import type { DamageType } from '../../types/system.types';

export interface SpellEntry {
    id: string;
    name: string;
    isPrepared?: boolean;
    isRitual?: boolean;
    isConcentration?: boolean;

    // Extended fields for detail modal (optional)
    level?: number;
    school?: SpellSchool;
    castingTime?: string;
    range?: string;
    components?: {
        verbal: boolean;
        somatic: boolean;
        material: boolean;
        materialDescription?: string;
    };
    duration?: string;
    description?: string;
    higherLevels?: string;
    damage?: { type: DamageType; dice: string };
    healing?: { dice: string };
    imageUrl?: string;
    source?: string;
}

export interface SpellLevelBlockProps {
    /** Spell level (0 for cantrips, 1-9 for leveled spells) */
    level: number;
    /** Spells at this level */
    spells: SpellEntry[];
    /** Total spell slots at this level */
    totalSlots?: number;
    /** Used spell slots at this level */
    usedSlots?: number;
    /** Number of empty rows to add */
    emptyRows?: number;
    /** Callback when info button is clicked on a spell */
    onSpellInfoClick?: (spell: SpellEntry) => void;
    /** Callback when add spell is clicked (edit mode) */
    onAddSpell?: (level: number) => void;
    /** Callback when existing spell is clicked for editing (edit mode) */
    onSpellEdit?: (spell: SpellEntry) => void;
}

/**
 * Format level title
 */
const getLevelTitle = (level: number): string => {
    if (level === 0) return 'Cantrips';
    const suffixes = ['st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th', 'th'];
    return `${level}${suffixes[level - 1]} Level`;
};

/**
 * Format slot info display
 */
const getSlotInfo = (level: number, total?: number, used?: number): string => {
    if (level === 0) return 'at will';
    if (total === undefined || total === 0) return '—';

    // Show circles: ○ for available, ● for used
    const available = total - (used ?? 0);
    return '○'.repeat(available) + '●'.repeat(used ?? 0);
};

/**
 * SpellLevelBlock - Spell level section with header
 */
export const SpellLevelBlock: React.FC<SpellLevelBlockProps> = ({
    level,
    spells,
    totalSlots,
    usedSlots,
    emptyRows = 2,
    onSpellInfoClick,
    onAddSpell,
    onSpellEdit
}) => {
    const { isEditMode } = usePlayerCharacterGenerator();
    const isCantrips = level === 0;

    const blockClasses = [
        'phb-section',
        'spell-level-block',
        isCantrips && 'cantrips'
    ].filter(Boolean).join(' ');

    // Determine click handler for spells based on mode
    const handleSpellClick = (spell: SpellEntry) => {
        if (isEditMode && onSpellEdit) {
            console.log('✏️ [SpellLevelBlock] Edit spell:', spell.name);
            onSpellEdit(spell);
        } else if (onSpellInfoClick) {
            onSpellInfoClick(spell);
        }
    };

    // Handle add spell click
    const handleAddSpell = () => {
        if (onAddSpell) {
            console.log('➕ [SpellLevelBlock] Add spell at level:', level);
            onAddSpell(level);
        }
    };

    return (
        <div className={blockClasses}>
            <div className="spell-level-header">
                <span className="level-title">{getLevelTitle(level)}</span>
                <span className="slot-info">{getSlotInfo(level, totalSlots, usedSlots)}</span>
            </div>
            <div className="spell-level-list">
                {spells.map((spell) => (
                    <SpellItem
                        key={spell.id}
                        name={spell.name}
                        isPrepared={spell.isPrepared}
                        isRitual={spell.isRitual}
                        isConcentration={spell.isConcentration}
                        showPrepared={!isCantrips}
                        onInfoClick={(onSpellInfoClick || (isEditMode && onSpellEdit)) ? () => handleSpellClick(spell) : undefined}
                        isClickable={isEditMode && !!onSpellEdit}
                    />
                ))}
                {/* Show Add Spell row in edit mode when callback provided */}
                {isEditMode && onAddSpell && (
                    <AddSpellRow onAddSpell={handleAddSpell} />
                )}
                {/* Only show empty rows when NOT in edit mode (replaced by AddSpellRow) */}
                {!isEditMode && Array.from({ length: emptyRows }).map((_, idx) => (
                    <SpellItem
                        key={`empty-${idx}`}
                        isEmpty
                        showPrepared={!isCantrips}
                    />
                ))}
            </div>
        </div>
    );
};

export default SpellLevelBlock;

