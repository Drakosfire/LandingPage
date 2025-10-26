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
// NOTE: Currently using placeholder. Replace with actual AI-generated creature images from CDN for better demo.
export const TUTORIAL_HERMIONE_IMAGES: TutorialImageData[] = [
    {
        id: 'tutorial-hermione-1',
        url: '/images/portrait_placeholder.png', // TODO: Replace with CDN URL of generated cat image
        prompt: 'A mystical storm grey British Shorthair cat with divine powers, glowing amber eyes, ethereal aura, digital art'
    },
    {
        id: 'tutorial-hermione-2',
        url: '/images/portrait_placeholder.png', // TODO: Replace with CDN URL of generated cat image
        prompt: 'A mystical storm grey British Shorthair cat with divine powers, glowing amber eyes, ethereal aura, digital art'
    },
    {
        id: 'tutorial-hermione-3',
        url: '/images/portrait_placeholder.png', // TODO: Replace with CDN URL of generated cat image
        prompt: 'A mystical storm grey British Shorthair cat with divine powers, glowing amber eyes, ethereal aura, digital art'
    },
    {
        id: 'tutorial-hermione-4',
        url: '/images/portrait_placeholder.png', // TODO: Replace with CDN URL of generated cat image
        prompt: 'A mystical storm grey British Shorthair cat with divine powers, glowing amber eyes, ethereal aura, digital art'
    },
];

// Default image prompt for tutorial
export const TUTORIAL_DEFAULT_IMAGE_PROMPT = 'A mystical storm grey British Shorthair cat with divine powers, known as Hermione the All Cat. Glowing amber eyes, regal presence, ethereal aura, fantasy digital art style.';

