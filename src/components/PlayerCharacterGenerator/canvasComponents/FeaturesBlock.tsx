/**
 * FeaturesBlock Component
 * 
 * Displays racial and class features in a collapsible list.
 * Groups features by source (race, class, background, feat).
 * 
 * @module PlayerCharacterGenerator/canvasComponents/FeaturesBlock
 */

import React, { useState } from 'react';
import type { DnD5eFeature, DnD5eClassLevel } from '../types/dnd5e/character.types';

export interface FeaturesBlockProps {
    /** Array of features to display */
    features: DnD5eFeature[];
    /** Class levels (for extracting class features) */
    classLevels?: DnD5eClassLevel[];
    /** Whether to show collapsed by default */
    defaultCollapsed?: boolean;
    /** Whether edit mode is enabled (Phase 2+) */
    isEditMode?: boolean;
}

/**
 * Group features by source
 */
function groupFeatures(features: DnD5eFeature[], classLevels?: DnD5eClassLevel[]): Record<string, DnD5eFeature[]> {
    const groups: Record<string, DnD5eFeature[]> = {
        race: [],
        class: [],
        background: [],
        feat: []
    };

    // Add standalone features
    for (const feature of features) {
        const source = feature.source || 'class';
        if (groups[source]) {
            groups[source].push(feature);
        }
    }

    // Add class features from class levels
    if (classLevels) {
        for (const classLevel of classLevels) {
            if (classLevel.features) {
                for (const feature of classLevel.features) {
                    groups['class'].push(feature);
                }
            }
        }
    }

    return groups;
}

/**
 * Format source label
 */
function formatSourceLabel(source: string): string {
    switch (source) {
        case 'race': return 'Racial Traits';
        case 'class': return 'Class Features';
        case 'background': return 'Background Feature';
        case 'feat': return 'Feats';
        default: return 'Features';
    }
}

/**
 * Single feature item component
 */
interface FeatureItemProps {
    feature: DnD5eFeature;
    isCollapsed: boolean;
    onToggle: () => void;
}

const FeatureItem: React.FC<FeatureItemProps> = ({ feature, isCollapsed, onToggle }) => (
    <div
        style={{
            marginBottom: '0.5rem',
            paddingBottom: '0.5rem',
            borderBottom: '1px solid rgba(88, 24, 13, 0.1)'
        }}
        data-testid={`feature-${feature.id}`}
    >
        {/* Feature header */}
        <div
            style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.4rem',
                cursor: 'pointer'
            }}
            onClick={onToggle}
        >
            {/* Expand/collapse indicator */}
            <span
                style={{
                    fontSize: '0.7rem',
                    color: '#58180d',
                    marginTop: '0.15rem',
                    transition: 'transform 0.2s'
                }}
            >
                {isCollapsed ? '▶' : '▼'}
            </span>

            {/* Feature name */}
            <span
                style={{
                    fontFamily: 'BookInsanityRemake, serif',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    color: '#58180d'
                }}
            >
                {feature.name}
            </span>

            {/* Source details */}
            {feature.sourceDetails && (
                <span
                    style={{
                        marginLeft: 'auto',
                        fontSize: '0.7rem',
                        color: 'rgba(43, 29, 15, 0.5)',
                        fontStyle: 'italic'
                    }}
                >
                    {feature.sourceDetails}
                </span>
            )}
        </div>

        {/* Feature description (collapsible) */}
        {!isCollapsed && feature.description && (
            <div
                style={{
                    marginTop: '0.3rem',
                    marginLeft: '1rem',
                    fontSize: '0.85rem',
                    lineHeight: 1.4,
                    color: '#2b1d0f'
                }}
            >
                {feature.description}
            </div>
        )}

        {/* Limited use indicator */}
        {!isCollapsed && feature.limitedUse && (
            <div
                style={{
                    marginTop: '0.25rem',
                    marginLeft: '1rem',
                    fontSize: '0.75rem',
                    color: '#a11d18',
                    fontStyle: 'italic'
                }}
            >
                Uses: {feature.limitedUse.currentUses}/{feature.limitedUse.maxUses}
                ({feature.limitedUse.resetOn} rest)
            </div>
        )}
    </div>
);

/**
 * Feature group component
 */
interface FeatureGroupProps {
    label: string;
    features: DnD5eFeature[];
    defaultCollapsed: boolean;
}

const FeatureGroup: React.FC<FeatureGroupProps> = ({ label, features, defaultCollapsed }) => {
    const [collapsedFeatures, setCollapsedFeatures] = useState<Set<string>>(
        () => defaultCollapsed ? new Set(features.map(f => f.id)) : new Set()
    );

    const toggleFeature = (id: string) => {
        setCollapsedFeatures(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    if (features.length === 0) return null;

    return (
        <div style={{ marginBottom: '1rem' }}>
            {/* Group header */}
            <h4
                style={{
                    fontFamily: 'BookInsanityRemake, serif',
                    color: '#58180d',
                    fontSize: '0.9rem',
                    margin: '0 0 0.4rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.03em'
                }}
            >
                {label}
            </h4>

            {/* Features */}
            {features.map(feature => (
                <FeatureItem
                    key={feature.id}
                    feature={feature}
                    isCollapsed={collapsedFeatures.has(feature.id)}
                    onToggle={() => toggleFeature(feature.id)}
                />
            ))}
        </div>
    );
};

/**
 * FeaturesBlock - All features organized by source
 * 
 * Layout:
 * ┌─────────────────────────────────┐
 * │ Features & Traits               │
 * │                                 │
 * │ CLASS FEATURES                  │
 * │ ▼ Fighting Style: Defense       │
 * │   +1 AC when wearing armor      │
 * │ ▼ Second Wind (1/short rest)    │
 * │   ...                           │
 * │                                 │
 * │ BACKGROUND FEATURE              │
 * │ ▼ Military Rank                 │
 * │   ...                           │
 * └─────────────────────────────────┘
 */
const FeaturesBlock: React.FC<FeaturesBlockProps> = ({
    features,
    classLevels,
    defaultCollapsed = true,
    isEditMode = false
}) => {
    const groupedFeatures = groupFeatures(features, classLevels);

    // Check if there are any features at all
    const hasFeatures = Object.values(groupedFeatures).some(group => group.length > 0);

    if (!hasFeatures) {
        return null;
    }

    return (
        <div
            className="dm-features-block features-block"
            data-testid="features-block"
            data-tutorial="features"
        >
            {/* Section Header */}
            <h3
                style={{
                    fontFamily: 'BookInsanityRemake, serif',
                    color: '#a11d18',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    margin: '0 0 0.6rem',
                    fontSize: '0.95rem',
                    borderBottom: '1px solid rgba(161, 29, 24, 0.3)',
                    paddingBottom: '0.3rem'
                }}
            >
                Features & Traits
            </h3>

            {/* Feature Groups (in order: class, race, background, feat) */}
            {['class', 'race', 'background', 'feat'].map(source => (
                <FeatureGroup
                    key={source}
                    label={formatSourceLabel(source)}
                    features={groupedFeatures[source] || []}
                    defaultCollapsed={defaultCollapsed}
                />
            ))}
        </div>
    );
};

export default FeaturesBlock;

// Export for testing
export { groupFeatures, formatSourceLabel };

