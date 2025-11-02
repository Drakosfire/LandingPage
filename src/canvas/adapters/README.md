# Statblock Canvas Adapters

**Created:** November 2, 2025  
**Purpose:** Domain-specific adapters for StatblockGenerator to work with @dungeonmind/canvas package

---

## Overview

This directory contains statblock-specific implementations of Canvas adapters. The Canvas library is generic and doesn't know about statblocks, Actions, or D&D 5e mechanics. These adapters provide that knowledge.

---

## Adapter Bundle

### `createStatblockAdapters()`

Creates a complete `CanvasAdapters` bundle configured for D&D 5e statblocks.

**Usage:**
```typescript
import { createStatblockAdapters } from './canvas/adapters/statblockAdapters';
import { useCanvasLayout } from './canvas/hooks/useCanvasLayout';

const adapters = useMemo(() => createStatblockAdapters(), []);

const layout = useCanvasLayout({
    componentInstances,
    template,
    dataSources,
    componentRegistry,
    pageVariables,
    adapters,  // Pass statblock adapters
});
```

---

## Adapter Implementations

### 1. `statblockDataResolver`

Resolves data references from statblock data sources.

**Capabilities:**
- Extracts fields from `StatBlockDetails` (e.g., `legendaryActions`, `spells`)
- Handles both statblock and custom data sources
- Type-safe data access

**Example:**
```typescript
// Resolves statblock.legendaryActions
const legendaryActions = adapters.dataResolver.resolveDataReference(
    dataSources,
    { type: 'statblock', path: 'legendaryActions' }
);
```

---

### 2. `statblockHeightEstimator`

Estimates heights of statblock components before measurement.

**Capabilities:**
- Action-specific height calculation
- Accounts for attack bonus, damage, range metadata
- Estimates description height based on text length
- Handles list headers (normal vs. continuation)

**Constants:**
- `ACTION_HEADER_HEIGHT_PX = 36`
- `ACTION_CONTINUATION_HEADER_HEIGHT_PX = 28`
- `ACTION_META_LINE_HEIGHT_PX = 16`
- `ACTION_DESC_LINE_HEIGHT_PX = 18`
- `ACTION_AVG_CHARS_PER_LINE = 75`

**Example:**
```typescript
const action: Action = {
    id: '1',
    name: 'Fireball',
    desc: 'A bright streak flashes...',
    damage: '8d6',
    damageType: 'fire',
};

const height = adapters.heightEstimator.estimateItemHeight(action);
// Returns: ~90px (header + meta + description lines)
```

---

### 3. `statblockMetadataExtractor`

Extracts metadata from statblock for export and display.

**Capabilities:**
- Extracts creature name for filenames
- Extracts CR, type, size for export metadata
- Provides sensible defaults

**Example:**
```typescript
const name = adapters.metadataExtractor.extractDisplayName(dataSources);
// Returns: "Ancient Red Dragon" or "Untitled Statblock"

const metadata = adapters.metadataExtractor.extractExportMetadata(dataSources);
// Returns: { name: "Ancient Red Dragon", type: "dragon", cr: 24, ... }
```

---

## Migration Notes

### Current State (Session 3)

**Imports:** Relative paths to `../../../../Canvas/src/`

```typescript
import type { CanvasAdapters } from '../../../../Canvas/src/types/adapters.types';
```

**Why:** Canvas package not yet linked to LandingPage

---

### Future State (After npm link)

**Imports:** Package imports from `@dungeonmind/canvas`

```typescript
import type { CanvasAdapters } from '@dungeonmind/canvas';
```

**When:** After Session 4 (Integration) completes with `npm link`

---

## Testing

### Unit Testing Adapters

```typescript
import { createStatblockAdapters } from './statblockAdapters';
import type { Action } from '../../types/statblock.types';

it('estimates action height correctly', () => {
    const adapters = createStatblockAdapters();
    const action: Action = {
        id: '1',
        name: 'Fireball',
        desc: 'A bright streak...',
        damage: '8d6',
    };

    const height = adapters.heightEstimator.estimateItemHeight(action);
    expect(height).toBeGreaterThan(50);
    expect(height).toBeLessThan(200);
});
```

### Integration Testing

Adapters will be tested end-to-end in Session 4 when StatblockPage.tsx uses them with the Canvas package.

---

## Files

- `statblockAdapters.ts` - Complete adapter implementations
- `README.md` - This file

---

**Status:** ✅ Complete  
**Ready For:** Session 4 (Integration Testing)


