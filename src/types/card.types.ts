export interface ItemDetails {
    name: string;
    type: string;
    rarity: string;
    value: string;
    properties: string[];
    damageFormula: string;
    damageType: string;
    weight: string;
    description: string;
    quote: string;
    sdPrompt: string;
}

export interface TemplateImage {
    url: string;
    id: string;
}

export interface GeneratedImage {
    url: string;
    id: string;
}

export interface RenderedCard {
    url: string;
    id: string;
    timestamp: string;
}

export interface SelectedImage {
    url: string;
    id: string;
    alt: string;
}

// Project and Session Types
export interface Project {
    id: string;
    name: string;
    description: string;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
    lastModified: string;
    state: CardGeneratorState;
    metadata: {
        version: string;
        platform: string;
        [key: string]: any;
    };
}

export interface ProjectSummary {
    id: string;
    name: string;
    description: string;
    createdBy: string;
    lastModified: string;
    updatedAt: string;
    cardCount: number;
}

export interface CreateProjectData {
    name: string;
    description?: string;
}

// Card Generator State Types
export interface CardGeneratorState {
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

export interface RenderedCard {
    url: string;
    id: string;
    name: string;
    timestamp: string;
}

export interface Template {
    border: string;
    seedImage: string;
    imageUrl?: string;
    itemImage?: string;
}

// Component Props interfaces
export interface SeedImageGalleryProps {
    onSelect: (image: string) => void;
}

export interface TemplatePreviewProps {
    template: Template;
    onGenerate: () => void;
}

export interface ItemFormProps {
    onGenerate: (data: any) => void;
    onSdPromptChange?: (prompt: string) => void;
    initialData: ItemDetails;
    onGenerationLockChange?: (isLocked: boolean) => void;
}

export interface ImageGalleryProps {
    images: GeneratedImage[];
    onSelect: (image: string) => void;
    onGenerate: () => Promise<void>;
}

export interface CardPreviewProps {
    image: string;
    details: ItemDetails | null;
}

export interface BorderGalleryProps {
    onSelect: (borderUrl: string) => void;
    isLoading?: boolean;
    error?: string;
}

// Template factory function
export const createTemplate = (border: string, seedImage: string): Template => ({
    border,
    seedImage,
    itemImage: seedImage // Set itemImage to seedImage for compatibility
}); 