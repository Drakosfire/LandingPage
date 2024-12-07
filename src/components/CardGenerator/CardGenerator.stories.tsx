import type { Meta, StoryObj } from '@storybook/react';
import CardGenerator from './CardGenerator';
import BorderGallery from './CardTemplateSection/BorderGallery';
import { useState } from 'react';

const meta = {
    title: 'Components/CardGenerator',
    component: CardGenerator,
} satisfies Meta<typeof CardGenerator>;

export default meta;
type Story = StoryObj<typeof CardGenerator>;

// Main CardGenerator story
export const Default: Story = {};

// BorderGallery component story with state inspection
export const BorderGalleryWithStateInspection = {
    render: () => {
        const [selectedBorder, setSelectedBorder] = useState<string>('');

        return (
            <div>
                <BorderGallery
                    onSelect={(border) => {
                        setSelectedBorder(border);
                        console.log('Selected border:', border); // Shows in browser console
                    }}
                />
                <div style={{ marginTop: '20px', padding: '10px', background: '#f0f0f0' }}>
                    <h3>Current State:</h3>
                    <pre>{JSON.stringify({ selectedBorder }, null, 2)}</pre>
                </div>
            </div>
        );
    },
}; 