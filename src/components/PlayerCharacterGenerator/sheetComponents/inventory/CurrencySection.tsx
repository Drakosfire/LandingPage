/**
 * CurrencySection Component
 * 
 * Currency grid with 5 coin types and total value.
 * 
 * Edit Mode Support:
 * - All currency fields are Quick Edit (inline number inputs)
 * 
 * @module PlayerCharacterGenerator/sheetComponents/inventory
 */

import React from 'react';
import { usePlayerCharacterGenerator } from '../../PlayerCharacterGeneratorProvider';
import { EditableText } from '../EditableText';

export interface Currency {
    cp: number;
    sp: number;
    ep: number;
    gp: number;
    pp: number;
}

export interface CurrencySectionProps {
    /** Currency amounts */
    currency: Currency;
    /** Whether to show total value */
    showTotal?: boolean;
    /** Callback when currency changes */
    onCurrencyChange?: (currency: Currency) => void;
}

/**
 * Calculate total value in gold pieces
 */
const calculateTotalGP = (currency: Currency): string => {
    const totalCP =
        currency.cp +
        (currency.sp * 10) +
        (currency.ep * 50) +
        (currency.gp * 100) +
        (currency.pp * 1000);

    const gp = Math.floor(totalCP / 100);
    const sp = Math.floor((totalCP % 100) / 10);
    const cp = totalCP % 10;

    const parts: string[] = [];
    if (gp > 0) parts.push(`${gp} gp`);
    if (sp > 0) parts.push(`${sp} sp`);
    if (cp > 0) parts.push(`${cp} cp`);

    return parts.join(' ') || '0 gp';
};

/**
 * CurrencySection - 5-coin grid with totals
 * 
 * In Edit Mode, currency values can be edited inline
 */
export const CurrencySection: React.FC<CurrencySectionProps> = ({
    currency,
    showTotal = true,
    onCurrencyChange
}) => {
    const { isEditMode } = usePlayerCharacterGenerator();

    const coins: { label: string; key: keyof Currency }[] = [
        { label: 'CP', key: 'cp' },
        { label: 'SP', key: 'sp' },
        { label: 'EP', key: 'ep' },
        { label: 'GP', key: 'gp' },
        { label: 'PP', key: 'pp' }
    ];

    // Handler for individual coin value changes
    const handleCoinChange = (key: keyof Currency, value: number) => {
        if (onCurrencyChange) {
            console.log(`✏️ [CurrencySection] ${key.toUpperCase()} changed:`, value);
            onCurrencyChange({
                ...currency,
                [key]: value
            });
        }
    };

    return (
        <div className="phb-section currency-section">
            <div className="section-header">Currency</div>
            <div className="currency-grid" data-editable={onCurrencyChange ? "quick" : undefined}>
                {coins.map(({ label, key }) => (
                    <div key={key} className="currency-item">
                        <div className="coin-label">{label}</div>
                        <div className="coin-value">
                            {onCurrencyChange ? (
                                <EditableText
                                    value={currency[key]}
                                    onChange={(v) => handleCoinChange(key, Number(v))}
                                    type="number"
                                    min={0}
                                    placeholder="0"
                                />
                            ) : (
                                currency[key]
                            )}
                        </div>
                    </div>
                ))}
            </div>
            {showTotal && (
                <div className="currency-total">
                    <span className="total-label">Total Value:</span>
                    <span>{calculateTotalGP(currency)}</span>
                </div>
            )}
        </div>
    );
};

export default CurrencySection;

