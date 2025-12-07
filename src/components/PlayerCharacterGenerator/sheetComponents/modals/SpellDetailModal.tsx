/**
 * SpellDetailModal Component
 * 
 * Rich detail modal for spells showing full casting information,
 * components, description, and damage/healing dice.
 * 
 * @module PlayerCharacterGenerator/sheetComponents/modals
 */

import React from 'react';
import { Modal } from '@mantine/core';
import {
    IconClock,
    IconRuler2,
    IconAlphabetLatin,
    IconHourglass,
    IconFlame,
    IconHeart,
    IconBook
} from '@tabler/icons-react';
import type { SpellSchool } from '../../types/dnd5e/spell.types';
import type { DamageType } from '../../types/system.types';

export interface SpellDetailModalProps {
    isOpen: boolean;
    onClose: () => void;

    // Core spell data
    name: string;
    level: number;
    school: SpellSchool;
    castingTime: string;
    range: string;
    components: {
        verbal: boolean;
        somatic: boolean;
        material: boolean;
        materialDescription?: string;
    };
    duration: string;
    description: string;

    // Optional properties
    higherLevels?: string;
    ritual?: boolean;
    concentration?: boolean;
    damage?: { type: DamageType; dice: string };
    healing?: { dice: string };
    imageUrl?: string;
    source?: string;
}

/**
 * Format spell level for display
 */
const formatLevel = (level: number): string => {
    if (level === 0) return 'Cantrip';
    const suffixes = ['st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th', 'th'];
    return `${level}${suffixes[level - 1]} Level`;
};

/**
 * Format school name for display
 */
const formatSchool = (school: SpellSchool): string => {
    return school.charAt(0).toUpperCase() + school.slice(1);
};

/**
 * Format components for display
 */
const formatComponents = (components: SpellDetailModalProps['components']): string => {
    const parts: string[] = [];
    if (components.verbal) parts.push('V');
    if (components.somatic) parts.push('S');
    if (components.material) {
        parts.push(components.materialDescription ? `M (${components.materialDescription})` : 'M');
    }
    return parts.join(', ') || '—';
};

/**
 * SpellDetailModal - Rich spell detail modal
 */
export const SpellDetailModal: React.FC<SpellDetailModalProps> = ({
    isOpen,
    onClose,
    name,
    level,
    school,
    castingTime,
    range,
    components,
    duration,
    description,
    higherLevels,
    ritual,
    concentration,
    damage,
    healing,
    imageUrl,
    source
}) => {
    return (
        <Modal
            opened={isOpen}
            onClose={onClose}
            title={null}
            size="lg"
            centered
            className="detail-modal spell-detail-modal"
            classNames={{
                body: 'detail-modal-body'
            }}
        >
            {/* Header with image and title */}
            <div className="detail-modal-header">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={name}
                        className="detail-modal-image"
                    />
                ) : (
                    <div className="detail-modal-image-placeholder">
                        <IconFlame size={40} />
                    </div>
                )}
                <div className="detail-modal-title-block">
                    <h2 className="detail-modal-title">{name}</h2>
                    <p className="detail-modal-subtitle">
                        {formatSchool(school)}
                    </p>
                    <div className="detail-modal-badges">
                        <span className="spell-badge badge-level">
                            {formatLevel(level)}
                        </span>
                        {concentration && (
                            <span className="spell-badge badge-concentration" title="Concentration">
                                C
                            </span>
                        )}
                        {ritual && (
                            <span className="spell-badge badge-ritual" title="Ritual">
                                R
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Casting info stats */}
            <div className="detail-modal-stats">
                <span className="detail-modal-stat-label">
                    <IconClock size={14} /> Casting Time
                </span>
                <span className="detail-modal-stat-value">
                    {castingTime}
                </span>

                <span className="detail-modal-stat-label">
                    <IconRuler2 size={14} /> Range
                </span>
                <span className="detail-modal-stat-value">
                    {range}
                </span>

                <span className="detail-modal-stat-label">
                    <IconAlphabetLatin size={14} /> Components
                </span>
                <span className="detail-modal-stat-value">
                    {formatComponents(components)}
                </span>

                <span className="detail-modal-stat-label">
                    <IconHourglass size={14} /> Duration
                </span>
                <span className="detail-modal-stat-value">
                    {duration}
                </span>
            </div>

            {/* Description */}
            <div className="detail-modal-description">
                {description}
            </div>

            {/* Damage dice box */}
            {damage && (
                <div className="detail-modal-dice-box damage">
                    <div className="detail-modal-dice-label">
                        <IconFlame size={14} /> Damage
                    </div>
                    <div className="detail-modal-dice-value">
                        {damage.dice} {damage.type}
                    </div>
                </div>
            )}

            {/* Healing dice box */}
            {healing && (
                <div className="detail-modal-dice-box healing">
                    <div className="detail-modal-dice-label">
                        <IconHeart size={14} /> Healing
                    </div>
                    <div className="detail-modal-dice-value">
                        {healing.dice}
                    </div>
                </div>
            )}

            {/* Higher Levels section */}
            {higherLevels && (
                <div className="detail-modal-section">
                    <div className="detail-modal-section-title">
                        📈 At Higher Levels
                    </div>
                    <div className="detail-modal-section-content">
                        {higherLevels}
                    </div>
                </div>
            )}

            {/* Footer with source */}
            <div className="detail-modal-footer">
                <span>
                    <IconBook size={14} /> Source: {source || 'SRD'}
                </span>
            </div>
        </Modal>
    );
};

export default SpellDetailModal;

