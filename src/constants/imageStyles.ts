// Image Style Presets for AI Image Generation
// These style suffixes are injected into the image generation prompt

export const IMAGE_STYLES = {
    classic_dnd: {
        label: 'Classic D&D',
        suffix: 'in the style of classic Dungeons & Dragons art, detailed fantasy illustration, TSR era artwork'
    },
    oil_painting: {
        label: 'Oil Painting',
        suffix: 'oil painting, traditional fantasy art, detailed brushwork, museum quality'
    },
    fantasy_book: {
        label: 'Fantasy Book Cover',
        suffix: 'epic fantasy book cover art, dramatic lighting, professional illustration, cinematic composition'
    },
    dark_gothic: {
        label: 'Dark Gothic',
        suffix: 'dark gothic fantasy art, dramatic shadows, moody atmosphere, horror elements'
    },
    anime: {
        label: 'Anime Style',
        suffix: 'anime fantasy art, vibrant colors, dynamic pose, Japanese animation style'
    },
    sketch: {
        label: 'Pencil Sketch',
        suffix: 'detailed pencil sketch, fantasy concept art, monochrome, graphite drawing'
    },
    watercolor: {
        label: 'Watercolor',
        suffix: 'watercolor painting, soft colors, fantasy illustration, flowing pigments'
    },
    digital_art: {
        label: 'Modern Digital',
        suffix: 'modern digital fantasy art, high detail, concept art quality, professional rendering'
    },
    vintage: {
        label: 'Vintage Illustration',
        suffix: 'vintage fantasy illustration, retro style, classic storybook art'
    },
    realistic: {
        label: 'Photorealistic',
        suffix: 'photorealistic fantasy creature, highly detailed, 8k resolution, cinematic lighting'
    }
} as const;

export type ImageStyle = keyof typeof IMAGE_STYLES;

// Helper to build full prompt with style
export const buildFullPrompt = (basePrompt: string, style: ImageStyle): string => {
    const styleSuffix = IMAGE_STYLES[style].suffix;
    return `${basePrompt}, ${styleSuffix}`;
};

// Get all style options for dropdown
export const getStyleOptions = () => {
    return Object.entries(IMAGE_STYLES).map(([key, { label }]) => ({
        value: key,
        label
    }));
};

