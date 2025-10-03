import React from 'react';

import type { CanvasComponentProps } from '../../../types/statblockCanvas.types';
import type { CreatureSize, CreatureType, Alignment } from '../../../types/statblock.types';
import { resolveDataReference, getPrimaryStatblock } from './utils';
import EditableText from './EditableText';

const IdentityHeader: React.FC<CanvasComponentProps> = ({ dataRef, dataSources, isEditMode = false, onUpdateData }) => {
    const statblock = getPrimaryStatblock(dataSources);
    const fallbackName = statblock?.name ?? 'Unnamed Creature';
    const resolved = resolveDataReference(dataSources, dataRef);

    const name = typeof resolved === 'string' ? resolved : fallbackName;

    if (!statblock) {
        return (
            <h2 id="user-monster-name">
                <EditableText
                    value={name}
                    onChange={(value) => onUpdateData?.({ name: value })}
                    isEditMode={isEditMode}
                    placeholder="Enter creature name"
                />
            </h2>
        );
    }

    const size = statblock.size ?? '';
    const creatureType = [statblock.type, statblock.subtype].filter(Boolean).join(', ');
    const alignment = statblock.alignment ?? '';

    return (
        <>
            <h2 id="user-monster-name">
                <EditableText
                    value={statblock.name}
                    onChange={(value) => onUpdateData?.({ name: value })}
                    isEditMode={isEditMode}
                    placeholder="Enter creature name"
                />
            </h2>
            <p>
                <em>
                    <EditableText
                        value={size}
                        onChange={(value) => onUpdateData?.({ size: value as any })}
                        isEditMode={isEditMode}
                        placeholder="Size"
                    />
                    {' '}
                    <EditableText
                        value={statblock.type}
                        onChange={(value) => onUpdateData?.({ type: value as any })}
                        isEditMode={isEditMode}
                        placeholder="Type"
                    />
                    {statblock.subtype ? (
                        <>
                            {' ('}
                            <EditableText
                                value={statblock.subtype}
                                onChange={(value) => onUpdateData?.({ subtype: value as any })}
                                isEditMode={isEditMode}
                                placeholder="Subtype"
                            />
                            {')'}
                        </>
                    ) : null}
                    {', '}
                    <EditableText
                        value={alignment}
                        onChange={(value) => onUpdateData?.({ alignment: value as any })}
                        isEditMode={isEditMode}
                        placeholder="Alignment"
                    />
                </em>
            </p>
        </>
    );
};

export default IdentityHeader;


