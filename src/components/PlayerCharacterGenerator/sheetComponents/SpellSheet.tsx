/**
 * SpellSheet Component
 * 
 * Full spellcasting page with PHB styling.
 * Includes header, spell slot tracker, and 3-column spell list.
 * Supports edit mode for adding/editing/removing spells.
 * 
 * Layout:
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │                            SPELLCASTING                                  │
 * │ ┌──────────────────────────────────────────────────────────────────────┐│
 * │ │ Spellcasting Class │ Ability │ Spell Save DC │ Spell Attack          ││
 * │ └──────────────────────────────────────────────────────────────────────┘│
 * │ ┌───┬───┬───┬───┬───┬───┬───┬───┬───┐                                   │
 * │ │1st│2nd│3rd│4th│5th│6th│7th│8th│9th│  ← Spell slot tracker             │
 * │ │○○●│○○○│○○ │○  │   │   │   │   │   │                                   │
 * │ └───┴───┴───┴───┴───┴───┴───┴───┴───┘                                   │
 * │ ┌──────────────────┬──────────────────┬──────────────────┐              │
 * │ │    Column 1      │    Column 2      │    Column 3      │              │
 * │ │  Cantrips        │  2nd Level       │  5th Level       │              │
 * │ │  1st Level       │  3rd Level       │  6th Level       │              │
 * │ │                  │  4th Level       │  7th-9th Level   │              │
 * │ └──────────────────┴──────────────────┴──────────────────┘              │
 * └─────────────────────────────────────────────────────────────────────────┘
 * 
 * @module PlayerCharacterGenerator/sheetComponents
 */

import React, { useState, useCallback } from 'react';
import { CharacterSheetPage } from './CharacterSheetPage';
import {
    SpellHeader,
    SpellSlotTracker,
    SpellLevelBlock,
    SpellSlotLevel,
    SpellEntry
} from './spells';
import { SpellDetailModal, SpellEditModal } from './modals';
import { useDetailModal } from '../hooks/useDetailModal';
import { usePlayerCharacterGenerator } from '../PlayerCharacterGeneratorProvider';

export interface SpellSheetProps {
    /** Spellcasting class name */
    spellcastingClass: string;
    /** Spellcasting ability (INT, WIS, CHA) */
    spellcastingAbility: string;
    /** Spell save DC */
    spellSaveDC: number;
    /** Spell attack bonus */
    spellAttackBonus: number;

    /** Spell slots by level */
    spellSlots: SpellSlotLevel[];

    /** Cantrips (level 0) */
    cantrips: SpellEntry[];
    /** 1st level spells */
    level1Spells: SpellEntry[];
    /** 2nd level spells */
    level2Spells: SpellEntry[];
    /** 3rd level spells */
    level3Spells: SpellEntry[];
    /** 4th level spells */
    level4Spells: SpellEntry[];
    /** 5th level spells */
    level5Spells: SpellEntry[];
    /** 6th level spells */
    level6Spells: SpellEntry[];
    /** 7th level spells */
    level7Spells: SpellEntry[];
    /** 8th level spells */
    level8Spells: SpellEntry[];
    /** 9th level spells */
    level9Spells: SpellEntry[];

    /** Callback when spell slot usage changes */
    onSlotUsageChange?: (level: number, used: number) => void;
    
    /** Callback when a spell is added (edit mode) */
    onAddSpell?: (level: number, spell: SpellEntry) => void;
    /** Callback when a spell is edited (edit mode) */
    onEditSpell?: (spellId: string, updates: Partial<SpellEntry>) => void;
    /** Callback when a spell is removed (edit mode) */
    onRemoveSpell?: (spellId: string) => void;
}

/**
 * Get slot info for a level
 */
const getSlotInfo = (slots: SpellSlotLevel[], level: number): { total: number; used: number } => {
    const slot = slots.find(s => s.level === level);
    return slot ?? { total: 0, used: 0 };
};

/**
 * Determine if a spell level should be shown
 * Show if: has spells OR has slots (level 0/cantrips always shown if there are any cantrips)
 */
const shouldShowLevel = (
    level: number,
    spells: SpellEntry[],
    slots: SpellSlotLevel[]
): boolean => {
    // Has spells at this level
    if (spells.length > 0) return true;

    // For leveled spells (1-9), check if character has slots
    if (level > 0) {
        const slotInfo = getSlotInfo(slots, level);
        if (slotInfo.total > 0) return true;
    }

    return false;
};

/**
 * SpellSheet - Full spellcasting page
 */
export const SpellSheet: React.FC<SpellSheetProps> = ({
    spellcastingClass,
    spellcastingAbility,
    spellSaveDC,
    spellAttackBonus,
    spellSlots,
    cantrips,
    level1Spells,
    level2Spells,
    level3Spells,
    level4Spells,
    level5Spells,
    level6Spells,
    level7Spells,
    level8Spells,
    level9Spells,
    onSlotUsageChange,
    onAddSpell,
    onEditSpell,
    onRemoveSpell
}) => {
    const { isEditMode } = usePlayerCharacterGenerator();
    
    // Modal state for spell details (view mode)
    const { isOpen: isSpellModalOpen, data: selectedSpell, openModal: openSpellModal, closeModal: closeSpellModal } = useDetailModal<SpellEntry>();
    
    // Modal state for spell editing (edit mode)
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editModalMode, setEditModalMode] = useState<'add' | 'edit'>('add');
    const [editModalLevel, setEditModalLevel] = useState(0);
    const [editingSpell, setEditingSpell] = useState<SpellEntry | undefined>(undefined);

    // Handler for spell info clicks (view mode)
    const handleSpellInfoClick = (spell: SpellEntry) => {
        if (!isEditMode) {
            openSpellModal(spell);
        }
    };

    // Handler for add spell button click (edit mode)
    const handleAddSpellClick = useCallback((level: number) => {
        console.log('➕ [SpellSheet] Opening add modal for level:', level);
        setEditModalMode('add');
        setEditModalLevel(level);
        setEditingSpell(undefined);
        setEditModalOpen(true);
    }, []);

    // Handler for spell edit click (edit mode)
    const handleSpellEditClick = useCallback((spell: SpellEntry) => {
        console.log('✏️ [SpellSheet] Opening edit modal for spell:', spell.name);
        setEditModalMode('edit');
        setEditModalLevel(spell.level ?? 0);
        setEditingSpell(spell);
        setEditModalOpen(true);
    }, []);

    // Handler for spell save from modal
    const handleSpellSave = useCallback((spell: SpellEntry) => {
        if (editModalMode === 'add' && onAddSpell) {
            console.log('💾 [SpellSheet] Adding spell:', spell.name, 'at level:', editModalLevel);
            onAddSpell(editModalLevel, spell);
        } else if (editModalMode === 'edit' && onEditSpell && editingSpell?.id) {
            console.log('💾 [SpellSheet] Updating spell:', spell.name);
            onEditSpell(editingSpell.id, spell);
        }
    }, [editModalMode, editModalLevel, editingSpell, onAddSpell, onEditSpell]);

    // Handler for spell remove from modal
    const handleSpellRemove = useCallback((spellId: string) => {
        if (onRemoveSpell) {
            console.log('🗑️ [SpellSheet] Removing spell:', spellId);
            onRemoveSpell(spellId);
        }
    }, [onRemoveSpell]);

    // Close edit modal
    const handleEditModalClose = useCallback(() => {
        setEditModalOpen(false);
        setEditingSpell(undefined);
    }, []);

    return (
        <CharacterSheetPage className="spell-sheet" testId="spell-sheet">
            {/* Page Title */}
            <div className="phb-page-title">Spellcasting</div>

            {/* Header - Spellcasting Info */}
            <SpellHeader
                spellcastingClass={spellcastingClass}
                spellcastingAbility={spellcastingAbility}
                spellSaveDC={spellSaveDC}
                spellAttackBonus={spellAttackBonus}
            />

            {/* Spell Slot Tracker */}
            <SpellSlotTracker slots={spellSlots} onSlotUsageChange={onSlotUsageChange} />

            {/* Spell List - 3 Columns */}
            <div className="spell-list-container">
                {/* Column 1: Cantrips, 1st Level */}
                <div className="spell-column">
                    {shouldShowLevel(0, cantrips, spellSlots) && (
                        <SpellLevelBlock
                            level={0}
                            spells={cantrips}
                            emptyRows={1}
                            onSpellInfoClick={handleSpellInfoClick}
                            onAddSpell={onAddSpell ? handleAddSpellClick : undefined}
                            onSpellEdit={onEditSpell ? handleSpellEditClick : undefined}
                        />
                    )}
                    {shouldShowLevel(1, level1Spells, spellSlots) && (
                        <SpellLevelBlock
                            level={1}
                            spells={level1Spells}
                            totalSlots={getSlotInfo(spellSlots, 1).total}
                            usedSlots={getSlotInfo(spellSlots, 1).used}
                            emptyRows={2}
                            onSpellInfoClick={handleSpellInfoClick}
                            onAddSpell={onAddSpell ? handleAddSpellClick : undefined}
                            onSpellEdit={onEditSpell ? handleSpellEditClick : undefined}
                        />
                    )}
                </div>

                {/* Column 2: 2nd, 3rd, 4th Level */}
                <div className="spell-column">
                    {shouldShowLevel(2, level2Spells, spellSlots) && (
                        <SpellLevelBlock
                            level={2}
                            spells={level2Spells}
                            totalSlots={getSlotInfo(spellSlots, 2).total}
                            usedSlots={getSlotInfo(spellSlots, 2).used}
                            emptyRows={2}
                            onSpellInfoClick={handleSpellInfoClick}
                            onAddSpell={onAddSpell ? handleAddSpellClick : undefined}
                            onSpellEdit={onEditSpell ? handleSpellEditClick : undefined}
                        />
                    )}
                    {shouldShowLevel(3, level3Spells, spellSlots) && (
                        <SpellLevelBlock
                            level={3}
                            spells={level3Spells}
                            totalSlots={getSlotInfo(spellSlots, 3).total}
                            usedSlots={getSlotInfo(spellSlots, 3).used}
                            emptyRows={2}
                            onSpellInfoClick={handleSpellInfoClick}
                            onAddSpell={onAddSpell ? handleAddSpellClick : undefined}
                            onSpellEdit={onEditSpell ? handleSpellEditClick : undefined}
                        />
                    )}
                    {shouldShowLevel(4, level4Spells, spellSlots) && (
                        <SpellLevelBlock
                            level={4}
                            spells={level4Spells}
                            totalSlots={getSlotInfo(spellSlots, 4).total}
                            usedSlots={getSlotInfo(spellSlots, 4).used}
                            emptyRows={2}
                            onSpellInfoClick={handleSpellInfoClick}
                            onAddSpell={onAddSpell ? handleAddSpellClick : undefined}
                            onSpellEdit={onEditSpell ? handleSpellEditClick : undefined}
                        />
                    )}
                </div>

                {/* Column 3: 5th-9th Level */}
                <div className="spell-column">
                    {shouldShowLevel(5, level5Spells, spellSlots) && (
                        <SpellLevelBlock
                            level={5}
                            spells={level5Spells}
                            totalSlots={getSlotInfo(spellSlots, 5).total}
                            usedSlots={getSlotInfo(spellSlots, 5).used}
                            emptyRows={1}
                            onSpellInfoClick={handleSpellInfoClick}
                            onAddSpell={onAddSpell ? handleAddSpellClick : undefined}
                            onSpellEdit={onEditSpell ? handleSpellEditClick : undefined}
                        />
                    )}
                    {shouldShowLevel(6, level6Spells, spellSlots) && (
                        <SpellLevelBlock
                            level={6}
                            spells={level6Spells}
                            totalSlots={getSlotInfo(spellSlots, 6).total}
                            usedSlots={getSlotInfo(spellSlots, 6).used}
                            emptyRows={1}
                            onSpellInfoClick={handleSpellInfoClick}
                            onAddSpell={onAddSpell ? handleAddSpellClick : undefined}
                            onSpellEdit={onEditSpell ? handleSpellEditClick : undefined}
                        />
                    )}
                    {shouldShowLevel(7, level7Spells, spellSlots) && (
                        <SpellLevelBlock
                            level={7}
                            spells={level7Spells}
                            totalSlots={getSlotInfo(spellSlots, 7).total}
                            usedSlots={getSlotInfo(spellSlots, 7).used}
                            emptyRows={1}
                            onSpellInfoClick={handleSpellInfoClick}
                            onAddSpell={onAddSpell ? handleAddSpellClick : undefined}
                            onSpellEdit={onEditSpell ? handleSpellEditClick : undefined}
                        />
                    )}
                    {shouldShowLevel(8, level8Spells, spellSlots) && (
                        <SpellLevelBlock
                            level={8}
                            spells={level8Spells}
                            totalSlots={getSlotInfo(spellSlots, 8).total}
                            usedSlots={getSlotInfo(spellSlots, 8).used}
                            emptyRows={1}
                            onSpellInfoClick={handleSpellInfoClick}
                            onAddSpell={onAddSpell ? handleAddSpellClick : undefined}
                            onSpellEdit={onEditSpell ? handleSpellEditClick : undefined}
                        />
                    )}
                    {shouldShowLevel(9, level9Spells, spellSlots) && (
                        <SpellLevelBlock
                            level={9}
                            spells={level9Spells}
                            totalSlots={getSlotInfo(spellSlots, 9).total}
                            usedSlots={getSlotInfo(spellSlots, 9).used}
                            emptyRows={1}
                            onSpellInfoClick={handleSpellInfoClick}
                            onAddSpell={onAddSpell ? handleAddSpellClick : undefined}
                            onSpellEdit={onEditSpell ? handleSpellEditClick : undefined}
                        />
                    )}
                </div>
            </div>

            {/* Spell Detail Modal (View Mode) */}
            {selectedSpell && !isEditMode && (
                <SpellDetailModal
                    isOpen={isSpellModalOpen}
                    onClose={closeSpellModal}
                    name={selectedSpell.name}
                    level={selectedSpell.level ?? 0}
                    school={selectedSpell.school ?? 'evocation'}
                    castingTime={selectedSpell.castingTime ?? '1 action'}
                    range={selectedSpell.range ?? 'Self'}
                    components={selectedSpell.components ?? { verbal: true, somatic: true, material: false }}
                    duration={selectedSpell.duration ?? 'Instantaneous'}
                    description={selectedSpell.description ?? 'No description available.'}
                    higherLevels={selectedSpell.higherLevels}
                    ritual={selectedSpell.isRitual}
                    concentration={selectedSpell.isConcentration}
                    damage={selectedSpell.damage}
                    healing={selectedSpell.healing}
                    imageUrl={selectedSpell.imageUrl}
                    source={selectedSpell.source}
                />
            )}

            {/* Spell Edit Modal (Edit Mode) */}
            <SpellEditModal
                isOpen={editModalOpen}
                onClose={handleEditModalClose}
                mode={editModalMode}
                spellLevel={editModalLevel}
                spellcastingClass={spellcastingClass}
                spell={editingSpell}
                onSave={handleSpellSave}
                onRemove={onRemoveSpell ? handleSpellRemove : undefined}
            />
        </CharacterSheetPage>
    );
};

export default SpellSheet;

