import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import { AppProvider } from '../../context/AppContext';
import RulesLawyerDemo from '../RulesLawyerDemo';

const renderWithProviders = (ui: React.ReactElement) => {
    return render(
        <MantineProvider>
            <MemoryRouter>
                <AuthProvider>
                    <AppProvider>
                        {ui}
                    </AppProvider>
                </AuthProvider>
            </MemoryRouter>
        </MantineProvider>
    );
};

describe('RulesLawyerDemo', () => {
    beforeEach(() => {
        jest.spyOn(global, 'fetch').mockImplementation((input: RequestInfo) => {
            const url = typeof input === 'string' ? input : input.url;

            if (url.includes('/auth/session')) {
                return Promise.resolve({
                    ok: true,
                    json: async () => ({ is_authenticated: false })
                } as Response);
            }

            if (url.includes('/api/ruleslawyer/status')) {
                return Promise.resolve({
                    ok: true,
                    json: async () => ({ embeddings_loaded: true })
                } as Response);
            }

            return Promise.resolve({
                ok: true,
                json: async () => ({})
            } as Response);
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('renders the demo header and title', async () => {
        renderWithProviders(<RulesLawyerDemo />);

        await waitFor(() => {
            expect(screen.getAllByText('RulesLawyer Demo').length).toBeGreaterThan(0);
        });
    });

    it('renders the verification checklist', async () => {
        renderWithProviders(<RulesLawyerDemo />);

        await waitFor(() => {
            expect(screen.getByText('Feature Verification Checklist')).toBeInTheDocument();
        });
    });
});
