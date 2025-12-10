/**
 * ItemEditModal Component
 * 
 * Editable modal for adding/editing inventory items.
 * Form fields adapt based on item type (weapon/armor/general).
 * 
 * Features:
 * - Add mode: Empty form, "Add Item" button
 * - Edit mode: Pre-filled form, "Save Changes" + "Delete" buttons
 * - Contextual fields based on item category
 * - PHB parchment styling
 * 
 * @module PlayerCharacterGenerator/sheetComponents/modals
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Modal, TextInput, Textarea, NumberInput, Select, Checkbox, Group, Button, Stack, Grid, Divider, Text } from '@mantine/core';
import {
    IconSword,
    IconShield,
    IconTag,
    IconTrash,
    IconDeviceFloppy,
    IconX
} from '@tabler/icons-react';
import type { EquipmentType, MagicItemRarity, WeaponProperty } from '../../types/dnd5e/equipment.types';
import type { DamageType } from '../../types/system.types';
import type { InventoryItem } from '../inventory/InventoryBlock';
import { v4 as uuidv4 } from 'uuid';

/** Inventory category for organizing items */
export type InventoryCategory =
    | 'weapons'
    | 'armor'
    | 'magicItems'
    | 'adventuringGear'
    | 'treasure'
    | 'consumables'
    | 'otherItems';

export interface ItemEditModalProps {
    /** Whether modal is open */
    isOpen: boolean;
    /** Close callback */
    onClose: () => void;
    /** Mode: 'add' for new item, 'edit' for existing */
    mode: 'add' | 'edit';
    /** Category being added to (for add mode) */
    category?: InventoryCategory;
    /** Existing item data (for edit mode) */
    item?: InventoryItem;
    /** Save callback */
    onSave: (item: InventoryItem, category: InventoryCategory) => void;
    /** Delete callback (edit mode only) */
    onDelete?: (itemId: string, category: InventoryCategory) => void;
}

// Equipment type options for dropdown
const EQUIPMENT_TYPE_OPTIONS: { value: EquipmentType; label: string }[] = [
    { value: 'weapon', label: 'Weapon' },
    { value: 'armor', label: 'Armor' },
    { value: 'shield', label: 'Shield' },
    { value: 'adventuring gear', label: 'Adventuring Gear' },
    { value: 'consumable', label: 'Consumable' },
    { value: 'treasure', label: 'Treasure' },
    { value: 'tool', label: 'Tool' },
    { value: 'wondrous item', label: 'Magical Item' },
    { value: 'other', label: 'Other' }
];

// Damage type options
const DAMAGE_TYPE_OPTIONS: { value: DamageType; label: string }[] = [
    { value: 'slashing', label: 'Slashing' },
    { value: 'piercing', label: 'Piercing' },
    { value: 'bludgeoning', label: 'Bludgeoning' },
    { value: 'fire', label: 'Fire' },
    { value: 'cold', label: 'Cold' },
    { value: 'lightning', label: 'Lightning' },
    { value: 'thunder', label: 'Thunder' },
    { value: 'acid', label: 'Acid' },
    { value: 'poison', label: 'Poison' },
    { value: 'necrotic', label: 'Necrotic' },
    { value: 'radiant', label: 'Radiant' },
    { value: 'force', label: 'Force' },
    { value: 'psychic', label: 'Psychic' }
];

// Magic item rarity options
const RARITY_OPTIONS: { value: MagicItemRarity; label: string }[] = [
    { value: 'common', label: 'Common' },
    { value: 'uncommon', label: 'Uncommon' },
    { value: 'rare', label: 'Rare' },
    { value: 'very rare', label: 'Very Rare' },
    { value: 'legendary', label: 'Legendary' },
    { value: 'artifact', label: 'Artifact' }
];

// Weapon properties options
const WEAPON_PROPERTIES: { value: WeaponProperty; label: string }[] = [
    { value: 'ammunition', label: 'Ammunition' },
    { value: 'finesse', label: 'Finesse' },
    { value: 'heavy', label: 'Heavy' },
    { value: 'light', label: 'Light' },
    { value: 'loading', label: 'Loading' },
    { value: 'range', label: 'Range' },
    { value: 'reach', label: 'Reach' },
    { value: 'special', label: 'Special' },
    { value: 'thrown', label: 'Thrown' },
    { value: 'two-handed', label: 'Two-Handed' },
    { value: 'versatile', label: 'Versatile' }
];

// Armor category options
const ARMOR_CATEGORY_OPTIONS = [
    { value: 'light', label: 'Light' },
    { value: 'medium', label: 'Medium' },
    { value: 'heavy', label: 'Heavy' }
];

// Weapon category options
const WEAPON_CATEGORY_OPTIONS = [
    { value: 'simple', label: 'Simple' },
    { value: 'martial', label: 'Martial' }
];

// Weapon type options
const WEAPON_TYPE_OPTIONS = [
    { value: 'melee', label: 'Melee' },
    { value: 'ranged', label: 'Ranged' }
];

/** Map category to default equipment type */
const categoryToType = (category?: InventoryCategory): EquipmentType => {
    switch (category) {
        case 'weapons': return 'weapon';
        case 'armor': return 'armor';
        case 'magicItems': return 'wondrous item';
        case 'adventuringGear': return 'adventuring gear';
        case 'treasure': return 'treasure';
        case 'consumables': return 'consumable';
        default: return 'other';
    }
};

/** Create empty item with defaults */
const createEmptyItem = (category?: InventoryCategory): InventoryItem => ({
    id: uuidv4(),
    name: '',
    quantity: 1,
    weight: undefined,
    value: undefined,
    type: categoryToType(category),
    description: undefined
});

/**
 * ItemEditModal - Editable item form modal
 */
export const ItemEditModal: React.FC<ItemEditModalProps> = ({
    isOpen,
    onClose,
    mode,
    category,
    item,
    onSave,
    onDelete
}) => {
    // Form state
    const [formData, setFormData] = useState<InventoryItem>(createEmptyItem(category));
    const [deleteConfirm, setDeleteConfirm] = useState(false);

    // Initialize form when modal opens or item changes
    useEffect(() => {
        if (isOpen) {
            if (mode === 'edit' && item) {
                console.log('✏️ [ItemEditModal] Loading item for edit:', item.name);
                setFormData({ ...item });
            } else {
                console.log('➕ [ItemEditModal] Creating new item for category:', category);
                setFormData(createEmptyItem(category));
            }
            setDeleteConfirm(false);
        }
    }, [isOpen, mode, item, category]);

    // Field change handlers
    const handleFieldChange = useCallback(<K extends keyof InventoryItem>(field: K, value: InventoryItem[K]) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    }, []);

    // Weapon properties toggle
    const handlePropertyToggle = useCallback((property: WeaponProperty) => {
        setFormData(prev => {
            const currentProps = prev.properties || [];
            const hasProperty = currentProps.includes(property);
            return {
                ...prev,
                properties: hasProperty
                    ? currentProps.filter(p => p !== property)
                    : [...currentProps, property]
            };
        });
    }, []);

    // Save handler
    const handleSave = useCallback(() => {
        // Validate required fields
        if (!formData.name.trim()) {
            console.warn('⚠️ [ItemEditModal] Name is required');
            return;
        }

        // Ensure quantity is at least 1
        const finalItem: InventoryItem = {
            ...formData,
            name: formData.name.trim(),
            quantity: Math.max(1, formData.quantity || 1)
        };

        // Determine target category
        const targetCategory = category || inferCategoryFromType(formData.type);

        console.log('💾 [ItemEditModal] Saving item:', finalItem.name, 'to', targetCategory);
        onSave(finalItem, targetCategory);
        onClose();
    }, [formData, category, onSave, onClose]);

    // Delete handler with confirmation
    const handleDelete = useCallback(() => {
        if (!deleteConfirm) {
            setDeleteConfirm(true);
            return;
        }

        if (item?.id && onDelete && category) {
            console.log('🗑️ [ItemEditModal] Deleting item:', item.name);
            onDelete(item.id, category);
            onClose();
        }
    }, [deleteConfirm, item, onDelete, category, onClose]);

    // Cancel delete confirmation when clicking elsewhere
    const handleCancelDelete = useCallback(() => {
        setDeleteConfirm(false);
    }, []);

    // Determine which sections to show
    const isWeapon = formData.type === 'weapon';
    const isArmor = formData.type === 'armor';
    const isShield = formData.type === 'shield';

    // Get icon for current type
    const TypeIcon = isWeapon ? IconSword : (isArmor || isShield) ? IconShield : IconTag;

    return (
        <Modal
            opened={isOpen}
            onClose={onClose}
            title={null}
            size="lg"
            centered
            withCloseButton
            className="detail-modal item-edit-modal"
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
                {/* Header with icon and name */}
                <Group align="flex-start" gap="md">
                    <div className="detail-modal-image-placeholder" style={{ width: 80, height: 80 }}>
                        <TypeIcon size={36} />
                    </div>
                    <Stack gap="xs" style={{ flex: 1 }}>
                        <TextInput
                            label="Item Name"
                            placeholder="Enter item name..."
                            value={formData.name}
                            onChange={(e) => handleFieldChange('name', e.currentTarget.value)}
                            required
                            styles={{
                                label: { fontFamily: "'ScalySansSmallCapsRemake', sans-serif", color: 'var(--text-red)' },
                                input: { fontFamily: "'BookInsanityRemake', Georgia, serif" }
                            }}
                        />
                        <Select
                            label="Type"
                            data={EQUIPMENT_TYPE_OPTIONS}
                            value={formData.type}
                            onChange={(val) => handleFieldChange('type', val as EquipmentType)}
                            styles={{
                                label: { fontFamily: "'ScalySansSmallCapsRemake', sans-serif", color: 'var(--text-red)' }
                            }}
                        />
                    </Stack>
                </Group>

                {/* Basic Stats Row */}
                <Grid gutter="md">
                    <Grid.Col span={4}>
                        <NumberInput
                            label="Quantity"
                            value={formData.quantity}
                            onChange={(val) => handleFieldChange('quantity', typeof val === 'number' ? val : 1)}
                            min={0}
                            styles={{
                                label: { fontFamily: "'ScalySansSmallCapsRemake', sans-serif", color: 'var(--text-red)' }
                            }}
                        />
                    </Grid.Col>
                    <Grid.Col span={4}>
                        <NumberInput
                            label="Weight (lb)"
                            value={formData.weight}
                            onChange={(val) => handleFieldChange('weight', typeof val === 'number' ? val : undefined)}
                            min={0}
                            decimalScale={2}
                            placeholder="—"
                            styles={{
                                label: { fontFamily: "'ScalySansSmallCapsRemake', sans-serif", color: 'var(--text-red)' }
                            }}
                        />
                    </Grid.Col>
                    <Grid.Col span={4}>
                        <NumberInput
                            label="Value (gp)"
                            value={formData.valueNumber}
                            onChange={(val) => handleFieldChange('valueNumber', typeof val === 'number' ? val : undefined)}
                            min={0}
                            decimalScale={2}
                            placeholder="—"
                            styles={{
                                label: { fontFamily: "'ScalySansSmallCapsRemake', sans-serif", color: 'var(--text-red)' }
                            }}
                        />
                    </Grid.Col>
                </Grid>

                {/* Weapon Stats */}
                {isWeapon && (
                    <>
                        <Divider label="Weapon Stats" labelPosition="center" styles={{ label: { fontFamily: "'ScalySansSmallCapsRemake', sans-serif", color: 'var(--text-red)' } }} />
                        <Grid gutter="md">
                            <Grid.Col span={4}>
                                <TextInput
                                    label="Damage"
                                    placeholder="1d8"
                                    value={formData.damage || ''}
                                    onChange={(e) => handleFieldChange('damage', e.currentTarget.value)}
                                    styles={{
                                        label: { fontFamily: "'ScalySansSmallCapsRemake', sans-serif", color: 'var(--text-red)' }
                                    }}
                                />
                            </Grid.Col>
                            <Grid.Col span={4}>
                                <Select
                                    label="Damage Type"
                                    data={DAMAGE_TYPE_OPTIONS}
                                    value={formData.damageType || null}
                                    onChange={(val) => handleFieldChange('damageType', val as DamageType)}
                                    placeholder="Select..."
                                    clearable
                                    styles={{
                                        label: { fontFamily: "'ScalySansSmallCapsRemake', sans-serif", color: 'var(--text-red)' }
                                    }}
                                />
                            </Grid.Col>
                            <Grid.Col span={4}>
                                <Select
                                    label="Category"
                                    data={WEAPON_CATEGORY_OPTIONS}
                                    value={formData.weaponCategory || null}
                                    onChange={(val) => handleFieldChange('weaponCategory', val as 'simple' | 'martial')}
                                    placeholder="Select..."
                                    clearable
                                    styles={{
                                        label: { fontFamily: "'ScalySansSmallCapsRemake', sans-serif", color: 'var(--text-red)' }
                                    }}
                                />
                            </Grid.Col>
                        </Grid>
                        <Grid gutter="md">
                            <Grid.Col span={4}>
                                <Select
                                    label="Weapon Type"
                                    data={WEAPON_TYPE_OPTIONS}
                                    value={formData.weaponType || null}
                                    onChange={(val) => handleFieldChange('weaponType', val as 'melee' | 'ranged')}
                                    placeholder="Select..."
                                    clearable
                                    styles={{
                                        label: { fontFamily: "'ScalySansSmallCapsRemake', sans-serif", color: 'var(--text-red)' }
                                    }}
                                />
                            </Grid.Col>
                            <Grid.Col span={4}>
                                <NumberInput
                                    label="Range (Normal)"
                                    value={formData.range?.normal}
                                    onChange={(val) => handleFieldChange('range', { ...formData.range, normal: typeof val === 'number' ? val : 0 })}
                                    min={0}
                                    placeholder="ft"
                                    styles={{
                                        label: { fontFamily: "'ScalySansSmallCapsRemake', sans-serif", color: 'var(--text-red)' }
                                    }}
                                />
                            </Grid.Col>
                            <Grid.Col span={4}>
                                <NumberInput
                                    label="Range (Long)"
                                    value={formData.range?.long}
                                    onChange={(val) => handleFieldChange('range', { ...formData.range, normal: formData.range?.normal || 0, long: typeof val === 'number' ? val : undefined })}
                                    min={0}
                                    placeholder="ft"
                                    styles={{
                                        label: { fontFamily: "'ScalySansSmallCapsRemake', sans-serif", color: 'var(--text-red)' }
                                    }}
                                />
                            </Grid.Col>
                        </Grid>

                        {/* Weapon Properties */}
                        <Text size="sm" fw={600} style={{ fontFamily: "'ScalySansSmallCapsRemake', sans-serif", color: 'var(--text-red)' }}>
                            Properties
                        </Text>
                        <Group gap="xs">
                            {WEAPON_PROPERTIES.map(({ value, label }) => (
                                <Checkbox
                                    key={value}
                                    label={label}
                                    checked={formData.properties?.includes(value) || false}
                                    onChange={() => handlePropertyToggle(value)}
                                    size="xs"
                                    styles={{
                                        label: { fontFamily: "'ScalySansRemake', sans-serif", fontSize: '12px' }
                                    }}
                                />
                            ))}
                        </Group>
                    </>
                )}

                {/* Armor Stats */}
                {isArmor && (
                    <>
                        <Divider label="Armor Stats" labelPosition="center" styles={{ label: { fontFamily: "'ScalySansSmallCapsRemake', sans-serif", color: 'var(--text-red)' } }} />
                        <Grid gutter="md">
                            <Grid.Col span={4}>
                                <NumberInput
                                    label="Armor Class"
                                    value={formData.armorClass}
                                    onChange={(val) => handleFieldChange('armorClass', typeof val === 'number' ? val : undefined)}
                                    min={10}
                                    max={25}
                                    placeholder="AC"
                                    styles={{
                                        label: { fontFamily: "'ScalySansSmallCapsRemake', sans-serif", color: 'var(--text-red)' }
                                    }}
                                />
                            </Grid.Col>
                            <Grid.Col span={4}>
                                <Select
                                    label="Category"
                                    data={ARMOR_CATEGORY_OPTIONS}
                                    value={formData.armorCategory || null}
                                    onChange={(val) => handleFieldChange('armorCategory', val as 'light' | 'medium' | 'heavy')}
                                    placeholder="Select..."
                                    clearable
                                    styles={{
                                        label: { fontFamily: "'ScalySansSmallCapsRemake', sans-serif", color: 'var(--text-red)' }
                                    }}
                                />
                            </Grid.Col>
                            <Grid.Col span={4}>
                                <Checkbox
                                    label="Stealth Disadvantage"
                                    checked={formData.stealthDisadvantage || false}
                                    onChange={(e) => handleFieldChange('stealthDisadvantage', e.currentTarget.checked)}
                                    mt="xl"
                                    styles={{
                                        label: { fontFamily: "'ScalySansRemake', sans-serif" }
                                    }}
                                />
                            </Grid.Col>
                        </Grid>
                    </>
                )}

                {/* Shield Stats */}
                {isShield && (
                    <>
                        <Divider label="Shield Stats" labelPosition="center" styles={{ label: { fontFamily: "'ScalySansSmallCapsRemake', sans-serif", color: 'var(--text-red)' } }} />
                        <Grid gutter="md">
                            <Grid.Col span={6}>
                                <NumberInput
                                    label="AC Bonus"
                                    value={formData.acBonus ?? 2}
                                    onChange={(val) => handleFieldChange('acBonus', typeof val === 'number' ? val : 2)}
                                    min={1}
                                    max={5}
                                    styles={{
                                        label: { fontFamily: "'ScalySansSmallCapsRemake', sans-serif", color: 'var(--text-red)' }
                                    }}
                                />
                            </Grid.Col>
                        </Grid>
                    </>
                )}

                {/* Magic Properties */}
                <Divider label="Magic Properties" labelPosition="center" styles={{ label: { fontFamily: "'ScalySansSmallCapsRemake', sans-serif", color: 'var(--text-red)' } }} />
                <Grid gutter="md">
                    <Grid.Col span={3}>
                        <Checkbox
                            label="Magical Item"
                            checked={formData.isMagical || false}
                            onChange={(e) => handleFieldChange('isMagical', e.currentTarget.checked)}
                            styles={{
                                label: { fontFamily: "'ScalySansRemake', sans-serif" }
                            }}
                        />
                    </Grid.Col>
                    <Grid.Col span={3}>
                        <Select
                            label="Rarity"
                            data={RARITY_OPTIONS}
                            value={formData.rarity || null}
                            onChange={(val) => handleFieldChange('rarity', val as MagicItemRarity)}
                            placeholder="Select..."
                            clearable
                            disabled={!formData.isMagical}
                            styles={{
                                label: { fontFamily: "'ScalySansSmallCapsRemake', sans-serif", color: 'var(--text-red)' }
                            }}
                        />
                    </Grid.Col>
                    <Grid.Col span={3}>
                        <Checkbox
                            label="Requires Attunement"
                            checked={formData.requiresAttunement || false}
                            onChange={(e) => {
                                handleFieldChange('requiresAttunement', e.currentTarget.checked);
                                // If unchecking requires attunement, also unattune the item
                                if (!e.currentTarget.checked) {
                                    handleFieldChange('attuned', false);
                                }
                            }}
                            mt="xl"
                            disabled={!formData.isMagical}
                            styles={{
                                label: { fontFamily: "'ScalySansRemake', sans-serif" }
                            }}
                        />
                    </Grid.Col>
                    <Grid.Col span={3}>
                        <Checkbox
                            label="Attuned ✦"
                            checked={formData.attuned || false}
                            onChange={(e) => handleFieldChange('attuned', e.currentTarget.checked)}
                            mt="xl"
                            disabled={!formData.requiresAttunement}
                            styles={{
                                label: { fontFamily: "'ScalySansRemake', sans-serif", fontWeight: 600 }
                            }}
                        />
                    </Grid.Col>
                </Grid>

                {/* Description */}
                <Textarea
                    label="Description"
                    placeholder="Item description, special properties, or notes..."
                    value={formData.description || ''}
                    onChange={(e) => handleFieldChange('description', e.currentTarget.value)}
                    minRows={3}
                    maxRows={5}
                    autosize
                    styles={{
                        label: { fontFamily: "'ScalySansSmallCapsRemake', sans-serif", color: 'var(--text-red)' },
                        input: { fontFamily: "'BookInsanityRemake', Georgia, serif" }
                    }}
                />

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
                        {mode === 'edit' && onDelete && (
                            <Button
                                variant={deleteConfirm ? 'filled' : 'subtle'}
                                color="red"
                                leftSection={<IconTrash size={16} />}
                                onClick={handleDelete}
                                onBlur={handleCancelDelete}
                            >
                                {deleteConfirm ? 'Click to Confirm' : 'Delete'}
                            </Button>
                        )}
                        <Button
                            leftSection={<IconDeviceFloppy size={16} />}
                            onClick={handleSave}
                            disabled={!formData.name.trim()}
                            style={{
                                backgroundColor: 'var(--text-red)',
                                color: 'white'
                            }}
                        >
                            {mode === 'add' ? 'Add Item' : 'Save Changes'}
                        </Button>
                    </Group>
                </Group>
            </Stack>
        </Modal>
    );
};

/** Infer category from equipment type */
function inferCategoryFromType(type?: EquipmentType): InventoryCategory {
    switch (type) {
        case 'weapon': return 'weapons';
        case 'armor':
        case 'shield': return 'armor';
        case 'wondrous item': return 'magicItems';
        case 'adventuring gear':
        case 'tool':
        case 'container': return 'adventuringGear';
        case 'treasure':
        case 'trinket': return 'treasure';
        case 'consumable': return 'consumables';
        default: return 'otherItems';
    }
}

export default ItemEditModal;

