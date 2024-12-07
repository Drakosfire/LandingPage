export interface ItemDetailsType {
    name: string;
    type: string;
    rarity: string;
    value: string;
    properties: string;
    damage?: string;
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

// Component Props interfaces
export interface SeedImageGalleryProps {
    onSelect: (image: string) => void;
}

export interface TemplatePreviewProps {
    template: string;
    onGenerate: () => Promise<void>;
}

export interface ItemFormProps {
    onGenerate: (prompt: string) => Promise<void>;
}

export interface ImageGalleryProps {
    images: GeneratedImage[];
    onSelect: (image: string) => void;
    onGenerate: () => Promise<void>;
}

export interface CardPreviewProps {
    image: string;
    details: ItemDetailsType | null;
}
