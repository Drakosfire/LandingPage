/**
 * ContainerBlock Component
 * 
 * Container with dashed border for backpacks, bags, etc.
 * Shows capacity info and contained items.
 * 
 * @module PlayerCharacterGenerator/sheetComponents/inventory
 */

import React from 'react';
import { ItemRow } from './ItemRow';
import { InventoryItem } from './InventoryBlock';

export interface Container {
    id: string;
    name: string;
    currentWeight: number;
    capacityWeight: number;
    capacityVolume?: string;
    items: InventoryItem[];
}

export interface ContainerBlockProps {
    /** Container data */
    container: Container;
    /** Number of empty rows */
    emptyRows?: number;
}

/**
 * ContainerBlock - Dashed border container section
 */
export const ContainerBlock: React.FC<ContainerBlockProps> = ({
    container,
    emptyRows = 1
}) => {
    const { name, currentWeight, capacityWeight, capacityVolume, items } = container;

    // Format capacity info
    const capacityParts: string[] = [];
    capacityParts.push(`${capacityWeight} lb`);
    if (capacityVolume) capacityParts.push(capacityVolume);
    const capacityText = `Capacity: ${capacityParts.join(' / ')}`;

    return (
        <div className="phb-section inventory-block container-block">
            <div className="block-header">
                <span className="block-title">📦 {name} Contents</span>
                <span className="block-weight">{currentWeight}/{capacityWeight} lb</span>
            </div>
            <div className="container-info">
                <span>{capacityText}</span>
            </div>
            <div className="item-list">
                {items.map((item) => (
                    <ItemRow
                        key={item.id}
                        quantity={item.quantity}
                        name={item.name}
                        weight={item.weight ? `${item.weight} lb` : '—'}
                        value={item.value || '—'}
                    />
                ))}
                {Array.from({ length: emptyRows }).map((_, idx) => (
                    <ItemRow key={`empty-${idx}`} isEmpty />
                ))}
            </div>
        </div>
    );
};

export default ContainerBlock;

