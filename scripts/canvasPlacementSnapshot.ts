/* eslint-disable no-console */
import fs from 'fs';
import path from 'path';

import type {
    BasePageDimensions,
    CanvasLayoutEntry,
    LayoutPlan,
    MeasurementKey,
    MeasurementRecord,
    PageVariables,
    TemplateConfig as CanvasTemplateConfig,
} from 'dungeonmind-canvas';
import {
    buildBuckets,
    buildPageDocument,
    COMPONENT_VERTICAL_SPACING_PX,
    computeBasePageDimensions,
    paginate,
} from 'dungeonmind-canvas';

import { demoTemplate } from '../src/fixtures/statblockTemplates';
import { DEMO_STATBLOCKS } from '../src/fixtures/demoStatblocks';
import type { StatBlockDetails } from '../src/types/statblock.types';
import { createStatblockAdapters } from '../src/components/StatBlockGenerator/canvasAdapters';

interface CliArgs {
    dataset: string;
    components: string[] | null;
    mode: string;
    regionHeight: number;
    outputPath?: string;
    measurementFile?: string;
    verbose: boolean;
}

interface SnapshotPlacement {
    id: string;
    type: string;
    page: number;
    column: number;
    columnKey: string;
    spanTop: number | null;
    spanBottom: number | null;
    spanHeight: number | null;
    cursorAfter: number | null;
    overflow: boolean;
    overflowRerouted: boolean;
    measurementKey: string;
    measurementHeight: number | null;
    measurementProvided: boolean;
    homeRegionKey: string;
    sourceRegionKey: string;
    isInHomeColumn: boolean;
    orderIndex: number;
    listContinuation: CanvasLayoutEntry['listContinuation'];
}

interface SnapshotFilePayload {
    timestamp: string;
    mode: string;
    dataset: {
        slug: string;
        name: string;
    };
    regionHeightPx: number;
    columnCount: number;
    requestedPageCount: number;
    measurementVersion: number;
    componentFilters: string[] | '*';
    measurementOverrides: Record<string, number>;
    placements: SnapshotPlacement[];
    planSummary: {
        pageCount: number;
        overflowWarnings: LayoutPlan['overflowWarnings'];
        pages: Array<{
            pageNumber: number;
            columns: Array<{
                key: string;
                columnNumber: number;
                entryCount: number;
                usedHeightPx?: number;
                availableHeightPx?: number;
            }>;
        }>;
    };
}

const DEFAULT_COMPONENTS = ['component-4', 'component-5'];
const DEFAULT_DATASET = 'dr-jupiter';
const DEFAULT_REGION_HEIGHT = 980.409;
const DEFAULT_MODE = 'baseline';
const FALLBACK_MARGIN_MM = 10;

const DEFAULT_MEASUREMENT_OVERRIDES: Record<string, Record<string, number>> = {
    'dr-jupiter': {
        'component-0:block': 92,
        'component-1:block': 168,
        'component-2:block': 172,
        'component-3:block': 87,
        'component-4:block': 74.53,
        'component-5:block': 125.87,
    },
};

const datasetIndex = new Map<string, StatBlockDetails>();
DEMO_STATBLOCKS.forEach((statblock) => {
    datasetIndex.set(slugify(statblock.name), statblock);
});
// Ensure canonical slugs exist even if formatting differs
const drJupiter = DEMO_STATBLOCKS.find((stat) => stat.name.toLowerCase().includes('jupiter'));
if (drJupiter) {
    datasetIndex.set('dr-jupiter', drJupiter);
}

type LengthUnit = 'px' | 'mm' | 'in';

const convertToPixels = (value: number, unit: LengthUnit): number => {
    if (unit === 'px') {
        return value;
    }
    if (unit === 'in') {
        return value * 96;
    }
    return (value / 25.4) * 96;
};

const resolveColumnGapPx = (columns?: PageVariables['columns']): number => {
    if (!columns) {
        return COMPONENT_VERTICAL_SPACING_PX;
    }
    const { gutter, unit } = columns;
    if (typeof gutter !== 'number' || Number.isNaN(gutter)) {
        return COMPONENT_VERTICAL_SPACING_PX;
    }
    return convertToPixels(gutter, (unit ?? 'px') as LengthUnit);
};

const computeCanonicalColumnWidth = (pageVariables: PageVariables, baseDimensions: BasePageDimensions): number | null => {
    const columnCount = pageVariables.columns?.columnCount ?? 1;
    if (columnCount <= 0) {
        return null;
    }
    const leftMarginMm = pageVariables.margins?.leftMm ?? FALLBACK_MARGIN_MM;
    const rightMarginMm = pageVariables.margins?.rightMm ?? FALLBACK_MARGIN_MM;
    const leftMarginPx = convertToPixels(leftMarginMm, 'mm');
    const rightMarginPx = convertToPixels(rightMarginMm, 'mm');
    const availableWidth = Math.max(0, baseDimensions.widthPx - (leftMarginPx + rightMarginPx));
    const columnGapPx = resolveColumnGapPx(pageVariables.columns);
    const totalGap = columnGapPx * Math.max(0, columnCount - 1);
    const usableWidth = Math.max(0, availableWidth - totalGap);
    if (usableWidth <= 0) {
        return null;
    }
    return usableWidth / columnCount;
};

function slugify(value: string): string {
    return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function parseArgs(): CliArgs {
    const argv = process.argv.slice(2);
    if (argv.includes('--help') || argv.includes('-h')) {
        printUsage();
        process.exit(0);
    }

    const args: CliArgs = {
        dataset: DEFAULT_DATASET,
        components: DEFAULT_COMPONENTS,
        mode: DEFAULT_MODE,
        regionHeight: DEFAULT_REGION_HEIGHT,
        verbose: false,
    };

    const consumeValue = (index: number, fallback?: string): string | undefined => {
        const next = argv[index + 1];
        if (next && !next.startsWith('--')) {
            argv.splice(index + 1, 1);
            return next;
        }
        return fallback;
    };

    for (let i = 0; i < argv.length; i += 1) {
        const token = argv[i];
        if (!token.startsWith('--')) {
            continue;
        }
        const [rawKey, inlineValue] = token.replace(/^--/, '').split('=');
        const key = rawKey.trim();
        const value = inlineValue ?? consumeValue(i);

        switch (key) {
            case 'dataset':
                if (value) {
                    args.dataset = slugify(value);
                }
                break;
            case 'components':
                if (value === '*' || value === 'all') {
                    args.components = null;
                } else if (value) {
                    args.components = value
                        .split(',')
                        .map((id) => id.trim())
                        .filter(Boolean);
                }
                break;
            case 'mode':
                if (value) {
                    args.mode = value;
                }
                break;
            case 'region-height':
                if (value && !Number.isNaN(Number(value))) {
                    args.regionHeight = Number(value);
                }
                break;
            case 'output':
                if (value) {
                    args.outputPath = value;
                }
                break;
            case 'measurement-file':
                if (value) {
                    args.measurementFile = value;
                }
                break;
            case 'verbose':
                args.verbose = true;
                break;
            default:
                console.warn(`⚠️  Unknown flag ignored: --${key}`);
        }
    }

    if (args.components && args.components.length === 0) {
        args.components = DEFAULT_COMPONENTS;
    }

    return args;
}

function printUsage(): void {
    console.log('Canvas Placement Snapshot');
    console.log('');
    console.log('Usage:');
    console.log('  ts-node --project tsconfig.scripts.json scripts/canvasPlacementSnapshot.ts [options]');
    console.log('');
    console.log('Options:');
    console.log('  --dataset=<slug>           Data fixture to load (default: dr-jupiter)');
    console.log('  --components=a,b           Comma-separated component IDs or "*" for all');
    console.log('  --mode=<label>             Label stored in snapshot metadata');
    console.log('  --region-height=<number>   Region height in px (default: canonical 980.409)');
    console.log('  --output=<path>            Write JSON snapshot to this path');
    console.log('  --measurement-file=<path>  Optional JSON overrides for measurement keys');
    console.log('  --verbose                  Print detailed placement summary to console');
    console.log('  --help                     Show this message');
}

function resolveDataset(slug: string): { slug: string; details: StatBlockDetails } {
    const normalized = slugify(slug);
    const candidate = datasetIndex.get(normalized);
    if (!candidate) {
        const available = Array.from(datasetIndex.keys()).sort().join(', ');
        throw new Error(`Dataset "${slug}" not found. Available datasets: ${available}`);
    }
    return { slug: normalized, details: candidate };
}

function loadMeasurementOverrides(datasetSlug: string, filePath?: string): Record<string, number> {
    const overrides: Record<string, number> = { ...(DEFAULT_MEASUREMENT_OVERRIDES[datasetSlug] ?? {}) };
    if (!filePath) {
        return overrides;
    }

    const absolutePath = path.resolve(process.cwd(), filePath);
    if (!fs.existsSync(absolutePath)) {
        throw new Error(`Measurement file not found: ${absolutePath}`);
    }
    const parsed = JSON.parse(fs.readFileSync(absolutePath, 'utf-8')) as Record<string, number>;
    Object.assign(overrides, parsed);
    return overrides;
}

function buildMeasurementMap(overrides: Record<string, number>): Map<MeasurementKey, MeasurementRecord> {
    const now = Date.now();
    return new Map(
        Object.entries(overrides).map(([key, height]) => [
            key,
            {
                key,
                height,
                measuredAt: now,
            },
        ])
    );
}

function summarizePlan(plan: LayoutPlan): SnapshotFilePayload['planSummary'] {
    return {
        pageCount: plan.pages.length,
        overflowWarnings: plan.overflowWarnings,
        pages: plan.pages.map((page) => ({
            pageNumber: page.pageNumber,
            columns: page.columns.map((column) => ({
                key: column.key,
                columnNumber: column.columnNumber,
                entryCount: column.entries.length,
                usedHeightPx: column.usedHeightPx,
                availableHeightPx: column.availableHeightPx,
            })),
        })),
    };
}

function collectPlacements(
    plan: LayoutPlan,
    measurementMap: Map<MeasurementKey, MeasurementRecord>,
    componentFilters: string[] | null
): SnapshotPlacement[] {
    const placements: SnapshotPlacement[] = [];
    const filterSet = componentFilters ? new Set(componentFilters) : null;

    plan.pages.forEach((page) => {
        page.columns.forEach((column) => {
            column.entries.forEach((entry) => {
                if (filterSet && !filterSet.has(entry.instance.id)) {
                    return;
                }
                const spanTop = entry.span?.top ?? null;
                const spanBottom = entry.span?.bottom ?? null;
                const measurement = measurementMap.get(entry.measurementKey);
                placements.push({
                    id: entry.instance.id,
                    type: entry.instance.type,
                    page: page.pageNumber,
                    column: column.columnNumber,
                    columnKey: column.key,
                    spanTop,
                    spanBottom,
                    spanHeight: entry.span?.height ?? null,
                    cursorAfter: spanBottom != null ? spanBottom + COMPONENT_VERTICAL_SPACING_PX : null,
                    overflow: Boolean(entry.overflow),
                    overflowRerouted: Boolean(entry.overflowRouted),
                    measurementKey: entry.measurementKey,
                    measurementHeight: measurement?.height ?? null,
                    measurementProvided: measurementMap.has(entry.measurementKey),
                    homeRegionKey: entry.homeRegionKey,
                    sourceRegionKey: entry.sourceRegionKey,
                    isInHomeColumn: entry.homeRegionKey === column.key,
                    orderIndex: entry.orderIndex,
                    listContinuation: entry.listContinuation,
                });
            });
        });
    });

    placements.sort((a, b) => {
        if (a.page !== b.page) return a.page - b.page;
        if (a.column !== b.column) return a.column - b.column;
        if (a.spanTop == null || b.spanTop == null) return 0;
        return a.spanTop - b.spanTop;
    });

    return placements;
}

async function main(): Promise<void> {
    const args = parseArgs();
    const { slug: datasetSlug, details: statblock } = resolveDataset(args.dataset);
    const measurementOverrides = loadMeasurementOverrides(datasetSlug, args.measurementFile);

    const template = demoTemplate as unknown as CanvasTemplateConfig;
    const adapters = createStatblockAdapters();

    const pageDocument = buildPageDocument({
        template,
        statblockData: statblock,
        customData: {},
        projectId: statblock.projectId ?? `snapshot-${datasetSlug}`,
        ownerId: 'canvas-snapshot',
    });

    const columnCount =
        pageDocument.pageVariables.columns?.columnCount ??
        template.defaultPageVariables.columns?.columnCount ??
        1;
    const requestedPageCount =
        pageDocument.pageVariables.pagination?.pageCount ??
        template.defaultPageVariables.pagination?.pageCount ??
        1;

    const pageVariables = pageDocument.pageVariables as PageVariables;
    const baseDimensions = computeBasePageDimensions(pageVariables);
    const measurementMap = buildMeasurementMap(measurementOverrides);
    const portraitColumnWidth = computeCanonicalColumnWidth(pageVariables, baseDimensions);
    if (portraitColumnWidth) {
        const portraitHeight = Number(portraitColumnWidth.toFixed(2));
        const portraitKeys: string[] = [];
        pageDocument.componentInstances.forEach((instance) => {
            if (instance.type !== 'portrait-panel') {
                return;
            }
            const key = `${instance.id}:block`;
            measurementOverrides[key] = portraitHeight;
            measurementMap.set(key, {
                key,
                height: portraitHeight,
                measuredAt: Date.now(),
            });
            portraitKeys.push(key);
        });
        if (args.verbose && portraitKeys.length > 0) {
            console.log('📐 [Snapshot] Applied portrait square measurements', {
                portraitHeight,
                columnWidthPx: portraitColumnWidth,
                portraitKeys,
            });
        }
    }

    const buckets = buildBuckets({
        instances: pageDocument.componentInstances,
        template,
        columnCount,
        pageWidthPx: baseDimensions.widthPx,
        dataSources: pageDocument.dataSources,
        measurements: measurementMap,
        adapters,
    });

    const measurementVersion = 1;
    const plan = paginate({
        buckets,
        columnCount,
        regionHeightPx: args.regionHeight,
        requestedPageCount,
        baseDimensions,
        measurementVersion,
        measurements: measurementMap,
        adapters,
    });

    const placements = collectPlacements(plan, measurementMap, args.components);

    if (args.verbose) {
        console.log('🧮 Placement Summary:');
        placements.forEach((placement) => {
            const spanTop = placement.spanTop != null ? placement.spanTop.toFixed(2) : '–';
            const spanBottom = placement.spanBottom != null ? placement.spanBottom.toFixed(2) : '–';
            console.log(
                ` - ${placement.id} → page ${placement.page}, column ${placement.column} (${spanTop}–${spanBottom}px) ${placement.overflow ? '[overflow]' : ''
                }${placement.overflowRerouted ? ' [rerouted]' : ''}`
            );
        });
        console.log('');
    }

    const payload: SnapshotFilePayload = {
        timestamp: new Date().toISOString(),
        mode: args.mode,
        dataset: {
            slug: datasetSlug,
            name: statblock.name,
        },
        regionHeightPx: args.regionHeight,
        columnCount,
        requestedPageCount,
        measurementVersion,
        componentFilters: args.components ?? '*',
        measurementOverrides,
        placements,
        planSummary: summarizePlan(plan),
    };

    if (args.outputPath) {
        const absoluteOutput = path.resolve(process.cwd(), args.outputPath);
        fs.mkdirSync(path.dirname(absoluteOutput), { recursive: true });
        fs.writeFileSync(absoluteOutput, JSON.stringify(payload, null, 2));
        console.log(`💾 Snapshot written to ${absoluteOutput}`);
    } else {
        console.log(JSON.stringify(payload, null, 2));
    }
}

main().catch((error) => {
    console.error('❌ Snapshot failed:', error instanceof Error ? error.message : error);
    process.exit(1);
});


