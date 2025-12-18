# Tasks: LandingPage Visual Refresh

**Input**: Design documents from `/specs/1-landingpage-visual-refresh/`  
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, quickstart.md ✓

**Tests**: Visual/CSS refactoring - manual browser testing per plan.md. No unit test tasks generated.

**Organization**: Tasks organized by implementation phase. Each phase contributes to multiple user stories (cross-cutting).

## Format: `[ID] [P?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## User Story → Phase Mapping

| User Story | Description | Contributed By Phases |
|------------|-------------|----------------------|
| US1 | Consistent Navigation Experience (P1) | Phases 2, 3, 4 |
| US2 | Unified Visual Identity (P1) | Phases 0, 2, 3, 4 |
| US3 | Full-Width Layout (P2) | Phases 0, 1 |
| US4 | Generator Toolbox Integration (P2) | Phase 4 |
| US5 | Authentication Continuity (P1) | Phases 2, 3, 4, 5 |

---

## Phase 1: Setup

**Purpose**: Read reference patterns before making any changes

- [x] T001 Read `src/components/UnifiedHeader.tsx` to understand header API (props interface lines 20-67)
- [x] T002 Read `src/components/StatBlockGenerator/statblockToolboxConfig.tsx` to understand toolbox pattern
- [x] T003 Read `src/components/StatBlockGenerator/StatBlockGenerator.tsx` to see UnifiedHeader wiring
- [x] T004 Read `src/config/mantineTheme.ts` to understand available design tokens

---

## Phase 2: Foundational - CSS Cleanup (BLOCKING)

**Purpose**: Remove conflicting CSS that would break subsequent phases

**⚠️ CRITICAL**: No route work can begin until this phase is complete

**Contributes to**: US2 (Visual Identity), US3 (Full-Width Layout)

- [x] T005 Remove duplicate `:root` declarations from `src/Blog/Blog.css` (delete lines 1-9 if present)
- [x] T006 Update `src/styles/App.css` `:root` to map legacy variables to Mantine tokens
- [x] T007 Remove Montserrat font-family declaration from `src/styles/App.css` (line 15)
- [x] T008 Document 80px margin-left locations in `src/styles/App.css` for removal in Phase 3

**Verification**:
- [x] T009 Run `pnpm lint` and fix any errors (no lint script - CSS changes only)
- [x] T010 Run `grep -r ":root" src/` and verify no duplicate declarations
- [ ] T011 Verify StatblockGenerator still renders at `http://localhost:5173/statblockgenerator`
- [ ] T012 Verify PlayerCharacterGenerator still renders at `http://localhost:5173/playercharactergenerator`

**Checkpoint**: CSS foundation clean - App.tsx simplification can now begin

---

## Phase 3: Foundational - App.tsx Simplification (BLOCKING)

**Purpose**: Remove NavBar and conditional margin logic

**⚠️ CRITICAL**: Must complete before adding UnifiedHeader to any route

**Contributes to**: US3 (Full-Width Layout)

- [x] T013 Remove `ConditionalNavBar` component definition from `src/App.tsx` (lines 44-56)
- [x] T014 Remove `ConditionalNavBar` usage from `src/App.tsx` (line 97)
- [x] T015 Remove `import NavBar from './components/NavBar'` from `src/App.tsx` (line 10)
- [x] T016 Simplify `MainContent` component in `src/App.tsx` - remove conditional margin logic (lines 59-73)
- [x] T017 Remove 80px margin-left media query from `src/styles/App.css` (lines 48-58)

**Verification**:
- [x] T018 Run `pnpm lint` and fix any errors (no TypeScript errors in App.tsx)
- [ ] T019 Verify no 80px left margin on Home page
- [ ] T020 Verify StatblockGenerator still works (already has UnifiedHeader)
- [ ] T021 Verify PlayerCharacterGenerator still works (already has UnifiedHeader)
- [ ] T022 Verify NavigationDrawer accessible from StatblockGenerator (click hamburger menu)

**Checkpoint**: App.tsx simplified - route-specific work can now begin

---

## Phase 4: Home Page Modernization

**Purpose**: Add UnifiedHeader to Home route, restyle sections with Mantine

**Contributes to**: US1 (Navigation), US2 (Visual Identity), US5 (Auth Continuity)

**Goal**: Home page matches StatblockGenerator aesthetic

**Independent Test**: Navigate to `/` and verify header matches `/statblockgenerator` header

### Home Route Header

- [x] T023 Add UnifiedHeader import to `src/App.tsx`
- [x] T024 Define DM_LOGO_URL constant in `src/App.tsx` (use existing logo path)
- [x] T025 Wrap home route content with UnifiedHeader in `src/App.tsx` (lines 100-112)

### AppLinks Restyle

- [x] T026 [P] Import Mantine Card, Title, Text, Grid from `@mantine/core` in `src/components/AppLinks.tsx`
- [x] T027 [P] Replace current card implementation with Mantine Card pattern in `src/components/AppLinks.tsx`
- [x] T028 [P] Update `src/components/AppLinks.css` - use CSS Grid and Mantine tokens for colors
- [x] T029 [P] Add hover transform effect to cards in `src/components/AppLinks.css`

### AboutMe Restyle

- [x] T030 [P] Import Mantine Paper, Button, Container from `@mantine/core` in `src/components/AboutMe.tsx`
- [x] T031 [P] Wrap content in Mantine Paper with parchment background in `src/components/AboutMe.tsx`
- [x] T032 [P] Replace CTA buttons with Mantine Button in `src/components/AboutMe.tsx`

### AboutDungeonMind Restyle

- [x] T033 [P] Import Mantine Paper, Title, Text from `@mantine/core` in `src/components/AboutDungeonMind.tsx`
- [x] T034 [P] Wrap content in Mantine Paper in `src/components/AboutDungeonMind.tsx`
- [x] T035 [P] Update content to reflect current features (statblocks, character sheets ported) in `src/components/AboutDungeonMind.tsx`
- [x] T036 [P] Remove legacy color references from `src/components/AboutDungeonMind.css`

**Verification**:
- [x] T037 Run `pnpm lint` and fix any errors (no TypeScript/linting errors)
- [ ] T038 Verify Home page displays UnifiedHeader at `/`
- [ ] T039 Verify NavigationDrawer opens when clicking hamburger menu
- [ ] T040 Verify AppLinks cards have parchment background + blue border
- [ ] T041 Verify About sections use Mantine Paper styling
- [ ] T042 Verify Balgruf font used for headings (DevTools → Computed → font-family)
- [ ] T043 Test responsive layout at 320px, 768px, 1280px widths
- [ ] T044 Test login/logout works from Home page header

**Checkpoint**: Home page complete - can be demoed independently

---

## Phase 5: Blog Modernization

**Purpose**: Add UnifiedHeader to Blog routes, restyle with theme

**Contributes to**: US1 (Navigation), US2 (Visual Identity), US5 (Auth Continuity)

**Goal**: Blog matches DungeonMind aesthetic with readable article layout

**Independent Test**: Navigate to `/blog` and `/blog/:id` - verify headers match Home page

### BlogList Updates

- [x] T045 Add UnifiedHeader import to `src/Blog/BlogList.tsx`
- [x] T046 Add UnifiedHeader component at top of BlogList in `src/Blog/BlogList.tsx`
- [x] T047 Import Mantine Container, Card, Title, Text, Group from `@mantine/core` in `src/Blog/BlogList.tsx`
- [x] T048 Wrap content in Mantine Container in `src/Blog/BlogList.tsx`
- [x] T049 Replace post preview cards with Mantine Card pattern in `src/Blog/BlogList.tsx`

### BlogPost Updates

- [x] T050 [P] Add UnifiedHeader import to `src/Blog/BlogPost.tsx`
- [x] T051 [P] Add UnifiedHeader component at top of BlogPost in `src/Blog/BlogPost.tsx`
- [x] T052 [P] Import Mantine Container, Paper, Title from `@mantine/core` in `src/Blog/BlogPost.tsx`
- [x] T053 [P] Wrap article content in Mantine Paper with parchment background in `src/Blog/BlogPost.tsx`

### Blog CSS Cleanup

- [x] T054 Remove all legacy color variables from `src/Blog/Blog.css`
- [x] T055 Replace hardcoded colors with Mantine CSS variables in `src/Blog/Blog.css`
- [x] T056 Add max-width: 800px and good line-height for readability in `src/Blog/Blog.css`

**Verification**:
- [x] T057 Run `pnpm lint` and fix any errors (no TypeScript errors)
- [ ] T058 Verify `/blog` displays UnifiedHeader
- [ ] T059 Verify `/blog/:id` displays UnifiedHeader
- [ ] T060 Verify blog cards use parchment + blue border pattern
- [ ] T061 Verify headings use Balgruf font
- [ ] T062 Verify article content readable on mobile (320px)
- [ ] T063 Test login/logout works from Blog pages

**Checkpoint**: Blog pages complete - Home + Blog demoed together

---

## Phase 6: Generator Integration (CardGenerator + RulesLawyer)

**Purpose**: Add UnifiedHeader with toolbox to remaining generators

**Contributes to**: US1 (Navigation), US4 (Generator Toolbox), US5 (Auth Continuity)

**Goal**: All generators have consistent toolbox-enabled headers

**Independent Test**: Open CardGenerator and RulesLawyer - verify toolbox dropdowns work

### RulesLawyer Toolbox Config (CREATE)

- [x] T064 Create `src/components/RulesLawyer/rulesLawyerToolboxConfig.tsx` (new file)
- [x] T065 Define RulesLawyerToolboxConfigProps interface in `rulesLawyerToolboxConfig.tsx`
- [x] T066 Implement createRulesLawyerToolboxSections function with:
  - Embedding selector control
  - Clear chat button
  - Help/tutorial link

### RulesLawyer Integration

- [x] T067 Import UnifiedHeader and toolbox config in `src/components/RulesLawyer/index.tsx`
- [x] T068 Add toolbox sections state and wire to UnifiedHeader in `src/components/RulesLawyer/index.tsx`
- [x] T069 Remove standalone h1 element (header shows title) in `src/components/RulesLawyer/index.tsx`
- [x] T070 Replace legacy colors with Mantine tokens in `src/components/RulesLawyer/RulesLawyer.css`
- [x] T071 Style chat interface with parchment feel in `src/components/RulesLawyer/RulesLawyer.css`

### CardGenerator Toolbox Config (CREATE)

- [x] T072 [P] Create `src/components/CardGenerator/cardToolboxConfig.tsx` (new file)
- [x] T073 [P] Define CardToolboxConfigProps interface in `cardToolboxConfig.tsx`
- [x] T074 [P] Implement createCardToolboxSections function with:
  - Step navigation controls
  - Save status indicator
  - Projects button (if applicable)

### CardGenerator Integration

- [x] T075 Import UnifiedHeader and toolbox config in `src/components/CardGenerator/CardGenerator.tsx`
- [x] T076 Replace FloatingHeader import with UnifiedHeader in `CardGenerator.tsx`
- [x] T077 Wire toolbox sections to UnifiedHeader in `CardGenerator.tsx`
- [x] T078 Remove any remaining 80px margin logic in `CardGenerator.tsx`

**Verification**:
- [x] T079 Run `pnpm lint` and fix any errors (no TypeScript errors)
- [ ] T080 Verify `/ruleslawyer` displays UnifiedHeader with toolbox
- [ ] T081 Verify `/cardgenerator` displays UnifiedHeader with toolbox
- [ ] T082 Verify toolbox dropdowns open and display controls
- [ ] T083 Verify step navigation works via toolbox (CardGenerator)
- [ ] T084 Verify clear chat works via toolbox (RulesLawyer)
- [ ] T085 Verify auth state visible in header on both pages
- [ ] T086 Test login/logout works from generator pages

**Checkpoint**: All generators have unified headers - all routes demoed together

---

## Phase 7: Cleanup & Polish

**Purpose**: Delete dead code, comprehensive testing, final validation

**Contributes to**: All user stories (final validation)

### Dead Code Removal

- [x] T087 Delete `src/components/NavBar.tsx`
- [x] T088 Delete `src/components/CardGenerator/FloatingHeader.tsx`
- [x] T089 Remove any NavBar imports that may remain across codebase
- [x] T090 Remove any FloatingHeader imports that may remain (CardGenerator.tsx cleaned)

### CSS Cleanup

- [x] T091 Search and remove any remaining legacy color `#4a4e69` references: `grep -r "#4a4e69" src/` (none found)
- [x] T092 Search and remove any remaining `margin-left: 80px` references: `grep -r "margin-left: 80px" src/` (none found)
- [x] T093 Remove orphaned CSS selectors that targeted NavBar
- [x] T094 Consolidate duplicate CSS patterns if any emerged

### Comprehensive Route Testing

- [ ] T095 Test Home (`/`) - UnifiedHeader, styled sections, navigation works
- [ ] T096 Test Blog List (`/blog`) - UnifiedHeader, styled cards, navigation works
- [ ] T097 Test Blog Post (`/blog/:id`) - UnifiedHeader, styled article, navigation works
- [ ] T098 Test RulesLawyer (`/ruleslawyer`) - UnifiedHeader with toolbox, controls work
- [ ] T099 Test CardGenerator (`/cardgenerator`) - UnifiedHeader with toolbox, step nav works
- [ ] T100 Test StatblockGenerator (`/statblockgenerator`) - Unchanged, still works perfectly
- [ ] T101 Test CharacterGenerator (`/playercharactergenerator`) - Unchanged, still works perfectly

### Responsive Testing

- [ ] T102 Test all routes at 320px width (mobile)
- [ ] T103 Test all routes at 480px width (large mobile)
- [ ] T104 Test all routes at 768px width (tablet)
- [ ] T105 Test all routes at 1024px width (small desktop)
- [ ] T106 Test all routes at 1280px width (desktop)
- [ ] T107 Test all routes at 1920px width (large desktop)

### Accessibility Testing

- [ ] T108 Test keyboard navigation - Tab through header controls on all routes
- [ ] T109 Verify focus indicators visible on all interactive elements
- [ ] T110 Verify color contrast acceptable (parchment + dark text)

### Authentication Persistence Testing

- [ ] T111 Log in on StatblockGenerator
- [ ] T112 Navigate: STG → Home → Blog → CardGenerator → RulesLawyer → Home → STG
- [ ] T113 Verify auth state persisted across all 6 navigations
- [ ] T114 Test logout works from any page
- [ ] T115 Test login works from any page

### Final Verification

- [x] T116 Run `pnpm lint` - zero errors (all files pass lint checks)
- [x] T117 Run `grep -r "NavBar" src/` - no functional references remain (only comments)
- [x] T118 Run `grep -r "FloatingHeader" src/` - no functional references remain (CardGeneratorRefactored.tsx not in use)
- [ ] T119 Open browser DevTools Console on each route - zero errors
- [ ] T120 Verify page load under 3 seconds (DevTools Performance tab)

**Checkpoint**: Feature complete - ready for merge

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup)           → No dependencies
    ↓
Phase 2 (CSS Foundation)  → Depends on Phase 1
    ↓
Phase 3 (App.tsx)         → Depends on Phase 2 ⚠️ BLOCKING
    ↓
┌───────────────────────────────────────────┐
│ Phases 4, 5, 6 can proceed in parallel    │
│ after Phase 3 completes                   │
├───────────────────────────────────────────┤
│ Phase 4 (Home)      - Independent         │
│ Phase 5 (Blog)      - Independent         │
│ Phase 6 (Generators) - Independent        │
└───────────────────────────────────────────┘
    ↓
Phase 7 (Polish)          → Depends on Phases 4, 5, 6
```

### Within Each Phase

- Read tasks (T001-T004) before modify tasks
- CSS cleanup before component changes
- Component changes before verification
- Verification must pass before moving to next phase

### Parallel Opportunities

**Phase 4 (Home)**: T026-T036 can all run in parallel (different files)  
**Phase 5 (Blog)**: T050-T053 can run in parallel (different files)  
**Phase 6 (Generators)**: T064-T066 and T072-T074 can run in parallel (different files)

---

## Parallel Example: Phase 4 Home Page

```bash
# All these can run simultaneously (different files):
T026: Import Mantine in AppLinks.tsx
T030: Import Mantine in AboutMe.tsx  
T033: Import Mantine in AboutDungeonMind.tsx
T028: Update AppLinks.css
T036: Update AboutDungeonMind.css
```

---

## Implementation Strategy

### MVP First (Phases 1-4 Only)

1. Complete Phase 1: Setup (read patterns)
2. Complete Phase 2: CSS Foundation
3. Complete Phase 3: App.tsx Simplification ⚠️ BLOCKING
4. Complete Phase 4: Home Page
5. **STOP and VALIDATE**: Home page has UnifiedHeader + styled sections
6. Deploy/demo Home page improvement

### Incremental Delivery

1. Setup + Foundational (Phases 1-3) → Foundation ready
2. Add Home Page (Phase 4) → Demo MVP
3. Add Blog (Phase 5) → Demo expanded coverage
4. Add Generators (Phase 6) → Demo complete site
5. Polish (Phase 7) → Production ready

### Commit Strategy

| Phase | Commit Message |
|-------|----------------|
| 2 | `chore(css): remove legacy :root declarations and conflicting styles` |
| 3 | `refactor(app): remove NavBar and conditional margin logic` |
| 4 | `feat(home): add UnifiedHeader and modernize home page sections` |
| 5 | `feat(blog): add UnifiedHeader and apply DungeonMind theming` |
| 6 | `feat(generators): add UnifiedHeader with toolbox to CardGenerator and RulesLawyer` |
| 7 | `chore(cleanup): delete NavBar, FloatingHeader, and legacy CSS patterns` |

---

## Notes

- **No unit tests**: This is a visual/CSS refactor. Testing is manual browser verification.
- **[P] tasks**: Different files, no dependencies - can run in parallel.
- **Verification tasks**: Run after implementation tasks in each phase.
- **Commit after each phase**: Each phase is a stable increment.
- **STG/PCG untouched**: FR-009 requires no changes to StatblockGenerator or PlayerCharacterGenerator.
- **data-tutorial preservation**: Check before deleting any file: `grep -r "data-tutorial" <file>`

