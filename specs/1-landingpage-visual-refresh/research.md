# Research: LandingPage Visual Refresh

**Feature**: 1-landingpage-visual-refresh  
**Date**: December 17, 2025  
**Status**: Complete (all patterns already established in codebase)

## Overview

This feature reuses existing patterns from StatblockGenerator and PlayerCharacterGenerator. No new research required - all patterns are documented and implemented.

## Pattern Sources Analyzed

### 1. UnifiedHeader Integration Pattern

**Decision**: Use existing UnifiedHeader component without modification

**Source**: `src/components/UnifiedHeader.tsx`

**Pattern**:
```tsx
<UnifiedHeader
  app={{ id: 'app-id', name: 'App Name', icon: ICON_URL }}
  toolboxSections={toolboxSections}  // Optional - for generators
  saveStatus={saveStatus}             // Optional - for saveable apps
  onSaveClick={handleSave}            // Optional
  showProjects={true}                 // Optional - for project-based apps
  onProjectsClick={handleOpenProjects}
  showGeneration={true}               // Optional - for AI generation apps
  onGenerationClick={handleGeneration}
  showAuth={true}                     // Show login/logout
/>
```

**Rationale**: Component is well-tested in production with STG/PCG. Reuse avoids regression risk.

**Alternatives Considered**: 
- Create new header variants → Rejected: Would create maintenance burden
- Modify UnifiedHeader → Rejected: Current API covers all use cases

---

### 2. Toolbox Configuration Pattern

**Decision**: Follow existing statblockToolboxConfig pattern

**Source**: `src/components/StatBlockGenerator/statblockToolboxConfig.tsx`

**Pattern**:
```tsx
export interface ToolboxConfigProps {
  // State hooks
  isEditMode: boolean;
  setEditMode: (enabled: boolean) => void;
  
  // Actions
  isLoggedIn: boolean;
  handleAction: () => void;
}

export const createToolboxSections = (props: ToolboxConfigProps): ToolboxSection[] => {
  return [
    {
      id: 'section-id',
      label: 'Section Label',
      controls: [
        {
          id: 'control-id',
          type: 'menu-item' | 'component' | 'submenu',
          label: 'Control Label',
          icon: <IconName size={16} />,
          onClick: handler,
          dataAttributes: { 'data-tutorial': 'tutorial-target' }
        }
      ]
    }
  ];
};
```

**Rationale**: Consistent UX across all generators. Pattern already tested.

---

### 3. Mantine Theme Integration

**Decision**: Use existing Mantine theme tokens exclusively

**Source**: `src/config/mantineTheme.ts`

**Key Tokens**:
- `var(--mantine-color-blue-4)` - Primary blue (#4a90e2)
- `var(--mantine-color-parchment-3)` - Parchment base (#f4f1e8)
- Balgruf font for headings (via theme.headings.fontFamily)
- System font stack for body text

**Card Pattern**:
```tsx
<Card 
  shadow="sm" 
  radius="md" 
  withBorder
  style={{ 
    backgroundColor: 'var(--mantine-color-parchment-3)',
    borderColor: 'var(--mantine-color-blue-4)',
    borderWidth: 2
  }}
>
```

**Rationale**: Theme already configured correctly. Use tokens, not hardcoded values.

---

### 4. CSS Migration Strategy

**Decision**: Remove legacy `:root`, map to Mantine tokens during transition

**Migration Path**:
1. Remove duplicate `:root` from Blog.css
2. Update App.css `:root` to reference Mantine CSS variables
3. Gradually replace inline usages with Mantine tokens
4. Remove legacy variables entirely in Phase 5

**Legacy → Modern Mapping**:
| Legacy Variable | Mantine Token |
|-----------------|---------------|
| `--primary-color: #4a4e69` | `var(--mantine-color-blue-4)` |
| `--secondary-color: #9a8c98` | Remove (unused) |
| `--accent-color: #c9ada7` | Remove (unused) |
| `--background-color: #f2e9e4` | `var(--mantine-color-parchment-3)` |
| `--text-color: #22223b` | `#333333` (Mantine default) |

---

### 5. Font Loading Strategy

**Decision**: FOUT with font-display: swap (per spec clarification)

**Implementation**: Balgruf font already configured in theme. Ensure any @font-face declarations use:
```css
@font-face {
  font-family: 'Balgruf';
  font-display: swap;
  /* ... */
}
```

**Rationale**: Faster perceived load time. System fonts readable during swap.

---

### 6. Accessibility Compliance

**Decision**: WCAG 2.1 AA (per spec clarification)

**Requirements**:
- Color contrast ≥ 4.5:1 for normal text, ≥ 3:1 for large text
- Keyboard navigation for all interactive elements
- Visible focus indicators

**Verification**:
- Parchment (#f4f1e8) + dark text (#333333) = contrast ratio ~10:1 ✓
- Blue (#4a90e2) on white = contrast ratio ~3.8:1 (borderline for small text)
- UnifiedHeader already has aria-labels and keyboard support

---

## No Further Research Needed

All patterns are established in the codebase. Implementation can proceed directly to Phase 0.


