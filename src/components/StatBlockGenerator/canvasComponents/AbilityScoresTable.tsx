import React, { useState, useRef, useEffect, useCallback } from 'react';

import type { CanvasComponentProps } from '../../../types/statblockCanvas.types';
import type { AbilityScores } from '../../../types/statblock.types';
import { resolveDataReference, abilityModifier, getPrimaryStatblock } from './utils';
import EditableText from './EditableText';
import { useStatBlockGenerator } from '../StatBlockGeneratorProvider';

const AbilityScoresTable: React.FC<CanvasComponentProps> = ({ dataRef, dataSources, isEditMode = false, onUpdateData }) => {
    const statblock = getPrimaryStatblock(dataSources);
    const resolved = resolveDataReference(dataSources, dataRef);
    const abilityScores: AbilityScores | undefined = (resolved as AbilityScores) || statblock?.abilities;
    const { requestComponentLock, releaseComponentLock } = useStatBlockGenerator();

    // Phase 1: Dynamic component locking state
    const [isEditing, setIsEditing] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const editTimerRef = useRef<NodeJS.Timeout | null>(null);
    const componentId = 'ability-scores-table';

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

    if (!abilityScores) {
        return null;
    }

    const abilities: Array<{ key: keyof AbilityScores; label: string }> = [
        { key: 'str', label: 'STR' },
        { key: 'dex', label: 'DEX' },
        { key: 'con', label: 'CON' },
        { key: 'int', label: 'INT' },
        { key: 'wis', label: 'WIS' },
        { key: 'cha', label: 'CHA' },
    ];

    return (
        <div className="dm-ability-table">
            <table>
                <thead>
                    <tr>
                        {abilities.map((ability) => (
                            <th align="center" key={ability.key}>
                                {ability.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        {abilities.map((ability) => {
                            const score = abilityScores[ability.key];
                            return (
                                <td align="center" key={ability.key}>
                                    <EditableText
                                        value={score}
                                        onChange={(value) => {
                                            const newScore = parseInt(value) || 10;
                                            onUpdateData?.({
                                                abilities: {
                                                    ...abilityScores,
                                                    [ability.key]: newScore,
                                                },
                                            });
                                        }}
                                        isEditMode={isEditMode}
                                        placeholder="10"
                                        as="div"
                                        onEditStart={handleEditStart}
                                        onEditChange={handleEditChange}
                                    />
                                    <br />
                                    ({abilityModifier(score)})
                                </td>
                            );
                        })}
                    </tr>
                </tbody>
            </table>
            <hr />
        </div>
    );
};

export default AbilityScoresTable;


