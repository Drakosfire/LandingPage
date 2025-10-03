import React from 'react';

import type { CanvasComponentProps } from '../../../types/statblockCanvas.types';
import { getPrimaryStatblock } from './utils';
import EditableText from './EditableText';

const StatSummary: React.FC<CanvasComponentProps> = ({ dataSources, isEditMode = false, onUpdateData }) => {
    const statblock = getPrimaryStatblock(dataSources);
    if (!statblock) {
        return null;
    }

    const speedEntries = Object.entries(statblock.speed || {})
        .filter(([, value]) => value !== undefined)
        .map(([key, value]) => `${key} ${value} ft.`)
        .join(', ');

    return (
        <>
            <dl>
                <strong>Armor Class</strong> : <EditableText
                    value={statblock.armorClass}
                    onChange={(value) => onUpdateData?.({ armorClass: parseInt(value) || 0 })}
                    isEditMode={isEditMode}
                    placeholder="AC"
                />
                <br />
                <strong>Hit Points</strong>: <EditableText
                    value={statblock.hitPoints}
                    onChange={(value) => onUpdateData?.({ hitPoints: parseInt(value) || 0 })}
                    isEditMode={isEditMode}
                    placeholder="HP"
                /> <EditableText
                    value={statblock.hitDice ? `Hit Dice : ${statblock.hitDice}` : ''}
                    onChange={(value) => {
                        const hitDice = value.replace(/^Hit Dice\s*:\s*/i, '').trim();
                        onUpdateData?.({ hitDice });
                    }}
                    isEditMode={isEditMode}
                    placeholder="Hit Dice: 1d8"
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
                />
            </dl>
            <hr />
        </>
    );
};

export default StatSummary;


