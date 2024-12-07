import { ItemDetailsType } from '../../../types/card.types';

interface ItemDetailsProps {
    details: ItemDetailsType;
}

const ItemDetails: React.FC<ItemDetailsProps> = ({ details }) => {
    return (
        <div>
            <h3>{details.name}</h3>
            <p>Type: {details.type}</p>
            <p>Rarity: {details.rarity}</p>
            <p>Value: {details.value}</p>
            <p>Properties: {details.properties}</p>
            {details.damage && <p>Damage: {details.damage}</p>}
            <p>Weight: {details.weight}</p>
            <p>Description: {details.description}</p>
            <p>Quote: {details.quote}</p>
        </div>
    );
};

export default ItemDetails; 