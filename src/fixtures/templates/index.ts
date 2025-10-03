/**
 * Template Library
 * 
 * Central registry of all available statblock templates.
 */

import type { TemplateConfig } from '../../types/statblockCanvas.types';
import { demoTemplate } from '../statblockTemplates';
import { classicTemplate } from './classicTemplate';
import { compactTemplate } from './compactTemplate';
import { showcaseTemplate } from './showcaseTemplate';

export interface TemplateMetadata {
    id: string;
    name: string;
    description: string;
    category: 'official-style' | 'utility' | 'showcase' | 'custom';
    preview?: string;
}

/**
 * All available templates
 */
export const TEMPLATE_REGISTRY: Record<string, TemplateConfig> = {
    [demoTemplate.id]: demoTemplate,
    [classicTemplate.id]: classicTemplate,
    [compactTemplate.id]: compactTemplate,
    [showcaseTemplate.id]: showcaseTemplate,
};

/**
 * Get template by ID
 */
export function getTemplate(id: string): TemplateConfig | undefined {
    return TEMPLATE_REGISTRY[id];
}

/**
 * Get all template IDs
 */
export function getAllTemplateIds(): string[] {
    return Object.keys(TEMPLATE_REGISTRY);
}

/**
 * Get template metadata for selection UI
 */
export function getTemplateMetadata(): TemplateMetadata[] {
    return Object.values(TEMPLATE_REGISTRY).map((template) => ({
        id: template.id,
        name: template.name,
        description: template.description ?? '',
        category: (template.metadata?.category as TemplateMetadata['category']) ?? 'custom',
    }));
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: TemplateMetadata['category']): TemplateConfig[] {
    return Object.values(TEMPLATE_REGISTRY).filter(
        (template) => template.metadata?.category === category
    );
}

/**
 * Default template (used when no preference set)
 */
export const DEFAULT_TEMPLATE = classicTemplate;

// Re-export individual templates
export { demoTemplate, classicTemplate, compactTemplate, showcaseTemplate };

