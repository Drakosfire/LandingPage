import React, { useState } from 'react';
import { createTemplate } from '../../../types/card.types';
import { DUNGEONMIND_API_URL } from '../../../config';
import BorderGallery from '../CardTemplateSection/BorderGallery';
import TemplatePreview from '../CardTemplateSection/TemplatePreview';
import '../../../styles/DesignSystem.css';

// Add keyframe animation for loading spinner
const spinnerStyle = `
@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
`;

// Inject CSS if not already present
if (!document.querySelector('#spinner-style')) {
    const style = document.createElement('style');
    style.id = 'spinner-style';
    style.textContent = spinnerStyle;
    document.head.appendChild(style);
}

interface Step3BorderGenerationProps {
    selectedBorder: string;
    selectedFinalImage: string; // Add the core image from Step 2
    onBorderSelect: (border: string) => void;
    onGenerateTemplate: (blob: Blob, url: string) => void;
    onFinalImageChange?: (image: string) => void; // Optional callback to change the core image
    sdPrompt?: string; // Stable Diffusion prompt from Step 1 (optional since it can be undefined)
    onSdPromptChange?: (prompt: string) => void; // Callback to update the prompt
    onGeneratedImagesChange?: (images: string[]) => void; // Callback to persist generated images
    persistedGeneratedImages?: string[]; // Previously generated images
    selectedGeneratedImage?: string; // Previously selected generated image
    onSelectedGeneratedImageChange?: (image: string) => void; // Callback to persist selected image
    onGenerationLockChange?: (isLocked: boolean) => void; // Generation lock callback
}

const Step3BorderGeneration: React.FC<Step3BorderGenerationProps> = ({
    selectedBorder,
    selectedFinalImage,
    onBorderSelect,
    onGenerateTemplate,
    onFinalImageChange,
    sdPrompt = '', // Default to empty string
    onSdPromptChange,
    onGeneratedImagesChange,
    persistedGeneratedImages = [],
    selectedGeneratedImage: initialSelectedGeneratedImage = '',
    onSelectedGeneratedImageChange,
    onGenerationLockChange
}) => {
    const [generatedImages, setGeneratedImages] = useState<string[]>(persistedGeneratedImages);
    const [isGenerating, setIsGenerating] = useState(false);
    const [selectedGeneratedImage, setSelectedGeneratedImage] = useState<string>(initialSelectedGeneratedImage);
    const [templateBlob, setTemplateBlob] = useState<Blob | null>(null);
    const [templateUrl, setTemplateUrl] = useState<string>('');
    const [localSdPrompt, setLocalSdPrompt] = useState<string>(sdPrompt);
    const [lastPersistedImages, setLastPersistedImages] = useState<string[]>(persistedGeneratedImages); // Track last persisted state

    // Sync local prompt with prop when it changes
    React.useEffect(() => {
        setLocalSdPrompt(sdPrompt || '');
    }, [sdPrompt]);

    // Sync selected image with prop when it changes (for project switching)
    React.useEffect(() => {
        if (initialSelectedGeneratedImage !== selectedGeneratedImage) {
            console.log('🎯 Step3: Syncing selected image:', initialSelectedGeneratedImage);
            setSelectedGeneratedImage(initialSelectedGeneratedImage);
        }
    }, [initialSelectedGeneratedImage]);

    // Sync generated images with persisted images when they change
    React.useEffect(() => {
        // Check if this is a project switch (persisted data changed)
        const isProjectSwitch = JSON.stringify(lastPersistedImages) !== JSON.stringify(persistedGeneratedImages);

        if (isProjectSwitch) {
            console.log('🎯 Step3: Project switch detected - updating images. From:', lastPersistedImages.length, 'to:', persistedGeneratedImages.length);
            setGeneratedImages(persistedGeneratedImages);
            setLastPersistedImages(persistedGeneratedImages);
        } else if (persistedGeneratedImages && persistedGeneratedImages.length > 0 && generatedImages.length === 0) {
            // Initial load case - only restore if local is empty
            console.log('🎯 Step3: Initial load - restoring persisted images:', persistedGeneratedImages.length, 'images');
            setGeneratedImages(persistedGeneratedImages);
            setLastPersistedImages(persistedGeneratedImages);
        } else {
            console.log('🎯 Step3: No change needed. Persisted:', persistedGeneratedImages.length, 'Local:', generatedImages.length);
        }
    }, [persistedGeneratedImages, lastPersistedImages]);

    const isStepValid = () => {
        return selectedBorder !== '';
    };

    const generateCardImages = async () => {
        if (!templateBlob || !localSdPrompt?.trim()) {
            return;
        }

        setIsGenerating(true);
        onGenerationLockChange?.(true); // 🔒 Lock navigation during generation
        try {
            // Prepare form data using the stored template blob
            const formData = new FormData();
            formData.append('template', templateBlob, 'template.png');
            formData.append('sdPrompt', localSdPrompt);
            formData.append('numImages', '4');

            const response = await fetch('/api/cardgenerator/generate-card-images', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Failed to generate images');
            }

            const result = await response.json();

            // Extract image URLs from the result
            const tempImageUrls = result.images?.map((img: any) => img.url) || [];

            // Upload generated images to Cloudflare for permanent storage
            try {
                const uploadResponse = await fetch(`${DUNGEONMIND_API_URL}/api/cardgenerator/upload-generated-images`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(tempImageUrls),
                    credentials: 'include'
                });

                if (uploadResponse.ok) {
                    const uploadData = await uploadResponse.json();

                    // Replace temporary URLs with permanent Cloudflare URLs
                    const permanentImageUrls = uploadData.uploaded_images.map((uploaded: any) => uploaded.permanent_url);

                    setGeneratedImages(prevImages => {
                        const updatedImages = [...permanentImageUrls, ...prevImages];
                        onGeneratedImagesChange?.(updatedImages);
                        return updatedImages;
                    });
                } else {
                    setGeneratedImages(prevImages => {
                        const updatedImages = [...tempImageUrls, ...prevImages];
                        onGeneratedImagesChange?.(updatedImages);
                        return updatedImages;
                    });
                }
            } catch (uploadError) {
                // Fallback to temporary URLs if upload fails
                setGeneratedImages(prevImages => {
                    const updatedImages = [...tempImageUrls, ...prevImages];
                    onGeneratedImagesChange?.(updatedImages);
                    return updatedImages;
                });
            }

        } catch (error) {
            // Error handled by UI state
        } finally {
            setIsGenerating(false);
            onGenerationLockChange?.(false); // 🔓 Unlock navigation when done
        }
    };

    const template = createTemplate(selectedBorder, selectedFinalImage);

    return (
        <div
            id="step-panel-border-generation"
            role="tabpanel"
            aria-labelledby="step-tab-border-generation"
            className="step-panel"
        >
            <div className="container">
                {/* No Core Image Warning */}
                {!selectedFinalImage && (
                    <div className="mb-6">
                        <div className="step-card" style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '2px solid var(--error-red)'
                        }}>
                            <div className="flex items-center gap-4">
                                <div className="text-2xl">⚠️</div>
                                <div>
                                    <h4 style={{
                                        fontSize: 'var(--text-lg)',
                                        fontWeight: 'var(--font-semibold)',
                                        color: 'var(--error-red)',
                                        margin: '0 0 var(--space-1) 0'
                                    }}>
                                        No Core Image Selected
                                    </h4>
                                    <p style={{
                                        fontSize: 'var(--text-base)',
                                        color: 'var(--text-secondary)',
                                        margin: 0
                                    }}>
                                        Please go back to Step 2 to select or generate a core image before choosing borders.
                                        A core image is required to create the perfect border design.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Controls Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">


                    {/* Border Selection - Compact */}
                    <div className="lg:col-span-1">
                        <div className="step-card">
                            <div className="step-card-header">
                                <h3 className="step-card-title" style={{ fontSize: 'var(--text-lg)' }}>
                                    Border Style
                                </h3>
                            </div>

                            <BorderGallery onSelect={onBorderSelect} />

                            {selectedBorder && (
                                <div className="text-center" style={{
                                    marginTop: 'var(--space-3)',
                                    padding: 'var(--space-2)',
                                    background: 'rgba(74, 144, 226, 0.1)',
                                    borderRadius: 'var(--radius-base)'
                                }}>
                                    <span style={{
                                        color: 'var(--primary-blue)',
                                        fontSize: 'var(--text-sm)',
                                        fontWeight: 'var(--font-medium)'
                                    }}>
                                        ✓ Selected
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Prompt Editing - Compact */}
                    <div className="lg:col-span-1">
                        <div className="step-card">
                            <div className="step-card-header">
                                <h3 className="step-card-title" style={{ fontSize: 'var(--text-lg)' }}>
                                    AI Prompt
                                </h3>
                            </div>

                            <textarea
                                value={localSdPrompt}
                                onChange={(e) => {
                                    setLocalSdPrompt(e.target.value);
                                    onSdPromptChange?.(e.target.value);
                                }}
                                placeholder="Describe your card design..."
                                style={{
                                    width: '100%',
                                    minHeight: '100px',
                                    padding: 'var(--space-3)',
                                    border: '2px solid var(--border-light)',
                                    borderRadius: 'var(--radius-base)',
                                    fontSize: 'var(--text-sm)',
                                    fontFamily: 'var(--font-primary)',
                                    resize: 'vertical',
                                    backgroundColor: 'white'
                                }}
                            />
                        </div>
                    </div>

                    {/* Template Preview - Compact */}
                    <div className="lg:col-span-1">
                        <div className="step-card">
                            <div className="step-card-header">
                                <h3 className="step-card-title" style={{ fontSize: 'var(--text-lg)' }}>
                                    Template
                                </h3>
                            </div>

                            {isStepValid() ? (
                                <div>
                                    <TemplatePreview
                                        template={template}
                                        onGenerate={(blob, url) => {
                                            setTemplateBlob(blob);
                                            setTemplateUrl(url);
                                            onGenerateTemplate(blob, url);
                                        }}
                                    />

                                    <button
                                        onClick={generateCardImages}
                                        disabled={isGenerating || !localSdPrompt || !templateBlob}
                                        style={{
                                            background: isGenerating ? 'var(--text-muted)' : 'var(--primary-blue)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: 'var(--radius-base)',
                                            padding: 'var(--space-3)',
                                            fontSize: 'var(--text-sm)',
                                            fontWeight: 'var(--font-medium)',
                                            cursor: isGenerating ? 'not-allowed' : 'pointer',
                                            transition: 'all 0.2s ease',
                                            width: '100%',
                                            marginTop: 'var(--space-3)'
                                        }}
                                    >
                                        {isGenerating ? (
                                            <>
                                                <div style={{
                                                    width: '16px',
                                                    height: '16px',
                                                    border: '2px solid white',
                                                    borderTop: '2px solid transparent',
                                                    borderRadius: '50%',
                                                    animation: 'spin 1s linear infinite',
                                                    display: 'inline-block',
                                                    marginRight: 'var(--space-2)'
                                                }} />
                                                Generating...
                                            </>
                                        ) : (
                                            '🎨 Generate Variations'
                                        )}
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center py-4" style={{ color: 'var(--text-muted)' }}>
                                    <div className="text-xl mb-2">🎨</div>
                                    <p className="text-sm">Select a border</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Generated Card Variations - Always visible */}
                <div className="mt-6 mb-8">
                    <div className="step-card">
                        <div className="step-card-header">
                            <h3 className="step-card-title" style={{ fontSize: 'var(--text-lg)' }}>
                                Generated Variations
                            </h3>
                        </div>

                        {generatedImages.length > 0 ? (
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                                gap: 'var(--space-4)',
                                marginTop: 'var(--space-4)'
                            }}>
                                {generatedImages.map((imageUrl, index) => (
                                    <div
                                        key={index}
                                        onClick={() => {
                                            setSelectedGeneratedImage(imageUrl);
                                            onSelectedGeneratedImageChange?.(imageUrl);
                                        }}
                                        style={{
                                            position: 'relative',
                                            cursor: 'pointer',
                                            borderRadius: 'var(--radius-base)',
                                            overflow: 'hidden',
                                            border: selectedGeneratedImage === imageUrl ?
                                                '3px solid var(--primary-blue)' :
                                                '2px solid var(--border-light)',
                                            transition: 'all 0.2s ease',
                                            boxShadow: selectedGeneratedImage === imageUrl ?
                                                '0 4px 12px rgba(74, 144, 226, 0.3)' :
                                                '0 2px 8px rgba(0, 0, 0, 0.1)'
                                        }}
                                    >
                                        <img
                                            src={imageUrl}
                                            alt={`Generated card ${index + 1}`}
                                            style={{
                                                width: '100%',
                                                height: 'auto',
                                                aspectRatio: '3/4',
                                                objectFit: 'contain',
                                                display: 'block',
                                                backgroundColor: '#f8f9fa'
                                            }}
                                        />
                                        {selectedGeneratedImage === imageUrl && (
                                            <div style={{
                                                position: 'absolute',
                                                top: '8px',
                                                right: '8px',
                                                background: 'var(--success-green)',
                                                color: 'white',
                                                borderRadius: '50%',
                                                width: '24px',
                                                height: '24px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '12px',
                                                fontWeight: 'bold'
                                            }}>
                                                ✓
                                            </div>
                                        )}
                                        <button
                                            onClick={async (e) => {
                                                e.stopPropagation();
                                                try {
                                                    const response = await fetch(`/api/cardgenerator/delete-image?image_url=${encodeURIComponent(imageUrl)}`, {
                                                        method: 'DELETE',
                                                        credentials: 'include'
                                                    });
                                                    // Image deletion handled silently
                                                } catch (error) {
                                                    // Error handled silently
                                                }
                                                const updatedImages = generatedImages.filter(img => img !== imageUrl);
                                                setGeneratedImages(updatedImages);
                                                onGeneratedImagesChange?.(updatedImages);
                                                if (selectedGeneratedImage === imageUrl) {
                                                    setSelectedGeneratedImage('');
                                                    onSelectedGeneratedImageChange?.('');
                                                }
                                            }}
                                            style={{
                                                position: 'absolute',
                                                top: '8px',
                                                left: '8px',
                                                background: 'rgba(255, 0, 0, 0.8)',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '50%',
                                                width: '24px',
                                                height: '24px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '12px',
                                                fontWeight: 'bold',
                                                cursor: 'pointer',
                                                opacity: 0.8,
                                                transition: 'opacity 0.2s ease'
                                            }}
                                            onMouseOver={(e) => e.currentTarget.style.opacity = '1'}
                                            onMouseOut={(e) => e.currentTarget.style.opacity = '0.8'}
                                        >
                                            ×
                                        </button>
                                        <div style={{
                                            position: 'absolute',
                                            bottom: '8px',
                                            left: '8px',
                                            background: 'rgba(0, 0, 0, 0.7)',
                                            color: 'white',
                                            padding: '4px 8px',
                                            borderRadius: 'var(--radius-sm)',
                                            fontSize: 'var(--text-sm)',
                                            fontWeight: 'var(--font-medium)'
                                        }}>
                                            Option {index + 1}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
                                <div style={{ fontSize: '3rem', marginBottom: 'var(--space-3)' }}>🎨</div>
                                <h4 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-medium)', marginBottom: 'var(--space-2)' }}>
                                    No Variations Generated Yet
                                </h4>
                                <p style={{ fontSize: 'var(--text-sm)' }}>
                                    Select a border and generate variations to see them here
                                </p>
                            </div>
                        )}

                        {selectedGeneratedImage && (
                            <div className="text-center" style={{
                                marginTop: 'var(--space-4)',
                                padding: 'var(--space-3)',
                                background: 'rgba(74, 144, 226, 0.1)',
                                borderRadius: 'var(--radius-base)'
                            }}>
                                <span style={{
                                    color: 'var(--primary-blue)',
                                    fontSize: 'var(--text-sm)',
                                    fontWeight: 'var(--font-medium)'
                                }}>
                                    ✓ Card selected - ready to proceed to next step
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Step Status */}
                <div className="text-center" style={{
                    marginTop: 'var(--space-6)',
                    paddingTop: 'var(--space-4)',
                    borderTop: '1px solid var(--border-light)'
                }}>
                    {!selectedFinalImage ? (
                        <span style={{ color: 'var(--error-red)', fontSize: 'var(--text-sm)' }}>
                            ⚠️ Please select a core image in Step 2 before proceeding
                        </span>
                    ) : !isStepValid() ? (
                        <span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
                            Please select a border to continue
                        </span>
                    ) : !localSdPrompt?.trim() ? (
                        <span style={{ color: 'var(--error-red)', fontSize: 'var(--text-sm)' }}>
                            ⚠️ Item description required for generation
                        </span>
                    ) : !templateBlob ? (
                        <span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
                            Please select a border to create template
                        </span>
                    ) : isGenerating ? (
                        <span style={{ color: 'var(--primary-blue)', fontSize: 'var(--text-sm)' }}>
                            🎨 Generating card variations...
                        </span>
                    ) : generatedImages.length > 0 && selectedGeneratedImage ? (
                        <span style={{ color: 'var(--success-green)', fontSize: 'var(--text-sm)' }}>
                            ✓ Card variation selected - ready to proceed to next step
                        </span>
                    ) : generatedImages.length > 0 ? (
                        <span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
                            Please select a card variation to continue
                        </span>
                    ) : (
                        <span style={{ color: 'var(--success-green)', fontSize: 'var(--text-sm)' }}>
                            ✓ Ready to generate card variations
                        </span>
                    )}
                </div>
            </div>
        </div >
    );
};

export default Step3BorderGeneration; 