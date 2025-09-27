import React from 'react';

import type { CanvasComponentProps } from '../../../types/statblockCanvas.types';
import { resolveDataReference, getPrimaryStatblock } from './utils';

const IdentityHeader: React.FC<CanvasComponentProps> = ({ dataRef, dataSources }) => {
    const statblock = getPrimaryStatblock(dataSources);
    const fallbackName = statblock?.name ?? 'Unnamed Creature';
    const resolved = resolveDataReference(dataSources, dataRef);

    const name = typeof resolved === 'string' ? resolved : fallbackName;

    if (!statblock) {
        return <h2 id="user-monster-name">{name}</h2>;
    }

    const size = statblock.size ?? '';
    const creatureType = [statblock.type, statblock.subtype].filter(Boolean).join(', ');
    const alignment = statblock.alignment ?? '';
    const identityParts = [size, creatureType, alignment].filter((value) => value && value.trim().length > 0);
    const identityLine = identityParts.join(', ');

    return (
        <>
            <h2 id="user-monster-name">{name}</h2>
            {identityLine ? (
                <p>
                    <em>{identityLine}</em>
                </p>
            ) : null}
        </>
    );
};

export default IdentityHeader;


