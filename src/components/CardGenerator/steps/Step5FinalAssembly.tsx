import React, { useState, useEffect } from 'react';
import { ItemDetails } from '../../../types/card.types';
import { DUNGEONMIND_API_URL } from '../../../config';
import { TextInput, Textarea, Button, Stack, Grid, Card, Text, Badge, Group } from '@mantine/core';
import { ClickableImage } from '../shared';
import '../../../styles/DesignSystem.css';

interface Step5FinalAssemblyProps {
    itemDetails: ItemDetails;
    selectedGeneratedCardImage: string; // The selected card from Step 3 with border
    onComplete: () => void;
    onItemDetailsChange?: (updatedDetails: ItemDetails) => void; // Callback to update parent state
    onCardRendered?: (cardUrl: string, cardName: string) => void; // NEW: For persistence
    finalCardWithText?: string; // NEW: Pass existing final card from parent state
}

const Step5FinalAssembly: React.FC<Step5FinalAssemblyProps> = ({
    itemDetails,
    selectedGeneratedCardImage,
    onComplete,
    onItemDetailsChange,
    onCardRendered,
    finalCardWithText: propFinalCardWithText
}) => {
    const [finalCardWithText, setFinalCardWithText] = useState<string | null>(propFinalCardWithText || null);
    const [isRenderingText, setIsRenderingText] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Local state for editing text parameters
    const [editableDetails, setEditableDetails] = useState<ItemDetails>(itemDetails);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Track prop changes for project switching detection
    const [lastPropFinalCard, setLastPropFinalCard] = useState<string | undefined>(propFinalCardWithText);

    // Handle prop changes (project switching and initial load)
    useEffect(() => {
        const hasChanged = lastPropFinalCard !== propFinalCardWithText;

        if (hasChanged) {
            console.log('🎯 Step5: Final card prop changed - updating local state:', {
                from: lastPropFinalCard,
                to: propFinalCardWithText
            });
            setFinalCardWithText(propFinalCardWithText || null);
            setLastPropFinalCard(propFinalCardWithText);
        } else if (propFinalCardWithText && !finalCardWithText) {
            // Initial load case - only restore if local is empty
            console.log('🎯 Step5: Initial load - setting final card from props');
            setFinalCardWithText(propFinalCardWithText);
            setLastPropFinalCard(propFinalCardWithText);
        }
    }, [propFinalCardWithText, lastPropFinalCard, finalCardWithText]);

    // Auto-generate card with text when component loads with selected card
    useEffect(() => {
        if (selectedGeneratedCardImage && itemDetails && !finalCardWithText) {
            handleRenderCardWithText(itemDetails);
        }
    }, [selectedGeneratedCardImage, itemDetails, finalCardWithText]);

    // Update local state when parent itemDetails change (but only if we don't have unsaved changes)
    useEffect(() => {
        // Only update local state if we don't have unsaved changes
        // This prevents overwriting user edits with stale parent data
        if (!hasUnsavedChanges) {
            console.log('🔄 Step5: Updating editableDetails from parent itemDetails');
            setEditableDetails(itemDetails);
        } else {
            console.log('🔄 Step5: Skipping parent update due to unsaved changes');
        }
    }, [itemDetails, hasUnsavedChanges]);

    const handleRenderCardWithText = async (details: ItemDetails = editableDetails) => {
        if (!selectedGeneratedCardImage || !details) return;

        setIsRenderingText(true);
        setError(null);

        try {
            // Convert properties array to list of strings
            const propertiesList = details.properties.map(property => property.trim());

            const requestBody = {
                image_url: selectedGeneratedCardImage,
                item_details: {
                    Name: details.name,
                    Type: details.type,
                    Rarity: details.rarity,
                    Value: details.value,
                    Properties: propertiesList,
                    "Damage Formula": details.damageFormula,
                    "Damage Type": details.damageType,
                    Weight: details.weight,
                    Description: details.description,
                    Quote: details.quote,
                    "SD Prompt": details.sdPrompt
                }
            };

            const response = await fetch(`${DUNGEONMIND_API_URL}/api/v1/cardgenerator/render-text-with-url`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Failed to render card text: ${JSON.stringify(errorData)}`);
            }

            const data = await response.json();
            setFinalCardWithText(data.url);

            // ✅ NEW: Save to persistent state via parent callback
            if (onCardRendered) {
                onCardRendered(data.url, details.name || 'card');
            }

            // Note: Parent state is already updated via handleFieldChange calls
            // Reset unsaved changes flag after successful render
            setHasUnsavedChanges(false);
        } catch (err) {
            console.error('Error rendering card with text:', err);
            setError('Failed to render card with text. Please try again.');
        } finally {
            setIsRenderingText(false);
        }
    };

    const handleFieldChange = (field: keyof ItemDetails, value: string | string[]) => {
        const updatedDetails = {
            ...editableDetails,
            [field]: value
        };
        setEditableDetails(updatedDetails);
        setHasUnsavedChanges(true);

        // ✅ NEW: Immediately update parent state to trigger auto-save
        if (onItemDetailsChange) {
            onItemDetailsChange(updatedDetails);
        }
    };

    const handlePropertyChange = (index: number, value: string) => {
        const newProperties = [...editableDetails.properties];
        newProperties[index] = value;
        handleFieldChange('properties', newProperties);
    };

    const addProperty = () => {
        handleFieldChange('properties', [...editableDetails.properties, '']);
    };

    const removeProperty = (index: number) => {
        const newProperties = editableDetails.properties.filter((_, i) => i !== index);
        handleFieldChange('properties', newProperties);
    };

    const handleApplyChanges = () => {
        handleRenderCardWithText(editableDetails);
    };

    const handleDownload = async (format: 'png' | 'pdf') => {
        if (!finalCardWithText) return;

        try {
            const link = document.createElement('a');
            link.href = finalCardWithText;
            link.download = `${editableDetails.name || 'card'}.${format}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Download failed:', error);
        }
    };

    return (
        <div
            id="step-panel-final-assembly"
            role="tabpanel"
            aria-labelledby="step-tab-final-assembly"
            className="step-panel"
        >
            <div className="container">
                {/* Missing Generated Card Warning */}
                {!selectedGeneratedCardImage && (
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
                                        No Card Selected
                                    </h4>
                                    <p style={{
                                        fontSize: 'var(--text-base)',
                                        color: 'var(--text-secondary)',
                                        margin: 0
                                    }}>
                                        Please go back to Step 3 to generate and select a card before proceeding.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {selectedGeneratedCardImage && (
                    <Grid gutter="md">
                        {/* Text Editing Panel */}
                        <Grid.Col span={{ base: 12, lg: 6 }}>
                            <Card shadow="sm" padding="lg" radius="md" withBorder>
                                <Stack gap="md">
                                    <Group justify="space-between" align="center">
                                        <Text size="xl" fw={600}>
                                            📝 Edit Card Text
                                        </Text>
                                        {hasUnsavedChanges && (
                                            <Badge color="blue" variant="light">
                                                Changes Pending
                                            </Badge>
                                        )}
                                    </Group>

                                    <TextInput
                                        label="Name"
                                        placeholder="Item name"
                                        value={editableDetails.name}
                                        onChange={(e) => handleFieldChange('name', e.currentTarget.value)}
                                    />

                                    <Grid>
                                        <Grid.Col span={6}>
                                            <TextInput
                                                label="Type"
                                                placeholder="Weapon, Armor, etc."
                                                value={editableDetails.type}
                                                onChange={(e) => handleFieldChange('type', e.currentTarget.value)}
                                            />
                                        </Grid.Col>
                                        <Grid.Col span={6}>
                                            <TextInput
                                                label="Rarity"
                                                placeholder="Common, Uncommon, etc."
                                                value={editableDetails.rarity}
                                                onChange={(e) => handleFieldChange('rarity', e.currentTarget.value)}
                                            />
                                        </Grid.Col>
                                    </Grid>

                                    <Grid>
                                        <Grid.Col span={6}>
                                            <TextInput
                                                label="Value"
                                                placeholder="50 gp"
                                                value={editableDetails.value}
                                                onChange={(e) => handleFieldChange('value', e.currentTarget.value)}
                                            />
                                        </Grid.Col>
                                        <Grid.Col span={6}>
                                            <TextInput
                                                label="Weight"
                                                placeholder="2 lbs"
                                                value={editableDetails.weight}
                                                onChange={(e) => handleFieldChange('weight', e.currentTarget.value)}
                                            />
                                        </Grid.Col>
                                    </Grid>

                                    <Grid>
                                        <Grid.Col span={6}>
                                            <TextInput
                                                label="Damage Formula"
                                                placeholder="1d8"
                                                value={editableDetails.damageFormula}
                                                onChange={(e) => handleFieldChange('damageFormula', e.currentTarget.value)}
                                            />
                                        </Grid.Col>
                                        <Grid.Col span={6}>
                                            <TextInput
                                                label="Damage Type"
                                                placeholder="Slashing"
                                                value={editableDetails.damageType}
                                                onChange={(e) => handleFieldChange('damageType', e.currentTarget.value)}
                                            />
                                        </Grid.Col>
                                    </Grid>

                                    <Textarea
                                        label="Description"
                                        placeholder="Item description"
                                        rows={4}
                                        value={editableDetails.description}
                                        onChange={(e) => handleFieldChange('description', e.currentTarget.value)}
                                    />

                                    <Textarea
                                        label="Quote"
                                        placeholder="Flavor text or quote"
                                        rows={2}
                                        value={editableDetails.quote}
                                        onChange={(e) => handleFieldChange('quote', e.currentTarget.value)}
                                    />

                                    {/* Properties Section */}
                                    <div>
                                        <Text size="sm" fw={500} mb="xs">Properties</Text>
                                        <Stack gap="xs">
                                            {editableDetails.properties.map((property, index) => (
                                                <Group key={index} gap="xs">
                                                    <TextInput
                                                        placeholder={`Property ${index + 1}`}
                                                        value={property}
                                                        onChange={(e) => handlePropertyChange(index, e.currentTarget.value)}
                                                        style={{ flex: 1 }}
                                                    />
                                                    <Button
                                                        variant="subtle"
                                                        color="red"
                                                        size="sm"
                                                        onClick={() => removeProperty(index)}
                                                    >
                                                        ✕
                                                    </Button>
                                                </Group>
                                            ))}
                                            <Button
                                                variant="light"
                                                size="sm"
                                                onClick={addProperty}
                                            >
                                                + Add Property
                                            </Button>
                                        </Stack>
                                    </div>

                                    {/* Apply Changes Button */}
                                    <Button
                                        onClick={handleApplyChanges}
                                        disabled={!hasUnsavedChanges || isRenderingText}
                                        loading={isRenderingText}
                                        fullWidth
                                        size="md"
                                    >
                                        {isRenderingText ? 'Rendering Card...' : 'Re-render Card with Changes'}
                                    </Button>

                                    {error && (
                                        <Text color="red" size="sm">
                                            {error}
                                        </Text>
                                    )}
                                </Stack>
                            </Card>
                        </Grid.Col>

                        {/* Card Preview Panel */}
                        <Grid.Col span={{ base: 12, lg: 6 }}>
                            <Card shadow="sm" padding="lg" radius="md" withBorder>
                                <Stack gap="md">
                                    <Text size="xl" fw={600}>
                                        🎨 Card Preview
                                    </Text>

                                    {/* Selected Card from Step 3 */}
                                    <div>
                                        <Text size="sm" fw={500} mb="xs" color="dimmed">
                                            Original Design (Step 3)
                                        </Text>
                                        <div style={{ textAlign: 'center' }}>
                                            <ClickableImage
                                                src={selectedGeneratedCardImage}
                                                alt="Selected card design from Step 3"
                                                title="Original Card Design"
                                                description="Card design from Step 3 before adding text"
                                                style={{
                                                    width: '100%',
                                                    maxWidth: '250px',
                                                    height: 'auto',
                                                    aspectRatio: '3/4',
                                                    objectFit: 'contain',
                                                    borderRadius: 'var(--radius-base)',
                                                    border: '2px solid #000000',
                                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                                    backgroundColor: '#f8f9fa'
                                                }}
                                                showExpandButton={true}
                                                expandButtonPosition="top-right"
                                                downloadFilename="original-card-design.png"
                                            />
                                        </div>
                                    </div>

                                    {/* Final Card with Text */}
                                    <div>
                                        <Text size="sm" fw={500} mb="xs" color="dimmed">
                                            Final Card with Text
                                        </Text>

                                        {isRenderingText && (
                                            <div style={{ textAlign: 'center', padding: '2rem' }}>
                                                <div style={{
                                                    width: '32px',
                                                    height: '32px',
                                                    border: '3px solid var(--primary-blue)',
                                                    borderTop: '3px solid transparent',
                                                    borderRadius: '50%',
                                                    animation: 'spin 1s linear infinite',
                                                    margin: '0 auto 1rem auto'
                                                }} />
                                                <Text size="sm" color="blue">
                                                    Rendering text changes...
                                                </Text>
                                            </div>
                                        )}

                                        {finalCardWithText && !isRenderingText && (
                                            <div style={{ textAlign: 'center' }}>
                                                <ClickableImage
                                                    src={finalCardWithText}
                                                    alt="Final card with text"
                                                    title="Final Card with Text"
                                                    description="Complete card with all text and details added"
                                                    style={{
                                                        width: '100%',
                                                        maxWidth: '250px',
                                                        height: 'auto',
                                                        aspectRatio: '3/4',
                                                        objectFit: 'contain',
                                                        borderRadius: 'var(--radius-base)',
                                                        border: '2px solid #000000',
                                                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                                        backgroundColor: '#f8f9fa'
                                                    }}
                                                    showExpandButton={true}
                                                    expandButtonPosition="top-right"
                                                    downloadFilename={`${editableDetails.name || 'final-card'}.png`}
                                                />

                                                {/* Download Options */}
                                                <Group justify="center" mt="md">
                                                    <Button
                                                        onClick={() => handleDownload('png')}
                                                        variant="filled"
                                                        size="sm"
                                                    >
                                                        📥 Download PNG
                                                    </Button>
                                                    <Button
                                                        onClick={() => handleDownload('pdf')}
                                                        variant="outline"
                                                        size="sm"
                                                    >
                                                        📄 Download PDF
                                                    </Button>
                                                </Group>
                                            </div>
                                        )}

                                        {!isRenderingText && !error && !finalCardWithText && (
                                            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚡</div>
                                                <Text size="sm">
                                                    Card will be generated automatically when ready.
                                                </Text>
                                            </div>
                                        )}
                                    </div>
                                </Stack>
                            </Card>
                        </Grid.Col>
                    </Grid>
                )}
            </div>
        </div>
    );
};

export default Step5FinalAssembly; 