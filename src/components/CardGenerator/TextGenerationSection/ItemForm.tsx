import React, { useState, useEffect } from 'react';
import { ItemFormProps } from '../../../types/card.types';
import { DUNGEONMIND_API_URL } from '../../../config';
import { TextInput, Textarea } from '@mantine/core';
import classes from '../../../styles/ItemForm.module.css';

const ItemForm: React.FC<ItemFormProps> = ({ onGenerate, initialData, onGenerationLockChange }) => {
    const [userIdea, setUserIdea] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        type: '',
        rarity: '',
        value: '',
        properties: [] as string[],
        damageFormula: '',
        damageType: '',
        weight: '',
        description: '',
        quote: '',
        sdPrompt: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Set initial data only once when component mounts or when initialData changes
    useEffect(() => {
        if (initialData) {
            console.log('🔄 ItemForm: Syncing with new initialData:', {
                name: initialData.name,
                type: initialData.type,
                rarity: initialData.rarity,
                value: initialData.value,
                description: initialData.description?.substring(0, 50) + '...'
            });
            console.log('🔄 ItemForm: Current formData before sync:', {
                name: formData.name,
                type: formData.type,
                rarity: formData.rarity,
                value: formData.value,
                description: formData.description?.substring(0, 50) + '...'
            });
            const newFormData = {
                name: initialData.name || '',
                type: initialData.type || '',
                rarity: initialData.rarity || '',
                value: initialData.value || '',
                properties: Array.isArray(initialData.properties) ? initialData.properties : [],
                damageFormula: initialData.damageFormula || '',
                damageType: initialData.damageType || '',
                weight: initialData.weight || '',
                description: initialData.description || '',
                quote: initialData.quote || '',
                sdPrompt: initialData.sdPrompt || ''
            };
            setFormData(newFormData);
            console.log('🔄 ItemForm: Set new formData:', {
                name: newFormData.name,
                type: newFormData.type,
                rarity: newFormData.rarity,
                value: newFormData.value,
                description: newFormData.description?.substring(0, 50) + '...'
            });
        }
    }, [initialData]); // This should trigger when itemDetails state changes

    // Additional sync - ensure we catch changes even if object reference doesn't change
    useEffect(() => {
        if (initialData && (
            formData.name !== initialData.name ||
            formData.description !== initialData.description
        )) {
            console.log('🔄 ItemForm: Field-level sync detected change');
            const newFormData = {
                name: initialData.name || '',
                type: initialData.type || '',
                rarity: initialData.rarity || '',
                value: initialData.value || '',
                properties: Array.isArray(initialData.properties) ? initialData.properties : [],
                damageFormula: initialData.damageFormula || '',
                damageType: initialData.damageType || '',
                weight: initialData.weight || '',
                description: initialData.description || '',
                quote: initialData.quote || '',
                sdPrompt: initialData.sdPrompt || ''
            };
            setFormData(newFormData);
        }
    }, [initialData, formData.name, formData.description]);

    // Debug: Track when formData actually changes
    useEffect(() => {
        console.log('📝 ItemForm: formData state changed:', {
            name: formData.name,
            type: formData.type,
            rarity: formData.rarity,
            value: formData.value,
            description: formData.description?.substring(0, 50) + '...'
        });
    }, [formData]);

    // Modify handleChange to update both local and parent state
    const handleChange = (field: string, value: string) => {
        const newFormData = {
            ...formData,
            [field]: value
        };
        setFormData(newFormData);
        onGenerate(newFormData); // Update parent state
    };

    const handleIdeaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setUserIdea(e.target.value);
    };

    const handleIdeaSubmit = async () => {
        setIsLoading(true);
        onGenerationLockChange?.(true); // 🔒 Lock navigation during generation
        setError(null);
        // Check for empty userIdea 
        if (!userIdea.trim()) {
            setError('Please enter a valid idea');
            setIsLoading(false);
            onGenerationLockChange?.(false); // 🔓 Unlock on early return
            return;
        }
        // Log what is being sent
        // Sending item generation request
        try {
            const response = await fetch(`${DUNGEONMIND_API_URL}/api/cardgenerator/generate-item-dict`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include', // Include session cookies
                body: JSON.stringify({ userIdea })
            });

            const data = await response.json();

            // Assuming the API returns an object with the first (and only) key being the item name
            const itemKey = Object.keys(data)[0];
            const item = data[itemKey];

            // Update the form with the received data
            const newFormData = {
                name: item.Name || '',
                type: item.Type || '',
                rarity: item.Rarity || '',
                value: item.Value || '',
                properties: Array.isArray(item.Properties) ? item.Properties : [],
                damageFormula: item['Damage Formula'] || '',
                damageType: item['Damage Type'] || '',
                weight: item.Weight || '',
                description: item.Description || '',
                quote: item.Quote || '',
                sdPrompt: item['SD Prompt'] || ''
            };

            setFormData(newFormData);
            onGenerate(newFormData);

        } catch (error) {
            setError('Failed to process item. Please try again.');
            console.error('Error processing item:', error);
        } finally {
            setIsLoading(false);
            onGenerationLockChange?.(false); // 🔓 Unlock navigation when done
        }
    };

    // Modify handlePropertyChange to update both local and parent state
    const handlePropertyChange = (index: number, value: string) => {
        const currentProperties = formData.properties || [];
        const updatedProperties = [...currentProperties];
        updatedProperties[index] = value;
        const newFormData = {
            ...formData,
            properties: updatedProperties
        };
        setFormData(newFormData);
        onGenerate(newFormData); // Update parent state
    };

    // Modify addProperty to update both local and parent state
    const addProperty = () => {
        const currentProperties = formData.properties || [];
        const newFormData = {
            ...formData,
            properties: [...currentProperties, '']
        };
        setFormData(newFormData);
        onGenerate(newFormData); // Update parent state
    };

    // Modify removeProperty to update both local and parent state
    const removeProperty = (index: number) => {
        const currentProperties = formData.properties || [];
        const updatedProperties = [...currentProperties];
        updatedProperties.splice(index, 1);
        const newFormData = {
            ...formData,
            properties: updatedProperties
        };
        setFormData(newFormData);
        onGenerate(newFormData); // Update parent state
    };

    return (
        <>
            <div className="space-y-6">
                {/* Idea Input Section */}

                <h4> Generate -Or- Write your own</h4>
                <Textarea
                    placeholder="Describe your item"
                    value={userIdea}
                    onChange={handleIdeaChange}
                    classNames={{
                        root: classes.root,
                        input: classes.input,
                        label: classes.label
                    }}
                />

                <button
                    type="button"
                    onClick={handleIdeaSubmit}
                    disabled={isLoading}
                    className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 disabled:bg-gray-400"
                >

                    {isLoading ? 'Processing...' : 'Generate Item Text'}
                </button>
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

                <TextInput
                    placeholder="Name"
                    value={formData.name}
                    onChange={(event) => handleChange('name', event.currentTarget.value)}
                    classNames={{
                        root: classes.root,
                        input: classes.input,
                        label: classes.label
                    }}
                />

                <TextInput
                    placeholder="Value"
                    value={formData.value}
                    onChange={(event) => handleChange('value', event.currentTarget.value)}
                    classNames={{
                        root: classes.root,
                        input: classes.input,
                        label: classes.label
                    }}
                />

                <TextInput
                    placeholder="Rarity"
                    value={formData.rarity}
                    onChange={(event) => handleChange('rarity', event.currentTarget.value)}
                    classNames={{
                        root: classes.root,
                        input: classes.input,
                        label: classes.label
                    }}
                />

                <TextInput
                    placeholder="Damage Type"
                    value={formData.damageType}
                    onChange={(event) => handleChange('damageType', event.currentTarget.value)}
                    classNames={{
                        root: classes.root,
                        input: classes.input,
                        label: classes.label
                    }}
                />

                <TextInput
                    placeholder="Damage Formula"
                    value={formData.damageFormula}
                    onChange={(event) => handleChange('damageFormula', event.currentTarget.value)}
                    classNames={{
                        root: classes.root,
                        input: classes.input,
                        label: classes.label
                    }}
                />

                <TextInput
                    placeholder="Weight"
                    value={formData.weight}
                    onChange={(event) => handleChange('weight', event.currentTarget.value)}
                    classNames={{
                        root: classes.root,
                        input: classes.input,
                        label: classes.label
                    }}
                />

                {/* Properties Section */}
                <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Properties</h4>
                    {(formData.properties || []).map((property, index) => (
                        <div key={index} className="flex items-center mb-2">
                            <TextInput
                                placeholder={`Property ${index + 1}`}
                                value={property}
                                onChange={(event) => handlePropertyChange(index, event.currentTarget.value)}
                                classNames={{
                                    root: classes.root,
                                    input: classes.input,
                                    label: classes.label
                                }}
                                className="flex-grow"
                            />
                            <button
                                type="button"
                                onClick={() => removeProperty(index)}
                                className="ml-2 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={addProperty}
                        className="mt-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        + Add Property
                    </button>
                </div>

                <Textarea
                    placeholder="Description"
                    value={formData.description}
                    onChange={(event) => handleChange('description', event.currentTarget.value)}
                    classNames={{
                        root: classes.root,
                        input: classes.input,
                        label: classes.label
                    }}
                    minRows={3}
                />

                <Textarea
                    placeholder="Quote"
                    value={formData.quote}
                    onChange={(event) => handleChange('quote', event.currentTarget.value)}
                    classNames={{
                        root: classes.root,
                        input: classes.input,
                        label: classes.label
                    }}
                    minRows={2}
                />

                {/* <Textarea
                    label="SD Prompt"
                    placeholder="SD Prompt"
                    value={formData.sdPrompt}
                    onChange={(event) => handleChange('sdPrompt', event.currentTarget.value)}
                    classNames={classes}
                    minRows={2}
                /> */}
            </div>
        </>
    );
};

export default ItemForm;