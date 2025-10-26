/**
 * Tutorial Mock Images
 * 
 * Sample creature images for tutorial demonstrations.
 * These are pre-generated images hosted on CDN for instant display during tutorial.
 */

export interface TutorialImageData {
    id: string;
    url: string;
    prompt: string;
    thumbnail?: string;
}

// Sample Hermione images for tutorial
// Using actual AI-generated creature images from Cloudflare Images CDN
export const TUTORIAL_HERMIONE_IMAGES: TutorialImageData[] = [
    {
        id: 'tutorial-hermione-1',
        url: 'https://imagedelivery.net/SahcvrNe_-ej4lTB6vsAZA/06a04def-d704-4378-2564-c0b770490100/public',
        prompt: 'A mystical storm grey British Shorthair cat with divine powers, glowing amber eyes, ethereal aura, digital art'
    },
    {
        id: 'tutorial-hermione-2',
        url: 'https://imagedelivery.net/SahcvrNe_-ej4lTB6vsAZA/b6296900-5df6-4dae-e4fb-8ac1a48e9a00/public',
        prompt: 'A mystical storm grey British Shorthair cat with divine powers, glowing amber eyes, ethereal aura, digital art'
    },
    {
        id: 'tutorial-hermione-3',
        url: 'https://imagedelivery.net/SahcvrNe_-ej4lTB6vsAZA/98c672a6-6109-43b2-aca9-a28ed22e6300/public',
        prompt: 'A mystical storm grey British Shorthair cat with divine powers, glowing amber eyes, ethereal aura, digital art'
    },
    {
        id: 'tutorial-hermione-4',
        url: 'https://imagedelivery.net/SahcvrNe_-ej4lTB6vsAZA/b6296900-5df6-4dae-e4fb-8ac1a48e9a00/public',
        prompt: 'A mystical storm grey British Shorthair cat with divine powers, glowing amber eyes, ethereal aura, digital art'
    },
];

// Default image prompt for tutorial
export const TUTORIAL_DEFAULT_IMAGE_PROMPT = 'A mystical storm grey British Shorthair cat with divine powers, known as Hermione the All Cat. Glowing amber eyes, regal presence, ethereal aura, fantasy digital art style.';

