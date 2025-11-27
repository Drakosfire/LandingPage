import React from 'react';
import { ChatProvider, useChatContext } from '../../context/ChatContext';
import ChatInterface from './ChatInterface';
import EmbeddingSelector from './EmbeddingSelector';
import LoadingModal from './LoadingModal';
import './RulesLawyer.css';

const RulesLawyerContent: React.FC = () => {
    const { isLoadingEmbeddings } = useChatContext();

    return (
        <>
            <LoadingModal
                isOpen={isLoadingEmbeddings}
                message="Loading rulebook embeddings..."
            />
            <div className="rules-lawyer-container">
                <h1>Game Rules Lawyer</h1>
                <ChatInterface />
                <div className="controls">
                    <EmbeddingSelector />
                </div>
            </div>
        </>
    );
};

const RulesLawyer: React.FC = () => {
    return (
        <ChatProvider>
            <RulesLawyerContent />
        </ChatProvider>
    );
};

export default RulesLawyer;
