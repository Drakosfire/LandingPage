import React, { useState } from 'react';
import { ItemFormProps } from '../../../types/card.types';

const ItemForm: React.FC<ItemFormProps> = ({ onGenerate }) => {
    const [userIdea, setUserIdea] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        type: '',
        rarity: '',
        value: '',
        properties: '',
        damageFormula: '',
        damageType: '',
        weight: '',
        description: '',
        quote: '',
        sdPrompt: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleIdeaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setUserIdea(e.target.value);
    };

    const handleIdeaSubmit = async () => {
        // TODO: Add API call to process the user's idea
        // This will later connect to your backend/LLM
        console.log("Processing idea:", userIdea);
        // For now, we'll just show an alert
        alert("This will eventually call the API to process your idea!");
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const formattedData = {
            [formData.name]: {
                Name: formData.name,
                Type: formData.type,
                Rarity: formData.rarity,
                Value: formData.value,
                Properties: formData.properties.split(',').map(p => p.trim()),
                Damage: [formData.damageFormula, formData.damageType],
                Weight: formData.weight,
                Description: formData.description,
                Quote: formData.quote,
                'SD Prompt': formData.sdPrompt
            }
        };

        onGenerate(formattedData);
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
                        className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
                    >
                        Process Idea
                    </button>
                </div>
            </div>

            {/* Form Section */}
            <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg">
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
                        <input
                            type="text"
                            name="properties"
                            value={formData.properties}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
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

                <button
                    type="submit"
                    className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                >
                    Generate
                </button>
            </form>
        </div>
    );
};

export default ItemForm;