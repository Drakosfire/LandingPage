import type { Meta, StoryObj } from '@storybook/react';
import SeedImageGallery from './SeedImageGallery';
import { useState } from 'react';

const meta = {
    title: 'Components/CardGenerator/SeedImageGallery',
    component: SeedImageGallery,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
} satisfies Meta<typeof SeedImageGallery>;

export default meta;
type Story = StoryObj<typeof SeedImageGallery>;

// Basic story with state inspection
export const WithStateInspection = {
    render: () => {
        const [selectedImage, setSelectedImage] = useState<string>('');

        return (
            <div>
                <SeedImageGallery
                    onSelect={(imageUrl) => {
                        setSelectedImage(imageUrl);
                        console.log('Selected image:', imageUrl);
                    }}
                />
                <div style={{ marginTop: '20px', padding: '10px', background: '#f0f0f0' }}>
                    <h3>Current State:</h3>
                    <pre>{JSON.stringify({ selectedImage }, null, 2)}</pre>
                    {selectedImage && (
                        <div style={{ marginTop: '10px' }}>
                            <h4>Preview:</h4>
                            <img
                                src={selectedImage}
                                alt="Selected"
                                style={{ maxWidth: '200px', marginTop: '10px' }}
                            />
                        </div>
                    )}
                </div>
            </div>
        );
    },
};

// Story showing drag and drop state
export const DragAndDropState = {
    render: () => {
        return (
            <div style={{ width: '400px' }}>
                <SeedImageGallery onSelect={(imageUrl) => console.log('Selected:', imageUrl)} />
            </div>
        );
    },
};