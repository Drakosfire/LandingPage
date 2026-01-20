// RulesLawyer/index.tsx - Updated with UnifiedHeader
import React, { useCallback } from 'react';
import { ChatProvider, useChatContext } from '../../context/ChatContext';
import { UnifiedHeader } from '../UnifiedHeader';
import { createRulesLawyerToolboxSections } from './rulesLawyerToolboxConfig';
import './RulesLawyer.css';
import RulesLawyerView from './RulesLawyerView';

// Rules Lawyer icon URL
const RULES_LAWYER_ICON_URL = 'https://imagedelivery.net/SahcvrNe_-ej4lTB6vsAZA/0ed83976-6007-4b56-7943-1c08d3117e00/public';

const RulesLawyerContent: React.FC = () => {
    const { isLoadingEmbeddings, clearMessages } = useChatContext();

    const handleClearChat = useCallback(() => {
        console.log('🗑️ [RulesLawyer] Clear chat clicked');
        clearMessages();
    }, [clearMessages]);

    // Create toolbox sections for chat actions
    const toolboxSections = createRulesLawyerToolboxSections({
        onClearChat: handleClearChat,
    });

    return (
        <>
            <UnifiedHeader
                app={{ id: 'rules-lawyer', name: 'Rules Lawyer', icon: RULES_LAWYER_ICON_URL }}
                toolboxSections={toolboxSections}
                showAuth={true}
            />
            <div className="rules-lawyer-container">
                <RulesLawyerView />
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
