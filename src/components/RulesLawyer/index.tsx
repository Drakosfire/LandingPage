// RulesLawyer/index.tsx - Updated with UnifiedHeader
import React, { useCallback } from 'react';
import { ChatProvider, useChatContext } from '../../context/ChatContext';
import ChatInterface from './ChatInterface';
import EmbeddingSelector from './EmbeddingSelector';
import LoadingModal from './LoadingModal';
import { UnifiedHeader } from '../UnifiedHeader';
import { createRulesLawyerToolboxSections } from './rulesLawyerToolboxConfig';
import './RulesLawyer.css';

// Rules Lawyer icon URL
const RULES_LAWYER_ICON_URL = 'https://imagedelivery.net/SahcvrNe_-ej4lTB6vsAZA/0ed83976-6007-4b56-7943-1c08d3117e00/public';

const RulesLawyerContent: React.FC = () => {
    const { isLoadingEmbeddings, clearMessages } = useChatContext();

    const handleClearChat = useCallback(() => {
        console.log('🗑️ [RulesLawyer] Clear chat clicked');
        clearMessages();
    }, [clearMessages]);

    // Create toolbox sections with embedding selector as component
    const toolboxSections = createRulesLawyerToolboxSections({
        onClearChat: handleClearChat,
        embeddingSelectorComponent: <EmbeddingSelector />
    });

    return (
        <>
            <LoadingModal
                isOpen={isLoadingEmbeddings}
                message="Loading rulebook embeddings..."
            />
            <UnifiedHeader
                app={{ id: 'rules-lawyer', name: 'Rules Lawyer', icon: RULES_LAWYER_ICON_URL }}
                toolboxSections={toolboxSections}
                showAuth={true}
            />
            <div className="rules-lawyer-container">
                <ChatInterface />
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
