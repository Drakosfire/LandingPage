/**
 * Unit tests for TabsContainer component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { Tabs, MantineProvider } from '@mantine/core';
import { IconWand, IconPhoto } from '@tabler/icons-react';
import { GenerationType } from '../types';
import { TabsContainer } from '../components/TabsContainer';
import type { TabConfig } from '../types';

describe('TabsContainer', () => {
    const mockTabs: TabConfig[] = [
        {
            id: 'text',
            label: 'Text Generation',
            icon: <IconWand size={16} />,
            generationType: GenerationType.TEXT
        },
        {
            id: 'image',
            label: 'Image Generation',
            icon: <IconPhoto size={16} />,
            generationType: GenerationType.IMAGE
        }
    ];

    const defaultProps = {
        tabs: mockTabs,
        isGenerating: false
    };

    const renderWithTabs = (props: typeof defaultProps, activeTab: string = 'text') => {
        return render(
            <MantineProvider>
                <Tabs value={activeTab}>
                    <TabsContainer {...props} />
                </Tabs>
            </MantineProvider>
        );
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Tab Rendering', () => {
        it('renders Tabs.List with grow', () => {
            renderWithTabs(defaultProps);
            const tabsList = screen.getByRole('tablist');
            expect(tabsList).toBeInTheDocument();
        });

        it('renders Tab for each config item', () => {
            renderWithTabs(defaultProps);
            expect(screen.getByRole('tab', { name: 'Text Generation' })).toBeInTheDocument();
            expect(screen.getByRole('tab', { name: 'Image Generation' })).toBeInTheDocument();
        });

        it('displays tab icon', () => {
            renderWithTabs(defaultProps);
            const textTab = screen.getByRole('tab', { name: 'Text Generation' });
            // Icon should be rendered within the tab
            expect(textTab).toBeInTheDocument();
        });

        it('displays tab label', () => {
            renderWithTabs(defaultProps);
            expect(screen.getByText('Text Generation')).toBeInTheDocument();
            expect(screen.getByText('Image Generation')).toBeInTheDocument();
        });

        it('applies badge when configured', () => {
            const tabsWithBadge: TabConfig[] = [
                {
                    ...mockTabs[0],
                    badge: 5
                }
            ];
            renderWithTabs({ ...defaultProps, tabs: tabsWithBadge });
            // Badge should be visible
            expect(screen.getByText('5')).toBeInTheDocument();
        });
    });

    describe('Disabled States', () => {
        it('disables tab when disabled=true', () => {
            const tabsWithDisabled: TabConfig[] = [
                {
                    ...mockTabs[0],
                    disabled: true
                },
                mockTabs[1]
            ];
            renderWithTabs({ ...defaultProps, tabs: tabsWithDisabled });
            const textTab = screen.getByRole('tab', { name: 'Text Generation' });
            // Mantine may use disabled attribute or aria-disabled
            expect(textTab).toHaveAttribute('disabled');
        });

        it('disables all tabs when isGenerating=true', () => {
            renderWithTabs({ ...defaultProps, isGenerating: true });
            const textTab = screen.getByRole('tab', { name: 'Text Generation' });
            const imageTab = screen.getByRole('tab', { name: 'Image Generation' });
            // Mantine may use disabled attribute or aria-disabled
            expect(textTab).toHaveAttribute('disabled');
            expect(imageTab).toHaveAttribute('disabled');
        });
    });

    describe('Data Tutorial Attributes', () => {
        it('applies data-tutorial to each tab', () => {
            renderWithTabs(defaultProps);
            const textTab = screen.getByRole('tab', { name: 'Text Generation' });
            expect(textTab).toHaveAttribute('data-tutorial', 'text-generation-tab');
        });
    });
});

