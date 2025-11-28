import React, { useState, useRef, useEffect, useCallback } from 'react';

import type { CanvasComponentProps } from '../../../types/statblockCanvas.types';
import type { SpellcastingBlock as SpellcastingBlockType, Spell } from '../../../types/statblock.types';
import type { Action } from '../../../types/statblock.types';
import { getPrimaryStatblock, resolveDataReference } from './utils';
import EditableText from './EditableText';
import { useStatBlockGenerator } from '../StatBlockGeneratorProvider';

const formatSpellSlots = (slots: SpellcastingBlockType['spellSlots']) => {
    const entries = Object.entries(slots || {})
        .filter(([, value]) => value && value > 0)
        .map(([key, value]) => {
            // Handle various key formats: 'level1', '1', 'slot1', 'first', etc.
            const numericMatch = key.match(/(\d+)/);
            const level = numericMatch ? Number(numericMatch[1]) : NaN;
            return { level, value };
        })
        .filter(entry => !isNaN(entry.level)) // Skip entries with unparseable levels
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
                        <React.Fragment key={spell.id}>
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

const SpellcastingBlock: React.FC<CanvasComponentProps> = ({ dataRef, dataSources, regionContent, regionOverflow, isEditMode = false, onUpdateData }) => {
    const statblock = getPrimaryStatblock(dataSources);
    const resolved = resolveDataReference(dataSources, dataRef);
    const spellcasting = (resolved as SpellcastingBlockType) ?? statblock?.spells;
    const { requestComponentLock, releaseComponentLock } = useStatBlockGenerator();

    // Phase 2.5: Dynamic component locking state
    const [isEditing, setIsEditing] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const editTimerRef = useRef<NodeJS.Timeout | null>(null);
    const componentId = 'spellcasting-block'; // Stable ID for this component

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
            // Data already saved to local state
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
    if (!spellcasting) {
        return null;
    }

    const updateSpell = (spellIndex: number, updates: Partial<Spell>, listType: 'cantrips' | 'knownSpells') => {
        if (!statblock?.spells) return;
        const list = statblock.spells[listType] || [];
        const newList = [...list];
        newList[spellIndex] = { ...newList[spellIndex], ...updates };
        onUpdateData?.({
            spells: {
                ...statblock.spells,
                [listType]: newList
            }
        });
    };

    const updateSpellcastingMeta = (updates: Partial<SpellcastingBlockType>) => {
        if (!statblock?.spells) return;
        onUpdateData?.({
            spells: {
                ...statblock.spells,
                ...updates
            }
        });
    };

    const renderMetadataSection = () => (
        <>
            <p className="dm-spellcasting-summary">
                Spellcasting Ability: <EditableText
                    value={spellcasting.ability}
                    onChange={(value) => updateSpellcastingMeta({ ability: value })}
                    isEditMode={isEditMode}
                    placeholder="Ability"
                    onEditStart={handleEditStart}
                    onEditChange={handleEditChange}
                />, Spell Save DC <EditableText
                    value={String(spellcasting.save)}
                    onChange={(value) => updateSpellcastingMeta({ save: parseInt(value) || 0 })}
                    isEditMode={isEditMode}
                    placeholder="DC"
                    onEditStart={handleEditStart}
                    onEditChange={handleEditChange}
                />, Spell Attack Bonus +<EditableText
                    value={String(spellcasting.attack)}
                    onChange={(value) => updateSpellcastingMeta({ attack: parseInt(value) || 0 })}
                    isEditMode={isEditMode}
                    placeholder="Bonus"
                    onEditStart={handleEditStart}
                    onEditChange={handleEditChange}
                />
            </p>
            <table className="dm-spellcasting-table">
                <tbody>
                    <tr>
                        <th scope="row">Spellcasting Level</th>
                        <td>
                            <EditableText
                                value={String(spellcasting.level)}
                                onChange={(value) => updateSpellcastingMeta({ level: parseInt(value) || 0 })}
                                isEditMode={isEditMode}
                                placeholder="Level"
                                onEditStart={handleEditStart}
                                onEditChange={handleEditChange}
                            />
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">Spell Slots</th>
                        <td>
                            <EditableText
                                value={formatSpellSlots(spellcasting.spellSlots)}
                                onChange={(value) => {
                                    // Note: This is a simplified string edit. Proper parsing would be needed for production.
                                    updateSpellcastingMeta({ spellSlots: spellcasting.spellSlots });
                                }}
                                isEditMode={isEditMode}
                                placeholder="Spell slots"
                                onEditStart={handleEditStart}
                                onEditChange={handleEditChange}
                            />
                        </td>
                    </tr>
                </tbody>
            </table>
        </>
    );

    // Handle pagination: if regionContent is provided, only render those spells
    if (regionContent) {
        const isMetadataSegment = regionContent.kind === 'spell-list-metadata';
        const headingId = 'spellcasting';
        const sectionClassName = `dm-spellcasting-section${regionOverflow ? ' dm-section-overflow' : ''}`;

        if (isMetadataSegment) {
            return (
                <section className={sectionClassName}>
                    <h4 className="dm-section-heading" id={headingId}>Spellcasting</h4>
                    {renderMetadataSection()}
                </section>
            );
        }

        const { items, startIndex, totalCount, isContinuation } = regionContent;

        // Convert action items back to spells (they were converted in utils.ts)
        const spellsToRender = items.map((action: Action) => ({
            id: action.id, // Preserve ID for stable keys
            name: action.name,
            description: action.desc,
            level: (action as any).level ?? 0,
            school: (action as any).school,
            usage: (action as any).usage,
        } as Spell));

        const heading = startIndex === 0 ? 'Spell List' : 'Spellcasting (cont.)';

        return (
            <section className={sectionClassName}>
                <h4 className="dm-section-heading" id={headingId}>{heading}</h4>
                {spellsToRender.length > 0 && (
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
                                    <React.Fragment key={spell.id}>
                                        <dt className="dm-spellcasting-term">
                                            <strong>
                                                <EditableText
                                                    value={spell.name}
                                                    onChange={(value) => {
                                                        // Note: This is a simplified version - proper list type detection needed
                                                        const listType = spell.level === 0 ? 'cantrips' : 'knownSpells';
                                                        updateSpell(globalIndex, { name: value }, listType);
                                                    }}
                                                    isEditMode={isEditMode}
                                                    placeholder="Spell name"
                                                    onEditStart={handleEditStart}
                                                    onEditChange={handleEditChange}
                                                />
                                            </strong>
                                            <span className="dm-spellcasting-meta">{metaParts.join(' | ')}</span>
                                        </dt>
                                        {spell.description ? (
                                            <dd className="dm-spellcasting-description">
                                                <EditableText
                                                    value={spell.description}
                                                    onChange={(value) => {
                                                        const listType = spell.level === 0 ? 'cantrips' : 'knownSpells';
                                                        updateSpell(globalIndex, { description: value }, listType);
                                                    }}
                                                    isEditMode={isEditMode}
                                                    placeholder="Spell description"
                                                    multiline
                                                    onEditStart={handleEditStart}
                                                    onEditChange={handleEditChange}
                                                />
                                            </dd>
                                        ) : null}
                                        {!isLast ? <div className="dm-action-divider" /> : null}
                                    </React.Fragment>
                                );
                            })}
                        </dl>
                    </div>
                )}
            </section>
        );
    }

    // Non-paginated fallback: render all spells normally (also editable)
    return (
        <section className="dm-spellcasting-section">
            <h4 className="dm-section-heading" id="spellcasting">Spellcasting</h4>
            {renderMetadataSection()}
            <SpellListSection title="Cantrips" spells={spellcasting.cantrips} />
            <SpellListSection title="Known Spells" spells={spellcasting.knownSpells} />
        </section>
    );
};

export default SpellcastingBlock;


