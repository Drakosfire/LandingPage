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
    // Phase 1: Dynamic component locking callbacks
    onEditStart?: () => void;
    onEditChange?: () => void;
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
    onEditStart,
    onEditChange,
}) => {
    const [localValue, setLocalValue] = useState(String(value ?? ''));
    const [isFocused, setIsFocused] = useState(false);
    const contentRef = useRef<HTMLElement>(null);
    const autoCommitTimerRef = useRef<NodeJS.Timeout | null>(null); // Phase 3: Auto-commit timer

    // Sync with external value changes
    useEffect(() => {
        if (!isFocused) {
            setLocalValue(String(value ?? ''));
        }
    }, [value, isFocused]);

    // Phase 3: Cleanup auto-commit timer on unmount
    useEffect(() => {
        return () => {
            if (autoCommitTimerRef.current) {
                clearTimeout(autoCommitTimerRef.current);
            }
        };
    }, []);

    const handleBlur = useCallback(() => {
        setIsFocused(false);
        // Phase 3: Clear auto-commit timer since we're committing now
        if (autoCommitTimerRef.current) {
            clearTimeout(autoCommitTimerRef.current);
            autoCommitTimerRef.current = null;
        }
        // Read final value from DOM (browser's source of truth while focused)
        const finalValue = contentRef.current?.textContent ?? '';
        if (finalValue !== String(value ?? '')) {
            console.log('📝 [EditableText] Committing change on blur');
            setLocalValue(finalValue); // Update state for next render
            onChange(finalValue);
        }
    }, [value, onChange]);

    const handleFocus = useCallback(() => {
        setIsFocused(true);
        // Phase 1: Notify parent component that editing started
        onEditStart?.();
    }, [onEditStart]);

    const handleInput = useCallback((e: React.FormEvent<HTMLElement>) => {
        const target = e.currentTarget;
        const newValue = target.textContent ?? '';
        // DON'T update localValue here - let browser control DOM while focused
        // setLocalValue(newValue);  // This caused cursor reset!

        // Phase 1: Notify parent that content changed (for edit timer reset)
        onEditChange?.();

        // Phase 3: Auto-commit after 2 seconds of idle typing
        if (autoCommitTimerRef.current) {
            clearTimeout(autoCommitTimerRef.current);
        }
        autoCommitTimerRef.current = setTimeout(() => {
            // Read directly from DOM, not from state
            const currentValue = contentRef.current?.textContent ?? '';
            if (currentValue !== String(value ?? '')) {
                console.log('📝 [EditableText] Auto-committing change after 2s idle');
                setLocalValue(currentValue); // Update state for next render
                onChange(currentValue);
            }
        }, 2000);
    }, [onEditChange, onChange, value]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLElement>) => {
        if (!multiline && e.key === 'Enter') {
            e.preventDefault();
            contentRef.current?.blur();
        }

        // Allow Escape to cancel changes
        if (e.key === 'Escape') {
            e.preventDefault();
            // Reset DOM content to original value
            if (contentRef.current) {
                contentRef.current.textContent = String(value ?? '');
            }
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

    // Edit mode - contentEditable (seamless, no visual indication)
    const editableStyle: React.CSSProperties = {
        ...style,
        cursor: 'text',
        // No visual change - completely seamless editing
        outline: 'none',
        border: 'none',
        minWidth: isFocused ? '20px' : undefined,
        minHeight: multiline && isFocused ? '1.5em' : undefined,
        // Override browser defaults for contentEditable
        WebkitUserModify: 'read-write-plaintext-only', // Prevent rich text paste
        direction: 'ltr', // Force left-to-right text direction
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

