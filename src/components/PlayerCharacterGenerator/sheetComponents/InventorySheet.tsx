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

import React from 'react';
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
import { ItemDetailModal } from './modals';
import { useDetailModal } from '../hooks/useDetailModal';

export interface InventorySheetProps {
    /** Character name */
    characterName: string;
    /** Class and level (e.g., "Paladin 5") */
    classAndLevel: string;
    /** Strength score */
    strength: number;

    /** Currency amounts */
    currency: Currency;
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
        attunedItems,
        weapons,
        armor,
        magicItems,
        adventuringGear,
        treasure,
        consumables,
        otherItems,
        containers
    } = props;

    const totalWeight = calculateTotalWeight(props);

    // Modal state for item details
    const { isOpen: isItemModalOpen, data: selectedItem, openModal: openItemModal, closeModal: closeItemModal } = useDetailModal<InventoryItem>();

    // Handler for item info clicks
    const handleItemInfoClick = (item: InventoryItem) => {
        openItemModal(item);
    };

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
                <CurrencySection currency={currency} />
                <EncumbranceSection
                    currentWeight={totalWeight}
                    strength={strength}
                />
                <AttunementSection attunedItems={attunedItems} />
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
                    />
                    <InventoryBlock
                        title="Armor & Shields"
                        totalWeight={categoryWeight(armor)}
                        items={armor}
                        headers={['Qty', 'Item', 'Wt.', 'AC']}
                        formatValue={(item) => item.notes || '—'}
                        emptyRows={1}
                        onItemInfoClick={handleItemInfoClick}
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
                    />
                </div>
            </div>

            {/* Item Detail Modal */}
            {selectedItem && (
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
        </CharacterSheetPage>
    );
};

export default InventorySheet;

