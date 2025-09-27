import React from 'react';

import { useStatBlockGenerator } from './StatBlockGeneratorProvider';
import { DND_CSS_BASE_URL } from '../../config';
import type { Action } from '../../types/statblock.types';

interface DnDStatblockWorkspaceProps {
    height?: number | string;
}

const DnDStatblockWorkspace: React.FC<DnDStatblockWorkspaceProps> = ({ height = 700 }) => {
    const {
        creatureDetails,
        selectedAssets,
        updateCreatureDetails,
    } = useStatBlockGenerator();

    const getSelectedImage = () => {
        if (selectedAssets?.creatureImage) return selectedAssets.creatureImage;
        if (typeof selectedAssets?.selectedImageIndex === 'number') {
            return selectedAssets.generatedImages?.[selectedAssets.selectedImageIndex];
        }
        return selectedAssets?.generatedImages?.[0];
    };

    const formatModifier = (value?: number) => {
        if (value === null || value === undefined || Number.isNaN(value)) return '—';
        return value >= 0 ? `+${value}` : `${value}`;
    };

    const abilityMod = (score?: number) => {
        if (score === null || score === undefined || Number.isNaN(score)) return undefined;
        return Math.floor((Number(score) - 10) / 2);
    };

    const setNumericField = <T extends Record<string, number | undefined>>(
        current: T | undefined,
        key: keyof T,
        text: string
    ): T => {
        const next = { ...(current || {}) } as any;
        if (text === '') {
            delete next[key];
        } else {
            const value = Number(text);
            if (Number.isNaN(value)) {
                delete next[key];
            } else {
                next[key] = value;
            }
        }
        return next;
    };

    const updateActionListItem = (
        key: 'specialAbilities' | 'actions' | 'bonusActions' | 'reactions',
        index: number,
        updates: Partial<Action>
    ) => {
        const current = (creatureDetails[key] || []) as Action[];
        const next = [...current];
        next[index] = { ...next[index], ...updates } as Action;
        updateCreatureDetails({ [key]: next } as Partial<typeof creatureDetails>);
    };

    const renderActionSection = (
        key: 'specialAbilities' | 'actions' | 'bonusActions' | 'reactions',
        heading: string,
        sectionId: string
    ) => {
        const entries = creatureDetails[key];
        if (!entries || entries.length === 0) return null;

        return (
            <>
                <h4 id={sectionId}>{heading}</h4>
                <dl>
                    {entries.map((entry, idx) => (
                        <React.Fragment key={`${sectionId}-${idx}`}>
                            <dt>
                                <em><strong>
                                    <EditableText
                                        value={entry.name}
                                        placeholder="Action Name"
                                        onChange={(text) => updateActionListItem(key, idx, { name: text })}
                                    />
                                </strong></em> :</dt>
                            <dd>
                                <EditableText
                                    value={entry.desc}
                                    placeholder="Description"
                                    onChange={(text) => updateActionListItem(key, idx, { desc: text })}
                                />
                                {entry.attackBonus !== undefined ? (
                                    <span>
                                        {' '}
                                        <EditableText
                                            value={formatModifier(entry.attackBonus)}
                                            placeholder="Attack Bonus"
                                            onChange={(text) => {
                                                const numeric = text === '' ? undefined : Number(text);
                                                updateActionListItem(key, idx, {
                                                    attackBonus: Number.isNaN(numeric as number) ? undefined : numeric
                                                });
                                            }}
                                        />
                                    </span>
                                ) : null}
                                {entry.damage ? (
                                    <span>
                                        {' '}
                                        <EditableText
                                            value={entry.damage}
                                            placeholder="Damage"
                                            onChange={(text) => updateActionListItem(key, idx, { damage: text })}
                                        />
                                    </span>
                                ) : null}
                                {entry.recharge ? (
                                    <span>
                                        {' '}
                                        (<EditableText
                                            value={entry.recharge}
                                            placeholder="Recharge"
                                            onChange={(text) => updateActionListItem(key, idx, { recharge: text })}
                                        />)
                                    </span>
                                ) : null}
                            </dd>
                            <br />
                        </React.Fragment>
                    ))}
                </dl>
            </>
        );
    };

    // Inline editable span that preserves PHB styles
    const EditableText: React.FC<{
        value: any;
        placeholder?: string;
        onChange: (text: string) => void;
        type?: 'text' | 'number';
    }> = ({ value, placeholder = '—', onChange, type = 'text' }) => {
        const display = value === null || value === undefined || value === '' ? placeholder : String(value);
        return (
            <span
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => {
                    const text = (e.target as HTMLElement).innerText.trim();
                    if (type === 'number') {
                        const n = text === '' ? '' : Number(text);
                        onChange(text === '' || Number.isNaN(n) ? '' : String(n));
                    } else {
                        onChange(text);
                    }
                }}
                style={{
                    outline: 'none',
                    backgroundColor: 'white',
                    border: '1px solid #e8e8e8',
                    borderRadius: '4px',
                    padding: '2px 4px',
                    minWidth: '20px',
                    display: 'inline-block',
                    transition: 'all 0.2s ease',
                    cursor: 'text'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f0f8ff';
                    e.currentTarget.style.borderColor = '#4a90e2';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                    e.currentTarget.style.borderColor = '#e8e8e8';
                }}
                onFocus={(e) => {
                    e.currentTarget.style.backgroundColor = '#fff';
                    e.currentTarget.style.borderColor = '#4a90e2';
                    e.currentTarget.style.boxShadow = '0 0 0 2px rgba(74, 144, 226, 0.2)';
                }}
            >
                {display}
            </span>
        );
    };

    return (
        <Card shadow="sm" padding="md" radius="md" withBorder style={{ height, overflow: 'auto' }}>
            {/* Inject external CSS if provided via env */}
            {DND_CSS_BASE_URL && (
                <>
                    <link href={`${DND_CSS_BASE_URL}/all.css`} rel="stylesheet" />
                    <link href={`${DND_CSS_BASE_URL}/bundle.css`} rel="stylesheet" />
                    <link href={`${DND_CSS_BASE_URL}/style.css`} rel="stylesheet" />
                    <link href={`${DND_CSS_BASE_URL}/5ePHBstyle.css`} rel="stylesheet" />
                </>
            )}

            <div className='brewRenderer'>
                <div className='pages'>
                    <div className='page phb' id='workspace-p1'>
                        <div className='block monster frame wide'>
                            <h4>
                                <EditableText
                                    value={creatureDetails.name}
                                    placeholder="Creature Name"
                                    onChange={(text) => updateCreatureDetails({ name: text })}
                                />
                            </h4>
                            <p><em>
                                <EditableText
                                    value={creatureDetails.size}
                                    placeholder="Size"
                                    onChange={(text) => updateCreatureDetails({ size: text as any })}
                                />
                                {', '}
                                <EditableText
                                    value={creatureDetails.type}
                                    placeholder="Type"
                                    onChange={(text) => updateCreatureDetails({ type: text as any })}
                                />
                                {', '}
                                <EditableText
                                    value={creatureDetails.alignment}
                                    placeholder="Alignment"
                                    onChange={(text) => updateCreatureDetails({ alignment: text as any })}
                                />
                            </em></p>

                            <div className='block descriptive'>
                                <h5>
                                    <EditableText
                                        value={creatureDetails.description}
                                        placeholder="Describe the creature..."
                                        onChange={(text) => updateCreatureDetails({ description: text })}
                                    />
                                </h5>
                            </div>

                            <hr />
                            <dl>
                                <strong>Armor Class</strong> :{' '}
                                <EditableText
                                    value={creatureDetails.armorClass}
                                    placeholder="—"
                                    type="number"
                                    onChange={(text) => updateCreatureDetails({ armorClass: text === '' ? (undefined as any) : Number(text) })}
                                />
                                {' '}<strong>Hit Points</strong>: {' '}
                                <EditableText
                                    value={creatureDetails.hitPoints}
                                    placeholder="—"
                                    type="number"
                                    onChange={(text) => updateCreatureDetails({ hitPoints: text === '' ? (undefined as any) : Number(text) })}
                                />{' '}
                                Hit Dice : {' '}
                                <EditableText
                                    value={creatureDetails.hitDice}
                                    placeholder="—"
                                    onChange={(text) => updateCreatureDetails({ hitDice: text })}
                                />
                                {' '}<strong>Speed</strong>: {' '}
                                {(() => {
                                    const s = (creatureDetails.speed || {}) as any;
                                    const setSpeed = (key: string, text: string) => {
                                        const v = text === '' ? undefined : Number(text);
                                        updateCreatureDetails({ speed: { ...s, [key]: Number.isNaN(v as any) ? undefined : v } });
                                    };
                                    return (
                                        <>
                                            {'walk : '}<EditableText value={s.walk} placeholder="—" type="number" onChange={(t) => setSpeed('walk', t)} />
                                            {', fly : '}<EditableText value={s.fly} placeholder="—" type="number" onChange={(t) => setSpeed('fly', t)} />
                                            {', swim : '}<EditableText value={s.swim} placeholder="—" type="number" onChange={(t) => setSpeed('swim', t)} />
                                            {', climb : '}<EditableText value={s.climb} placeholder="—" type="number" onChange={(t) => setSpeed('climb', t)} />
                                            {', burrow : '}<EditableText value={s.burrow} placeholder="—" type="number" onChange={(t) => setSpeed('burrow', t)} />
                                        </>
                                    );
                                })()}
                            </dl>

                            <hr />
                            <table>
                                <thead>
                                    <tr>
                                        <th align='center'>STR</th>
                                        <th align='center'>DEX</th>
                                        <th align='center'>CON</th>
                                        <th align='center'>INT</th>
                                        <th align='center'>WIS</th>
                                        <th align='center'>CHA</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td align='center'><EditableText value={creatureDetails.abilities?.str} placeholder="—" type="number" onChange={(t) => updateCreatureDetails({ abilities: { ...(creatureDetails.abilities as any), str: t === '' ? undefined : Number(t) } as any })} /></td>
                                        <td align='center'><EditableText value={creatureDetails.abilities?.dex} placeholder="—" type="number" onChange={(t) => updateCreatureDetails({ abilities: { ...(creatureDetails.abilities as any), dex: t === '' ? undefined : Number(t) } as any })} /></td>
                                        <td align='center'><EditableText value={creatureDetails.abilities?.con} placeholder="—" type="number" onChange={(t) => updateCreatureDetails({ abilities: { ...(creatureDetails.abilities as any), con: t === '' ? undefined : Number(t) } as any })} /></td>
                                        <td align='center'><EditableText value={(creatureDetails.abilities as any)?.intelligence} placeholder="—" type="number" onChange={(t) => updateCreatureDetails({ abilities: { ...(creatureDetails.abilities as any), intelligence: t === '' ? undefined : Number(t) } as any })} /></td>
                                        <td align='center'><EditableText value={creatureDetails.abilities?.wis} placeholder="—" type="number" onChange={(t) => updateCreatureDetails({ abilities: { ...(creatureDetails.abilities as any), wis: t === '' ? undefined : Number(t) } as any })} /></td>
                                        <td align='center'><EditableText value={creatureDetails.abilities?.cha} placeholder="—" type="number" onChange={(t) => updateCreatureDetails({ abilities: { ...(creatureDetails.abilities as any), cha: t === '' ? undefined : Number(t) } as any })} /></td>
                                    </tr>
                                </tbody>
                            </table>

                            <hr />
                            <strong>Saving Throws</strong> : {(() => {
                                const st = creatureDetails.savingThrows || {} as any;
                                const parts = Object.entries(st).map(([k, v]) => ` ${k} : ${v}`);
                                return parts.length ? parts.join(', ') : ' —';
                            })()}
                            <br />
                            <strong>Skills</strong> : {(() => {
                                const sk = creatureDetails.skills || {} as any;
                                const parts = Object.entries(sk).map(([k, v]) => ` ${k} : ${v}`);
                                return parts.length ? parts.join(', ') : ' —';
                            })()}
                            <br />
                            <strong>Resistances</strong> : <EditableText value={creatureDetails.damageResistance} placeholder="—" onChange={(text) => updateCreatureDetails({ damageResistance: text })} />
                            <br />
                            <strong>Senses</strong> : {(() => {
                                const s = creatureDetails.senses || {} as any;
                                const setSense = (key: string, text: string) => {
                                    const v = text === '' ? undefined : Number(text);
                                    updateCreatureDetails({ senses: { ...s, [key]: Number.isNaN(v as any) ? undefined : v } });
                                };
                                return (
                                    <>
                                        {'darkvision : '}<EditableText value={s.darkvision} placeholder="—" type="number" onChange={(t) => setSense('darkvision', t)} />
                                        {', blindsight : '}<EditableText value={s.blindsight} placeholder="—" type="number" onChange={(t) => setSense('blindsight', t)} />
                                        {', tremorsense : '}<EditableText value={s.tremorsense} placeholder="—" type="number" onChange={(t) => setSense('tremorsense', t)} />
                                        {', truesight : '}<EditableText value={s.truesight} placeholder="—" type="number" onChange={(t) => setSense('truesight', t)} />
                                        {', passive perception : '}<EditableText value={(s as any).passivePerception} placeholder="—" type="number" onChange={(t) => setSense('passivePerception', t)} />
                                    </>
                                );
                            })()}
                            <br />
                            <strong>Languages</strong>  : <EditableText value={creatureDetails.languages} placeholder="—" onChange={(text) => updateCreatureDetails({ languages: text })} />
                            <br />
                            <strong>Challenge Rating</strong> : <EditableText value={creatureDetails.challengeRating} placeholder="—" onChange={(text) => updateCreatureDetails({ challengeRating: text as any })} /> ({' '}
                            <EditableText value={creatureDetails.xp} placeholder="—" type="number" onChange={(text) => updateCreatureDetails({ xp: text === '' ? (undefined as any) : Number(text) })} />{')'}

                            {creatureDetails.actions?.length ? (
                                <>
                                    <hr />
                                    <h4 id='actions'>Actions</h4>
                                    <dl>
                                        {creatureDetails.actions.map((a, idx) => (
                                            <React.Fragment key={idx}>
                                                <dt><em><strong>
                                                    <EditableText
                                                        value={a.name}
                                                        placeholder="Action Name"
                                                        onChange={(text) => {
                                                            const next = [...(creatureDetails.actions || [])];
                                                            next[idx] = { ...next[idx], name: text } as any;
                                                            updateCreatureDetails({ actions: next as any });
                                                        }}
                                                    />
                                                </strong></em> :</dt>
                                                <dd>
                                                    <EditableText
                                                        value={a.desc}
                                                        placeholder="Action description"
                                                        onChange={(text) => {
                                                            const next = [...(creatureDetails.actions || [])];
                                                            next[idx] = { ...next[idx], desc: text } as any;
                                                            updateCreatureDetails({ actions: next as any });
                                                        }}
                                                    />
                                                </dd>
                                                <br />
                                            </React.Fragment>
                                        ))}
                                    </dl>
                                </>
                            ) : null}

                            {creatureDetails.legendaryActions?.actions?.length ? (
                                <>
                                    <h4 id='legendary actions'>Legendary Actions</h4>
                                    <dl>
                                        {creatureDetails.legendaryActions.actions.map((la, idx) => (
                                            <React.Fragment key={idx}>
                                                <dt><em><strong>
                                                    <EditableText
                                                        value={la.name}
                                                        placeholder="Legendary action"
                                                        onChange={(text) => {
                                                            const block = creatureDetails.legendaryActions!;
                                                            const nextActs = [...block.actions];
                                                            nextActs[idx] = { ...nextActs[idx], name: text } as any;
                                                            updateCreatureDetails({ legendaryActions: { ...block, actions: nextActs } as any });
                                                        }}
                                                    />
                                                </strong></em>:</dt>
                                                <dd>
                                                    <EditableText
                                                        value={la.desc}
                                                        placeholder="Legendary description"
                                                        onChange={(text) => {
                                                            const block = creatureDetails.legendaryActions!;
                                                            const nextActs = [...block.actions];
                                                            nextActs[idx] = { ...nextActs[idx], desc: text } as any;
                                                            updateCreatureDetails({ legendaryActions: { ...block, actions: nextActs } as any });
                                                        }}
                                                    />
                                                </dd>
                                                <br />
                                            </React.Fragment>
                                        ))}
                                    </dl>
                                </>
                            ) : null}
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default DnDStatblockWorkspace;


