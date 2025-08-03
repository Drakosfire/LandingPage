# CardGenerator Component

A comprehensive React component for creating custom D&D-style item cards through a structured 5-step workflow. This component integrates AI-powered text generation, image generation, and custom text rendering to produce high-quality, visually appealing trading card-style items.

## 🎯 Overview

The CardGenerator provides a complete card creation experience with:
- **5-Step Workflow**: Guided process from text generation to final card
- **AI Integration**: GPT-4 for text generation, Fal.ai for image generation
- **Project Management**: Save, load, and manage multiple card projects
- **State Persistence**: Real-time auto-save with manual save options
- **Responsive Design**: Mobile-first approach with touch-friendly interface

## 📁 Project Structure

```
CardGenerator/
├── shared/                    # Reusable components
│   ├── ImageModal.tsx        # Expandable image modal
│   ├── ClickableImage.tsx    # Clickable image component
│   ├── useImageModal.tsx     # Modal state management hook
│   └── README.md            # Shared components documentation
├── steps/                    # Individual workflow steps
│   ├── Step1TextGeneration.tsx
│   ├── Step2CoreImage.tsx
│   ├── Step3BorderGeneration.tsx
│   ├── Step4CardBack.tsx
│   └── Step5FinalAssembly.tsx
├── hooks/                    # Custom React hooks
├── ImageGenerationSection/   # Image generation components
├── TextGenerationSection/    # Text generation components
├── CardWithText/            # Final card rendering components
├── CardTemplateSection/      # Template selection components
├── CardGenerator.tsx         # Main component (1261 lines)
├── CardGeneratorProvider.tsx # Context provider
├── ProjectsDrawer.tsx        # Project management UI
├── FloatingHeader.tsx        # Navigation header
├── StepNavigation.tsx        # Step progression UI
├── CreateProjectModal.tsx    # Project creation modal
├── DeleteConfirmationModal.tsx
├── ProjectCard.tsx          # Project card component
└── CardGenerator.integration.test.tsx
```

## 🚀 Features

### Core Functionality
- ✅ **Five-Step Workflow**: Complete implementation with step validation
- ✅ **AI Text Generation**: GPT-4 integration with structured output
- ✅ **Image Generation**: Fal.ai integration for core and border images
- ✅ **Text Rendering**: PIL-based text composition with custom fonts
- ✅ **Project Management**: Full CRUD operations with real-time persistence
- ✅ **State Persistence**: Auto-save with manual save options
- ✅ **Generation Lock System**: Prevents navigation during async operations
- ✅ **Shared Component System**: Reusable image modal and gallery components

### User Experience
- ✅ **Responsive Design**: Mobile and desktop optimization
- ✅ **Visual Feedback**: Loading states and progress indicators
- ✅ **Error Recovery**: Graceful handling of failures
- ✅ **Cross-Session Continuity**: Seamless experience across restarts
- ✅ **Project Organization**: Search, filter, and metadata management

## 🔧 Technical Architecture

### State Management
```typescript
interface CardGeneratorState {
  currentStepId: string;
  stepCompletion: Record<string, boolean>;
  itemDetails: ItemDetails;
  selectedAssets: {
    finalImage?: string;
    border?: string;
    seedImage?: string;
    generatedCardImages: string[];
    selectedGeneratedCardImage?: string;
    finalCardWithText?: string;
    templateBlob?: string;
  };
  generatedContent: {
    images: GeneratedImage[];
    renderedCards: RenderedCard[];
  };
  autoSaveEnabled: boolean;
  lastSaved?: string;
}
```

### Generation Lock System
Prevents navigation and project switching during async operations:
```typescript
const generationLocks = {
  textGeneration: false,      // Step 1: ItemForm text generation
  coreImageGeneration: false, // Step 2: CoreImageGallery image generation  
  borderGeneration: false,    // Step 3: Step3BorderGeneration card generation
  finalCardGeneration: false  // Step 5: CardWithTextGallery final card generation
};
```

### Project Management
- **Auto-Save**: Real-time state persistence with debouncing
- **Project Switching**: Seamless navigation between projects
- **CRUD Operations**: Create, read, update, delete projects
- **Search & Filter**: Find projects by name or description
- **Metadata**: Creation date, last modified, card count

## 📋 Workflow Steps

### Step 1: Text Generation
**Component**: `Step1TextGeneration.tsx`
- AI-powered item description generation
- GPT-4 structured output with JSON validation
- Complete item data structure generation

### Step 2: Core Image Generation
**Component**: `Step2CoreImage.tsx`
- Generate base item images using AI
- Uses SD prompt from Step 1 for thematic consistency
- Multiple core image variants for selection

### Step 3: Border Generation
**Component**: `Step3BorderGeneration.tsx`
- Apply borders and generate final card variants
- Border template selection (7 predefined styles)
- AI-powered card generation with Flux-LoRA
- 4 generated card variants per request

### Step 4: Card Back Generation
**Component**: `Step4CardBack.tsx`
- Create professional card backs
- Standard templates, custom text, or AI-generated
- **Status**: UI implemented, backend integration pending

### Step 5: Final Assembly
**Component**: `Step5FinalAssembly.tsx`
- Render text on cards and finalize
- Dynamic text rendering with custom fonts
- Editable item details
- Download options (PNG, PDF)

## 🎨 Shared Components

### Image Modal System
Located in `shared/` directory:
- **ImageModal.tsx**: Expandable image modal with download functionality
- **ClickableImage.tsx**: Clickable image component with modal integration
- **useImageModal.tsx**: Custom hook for modal state management

**Features**:
- Responsive design with customizable sizes
- Download options with custom filenames
- Accessible with proper ARIA labels
- Consistent styling across all galleries

### Integration Status
- ✅ CoreImageGallery (example and generated images)
- ✅ CardWithTextGallery (final cards and examples)
- ✅ ImageGallery (generated card images)

## 🔌 API Integration

### Core Endpoints
- `POST /api/cardgenerator/generate-item-dict`: Text generation
- `POST /api/cardgenerator/generate-core-images`: Core image generation
- `POST /api/cardgenerator/generate-card-images`: Border card generation
- `POST /api/cardgenerator/render-card-text`: Final card composition

### Project Management
- `POST /api/cardgenerator/create-project`: Create new project
- `GET /api/cardgenerator/list-projects`: List user projects
- `GET /api/cardgenerator/project/{project_id}`: Load project
- `PUT /api/cardgenerator/project/{project_id}`: Update project
- `DELETE /api/cardgenerator/project/{project_id}`: Delete project

### Session Management
- `POST /api/cardgenerator/save-card-session`: Auto-save and manual save
- `GET /api/cardgenerator/load-card-session`: Session restoration
- `GET /api/cardgenerator/list-user-sessions`: User's session management

## 🎯 Usage

### Basic Implementation
```tsx
import CardGenerator from './CardGenerator';

function App() {
  return (
    <div className="app">
      <CardGenerator />
    </div>
  );
}
```

### With Custom Configuration
```tsx
import CardGenerator from './CardGenerator';

function App() {
  return (
    <div className="app">
      <CardGenerator 
        // Props are handled internally via context
      />
    </div>
  );
}
```

## 🧪 Testing

### Integration Tests
- **File**: `CardGenerator.integration.test.tsx`
- **Coverage**: End-to-end workflow testing
- **Focus**: User interactions and state management

### Test Coverage
- ✅ Step navigation and validation
- ✅ Project management operations
- ✅ State persistence and restoration
- ✅ Error handling and recovery
- ✅ Generation lock system

## 🚀 Development Guidelines

### Adding New Steps
1. Create step component in `steps/` directory
2. Add step to navigation in `StepNavigation.tsx`
3. Implement step validation logic
4. Add generation lock integration if needed
5. Update state management in main component

### Adding New Features
1. Follow existing component patterns
2. Implement proper error handling
3. Add loading states and progress indicators
4. Ensure responsive design
5. Update TypeScript interfaces
6. Add integration tests

### State Management
- Use React hooks for local state
- Implement proper cleanup in useEffect
- Handle async operations with proper error boundaries
- Maintain consistency with existing patterns

### Performance Optimization
- Debounce auto-save operations
- Lazy load image galleries
- Memoize expensive components
- Optimize re-renders with useCallback/useMemo

## 🔧 Configuration

### Environment Variables
```typescript
// config/index.ts
export const DUNGEONMIND_API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
```

### Theme Configuration
```typescript
// config/mantineTheme.ts
import { createTheme } from '@mantine/core';

export const dungeonMindTheme = createTheme({
  // Custom theme configuration
});
```

## 📊 Performance Metrics

### Current Performance
- **Bundle Size**: Optimized with code splitting
- **Load Time**: < 3 seconds on average
- **Memory Usage**: Efficient state management
- **Network Requests**: Debounced auto-save reduces API calls

### Optimization Strategies
- Lazy loading of step components
- Image optimization and caching
- Efficient state updates
- Debounced API calls

## 🐛 Troubleshooting

### Common Issues

#### Generation Lock Stuck
```typescript
// Check generation lock state
console.log('Generation locks:', generationLocks);

// Reset locks if needed
setGenerationLocks({
  textGeneration: false,
  coreImageGeneration: false,
  borderGeneration: false,
  finalCardGeneration: false
});
```

#### Project Loading Issues
```typescript
// Check project state
console.log('Current project:', currentProject);
console.log('Project state:', currentProjectState);

// Force refresh projects
await onRefreshProjects();
```

#### State Persistence Issues
```typescript
// Check auto-save status
console.log('Save status:', saveStatus);
console.log('Last saved:', lastSaved);

// Manual save
await handleSaveProject();
```

### Debug Mode
Enable debug logging by setting:
```typescript
localStorage.setItem('cardGeneratorDebug', 'true');
```

## 🔮 Future Enhancements

### Planned Features
1. **Card Back Integration**: Backend integration for Step 4
2. **Advanced Customization**: Custom themes and fonts
3. **Collaboration**: Share projects with others
4. **Templates**: Reusable project templates

### Technical Improvements
1. **Offline Support**: Service worker for offline functionality
2. **Real-time Collaboration**: WebSocket integration
3. **Advanced Analytics**: User behavior tracking
4. **Performance Monitoring**: Real-time performance metrics

## 📚 Additional Resources

- [Design Document](../DungeonMindServer/cardgenerator/CardGenerator_Design_Document.md)
- [API Documentation](../DungeonMindServer/routers/cardgenerator_router.py)
- [Type Definitions](../types/card.types.ts)
- [Shared Components](./shared/README.md)

## 🤝 Contributing

### Development Workflow
1. Create feature branch from main
2. Implement changes following existing patterns
3. Add comprehensive tests
4. Update documentation
5. Submit pull request

### Code Standards
- Follow TypeScript best practices
- Use Mantine components consistently
- Implement proper error handling
- Add comprehensive comments
- Maintain responsive design

### Testing Requirements
- Unit tests for new components
- Integration tests for workflow changes
- Performance testing for optimizations
- Accessibility testing for UI changes

---

**Last Updated**: December 2024  
**Version**: 2.0.0  
**Status**: Production Ready ✅ 