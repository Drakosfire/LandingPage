import React, { useEffect, useRef, useState } from 'react';
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
        <Popover opened={opened} onDismiss={close} width={304} position="top" offset={8}
            withArrow withinPortal shadow="lg" middlewares={{ flip: true, shift: { padding: 8 } }}
            styles={{ dropdown: { width: 'min(19rem, calc(100vw - 1rem))' } }}>
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
                <Stack gap={6}>
                    <Text size="xs" fw={700} className="ruleslawyer-citation-preview__page">
                        Printed page {page}{sources[0]?.pdfPage ? ` · PDF page ${sources[0].pdfPage}` : ''}
                    </Text>
                    {sources.map((source, index) => {
                        const title = source.section || 'Source passage';
                        const label = sources.filter(other => other.section === source.section).length > 1
                            ? `${title} · passage ${index + 1}` : title;
                        return source.link && /^\/api\/ruleslawyer\/evidence\/[\w-]+\/[a-f0-9]{64}$/.test(source.link)
                            ? <a key={source.link} href={`${DUNGEONMIND_API_URL}${source.link}`}
                                target="_blank" rel="noreferrer">{label} ↗</a>
                            : <Text key={index} size="sm">{label}</Text>;
                    })}
                </Stack>
            </Popover.Dropdown>
        </Popover>
    );
}
