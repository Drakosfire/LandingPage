import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Modal, Stack, Text } from '@mantine/core';
import { DUNGEONMIND_API_URL } from '../../config';
import type { RuleEvidenceCitation } from '../../context/ChatContext';

export function groupRuleCitations(citations: RuleEvidenceCitation[] = []) {
    const groups = new Map<string, RuleEvidenceCitation[]>();
    for (const citation of citations) {
        const page = String(citation.page);
        const sources = groups.get(page) ?? [];
        const identity = citation.sourceId || citation.link || citation.section;
        if (!sources.some(source => (source.sourceId || source.link || source.section) === identity)) {
            sources.push(citation);
        }
        groups.set(page, sources);
    }
    return groups;
}

export function formatRuleCitations(content: string, pages: Map<string, RuleEvidenceCitation[]>) {
    if (!pages.size) return content;
    const shown = new Set<string>();
    const answer = content.replace(/\n+\s*Citations:\s*(?:p\.\s*\d+\s*,?\s*)+$/i, '')
        .replace(/\[p\.\s*(\d+)\]/g, (marker, page: string) => {
            if (!pages.has(page)) return marker;
            if (shown.has(page)) return '';
            shown.add(page);
            return ` [source](#rules-source-${page})`;
        });
    const remaining = Array.from(pages.keys()).filter(page => !shown.has(page));
    return remaining.length ? `${answer}

${remaining.map(page => `[source](#rules-source-${page})`).join(' ')}` : answer;
}

function citationTitle(section?: string): string {
    if (section?.trim().startsWith('[')) {
        try {
            const parts: unknown = JSON.parse(section);
            if (Array.isArray(parts)) {
                return parts.filter(part => typeof part === 'string' && part.trim()).join(' / ') || 'Source passage';
            }
        } catch {
            return 'Source passage';
        }
    }
    return section?.trim() || 'Source passage';
}

function sourceHtmlTable(markup: string) {
    const template = document.createElement('template');
    template.innerHTML = markup;
    const table = template.content.querySelector('table');
    if (!table?.rows.length) return markup;
    return <div className="ruleslawyer-citation-preview__table" tabIndex={0} aria-label="Scrollable source table">
        <table>
            {table.caption && <caption>{table.caption.textContent}</caption>}
            <tbody>
                {Array.from(table.rows).map((row, index) => <tr key={index}>
                    {Array.from(row.cells).map((cell, column) => {
                        const Cell = cell.tagName === 'TH' ? 'th' : 'td';
                        return <Cell key={column} colSpan={cell.colSpan} rowSpan={cell.rowSpan}>{cell.textContent}</Cell>;
                    })}
                </tr>)}
            </tbody>
        </table>
    </div>;
}

function passageText(text: string) {
    const parts = text.split(/(<table\b[^>]*>[\s\S]*?<\/table\s*>)/gi);
    if (parts.length > 1) {
        return parts.map((part, index) => <React.Fragment key={index}>
            {index % 2 ? sourceHtmlTable(part) : part}
        </React.Fragment>);
    }
    const hasTable = /^\s*\|(?:\s*:?-+:?\s*\|)+\s*$/m.test(text);
    if (!hasTable) {
        const lines = text.trim().split(/\r?\n/).map(line => line.trim());
        if (lines.length < 2 || !lines.every(line => /^\|.*\|$/.test(line))) return text;
        const rows = lines.map(line => line.slice(1, -1).split('|').map(cell => cell.trim()));
        if (rows[0].length < 2 || !rows.every(row => row.length === rows[0].length)) return text;
        return <div className="ruleslawyer-citation-preview__table" tabIndex={0} aria-label="Scrollable source table"><table aria-label="Source table continuation"><tbody>
            {rows.map((row, index) => <tr key={index}>
                {row.map((cell, column) => <td key={column}>{cell}</td>)}
            </tr>)}
        </tbody></table></div>;
    }
    return (
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
            table: ({ node, ...props }) => <div className="ruleslawyer-citation-preview__table" tabIndex={0}
                aria-label="Scrollable source table"><table {...props} /></div>,
        }} disallowedElements={['a', 'img']} unwrapDisallowed>
            {text}
        </ReactMarkdown>
    );
}

function CitationPassage({ href, label }: { href: string; label: string }) {
    const [passage, setPassage] = useState<string>();
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        const controller = new AbortController();
        async function load() {
            try {
                const response = await fetch(href, { signal: controller.signal });
                if (!response.ok) throw new Error('Could not load citation evidence');
                const document = new DOMParser().parseFromString(await response.text(), 'text/html');
                const text = document.querySelector('main > pre')?.textContent;
                if (!text?.trim() || /^\[\s*\]$/.test(text.trim())) throw new Error('Missing citation evidence');
                if (!controller.signal.aborted) setPassage(text);
            } catch {
                if (!controller.signal.aborted) setFailed(true);
            }
        }
        void load();
        return () => controller.abort();
    }, [href]);

    return (
        <article className="ruleslawyer-citation-preview__passage">
            <a href={href} target="_blank" rel="noreferrer">{label} ↗</a>
            {passage ? (
                <div className="ruleslawyer-citation-preview__text">{passageText(passage)}</div>
            ) : (
                <Text size="xs" role="status">{failed ? 'Preview unavailable. Open the source to read it.' : 'Loading passage…'}</Text>
            )}
        </article>
    );
}

export function RuleCitation({ number, page, sources }: {
    number: number;
    page: string;
    sources: RuleEvidenceCitation[];
}) {
    const [opened, setOpened] = useState(false);
    const title = `Printed page ${page}${sources[0]?.pdfPage ? ` · PDF page ${sources[0].pdfPage}` : ''}`;
    return (
        <>
            <button type="button" className="ruleslawyer-citation"
                data-tone={(number - 1) % 4} aria-label={`Source ${number}, printed page ${page}`}
                aria-haspopup="dialog" aria-expanded={opened} onClick={() => setOpened(true)}>
                {number}
            </button>
            <Modal opened={opened} onClose={() => setOpened(false)} title={title} centered zIndex={1100}
                size="auto" padding="md" radius="md" closeButtonProps={{ 'aria-label': 'Close source preview' }}
                classNames={{
                    inner: 'ruleslawyer-citation-preview__inner',
                    content: 'ruleslawyer-citation-preview',
                    title: 'ruleslawyer-citation-preview__page',
                    body: 'ruleslawyer-citation-preview__body',
                }}>
                {opened && <Stack gap="sm">
                    {sources.map((source, index) => {
                        const heading = citationTitle(source.section);
                        const label = sources.filter(other => citationTitle(other.section) === heading).length > 1
                            ? `${heading} · passage ${index + 1}` : heading;
                        return source.link && /^\/api\/ruleslawyer\/evidence\/[\w-]+\/[a-f0-9]{64}$/.test(source.link)
                            ? <CitationPassage key={source.link} href={`${DUNGEONMIND_API_URL}${source.link}`} label={label} />
                            : <Text key={index} size="sm">{label === 'Source passage'
                                ? 'No source preview is available for this citation.'
                                : `${label} · Preview unavailable`}</Text>;
                    })}
                </Stack>}
            </Modal>
        </>
    );
}
