export interface ItemDetails {
    Name: string;
    Type: string;
    Rarity: string;
    Value: string;
    Properties: string[];
    Damage: string;
    Weight: string;
    Description: string;
    Quote: string;
    SDPrompt: string;
}

export interface TemplateImage {
    url: string;
    id: string;
}

export interface GeneratedImage {
    url: string;
    id: string;
}
