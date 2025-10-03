import React from 'react';

import type { CanvasComponentProps } from '../../../types/statblockCanvas.types';
import type { SpellcastingBlock as SpellcastingBlockType, Spell } from '../../../types/statblock.types';
import type { Action } from '../../../types/statblock.types';
import { getPrimaryStatblock, resolveDataReference } from './utils';

const formatSpellSlots = (slots: SpellcastingBlockType['spellSlots']) => {
    const entries = Object.entries(slots || {})
        .filter(([, value]) => value && value > 0)
        .map(([key, value]) => ({
            level: Number(key.replace('slot', '')),
            value,
        }))
        .sort((a, b) => a.level - b.level);

    if (entries.length === 0) {
        return '—';
    }

    return entries
        .map((entry) => {
            const suffix = entry.level === 1 ? 'st' : entry.level === 2 ? 'nd' : entry.level === 3 ? 'rd' : 'th';
            return `${entry.level}${suffix}: ${entry.value}`;
        })
        .join(', ');
};

const formatSpellLevelLabel = (spell: Spell): string => {
    if (spell.level === 0) {
        return 'Cantrip';
    }

    const suffix = spell.level === 1 ? 'st' : spell.level === 2 ? 'nd' : spell.level === 3 ? 'rd' : 'th';
    return `${spell.level}${suffix} level`;
};

const SpellListSection: React.FC<{ title: string; spells?: Spell[] }> = ({ title, spells }) => {
    if (!spells || spells.length === 0) {
        return null;
    }

    return (
        <div className="dm-spellcasting-list-section">
            <h5 className="dm-spellcasting-subheading">{title}</h5>
            <dl className="dm-spellcasting-deflist">
                {spells.map((spell, index) => {
                    const metaParts: string[] = [formatSpellLevelLabel(spell)];
                    if (spell.school) {
                        metaParts.push(spell.school);
                    }
                    if (spell.usage) {
                        metaParts.push(spell.usage);
                    }

                    return (
                        <React.Fragment key={`${spell.name}-${index}`}>
                            <dt className="dm-spellcasting-term">
                                <strong>{spell.name}</strong>
                                <span className="dm-spellcasting-meta">{metaParts.join(' | ')}</span>
                            </dt>
                            {spell.description ? (
                                <dd className="dm-spellcasting-description">{spell.description}</dd>
                            ) : null}
                        </React.Fragment>
                    );
                })}
            </dl>
        </div>
    );
};

const SpellcastingBlock: React.FC<CanvasComponentProps> = ({ dataRef, dataSources, regionContent, regionOverflow }) => {
    const statblock = getPrimaryStatblock(dataSources);
    const resolved = resolveDataReference(dataSources, dataRef);
    const spellcasting = (resolved as SpellcastingBlockType) ?? statblock?.spells;

    if (!spellcasting) {
        return null;
    }

    // Handle pagination: if regionContent is provided, only render those spells
    if (regionContent && regionContent.items.length > 0) {
        const { items, startIndex, totalCount, isContinuation } = regionContent;

        // Convert action items back to spells (they were converted in utils.ts)
        const spellsToRender = items.map((action: Action) => ({
            name: action.name,
            description: action.desc,
            level: (action as any).level ?? 0,
            school: (action as any).school,
            usage: (action as any).usage,
        } as Spell));

        const heading = isContinuation ? 'Spellcasting (cont.)' : 'Spellcasting';
        const showMetadata = startIndex === 0; // Only show summary/table on first section

        return (
            <section className={`dm-spellcasting-section${regionOverflow ? ' dm-section-overflow' : ''}`}>
                <h4 className="dm-section-heading" id="spellcasting">{heading}</h4>
                {showMetadata && (
                    <>
                        <p className="dm-spellcasting-summary">
                            {`Spellcasting Ability: ${spellcasting.ability}, Spell Save DC ${spellcasting.save}, Spell Attack Bonus +${spellcasting.attack}`}
                        </p>
                        <table className="dm-spellcasting-table">
                            <tbody>
                                <tr>
                                    <th scope="row">Spellcasting Level</th>
                                    <td>{spellcasting.level}</td>
                                </tr>
                                <tr>
                                    <th scope="row">Spell Slots</th>
                                    <td>{formatSpellSlots(spellcasting.spellSlots)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </>
                )}
                <div className="dm-spellcasting-list-section">
                    <dl className="dm-spellcasting-deflist">
                        {spellsToRender.map((spell, index) => {
                            const globalIndex = startIndex + index;
                            const isLast = globalIndex === totalCount - 1;
                            const metaParts: string[] = [formatSpellLevelLabel(spell)];
                            if (spell.school) {
                                metaParts.push(spell.school);
                            }
                            if (spell.usage) {
                                metaParts.push(spell.usage);
                            }

                            return (
                                <React.Fragment key={`${spell.name}-${globalIndex}`}>
                                    <dt className="dm-spellcasting-term">
                                        <strong>{spell.name}</strong>
                                        <span className="dm-spellcasting-meta">{metaParts.join(' | ')}</span>
                                    </dt>
                                    {spell.description ? (
                                        <dd className="dm-spellcasting-description">{spell.description}</dd>
                                    ) : null}
                                    {!isLast ? <div className="dm-action-divider" /> : null}
                                </React.Fragment>
                            );
                        })}
                    </dl>
                </div>
            </section>
        );
    }

    // Non-paginated fallback: render all spells normally
    return (
        <section className="dm-spellcasting-section">
            <h4 className="dm-section-heading" id="spellcasting">Spellcasting</h4>
            <p className="dm-spellcasting-summary">
                {`Spellcasting Ability: ${spellcasting.ability}, Spell Save DC ${spellcasting.save}, Spell Attack Bonus +${spellcasting.attack}`}
            </p>
            <table className="dm-spellcasting-table">
                <tbody>
                    <tr>
                        <th scope="row">Spellcasting Level</th>
                        <td>{spellcasting.level}</td>
                    </tr>
                    <tr>
                        <th scope="row">Spell Slots</th>
                        <td>{formatSpellSlots(spellcasting.spellSlots)}</td>
                    </tr>
                </tbody>
            </table>
            <SpellListSection title="Cantrips" spells={spellcasting.cantrips} />
            <SpellListSection title="Known Spells" spells={spellcasting.knownSpells} />
        </section>
    );
};

export default SpellcastingBlock;


