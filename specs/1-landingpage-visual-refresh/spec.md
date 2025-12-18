# Feature Specification: LandingPage Visual Refresh

**Feature Branch**: `1-landingpage-visual-refresh`  
**Created**: December 17, 2025  
**Status**: Draft  
**Input**: Complete LandingPage Visual Refresh - Adopt UnifiedHeader aesthetic across all routes

## Overview

Unify the visual design of the entire LandingPage application to match the polished aesthetic established by StatblockGenerator and PlayerCharacterGenerator. This involves replacing the legacy NavBar sidebar navigation with the UnifiedHeader component, removing conflicting CSS variables, and applying consistent Mantine theming with parchment textures and Balgruf typography across all routes.

## Clarifications

### Session 2025-12-17

- Q: What behavior during font loading race conditions? → A: FOUT - Show system font fallback immediately, swap to Balgruf when loaded
- Q: What accessibility standard applies? → A: WCAG 2.1 AA compliance (color contrast, keyboard nav, focus indicators)
- Q: What browser support scope? → A: Modern + mobile browsers (Chrome, Firefox, Safari, Edge last 2 versions + iOS Safari 14+, Chrome Android)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Consistent Navigation Experience (Priority: P1)

As a user navigating between DungeonMind tools, I want a consistent header and navigation experience across all pages so that I feel like I'm using a cohesive application rather than disconnected tools.

**Why this priority**: Navigation is the primary way users move through the application. Inconsistent navigation creates confusion and makes the product feel unpolished.

**Independent Test**: Can be fully tested by navigating between any two routes (e.g., Home → CardGenerator → StatblockGenerator) and verifying the header appearance and navigation drawer behavior is identical.

**Acceptance Scenarios**:

1. **Given** I am on the Home page, **When** I click the hamburger menu, **Then** I see the NavigationDrawer slide in from the left with all tool links
2. **Given** I am on any page (Blog, CardGenerator, RulesLawyer), **When** I look at the header, **Then** I see the same UnifiedHeader style as StatblockGenerator
3. **Given** I am on CardGenerator, **When** I navigate to Home, **Then** there is no layout shift or jarring visual change in the header area

---

### User Story 2 - Unified Visual Identity (Priority: P1)

As a user viewing the LandingPage, I want all pages to share a consistent medieval/parchment aesthetic so that the brand identity is clear and the experience feels premium.

**Why this priority**: Visual consistency directly impacts perceived quality and trust. Mixed aesthetics make the product feel incomplete.

**Independent Test**: Can be tested by visiting each route and visually comparing color palette, typography, and card styling against the reference (StatblockGenerator).

**Acceptance Scenarios**:

1. **Given** I visit the Home page, **When** I view the app link cards, **Then** they use parchment backgrounds with blue borders matching the DungeonMind theme
2. **Given** I visit the Blog listing, **When** I view blog post cards, **Then** they use Balgruf font for headings and parchment card styling
3. **Given** I visit any page, **When** I inspect headings, **Then** they use the Balgruf font family consistently

---

### User Story 3 - Full-Width Layout (Priority: P2)

As a user viewing content, I want pages to use the full browser width (no fixed sidebar margin) so that content is centered and readable on all screen sizes.

**Why this priority**: The 80px left margin from the legacy NavBar wastes screen real estate and creates awkward layouts on smaller screens.

**Independent Test**: Can be tested by resizing browser window and verifying content is centered with no unexplained left margin.

**Acceptance Scenarios**:

1. **Given** I am on any page, **When** I view the layout, **Then** there is no 80px left margin from a fixed sidebar
2. **Given** I resize my browser window, **When** content reflows, **Then** it remains centered within the viewport
3. **Given** I am on a generator page (CardGenerator), **When** I use the toolbox, **Then** it appears in the UnifiedHeader dropdown, not a floating element

---

### User Story 4 - Generator Toolbox Integration (Priority: P2)

As a user of CardGenerator or RulesLawyer, I want tool-specific controls in the UnifiedHeader toolbox so that I have the same efficient workflow as StatblockGenerator.

**Why this priority**: Toolbox integration provides consistent UX patterns across generators and removes one-off UI elements.

**Independent Test**: Can be tested by opening CardGenerator, clicking the Toolbox dropdown, and verifying step navigation and save controls are present.

**Acceptance Scenarios**:

1. **Given** I am on CardGenerator, **When** I click the Toolbox dropdown, **Then** I see step navigation controls
2. **Given** I am on RulesLawyer, **When** I click the Toolbox dropdown, **Then** I see chat controls (clear, embedding selector)
3. **Given** I am on the Home page, **When** I look at the header, **Then** there is no Toolbox dropdown (only navigation and auth)

---

### User Story 5 - Authentication Continuity (Priority: P1)

As a logged-in user, I want my authentication state to persist as I navigate between pages so that I don't have to re-login when switching tools.

**Why this priority**: Authentication is critical functionality that must not regress during the visual refresh.

**Independent Test**: Can be tested by logging in on StatblockGenerator, navigating to Home, then to CardGenerator, and verifying auth state persists throughout.

**Acceptance Scenarios**:

1. **Given** I am logged in on StatblockGenerator, **When** I navigate to Home, **Then** I remain logged in
2. **Given** I am logged in on any page, **When** I click the user avatar in UnifiedHeader, **Then** I see logout option
3. **Given** I am logged out, **When** I navigate between pages, **Then** I see consistent login button in UnifiedHeader

---

### Edge Cases

- **Font loading**: System font fallback displays immediately; Balgruf swaps in when loaded (FOUT behavior acceptable)
- How does the layout handle when NavigationDrawer is open and user resizes window?
- What happens if a user has cached old CSS (cache invalidation)?
- How do mobile viewports (< 768px) display the UnifiedHeader?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display UnifiedHeader on all routes (Home, Blog, BlogPost, RulesLawyer, CardGenerator)
- **FR-002**: System MUST NOT display the legacy NavBar sidebar on any route
- **FR-003**: System MUST provide NavigationDrawer access via hamburger menu on all pages
- **FR-004**: System MUST use Mantine theme tokens for all colors (no hardcoded legacy palette)
- **FR-005**: System MUST use Balgruf font for all headings (H1, H2, H3)
- **FR-006**: System MUST remove the 80px left margin from all page layouts
- **FR-007**: CardGenerator MUST have a toolbox configuration in UnifiedHeader
- **FR-008**: RulesLawyer MUST have a toolbox configuration in UnifiedHeader
- **FR-009**: System MUST preserve existing functionality of StatblockGenerator and PlayerCharacterGenerator (no changes)
- **FR-010**: System MUST preserve all `data-tutorial` attributes when migrating components
- **FR-011**: System MUST preserve authentication state across all navigation
- **FR-012**: Blog post cards MUST use parchment background with blue border styling
- **FR-013**: AppLinks cards MUST use parchment background with blue border styling
- **FR-014**: System MUST be responsive across mobile (< 768px), tablet (768-1024px), and desktop (> 1024px) viewports
- **FR-015**: System MUST use font-display: swap for Balgruf font to show system fallback immediately during loading
- **FR-016**: System MUST meet WCAG 2.1 AA compliance for color contrast ratios (minimum 4.5:1 for normal text, 3:1 for large text)
- **FR-017**: System MUST support full keyboard navigation for NavigationDrawer and all interactive elements
- **FR-018**: System MUST display visible focus indicators on all interactive elements

### Key Entities

- **UnifiedHeader**: The standard header component with navigation drawer trigger, page title, optional toolbox, save status, and auth controls
- **NavigationDrawer**: Slide-out navigation panel with links to all DungeonMind tools
- **ToolboxConfig**: Configuration object defining dropdown sections for generator-specific controls
- **Mantine Theme**: Design token system defining colors, fonts, and spacing

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All 7 routes display UnifiedHeader with no visual differences in header styling
- **SC-002**: Zero instances of legacy NavBar component in rendered DOM across all routes
- **SC-003**: Zero instances of legacy color variables (--primary-color: #4a4e69) in computed styles
- **SC-004**: All heading elements use Balgruf font-family
- **SC-005**: Page content is horizontally centered with no unexplained left margins
- **SC-006**: Authentication state persists across 10 consecutive page navigations
- **SC-007**: All existing StatblockGenerator and PlayerCharacterGenerator functionality works unchanged
- **SC-008**: Page load time remains under 3 seconds on desktop broadband
- **SC-009**: Layout functions correctly on viewports from 320px to 2560px width
- **SC-010**: Zero console errors related to missing components or undefined styles
- **SC-011**: All text/background color combinations pass WCAG 2.1 AA contrast requirements
- **SC-012**: NavigationDrawer and all header controls are fully operable via keyboard alone

## Assumptions

- The existing UnifiedHeader component in StatblockGenerator/PlayerCharacterGenerator is the reference implementation and does not need modification
- The Mantine theme configuration (`mantineTheme.ts`) contains all required design tokens
- The NavigationDrawer is already integrated within UnifiedHeader and functional
- Legacy NavBar can be safely deleted after migration (no external dependencies)
- FloatingHeader in CardGenerator can be safely deleted after migration
- Blog content is stored externally and only the display layer needs updating

## Constraints

- **Browser Support**: Modern evergreen browsers (Chrome, Firefox, Safari, Edge - last 2 versions) plus mobile browsers (iOS Safari 14+, Chrome Android). No IE11 or legacy browser support required.
- **No Polyfills**: CSS Grid, CSS variables, and modern JavaScript features can be used without polyfills

