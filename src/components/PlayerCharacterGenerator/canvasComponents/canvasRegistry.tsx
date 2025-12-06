/**
 * Canvas Component Registry - Character Sheet Components
 * 
 * Maps component type strings to React components for Canvas rendering.
 * Follows the Canvas package's ComponentRegistryEntry pattern.
 * 
 * These wrapper components bridge the Canvas adapter pattern with the
 * existing section components that take specific props.
 * 
 * @module PlayerCharacterGenerator/canvasComponents/canvasRegistry
 */

import React from 'react';
import type { ComponentRegistryEntry, CanvasComponentProps, ComponentDataSource } from 'dungeonmind-canvas';
import type { Character } from '../types/character.types';
import type { DnD5eCharacter, DnD5eFeature } from '../types/dnd5e/character.types';
import type { AbilityName, AbilityScores } from '../engine/RuleEngine.types';

// Import existing section components
import { AbilityScoresSection } from './sections/AbilityScoresSection';
import { SavesSkillsSection } from './sections/SavesSkillsSection';
import { CombatStatsSection } from './sections/CombatStatsSection';
import { AttacksSection } from './sections/AttacksSection';
import { FeaturesSection } from './sections/FeaturesSection';
import { EquipmentSection } from './sections/EquipmentSection';
import { ProficienciesSection } from './sections/ProficienciesSection';
import { BackgroundSection } from './sections/BackgroundSection';
import { SpellcastingSection } from './sections/SpellcastingSection';

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Extract character data from data sources
 */
function getCharacterData(dataSources: ComponentDataSource[]): Character | null {
    const source = dataSources.find(s => s.type === 'character');
    return source?.payload as Character | null;
}

/**
 * Extract D&D 5e data from character
 */
function getDnD5eData(dataSources: ComponentDataSource[]): DnD5eCharacter | null {
    const character = getCharacterData(dataSources);
    return character?.dnd5eData ?? null;
}

// =============================================================================
// Canvas-Compatible Wrapper Components
// =============================================================================

/**
 * Character Header Wrapper
 */
const CharacterHeaderWrapper: React.FC<CanvasComponentProps> = ({ dataSources }) => {
    const character = getCharacterData(dataSources);
    const dnd5e = getDnD5eData(dataSources);

    if (!character || !dnd5e) {
        return <div className="block character frame">Loading...</div>;
    }

    return (
        <div className="character-name-header wide">
            <h1>{character.name || 'Unnamed Character'}</h1>
            <p className="character-subtitle">
                Level {character.level} {dnd5e.race?.name || ''} {dnd5e.classes?.[0]?.name || ''}
            </p>
        </div>
    );
};

/**
 * Ability Scores Wrapper
 */
const AbilityScoresWrapper: React.FC<CanvasComponentProps> = ({ dataSources }) => {
    const dnd5e = getDnD5eData(dataSources);

    if (!dnd5e?.abilityScores) {
        return <div className="block character frame">No ability scores</div>;
    }

    return <AbilityScoresSection abilityScores={dnd5e.abilityScores} />;
};

/**
 * Saves & Skills Wrapper
 */
const SavesSkillsWrapper: React.FC<CanvasComponentProps> = ({ dataSources }) => {
    const dnd5e = getDnD5eData(dataSources);

    if (!dnd5e) {
        return <div className="block character frame">Loading...</div>;
    }

    return (
        <SavesSkillsSection
            abilityScores={dnd5e.abilityScores}
            proficiencyBonus={dnd5e.derivedStats?.proficiencyBonus ?? 2}
            proficientSaves={(dnd5e.proficiencies?.savingThrows || []) as AbilityName[]}
            proficientSkills={dnd5e.proficiencies?.skills || []}
        />
    );
};

/**
 * Combat Stats Wrapper
 */
const CombatStatsWrapper: React.FC<CanvasComponentProps> = ({ dataSources }) => {
    const dnd5e = getDnD5eData(dataSources);

    if (!dnd5e) {
        return <div className="block character frame">Loading...</div>;
    }

    const hitDice = dnd5e.classes?.length > 0
        ? dnd5e.classes.map(c => `${c.level}d${c.hitDie || 10}`).join(' + ')
        : '1d10';

    return (
        <CombatStatsSection
            armorClass={dnd5e.derivedStats?.armorClass ?? 10}
            initiative={dnd5e.derivedStats?.initiative ?? 0}
            speed={dnd5e.derivedStats?.speed || { walk: 30 }}
            currentHP={dnd5e.derivedStats?.currentHp ?? dnd5e.derivedStats?.maxHp ?? 1}
            maxHP={dnd5e.derivedStats?.maxHp ?? 1}
            tempHP={dnd5e.derivedStats?.tempHp}
            hitDice={hitDice}
            proficiencyBonus={dnd5e.derivedStats?.proficiencyBonus ?? 2}
        />
    );
};

/**
 * Attacks Wrapper
 */
const AttacksWrapper: React.FC<CanvasComponentProps> = ({ dataSources }) => {
    const dnd5e = getDnD5eData(dataSources);

    if (!dnd5e || !dnd5e.weapons?.length) {
        return null; // Don't render if no weapons
    }

    return (
        <AttacksSection
            weapons={dnd5e.weapons}
            abilityScores={dnd5e.abilityScores}
            proficiencyBonus={dnd5e.derivedStats?.proficiencyBonus ?? 2}
            weaponProficiencies={dnd5e.proficiencies?.weapons || []}
        />
    );
};

/**
 * Proficiencies Wrapper
 */
const ProficienciesWrapper: React.FC<CanvasComponentProps> = ({ dataSources }) => {
    const dnd5e = getDnD5eData(dataSources);

    if (!dnd5e) {
        return <div className="block character frame">Loading...</div>;
    }

    return (
        <ProficienciesSection
            languages={dnd5e.proficiencies?.languages || ['Common']}
            armorProficiencies={dnd5e.proficiencies?.armor || []}
            weaponProficiencies={dnd5e.proficiencies?.weapons || []}
            toolProficiencies={dnd5e.proficiencies?.tools || []}
        />
    );
};

/**
 * Features Wrapper
 */
const FeaturesWrapper: React.FC<CanvasComponentProps> = ({ dataSources, regionContent }) => {
    const dnd5e = getDnD5eData(dataSources);

    if (!dnd5e) {
        return <div className="block character frame">Loading...</div>;
    }

    // If we have region content (from Canvas pagination), use those items
    const features = regionContent?.items as DnD5eFeature[] ?? dnd5e.features ?? [];
    const title = regionContent?.isContinuation ? 'Features (Continued)' : 'Features & Traits';

    return <FeaturesSection features={features} title={title} />;
};

/**
 * Equipment Wrapper
 */
const EquipmentWrapper: React.FC<CanvasComponentProps> = ({ dataSources }) => {
    const dnd5e = getDnD5eData(dataSources);

    if (!dnd5e) {
        return <div className="block character frame">Loading...</div>;
    }

    return (
        <EquipmentSection
            equipment={dnd5e.equipment || []}
            weapons={dnd5e.weapons || []}
            armor={dnd5e.armor ? [dnd5e.armor] : undefined}
            gold={dnd5e.currency?.gp}
        />
    );
};

/**
 * Background Wrapper
 */
const BackgroundWrapper: React.FC<CanvasComponentProps> = ({ dataSources }) => {
    const dnd5e = getDnD5eData(dataSources);

    if (!dnd5e) {
        return <div className="block character frame">Loading...</div>;
    }

    return (
        <BackgroundSection
            background={dnd5e.background}
            personalityTraits={dnd5e.personality?.traits}
            ideals={dnd5e.personality?.ideals?.join(' ')}
            bonds={dnd5e.personality?.bonds?.join(' ')}
            flaws={dnd5e.personality?.flaws?.join(' ')}
        />
    );
};

/**
 * Spellcasting Wrapper
 */
const SpellcastingWrapper: React.FC<CanvasComponentProps> = ({ dataSources }) => {
    const dnd5e = getDnD5eData(dataSources);

    if (!dnd5e?.spellcasting) {
        return null; // Don't render if not a caster
    }

    const { spellcasting } = dnd5e;

    return (
        <SpellcastingSection
            spellcasting={spellcasting}
            spellcastingAbility={spellcasting.ability}
            spellSaveDC={spellcasting.spellSaveDC}
            spellAttackBonus={spellcasting.spellAttackBonus}
            spells={spellcasting.spellsKnown}
            cantrips={spellcasting.cantrips}
        />
    );
};

// =============================================================================
// Type Helpers
// =============================================================================

/**
 * Type helper to cast components to the expected registry type
 */
const asCanvasComponent = <T extends React.ComponentType<CanvasComponentProps>>(
    component: T
): React.ComponentType<CanvasComponentProps> => component;

// =============================================================================
// Canvas Component Registry
// =============================================================================

/**
 * Canvas-compatible component registry for character sheet rendering.
 * 
 * Each entry maps a component type to its wrapper component and defaults.
 * The wrapper components extract data from `dataSources` and pass it to
 * the underlying section components.
 */
export const CHARACTER_CANVAS_REGISTRY: Record<string, ComponentRegistryEntry> = {
    'character-header': {
        type: 'character-header',
        displayName: 'Character Header',
        component: asCanvasComponent(CharacterHeaderWrapper),
        defaults: {
            dataRef: { type: 'statblock', path: 'name' },
            layout: { isVisible: true },
        },
    },
    'ability-scores': {
        type: 'ability-scores',
        displayName: 'Ability Scores',
        component: asCanvasComponent(AbilityScoresWrapper),
        defaults: {
            dataRef: { type: 'statblock', path: 'abilityScores' },
            layout: { isVisible: true },
        },
    },
    'saves-skills': {
        type: 'saves-skills',
        displayName: 'Saves & Skills',
        component: asCanvasComponent(SavesSkillsWrapper),
        defaults: {
            dataRef: { type: 'statblock', path: 'proficiencies' },
            layout: { isVisible: true },
        },
    },
    'combat-stats': {
        type: 'combat-stats',
        displayName: 'Combat Stats',
        component: asCanvasComponent(CombatStatsWrapper),
        defaults: {
            dataRef: { type: 'statblock', path: 'derivedStats' },
            layout: { isVisible: true },
        },
    },
    'attacks': {
        type: 'attacks',
        displayName: 'Attacks',
        component: asCanvasComponent(AttacksWrapper),
        defaults: {
            dataRef: { type: 'statblock', path: 'weapons' },
            layout: { isVisible: true },
        },
    },
    'proficiencies': {
        type: 'proficiencies',
        displayName: 'Proficiencies & Languages',
        component: asCanvasComponent(ProficienciesWrapper),
        defaults: {
            dataRef: { type: 'statblock', path: 'proficiencies' },
            layout: { isVisible: true },
        },
    },
    'features': {
        type: 'features',
        displayName: 'Features & Traits',
        component: asCanvasComponent(FeaturesWrapper),
        defaults: {
            dataRef: { type: 'statblock', path: 'features' },
            layout: { isVisible: true },
        },
    },
    'equipment': {
        type: 'equipment',
        displayName: 'Equipment',
        component: asCanvasComponent(EquipmentWrapper),
        defaults: {
            dataRef: { type: 'statblock', path: 'equipment' },
            layout: { isVisible: true },
        },
    },
    'background': {
        type: 'background',
        displayName: 'Background',
        component: asCanvasComponent(BackgroundWrapper),
        defaults: {
            dataRef: { type: 'statblock', path: 'background' },
            layout: { isVisible: true },
        },
    },
    'spellcasting': {
        type: 'spellcasting',
        displayName: 'Spellcasting',
        component: asCanvasComponent(SpellcastingWrapper),
        defaults: {
            dataRef: { type: 'statblock', path: 'spellcasting' },
            layout: { isVisible: true },
        },
    },
};

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Get a component entry by type
 */
export const getCanvasComponentEntry = (type: string): ComponentRegistryEntry | undefined => {
    return CHARACTER_CANVAS_REGISTRY[type];
};

/**
 * Get all registered component types
 */
export const getAllCanvasComponentTypes = (): string[] => {
    return Object.keys(CHARACTER_CANVAS_REGISTRY);
};

/**
 * Check if a component type is registered
 */
export const isCanvasComponentRegistered = (type: string): boolean => {
    return type in CHARACTER_CANVAS_REGISTRY;
};

export default CHARACTER_CANVAS_REGISTRY;

