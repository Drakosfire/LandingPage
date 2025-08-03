import React, { useState, useEffect } from 'react';
import { DUNGEONMIND_API_URL } from '../../../config';
import { GeneratedImage as SharedGeneratedImage } from '../../../types/card.types';
import { ClickableImage } from '../shared';
import '../../../styles/DesignSystem.css';

interface CoreImageGalleryProps {
    sdPrompt?: string; // Make optional since it can be undefined
    onSdPromptChange: (newPrompt: string) => void;
    onSelect: (imageUrl: string) => void;
    selectedImage?: string;
    onImagesGenerated?: (images: SharedGeneratedImage[]) => void;
    persistedImages?: SharedGeneratedImage[]; // Add persisted images prop
    onGenerationLockChange?: (isLocked: boolean) => void; // Generation lock callback
}

interface GeneratedImage {
    url: string;
    id: string;
    width?: number;
    height?: number;
    content_type?: string;
}

interface ExampleImage {
    url: string;
    name: string;
    category: string;
    description: string;
}

const CoreImageGallery: React.FC<CoreImageGalleryProps> = ({
    sdPrompt = '', // Default to empty string
    onSdPromptChange,
    onSelect,
    selectedImage,
    onImagesGenerated,
    persistedImages = [], // Default to empty array
    onGenerationLockChange
}) => {
    const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
    const [exampleImages, setExampleImages] = useState<ExampleImage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingExamples, setIsLoadingExamples] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'examples' | 'generated'>('examples');

    // Restore local state from persisted images
    useEffect(() => {
        if (persistedImages && persistedImages.length > 0 && generatedImages.length === 0) {
            const restoredImages: GeneratedImage[] = persistedImages.map(img => ({
                url: img.url,
                id: img.id,
                width: 1024, // Default dimensions for persisted images
                height: 1024,
                content_type: 'image/png'
            }));
            setGeneratedImages(restoredImages);
            setActiveTab('generated'); // Switch to generated tab if we have persisted images
        }
    }, [persistedImages]);

    // Load example images on component mount
    useEffect(() => {
        loadExampleImages();
    }, []);

    const loadExampleImages = async () => {
        try {
            setIsLoadingExamples(true);
            const response = await fetch(`${DUNGEONMIND_API_URL}/api/cardgenerator/example-images`, {
                credentials: 'include' // Include session cookies
            });

            if (!response.ok) {
                throw new Error('Failed to load example images');
            }

            const data = await response.json();
            setExampleImages(data.examples || []);
        } catch (error) {
            // Fallback to some basic examples if API fails
            setExampleImages([
                {
                    url: 'https://picsum.photos/300/400?random=sword',
                    name: 'Enchanted Sword',
                    category: 'Weapon',
                    description: 'A mystical blade with glowing runes'
                },
                {
                    url: 'https://picsum.photos/300/400?random=potion',
                    name: 'Healing Potion',
                    category: 'Consumable',
                    description: 'A shimmering red healing elixir'
                },
                {
                    url: 'https://picsum.photos/300/400?random=ring',
                    name: 'Magic Ring',
                    category: 'Accessory',
                    description: 'A ring crackling with magical energy'
                },
                {
                    url: 'https://picsum.photos/300/400?random=staff',
                    name: 'Wizard Staff',
                    category: 'Weapon',
                    description: 'An ornate staff topped with a glowing crystal'
                }
            ]);
        } finally {
            setIsLoadingExamples(false);
        }
    };

    const handleGenerateImages = async () => {
        if (!sdPrompt?.trim()) {
            setError('Please enter a description for your item');
            return;
        }

        setIsLoading(true);
        onGenerationLockChange?.(true); // 🔒 Lock navigation during generation
        setError(null);

        const formData = new FormData();
        formData.append('sdPrompt', sdPrompt);
        formData.append('numImages', '4');

        try {
            const response = await fetch(`${DUNGEONMIND_API_URL}/api/cardgenerator/generate-core-images`, {
                method: 'POST',
                body: formData,
                credentials: 'include' // Include session cookies
            });

            if (!response.ok) {
                throw new Error(`Failed to generate images: ${response.status}`);
            }

            const data = await response.json();
            const newImages = data.images || [];

            // Upload generated images to Cloudflare for permanent storage
            try {
                const imageUrls = newImages.map((img: GeneratedImage) => img.url);

                const uploadResponse = await fetch(`${DUNGEONMIND_API_URL}/api/cardgenerator/upload-generated-images`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(imageUrls),
                    credentials: 'include' // Include session cookies
                });

                if (uploadResponse.ok) {
                    const uploadData = await uploadResponse.json();

                    // Replace temporary URLs with permanent Cloudflare URLs
                    const permanentImages = uploadData.uploaded_images.map((uploaded: any, index: number) => ({
                        url: uploaded.permanent_url,
                        id: `permanent-${Date.now()}-${index}`,
                        width: newImages[index]?.width || 1024,
                        height: newImages[index]?.height || 1024,
                        content_type: newImages[index]?.content_type || 'image/png'
                    }));

                    setGeneratedImages(prevImages => [...permanentImages, ...prevImages]);
                    setActiveTab('generated');

                    // Call the callback to update parent state with permanent URLs
                    if (onImagesGenerated && permanentImages.length > 0) {
                        const sharedFormatImages: SharedGeneratedImage[] = permanentImages.map((img: GeneratedImage) => ({
                            url: img.url,
                            id: img.id
                        }));
                        onImagesGenerated(sharedFormatImages);
                    }
                } else {
                    // Fallback to temporary URLs if upload fails
                    const fallbackImages = newImages.map((img: any, index: number) => ({
                        ...img,
                        id: img.id || `fallback-${Date.now()}-${index}`
                    }));
                    setGeneratedImages(prevImages => [...fallbackImages, ...prevImages]);
                    setActiveTab('generated');

                    if (onImagesGenerated && fallbackImages.length > 0) {
                        const sharedFormatImages: SharedGeneratedImage[] = fallbackImages.map((img: GeneratedImage) => ({
                            url: img.url,
                            id: img.id
                        }));
                        onImagesGenerated(sharedFormatImages);
                    }
                }
            } catch (uploadError) {
                // Fallback to temporary URLs if upload fails
                const fallbackImages = newImages.map((img: any, index: number) => ({
                    ...img,
                    id: img.id || `fallback-${Date.now()}-${index}`
                }));
                setGeneratedImages(prevImages => [...fallbackImages, ...prevImages]);
                setActiveTab('generated');

                if (onImagesGenerated && fallbackImages.length > 0) {
                    const sharedFormatImages: SharedGeneratedImage[] = fallbackImages.map((img: GeneratedImage) => ({
                        url: img.url,
                        id: img.id
                    }));
                    onImagesGenerated(sharedFormatImages);
                }
            }
        } catch (error) {
            setError('Failed to generate images. Please try again.');
        } finally {
            setIsLoading(false);
            onGenerationLockChange?.(false); // 🔓 Unlock navigation when done
        }
    };

    const handleImageSelect = (imageUrl: string) => {
        onSelect(imageUrl);
    };

    const isImageSelected = (imageUrl: string) => {
        return selectedImage === imageUrl;
    };

    return (
        <div className="core-image-gallery">
            {/* Prompt Input */}
            <div className="form-group mb-6">
                <label className="form-label">
                    Describe Your Item for AI Generation
                </label>
                <textarea
                    className="form-input form-textarea"
                    value={sdPrompt}
                    onChange={(e) => onSdPromptChange(e.target.value)}
                    placeholder="e.g., 'a glowing enchanted sword with blue runes carved into the blade, fantasy art style'"
                    rows={3}
                />
                <p style={{
                    fontSize: 'var(--text-xs)',
                    color: 'var(--text-muted)',
                    marginTop: 'var(--space-1)'
                }}>
                    Tip: Be specific about colors, materials, magical effects, and art style for best results.
                </p>
            </div>

            {/* Generate Button */}
            <div className="mb-6">
                <button
                    onClick={handleGenerateImages}
                    disabled={isLoading || !sdPrompt?.trim()}
                    className="btn btn-primary"
                    style={{ width: '100%' }}
                >
                    {isLoading ? (
                        <>
                            <span className="spinner"></span>
                            Generating AI Images...
                        </>
                    ) : (
                        <>
                            🎨 Generate AI Images
                        </>
                    )}
                </button>
            </div>

            {/* Error Display */}
            {error && (
                <div style={{
                    padding: 'var(--space-3)',
                    background: 'rgba(208, 2, 27, 0.1)',
                    border: '1px solid var(--error-red)',
                    borderRadius: 'var(--radius-base)',
                    color: 'var(--error-red)',
                    fontSize: 'var(--text-sm)',
                    marginBottom: 'var(--space-4)'
                }}>
                    {error}
                </div>
            )}

            {/* Tab Navigation */}
            <div className="flex gap-2 mb-4" style={{ borderBottom: '1px solid var(--border-light)' }}>
                <button
                    onClick={() => setActiveTab('examples')}
                    className={`step-tab ${activeTab === 'examples' ? 'active' : ''}`}
                    style={{ flex: 1 }}
                >
                    <span className="step-icon">💎</span>
                    Example Images
                </button>
                <button
                    onClick={() => setActiveTab('generated')}
                    className={`step-tab ${activeTab === 'generated' ? 'active' : ''}`}
                    style={{ flex: 1 }}
                >
                    <span className="step-icon">🤖</span>
                    AI Generated ({generatedImages.length})
                </button>
            </div>

            {/* Example Images Tab */}
            {activeTab === 'examples' && (
                <div>
                    {isLoadingExamples ? (
                        <div className="text-center py-8">
                            <div className="spinner" style={{ margin: '0 auto var(--space-4)' }}></div>
                            <p style={{ color: 'var(--text-muted)' }}>Loading example images...</p>
                        </div>
                    ) : (
                        <div className="card-variations-grid">
                            {exampleImages.map((image, index) => (
                                <div
                                    key={index}
                                    className={`transition-all border-2 rounded-lg overflow-hidden ${isImageSelected(image.url)
                                        ? 'border-primary-blue shadow-primary'
                                        : 'border-border-light hover:border-primary-blue'
                                        }`}
                                    style={{
                                        borderColor: isImageSelected(image.url) ? 'var(--primary-blue)' : 'var(--border-light)',
                                        boxShadow: isImageSelected(image.url) ? 'var(--shadow-primary)' : 'var(--shadow-sm)',
                                        width: 'fit-content',
                                        maxWidth: '100%'
                                    }}
                                >
                                    <div style={{
                                        backgroundColor: 'var(--surface-light)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        overflow: 'hidden',
                                        position: 'relative'
                                    }}>
                                        <ClickableImage
                                            src={image.url}
                                            alt={image.name}
                                            title={image.name}
                                            description={`${image.category}: ${image.description}`}
                                            style={{
                                                width: '100%',
                                                maxWidth: 'min(160px, 20vw)',
                                                minWidth: '120px',
                                                height: 'auto',
                                                aspectRatio: '3/4',
                                                objectFit: 'contain',
                                                display: 'block',
                                                backgroundColor: '#f8f9fa',
                                                borderRadius: '4px'
                                            }}
                                            onClick={() => handleImageSelect(image.url)}
                                            showExpandButton={true}
                                            expandButtonPosition="top-right"
                                        />
                                    </div>
                                    <div style={{ padding: 'var(--space-2)' }}>
                                        <h4 style={{
                                            fontSize: 'var(--text-sm)',
                                            fontWeight: 'var(--font-medium)',
                                            margin: '0 0 var(--space-1) 0',
                                            color: 'var(--text-primary)'
                                        }}>
                                            {image.name}
                                        </h4>
                                        <p style={{
                                            fontSize: 'var(--text-xs)',
                                            color: 'var(--text-secondary)',
                                            margin: '0 0 var(--space-1) 0'
                                        }}>
                                            {image.category}
                                        </p>
                                        <p style={{
                                            fontSize: 'var(--text-xs)',
                                            color: 'var(--text-muted)',
                                            margin: 0,
                                            lineHeight: 'var(--leading-normal)'
                                        }}>
                                            {image.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Generated Images Tab */}
            {activeTab === 'generated' && (
                <div>
                    {generatedImages.length === 0 ? (
                        <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
                            <div className="text-2xl mb-2">🎨</div>
                            <p className="text-sm mb-2">No AI images generated yet</p>
                            <p className="text-xs">
                                Enter a description above and click "Generate AI Images" to create custom artwork.
                            </p>
                        </div>
                    ) : (
                        <div className="card-variations-grid">
                            {generatedImages.map((image, index) => (
                                <div
                                    key={index}
                                    className={`transition-all border-2 rounded-lg overflow-hidden ${isImageSelected(image.url)
                                        ? 'border-primary-blue shadow-primary'
                                        : 'border-border-light hover:border-primary-blue'
                                        }`}
                                    style={{
                                        borderColor: isImageSelected(image.url) ? 'var(--primary-blue)' : 'var(--border-light)',
                                        boxShadow: isImageSelected(image.url) ? 'var(--shadow-primary)' : 'var(--shadow-sm)',
                                        width: 'fit-content',
                                        maxWidth: '100%'
                                    }}
                                >
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        overflow: 'hidden',
                                        backgroundColor: 'var(--surface-light)',
                                        position: 'relative'
                                    }}>
                                        <ClickableImage
                                            src={image.url}
                                            alt={`Generated item ${index + 1}`}
                                            title={`Generated Image #${index + 1}`}
                                            description="AI-generated image for your item"
                                            style={{
                                                width: '100%',
                                                maxWidth: 'min(160px, 20vw)',
                                                minWidth: '120px',
                                                height: 'auto',
                                                aspectRatio: '3/4',
                                                objectFit: 'contain',
                                                display: 'block',
                                                backgroundColor: '#f8f9fa',
                                                borderRadius: '4px'
                                            }}
                                            onClick={() => handleImageSelect(image.url)}
                                            showExpandButton={true}
                                            expandButtonPosition="bottom-right"
                                            downloadFilename={`generated-image-${index + 1}.png`}
                                        />

                                        {/* Remove button for generated images */}
                                        <button
                                            onClick={async (e) => {
                                                e.stopPropagation();

                                                // Call backend to delete the image
                                                try {
                                                    await fetch(`/api/cardgenerator/delete-image?image_url=${encodeURIComponent(image.url)}`, {
                                                        method: 'DELETE',
                                                        credentials: 'include'
                                                    });
                                                    // Image deletion handled silently - UI updated regardless of server response
                                                } catch (error) {
                                                    // Silently handle deletion errors
                                                }

                                                // Remove from local state regardless of server response
                                                const newGenerated = generatedImages.filter((_, i) => i !== index);
                                                setGeneratedImages(newGenerated);

                                                // Update parent state with the new list (excluding deleted image)
                                                if (onImagesGenerated) {
                                                    const sharedFormatImages: SharedGeneratedImage[] = newGenerated.map((img: GeneratedImage) => ({
                                                        url: img.url,
                                                        id: img.id
                                                    }));
                                                    onImagesGenerated(sharedFormatImages);
                                                }

                                                if (selectedImage === image.url) {
                                                    onSelect('');
                                                }
                                            }}
                                            style={{
                                                position: 'absolute',
                                                top: '4px',
                                                left: '4px',
                                                background: 'rgba(220, 38, 38, 0.9)',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '50%',
                                                width: '20px',
                                                height: '20px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '10px',
                                                fontWeight: 'bold',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease',
                                                zIndex: 50
                                            }}
                                            onMouseOver={(e) => {
                                                e.currentTarget.style.background = 'rgba(220, 38, 38, 1)';
                                            }}
                                            onMouseOut={(e) => {
                                                e.currentTarget.style.background = 'rgba(220, 38, 38, 0.9)';
                                            }}
                                        >
                                            ×
                                        </button>
                                    </div>
                                    <div style={{
                                        padding: 'var(--space-2)',
                                        textAlign: 'center'
                                    }}>
                                        <p style={{
                                            fontSize: 'var(--text-sm)',
                                            fontWeight: 'var(--font-medium)',
                                            color: 'var(--text-primary)',
                                            margin: 0
                                        }}>
                                            Generated #{index + 1}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Selection Indicator */}
            {selectedImage && (
                <div style={{
                    marginTop: 'var(--space-4)',
                    padding: 'var(--space-3)',
                    background: 'rgba(126, 211, 33, 0.1)',
                    border: '1px solid var(--success-green)',
                    borderRadius: 'var(--radius-base)',
                    textAlign: 'center'
                }}>
                    <span style={{
                        color: 'var(--success-green)',
                        fontSize: 'var(--text-sm)',
                        fontWeight: 'var(--font-medium)'
                    }}>
                        ✓ Image selected! Continue to the next step.
                    </span>
                </div>
            )}
        </div>
    );
};

export default CoreImageGallery; 