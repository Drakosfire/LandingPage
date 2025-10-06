import React, { useState, useRef, useEffect, useCallback } from 'react';

import type { CanvasComponentProps } from '../../../types/statblockCanvas.types';
import type { CreatureSize, CreatureType, Alignment } from '../../../types/statblock.types';
import { resolveDataReference, getPrimaryStatblock } from './utils';
import EditableText from './EditableText';
import { useStatBlockGenerator } from '../StatBlockGeneratorProvider';

const IdentityHeader: React.FC<CanvasComponentProps> = ({ dataRef, dataSources, isEditMode = false, onUpdateData }) => {
    const statblock = getPrimaryStatblock(dataSources);
    const fallbackName = statblock?.name ?? 'Unnamed Creature';
    const resolved = resolveDataReference(dataSources, dataRef);
    const { requestComponentLock, releaseComponentLock } = useStatBlockGenerator();

    // Phase 1: Dynamic component locking state
    const [isEditing, setIsEditing] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const editTimerRef = useRef<NodeJS.Timeout | null>(null);
    const componentId = 'identity-header';

    const name = typeof resolved === 'string' ? resolved : fallbackName;

    // Phase 1: Edit handlers
    const handleEditStart = useCallback(() => {
        if (!isEditing && isEditMode) {
            setIsEditing(true);
            requestComponentLock(componentId);
        }
    }, [isEditing, isEditMode, requestComponentLock]);

    const handleEditChange = useCallback(() => {
        setHasChanges(true);

        // Reset the 2-second idle timer
        if (editTimerRef.current) {
            clearTimeout(editTimerRef.current);
        }

        // Set new timer for 2 seconds after last edit
        editTimerRef.current = setTimeout(() => {
            handleEditComplete();
        }, 2000);
    }, []);

    const handleEditComplete = useCallback(() => {
        if (hasChanges) {
            // Data already saved to local state via onChange handlers
            // Now release lock to trigger measurements
            releaseComponentLock(componentId);
            setIsEditing(false);
            setHasChanges(false);
        }
    }, [hasChanges, releaseComponentLock]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (editTimerRef.current) {
                clearTimeout(editTimerRef.current);
            }
            if (isEditing) {
                releaseComponentLock(componentId);
            }
        };
    }, [isEditing, releaseComponentLock]);

    if (!statblock) {
        return (
            <div className="dm-identity-header">
                <h2 id="user-monster-name">
                    <EditableText
                        value={name}
                        onChange={(value) => onUpdateData?.({ name: value })}
                        isEditMode={isEditMode}
                        placeholder="Enter creature name"
                        onEditStart={handleEditStart}
                        onEditChange={handleEditChange}
                    />
                </h2>
            </div>
        );
    }

    // Composite identity handler - combines name and subtitle into one editable field
    const buildIdentityString = () => {
        const parts: string[] = [];

        // First line: Name
        if (statblock.name) parts.push(statblock.name);

        // Second line: Size type (subtype), alignment
        const subtitleParts: string[] = [];
        if (statblock.size) subtitleParts.push(statblock.size);
        if (statblock.type) {
            if (statblock.subtype) {
                subtitleParts.push(`${statblock.type} (${statblock.subtype})`);
            } else {
                subtitleParts.push(statblock.type);
            }
        }
        if (statblock.alignment) subtitleParts.push(statblock.alignment);

        if (subtitleParts.length > 0) {
            parts.push(subtitleParts.join(', '));
        }

        return parts.join('\n') || 'Creature Name\nSize type, alignment';
    };

    const parseIdentityString = (text: string) => {
        // Split by newlines to separate name from subtitle
        const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

        if (lines.length === 0) return;

        // First line is the name
        const name = lines[0];

        if (lines.length === 1) {
            // Only name provided
            onUpdateData?.({ name });
            return;
        }

        // Second line is "Size type (subtype), alignment"
        const subtitleLine = lines.slice(1).join(' ');
        const parts = subtitleLine.split(',').map(p => p.trim()).filter(Boolean);

        if (parts.length >= 2) {
            // Last part is likely alignment
            const alignment = parts[parts.length - 1];

            // First parts are size/type/subtype
            const sizeTypeStr = parts.slice(0, -1).join(', ');
            const subtypeMatch = sizeTypeStr.match(/^(.+?)\s+(.+?)\s*\((.+?)\)$/);

            if (subtypeMatch) {
                // Has subtype: "Medium humanoid (goblinoid)"
                const [, size, type, subtype] = subtypeMatch;
                onUpdateData?.({
                    name,
                    size: size.trim() as any,
                    type: type.trim() as any,
                    subtype: subtype.trim() as any,
                    alignment: alignment as any
                });
            } else {
                // No subtype: "Medium humanoid"
                const sizeTypeWords = sizeTypeStr.split(/\s+/).filter(Boolean);
                if (sizeTypeWords.length >= 2) {
                    const size = sizeTypeWords[0];
                    const type = sizeTypeWords.slice(1).join(' ');
                    onUpdateData?.({
                        name,
                        size: size as any,
                        type: type as any,
                        subtype: undefined,
                        alignment: alignment as any
                    });
                } else {
                    onUpdateData?.({
                        name,
                        size: sizeTypeStr as any,
                        alignment: alignment as any
                    });
                }
            }
        } else if (parts.length === 1) {
            // Single part after name - just update as size
            onUpdateData?.({
                name,
                size: parts[0] as any
            });
        } else {
            // Just update the name
            onUpdateData?.({ name });
        }
    };

    // In view mode, use proper semantic HTML structure
    if (!isEditMode) {
        const subtitleParts: string[] = [];
        if (statblock.size) subtitleParts.push(statblock.size);
        if (statblock.type) {
            if (statblock.subtype) {
                subtitleParts.push(`${statblock.type} (${statblock.subtype})`);
            } else {
                subtitleParts.push(statblock.type);
            }
        }
        if (statblock.alignment) subtitleParts.push(statblock.alignment);

        return (
            <div className="dm-identity-header">
                <h2 id="user-monster-name" className="dm-monster-name">
                    {statblock.name || 'Unnamed Creature'}
                </h2>
                <p className="dm-monster-meta">
                    <em>{subtitleParts.join(', ') || 'Size type, alignment'}</em>
                </p>
            </div>
        );
    }

    // In edit mode, use single contentEditable div with custom styling
    const identityValue = buildIdentityString();
    console.log('🔍 [IdentityHeader] Edit mode - identityValue:', identityValue);
    console.log('🔍 [IdentityHeader] statblock:', statblock);

    return (
        <div className="dm-identity-header">
            <EditableText
                value={identityValue}
                onChange={parseIdentityString}
                isEditMode={isEditMode}
                placeholder="Creature Name\nSize type, alignment"
                multiline={true}
                as="div"
                className="dm-identity-unified-edit"
                onEditStart={handleEditStart}
                onEditChange={handleEditChange}
            />
        </div>
    );
};

export default IdentityHeader;


