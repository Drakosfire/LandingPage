/**
 * BackgroundPersonalitySheet Component
 * 
 * Second page of the character sheet focused on roleplay content.
 * Contains personality traits, ideals, bonds, flaws, and notes.
 * 
 * Edit Mode Support:
 * - All personality fields are Quick Edit (inline textarea)
 * - Notes field is Quick Edit (inline textarea)
 * 
 * @module PlayerCharacterGenerator/sheetComponents
 */

import React, { useState, useRef, useCallback, useEffect, forwardRef, useImperativeHandle } from 'react';
import { CharacterSheetPage } from './CharacterSheetPage';
import { usePlayerCharacterGenerator } from '../PlayerCharacterGeneratorProvider';
import './CharacterSheet.css';

export interface BackgroundPersonalitySheetProps {
    /** Personality traits */
    traits?: string;
    /** Character ideals */
    ideals?: string;
    /** Character bonds */
    bonds?: string;
    /** Character flaws */
    flaws?: string;
    /** Notes content */
    notes?: string;
    /** Character name (for header) */
    characterName?: string;
    /** Background name */
    backgroundName?: string;
    /** Callback when traits change */
    onTraitsChange?: (value: string) => void;
    /** Callback when ideals change */
    onIdealsChange?: (value: string) => void;
    /** Callback when bonds change */
    onBondsChange?: (value: string) => void;
    /** Callback when flaws change */
    onFlawsChange?: (value: string) => void;
    /** Callback when notes change */
    onNotesChange?: (value: string) => void;
}

interface PersonalityBoxProps {
    label: string;
    content: string;
    /** Whether the field is editable (quick edit) */
    editable?: boolean;
    /** Callback when content changes */
    onChange?: (value: string) => void;
}

/**
 * EditableTextarea - Inline editable textarea for personality fields
 * Shows static text when not editing, textarea when editing (click to edit)
 * 
 * Exposes startEditing() via ref so parent containers can trigger editing
 */
interface EditableTextareaProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    rows?: number;
}

export interface EditableTextareaRef {
    startEditing: () => void;
}

const EditableTextarea = forwardRef<EditableTextareaRef, EditableTextareaProps>(({
    value,
    onChange,
    placeholder = '',
    rows = 4
}, ref) => {
    const { isEditMode } = usePlayerCharacterGenerator();
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(value);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Expose startEditing method via ref for parent containers
    useImperativeHandle(ref, () => ({
        startEditing: () => {
            if (isEditMode && !isEditing) {
                console.log('✏️ [EditableTextarea] Starting inline edit (via ref)');
                setIsEditing(true);
            }
        }
    }), [isEditMode, isEditing]);

    // Sync editValue when value prop changes (external update)
    useEffect(() => {
        if (!isEditing) {
            setEditValue(value);
        }
    }, [value, isEditing]);

    // Focus textarea when editing starts
    useEffect(() => {
        if (isEditing && textareaRef.current) {
            textareaRef.current.focus();
            textareaRef.current.select();
        }
    }, [isEditing]);

    const handleClick = useCallback(() => {
        if (isEditMode && !isEditing) {
            console.log('✏️ [EditableTextarea] Starting inline edit');
            setIsEditing(true);
        }
    }, [isEditMode, isEditing]);

    const handleSave = useCallback(() => {
        console.log('💾 [EditableTextarea] Saving:', editValue);
        setIsEditing(false);
        onChange(editValue);
    }, [editValue, onChange]);

    const handleCancel = useCallback(() => {
        console.log('❌ [EditableTextarea] Cancelled edit');
        setIsEditing(false);
        setEditValue(value); // Reset to original
    }, [value]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            e.preventDefault();
            handleCancel();
        }
        // Note: Enter does NOT save for textarea (allows multiline)
        // Use blur or Tab to save
    }, [handleCancel]);

    const handleBlur = useCallback(() => {
        handleSave();
    }, [handleSave]);

    if (isEditing) {
        return (
            <textarea
                ref={textareaRef}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                className="edit-textarea"
                placeholder={placeholder}
                rows={rows}
            />
        );
    }

    return (
        <span
            className={`editable-textarea-display ${isEditMode ? 'editable' : ''}`}
            onClick={handleClick}
            role={isEditMode ? 'button' : undefined}
            tabIndex={isEditMode ? 0 : undefined}
            onKeyDown={isEditMode ? (e) => e.key === 'Enter' && handleClick() : undefined}
        >
            {value || <span className="placeholder">{placeholder || '—'}</span>}
        </span>
    );
});

const PersonalityBox: React.FC<PersonalityBoxProps> = ({ label, content, editable, onChange }) => {
    const editableTextareaRef = useRef<EditableTextareaRef>(null);
    const { isEditMode } = usePlayerCharacterGenerator();
    
    // Click anywhere in the box to start editing (when in edit mode)
    const handleContainerClick = useCallback(() => {
        if (editable && isEditMode) {
            editableTextareaRef.current?.startEditing();
        }
    }, [editable, isEditMode]);

    return (
        <div 
            className="phb-section personality-box personality-grid-item"
            data-editable={editable ? "quick" : undefined}
            onClick={handleContainerClick}
            role={editable && isEditMode ? 'button' : undefined}
            tabIndex={editable && isEditMode ? 0 : undefined}
            onKeyDown={editable && isEditMode ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleContainerClick();
                }
            } : undefined}
        >
            <div className="text-area">
                {editable && onChange ? (
                    <EditableTextarea
                        ref={editableTextareaRef}
                        value={content}
                        onChange={onChange}
                        placeholder={`Enter your ${label.toLowerCase()}`}
                        rows={4}
                    />
                ) : (
                    content || '—'
                )}
            </div>
            <div className="box-label">{label}</div>
        </div>
    );
};

/**
 * BackgroundPersonalitySheet - PHB-styled page for roleplay content
 * 
 * Layout:
 * - Title header
 * - 2x2 grid for personality traits, ideals, bonds, flaws
 * - Full-width notes section with 3-column layout
 * 
 * Edit Mode:
 * - All personality fields support Quick Edit (inline textarea)
 * - Notes field supports Quick Edit (inline textarea)
 */
export const BackgroundPersonalitySheet: React.FC<BackgroundPersonalitySheetProps> = ({
    traits = '',
    ideals = '',
    bonds = '',
    flaws = '',
    notes = '',
    characterName = '',
    backgroundName = '',
    onTraitsChange,
    onIdealsChange,
    onBondsChange,
    onFlawsChange,
    onNotesChange
}) => {
    const { isEditMode } = usePlayerCharacterGenerator();
    const notesTextareaRef = useRef<EditableTextareaRef>(null);
    
    // Click anywhere in notes box to start editing
    const handleNotesBoxClick = useCallback(() => {
        if (onNotesChange && isEditMode) {
            notesTextareaRef.current?.startEditing();
        }
    }, [onNotesChange, isEditMode]);
    
    // Check if any edit callbacks are provided
    const hasEditCallbacks = !!(onTraitsChange || onIdealsChange || onBondsChange || onFlawsChange || onNotesChange);
    
    return (
        <CharacterSheetPage
            className="background-personality-sheet"
            testId="background-personality-sheet"
        >
            {/* Page Title */}
            <div className="sheet-header">
                <h1 className="sheet-title">Background & Personality</h1>
                {(characterName || backgroundName) && (
                    <div className="sheet-subtitle">
                        {characterName && <span className="character-name">{characterName}</span>}
                        {characterName && backgroundName && <span className="separator">—</span>}
                        {backgroundName && <span className="background-name">{backgroundName}</span>}
                    </div>
                )}
            </div>

            {/* Personality Grid - 2x2 layout */}
            <div className="personality-grid">
                <PersonalityBox 
                    label="Personality Traits" 
                    content={traits} 
                    editable={!!onTraitsChange}
                    onChange={onTraitsChange}
                />
                <PersonalityBox 
                    label="Ideals" 
                    content={ideals}
                    editable={!!onIdealsChange}
                    onChange={onIdealsChange}
                />
                <PersonalityBox 
                    label="Bonds" 
                    content={bonds}
                    editable={!!onBondsChange}
                    onChange={onBondsChange}
                />
                <PersonalityBox 
                    label="Flaws" 
                    content={flaws}
                    editable={!!onFlawsChange}
                    onChange={onFlawsChange}
                />
            </div>

            {/* Notes Section - click anywhere to edit */}
            <div className="notes-section">
                <div 
                    className="phb-section notes-box"
                    data-editable={onNotesChange ? "quick" : undefined}
                    onClick={handleNotesBoxClick}
                    role={onNotesChange && isEditMode ? 'button' : undefined}
                    tabIndex={onNotesChange && isEditMode ? 0 : undefined}
                    onKeyDown={onNotesChange && isEditMode ? (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleNotesBoxClick();
                        }
                    } : undefined}
                >
                    <div className="notes-content">
                        <div className="notes-column">
                            {onNotesChange ? (
                                <EditableTextarea
                                    ref={notesTextareaRef}
                                    value={notes}
                                    onChange={onNotesChange}
                                    placeholder="Enter notes here..."
                                    rows={8}
                                />
                            ) : (
                                notes
                            )}
                        </div>
                        <div className="notes-column"></div>
                        <div className="notes-column"></div>
                    </div>
                    <div className="box-label">Notes</div>
                </div>
            </div>
        </CharacterSheetPage>
    );
};

export default BackgroundPersonalitySheet;


