# Feature Specification: PlayerCharacterGenerator

**Feature Branch**: `PlayerCharacterGenerator`  
**Created**: November 30, 2025  
**Status**: Draft  
**Input**: D&D 5e character generator with AI and manual creation workflows, Canvas-based rendering, SRD-compliant levels 1-3

## Overview

A full-featured D&D 5e character generator that enables users to create player characters through AI-assisted generation or step-by-step manual creation. The tool follows StatblockGenerator patterns, uses Canvas for rendering character sheets, and integrates with the DungeonMind ecosystem.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Manual Character Creation via Wizard (Priority: P1)

A player wants to create a new D&D 5e character from scratch using a guided step-by-step wizard. They make informed choices at each step: ability scores, race, class, background, and equipment. The character sheet updates live as they progress.

**Why this priority**: This is the core functionality - without manual character creation, there is no character generator. This delivers immediate value to players who want control over their character build.

**Independent Test**: Can be fully tested by completing all 6 wizard steps and generating a valid, playable level 1 character sheet.

**Acceptance Scenarios**:

1. **Given** a user on the CharacterGenerator page, **When** they click "Create New Character", **Then** they see the character creation wizard starting at Step 1 (Ability Scores)
2. **Given** a user in Step 1, **When** they select "Point Buy" and distribute 27 points across abilities, **Then** the system validates their allocation is exactly 27 points and enables progression to Step 2
3. **Given** a user in Step 2 (Race), **When** they select "Dwarf" and then "Hill Dwarf" subrace, **Then** the canvas preview shows racial bonuses (+2 CON, +1 WIS) applied to their base scores
4. **Given** a user completing all 6 steps with valid choices, **When** they click "Finalize Character", **Then** the system generates a complete, printable character sheet with all derived stats calculated correctly

---

### User Story 2 - AI-Assisted Character Generation (Priority: P2)

A player wants to quickly create a character from a concept description. They describe their character idea in natural language, and the AI generates a complete, SRD-compliant character that they can then customize.

**Why this priority**: AI generation significantly speeds up character creation and helps new players. However, manual creation must work first to provide fallback and validation reference.

**Independent Test**: Can be tested by entering a character concept and receiving a valid, editable character that passes all SRD validation rules.

**Acceptance Scenarios**:

1. **Given** a user on CharacterGenerator, **When** they click "Generate with AI" and enter "A grizzled dwarven fighter who survived the orc wars", **Then** the system generates a complete character matching the concept (Dwarf race, Fighter class, Soldier background)
2. **Given** AI-generated character data, **When** the generation completes, **Then** the character passes 100% of SRD validation rules (legal race/class/skill combinations)
3. **Given** an AI-generated character, **When** the user views it, **Then** they can navigate to any wizard step to modify specific choices while preserving AI selections in other areas

---

### User Story 3 - Character Portrait Generation (Priority: P3)

A player wants to generate a custom portrait for their character using AI image generation. They can describe appearance details or let the system infer from race/class choices.

**Why this priority**: Portraits enhance the character sheet but are not required for a functional character. This builds on the existing image generation infrastructure from StatblockGenerator.

**Independent Test**: Can be tested by generating a portrait for any character and seeing it rendered on the character sheet.

**Acceptance Scenarios**:

1. **Given** a user with a character in progress, **When** they open the Portrait Generation tab and click "Generate Portrait", **Then** the system creates a fantasy-style character portrait based on race, class, and appearance details
2. **Given** a generated portrait, **When** the user accepts it, **Then** the portrait appears in the character sheet header area
3. **Given** multiple portrait options, **When** the user clicks "Regenerate", **Then** they receive a new portrait with the same character parameters

---

### User Story 4 - Save and Load Characters (Priority: P2)

A player wants to save their character for later editing and be able to load previously created characters. Characters auto-save during creation to prevent data loss.

**Why this priority**: Essential for any practical use - players need to save work in progress and return to characters. Equally important as AI generation.

**Independent Test**: Can be tested by creating a character, closing the browser, reopening, and loading the saved character with all data intact.

**Acceptance Scenarios**:

1. **Given** a user creating a character, **When** they make changes to any wizard step, **Then** the system auto-saves to local storage within 2 seconds
2. **Given** a logged-in user, **When** they click "Save Project", **Then** the character is saved to cloud storage and appears in their Projects drawer
3. **Given** a user opening the Projects drawer, **When** they click on a saved character, **Then** the character loads with all choices, derived stats, and portrait intact

---

### User Story 5 - Character Leveling (1→2→3) (Priority: P3)

A player wants to level up their existing character from level 1 to level 2 or 3, making appropriate choices (HP increase, new features, subclass at level 3).

**Why this priority**: Extends the value of created characters but requires complete level 1 creation first. Subclass choice at level 3 is a critical D&D milestone.

**Independent Test**: Can be tested by taking a level 1 character through level-up process and verifying correct HP, features, and subclass options.

**Acceptance Scenarios**:

1. **Given** a level 1 character, **When** the user clicks "Level Up", **Then** they see the level 2 advancement options (HP roll or average, new features)
2. **Given** a level 2 character leveling to 3, **When** the class requires a subclass (e.g., Fighter), **Then** the user must select from available SRD subclasses before completing level-up
3. **Given** a completed level-up, **When** viewing the character sheet, **Then** all new features, increased HP, and updated spell slots (if applicable) are reflected

---

### User Story 6 - Export Character Sheet (Priority: P4)

A player wants to export their character as a PDF for printing or as JSON for backup/sharing.

**Why this priority**: Export is valuable but requires a complete character sheet rendering system first. PDF export reuses existing Canvas infrastructure.

**Independent Test**: Can be tested by exporting a completed character and verifying the output contains all character data in the expected format.

**Acceptance Scenarios**:

1. **Given** a completed character, **When** the user clicks "Export PDF", **Then** the system generates a printable multi-page character sheet PDF
2. **Given** a completed character, **When** the user clicks "Export JSON", **Then** the system downloads a JSON file containing all character data in the DungeonMindObject schema

---

### Edge Cases

- What happens when a user selects a background that grants a skill they already have from their class? → System prompts for replacement skill selection
- How does the system handle a user abandoning creation mid-wizard? → Auto-save preserves progress; user can resume from Projects
- What happens when AI generates an invalid character? → Auto-fix loop corrects SRD violations, or presents user with validation errors to resolve manually
- What happens when a user tries to level up without meeting prerequisites? → System blocks advancement and displays clear requirements
- How does the system handle browser refresh during creation? → LocalStorage auto-save restores state on page load

## Requirements *(mandatory)*

### Functional Requirements

#### Core Character Creation

- **FR-001**: System MUST support three ability score methods: Point Buy (27 points), Standard Array (15,14,13,12,10,8), and 4d6-drop-lowest rolling
- **FR-002**: System MUST enforce Point Buy constraints: minimum score 8, maximum score 15 (before racial bonuses), exactly 27 points spent
- **FR-003**: System MUST support all 9 SRD races with their subraces: Dwarf (Hill, Mountain), Elf (High, Wood), Halfling (Lightfoot, Stout), Human, Dragonborn, Gnome (Forest, Rock), Half-Elf, Half-Orc, Tiefling
- **FR-004**: System MUST support all 12 SRD classes: Barbarian, Bard, Cleric, Druid, Fighter, Monk, Paladin, Ranger, Rogue, Sorcerer, Warlock, Wizard
- **FR-005**: System MUST enforce class skill selection limits (e.g., Fighter chooses 2 from specific list of 8)
- **FR-006**: System MUST handle background skill duplicates by prompting for replacement skill selection
- **FR-007**: System MUST calculate all derived stats correctly: AC, HP, Initiative, Proficiency Bonus, Spell Save DC, Spell Attack Bonus

#### Validation

- **FR-008**: System MUST validate character completeness before allowing finalization (all required choices made)
- **FR-009**: System MUST display validation errors with clear messages indicating which step needs attention
- **FR-010**: System MUST enforce SRD rules for all choices (legal race/class/skill/equipment combinations only)

#### Canvas Rendering

- **FR-011**: System MUST render character sheet using Canvas components (following StatblockGenerator patterns)
- **FR-012**: Canvas MUST update live as user makes choices in the wizard
- **FR-013**: System MUST support multi-page character sheet layout for complete characters

#### AI Generation

- **FR-014**: System MUST accept natural language character concepts and generate SRD-compliant characters
- **FR-015**: AI-generated characters MUST pass all validation rules (auto-fix loop for corrections)
- **FR-016**: System MUST allow users to edit any aspect of an AI-generated character via the wizard

#### Project Management

- **FR-017**: System MUST auto-save character state to localStorage with 2-second debounce
- **FR-018**: System MUST sync saved characters to cloud storage for logged-in users
- **FR-019**: System MUST display saved characters in Projects drawer with load/delete options

#### Leveling

- **FR-020**: System MUST support character advancement from level 1 to level 2 to level 3
- **FR-021**: System MUST enforce subclass selection at the appropriate level for each class
- **FR-022**: System MUST correctly calculate HP increases (hit die roll/average + CON modifier)

#### Export

- **FR-023**: System MUST export characters as print-ready PDF documents
- **FR-024**: System MUST export characters as JSON in DungeonMindObject schema format

### Key Entities

- **Character**: The core entity representing a player character with abilities, race, class, background, equipment, features, and derived stats
- **Race**: Defines racial traits, ability bonuses, speed, size, languages, and subrace options
- **Class**: Defines hit die, saving throws, skill options, proficiencies, features by level, and subclass options
- **Background**: Defines skill proficiencies, tool proficiencies, languages, feature, and starting equipment
- **Spell**: Represents a spell with level, school, casting time, range, components, duration, and description (for spellcasting classes)
- **Equipment**: Represents items, weapons, and armor with properties relevant to character sheet display
- **CharacterProject**: Wrapper entity for save/load containing character data plus metadata (name, last modified, owner)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can create a complete level 1 character in under 10 minutes using the manual wizard
- **SC-002**: Users can generate an AI character from concept in under 30 seconds
- **SC-003**: 100% of finalized characters pass SRD validation rules (no illegal combinations)
- **SC-004**: Character sheet canvas renders within 500ms of any wizard step change
- **SC-005**: Auto-save triggers within 2 seconds of any user change (no data loss on browser close)
- **SC-006**: Users can level a character from 1→3 in under 5 minutes
- **SC-007**: Exported PDF is print-ready with correct formatting on standard US Letter paper
- **SC-008**: All 12 SRD classes are fully functional with correct features, skills, and equipment options
- **SC-009**: All 9 SRD races with all subraces apply correct bonuses and traits
- **SC-010**: Spellcasting classes correctly track cantrips known, spells known/prepared, and spell slots

## Assumptions

1. **Canvas Package**: The `dungeonmind-canvas` package is available and proven (from StatblockGenerator)
2. **SRD Data**: SRD data will be bundled as TypeScript files (not fetched from external API) for type safety and offline capability
3. **Authentication**: Existing AuthContext from DungeonMind will handle logged-in state for cloud save features
4. **Image Generation**: Portrait generation will use the same Stable Diffusion integration as StatblockGenerator
5. **Backend Endpoints**: New API endpoints will be added to DungeonMindServer for character generation and validation

## Out of Scope (Phase 2+)

- Multiclassing
- Levels 4-20
- Non-SRD content (Tasha's, Xanathar's, etc.)
- Feats
- In-game state tracking (current HP, spell slots used, etc.)
- Real-time collaboration
- 3D/VR character rendering

## Dependencies

- `dungeonmind-canvas` package for character sheet rendering
- DungeonMindServer for AI generation endpoints
- Stable Diffusion integration for portrait generation
- Firebase/Firestore for cloud save
- Existing LandingPage infrastructure (Auth, navigation, theme)

## Related Documents

- [CHARACTER_GENERATOR_DESIGN.md](/Docs/ProjectDiary/2025/CharacterGenerator/CHARACTER_GENERATOR_DESIGN.md) - Detailed architecture and implementation plan
- [CHARACTER_CREATION_ALGORITHM.md](/Docs/ProjectDiary/2025/CharacterGenerator/CHARACTER_CREATION_ALGORITHM.md) - Step-by-step character creation algorithm
- StatblockGenerator source code - Reference implementation for Canvas patterns

