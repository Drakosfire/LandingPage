# Quickstart: LandingPage Visual Refresh

**Branch**: `1-landingpage-visual-refresh`  
**Time Estimate**: 16-20 hours across 6 phases

## Setup

```bash
# Switch to feature branch
cd LandingPage
git checkout 1-landingpage-visual-refresh

# Install dependencies
pnpm install

# Start dev server
pnpm dev
```

## Key Files to Read First

| File | Purpose |
|------|---------|
| `src/components/UnifiedHeader.tsx` | Header component API (lines 20-67 for props) |
| `src/components/StatBlockGenerator/statblockToolboxConfig.tsx` | Toolbox pattern to follow |
| `src/config/mantineTheme.ts` | Design tokens (colors, fonts, spacing) |
| `specs/HANDOFF-UnifiedHeader-Aesthetic-Adoption.md` | Detailed implementation guidance |

## Pattern: Adding UnifiedHeader to a Route

### For Content Pages (Home, Blog)

```tsx
import { UnifiedHeader } from '../components/UnifiedHeader';

const DM_LOGO_URL = 'https://imagedelivery.net/.../dm-logo.png';

export const HomePage: React.FC = () => (
  <>
    <UnifiedHeader
      app={{ id: 'home', name: 'DungeonMind', icon: DM_LOGO_URL }}
      showAuth={true}
    />
    <main>
      {/* Content */}
    </main>
  </>
);
```

### For Generator Pages (CardGenerator, RulesLawyer)

```tsx
import { UnifiedHeader } from '../components/UnifiedHeader';
import { createToolboxSections } from './toolboxConfig';

export const GeneratorPage: React.FC = () => {
  const { isLoggedIn } = useAuth();
  const [state, setState] = useState(/* ... */);
  
  const toolboxSections = createToolboxSections({
    state,
    setState,
    isLoggedIn,
    // ... other props
  });

  return (
    <>
      <UnifiedHeader
        app={{ id: 'generator', name: 'Generator Name', icon: ICON_URL }}
        toolboxSections={toolboxSections}
        showAuth={true}
        showProjects={true}
        onProjectsClick={handleOpenProjects}
      />
      <main>
        {/* Generator content */}
      </main>
    </>
  );
};
```

## Pattern: Creating a Toolbox Config

```tsx
// src/components/YourGenerator/yourToolboxConfig.tsx
import { ToolboxSection } from '../AppToolbox';
import { IconAction, IconHelp } from '@tabler/icons-react';

export interface YourToolboxConfigProps {
  isLoggedIn: boolean;
  handleAction: () => void;
  handleHelp: () => void;
}

export const createYourToolboxSections = (
  props: YourToolboxConfigProps
): ToolboxSection[] => {
  const { isLoggedIn, handleAction, handleHelp } = props;
  
  return [
    {
      id: 'actions',
      label: 'Actions',
      controls: [
        {
          id: 'do-action',
          type: 'menu-item',
          label: 'Do Action',
          icon: <IconAction size={16} />,
          onClick: handleAction,
          disabled: !isLoggedIn
        }
      ]
    },
    {
      id: 'help',
      label: 'Help',
      controls: [
        {
          id: 'tutorial',
          type: 'menu-item',
          label: 'Tutorial',
          icon: <IconHelp size={16} />,
          onClick: handleHelp
        }
      ]
    }
  ];
};
```

## Pattern: Styling Cards

```tsx
import { Card, Title, Text } from '@mantine/core';

<Card 
  shadow="sm" 
  radius="md" 
  withBorder
  style={{ 
    backgroundColor: 'var(--mantine-color-parchment-3)',
    borderColor: 'var(--mantine-color-blue-4)',
    borderWidth: 2,
    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = 'translateY(-4px)';
    e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.15)';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.boxShadow = '';
  }}
>
  <Title order={3}>Card Title</Title>
  <Text>Card content...</Text>
</Card>
```

## Common Mantine Tokens

```css
/* Colors */
var(--mantine-color-blue-4)       /* Primary blue */
var(--mantine-color-parchment-3)  /* Parchment background */
var(--mantine-color-gray-3)       /* Border color */

/* Spacing */
var(--mantine-spacing-xs)  /* 4px */
var(--mantine-spacing-sm)  /* 8px */
var(--mantine-spacing-md)  /* 16px */
var(--mantine-spacing-lg)  /* 24px */
var(--mantine-spacing-xl)  /* 32px */

/* Radius */
var(--mantine-radius-sm)   /* 8px */
var(--mantine-radius-md)   /* 12px */
```

## Verification Commands

```bash
# Lint check
pnpm lint

# Search for legacy patterns (should return nothing after Phase 5)
grep -r "#4a4e69" src/
grep -r "margin-left: 80px" src/
grep -r "NavBar" src/
grep -r "FloatingHeader" src/
```

## Phase Commits

| Phase | Commit Message |
|-------|----------------|
| 0 | `chore(css): remove legacy :root declarations and conflicting styles` |
| 1 | `refactor(app): remove NavBar and conditional margin logic` |
| 2 | `feat(home): add UnifiedHeader and modernize home page sections` |
| 3 | `feat(blog): add UnifiedHeader and apply DungeonMind theming` |
| 4 | `feat(generators): add UnifiedHeader with toolbox to CardGenerator and RulesLawyer` |
| 5 | `chore(cleanup): delete NavBar, FloatingHeader, and legacy CSS patterns` |

## Do NOT Modify

- `src/components/StatBlockGenerator/` - Already complete
- `src/components/PlayerCharacterGenerator/` - Already complete
- `src/components/UnifiedHeader.tsx` - Reuse as-is
- `src/config/mantineTheme.ts` - Tokens are correct


