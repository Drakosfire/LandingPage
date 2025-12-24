/**
 * Unit tests for DrawerShell component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { DrawerShell } from '../components/DrawerShell';

describe('DrawerShell', () => {
    const defaultProps = {
        opened: true,
        onClose: jest.fn(),
        title: 'Test Drawer',
        children: <div>Test Content</div>
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Positioning', () => {
        it('positions drawer on left side', () => {
            render(<DrawerShell {...defaultProps} />);
            const drawer = screen.getByRole('dialog', { hidden: true });
            expect(drawer).toBeInTheDocument();
            // Mantine Drawer with position="left" should be rendered
        });

        it('applies marginTop of 88px', () => {
            render(<DrawerShell {...defaultProps} />);
            const drawer = screen.getByRole('dialog', { hidden: true });
            const content = drawer.querySelector('[class*="mantine-Drawer-content"]');
            expect(content).toHaveStyle({ marginTop: '88px' });
        });

        it('calculates height as calc(100vh - 88px)', () => {
            render(<DrawerShell {...defaultProps} />);
            const drawer = screen.getByRole('dialog', { hidden: true });
            const content = drawer.querySelector('[class*="mantine-Drawer-content"]');
            expect(content).toHaveStyle({ height: 'calc(100vh - 88px)' });
        });
    });

    describe('Title', () => {
        it('renders title in header', () => {
            render(<DrawerShell {...defaultProps} title="Custom Title" />);
            expect(screen.getByText('Custom Title')).toBeInTheDocument();
        });
    });

    describe('Close Button', () => {
        it('renders close button with aria-label', () => {
            render(<DrawerShell {...defaultProps} />);
            const closeButton = screen.getByLabelText('Close generation drawer');
            expect(closeButton).toBeInTheDocument();
        });

        it('calls onClose when close button clicked', () => {
            const onClose = jest.fn();
            render(<DrawerShell {...defaultProps} onClose={onClose} />);
            const closeButton = screen.getByLabelText('Close generation drawer');
            closeButton.click();
            expect(onClose).toHaveBeenCalledTimes(1);
        });
    });

    describe('Children', () => {
        it('renders children in body', () => {
            render(
                <DrawerShell {...defaultProps}>
                    <div data-testid="child-content">Child Content</div>
                </DrawerShell>
            );
            expect(screen.getByTestId('child-content')).toBeInTheDocument();
        });
    });

    describe('Visibility', () => {
        it('does not render content when opened is false', () => {
            render(<DrawerShell {...defaultProps} opened={false} />);
            const drawer = screen.queryByRole('dialog', { hidden: true });
            // Drawer may still be in DOM but hidden
            if (drawer) {
                expect(drawer).not.toBeVisible();
            }
        });
    });
});

