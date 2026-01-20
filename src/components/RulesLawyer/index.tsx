// RulesLawyer/index.tsx - Updated with UnifiedHeader
// Uses generator-layout pattern matching StatBlockGenerator/PlayerCharacterGenerator
import React, { useCallback, useState } from 'react';
import { ChatProvider, useChatContext } from '../../context/ChatContext';
import { UnifiedHeader } from '../UnifiedHeader';
import { createRulesLawyerToolboxSections } from './rulesLawyerToolboxConfig';
import '../../styles/CardGeneratorLayout.css'; // Use shared generator layout
import './RulesLawyer.css';
import RulesLawyerView from './RulesLawyerView';

// Rules Lawyer icon URL
const RULES_LAWYER_ICON_URL = 'https://imagedelivery.net/SahcvrNe_-ej4lTB6vsAZA/0ed83976-6007-4b56-7943-1c08d3117e00/public';
const SAVED_RULES_ICON_URL = 'https://imagedelivery.net/SahcvrNe_-ej4lTB6vsAZA/f825f833-5a96-44ba-f9c3-5908ce8c5000/Full';

const RulesLawyerContent: React.FC = () => {
    const { clearMessages } = useChatContext();
    const [savedRulesOpen, setSavedRulesOpen] = useState(false);

    const handleClearChat = useCallback(() => {
        console.log('🗑️ [RulesLawyer] Clear chat clicked');
        clearMessages();
    }, [clearMessages]);

    const handleOpenSavedRules = useCallback(() => {
        setSavedRulesOpen(true);
    }, []);

    const handleCloseSavedRules = useCallback(() => {
        setSavedRulesOpen(false);
    }, []);

    // Create toolbox sections for chat actions
    const toolboxSections = createRulesLawyerToolboxSections({
        onClearChat: handleClearChat,
    });

    return (
        <div className="generator-layout">
            <UnifiedHeader
                app={{ id: 'rules-lawyer', name: 'Rules Lawyer', icon: RULES_LAWYER_ICON_URL }}
                toolboxSections={toolboxSections}
                showAuth={true}
                showSavedRules={true}
                onSavedRulesClick={handleOpenSavedRules}
                savedRulesIconUrl={SAVED_RULES_ICON_URL}
            />
            <div className="rules-lawyer-content">
                <RulesLawyerView
                    savedRulesOpen={savedRulesOpen}
                    onCloseSavedRules={handleCloseSavedRules}
                />
            </div>
        </div>
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
