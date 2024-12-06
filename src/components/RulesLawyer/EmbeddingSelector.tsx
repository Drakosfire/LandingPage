import React, { useState } from 'react';
import { useChatContext } from '../../context/ChatContext';
import './EmbeddingSelector.css';
import { DUNGEONMIND_API_URL } from '../../config';

const EmbeddingSelector: React.FC = () => {

    const { setCurrentEmbedding } = useChatContext();
    const [selectedEmbedding, setSelectedEmbedding] = useState('DnD_PHB_55');
    const [isLoading, setIsLoading] = useState(false);

    // This is the list of embeddings that the user can select from that is stored in the backend
    const embeddings = [
        { id: 'DnD_PHB_55', name: 'PHB 2024' },
        { id: 'swon', name: 'Stars Without Number' },
        { id: 'swcr', name: "Swords & Wizardry" },
        { id: 'PathGM', name: "Pathfinder GMG" },
    ];

    // This is only used for display purposes
    const embeddingDisplayNames: { [key: string]: string } = {
        'DnD_PHB_55': 'DnD 2024 PHB Lawyer',
        'swon': 'Stars Without Number Lawyer',
        'swcr': "Swords & Wizardry Complete Revised Lawyer",
        'PathGM': "Pathfinder GMG Lawyer"
    };

    const handleLoadEmbedding = async () => {
        setIsLoading(true);
        console.log('Loading embedding:', embeddingDisplayNames[selectedEmbedding]);
        try {
            const response = await fetch(`${DUNGEONMIND_API_URL}/api/ruleslawyer/loadembeddings`, {
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
            <h5 className="embedding-selector-header">Select a Rule set to chat with, then load it</h5>
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
            {/* TODO: Uncomment this when we have a way to ping the backend and get the current embedding */}
            {/* <h5 className="embedding-selector-header"> Current Embedding: {embeddingDisplayNames[selectedEmbedding]} </h5> */}
        </div>
    );
};

export default EmbeddingSelector;
