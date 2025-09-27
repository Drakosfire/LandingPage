import React from 'react';

import type { CanvasComponentProps } from '../../../types/statblockCanvas.types';
import type { AbilityScores } from '../../../types/statblock.types';
import { resolveDataReference, abilityModifier, getPrimaryStatblock } from './utils';

const AbilityScoresTable: React.FC<CanvasComponentProps> = ({ dataRef, dataSources }) => {
    const statblock = getPrimaryStatblock(dataSources);
    const resolved = resolveDataReference(dataSources, dataRef);
    const abilityScores: AbilityScores | undefined = (resolved as AbilityScores) || statblock?.abilities;

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
                                {score ?? '—'}
                                <br />
                                ({abilityModifier(score)})
                            </td>
                        );
                    })}
                </tr>
            </tbody>
        </table>
    );
};

export default AbilityScoresTable;


