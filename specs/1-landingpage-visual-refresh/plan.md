# Implementation Plan: LandingPage Visual Refresh

**Branch**: `1-landingpage-visual-refresh` | **Date**: December 17, 2025 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/1-landingpage-visual-refresh/spec.md`

## Summary

Unify the entire LandingPage visual design by:
1. Removing the legacy NavBar sidebar and conflicting CSS
2. Adopting UnifiedHeader across all routes (Home, Blog, CardGenerator, RulesLawyer)
3. Applying consistent Mantine theming with parchment textures and Balgruf typography
4. Creating toolbox configurations for generators that don't have them yet

## Technical Context

**Language/Version**: TypeScript 5.x, React 18+  
**Primary Dependencies**: Mantine UI 7.x, React Router, @tabler/icons-react  
**Storage**: N/A (no data model changes)  
**Testing**: Manual visual testing + pnpm lint  
**Target Platform**: Modern browsers (Chrome, Firefox, Safari, Edge last 2 versions) + iOS Safari 14+, Chrome Android  
**Project Type**: Web application (frontend-only changes)  
**Performance Goals**: Page load < 3 seconds, no layout shift  
**Constraints**: WCAG 2.1 AA compliance, FOUT font loading, no changes to StatblockGenerator or PlayerCharacterGenerator  
**Scale/Scope**: 7 routes, ~15 files modified, 2-3 files created, 2 files deleted

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Compliance | Notes |
|-----------|------------|-------|
| I. Empirical Verification | ✅ | Visual testing in browser after each phase; linter runs |
| II. Documentation-First | ✅ | This plan + handoff document complete before implementation |
| III. Test-First | ⚠️ | Visual changes - manual testing; no unit test changes needed |
| IV. Service Boundaries | ✅ | Frontend-only changes, no cross-service impacts |
| V. Contract-Driven | ✅ | UnifiedHeader props interface already defined; toolbox configs follow existing pattern |
| VI. Phased Implementation | ✅ | 6 phases, each 2-4 hours with clear deliverables |
| VII. Simplicity | ✅ | Reusing existing UnifiedHeader, theme, patterns - no new abstractions |

**Note**: Test-First (III) marked ⚠️ because this is a visual/CSS refactor. Testing is empirical via browser + linter, not unit tests.

## Project Structure

### Documentation (this feature)

```text
specs/1-landingpage-visual-refresh/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 output (minimal - patterns already known)
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── contracts/           # N/A - using existing UnifiedHeader interface
```

### Source Code (files to modify)

```text
src/
├── App.tsx                              # Remove ConditionalNavBar, simplify MainContent
├── styles/App.css                       # Remove legacy :root, 80px margin
├── Blog/
│   ├── Blog.css                         # Remove :root, restyle with Mantine tokens
│   ├── BlogList.tsx                     # Add UnifiedHeader
│   └── BlogPost.tsx                     # Add UnifiedHeader
├── components/
│   ├── NavBar.tsx                       # DELETE after migration
│   ├── AppLinks.tsx                     # Restyle cards with Mantine
│   ├── AppLinks.css                     # Use parchment + blue border pattern
│   ├── AboutMe.tsx                      # Restyle with Mantine Paper
│   ├── AboutDungeonMind.tsx             # Restyle, update content
│   ├── CardGenerator/
│   │   ├── CardGeneratorRefactored.tsx  # Replace FloatingHeader with UnifiedHeader
│   │   ├── FloatingHeader.tsx           # DELETE after migration
│   │   └── cardToolboxConfig.tsx        # CREATE - toolbox for CardGenerator
│   └── RulesLawyer/
│       ├── index.tsx                    # Add UnifiedHeader
│       ├── RulesLawyer.css              # Restyle with Mantine tokens
│       └── rulesLawyerToolboxConfig.tsx # CREATE - toolbox for RulesLawyer
└── config/
    └── mantineTheme.ts                  # Reference only - no changes needed
```

**Structure Decision**: Frontend-only changes within existing architecture. No new directories needed.

## Complexity Tracking

No complexity violations. All changes:
- Reuse existing UnifiedHeader component (no modification needed)
- Follow existing toolbox config pattern (statblockToolboxConfig.tsx as reference)
- Use existing Mantine theme tokens
- Remove dead code (NavBar, FloatingHeader, legacy CSS)

---

## Implementation Phases

### Phase 0: CSS Foundation & Cleanup (2-3 hours)

**Goal**: Remove conflicting CSS, establish clean foundation for migration

**Prerequisites**: None (BLOCKING for subsequent phases)

**Tasks**:
1. Remove duplicate `:root` declarations from `Blog.css`
2. Update `App.css` `:root` to map legacy variables to Mantine tokens:
   ```css
   :root {
     --primary-color: var(--mantine-color-blue-4);
     --background-color: var(--mantine-color-parchment-3);
     --text-color: #333333;
   }
   ```
3. Remove Montserrat font-family declaration (Mantine theme handles fonts)
4. Remove 80px margin-left logic from `.main-content` (will be fully removed in Phase 1)

**Evidence Required**:
- [ ] `pnpm lint` passes
- [ ] No duplicate `:root` in codebase (`grep -r ":root" src/`)
- [ ] StatblockGenerator and PlayerCharacterGenerator still render correctly

**Commit**: `chore(css): remove legacy :root declarations and conflicting styles`

---

### Phase 1: App.tsx Simplification (2-3 hours)

**Goal**: Remove ConditionalNavBar, simplify layout architecture

**Prerequisites**: Phase 0 complete

**Tasks**:
1. Read `StatBlockGenerator.tsx` to confirm UnifiedHeader wiring pattern
2. Remove `ConditionalNavBar` component entirely from App.tsx
3. Remove `NavBar` import
4. Simplify `MainContent` wrapper - remove conditional margin logic
5. Remove all routes from NavBar exclusion list (no longer needed)

**Before**:
```tsx
<ConditionalNavBar />
<MainContent>
  <Routes>...</Routes>
</MainContent>
```

**After**:
```tsx
<MainContent>
  <Routes>...</Routes>
</MainContent>
```

**Evidence Required**:
- [ ] `pnpm lint` passes
- [ ] No 80px left margin on any page
- [ ] StatblockGenerator and PlayerCharacterGenerator still work
- [ ] NavigationDrawer still accessible from STG/PCG

**Commit**: `refactor(app): remove NavBar and conditional margin logic`

---

### Phase 2: Home Page Modernization (3-4 hours)

**Goal**: Add UnifiedHeader to home route, restyle sections

**Prerequisites**: Phase 1 complete

**Tasks**:
1. Add UnifiedHeader to home route in App.tsx:
   ```tsx
   <Route path="/" element={
     <>
       <UnifiedHeader 
         app={{ id: 'home', name: 'DungeonMind', icon: DM_LOGO_URL }}
         showAuth={true}
       />
       <AppLinks />
       <AboutMe />
       <AboutDungeonMind />
     </>
   } />
   ```

2. Restyle `AppLinks.tsx` and `AppLinks.css`:
   - Use CSS Grid for responsive card layout
   - Apply Mantine Card component with parchment/blue border pattern
   - Update hover effects to match theme

3. Restyle `AboutMe.tsx`:
   - Wrap content in Mantine Paper
   - Use Mantine Button for CTAs

4. Update `AboutDungeonMind.tsx`:
   - Wrap in Mantine Paper
   - Update content to reflect current features

**Evidence Required**:
- [ ] `pnpm lint` passes
- [ ] Home page displays UnifiedHeader
- [ ] AppLinks cards have parchment background + blue border
- [ ] About sections use Mantine Paper styling
- [ ] Grid layout responsive (320px - 2560px)
- [ ] Balgruf font used for headings

**Commit**: `feat(home): add UnifiedHeader and modernize home page sections`

---

### Phase 3: Blog Modernization (2-3 hours)

**Goal**: Add UnifiedHeader to Blog routes, restyle with theme

**Prerequisites**: Phase 2 complete

**Tasks**:
1. Modify `BlogList.tsx`:
   - Add UnifiedHeader with minimal config
   - Wrap content in Mantine Container
   - Use Mantine Card for post previews

2. Modify `BlogPost.tsx`:
   - Add UnifiedHeader
   - Style article with Mantine Typography
   - Parchment background for content area

3. Rewrite `Blog.css`:
   - Remove all `:root` declarations (already done in Phase 0)
   - Replace all legacy color variables with Mantine tokens
   - Style for readability (max-width: 800px, good line-height)

**Evidence Required**:
- [ ] `pnpm lint` passes
- [ ] `/blog` displays UnifiedHeader
- [ ] `/blog/:id` displays UnifiedHeader
- [ ] Blog cards use parchment + blue border pattern
- [ ] Headings use Balgruf font
- [ ] Content readable on mobile

**Commit**: `feat(blog): add UnifiedHeader and apply DungeonMind theming`

---

### Phase 4: Generator Integration (3-4 hours)

**Goal**: Add UnifiedHeader with toolbox to CardGenerator and RulesLawyer

**Prerequisites**: Phase 3 complete

**Tasks**:

#### RulesLawyer:
1. Create `rulesLawyerToolboxConfig.tsx`:
   - Embedding selector control
   - Clear chat button
   - Help/tutorial link
2. Modify `index.tsx`:
   - Add UnifiedHeader with toolbox
   - Remove standalone h1 (header shows title)
3. Update `RulesLawyer.css`:
   - Replace legacy colors with Mantine tokens
   - Style chat interface with parchment feel

#### CardGenerator:
1. Create `cardToolboxConfig.tsx`:
   - Step navigation controls (existing step state)
   - Projects button wiring
   - Save status indicator
2. Modify `CardGeneratorRefactored.tsx`:
   - Replace FloatingHeader import with UnifiedHeader
   - Wire toolbox sections
   - Remove any 80px margin logic

**Evidence Required**:
- [ ] `pnpm lint` passes
- [ ] `/ruleslawyer` displays UnifiedHeader with toolbox
- [ ] `/cardgenerator` displays UnifiedHeader with toolbox
- [ ] Toolbox dropdowns function correctly
- [ ] Step navigation works via toolbox (CardGenerator)
- [ ] Clear chat works via toolbox (RulesLawyer)
- [ ] Auth state visible in header

**Commit**: `feat(generators): add UnifiedHeader with toolbox to CardGenerator and RulesLawyer`

---

### Phase 5: Cleanup & Polish (2-3 hours)

**Goal**: Delete dead code, final consistency pass, comprehensive testing

**Prerequisites**: Phase 4 complete

**Tasks**:
1. Delete `NavBar.tsx`
2. Delete `FloatingHeader.tsx`
3. Clean up CSS files:
   - Remove any remaining unused selectors
   - Remove orphaned color variables
   - Consolidate common patterns if any emerged
4. Search for any remaining legacy patterns:
   ```bash
   grep -r "#4a4e69" src/        # Legacy primary color
   grep -r "margin-left: 80px" src/
   grep -r "NavBar" src/
   grep -r "FloatingHeader" src/
   ```

**Testing Checklist**:
- [ ] Home (`/`) - UnifiedHeader, styled sections
- [ ] Blog (`/blog`) - UnifiedHeader, styled cards
- [ ] Blog Post (`/blog/:id`) - UnifiedHeader, styled article
- [ ] RulesLawyer (`/ruleslawyer`) - UnifiedHeader with toolbox
- [ ] CardGenerator (`/cardgenerator`) - UnifiedHeader with toolbox
- [ ] StatblockGenerator (`/statblockgenerator`) - Unchanged, still works
- [ ] CharacterGenerator (`/playercharactergenerator`) - Unchanged, still works

**Responsive Testing**:
- [ ] Mobile (320px, 480px)
- [ ] Tablet (768px, 1024px)
- [ ] Desktop (1280px, 1920px, 2560px)

**Accessibility Testing**:
- [ ] Keyboard navigation works (Tab through header, Enter to activate)
- [ ] Focus indicators visible
- [ ] Color contrast acceptable (visual check)

**Evidence Required**:
- [ ] `pnpm lint` passes
- [ ] No legacy files remain
- [ ] No legacy CSS patterns in codebase
- [ ] All routes render correctly
- [ ] No console errors
- [ ] Auth state persists across navigation

**Commit**: `chore(cleanup): delete NavBar, FloatingHeader, and legacy CSS patterns`

---

## Risk Mitigation

### High Risk: Breaking StatblockGenerator or PlayerCharacterGenerator
**Mitigation**: 
- FR-009 explicitly excludes them from changes
- Test after each phase that they still work
- They already use UnifiedHeader - no changes needed

### Medium Risk: CSS Specificity Conflicts
**Mitigation**:
- Remove legacy `:root` first (Phase 0)
- Use Mantine's CSS-in-JS for new styles
- Grep for `!important` rules and eliminate

### Medium Risk: Forgotten data-tutorial Attributes
**Mitigation**:
- FR-010 requires preserving all data-tutorial attributes
- Search before deleting any file: `grep -r "data-tutorial" src/components/NavBar.tsx`
- Migrate attributes to new component locations

### Low Risk: Auth State Regression
**Mitigation**:
- UnifiedHeader already handles auth via `useAuth` hook
- Test login/logout after each phase
- SC-006 requires persistence across 10 navigations

---

## Success Verification

After Phase 5, verify all success criteria from spec:

| SC | Criteria | Verification Method |
|----|----------|---------------------|
| SC-001 | All 7 routes display UnifiedHeader | Visual inspection of each route |
| SC-002 | Zero NavBar instances in DOM | Browser DevTools search for "NavBar" |
| SC-003 | Zero legacy color variables | `grep -r "#4a4e69" src/` returns nothing |
| SC-004 | All headings use Balgruf | DevTools computed style inspection |
| SC-005 | Content horizontally centered | Visual + DevTools check for margin-left |
| SC-006 | Auth persists across navigation | Log in, navigate 10 times, verify state |
| SC-007 | STG/PCG unchanged | Full workflow test on each |
| SC-008 | Page load < 3 seconds | Chrome DevTools Performance tab |
| SC-009 | Responsive 320px - 2560px | Browser resize test |
| SC-010 | Zero console errors | DevTools Console on each route |
| SC-011 | WCAG AA contrast | Visual check (parchment/text combinations) |
| SC-012 | Keyboard navigation works | Tab through header controls |

---

## Reference Files

### Pattern Sources (read before implementing)
- `src/components/UnifiedHeader.tsx` - Header component API
- `src/components/StatBlockGenerator/statblockToolboxConfig.tsx` - Toolbox pattern
- `src/components/StatBlockGenerator/StatBlockGenerator.tsx` - UnifiedHeader wiring
- `src/config/mantineTheme.ts` - Design tokens

### Files to Delete (after migration complete)
- `src/components/NavBar.tsx`
- `src/components/CardGenerator/FloatingHeader.tsx`

### Handoff Reference
- `specs/HANDOFF-UnifiedHeader-Aesthetic-Adoption.md` - Detailed implementation guidance

