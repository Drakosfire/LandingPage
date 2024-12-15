import React from 'react';
import { ItemDetailsType } from '../../../types/card.types';

interface ItemDetailsProps {
    details: ItemDetailsType;
}

const ItemDetails: React.FC<ItemDetailsProps> = ({ details }) => {
    // Get the first (and only) key from the details object
    const itemKey = Object.keys(details)[0];
    const item = details[itemKey];

    return (
        <div>
            <h3>{item.Name}</h3>
            <p>Type: {item.Type}</p>
            <p>Rarity: {item.Rarity}</p>
            <p>Value: {item.Value}</p>
            <p>Properties: {item.Properties.join(', ')}</p>
            <p>Damage: {item.Damage[0]} {item.Damage[1]}</p>
            <p>Weight: {item.Weight}</p>
            <p>Description: {item.Description}</p>
            <p>Quote: {item.Quote}</p>
            <p>SD Prompt: {item['SD Prompt']}</p>
        </div>
    );
};

export default ItemDetails; 