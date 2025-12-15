/**
 * PCG Print Debug Utilities
 *
 * Goal: capture the DOM snapshot that browser print preview receives, so we can debug
 * blank pages / layout drift with evidence rather than guesswork.
 *
 * Dev-only by convention (wired behind a Dev Tools toolbox action).
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface PrintSnapshotOptions {
    /**
     * Root selector to capture. For PCG we want the canvas output, not app chrome.
     */
    rootSelector: string;

    /**
     * Optional: include computed styles (inline) for a limited set of properties.
     * This makes the snapshot viewable standalone, but can be heavy.
     */
    inlineComputedStyles?: boolean;

    /**
     * CSS base URL for D&D PHB theme assets.
     * Example: `${DND_CSS_BASE_URL}`
     */
    dndCssBaseUrl?: string;

    /**
     * Snapshot title.
     */
    title?: string;

    /**
     * Include currently loaded app styles from the live document:
     * - <link rel="stylesheet" ...>
     * - <style>...</style>
     *
     * This makes the snapshot much closer to what print preview renders.
     */
    includeAppStyles?: boolean;
}

declare global {
    interface Window {
        __PCG_PRINT_SNAPSHOT_HTML__?: string;
    }
}

const COMPUTED_STYLE_PROPS: string[] = [
    'display',
    'position',
    'top',
    'right',
    'bottom',
    'left',
    'flex',
    'flex-grow',
    'flex-shrink',
    'flex-basis',
    'justify-content',
    'align-items',
    'align-content',
    'gap',
    'width',
    'min-width',
    'max-width',
    'height',
    'min-height',
    'max-height',
    'margin',
    'padding',
    'box-sizing',
    'font-family',
    'font-size',
    'font-weight',
    'line-height',
    'letter-spacing',
    'color',
    'background',
    'background-color',
    'background-image',
    'background-position',
    'background-size',
    'border',
    'border-radius',
    'transform',
    'transform-origin',
    'overflow',
    'z-index',
];

function downloadTextFile(filename: string, content: string) {
    const blob = new Blob([content], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}

function cleanInteractiveElements(root: HTMLElement) {
    // Remove contenteditable attributes and edit controls
    const editControls = root.querySelectorAll('[data-edit-control], [contenteditable="true"]');
    editControls.forEach((node) => {
        if (node instanceof HTMLElement) {
            node.removeAttribute('contenteditable');
            node.removeAttribute('data-edit-control');
        }
    });

    // Remove buttons (toolbox controls, etc) inside capture area, if any
    root.querySelectorAll('button, [role="button"]').forEach((btn) => btn.remove());
}

function inlineStylesFromComputed(src: Element, dest: Element) {
    if (typeof window === 'undefined' || typeof window.getComputedStyle !== 'function') return;
    const computed = window.getComputedStyle(src as Element);
    const styleParts: string[] = [];
    for (const prop of COMPUTED_STYLE_PROPS) {
        const value = computed.getPropertyValue(prop);
        if (value && value.trim().length > 0) {
            styleParts.push(`${prop}: ${value};`);
        }
    }
    const existing = (dest as HTMLElement).getAttribute('style');
    const combined = [existing, styleParts.join(' ')].filter(Boolean).join(' ');
    (dest as HTMLElement).setAttribute('style', combined);
}

function inlineComputedStylesTree(src: Element, dest: Element) {
    inlineStylesFromComputed(src, dest);

    const srcChildren = Array.from(src.children);
    const destChildren = Array.from(dest.children);
    const len = Math.min(srcChildren.length, destChildren.length);
    for (let i = 0; i < len; i++) {
        inlineComputedStylesTree(srcChildren[i], destChildren[i]);
    }
}

function buildSnapshotHtmlDocument(args: {
    title: string;
    bodyHtml: string;
    dndCssBaseUrl?: string;
    appStylesHtml?: string;
}): string {
    const { title, bodyHtml, dndCssBaseUrl, appStylesHtml } = args;

    const cssBaseUrl = dndCssBaseUrl?.replace(/\/$/, '');
    const dndCssLinks = cssBaseUrl
        ? `
<link rel="stylesheet" href="${cssBaseUrl}/all.css">
<link rel="stylesheet" href="${cssBaseUrl}/bundle.css">
<link rel="stylesheet" href="${cssBaseUrl}/style.css">
<link rel="stylesheet" href="${cssBaseUrl}/5ePHBstyle.css">
`
        : '';

    // Minimal safe defaults: let the captured DOM + inline styles (if enabled) drive layout.
    return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  ${dndCssLinks}
  ${appStylesHtml ?? ''}
  <style>
    body { margin: 0; padding: 16px; background: #eee; }
    .snapshot-shell { max-width: 8.5in; margin: 0 auto; background: white; }
  </style>
</head>
<body>
  <div class="snapshot-shell">
    ${bodyHtml}
  </div>
</body>
</html>`;
}

function toAbsoluteHref(href: string): string {
    if (!href) return href;
    if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('data:')) {
        return href;
    }
    if (href.startsWith('/')) {
        return `${window.location.origin}${href}`;
    }
    // Relative path: resolve against current location.
    try {
        return new URL(href, window.location.href).toString();
    } catch {
        return href;
    }
}

function captureCurrentDocumentStyles(): string {
    const parts: string[] = [];

    // Copy stylesheet links
    const links = Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]'));
    for (const link of links) {
        const href = link.getAttribute('href') ?? '';
        if (!href) continue;
        const abs = toAbsoluteHref(href);
        parts.push(`<link rel="stylesheet" href="${abs}">`);
    }

    // Copy inline styles
    const styles = Array.from(document.querySelectorAll<HTMLStyleElement>('style'));
    for (const style of styles) {
        const cssText = style.textContent ?? '';
        if (!cssText.trim()) continue;
        parts.push(`<style>${cssText}</style>`);
    }

    return parts.join('\n');
}

export function capturePcgPrintSnapshot(options: PrintSnapshotOptions) {
    const {
        rootSelector,
        inlineComputedStyles = false,
        dndCssBaseUrl,
        title = 'PCG Print Snapshot',
        includeAppStyles = true,
    } = options;

    const root = document.querySelector(rootSelector);
    if (!root || !(root instanceof HTMLElement)) {
        const msg = `<!-- PCG Print Snapshot error: root not found: ${rootSelector} -->`;
        window.__PCG_PRINT_SNAPSHOT_HTML__ = msg;
        console.error('❌ [PCG PrintDebug] Root not found:', rootSelector);
        return;
    }

    const clone = root.cloneNode(true) as HTMLElement;
    cleanInteractiveElements(clone);

    if (inlineComputedStyles) {
        try {
            inlineComputedStylesTree(root, clone);
        } catch (err) {
            console.warn('⚠️ [PCG PrintDebug] Failed to inline computed styles:', err);
        }
    }

    const appStylesHtml = includeAppStyles ? captureCurrentDocumentStyles() : '';

    const html = buildSnapshotHtmlDocument({
        title,
        bodyHtml: clone.outerHTML,
        dndCssBaseUrl,
        appStylesHtml,
    });

    window.__PCG_PRINT_SNAPSHOT_HTML__ = html;

    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    downloadTextFile(`pcg-print-snapshot-${stamp}.html`, html);

    console.log('✅ [PCG PrintDebug] Snapshot captured and downloaded');
}


