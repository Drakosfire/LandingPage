import { transformBackendState, transformFrontendState } from './projectAPI';
import { CardGeneratorState } from '../types/card.types';

// Mock the transformation functions for testing
const mockBackendState = {
    sessionId: "test-session-123",
    userId: "test-user-456",
    currentStep: "final-assembly",
    stepCompletion: {
        'text-generation': true,
        'core-image': true,
        'border-generation': true,
        'final-assembly': false
    },
    itemDetails: {
        name: "Sharona",
        type: "Weapon",
        rarity: "legendary",
        value: "5000 gp",
        properties: ["Finesse", "Light", "Magical"],
        damageFormula: "1d8+3",
        damageType: "Slashing",
        weight: "3 lbs",
        description: "A legendary pickaxe with improbable fortune",
        quote: "Don't fail me now, my Sharona",
        sdPrompt: "A timeworn miner's pick with a crooked iron head"
    },
    selectedAssets: {
        finalImage: "https://example.com/final-image.jpg",
        border: "https://example.com/border.png",
        seedImage: "https://example.com/seed.jpg",
        templateBlob: "data:image/png;base64,test",
        generatedCardImages: [
            "https://example.com/card1.jpg",
            "https://example.com/card2.jpg"
        ],
        selectedGeneratedCardImage: "https://example.com/card1.jpg",
        finalCardWithText: "https://example.com/final-card.jpg"
    },
    generatedContent: {
        images: [
            { url: "https://example.com/gen1.jpg", id: "img1" },
            { url: "https://example.com/gen2.jpg", id: "img2" }
        ],
        renderedCards: [
            { url: "https://example.com/rendered1.jpg", id: "card1", name: "Card 1", timestamp: "1234567890" }
        ]
    },
    metadata: {
        lastSaved: "1753725560908",
        version: "1.0.0",
        platform: "web"
    }
};

const mockFrontendState: CardGeneratorState = {
    currentStepId: "final-assembly",
    stepCompletion: {
        'text-generation': true,
        'core-image': true,
        'border-generation': true,
        'final-assembly': false
    },
    itemDetails: {
        name: "Sharona",
        type: "Weapon",
        rarity: "legendary",
        value: "5000 gp",
        properties: ["Finesse", "Light", "Magical"],
        damageFormula: "1d8+3",
        damageType: "Slashing",
        weight: "3 lbs",
        description: "A legendary pickaxe with improbable fortune",
        quote: "Don't fail me now, my Sharona",
        sdPrompt: "A timeworn miner's pick with a crooked iron head"
    },
    selectedAssets: {
        finalImage: "https://example.com/final-image.jpg",
        border: "https://example.com/border.png",
        seedImage: "https://example.com/seed.jpg",
        templateBlob: "data:image/png;base64,test",
        generatedCardImages: [
            "https://example.com/card1.jpg",
            "https://example.com/card2.jpg"
        ],
        selectedGeneratedCardImage: "https://example.com/card1.jpg",
        finalCardWithText: "https://example.com/final-card.jpg"
    },
    generatedContent: {
        images: [
            { url: "https://example.com/gen1.jpg", id: "img1" },
            { url: "https://example.com/gen2.jpg", id: "img2" }
        ],
        renderedCards: [
            { url: "https://example.com/rendered1.jpg", id: "card1", name: "Card 1", timestamp: "1234567890" }
        ]
    },
    autoSaveEnabled: true,
    lastSaved: "1753725560908"
};

describe('Project API Transformations', () => {
    describe('transformBackendState', () => {
        it('should transform complete backend state to frontend format', () => {
            const result = transformBackendState(mockBackendState);

            expect(result.currentStepId).toBe("final-assembly");
            expect(result.itemDetails.name).toBe("Sharona");
            expect(result.itemDetails.type).toBe("Weapon");
            expect(result.selectedAssets.finalImage).toBe("https://example.com/final-image.jpg");
            expect(result.generatedContent.images).toHaveLength(2);
            expect(result.generatedContent.renderedCards).toHaveLength(1);
            expect(result.autoSaveEnabled).toBe(true);
            expect(result.lastSaved).toBe("1753725560908");
        });

        it('should handle empty backend state', () => {
            const emptyBackendState = {
                sessionId: "empty-session",
                currentStep: "text-generation",
                stepCompletion: {},
                itemDetails: {},
                selectedAssets: {
                    finalImage: undefined,
                    border: undefined,
                    seedImage: undefined,
                    templateBlob: undefined,
                    generatedCardImages: [],
                    selectedGeneratedCardImage: undefined,
                    finalCardWithText: undefined
                },
                generatedContent: {
                    images: [],
                    renderedCards: []
                },
                metadata: {
                    lastSaved: undefined,
                    version: undefined,
                    platform: undefined
                }
            };

            const result = transformBackendState(emptyBackendState);

            expect(result.currentStepId).toBe("text-generation");
            expect(result.itemDetails.name).toBe("");
            expect(result.itemDetails.type).toBe("");
            expect(result.selectedAssets.generatedCardImages).toEqual([]);
            expect(result.generatedContent.images).toEqual([]);
            expect(result.generatedContent.renderedCards).toEqual([]);
        });

        it('should handle malformed itemDetails', () => {
            const malformedBackendState = {
                ...mockBackendState,
                itemDetails: {
                    name: null,
                    type: undefined,
                    properties: "not an array",
                    damageFormula: 123, // wrong type
                    weight: false // wrong type
                }
            };

            const result = transformBackendState(malformedBackendState);

            expect(result.itemDetails.name).toBe("");
            expect(result.itemDetails.type).toBe("");
            expect(result.itemDetails.properties).toEqual([]);
            expect(result.itemDetails.damageFormula).toBe("");
            expect(result.itemDetails.weight).toBe("");
        });

        it('should handle string vs object images in generatedContent', () => {
            const mixedContentBackendState = {
                ...mockBackendState,
                generatedContent: {
                    images: [
                        "https://example.com/string-image.jpg",
                        { url: "https://example.com/object-image.jpg", id: "obj1" }
                    ],
                    renderedCards: [
                        "https://example.com/string-card.jpg",
                        { url: "https://example.com/object-card.jpg", id: "card1", name: "Card", timestamp: "123" }
                    ]
                }
            };

            const result = transformBackendState(mixedContentBackendState);

            expect(result.generatedContent.images).toHaveLength(2);
            expect(result.generatedContent.images[0].url).toBe("https://example.com/string-image.jpg");
            expect(result.generatedContent.images[1].url).toBe("https://example.com/object-image.jpg");
            expect(result.generatedContent.renderedCards).toHaveLength(2);
        });

        it('should handle null/undefined values in selectedAssets', () => {
            const nullAssetsBackendState = {
                ...mockBackendState,
                selectedAssets: {
                    finalImage: undefined,
                    border: undefined,
                    seedImage: "",
                    templateBlob: undefined,
                    generatedCardImages: [],
                    selectedGeneratedCardImage: undefined,
                    finalCardWithText: undefined
                }
            };

            const result = transformBackendState(nullAssetsBackendState);

            expect(result.selectedAssets.finalImage).toBeUndefined();
            expect(result.selectedAssets.border).toBeUndefined();
            expect(result.selectedAssets.seedImage).toBe("");
            expect(result.selectedAssets.generatedCardImages).toEqual([]);
            expect(result.selectedAssets.selectedGeneratedCardImage).toBeUndefined();
            expect(result.selectedAssets.finalCardWithText).toBeUndefined();
        });
    });

    describe('transformFrontendState', () => {
        it('should transform complete frontend state to backend format', () => {
            const result = transformFrontendState(mockFrontendState);

            expect(result.currentStep).toBe("final-assembly");
            expect(result.sessionId).toBeDefined();
            expect(result.itemDetails.name).toBe("Sharona");
            expect(result.itemDetails.type).toBe("Weapon");
            expect(result.selectedAssets.finalImage).toBe("https://example.com/final-image.jpg");
            expect(result.generatedContent.images).toHaveLength(2);
            expect(result.generatedContent.renderedCards).toHaveLength(1);
            expect(result.metadata.lastSaved).toBe("1753725560908");
            expect(result.metadata.version).toBe("1.0.0");
            expect(result.metadata.platform).toBe("web");
        });

        it('should handle missing metadata', () => {
            const frontendStateWithoutMetadata = {
                ...mockFrontendState,
                lastSaved: undefined
            };

            const result = transformFrontendState(frontendStateWithoutMetadata);

            expect(result.metadata.lastSaved).toBeUndefined();
            expect(result.metadata.version).toBeDefined();
            expect(result.metadata.platform).toBeDefined();
        });

        it('should handle missing selectedAssets', () => {
            const frontendStateWithoutAssets = {
                ...mockFrontendState,
                selectedAssets: {
                    finalImage: undefined,
                    border: undefined,
                    seedImage: undefined,
                    templateBlob: undefined,
                    generatedCardImages: [],
                    selectedGeneratedCardImage: undefined,
                    finalCardWithText: undefined
                }
            };

            const result = transformFrontendState(frontendStateWithoutAssets);

            expect(result.selectedAssets.finalImage).toBeUndefined();
            expect(result.selectedAssets.generatedCardImages).toEqual([]);
        });

        it('should handle missing generatedContent', () => {
            const frontendStateWithoutContent = {
                ...mockFrontendState,
                generatedContent: {
                    images: [],
                    renderedCards: []
                }
            };

            const result = transformFrontendState(frontendStateWithoutContent);

            expect(result.generatedContent.images).toEqual([]);
            expect(result.generatedContent.renderedCards).toEqual([]);
        });

        it('should handle missing stepCompletion', () => {
            const frontendStateWithoutSteps = {
                ...mockFrontendState,
                stepCompletion: {}
            };

            const result = transformFrontendState(frontendStateWithoutSteps);

            expect(result.stepCompletion).toEqual({});
        });

        it('should handle missing itemDetails', () => {
            const frontendStateWithoutDetails = {
                ...mockFrontendState,
                itemDetails: {
                    name: "",
                    type: "",
                    rarity: "",
                    value: "",
                    properties: [],
                    damageFormula: "",
                    damageType: "",
                    weight: "",
                    description: "",
                    quote: "",
                    sdPrompt: ""
                }
            };

            const result = transformFrontendState(frontendStateWithoutDetails);

            expect(result.itemDetails.name).toBe("");
            expect(result.itemDetails.type).toBe("");
        });
    });

    describe('Edge cases and error handling', () => {
        it('should handle backend state without generatedContent', () => {
            const backendStateWithoutContent = {
                ...mockBackendState,
                generatedContent: {
                    images: [],
                    renderedCards: []
                }
            };

            const result = transformBackendState(backendStateWithoutContent);

            expect(result.generatedContent.images).toEqual([]);
            expect(result.generatedContent.renderedCards).toEqual([]);
        });

        it('should handle backend state without selectedAssets', () => {
            const backendStateWithoutAssets = {
                ...mockBackendState,
                selectedAssets: {
                    finalImage: undefined,
                    border: undefined,
                    seedImage: undefined,
                    templateBlob: undefined,
                    generatedCardImages: [],
                    selectedGeneratedCardImage: undefined,
                    finalCardWithText: undefined
                }
            };

            const result = transformBackendState(backendStateWithoutAssets);

            expect(result.selectedAssets.finalImage).toBeUndefined();
            expect(result.selectedAssets.generatedCardImages).toEqual([]);
        });

        it('should handle backend state without metadata', () => {
            const backendStateWithoutMetadata = {
                ...mockBackendState,
                metadata: {
                    lastSaved: undefined,
                    version: undefined,
                    platform: undefined
                }
            };

            const result = transformBackendState(backendStateWithoutMetadata);

            expect(result.lastSaved).toBeUndefined();
        });

        it('should handle numeric lastSaved timestamp', () => {
            const backendStateWithNumericTimestamp = {
                ...mockBackendState,
                metadata: {
                    ...mockBackendState.metadata,
                    lastSaved: "1753725560908"
                }
            };

            const result = transformBackendState(backendStateWithNumericTimestamp);

            expect(result.lastSaved).toBeDefined();
            expect(result.lastSaved).toBe("1753725560908");
        });
    });
}); 