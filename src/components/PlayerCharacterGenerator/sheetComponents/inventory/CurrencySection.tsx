/**
 * CurrencySection Component
 * 
 * Currency grid with 5 coin types and total value.
 * 
 * @module PlayerCharacterGenerator/sheetComponents/inventory
 */

import React from 'react';

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
 */
export const CurrencySection: React.FC<CurrencySectionProps> = ({
    currency,
    showTotal = true
}) => {
    const coins: { label: string; key: keyof Currency }[] = [
        { label: 'CP', key: 'cp' },
        { label: 'SP', key: 'sp' },
        { label: 'EP', key: 'ep' },
        { label: 'GP', key: 'gp' },
        { label: 'PP', key: 'pp' }
    ];

    return (
        <div className="phb-section currency-section">
            <div className="section-header">Currency</div>
            <div className="currency-grid">
                {coins.map(({ label, key }) => (
                    <div key={key} className="currency-item">
                        <div className="coin-label">{label}</div>
                        <div className="coin-value">{currency[key]}</div>
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

