import React, { useState } from 'react';
import { useChatContext } from '../../context/ChatContext';
import './EmbeddingSelector.css';

const EmbeddingSelector: React.FC = () => {

    const {
        currentEmbedding,
        embeddingsLoaded,
        isLoadingEmbeddings,
        setCurrentEmbedding,
        loadEmbedding
    } = useChatContext();
    const [selectedEmbedding, setSelectedEmbedding] = useState('DnD_PHB_55');

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
        try {
            await loadEmbedding(selectedEmbedding);
        } catch (error) {
            console.error('Error loading embeddings:', error);
            // Error is already logged in ChatContext
        }
    };

    return (
        <div className="embedding-selector-container">
            <h5 className="embedding-selector-header">
                {embeddingsLoaded
                    ? `Current Rule Set: ${embeddingDisplayNames[currentEmbedding] || currentEmbedding}`
                    : 'Select a Rule set to chat with'}
            </h5>
            <div className="selector-wrapper">
                <select
                    value={selectedEmbedding}
                    onChange={(e) => setSelectedEmbedding(e.target.value)}
                    className="embedding-selector"
                    disabled={isLoadingEmbeddings}
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
                    disabled={isLoadingEmbeddings || selectedEmbedding === currentEmbedding}
                    title={isLoadingEmbeddings ? 'Loading...' : selectedEmbedding === currentEmbedding ? 'Already loaded' : 'Load Selected Embedding'}
                    aria-label={isLoadingEmbeddings ? 'Loading embeddings' : selectedEmbedding === currentEmbedding ? 'Already loaded' : 'Load Selected Embedding'}
                >
                    {/* Icon only - no text overlay */}
                </button>
            </div>
        </div>
    );
};

export default EmbeddingSelector;
