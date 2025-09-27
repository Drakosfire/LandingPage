import React from 'react';

import type { CanvasComponentProps } from '../../../types/statblockCanvas.types';
import type { Action } from '../../../types/statblock.types';
import { resolveDataReference } from './utils';

const isAction = (entry: unknown): entry is Action => {
    if (!entry || typeof entry !== 'object') return false;
    return 'name' in entry && 'desc' in entry;
};

const renderActionDetails = (action: Action) => {
    const parts: string[] = [];
    if (action.desc) {
        parts.push(action.desc);
    }
    if (action.attackBonus !== undefined) {
        parts.push(`Attack Bonus: ${action.attackBonus >= 0 ? `+${action.attackBonus}` : action.attackBonus}`);
    }
    if (action.damage) {
        parts.push(`Damage: ${action.damage}`);
    }
    if (action.recharge) {
        parts.push(`Recharge ${action.recharge}`);
    }
    return parts.join(' ');
};

const ActionSection: React.FC<CanvasComponentProps> = ({ dataRef, dataSources }) => {
    const resolved = resolveDataReference(dataSources, dataRef);
    const actions = Array.isArray(resolved) ? resolved.filter(isAction) : [];

    if (actions.length === 0) {
        return null;
    }

    return (
        <>
            <h4 id="actions">Actions</h4>
            <dl>
                {actions.map((action, index) => (
                    <React.Fragment key={`${action.name}-${index}`}>
                        <dt>
                            <em>
                                <strong>{action.name || 'Unnamed Action'}</strong>
                            </em>
                            {action.usage ? ` (${action.usage})` : ''}
                        </dt>
                        <dd>{renderActionDetails(action)}</dd>
                        <br />
                    </React.Fragment>
                ))}
            </dl>
        </>
    );
};

export default ActionSection;
