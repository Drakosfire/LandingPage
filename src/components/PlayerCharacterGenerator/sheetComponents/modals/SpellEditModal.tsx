/**
 * SpellEditModal Component
 * 
 * Editable modal for adding/editing spells on a character sheet.
 * Features search-first UX with class-aware validation.
 * 
 * Features:
 * - Add mode: Search/filter spells from database, auto-populate fields
 * - Edit mode: Toggle prepared status, remove spell
 * - Homebrew mode: Manual entry for custom spells
 * - Class validation: Shows warning if spell not on class list
 * 
 * @module PlayerCharacterGenerator/sheetComponents/modals
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
    Modal, 
    TextInput, 
    Textarea, 
    Select, 
    Checkbox, 
    Group, 
    Button, 
    Stack, 
    Grid, 
    Divider, 
    Text,
    ScrollArea,
    Badge
} from '@mantine/core';
import {
    IconSearch,
    IconFlame,
    IconTrash,
    IconDeviceFloppy,
    IconX,
    IconAlertCircle,
    IconCheck,
    IconClock,
    IconRuler2,
    IconAlphabetLatin,
    IconHourglass
} from '@tabler/icons-react';
import { v4 as uuidv4 } from 'uuid';
import type { SpellEntry } from '../spells/SpellLevelBlock';
import type { DnD5eSpell, SpellSchool } from '../../types/dnd5e/spell.types';
import { SRD_SPELLS, getSpellsByLevel } from '../../data/dnd5e/spells';

// ============================================================================
// Types
// ============================================================================

export interface SpellEditModalProps {
    /** Whether modal is open */
    isOpen: boolean;
    /** Close callback */
    onClose: () => void;
    /** Mode: 'add' for new spell, 'edit' for existing */
    mode: 'add' | 'edit';
    /** Spell level to filter (for add mode) */
    spellLevel?: number;
    /** Character's spellcasting class (for validation) */
    spellcastingClass?: string;
    /** Existing spell data (for edit mode) */
    spell?: SpellEntry;
    /** Save callback */
    onSave: (spell: SpellEntry) => void;
    /** Remove callback (edit mode only) */
    onRemove?: (spellId: string) => void;
}

// School options for dropdown
const SCHOOL_OPTIONS: { value: SpellSchool; label: string }[] = [
    { value: 'abjuration', label: 'Abjuration' },
    { value: 'conjuration', label: 'Conjuration' },
    { value: 'divination', label: 'Divination' },
    { value: 'enchantment', label: 'Enchantment' },
    { value: 'evocation', label: 'Evocation' },
    { value: 'illusion', label: 'Illusion' },
    { value: 'necromancy', label: 'Necromancy' },
    { value: 'transmutation', label: 'Transmutation' }
];

// Level options for dropdown
const LEVEL_OPTIONS = [
    { value: '0', label: 'Cantrip' },
    { value: '1', label: '1st Level' },
    { value: '2', label: '2nd Level' },
    { value: '3', label: '3rd Level' },
    { value: '4', label: '4th Level' },
    { value: '5', label: '5th Level' },
    { value: '6', label: '6th Level' },
    { value: '7', label: '7th Level' },
    { value: '8', label: '8th Level' },
    { value: '9', label: '9th Level' }
];

// Class options for filter
const CLASS_OPTIONS = [
    'bard', 'cleric', 'druid', 'paladin', 'ranger', 'sorcerer', 'warlock', 'wizard'
];

// ============================================================================
// Helper Functions
// ============================================================================

/** Format spell level for display */
const formatLevel = (level: number): string => {
    if (level === 0) return 'Cantrip';
    const suffixes = ['st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th', 'th'];
    return `${level}${suffixes[level - 1]} Level`;
};

/** Format school name for display */
const formatSchool = (school: SpellSchool): string => {
    return school.charAt(0).toUpperCase() + school.slice(1);
};

/** Format components for display */
const formatComponents = (components: { verbal: boolean; somatic: boolean; material: boolean; materialDescription?: string }): string => {
    const parts: string[] = [];
    if (components.verbal) parts.push('V');
    if (components.somatic) parts.push('S');
    if (components.material) {
        parts.push(components.materialDescription ? `M (${components.materialDescription})` : 'M');
    }
    return parts.join(', ') || '—';
};

/** Filter spells by search query and optional class */
const filterSpells = (spells: DnD5eSpell[], query: string, classFilter?: string): DnD5eSpell[] => {
    let filtered = spells;
    
    // Text search
    if (query) {
        const lowerQuery = query.toLowerCase();
        filtered = filtered.filter(s => 
            s.name.toLowerCase().includes(lowerQuery) ||
            s.school.toLowerCase().includes(lowerQuery)
        );
    }
    
    // Class filter
    if (classFilter && classFilter !== 'all') {
        filtered = filtered.filter(s => s.classes.includes(classFilter.toLowerCase()));
    }
    
    return filtered;
};

/** Check if spell is on class list */
const isOnClassList = (spell: DnD5eSpell, className?: string): boolean => {
    if (!className) return true; // No class specified, assume valid
    return spell.classes.includes(className.toLowerCase());
};

/** Convert DnD5eSpell to SpellEntry */
const dndSpellToEntry = (spell: DnD5eSpell, isPrepared: boolean = false): SpellEntry => ({
    id: spell.id,
    name: spell.name,
    isPrepared,
    isRitual: spell.ritual,
    isConcentration: spell.concentration,
    level: spell.level,
    school: spell.school,
    castingTime: spell.castingTime,
    range: spell.range,
    components: spell.components,
    duration: spell.duration,
    description: spell.description,
    higherLevels: spell.higherLevels,
    damage: spell.damage,
    healing: spell.healing,
    source: spell.source
});

/** Create empty spell entry */
const createEmptySpell = (level: number = 0): SpellEntry => ({
    id: uuidv4(),
    name: '',
    isPrepared: level > 0, // Cantrips are always prepared
    level,
    school: 'evocation',
    castingTime: '1 action',
    range: '60 feet',
    components: { verbal: true, somatic: true, material: false },
    duration: 'Instantaneous',
    description: ''
});

// ============================================================================
// Component
// ============================================================================

/**
 * SpellEditModal - Editable spell form modal with search
 */
export const SpellEditModal: React.FC<SpellEditModalProps> = ({
    isOpen,
    onClose,
    mode,
    spellLevel = 0,
    spellcastingClass,
    spell,
    onSave,
    onRemove
}) => {
    // ===== STATE =====
    const [searchQuery, setSearchQuery] = useState('');
    const [classFilter, setClassFilter] = useState<string>(spellcastingClass?.toLowerCase() || 'all');
    const [selectedDbSpell, setSelectedDbSpell] = useState<DnD5eSpell | null>(null);
    const [isHomebrew, setIsHomebrew] = useState(false);
    const [formData, setFormData] = useState<SpellEntry>(createEmptySpell(spellLevel));
    const [deleteConfirm, setDeleteConfirm] = useState(false);

    // ===== FILTERED SPELL LIST =====
    const availableSpells = useMemo(() => {
        // Get spells at the target level
        const levelSpells = getSpellsByLevel(spellLevel);
        // Filter by search and class
        return filterSpells(levelSpells, searchQuery, classFilter === 'all' ? undefined : classFilter);
    }, [spellLevel, searchQuery, classFilter]);

    // ===== INITIALIZE FORM =====
    useEffect(() => {
        if (isOpen) {
            if (mode === 'edit' && spell) {
                console.log('✏️ [SpellEditModal] Loading spell for edit:', spell.name);
                setFormData({ ...spell });
                setSelectedDbSpell(null);
                setIsHomebrew(false); // Assume existing spells are from DB
            } else {
                console.log('➕ [SpellEditModal] Creating new spell at level:', spellLevel);
                setFormData(createEmptySpell(spellLevel));
                setSelectedDbSpell(null);
                setIsHomebrew(false);
                setSearchQuery('');
            }
            setDeleteConfirm(false);
            // Set class filter to character's class if available
            if (spellcastingClass) {
                setClassFilter(spellcastingClass.toLowerCase());
            }
        }
    }, [isOpen, mode, spell, spellLevel, spellcastingClass]);

    // ===== HANDLERS =====
    
    /** Handle selecting a spell from the database */
    const handleSelectSpell = useCallback((dbSpell: DnD5eSpell) => {
        console.log('📜 [SpellEditModal] Selected spell:', dbSpell.name);
        setSelectedDbSpell(dbSpell);
        // Convert to SpellEntry format
        setFormData(dndSpellToEntry(dbSpell, spellLevel > 0));
    }, [spellLevel]);

    /** Handle field change in homebrew mode */
    const handleFieldChange = useCallback(<K extends keyof SpellEntry>(field: K, value: SpellEntry[K]) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    }, []);

    /** Handle save */
    const handleSave = useCallback(() => {
        // Validate required fields
        if (!formData.name.trim()) {
            console.warn('⚠️ [SpellEditModal] Name is required');
            return;
        }

        const finalSpell: SpellEntry = {
            ...formData,
            id: formData.id || uuidv4(),
            name: formData.name.trim()
        };

        console.log('💾 [SpellEditModal] Saving spell:', finalSpell.name);
        onSave(finalSpell);
        onClose();
    }, [formData, onSave, onClose]);

    /** Handle delete with confirmation */
    const handleDelete = useCallback(() => {
        if (!deleteConfirm) {
            setDeleteConfirm(true);
            return;
        }

        if (spell?.id && onRemove) {
            console.log('🗑️ [SpellEditModal] Removing spell:', spell.name);
            onRemove(spell.id);
            onClose();
        }
    }, [deleteConfirm, spell, onRemove, onClose]);

    /** Cancel delete confirmation */
    const handleCancelDelete = useCallback(() => {
        setDeleteConfirm(false);
    }, []);

    /** Toggle homebrew mode */
    const handleHomebrewToggle = useCallback((checked: boolean) => {
        setIsHomebrew(checked);
        if (checked) {
            // Clear selected spell, keep form editable
            setSelectedDbSpell(null);
            setFormData(prev => ({
                ...prev,
                id: prev.id || uuidv4() // Ensure ID for homebrew
            }));
        }
    }, []);

    // ===== RENDER HELPERS =====
    
    /** Check if current selection is valid for class */
    const isValidForClass = useMemo(() => {
        if (!selectedDbSpell || !spellcastingClass) return true;
        return isOnClassList(selectedDbSpell, spellcastingClass);
    }, [selectedDbSpell, spellcastingClass]);

    /** Title based on mode and level */
    const modalTitle = mode === 'add' 
        ? `Add ${formatLevel(spellLevel)} Spell`
        : `Edit Spell: ${spell?.name || ''}`;

    return (
        <Modal
            opened={isOpen}
            onClose={onClose}
            title={null}
            size="xl"
            centered
            withCloseButton
            className="detail-modal spell-edit-modal"
            classNames={{
                body: 'detail-modal-body',
                header: 'detail-modal-mantine-header',
                close: 'detail-modal-close-btn'
            }}
            styles={{
                content: {
                    backgroundImage: 'url(/dnd-static/themes/assets/parchmentBackground.jpg)'
                }
            }}
        >
            <Stack gap="md">
                {/* Header */}
                <Text size="xl" fw={700} style={{ 
                    fontFamily: "'NodestoCapsCondensed', serif",
                    color: 'var(--text-red, #58180D)'
                }}>
                    {modalTitle}
                </Text>

                {/* ADD MODE: Search and Select */}
                {mode === 'add' && !isHomebrew && (
                    <>
                        {/* Search Input */}
                        <TextInput
                            placeholder="Search spells..."
                            leftSection={<IconSearch size={16} />}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.currentTarget.value)}
                            styles={{
                                input: { fontFamily: "'BookInsanityRemake', Georgia, serif" }
                            }}
                        />

                        {/* Class Filter */}
                        <Group gap="xs">
                            <Text size="sm" fw={600} style={{ fontFamily: "'ScalySansSmallCapsRemake', sans-serif", color: 'var(--text-red)' }}>
                                Filter by class:
                            </Text>
                            <Select
                                data={[
                                    { value: 'all', label: 'All Classes' },
                                    ...CLASS_OPTIONS.map(c => ({ value: c, label: c.charAt(0).toUpperCase() + c.slice(1) }))
                                ]}
                                value={classFilter}
                                onChange={(val) => setClassFilter(val || 'all')}
                                size="xs"
                                w={150}
                            />
                        </Group>

                        {/* Spell List */}
                        <ScrollArea h={200} style={{ border: '1px solid rgba(0,0,0,0.1)', borderRadius: '4px' }}>
                            {availableSpells.length === 0 ? (
                                <Text c="dimmed" ta="center" py="md" style={{ fontFamily: "'ScalySansRemake', sans-serif" }}>
                                    No spells found at {formatLevel(spellLevel).toLowerCase()}
                                </Text>
                            ) : (
                                <Stack gap={0}>
                                    {availableSpells.map((dbSpell) => {
                                        const onList = isOnClassList(dbSpell, spellcastingClass);
                                        const isSelected = selectedDbSpell?.id === dbSpell.id;
                                        
                                        return (
                                            <div
                                                key={dbSpell.id}
                                                className={`spell-list-item ${isSelected ? 'selected' : ''}`}
                                                onClick={() => handleSelectSpell(dbSpell)}
                                                style={{
                                                    padding: '8px 12px',
                                                    cursor: 'pointer',
                                                    backgroundColor: isSelected ? 'rgba(88, 24, 13, 0.1)' : 'transparent',
                                                    borderBottom: '1px solid rgba(0,0,0,0.05)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px'
                                                }}
                                            >
                                                {onList ? (
                                                    <IconCheck size={14} color="green" />
                                                ) : (
                                                    <IconAlertCircle size={14} color="orange" />
                                                )}
                                                <Text size="sm" fw={isSelected ? 600 : 400} style={{ flex: 1, fontFamily: "'ScalySansRemake', sans-serif" }}>
                                                    {dbSpell.name}
                                                </Text>
                                                <Badge size="xs" variant="light" color="gray">
                                                    {formatSchool(dbSpell.school)}
                                                </Badge>
                                                {dbSpell.concentration && (
                                                    <Badge size="xs" variant="outline" color="blue">C</Badge>
                                                )}
                                                {dbSpell.ritual && (
                                                    <Badge size="xs" variant="outline" color="green">R</Badge>
                                                )}
                                            </div>
                                        );
                                    })}
                                </Stack>
                            )}
                        </ScrollArea>

                        {/* Validation Warning */}
                        {selectedDbSpell && !isValidForClass && (
                            <Group gap="xs" style={{ 
                                backgroundColor: 'rgba(255, 193, 7, 0.1)', 
                                padding: '8px 12px', 
                                borderRadius: '4px',
                                border: '1px solid rgba(255, 193, 7, 0.3)'
                            }}>
                                <IconAlertCircle size={16} color="orange" />
                                <Text size="sm" style={{ fontFamily: "'ScalySansRemake', sans-serif" }}>
                                    Not on {spellcastingClass} spell list. You can still add it.
                                </Text>
                            </Group>
                        )}
                    </>
                )}

                {/* Selected Spell Preview / Edit Fields */}
                {(selectedDbSpell || mode === 'edit' || isHomebrew) && (
                    <>
                        <Divider label={isHomebrew ? "Custom Spell" : "Spell Details"} labelPosition="center" 
                            styles={{ label: { fontFamily: "'ScalySansSmallCapsRemake', sans-serif", color: 'var(--text-red)' } }} />
                        
                        {/* Spell Name (editable in homebrew mode) */}
                        {isHomebrew ? (
                            <TextInput
                                label="Spell Name"
                                placeholder="Enter spell name..."
                                value={formData.name}
                                onChange={(e) => handleFieldChange('name', e.currentTarget.value)}
                                required
                                styles={{
                                    label: { fontFamily: "'ScalySansSmallCapsRemake', sans-serif", color: 'var(--text-red)' },
                                    input: { fontFamily: "'BookInsanityRemake', Georgia, serif" }
                                }}
                            />
                        ) : (
                            <div className="detail-modal-header" style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                                <div className="detail-modal-image-placeholder" style={{ width: 60, height: 60 }}>
                                    <IconFlame size={28} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <Text size="xl" fw={700} style={{ fontFamily: "'NodestoCapsCondensed', serif", color: 'var(--text-red)' }}>
                                        {formData.name}
                                    </Text>
                                    <Text size="sm" c="dimmed" style={{ fontFamily: "'ScalySansRemake', sans-serif" }}>
                                        {formatLevel(formData.level ?? 0)} {formatSchool(formData.school ?? 'evocation')}
                                    </Text>
                                </div>
                            </div>
                        )}

                        {/* Homebrew: Level and School */}
                        {isHomebrew && (
                            <Grid gutter="md">
                                <Grid.Col span={6}>
                                    <Select
                                        label="Level"
                                        data={LEVEL_OPTIONS}
                                        value={String(formData.level ?? 0)}
                                        onChange={(val) => handleFieldChange('level', Number(val))}
                                        styles={{
                                            label: { fontFamily: "'ScalySansSmallCapsRemake', sans-serif", color: 'var(--text-red)' }
                                        }}
                                    />
                                </Grid.Col>
                                <Grid.Col span={6}>
                                    <Select
                                        label="School"
                                        data={SCHOOL_OPTIONS}
                                        value={formData.school ?? 'evocation'}
                                        onChange={(val) => handleFieldChange('school', val as SpellSchool)}
                                        styles={{
                                            label: { fontFamily: "'ScalySansSmallCapsRemake', sans-serif", color: 'var(--text-red)' }
                                        }}
                                    />
                                </Grid.Col>
                            </Grid>
                        )}

                        {/* Casting Stats */}
                        <div className="detail-modal-stats" style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'auto 1fr auto 1fr',
                            gap: '8px 16px',
                            fontSize: '0.9rem'
                        }}>
                            <span style={{ color: 'var(--text-red)', fontFamily: "'ScalySansSmallCapsRemake', sans-serif", display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <IconClock size={14} /> Casting Time
                            </span>
                            {isHomebrew ? (
                                <TextInput
                                    value={formData.castingTime ?? '1 action'}
                                    onChange={(e) => handleFieldChange('castingTime', e.currentTarget.value)}
                                    size="xs"
                                />
                            ) : (
                                <span>{formData.castingTime}</span>
                            )}

                            <span style={{ color: 'var(--text-red)', fontFamily: "'ScalySansSmallCapsRemake', sans-serif", display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <IconRuler2 size={14} /> Range
                            </span>
                            {isHomebrew ? (
                                <TextInput
                                    value={formData.range ?? '60 feet'}
                                    onChange={(e) => handleFieldChange('range', e.currentTarget.value)}
                                    size="xs"
                                />
                            ) : (
                                <span>{formData.range}</span>
                            )}

                            <span style={{ color: 'var(--text-red)', fontFamily: "'ScalySansSmallCapsRemake', sans-serif", display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <IconAlphabetLatin size={14} /> Components
                            </span>
                            {isHomebrew ? (
                                <Group gap="xs">
                                    <Checkbox
                                        label="V"
                                        checked={formData.components?.verbal ?? false}
                                        onChange={(e) => handleFieldChange('components', {
                                            ...formData.components,
                                            verbal: e.currentTarget.checked,
                                            somatic: formData.components?.somatic ?? false,
                                            material: formData.components?.material ?? false
                                        })}
                                        size="xs"
                                    />
                                    <Checkbox
                                        label="S"
                                        checked={formData.components?.somatic ?? false}
                                        onChange={(e) => handleFieldChange('components', {
                                            ...formData.components,
                                            verbal: formData.components?.verbal ?? false,
                                            somatic: e.currentTarget.checked,
                                            material: formData.components?.material ?? false
                                        })}
                                        size="xs"
                                    />
                                    <Checkbox
                                        label="M"
                                        checked={formData.components?.material ?? false}
                                        onChange={(e) => handleFieldChange('components', {
                                            ...formData.components,
                                            verbal: formData.components?.verbal ?? false,
                                            somatic: formData.components?.somatic ?? false,
                                            material: e.currentTarget.checked
                                        })}
                                        size="xs"
                                    />
                                </Group>
                            ) : (
                                <span>{formatComponents(formData.components ?? { verbal: false, somatic: false, material: false })}</span>
                            )}

                            <span style={{ color: 'var(--text-red)', fontFamily: "'ScalySansSmallCapsRemake', sans-serif", display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <IconHourglass size={14} /> Duration
                            </span>
                            {isHomebrew ? (
                                <TextInput
                                    value={formData.duration ?? 'Instantaneous'}
                                    onChange={(e) => handleFieldChange('duration', e.currentTarget.value)}
                                    size="xs"
                                />
                            ) : (
                                <span>{formData.duration}</span>
                            )}
                        </div>

                        {/* Description */}
                        {isHomebrew ? (
                            <Textarea
                                label="Description"
                                placeholder="Spell description..."
                                value={formData.description ?? ''}
                                onChange={(e) => handleFieldChange('description', e.currentTarget.value)}
                                minRows={3}
                                maxRows={6}
                                autosize
                                styles={{
                                    label: { fontFamily: "'ScalySansSmallCapsRemake', sans-serif", color: 'var(--text-red)' },
                                    input: { fontFamily: "'BookInsanityRemake', Georgia, serif" }
                                }}
                            />
                        ) : (
                            <Text size="sm" style={{ fontFamily: "'BookInsanityRemake', Georgia, serif", lineHeight: 1.5 }}>
                                {formData.description}
                            </Text>
                        )}

                        {/* Concentration/Ritual checkboxes for homebrew */}
                        {isHomebrew && (
                            <Group gap="md">
                                <Checkbox
                                    label="Concentration"
                                    checked={formData.isConcentration ?? false}
                                    onChange={(e) => handleFieldChange('isConcentration', e.currentTarget.checked)}
                                    styles={{
                                        label: { fontFamily: "'ScalySansRemake', sans-serif" }
                                    }}
                                />
                                <Checkbox
                                    label="Ritual"
                                    checked={formData.isRitual ?? false}
                                    onChange={(e) => handleFieldChange('isRitual', e.currentTarget.checked)}
                                    styles={{
                                        label: { fontFamily: "'ScalySansRemake', sans-serif" }
                                    }}
                                />
                            </Group>
                        )}

                        {/* Prepared checkbox (edit mode, leveled spells only) */}
                        {mode === 'edit' && (formData.level ?? 0) > 0 && (
                            <Checkbox
                                label="Prepared"
                                checked={formData.isPrepared ?? false}
                                onChange={(e) => handleFieldChange('isPrepared', e.currentTarget.checked)}
                                styles={{
                                    label: { fontFamily: "'ScalySansRemake', sans-serif", fontWeight: 600 }
                                }}
                            />
                        )}
                    </>
                )}

                {/* Homebrew Toggle (add mode only) */}
                {mode === 'add' && (
                    <Checkbox
                        label="Homebrew/Custom Spell"
                        checked={isHomebrew}
                        onChange={(e) => handleHomebrewToggle(e.currentTarget.checked)}
                        styles={{
                            label: { fontFamily: "'ScalySansRemake', sans-serif" }
                        }}
                    />
                )}

                {/* Action Buttons */}
                <Group justify="space-between" mt="md">
                    <Button
                        variant="subtle"
                        color="gray"
                        leftSection={<IconX size={16} />}
                        onClick={onClose}
                    >
                        Cancel
                    </Button>

                    <Group gap="sm">
                        {mode === 'edit' && onRemove && (
                            <Button
                                variant={deleteConfirm ? 'filled' : 'subtle'}
                                color="red"
                                leftSection={<IconTrash size={16} />}
                                onClick={handleDelete}
                                onBlur={handleCancelDelete}
                            >
                                {deleteConfirm ? 'Click to Confirm' : 'Remove'}
                            </Button>
                        )}
                        <Button
                            leftSection={<IconDeviceFloppy size={16} />}
                            onClick={handleSave}
                            disabled={!formData.name?.trim() && !selectedDbSpell}
                            style={{
                                backgroundColor: 'var(--text-red)',
                                color: 'white'
                            }}
                        >
                            {mode === 'add' ? 'Add Spell' : 'Save Changes'}
                        </Button>
                    </Group>
                </Group>
            </Stack>
        </Modal>
    );
};

export default SpellEditModal;

