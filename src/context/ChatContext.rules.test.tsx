import React from 'react';
import { act, renderHook } from '@testing-library/react';
import { TextDecoder, TextEncoder } from 'util';
import { ChatProvider, useChatContext } from './ChatContext';

jest.mock('./AuthContext', () => ({ useAuth: () => ({ isLoggedIn: false }) }));
jest.mock('../shared/GenerationDrawerEngine/hooks', () => ({ trackGenerationTime: jest.fn() }));

const wrapper = ({ children }: { children: React.ReactNode }) => <ChatProvider>{children}</ChatProvider>;

describe('public rulebook queries', () => {
    beforeEach(() => {
        Object.defineProperty(global, 'TextDecoder', { value: TextDecoder, configurable: true });
    });

    afterEach(() => jest.restoreAllMocks());

    it('selects a book locally and reads server-bound citations from the query', async () => {
        const citation = { page: 43, pdfPage: 46, sourceId: 'shock', section: 'Shock' };
        const body = new TextEncoder().encode(
            `data: "Check the guard's AC."\n\ndata: ${JSON.stringify({
                type: 'progress', stage: 'complete', metadata: { citations: [citation] }
            })}\n\ndata: [DONE]\n\n`
        );
        const read = jest.fn().mockResolvedValueOnce({ value: body, done: false }).mockResolvedValue({ done: true });
        const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue({ ok: true, body: { getReader: () => ({ read }) } } as unknown as Response);
        const { result } = renderHook(useChatContext, { wrapper });
        await act(async () => result.current.loadEmbedding('WWN_Free_Edition'));
        expect(fetchMock).not.toHaveBeenCalled();
        await act(async () => result.current.sendMessage('Will this miss deal Shock?'));
        expect(fetchMock).toHaveBeenCalledTimes(1);
        const [url, options] = fetchMock.mock.calls[0];
        expect(url).toContain('/api/ruleslawyer/query');
        expect(JSON.parse(options?.body as string).rulebookId).toBe('WWN_Free_Edition');
        expect(result.current.chatHistory[result.current.chatHistory.length - 1]).toMatchObject({
            rulebookId: 'WWN_Free_Edition', citations: [citation]
        });
    });

    it('discards a stale query when switching editions', async () => {
        let resolveResponse!: (response: Response) => void;
        const fetchMock = jest.spyOn(global, 'fetch').mockImplementation(
            () => new Promise(resolve => { resolveResponse = resolve; })
        );
        const { result } = renderHook(useChatContext, { wrapper });
        await act(async () => result.current.loadEmbedding('DnD_PHB_55'));
        let query!: Promise<void>;
        act(() => { query = result.current.sendMessage('How does advantage work?'); });
        await act(async () => result.current.loadEmbedding('WWN_Free_Edition'));
        expect(fetchMock.mock.calls[0][1]?.signal?.aborted).toBe(true);
        await act(async () => {
            resolveResponse({ ok: true } as Response);
            await query;
        });
        expect(result.current.chatHistory).toEqual([]);
        expect(result.current.currentEmbedding).toBe('WWN_Free_Edition');
    });
});
