/**
 * Inventory Components - PHB-Style Inventory Sheet
 * 
 * Sub-components for the inventory sheet page.
 * 
 * @module PlayerCharacterGenerator/sheetComponents/inventory
 */

// Item display
export { ItemRow } from './ItemRow';
export type { ItemRowProps } from './ItemRow';

// Category blocks
export { InventoryBlock } from './InventoryBlock';
export type { InventoryBlockProps, InventoryItem } from './InventoryBlock';

export { TreasureBlock } from './TreasureBlock';
export type { TreasureBlockProps } from './TreasureBlock';

export { ContainerBlock } from './ContainerBlock';
export type { ContainerBlockProps, Container } from './ContainerBlock';

// Top row sections
export { CurrencySection } from './CurrencySection';
export type { CurrencySectionProps, Currency } from './CurrencySection';

export { EncumbranceSection } from './EncumbranceSection';
export type { EncumbranceSectionProps, Encumbrance } from './EncumbranceSection';

export { AttunementSection } from './AttunementSection';
export type { AttunementSectionProps, AttunedItem } from './AttunementSection';

// Header and notes
export { InventoryHeader } from './InventoryHeader';
export type { InventoryHeaderProps } from './InventoryHeader';

export { InventoryNotes } from './InventoryNotes';
export type { InventoryNotesProps } from './InventoryNotes';

