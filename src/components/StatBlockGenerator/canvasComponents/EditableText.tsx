/**
 * EditableText Component
 * 
 * Wrapper that makes text content editable inline.
 * Styled to look like plain text but becomes editable on focus.
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';

interface EditableTextProps {
    value: string | number | undefined;
    onChange: (value: string) => void;
    isEditMode: boolean;
    className?: string;
    placeholder?: string;
    multiline?: boolean;
    as?: 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'td' | 'div';
    style?: React.CSSProperties;
    children?: React.ReactNode;
}

const EditableText: React.FC<EditableTextProps> = ({
    value,
    onChange,
    isEditMode,
    className = '',
    placeholder = '',
    multiline = false,
    as: Component = 'span',
    style,
    children,
}) => {
    const [localValue, setLocalValue] = useState(String(value ?? ''));
    const [isFocused, setIsFocused] = useState(false);
    const contentRef = useRef<HTMLElement>(null);

    // Sync with external value changes
    useEffect(() => {
        if (!isFocused) {
            setLocalValue(String(value ?? ''));
        }
    }, [value, isFocused]);

    const handleBlur = useCallback(() => {
        setIsFocused(false);
        if (localValue !== String(value ?? '')) {
            onChange(localValue);
        }
    }, [localValue, value, onChange]);

    const handleFocus = useCallback(() => {
        setIsFocused(true);
    }, []);

    const handleInput = useCallback((e: React.FormEvent<HTMLElement>) => {
        const target = e.currentTarget;
        setLocalValue(target.textContent ?? '');
    }, []);

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLElement>) => {
        if (!multiline && e.key === 'Enter') {
            e.preventDefault();
            contentRef.current?.blur();
        }

        // Allow Escape to cancel changes
        if (e.key === 'Escape') {
            e.preventDefault();
            setLocalValue(String(value ?? ''));
            contentRef.current?.blur();
        }
    }, [multiline, value]);

    if (!isEditMode) {
        // View mode - render as plain element
        return (
            <Component className={className} style={style}>
                {children ?? value ?? placeholder}
            </Component>
        );
    }

    // Edit mode - contentEditable
    const editableStyle: React.CSSProperties = {
        ...style,
        cursor: 'text',
        outline: isFocused ? '2px solid #228be6' : 'none',
        outlineOffset: '2px',
        borderRadius: '2px',
        padding: isFocused ? '2px 4px' : '2px',
        transition: 'all 0.15s ease',
        minWidth: isFocused ? '20px' : undefined,
        minHeight: multiline && isFocused ? '1.5em' : undefined,
    };

    return (
        <Component
            ref={contentRef as any}
            className={className}
            style={editableStyle}
            contentEditable={isEditMode}
            suppressContentEditableWarning
            onBlur={handleBlur}
            onFocus={handleFocus}
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            data-placeholder={!localValue && isFocused ? placeholder : undefined}
        >
            {children ?? (localValue || (!isFocused && placeholder) || '\u00A0')}
        </Component>
    );
};

export default EditableText;

