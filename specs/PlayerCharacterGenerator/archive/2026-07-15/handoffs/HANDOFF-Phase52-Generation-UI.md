# Handoff: Phase 5.2 - AI Generation UI
**Date:** 2025-12-14  
**Type:** Feature  
**Last Updated:** 2025-12-14  
**Status:** ✅ Implemented  

---

## 🎯 Goal

Create a **Generate tab** in the character drawer that lets users quickly create a complete character from a concept. Simple, friendly, clear about what's required.

**User Story:** "As a player, I want to describe my character concept and get a ready-to-play character sheet."

---

## 🎨 UI Design

### Tab Layout (3 tabs)

```
┌─────────────────────────────────────────────────────┐
│  [🎲 Generate]  [👤 Build]  [🖼️ Portrait]          │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Generate a Character                               │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │ What's your character concept?               │   │
│  │                                              │   │
│  │ A battle-hardened veteran seeking            │   │
│  │ redemption after a war gone wrong...         │   │
│  │                                              │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ────── Required ──────                            │
│                                                     │
│  Class *            Level *                         │
│  ┌─────────────┐   ┌───────────┐                   │
│  │ Fighter   ▼ │   │ 1  ▼      │                   │
│  └─────────────┘   └───────────┘                   │
│                                                     │
│  ────── Optional (we'll pick for you) ──────       │
│                                                     │
│  Race                Background                     │
│  ┌─────────────┐   ┌─────────────┐                 │
│  │ Random    ▼ │   │ Random    ▼ │                 │
│  └─────────────┘   └─────────────┘                 │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │     ✨ Generate My Character                 │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Loading State

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│     🎲 Creating Your Character...                  │
│                                                     │
│     ████████████████░░░░░░░░  65%                  │
│                                                     │
│     "Rolling ability scores..."                    │
│     "Selecting skills based on your concept..."    │
│     "Writing your backstory..."                    │
│                                                     │
│     ⏱️ Usually takes 30-60 seconds                 │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Success → Auto-switch to Build tab

After generation completes:
1. Character hydrates into context
2. Auto-switch to "Build" tab (step 7: Review)
3. Toast notification: "✨ Character created! Review and customize below."

✅ **Implemented behavior**
- Uses a lightweight local toast in `PlayerCharacterCreationDrawer.tsx` (not Mantine notifications).
- After success: switches tab to **Build** and sets `wizardStep = 7`.
- Also calls `clearCurrentProject()` before hydration to avoid autosave overwriting an existing project.

---

## 📋 Component Specification

### AIGenerationTab.tsx

```typescript
interface AIGenerationTabProps {
    onGenerationComplete?: () => void;  // Callback after success
}

// State
const [concept, setConcept] = useState('');
const [classId, setClassId] = useState<string>('');
const [level, setLevel] = useState<1 | 2 | 3>(1);
const [raceId, setRaceId] = useState<string | null>(null);  // null = random
const [backgroundId, setBackgroundId] = useState<string | null>(null);  // null = random
const [isGenerating, setIsGenerating] = useState(false);
const [error, setError] = useState<string | null>(null);
const [progress, setProgress] = useState({ percent: 0, message: '' });

// Validation
const canGenerate = concept.trim().length > 10 && classId !== '';

// Available options from RuleEngine
const classes = ruleEngine.getAvailableClasses();
const races = ruleEngine.getBaseRaceOptions();
const backgrounds = ruleEngine.getAvailableBackgrounds();
```

⚠️ **Backend v0 catalog filtering (important)**

Until frontend and backend catalogs fully align, the Generate tab filters Race/Background selects to IDs supported by backend PCG v0 to prevent errors like:

`{"detail":"Unknown backgroundId: noble"}`

Current v0 allowed IDs (Generate tab):
- **races**: `human`, `dwarf`, `elf`, `halfling`, `half-orc`
- **backgrounds**: `soldier`, `sage`, `criminal`, `acolyte`, `folk-hero`, `noble`

### Form Fields

| Field | Type | Required | Validation | Default |
|-------|------|----------|------------|---------|
| **Concept** | Textarea | ✅ Yes | min 10 chars | "" |
| **Class** | Select | ✅ Yes | must select | none |
| **Level** | Select | ✅ Yes | 1, 2, or 3 | 1 |
| **Race** | Select | ❌ Optional | - | "Random" |
| **Background** | Select | ❌ Optional | - | "Random" |

### Visual Cues for Required vs Optional

```tsx
{/* Required section */}
<Divider 
    label="Required" 
    labelPosition="center" 
    color="red.3"
/>
<Select
    label={<>Class <Text component="span" c="red" size="sm">*</Text></>}
    required
    ...
/>

{/* Optional section */}
<Divider 
    label="Optional (we'll pick for you)" 
    labelPosition="center" 
    color="gray.4"
/>
<Select
    label="Race"
    placeholder="Random"
    clearable
    ...
/>
```

---

## 🔌 API Integration

### Request

```typescript
const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    setProgress({ percent: 10, message: 'Starting generation...' });
    
    try {
        const response = await fetch(
            `${DUNGEONMIND_API_URL}/api/playercharactergenerator/generate`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    classId,
                    raceId: raceId || pickRandomRace(),
                    level,
                    backgroundId: backgroundId || pickRandomBackground(),
                    concept
                })
            }
        );
        
        if (!response.ok) {
            throw new Error(await response.text());
        }
        
        const { data } = await response.json();
        
        // Hydrate character into context
        setCharacter(data.character);
        
        // Switch to Build tab at Review step
        setActiveTab('creation');
        setWizardStep(7);  // Review step
        
        // Show success toast (implemented in drawer, not Mantine notifications)
        
        onGenerationComplete?.();
        
    } catch (err) {
        setError(err.message || 'Generation failed');
    } finally {
        setIsGenerating(false);
    }
};
```

### Progress Simulation

Since we don't have real progress events from the API, simulate progress:

```typescript
useEffect(() => {
    if (!isGenerating) return;
    
    const messages = [
        { at: 10, msg: 'Analyzing your concept...' },
        { at: 25, msg: 'Rolling ability scores...' },
        { at: 40, msg: 'Selecting skills and proficiencies...' },
        { at: 55, msg: 'Choosing equipment...' },
        { at: 70, msg: 'Writing backstory and personality...' },
        { at: 85, msg: 'Finalizing character sheet...' },
    ];
    
    let current = 0;
    const interval = setInterval(() => {
        current += 5;
        if (current >= 95) {
            clearInterval(interval);
            return;
        }
        
        // NOTE: `Array.findLast` avoided for runtime compatibility.
        // Implemented as a reverse loop to find the last milestone <= current.
    }, 2000);  // Update every 2s
    
    return () => clearInterval(interval);
}, [isGenerating]);
```

---

## 📁 Files to Create/Modify

### Create

```
LandingPage/src/components/PlayerCharacterGenerator/
└── creationDrawerComponents/
    └── AIGenerationTab.tsx          # NEW: Main generation tab component
```

### Modify

```
LandingPage/src/components/PlayerCharacterGenerator/
├── PlayerCharacterCreationDrawer.tsx  # ADD: Generate tab + handler
```

✅ **Note:** `PlayerCharacterGeneratorProvider.tsx` already had `setCharacter()`. No provider change required for Phase 5.2.

---

## 🧾 Debugging & Logs (Dev)

To speed tuning while backend/frontend are still evolving:

- **Frontend:** after success, `AIGenerationTab` stores the full request/response on:
  - `window.__PCG_LAST_GENERATED__`
  - and prints a collapsed console group with a summary of selected IDs/counts (weapons/equipment/features/spells).
- **Backend:** `/generate` logs a one-line payload summary:
  - counts: weapons/equipment/features/spells/cantrips
  - armor/shield
  - selected equipment package + feature choices

---

## 📋 Task Breakdown

### T080: Create AIGenerationTab.tsx (3h)

| Subtask | Description | Est |
|---------|-------------|-----|
| T080a | Create component skeleton with form layout | 30m |
| T080b | Add concept textarea with validation | 20m |
| T080c | Add Class/Level selects (required) | 30m |
| T080d | Add Race/Background selects (optional) | 30m |
| T080e | Style required vs optional sections | 20m |
| T080f | Add loading state with progress simulation | 30m |
| T080g | Add error handling and display | 20m |

### T081: Wire form to API (1h)

| Subtask | Description | Est |
|---------|-------------|-----|
| T081a | Implement handleGenerate with fetch | 30m |
| T081b | Handle random race/background defaults | 15m |
| T081c | Test end-to-end with live API | 15m |

### T082: Integrate with Provider (1h)

| Subtask | Description | Est |
|---------|-------------|-----|
| T082a | Add `setCharacter()` to Provider for hydration | 20m (Not needed — already present) |
| T082b | Auto-switch to Build tab after generation | 20m |
| T082c | Add success toast notification | 20m |

### T083: Add Generate tab to drawer (30m)

| Subtask | Description | Est |
|---------|-------------|-----|
| T083a | Add third tab to PlayerCharacterCreationDrawer | 15m |
| T083b | Reorder tabs: Generate → Build → Portrait | 15m |

---

## 🎨 Design Tokens

```tsx
// Colors
const REQUIRED_COLOR = 'red.6';      // Required field asterisk
const OPTIONAL_LABEL = 'gray.6';     // "Optional" divider
const GENERATE_BTN = 'violet';       // Generate button (matches AI theme)
const PROGRESS_COLOR = 'violet';     // Progress bar

// Sizes
const CONCEPT_MIN_ROWS = 4;          // Textarea rows
const CONCEPT_MAX_ROWS = 8;
const CONCEPT_MIN_LENGTH = 10;       // Minimum concept length
```

---

## 🧪 Testing

### Manual Test Cases

1. **Happy path**: Fill all fields → Generate → Character appears on canvas
2. **Required only**: Class + Level + Concept → Random race/background used
3. **Validation**: Try to generate with empty concept → Button disabled
4. **Error handling**: Kill API mid-request → Error message displayed
5. **Mobile**: Test on 375px viewport → Form remains usable

✅ **Backend verification**
- Added/updated backend unit tests for character builder completeness and slots.
- Ran: `uv run pytest playercharactergenerator/tests -q` (passes in current workspace).

### Automated (Future)

```typescript
it('disables generate button when concept is empty', () => {
    render(<AIGenerationTab />);
    expect(screen.getByText('Generate My Character')).toBeDisabled();
});

it('enables generate button when required fields are filled', () => {
    render(<AIGenerationTab />);
    fireEvent.change(screen.getByLabelText('Concept'), { target: { value: 'A warrior...' } });
    fireEvent.change(screen.getByLabelText('Class'), { target: { value: 'fighter' } });
    expect(screen.getByText('Generate My Character')).toBeEnabled();
});
```

---

## 🔮 Future Enhancements (Backlog)

- **Concept suggestions**: "Try: 'A scholarly wizard who...' | 'A rogue with a heart of gold...'"
- **Class synergy hints**: Show which races pair well with selected class
- **Generation history**: Show last 3 generated characters
- **Retry with variations**: "Generate another version of this concept"

---

## References

- **Phase 5.1 Handoff:** `HANDOFF-Phase51-Generation-Infrastructure.md`
- **Backend Endpoint:** `POST /api/playercharactergenerator/generate`
- **StatblockGenerator Pattern:** `TextGenerationTab.tsx`
- **Tasks:** `tasks.md` → Phase 5.2

