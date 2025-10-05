import React, { useState, useRef, useEffect, useCallback } from 'react';

import type { CanvasComponentProps } from '../../../types/statblockCanvas.types';
import { getPrimaryStatblock } from './utils';
import EditableText from './EditableText';
import { useStatBlockGenerator } from '../StatBlockGeneratorProvider';

const QuickFacts: React.FC<CanvasComponentProps> = ({ dataSources, isEditMode = false, onUpdateData }) => {
    const statblock = getPrimaryStatblock(dataSources);
    const { requestComponentLock, releaseComponentLock } = useStatBlockGenerator();

    // Phase 2.5: Dynamic component locking state
    const [isEditing, setIsEditing] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const editTimerRef = useRef<NodeJS.Timeout | null>(null);
    const componentId = 'quick-facts'; // Stable ID for this component

    // Phase 2.5: Edit handlers (must be defined before early return)
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
            // Data already saved to local state via onUpdateData
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

    // Early return after all hooks
    if (!statblock) {
        return null;
    }

    const senses = statblock.senses || {};

    const formatRecord = (record?: Record<string, unknown>) => {
        if (!record) return undefined;
        const entries = Object.entries(record)
            .filter(([, value]) => value !== undefined && value !== null && value !== '')
            .map(([key, value]) => `${key} ${String(value)}`);
        return entries.length ? entries.join(', ') : undefined;
    };

    return (
        <div className="dm-quick-facts">
            <strong>Saving Throws</strong> :{' '}
            {statblock.savingThrows ? formatRecord(statblock.savingThrows as Record<string, unknown>) : '—'}
            <br />
            <strong>Skills</strong> :{' '}
            {statblock.skills ? formatRecord(statblock.skills as Record<string, unknown>) : '—'}
            <br />
            <strong>Damage Resistances</strong> :{' '}
            <EditableText
                value={statblock.damageResistance || '—'}
                onChange={(value) => onUpdateData?.({ damageResistance: value })}
                isEditMode={isEditMode}
                placeholder="—"
                onEditStart={handleEditStart}
                onEditChange={handleEditChange}
            />
            <br />
            <strong>Damage Immunities</strong> :{' '}
            <EditableText
                value={statblock.damageImmunity || '—'}
                onChange={(value) => onUpdateData?.({ damageImmunity: value })}
                isEditMode={isEditMode}
                placeholder="—"
                onEditStart={handleEditStart}
                onEditChange={handleEditChange}
            />
            <br />
            <strong>Condition Immunities</strong> :{' '}
            <EditableText
                value={statblock.conditionImmunity || '—'}
                onChange={(value) => onUpdateData?.({ conditionImmunity: value })}
                isEditMode={isEditMode}
                placeholder="—"
                onEditStart={handleEditStart}
                onEditChange={handleEditChange}
            />
            <br />
            <strong>Senses</strong> :{' '}
            {formatRecord(senses as Record<string, unknown>) || '—'}
            <br />
            <strong>Languages</strong> :{' '}
            <EditableText
                value={statblock.languages || '—'}
                onChange={(value) => onUpdateData?.({ languages: value })}
                isEditMode={isEditMode}
                placeholder="—"
                onEditStart={handleEditStart}
                onEditChange={handleEditChange}
            />
            <br />
            <strong>Challenge Rating</strong> :{' '}
            <EditableText
                value={statblock.challengeRating || '—'}
                onChange={(value) => onUpdateData?.({ challengeRating: value })}
                isEditMode={isEditMode}
                placeholder="—"
                onEditStart={handleEditStart}
                onEditChange={handleEditChange}
            />
            {' '}
            {statblock.xp !== undefined ? (
                <>
                    (<EditableText
                        value={String(statblock.xp)}
                        onChange={(value) => onUpdateData?.({ xp: parseInt(value) || 0 })}
                        isEditMode={isEditMode}
                        placeholder="0"
                        onEditStart={handleEditStart}
                        onEditChange={handleEditChange}
                    /> XP)
                </>
            ) : ''}
            <hr />
        </div>
    );
};

export default QuickFacts;
