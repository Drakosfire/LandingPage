import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { formatRuleCitations, groupRuleCitations, RuleCitation } from '../RuleCitations';

jest.mock('react-markdown', () => ({ __esModule: true, default: ({ children }: { children: string }) => <div>{children}</div> }));
jest.mock('remark-gfm', () => ({ __esModule: true, default: () => null }));

it('uses a single inline marker per page while preserving its distinct passages', () => {
    const sources = groupRuleCitations([
        { page: 16, sourceId: 'physician' },
        { page: 80, sourceId: 'healers-a', section: 'Healers' },
        { page: '80', sourceId: 'healers-b', section: 'Healers' },
        { page: 80, sourceId: 'healers-a', section: 'Healers' },
    ]);
    expect(sources.get('80')).toHaveLength(2);
    expect(formatRuleCitations(
        'Physicians. [p. 16] Healers. [p. 80][p. 80] Training. [p. 80]\n\nCitations: p. 16, p. 80',
        sources
    )).toBe('Physicians.  [source](#rules-source-16) Healers.  [source](#rules-source-80) Training. ');
});

it('preserves legacy references when there is no bound evidence', () => {
    const content = 'Answer [p. 16]\n\nCitations: p. 16';
    expect(formatRuleCitations(content, groupRuleCitations())).toBe(content);
});

it('keeps sources reachable when the Writer omits an inline marker', () => {
    const sources = groupRuleCitations([{ page: 80, sourceId: 'healers' }]);
    expect(formatRuleCitations('Healers.', sources)).toBe('Healers.\n\n[source](#rules-source-80)');
});

it('opens on focus, loads every distinct full passage as text, and closes on Escape', async () => {
    const link = '/api/ruleslawyer/evidence/WWN_Free_Edition/' + 'a'.repeat(64);
    const secondLink = '/api/ruleslawyer/evidence/WWN_Free_Edition/' + 'b'.repeat(64);
    const fetchPassage = jest.spyOn(global, 'fetch').mockImplementation(async input => ({
        ok: true,
        text: async () => String(input).endsWith(link)
            ? '<main><pre>First line.\nThe complete first treatment passage. &lt;b&gt;Literal text.&lt;/b&gt;</pre></main>'
            : '<main><pre>| Club | 1d4 |\n| Dagger | 1d4 |</pre></main>',
    } as Response));
    const savedObserver = global.ResizeObserver;
    global.ResizeObserver = class {
        observe() {}
        unobserve() {}
        disconnect() {}
    };
    try {
        render(<MantineProvider env="test">
            <RuleCitation number={2} page="80" sources={[
                { page: 80, pdfPage: 83, section: 'Healers', link },
                { page: 80, pdfPage: 83, section: 'Healer Benefits', link: secondLink },
            ]} />
        </MantineProvider>);
        const marker = screen.getByRole('button', { name: 'Source 2, printed page 80' });
        expect(fetchPassage).not.toHaveBeenCalled();
        fireEvent.focus(marker);
        expect(await screen.findByText('Printed page 80 · PDF page 83')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Healers ↗' })).toHaveAttribute('href', expect.stringContaining(link));
        expect(await screen.findByText(/The complete first treatment passage/)).toHaveTextContent('<b>Literal text.</b>');
        expect(await screen.findByRole('table', { name: 'Source table continuation' })).toBeInTheDocument();
        expect(screen.getByRole('cell', { name: 'Dagger' })).toBeInTheDocument();
        expect(fetchPassage).toHaveBeenCalledTimes(2);
        fireEvent.keyDown(marker, { key: 'Escape' });
        expect(marker).toHaveAttribute('aria-expanded', 'false');
    } finally {
        global.ResizeObserver = savedObserver;
        fetchPassage.mockRestore();
    }
});

it('shows a useful fallback for empty legacy metadata', async () => {
    render(<MantineProvider env="test">
        <RuleCitation number={3} page="215" sources={[{ page: 215, section: '[]' }]} />
    </MantineProvider>);
    fireEvent.focus(screen.getByRole('button', { name: 'Source 3, printed page 215' }));
    expect(await screen.findByText('No source preview is available for this citation.')).toBeInTheDocument();
    expect(screen.queryByText('[]')).not.toBeInTheDocument();
});
