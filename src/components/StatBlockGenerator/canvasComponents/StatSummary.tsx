import React from 'react';

import type { CanvasComponentProps } from '../../../types/statblockCanvas.types';
import { getPrimaryStatblock } from './utils';

const StatSummary: React.FC<CanvasComponentProps> = ({ dataSources }) => {
    const statblock = getPrimaryStatblock(dataSources);
    if (!statblock) {
        return null;
    }

    const speedEntries = Object.entries(statblock.speed || {})
        .filter(([, value]) => value !== undefined)
        .map(([key, value]) => `${key} ${value} ft.`)
        .join(', ');

    return (
        <dl>
            <strong>Armor Class</strong> : {statblock.armorClass ?? '—'}
            <br />
            <strong>Hit Points</strong>: {statblock.hitPoints ?? '—'} {statblock.hitDice ? `Hit Dice : ${statblock.hitDice}` : ''}
            <br />
            <strong>Speed</strong>: {speedEntries || '—'}
        </dl>
    );
};

export default StatSummary;


