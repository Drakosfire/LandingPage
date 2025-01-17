import React, { useState, useEffect } from 'react';
import { ItemFormProps } from '../../../types/card.types';
import { DUNGEONMIND_API_URL } from '../../../config';
import { Select, TextInput, Textarea } from '@mantine/core';
import classes from '../../../styles/ItemForm.module.css';

const ItemForm: React.FC<ItemFormProps> = ({ onGenerate, initialData }) => {
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
            const newFormData = {
                name: initialData.name,
                type: initialData.type,
                rarity: initialData.rarity,
                value: initialData.value,
                properties: initialData.properties,
                damageFormula: initialData.damageFormula,
                damageType: initialData.damageType,
                weight: initialData.weight,
                description: initialData.description,
                quote: initialData.quote,
                sdPrompt: initialData.sdPrompt
            };
            setFormData(newFormData);
        }
    }, [initialData]);

    // Modify handleChange to work with Mantine inputs
    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value
        }));
    };

    const handleIdeaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setUserIdea(e.target.value);
    };

    const handleIdeaSubmit = async () => {
        setIsLoading(true);
        setError(null);
        // Check for empty userIdea 
        if (!userIdea.trim()) {
            setError('Please enter a valid idea');
            setIsLoading(false);
            return;
        }
        // Log what is being sent
        console.log(`Sending request to ${DUNGEONMIND_API_URL}/api/cardgenerator/generate-item-dict with body: ${JSON.stringify({ userIdea })}`);
        try {
            const response = await fetch(`${DUNGEONMIND_API_URL}/api/cardgenerator/generate-item-dict`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
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
                properties: item.Properties || '',
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
        }
    };

    return (
        <>
            <div className="space-y-6">
                {/* Idea Input Section */}
                <h3>Step 2: Generate item text</h3>
                <h4> -Or- Write your own</h4>
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