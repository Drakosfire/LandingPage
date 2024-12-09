import type { Meta, StoryObj } from '@storybook/react';
import BorderGallery from './BorderGallery';
import { useState } from 'react';

const meta = {
    title: 'Components/CardGenerator/BorderGallery',
    component: BorderGallery,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    decorators: [
        (Story) => (
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof BorderGallery>;

export default meta;
type Story = StoryObj<typeof BorderGallery>;

// Basic usage story
export const Default: Story = {
    render: () => {
        const [selectedBorder, setSelectedBorder] = useState<string>('');
        return (
            <div>
                <BorderGallery
                    onSelect={(borderUrl) => {
                        setSelectedBorder(borderUrl);
                        console.log('Selected border:', borderUrl);
                    }}
                />

                {selectedBorder && (
                    <div style={{ marginTop: '20px', padding: '10px', background: '#f0f0f0' }}>
                        <h3>Selected Border:</h3>
                        <img
                            src={selectedBorder}
                            alt="Selected border"
                            style={{ maxWidth: '200px', marginTop: '10px' }}
                        />
                    </div>
                )}
            </div>
        );
    },
};

// Story showing loading state
export const Loading: Story = {
    render: () => (
        <BorderGallery
            onSelect={() => { }}
            isLoading={true}
        />
    ),
};

// Story showing error state
export const Error: Story = {
    render: () => (
        <BorderGallery
            onSelect={() => { }}
            error="Failed to load border templates"
        />
    ),
};
