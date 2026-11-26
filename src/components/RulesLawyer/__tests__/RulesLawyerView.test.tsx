import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { AuthProvider } from '../../../context/AuthContext';
import { ChatProvider } from '../../../context/ChatContext';
import RulesLawyerView from '../RulesLawyerView';

jest.mock('react-markdown', () => ({ __esModule: true, default: () => null }));
jest.mock('remark-gfm', () => ({ __esModule: true, default: () => null }));

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
        Object.defineProperty(global, 'ResizeObserver', {
            value: class { observe() {} unobserve() {} disconnect() {} },
            configurable: true,
        });
        Object.defineProperty(HTMLElement.prototype, 'scrollTo', { value: jest.fn(), configurable: true });
        jest.spyOn(global, 'fetch').mockImplementation((input) => {
            const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;

            if (url.includes('/api/auth/current-user')) {
                return Promise.resolve({
                    ok: false,
                    status: 401
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
        renderWithProviders(
            <RulesLawyerView
                savedRulesOpen={false}
                onCloseSavedRules={jest.fn()}
            />
        );

        await waitFor(() => {
            expect(screen.getByText('Rulebook')).toBeInTheDocument();
        });

        expect(screen.getByTestId('ruleslawyer-layout')).toBeInTheDocument();
        expect(screen.getByTestId('ruleslawyer-chat-panel')).toBeInTheDocument();
    });

    it('shows the chat input', async () => {
        renderWithProviders(
            <RulesLawyerView
                savedRulesOpen={false}
                onCloseSavedRules={jest.fn()}
            />
        );

        await waitFor(() => {
            expect(screen.getByPlaceholderText('Ask a rules question...')).toBeInTheDocument();
            expect((global.fetch as jest.Mock).mock.calls.some(([url]) => String(url).includes('/loadembeddings'))).toBe(false);
        });
    });
});
