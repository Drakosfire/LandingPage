import React, { useState } from 'react';
import { useChatContext } from '../../context/ChatContext';
import './EmbeddingSelector.css';
import { DUNGEONMIND_API_URL } from '../../config';

const EmbeddingSelector: React.FC = () => {
    // Header that says "Select an Embedding"
    const header = document.querySelector('.chat-header');
    if (header) {
        header.textContent = 'Select a Rule set to chat with, then click the load button';
    }

    const { setCurrentEmbedding } = useChatContext();
    const [selectedEmbedding, setSelectedEmbedding] = useState('DnD_PHB_55');
    const [isLoading, setIsLoading] = useState(false);

    // This is the list of embeddings that the user can select from that is stored in the backend
    const embeddings = [
        { id: 'DnD_PHB_55', name: 'PHB 2024' },
        { id: 'swon', name: 'Stars Without Number' },
        { id: 'swcr', name: "Swords & Wizardry" },
    ];

    const handleLoadEmbedding = async () => {
        setIsLoading(true);
        console.log('Loading embedding:', selectedEmbedding);
        try {
            const response = await fetch(`${DUNGEONMIND_API_URL}/ruleslawyer/loadembeddings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    embedding: selectedEmbedding,
                    embeddings_file_path: `${selectedEmbedding}_embeddings.csv`,
                    enhanced_json_path: `${selectedEmbedding}.json`
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to load embeddings');
            }

            setCurrentEmbedding(selectedEmbedding);

        } catch (error) {
            console.error('Error loading embeddings:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="embedding-selector-container">
            <h5 className="embedding-selector-header">Select a Rule set to chat with</h5>
            <div className="selector-wrapper">
                <select
                    value={selectedEmbedding}
                    onChange={(e) => setSelectedEmbedding(e.target.value)}
                    className="embedding-selector"
                    disabled={isLoading}
                >
                    {embeddings.map(embedding => (
                        <option key={embedding.id} value={embedding.id}>
                            {embedding.name}
                        </option>
                    ))}
                </select>
                <button
                    onClick={handleLoadEmbedding}
                    className="button-with-image"
                    id="loadEmbeddingButton"
                    disabled={isLoading}
                    title="Load Selected Embedding"
                >
                    {isLoading ? 'Loading...' : ''}
                </button>
            </div>
        </div>
    );
};

export default EmbeddingSelector;
