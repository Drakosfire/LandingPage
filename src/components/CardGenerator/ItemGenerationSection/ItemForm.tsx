import React, { useState, useEffect } from 'react';
import { ItemFormProps } from '../../../types/card.types';
import { DUNGEONMIND_API_URL } from '../../../config';

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

    // Handle form field changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const newFormData = {
            ...formData,
            [name]: value
        };
        setFormData(newFormData);

        // Debounce the onGenerate call to prevent too many updates
        const timeoutId = setTimeout(() => {
            onGenerate(newFormData);
        }, 300);

        return () => clearTimeout(timeoutId);
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
        <div className="space-y-6">
            {/* Idea Input Section */}
            <div className="bg-gray-50 p-4 rounded-lg border">
                <h3 className="text-lg font-medium mb-2">Enter Your Item Idea</h3>
                <div className="space-y-4">
                    <textarea
                        value={userIdea}
                        onChange={handleIdeaChange}
                        className="w-full p-3 border rounded-lg h-32"
                        placeholder="Describe your item idea here... (e.g., 'A magical sword that glows in the presence of evil and can shoot ice beams')"
                    />
                    <button
                        type="button"
                        onClick={handleIdeaSubmit}
                        disabled={isLoading}
                        className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 disabled:bg-gray-400"
                    >
                        {isLoading ? 'Processing...' : 'Process Idea'}
                    </button>
                    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                </div>
            </div>

            {/* Form Section */}
            <div className="space-y-4 p-4 border rounded-lg">
                <h3 className="text-lg font-medium mb-2">Item Details</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Name:</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Type:</label>
                        <input
                            type="text"
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Rarity:</label>
                        <input
                            type="text"
                            name="rarity"
                            value={formData.rarity}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Value:</label>
                        <input
                            type="text"
                            name="value"
                            value={formData.value}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Properties (comma-separated):</label>
                        <textarea
                            name="properties"
                            value={formData.properties}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                            rows={3}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Damage Formula:</label>
                        <input
                            type="text"
                            name="damageFormula"
                            value={formData.damageFormula}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Damage Type:</label>
                        <input
                            type="text"
                            name="damageType"
                            value={formData.damageType}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Weight:</label>
                        <input
                            type="text"
                            name="weight"
                            value={formData.weight}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Description:</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                            rows={3}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Quote:</label>
                        <textarea
                            name="quote"
                            value={formData.quote}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                            rows={2}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">SD Prompt:</label>
                        <textarea
                            name="sdPrompt"
                            value={formData.sdPrompt}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                            rows={3}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ItemForm;