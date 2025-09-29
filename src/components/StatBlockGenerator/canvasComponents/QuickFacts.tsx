import React from 'react';

import type { CanvasComponentProps } from '../../../types/statblockCanvas.types';
import { getPrimaryStatblock } from './utils';

const QuickFacts: React.FC<CanvasComponentProps> = ({ dataSources }) => {
    const statblock = getPrimaryStatblock(dataSources);
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
        <>
            <strong>Saving Throws</strong> :{' '}
            {statblock.savingThrows ? formatRecord(statblock.savingThrows as Record<string, unknown>) : '—'}
            <br />
            <strong>Skills</strong> : {statblock.skills ? formatRecord(statblock.skills as Record<string, unknown>) : '—'}
            <br />
            <strong>Damage Resistances</strong> : {statblock.damageResistance || '—'}
            <br />
            <strong>Damage Immunities</strong> : {statblock.damageImmunity || '—'}
            <br />
            <strong>Condition Immunities</strong> : {statblock.conditionImmunity || '—'}
            <br />
            <strong>Senses</strong> : {formatRecord(senses as Record<string, unknown>) || '—'}
            <br />
            <strong>Languages</strong> : {statblock.languages || '—'}
            <br />
            <strong>Challenge Rating</strong> : {statblock.challengeRating || '—'}{' '}
            {statblock.xp !== undefined ? `(${statblock.xp} XP)` : ''}
            <hr />
        </>
    );
};

export default QuickFacts;
