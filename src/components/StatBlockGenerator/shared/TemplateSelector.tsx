/**
 * Template Selector Component
 * 
 * Allows users to switch between different statblock layout templates.
 */

import React from 'react';
import { Group, Select, Text, Stack, Tooltip } from '@mantine/core';
import { IconLayout, IconLayoutGrid, IconLayoutList, IconSparkles } from '@tabler/icons-react';
import { getTemplateMetadata } from '../../../fixtures/templates';
import type { TemplateMetadata } from '../../../fixtures/templates';

interface TemplateSelectorProps {
    currentTemplateId: string;
    onTemplateChange: (templateId: string) => void;
}

const CATEGORY_ICONS: Record<TemplateMetadata['category'], React.ReactNode> = {
    'official-style': <IconLayout size={16} />,
    'utility': <IconLayoutList size={16} />,
    'showcase': <IconSparkles size={16} />,
    'custom': <IconLayoutGrid size={16} />,
};

const CATEGORY_LABELS: Record<TemplateMetadata['category'], string> = {
    'official-style': 'Official Style',
    'utility': 'Utility',
    'showcase': 'Showcase',
    'custom': 'Custom',
};

const TemplateSelector: React.FC<TemplateSelectorProps> = ({ currentTemplateId, onTemplateChange }) => {
    const templates = getTemplateMetadata();

    // Group templates by category for Mantine Select
    const groupedTemplates = templates.reduce((acc, template) => {
        const category = CATEGORY_LABELS[template.category];
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push({
            value: template.id,
            label: template.name,
        });
        return acc;
    }, {} as Record<string, Array<{ value: string; label: string }>>);

    // Convert to Mantine Select format
    const selectData = Object.entries(groupedTemplates).map(([group, items]) => ({
        group,
        items,
    }));

    const currentTemplate = templates.find((t) => t.id === currentTemplateId);

    return (
        <Stack gap="xs">
            <Group gap="xs">
                <Text size="sm" fw={500}>
                    Layout Template
                </Text>
                {currentTemplate && (
                    <Tooltip label={CATEGORY_LABELS[currentTemplate.category]}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            {CATEGORY_ICONS[currentTemplate.category]}
                        </div>
                    </Tooltip>
                )}
            </Group>
            <Select
                value={currentTemplateId}
                onChange={(value) => value && onTemplateChange(value)}
                data={selectData}
                placeholder="Select a template"
                description={currentTemplate?.description}
                size="sm"
            />
        </Stack>
    );
};

export default TemplateSelector;

