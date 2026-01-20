import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { AuthProvider } from '../../../context/AuthContext';
import { ChatProvider } from '../../../context/ChatContext';
import RulesLawyerView from '../RulesLawyerView';

const renderWithProviders = (ui: React.ReactElement) => {
    return render(
        <MantineProvider>
            <AuthProvider>
                <ChatProvider>
                    {ui}
                </ChatProvider>
            </AuthProvider>
        </MantineProvider>
    );
};

describe('RulesLawyerView', () => {
    beforeEach(() => {
        jest.spyOn(global, 'fetch').mockImplementation((input: RequestInfo) => {
            const url = typeof input === 'string' ? input : input.url;

            if (url.includes('/api/auth/current-user')) {
                return Promise.resolve({
                    ok: false,
                    status: 401
                } as Response);
            }

            if (url.includes('/api/ruleslawyer/status')) {
                return Promise.resolve({
                    ok: true,
                    json: async () => ({
                        embeddingsLoaded: true,
                        activeRulebookId: 'DnD_PHB_55'
                    })
                } as Response);
            }

            if (url.includes('/api/ruleslawyer/rulebooks')) {
                return Promise.resolve({
                    ok: true,
                    json: async () => ({
                        rulebooks: [
                            { id: 'DnD_PHB_55', title: 'Player Handbook', availabilityStatus: 'available' }
                        ]
                    })
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

    it('renders the responsive layout containers', async () => {
        renderWithProviders(<RulesLawyerView />);

        await waitFor(() => {
            expect(screen.getByText('Rulebook')).toBeInTheDocument();
        });

        expect(screen.getByTestId('ruleslawyer-layout')).toBeInTheDocument();
        expect(screen.getByTestId('ruleslawyer-chat-panel')).toBeInTheDocument();
        expect(screen.getByTestId('ruleslawyer-saved-panel')).toBeInTheDocument();
    });

    it('shows the chat input and saved rules heading', async () => {
        renderWithProviders(<RulesLawyerView />);

        await waitFor(() => {
            expect(screen.getByPlaceholderText('Ask a rules question...')).toBeInTheDocument();
        });

        expect(screen.getByText('Saved Rules')).toBeInTheDocument();
    });
});
