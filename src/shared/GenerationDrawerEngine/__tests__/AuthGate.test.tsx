/**
 * Unit tests for AuthGate component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { AuthGate } from '../components/AuthGate';
import { renderWithEngine } from '../test-utils/renderWithEngine';

const renderWithProvider = (ui: React.ReactElement) => {
    return render(<MantineProvider>{ui}</MantineProvider>);
};

// Mock useAuth
jest.mock('../../../context/AuthContext', () => ({
    useAuth: jest.fn()
}));

import { useAuth } from '../../../context/AuthContext';

describe('AuthGate', () => {
    const mockLogin = jest.fn();
    const mockChildren = <div data-testid="children">Protected Content</div>;

    beforeEach(() => {
        jest.clearAllMocks();
        (useAuth as jest.Mock).mockReturnValue({
            isLoggedIn: false,
            login: mockLogin
        });
    });

    describe('Unauthenticated State', () => {
        it('shows login prompt when not authenticated', () => {
            renderWithProvider(
                <AuthGate>{mockChildren}</AuthGate>
            );
            expect(screen.getByText('Login Required')).toBeInTheDocument();
            expect(screen.queryByTestId('children')).not.toBeInTheDocument();
        });

        it('renders login button', () => {
            renderWithProvider(
                <AuthGate>{mockChildren}</AuthGate>
            );
            const loginButton = screen.getByRole('button', { name: /login/i });
            expect(loginButton).toBeInTheDocument();
        });

        it('calls login when login button is clicked', () => {
            renderWithProvider(
                <AuthGate>{mockChildren}</AuthGate>
            );
            const loginButton = screen.getByRole('button', { name: /login/i });
            fireEvent.click(loginButton);
            expect(mockLogin).toHaveBeenCalledTimes(1);
        });

        it('shows friendly message about why login is needed', () => {
            renderWithProvider(
                <AuthGate>{mockChildren}</AuthGate>
            );
            expect(screen.getByText(/upload.*images/i)).toBeInTheDocument();
        });
    });

    describe('Authenticated State', () => {
        beforeEach(() => {
            (useAuth as jest.Mock).mockReturnValue({
                isLoggedIn: true,
                login: mockLogin
            });
        });

        it('renders children when authenticated', () => {
            renderWithProvider(
                <AuthGate>{mockChildren}</AuthGate>
            );
            expect(screen.getByTestId('children')).toBeInTheDocument();
            expect(screen.queryByText(/login.*required/i)).not.toBeInTheDocument();
        });
    });

    describe('Tutorial Mode', () => {
        it('bypasses auth check when isTutorialMode is true', () => {
            (useAuth as jest.Mock).mockReturnValue({
                isLoggedIn: false,
                login: mockLogin
            });

            renderWithProvider(
                <AuthGate isTutorialMode={true}>{mockChildren}</AuthGate>
            );
            expect(screen.getByTestId('children')).toBeInTheDocument();
            expect(screen.queryByText(/login.*required/i)).not.toBeInTheDocument();
        });
    });
});

