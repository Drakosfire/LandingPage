import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { AuthProvider } from '../../context/AuthContext';
import { UnifiedHeader } from '../UnifiedHeader';

jest.mock('../../context/AppContext', () => ({
    useAppContext: () => ({ currentApp: null })
}));

jest.mock('../NavigationDrawer', () => ({
    NavigationDrawer: () => null
}));

jest.mock('../AppToolbox', () => ({
    AppToolbox: () => null
}));

describe('UnifiedHeader logout', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('posts with credentials, keeps auth on failure, and lets the user retry', async () => {
        let logoutAttempts = 0;
        const fetchMock = jest.spyOn(global, 'fetch').mockImplementation(
            (input: RequestInfo | URL, init?: RequestInit) => {
                const url = typeof input === 'string' ? input : input.toString();
                if (url.includes('/api/auth/current-user')) {
                    return Promise.resolve({
                        ok: true,
                        status: 200,
                        json: async () => ({
                            sub: 'logout-test-user',
                            email: 'test@example.test',
                            name: 'Test User'
                        })
                    } as Response);
                }
                if (url.includes('/api/auth/logout')) {
                    logoutAttempts += 1;
                    return Promise.resolve({
                        ok: logoutAttempts > 1,
                        status: logoutAttempts > 1 ? 204 : 403
                    } as Response);
                }
                return Promise.reject(new Error(`Unexpected request: ${url}`));
            }
        );

        render(
            <MantineProvider>
                <AuthProvider>
                    <UnifiedHeader sticky={false} elevated={false} />
                </AuthProvider>
            </MantineProvider>
        );

        const logoutControl = await screen.findByLabelText('Logout');
        fireEvent.click(logoutControl);

        expect(await screen.findByRole('alert')).toHaveTextContent(
            'Logout could not be confirmed. Select Logout to try again.'
        );
        expect(screen.getByLabelText('Logout')).toBeInTheDocument();
        expect(fetchMock).toHaveBeenCalledWith(
            expect.stringContaining('/api/auth/logout'),
            expect.objectContaining({ method: 'POST', credentials: 'include' })
        );

        fireEvent.click(screen.getByLabelText('Logout'));
        await waitFor(() => {
            expect(screen.getByLabelText('Login')).toBeInTheDocument();
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });
        expect(logoutAttempts).toBe(2);
    });
});
