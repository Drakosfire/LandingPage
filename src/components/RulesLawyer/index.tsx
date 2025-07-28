import React from 'react';
import { ChatProvider } from '../../context/ChatContext';
import ChatInterface from './ChatInterface';
import EmbeddingSelector from './EmbeddingSelector';
import './RulesLawyer.css';

const RulesLawyer: React.FC = () => {
    return (
        <ChatProvider>
            <div className="rules-lawyer-container">
                <h1>Game Rules Lawyer</h1>
                <ChatInterface />
                <div className="controls">
                    <EmbeddingSelector />
                </div>
            </div>
        </ChatProvider>
    );
};

export default RulesLawyer;
