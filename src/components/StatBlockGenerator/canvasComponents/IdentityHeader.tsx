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

    // Option D: Refs for smart wrapper focusing
    const nameFieldRef = useRef<HTMLElement>(null);
    const subtitleFieldRef = useRef<HTMLElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);

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

    // Option D: Parse subtitle string (must be before early return - hooks rules)
    const parseSubtitleString = useCallback((text: string) => {
        const parts = text.split(',').map(p => p.trim()).filter(Boolean);

        if (parts.length === 0) return;

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
                    size: size.trim() as CreatureSize,
                    type: type.trim() as CreatureType,
                    subtype: subtype.trim(),
                    alignment: alignment as Alignment
                });
            } else {
                // No subtype: "Medium humanoid"
                const sizeTypeWords = sizeTypeStr.split(/\s+/).filter(Boolean);
                if (sizeTypeWords.length >= 2) {
                    const size = sizeTypeWords[0];
                    const type = sizeTypeWords.slice(1).join(' ');
                    onUpdateData?.({
                        size: size as CreatureSize,
                        type: type as CreatureType,
                        subtype: undefined,
                        alignment: alignment as Alignment
                    });
                } else {
                    onUpdateData?.({
                        size: sizeTypeStr as CreatureSize,
                        alignment: alignment as Alignment
                    });
                }
            }
        } else if (parts.length === 1) {
            // Single part - could be size or alignment
            const part = parts[0];
            // Simple heuristic: if it contains space, treat as size/type
            if (part.includes(' ')) {
                const words = part.split(/\s+/);
                onUpdateData?.({
                    size: words[0] as CreatureSize,
                    type: words.slice(1).join(' ') as CreatureType
                });
            } else {
                // Single word - assume size
                onUpdateData?.({
                    size: part as CreatureSize
                });
            }
        }
    }, [onUpdateData]);

    // Option D: Smart wrapper click handler (must be before early return - hooks rules)
    const handleWrapperClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!isEditMode) return;

        // Don't interfere if user clicked directly on an editable field
        const target = e.target as HTMLElement;
        if (target.isContentEditable) return;

        // Determine which field to focus based on click Y position
        const wrapper = wrapperRef.current;
        if (!wrapper) return;

        const rect = wrapper.getBoundingClientRect();
        const relativeY = e.clientY - rect.top;
        const midpoint = rect.height / 2;

        if (relativeY < midpoint && nameFieldRef.current) {
            nameFieldRef.current.focus();
        } else if (subtitleFieldRef.current) {
            subtitleFieldRef.current.focus();
        }
    }, [isEditMode]);

    // Option D: Helper function for building subtitle (not a hook, can be after)
    const buildSubtitleString = () => {
        if (!statblock) return '';

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

        return subtitleParts.join(', ');
    };

    // Early return for no statblock case (after all hooks)
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

    // Render subtitle parts for both view and edit modes
    const getSubtitleDisplay = () => {
        if (!statblock) return 'Size type, alignment';

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

        return subtitleParts.join(', ') || 'Size type, alignment';
    };

    // Option D: Two separate fields with smart wrapper (view and edit use same structure)
    return (
        <div
            ref={wrapperRef}
            className="dm-identity-header"
            data-tutorial="creature-name"
            onClick={handleWrapperClick}
            style={{ cursor: isEditMode ? 'text' : 'default' }}
        >
            <h2 id="user-monster-name" className="dm-monster-name">
                <EditableText
                    ref={nameFieldRef}
                    value={statblock?.name || 'Unnamed Creature'}
                    onChange={(value) => onUpdateData?.({ name: value })}
                    isEditMode={isEditMode}
                    placeholder="Creature Name"
                    as="span"
                    onEditStart={handleEditStart}
                    onEditChange={handleEditChange}
                />
            </h2>
            <p className="dm-monster-meta">
                <em>
                    <EditableText
                        ref={subtitleFieldRef}
                        value={buildSubtitleString() || 'Size type, alignment'}
                        onChange={parseSubtitleString}
                        isEditMode={isEditMode}
                        placeholder="Size type, alignment"
                        as="span"
                        onEditStart={handleEditStart}
                        onEditChange={handleEditChange}
                    />
                </em>
            </p>
        </div>
    );
};

export default IdentityHeader;


