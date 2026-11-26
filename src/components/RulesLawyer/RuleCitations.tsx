import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Popover, Stack, Text } from '@mantine/core';
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

function passageText(text: string) {
    const hasTable = /^\s*\|(?:\s*:?-+:?\s*\|)+\s*$/m.test(text);
    if (!hasTable) {
        const lines = text.trim().split(/\r?\n/).map(line => line.trim());
        if (lines.length < 2 || !lines.every(line => /^\|.*\|$/.test(line))) return text;
        const rows = lines.map(line => line.slice(1, -1).split('|').map(cell => cell.trim()));
        if (rows[0].length < 2 || !rows.every(row => row.length === rows[0].length)) return text;
        return <table aria-label="Source table continuation"><tbody>
            {rows.map((row, index) => <tr key={index}>
                {row.map((cell, column) => <td key={column}>{cell}</td>)}
            </tr>)}
        </tbody></table>;
    }
    return (
        <ReactMarkdown remarkPlugins={[remarkGfm]} disallowedElements={['a', 'img']} unwrapDisallowed>
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
        <section className="ruleslawyer-citation-preview__passage">
            <a href={href} target="_blank" rel="noreferrer">{label} ↗</a>
            {passage ? (
                <div className="ruleslawyer-citation-preview__text">{passageText(passage)}</div>
            ) : (
                <Text size="xs" role="status">{failed ? 'Preview unavailable. Open the source to read it.' : 'Loading passage…'}</Text>
            )}
        </section>
    );
}

export function RuleCitation({ number, page, sources }: {
    number: number;
    page: string;
    sources: RuleEvidenceCitation[];
}) {
    const [opened, setOpened] = useState(false);
    const [pinned, setPinned] = useState(false);
    const timer = useRef<ReturnType<typeof setTimeout>>();
    const trigger = useRef<HTMLButtonElement>(null);
    const cancelClose = () => clearTimeout(timer.current);
    useEffect(() => () => clearTimeout(timer.current), []);

    const show = () => {
        cancelClose();
        setOpened(true);
    };
    const hideSoon = () => {
        cancelClose();
        timer.current = setTimeout(() => {
            if (!pinned) setOpened(false);
        }, 180);
    };
    const close = () => {
        cancelClose();
        setPinned(false);
        setOpened(false);
    };

    return (
        <Popover opened={opened} onDismiss={close} width="max-content" position="top" offset={8}
            withArrow withinPortal shadow="lg" middlewares={{ flip: true, shift: { padding: 8, crossAxis: true } }}>
            <Popover.Target>
                <button ref={trigger} type="button" className="ruleslawyer-citation"
                    data-tone={(number - 1) % 4} aria-label={`Source ${number}, printed page ${page}`}
                    onMouseEnter={show} onMouseLeave={hideSoon} onFocus={show} onBlur={hideSoon}
                    onClick={() => {
                        if (pinned) close();
                        else { show(); setPinned(true); }
                    }}
                    onKeyDown={event => {
                        if (event.key === 'Escape') close();
                        if (event.key === 'Tab' && !event.shiftKey && opened) {
                            const panel = document.getElementById(event.currentTarget.getAttribute('aria-controls') ?? '');
                            const link = panel?.querySelector('a');
                            if (link) {
                                event.preventDefault();
                                link.focus();
                            }
                        }
                    }}>
                    {number}
                </button>
            </Popover.Target>
            <Popover.Dropdown className="ruleslawyer-citation-preview" aria-label={`Sources for printed page ${page}`}
                onMouseEnter={show} onMouseLeave={hideSoon} onFocus={show}
                onBlur={event => {
                    if (!event.currentTarget.contains(event.relatedTarget)) hideSoon();
                }}
                onKeyDown={event => {
                    if (event.key === 'Escape') {
                        trigger.current?.focus();
                        close();
                    }
                }}>
                <Stack gap="sm" className="ruleslawyer-citation-preview__body">
                    <Text size="xs" fw={700} className="ruleslawyer-citation-preview__page">
                        Printed page {page}{sources[0]?.pdfPage ? ` · PDF page ${sources[0].pdfPage}` : ''}
                    </Text>
                    {sources.map((source, index) => {
                        const title = citationTitle(source.section);
                        const label = sources.filter(other => citationTitle(other.section) === title).length > 1
                            ? `${title} · passage ${index + 1}` : title;
                        return source.link && /^\/api\/ruleslawyer\/evidence\/[\w-]+\/[a-f0-9]{64}$/.test(source.link)
                            ? <CitationPassage key={source.link} href={`${DUNGEONMIND_API_URL}${source.link}`} label={label} />
                            : <Text key={index} size="sm">{label === 'Source passage'
                                ? 'No source preview is available for this citation.'
                                : `${label} · Preview unavailable`}</Text>;
                    })}
                </Stack>
            </Popover.Dropdown>
        </Popover>
    );
}
