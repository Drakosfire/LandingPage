import type { Meta, StoryObj } from '@storybook/react';
import CardGenerator from './CardGenerator';

const meta = {
    title: 'Components/CardGenerator',
    component: CardGenerator,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
} satisfies Meta<typeof CardGenerator>;

export default meta;
type Story = StoryObj<typeof CardGenerator>;

// Main CardGenerator story
export const Default: Story = {};

// Story showing the complete flow
export const CompleteFlow: Story = {
    render: () => (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <CardGenerator />
        </div>
    ),
};

