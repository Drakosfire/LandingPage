/**
 * ProficienciesSection Component
 * 
 * Languages, tool proficiencies, armor/weapon proficiencies.
 * 
 * @module PlayerCharacterGenerator/canvasComponents/sections/ProficienciesSection
 */

import React from 'react';

export interface ProficienciesSectionProps {
    /** Languages known */
    languages: string[];
    /** Armor proficiencies */
    armorProficiencies?: string[];
    /** Weapon proficiencies */
    weaponProficiencies?: string[];
    /** Tool proficiencies */
    toolProficiencies?: string[];
}

/**
 * Format list for display
 */
function formatList(items: string[]): string {
    if (items.length === 0) return 'None';
    return items.join(', ');
}

/**
 * Capitalize first letter
 */
function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * ProficienciesSection - Languages & proficiencies list
 */
export const ProficienciesSection: React.FC<ProficienciesSectionProps> = ({
    languages,
    armorProficiencies = [],
    weaponProficiencies = [],
    toolProficiencies = []
}) => {
    return (
        <div className="block character frame" id="proficiencies">
            <h4>Proficiencies & Languages</h4>

            <div className="proficiencies-section">
                {/* Languages */}
                <div className="proficiency-category">
                    <span className="proficiency-label">Languages: </span>
                    <span className="proficiency-list">
                        {formatList(languages.map(capitalize))}
                    </span>
                </div>

                {/* Armor */}
                {armorProficiencies.length > 0 && (
                    <div className="proficiency-category">
                        <span className="proficiency-label">Armor: </span>
                        <span className="proficiency-list">
                            {formatList(armorProficiencies.map(capitalize))}
                        </span>
                    </div>
                )}

                {/* Weapons */}
                {weaponProficiencies.length > 0 && (
                    <div className="proficiency-category">
                        <span className="proficiency-label">Weapons: </span>
                        <span className="proficiency-list">
                            {formatList(weaponProficiencies.map(capitalize))}
                        </span>
                    </div>
                )}

                {/* Tools */}
                {toolProficiencies.length > 0 && (
                    <div className="proficiency-category">
                        <span className="proficiency-label">Tools: </span>
                        <span className="proficiency-list">
                            {formatList(toolProficiencies.map(capitalize))}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProficienciesSection;

