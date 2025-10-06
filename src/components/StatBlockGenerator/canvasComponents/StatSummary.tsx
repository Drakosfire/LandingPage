import React, { useState, useRef, useEffect, useCallback } from 'react';

import type { CanvasComponentProps } from '../../../types/statblockCanvas.types';
import { getPrimaryStatblock } from './utils';
import EditableText from './EditableText';
import { useStatBlockGenerator } from '../StatBlockGeneratorProvider';

const StatSummary: React.FC<CanvasComponentProps> = ({ dataSources, isEditMode = false, onUpdateData }) => {
    const statblock = getPrimaryStatblock(dataSources);
    const { requestComponentLock, releaseComponentLock } = useStatBlockGenerator();

    // Phase 1: Dynamic component locking state
    const [isEditing, setIsEditing] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const editTimerRef = useRef<NodeJS.Timeout | null>(null);
    const componentId = 'stat-summary';

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
        return null;
    }

    const speedEntries = Object.entries(statblock.speed || {})
        .filter(([, value]) => value !== undefined)
        .map(([key, value]) => `${key} ${value} ft.`)
        .join(', ');

    return (
        <div className="dm-stat-summary">
            <dl>
                <strong>Armor Class</strong> : <EditableText
                    value={statblock.armorClass}
                    onChange={(value) => onUpdateData?.({ armorClass: parseInt(value) || 0 })}
                    isEditMode={isEditMode}
                    placeholder="AC"
                    onEditStart={handleEditStart}
                    onEditChange={handleEditChange}
                />
                <br />
                <strong>Hit Points</strong>: <EditableText
                    value={statblock.hitPoints}
                    onChange={(value) => onUpdateData?.({ hitPoints: parseInt(value) || 0 })}
                    isEditMode={isEditMode}
                    placeholder="HP"
                    onEditStart={handleEditStart}
                    onEditChange={handleEditChange}
                /> <EditableText
                    value={statblock.hitDice ? `Hit Dice : ${statblock.hitDice}` : ''}
                    onChange={(value) => {
                        const hitDice = value.replace(/^Hit Dice\s*:\s*/i, '').trim();
                        onUpdateData?.({ hitDice });
                    }}
                    isEditMode={isEditMode}
                    placeholder="Hit Dice: 1d8"
                    onEditStart={handleEditStart}
                    onEditChange={handleEditChange}
                />
                <br />
                <strong>Speed</strong>: <EditableText
                    value={speedEntries}
                    onChange={(value) => {
                        // Parse speed string like "walk 30 ft., fly 60 ft." into speed object
                        const speedObj: Record<string, number> = {};
                        value.split(',').forEach(entry => {
                            const match = entry.trim().match(/(\w+)\s+(\d+)/);
                            if (match) {
                                speedObj[match[1]] = parseInt(match[2]);
                            }
                        });
                        onUpdateData?.({ speed: speedObj });
                    }}
                    isEditMode={isEditMode}
                    placeholder="walk 30, fly 60"
                    onEditStart={handleEditStart}
                    onEditChange={handleEditChange}
                />
            </dl>
            <hr />
        </div>
    );
};

export default StatSummary;


