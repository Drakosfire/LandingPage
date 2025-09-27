import React, { useMemo } from 'react';
import { Card, Stack, Text } from '@mantine/core';

import { useStatBlockGenerator } from '../StatBlockGeneratorProvider';
import StatblockPage from '../StatblockPage';
import { buildDemoPageDocument, demoTemplate } from '../../../fixtures/statblockTemplates';
import type { ComponentRegistryEntry } from '../../../types/statblockCanvas.types';
import {
    IdentityHeader,
    StatSummary,
    AbilityScoresTable,
    PortraitPanel,
    QuickFacts,
    ActionSection,
} from '../canvasComponents';

const componentRegistry: Record<string, ComponentRegistryEntry> = {
    'identity-header': {
        type: 'identity-header',
        displayName: 'Identity Header',
        component: IdentityHeader,
        defaults: {
            dataRef: { type: 'statblock', path: 'name' },
            layout: { isVisible: true },
        },
    },
    'stat-summary': {
        type: 'stat-summary',
        displayName: 'Stat Summary',
        component: StatSummary,
        defaults: {
            dataRef: { type: 'statblock', path: 'armorClass' },
            layout: { isVisible: true },
        },
    },
    'ability-table': {
        type: 'ability-table',
        displayName: 'Ability Scores',
        component: AbilityScoresTable,
        defaults: {
            dataRef: { type: 'statblock', path: 'abilities' },
            layout: { isVisible: true },
        },
    },
    'portrait-panel': {
        type: 'portrait-panel',
        displayName: 'Portrait',
        component: PortraitPanel,
        defaults: {
            dataRef: { type: 'custom', key: 'portraitUrl' },
            layout: { isVisible: true },
        },
    },
    'quick-facts': {
        type: 'quick-facts',
        displayName: 'Quick Facts',
        component: QuickFacts,
        defaults: {
            dataRef: { type: 'statblock', path: 'savingThrows' },
            layout: { isVisible: true },
        },
    },
    'action-section': {
        type: 'action-section',
        displayName: 'Actions',
        component: ActionSection,
        defaults: {
            dataRef: { type: 'statblock', path: 'actions' },
            layout: { isVisible: true },
        },
    },
};

const StatBlockCanvas: React.FC = () => {
    const { currentStepId, isCanvasPreviewReady } = useStatBlockGenerator();

    const canvasContent = useMemo(() => {
        if (isCanvasPreviewReady) {
            const demoPage = buildDemoPageDocument();
            return (
                <Card shadow="sm" padding="sm" radius="md" withBorder>
                    <StatblockPage page={demoPage} template={demoTemplate} componentRegistry={componentRegistry} />
                </Card>
            );
        }

        return (
            <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Stack gap="sm">
                    <Text fw={500}>Canvas Preview</Text>
                    <Text size="sm" c="dimmed">
                        Canvas content for the {currentStepId ? currentStepId.replace('-', ' ') : 'current'} step will
                        appear here once its tooling is connected. We’ll wire this up alongside the upcoming feature
                        work.
                    </Text>
                </Stack>
            </Card>
        );
    }, [currentStepId, isCanvasPreviewReady]);

    return (
        <div className="statblock-canvas-area">
            {canvasContent}
        </div>
    );
};

export default StatBlockCanvas;


