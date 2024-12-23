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


export interface SelectedImage {
    url: string;
    id: string;
    alt: string;
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
    onSdPromptChange?: (sdPrompt: string) => void;
    initialData?: ItemDetails;
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

export interface Template {
    border: string;
    seedImage: string;
    imageUrl?: string;
}

// Template factory function
export const createTemplate = (border: string, seedImage: string): Template => ({
    border,
    seedImage,
});
