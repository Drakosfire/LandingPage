/**
 * InventorySheet Component
 * 
 * Full inventory page with PHB styling.
 * Includes currency, encumbrance, attunement, and categorized items.
 * 
 * Layout:
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │                              INVENTORY                                   │
 * │ ┌──────────────────────────────────────────────────────────────────────┐│
 * │ │ Character Name           │ Class & Level │ Strength                  ││
 * │ └──────────────────────────────────────────────────────────────────────┘│
 * │ ┌───────────────┬───────────────┬────────────────────────────────────┐  │
 * │ │   CURRENCY    │  ENCUMBRANCE  │           ATTUNEMENT               │  │
 * │ └───────────────┴───────────────┴────────────────────────────────────┘  │
 * │ ┌──────────────────┬──────────────────┬──────────────────┐              │
 * │ │    Column 1      │    Column 2      │    Column 3      │              │
 * │ │  Weapons         │  Adventuring     │  Treasure        │              │
 * │ │  Armor           │  Gear            │  Consumables     │              │
 * │ │  Magic Items     │  Containers      │  Other Items     │              │
 * │ └──────────────────┴──────────────────┴──────────────────┘              │
 * └─────────────────────────────────────────────────────────────────────────┘
 * 
 * @module PlayerCharacterGenerator/sheetComponents
 */

import React, { useState, useCallback } from 'react';
import { CharacterSheetPage } from './CharacterSheetPage';
import {
    InventoryHeader,
    CurrencySection,
    EncumbranceSection,
    AttunementSection,
    InventoryBlock,
    TreasureBlock,
    ContainerBlock,
    Currency,
    AttunedItem,
    InventoryItem,
    Container
} from './inventory';
import { ItemDetailModal, ItemEditModal, InventoryCategory } from './modals';
import { useDetailModal } from '../hooks/useDetailModal';
import { usePlayerCharacterGenerator } from '../PlayerCharacterGeneratorProvider';

export interface InventorySheetProps {
    /** Character name */
    characterName: string;
    /** Class and level (e.g., "Paladin 5") */
    classAndLevel: string;
    /** Strength score */
    strength: number;

    /** Currency amounts */
    currency: Currency;
    /** Callback when currency changes */
    onCurrencyChange?: (currency: Currency) => void;
    /** Attuned magic items */
    attunedItems: AttunedItem[];

    /** Weapon items */
    weapons: InventoryItem[];
    /** Armor and shields */
    armor: InventoryItem[];
    /** Magic items */
    magicItems: InventoryItem[];
    /** Adventuring gear */
    adventuringGear: InventoryItem[];
    /** Treasure and valuables */
    treasure: InventoryItem[];
    /** Consumable items */
    consumables: InventoryItem[];
    /** Other/miscellaneous items */
    otherItems: InventoryItem[];

    /** Containers (backpack, bags, etc.) */
    containers: Container[];

    /** Override current weight (auto-calculated if not provided) */
    currentWeight?: number;

    // Inventory CRUD callbacks (edit mode)
    /** Callback when an item is added to a category */
    onAddItem?: (item: InventoryItem, category: InventoryCategory) => void;
    /** Callback when an item is edited */
    onEditItem?: (item: InventoryItem, category: InventoryCategory) => void;
    /** Callback when an item is deleted */
    onDeleteItem?: (itemId: string, category: InventoryCategory) => void;
}

/**
 * Calculate total weight from all items
 */
const calculateTotalWeight = (props: InventorySheetProps): number => {
    if (props.currentWeight !== undefined) return props.currentWeight;

    const allItems = [
        ...props.weapons,
        ...props.armor,
        ...props.magicItems,
        ...props.adventuringGear,
        ...props.treasure,
        ...props.consumables,
        ...props.otherItems
    ];

    // Sum item weights (quantity * weight per item)
    const itemWeight = allItems.reduce((sum, item) => {
        return sum + (item.weight || 0) * item.quantity;
    }, 0);

    // Container weights (just the container contents, not double-counting)
    const containerWeight = props.containers.reduce((sum, container) => {
        return sum + container.currentWeight;
    }, 0);

    return itemWeight + containerWeight;
};

/**
 * Calculate total weight for a category
 */
const categoryWeight = (items: InventoryItem[]): string => {
    const total = items.reduce((sum, item) => sum + (item.weight || 0) * item.quantity, 0);
    return total > 0 ? `${total} lb` : '';
};

/**
 * InventorySheet - Full inventory page
 */
export const InventorySheet: React.FC<InventorySheetProps> = (props) => {
    const {
        characterName,
        classAndLevel,
        strength,
        currency,
        onCurrencyChange,
        attunedItems,
        weapons,
        armor,
        magicItems,
        adventuringGear,
        treasure,
        consumables,
        otherItems,
        containers,
        onAddItem,
        onEditItem,
        onDeleteItem
    } = props;

    const { isEditMode } = usePlayerCharacterGenerator();
    const totalWeight = calculateTotalWeight(props);

    // Modal state for item details (view mode)
    const { isOpen: isItemModalOpen, data: selectedItem, openModal: openItemModal, closeModal: closeItemModal } = useDetailModal<InventoryItem>();

    // Modal state for item editing (edit mode)
    const [editModalState, setEditModalState] = useState<{
        isOpen: boolean;
        mode: 'add' | 'edit';
        category?: InventoryCategory;
        item?: InventoryItem;
    }>({ isOpen: false, mode: 'add' });

    // Handler for item info clicks (view mode)
    const handleItemInfoClick = (item: InventoryItem) => {
        if (!isEditMode) {
            openItemModal(item);
        }
    };

    // Helper to find item by ID and determine its category
    const findItemWithCategory = useCallback((itemId: string): { item: InventoryItem; category: InventoryCategory } | null => {
        // Check each category
        const weaponItem = weapons.find(item => item.id === itemId);
        if (weaponItem) return { item: weaponItem, category: 'weapons' };

        const armorItem = armor.find(item => item.id === itemId);
        if (armorItem) return { item: armorItem, category: 'armor' };

        const magicItem = magicItems.find(item => item.id === itemId);
        if (magicItem) return { item: magicItem, category: 'magicItems' };

        const gearItem = adventuringGear.find(item => item.id === itemId);
        if (gearItem) return { item: gearItem, category: 'adventuringGear' };

        const treasureItem = treasure.find(item => item.id === itemId);
        if (treasureItem) return { item: treasureItem, category: 'treasure' };

        const consumableItem = consumables.find(item => item.id === itemId);
        if (consumableItem) return { item: consumableItem, category: 'consumables' };

        const otherItem = otherItems.find(item => item.id === itemId);
        if (otherItem) return { item: otherItem, category: 'otherItems' };

        return null;
    }, [weapons, armor, magicItems, adventuringGear, treasure, consumables, otherItems]);

    // Handler for attuned item info (finds item by ID and opens detail modal)
    const handleAttunedItemInfoClick = useCallback((itemId: string) => {
        const found = findItemWithCategory(itemId);
        if (found) {
            console.log('ℹ️ [InventorySheet] Opening info for attuned item:', found.item.name);
            openItemModal(found.item);
        }
    }, [findItemWithCategory, openItemModal]);

    // Handler for attuned item edit click (finds item by ID and opens edit modal)
    const handleAttunedItemEditClick = useCallback((itemId: string) => {
        const found = findItemWithCategory(itemId);
        if (found) {
            console.log('✏️ [InventorySheet] Opening edit modal for attuned item:', found.item.name);
            setEditModalState({
                isOpen: true,
                mode: 'edit',
                category: found.category,
                item: found.item
            });
        }
    }, [findItemWithCategory]);

    // Open edit modal for adding new item
    const handleAddItem = useCallback((category: InventoryCategory) => {
        console.log('➕ [InventorySheet] Opening add modal for:', category);
        setEditModalState({
            isOpen: true,
            mode: 'add',
            category
        });
    }, []);

    // Open edit modal for editing existing item
    const handleEditItem = useCallback((item: InventoryItem, category: InventoryCategory) => {
        console.log('✏️ [InventorySheet] Opening edit modal for:', item.name);
        setEditModalState({
            isOpen: true,
            mode: 'edit',
            category,
            item
        });
    }, []);

    // Close edit modal
    const handleCloseEditModal = useCallback(() => {
        setEditModalState(prev => ({ ...prev, isOpen: false }));
    }, []);

    // Handle save from edit modal
    const handleSaveItem = useCallback((item: InventoryItem, category: InventoryCategory) => {
        if (editModalState.mode === 'add' && onAddItem) {
            onAddItem(item, category);
        } else if (editModalState.mode === 'edit' && onEditItem) {
            onEditItem(item, category);
        }
    }, [editModalState.mode, onAddItem, onEditItem]);

    // Handle delete from edit modal
    const handleDeleteItem = useCallback((itemId: string, category: InventoryCategory) => {
        if (onDeleteItem) {
            onDeleteItem(itemId, category);
        }
    }, [onDeleteItem]);

    return (
        <CharacterSheetPage className="inventory-sheet" testId="inventory-sheet">
            {/* Page Title */}
            <div className="phb-page-title">Inventory</div>

            {/* Header - Character Info */}
            <InventoryHeader
                characterName={characterName}
                classAndLevel={classAndLevel}
                strength={strength}
            />

            {/* Top Row: Currency, Encumbrance, Attunement */}
            <div className="top-row">
                <CurrencySection currency={currency} onCurrencyChange={onCurrencyChange} />
                <EncumbranceSection
                    currentWeight={totalWeight}
                    strength={strength}
                />
                <AttunementSection 
                    attunedItems={attunedItems}
                    onItemClick={handleAttunedItemEditClick}
                    onItemInfo={handleAttunedItemInfoClick}
                />
            </div>

            {/* Main Content: 3 Columns */}
            <div className="inventory-main-content">
                {/* Column 1: Weapons, Armor, Magic Items */}
                <div className="inventory-column">
                    <InventoryBlock
                        title="Weapons"
                        totalWeight={categoryWeight(weapons)}
                        items={weapons}
                        emptyRows={1}
                        onItemInfoClick={handleItemInfoClick}
                        onAddItem={() => handleAddItem('weapons')}
                        onItemEdit={(item) => handleEditItem(item, 'weapons')}
                    />
                    <InventoryBlock
                        title="Armor & Shields"
                        totalWeight={categoryWeight(armor)}
                        items={armor}
                        headers={['Qty', 'Item', 'Wt.', 'AC']}
                        formatValue={(item) => item.notes || '—'}
                        emptyRows={1}
                        onItemInfoClick={handleItemInfoClick}
                        onAddItem={() => handleAddItem('armor')}
                        onItemEdit={(item) => handleEditItem(item, 'armor')}
                    />
                    <InventoryBlock
                        title="Magic Items"
                        totalWeight={categoryWeight(magicItems)}
                        items={magicItems}
                        headers={['Qty', 'Item', 'Wt.', 'Rarity']}
                        formatValue={(item) => item.notes || '—'}
                        emptyRows={2}
                        flexGrow
                        onItemInfoClick={handleItemInfoClick}
                        onAddItem={() => handleAddItem('magicItems')}
                        onItemEdit={(item) => handleEditItem(item, 'magicItems')}
                    />
                </div>

                {/* Column 2: Adventuring Gear, Containers */}
                <div className="inventory-column">
                    <InventoryBlock
                        title="Adventuring Gear"
                        totalWeight={categoryWeight(adventuringGear)}
                        items={adventuringGear}
                        emptyRows={4}
                        flexGrow
                        onItemInfoClick={handleItemInfoClick}
                        onAddItem={() => handleAddItem('adventuringGear')}
                        onItemEdit={(item) => handleEditItem(item, 'adventuringGear')}
                    />
                    {containers.map((container) => (
                        <ContainerBlock
                            key={container.id}
                            container={container}
                            emptyRows={1}
                        />
                    ))}
                </div>

                {/* Column 3: Treasure, Consumables, Other */}
                <div className="inventory-column">
                    <TreasureBlock
                        title="Treasure & Valuables"
                        totalWeight={categoryWeight(treasure)}
                        items={treasure}
                        emptyRows={2}
                        onAddItem={() => handleAddItem('treasure')}
                        onItemEdit={(item) => handleEditItem(item, 'treasure')}
                    />
                    <InventoryBlock
                        title="Consumables"
                        totalWeight={categoryWeight(consumables)}
                        items={consumables}
                        headers={['Qty', 'Item', 'Wt.', 'Uses']}
                        formatValue={(item) => item.notes || '—'}
                        emptyRows={1}
                        className="consumables-block"
                        onItemInfoClick={handleItemInfoClick}
                        onAddItem={() => handleAddItem('consumables')}
                        onItemEdit={(item) => handleEditItem(item, 'consumables')}
                    />
                    <InventoryBlock
                        title="Other Items"
                        totalWeight={categoryWeight(otherItems)}
                        items={otherItems}
                        headers={['Qty', 'Item', 'Wt.', 'Notes']}
                        formatValue={(item) => item.notes || '—'}
                        emptyRows={3}
                        flexGrow
                        onItemInfoClick={handleItemInfoClick}
                        onAddItem={() => handleAddItem('otherItems')}
                        onItemEdit={(item) => handleEditItem(item, 'otherItems')}
                    />
                </div>
            </div>

            {/* Item Detail Modal (View Mode) */}
            {selectedItem && !isEditMode && (
                <ItemDetailModal
                    isOpen={isItemModalOpen}
                    onClose={closeItemModal}
                    name={selectedItem.name}
                    type={selectedItem.type || 'other'}
                    description={selectedItem.description}
                    imageUrl={selectedItem.imageUrl}
                    weight={selectedItem.weight}
                    value={selectedItem.valueNumber}
                    quantity={selectedItem.quantity}
                    isMagical={selectedItem.isMagical}
                    rarity={selectedItem.rarity}
                    requiresAttunement={selectedItem.requiresAttunement}
                    damage={selectedItem.damage}
                    damageType={selectedItem.damageType}
                    properties={selectedItem.properties}
                    range={selectedItem.range}
                    weaponCategory={selectedItem.weaponCategory}
                    weaponType={selectedItem.weaponType}
                    armorClass={selectedItem.armorClass}
                    armorCategory={selectedItem.armorCategory}
                    stealthDisadvantage={selectedItem.stealthDisadvantage}
                    acBonus={selectedItem.acBonus}
                />
            )}

            {/* Item Edit Modal (Edit Mode) */}
            <ItemEditModal
                isOpen={editModalState.isOpen}
                onClose={handleCloseEditModal}
                mode={editModalState.mode}
                category={editModalState.category}
                item={editModalState.item}
                onSave={handleSaveItem}
                onDelete={handleDeleteItem}
            />
        </CharacterSheetPage>
    );
};

export default InventorySheet;

