/**
 * EditableText Component
 * 
 * Inline editable text field for quick-edit fields in the character sheet.
 * In edit mode, clicking the field transforms it into an input.
 * 
 * Features:
 * - Click to edit (only in edit mode)
 * - Save on blur or Enter
 * - Cancel on Escape
 * - Supports text and number types
 * 
 * @module PlayerCharacterGenerator/sheetComponents
 */

import React, { useState, useRef, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react';
import { usePlayerCharacterGenerator } from '../PlayerCharacterGeneratorProvider';

export interface EditableTextRef {
    startEditing: () => void;
}

export interface EditableTextProps {
    /** Current value */
    value: string | number;
    /** Callback when value changes */
    onChange: (value: string | number) => void;
    /** Input type */
    type?: 'text' | 'number';
    /** Placeholder text when empty */
    placeholder?: string;
    /** Additional className for the wrapper */
    className?: string;
    /** Minimum value (for number type) */
    min?: number;
    /** Maximum value (for number type) */
    max?: number;
    /** Format function for display (e.g., adding + prefix) */
    formatDisplay?: (value: string | number) => string;
}

export const EditableText = forwardRef<EditableTextRef, EditableTextProps>(({
    value,
    onChange,
    type = 'text',
    placeholder = '',
    className = '',
    min,
    max,
    formatDisplay
}, ref) => {
    const { isEditMode } = usePlayerCharacterGenerator();
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(String(value));
    const inputRef = useRef<HTMLInputElement>(null);

    // Expose startEditing method via ref for parent containers
    useImperativeHandle(ref, () => ({
        startEditing: () => {
            if (isEditMode && !isEditing) {
                console.log('✏️ [EditableText] Starting inline edit (via ref)');
                setIsEditing(true);
            }
        }
    }), [isEditMode, isEditing]);

    // Sync editValue when value prop changes (external update)
    useEffect(() => {
        if (!isEditing) {
            setEditValue(String(value));
        }
    }, [value, isEditing]);

    // Focus input when editing starts
    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    const handleClick = useCallback(() => {
        if (isEditMode && !isEditing) {
            console.log('✏️ [EditableText] Starting inline edit');
            setIsEditing(true);
        }
    }, [isEditMode, isEditing]);

    const handleSave = useCallback(() => {
        console.log('💾 [EditableText] Saving:', editValue);
        setIsEditing(false);

        // Convert to number if needed
        const newValue = type === 'number'
            ? (editValue === '' ? 0 : Number(editValue))
            : editValue;

        // Apply min/max constraints for numbers
        if (type === 'number' && typeof newValue === 'number') {
            let constrainedValue = newValue;
            if (min !== undefined && constrainedValue < min) constrainedValue = min;
            if (max !== undefined && constrainedValue > max) constrainedValue = max;
            onChange(constrainedValue);
        } else {
            onChange(newValue);
        }
    }, [editValue, onChange, type, min, max]);

    const handleCancel = useCallback(() => {
        console.log('❌ [EditableText] Cancelled edit');
        setIsEditing(false);
        setEditValue(String(value)); // Reset to original
    }, [value]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSave();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            handleCancel();
        }
    }, [handleSave, handleCancel]);

    const handleBlur = useCallback(() => {
        handleSave();
    }, [handleSave]);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setEditValue(e.target.value);
    }, []);

    // Display value (with optional formatting)
    const displayValue = formatDisplay
        ? formatDisplay(value)
        : (value === '' || value === 0 ? placeholder : String(value));

    if (isEditing) {
        return (
            <input
                ref={inputRef}
                type={type}
                value={editValue}
                onChange={handleChange}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                className={`edit-input ${className}`}
                placeholder={placeholder}
                min={min}
                max={max}
            />
        );
    }

    return (
        <span
            className={`editable-text ${className} ${isEditMode ? 'editable' : ''}`}
            onClick={handleClick}
            role={isEditMode ? 'button' : undefined}
            tabIndex={isEditMode ? 0 : undefined}
            onKeyDown={isEditMode ? (e) => e.key === 'Enter' && handleClick() : undefined}
        >
            {displayValue || <span className="placeholder">{placeholder}</span>}
        </span>
    );
});

export default EditableText;

