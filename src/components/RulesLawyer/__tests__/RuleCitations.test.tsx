import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { formatRuleCitations, groupRuleCitations, RuleCitation } from '../RuleCitations';

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

it('opens the preview on focus and lets Escape dismiss it', async () => {
    const link = '/api/ruleslawyer/evidence/WWN_Free_Edition/' + 'a'.repeat(64);
    const savedObserver = global.ResizeObserver;
    global.ResizeObserver = class {
        observe() {}
        unobserve() {}
        disconnect() {}
    };
    try {
        render(<MantineProvider env="test">
            <RuleCitation number={2} page="80" sources={[{ page: 80, pdfPage: 83, section: 'Healers', link }]} />
        </MantineProvider>);
        const marker = screen.getByRole('button', { name: 'Source 2, printed page 80' });
        fireEvent.focus(marker);
        expect(await screen.findByText('Printed page 80 · PDF page 83')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Healers ↗' })).toHaveAttribute('href', expect.stringContaining(link));
        fireEvent.keyDown(marker, { key: 'Escape' });
        expect(marker).toHaveAttribute('aria-expanded', 'false');
    } finally {
        global.ResizeObserver = savedObserver;
    }
});
