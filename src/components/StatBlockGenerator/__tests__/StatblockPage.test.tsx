import React from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';

import StatblockPage from '../StatblockPage';
import type { StatblockPageDocument, TemplateConfig, ComponentRegistryEntry } from '../../../types/statblockCanvas.types';

const mockComponent: React.FC = () => <div data-testid="mock-component" />;

const componentRegistry: Record<string, ComponentRegistryEntry> = {
    'trait-list': {
        type: 'trait-list',
        displayName: 'Traits',
        defaults: {
            dataRef: { type: 'statblock', path: 'specialAbilities' },
            layout: { isVisible: true },
        },
        component: mockComponent,
    },
};

const template: TemplateConfig = {
    id: 'tmpl',
    name: 'Test Template',
    defaultMode: 'locked',
    defaultPageVariables: {
        dimensions: { width: 210, height: 297, unit: 'mm' },
        background: { type: 'parchment' },
        columns: { enabled: true, columnCount: 2, gutter: 12, unit: 'mm' },
        pagination: { pageCount: 1, columnCount: 2 },
        snap: { enabled: true, gridSize: 5, gridUnit: 'mm', snapToSlots: true, snapToEdges: true },
    },
    slots: [],
    defaultComponents: [],
    allowedComponents: ['trait-list'],
};

const createPage = (overrides: Partial<StatblockPageDocument> = {}): StatblockPageDocument => ({
    id: 'page-1',
    projectId: 'proj',
    ownerId: 'owner',
    templateId: 'tmpl',
    pageVariables: {
        mode: 'locked',
        templateId: 'tmpl',
        dimensions: { width: 210, height: 297, unit: 'mm' },
        background: { type: 'parchment' },
        columns: { enabled: true, columnCount: 2, gutter: 12, unit: 'mm' },
        pagination: { pageCount: 1, columnCount: 2 },
        snap: { enabled: true, gridSize: 5, gridUnit: 'mm', snapToSlots: true, snapToEdges: true },
    },
    componentInstances: [
        {
            id: 'traits-1',
            type: 'trait-list',
            dataRef: { type: 'statblock', path: 'specialAbilities' },
            layout: { isVisible: true },
        },
        {
            id: 'traits-2',
            type: 'trait-list',
            dataRef: { type: 'statblock', path: 'bonusActions' },
            layout: { isVisible: true },
        },
    ],
    dataSources: [
        {
            id: 'statblock',
            type: 'statblock',
            updatedAt: new Date().toISOString(),
            payload: {
                name: 'Test Creature',
                actions: [],
                bonusActions: [],
                reactions: [],
                specialAbilities: Array.from({ length: 10 }, (_, index) => ({
                    name: `Trait ${index + 1}`,
                    desc: 'Some details...',
                })),
                abilityScores: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
                speed: { walk: 30 },
                senses: { passivePerception: 10 },
                languages: 'Common',
                alignment: 'neutral',
                size: 'Medium',
                type: 'humanoid',
                armorClass: 12,
                hitPoints: 30,
                hitDice: '5d8',
                challengeRating: 1,
                xp: 200,
                description: '',
                sdPrompt: '',
                actions: [],
                legendaryActions: undefined,
                lairActions: undefined,
            },
        },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
});

describe('StatblockPage', () => {
    it('renders components and updates pagination markers after layout', async () => {
        render(<StatblockPage page={createPage()} template={template} componentRegistry={componentRegistry} />);

        await waitFor(() => {
            expect(screen.getAllByTestId('mock-component').length).toBeGreaterThan(0);
        });

        const paginationMarkers = screen.queryAllByTestId(/pagination-marker-/);
        expect(paginationMarkers.length).toBeGreaterThanOrEqual(1);
    });

    it('expands to multiple pages when measurements trigger overflow', async () => {
        jest.useFakeTimers();
        const multiPagePage = createPage({
            componentInstances: Array.from({ length: 6 }, (_, index) => ({
                id: `traits-${index}`,
                type: 'trait-list',
                dataRef: { type: 'statblock', path: 'specialAbilities' },
                layout: { isVisible: true },
            })),
            dataSources: [
                {
                    id: 'statblock',
                    type: 'statblock',
                    updatedAt: new Date().toISOString(),
                    payload: {
                        name: 'Overflow Creature',
                        actions: [],
                        bonusActions: [],
                        reactions: [],
                        specialAbilities: Array.from({ length: 120 }, (_, index) => ({
                            name: `Trait ${index + 1}`,
                            desc: 'Detailed description that ensures large height.'.repeat(4),
                        })),
                        abilityScores: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
                        speed: { walk: 30 },
                        senses: { passivePerception: 12 },
                        languages: 'Common',
                        alignment: 'neutral',
                        size: 'Medium',
                        type: 'humanoid',
                        armorClass: 15,
                        hitPoints: 90,
                        hitDice: '10d8',
                        challengeRating: 5,
                        xp: 1600,
                        description: '',
                        sdPrompt: '',
                        legendaryActions: undefined,
                        lairActions: undefined,
                    },
                },
            ],
        });

        render(<StatblockPage page={multiPagePage} template={template} componentRegistry={componentRegistry} />);

        await waitFor(() => expect(screen.getAllByTestId('mock-component').length).toBeGreaterThan(0));

        await waitFor(() => {
            const markers = screen.getAllByTestId(/pagination-marker-/);
            expect(markers.length).toBeGreaterThan(1);
        });

        const page2Marker = screen.getByTestId('pagination-marker-2');
        expect(page2Marker).toBeInTheDocument();
        jest.useRealTimers();
    });
});

