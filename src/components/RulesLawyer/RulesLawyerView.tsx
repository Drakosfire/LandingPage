import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Container, Paper, Stack } from '@mantine/core';
import { DUNGEONMIND_API_URL } from '../../config';
import { useChatContext } from '../../context/ChatContext';
import LoadingModal from './LoadingModal';
import RulesLawyerChat from './RulesLawyerChat';
import RulesetSelector, { RulebookOption } from './RulesetSelector';
import SavedRulesDrawer from './SavedRulesDrawer';
import './RulesLawyerLayout.css';

interface RulesLawyerViewProps {
    savedRulesOpen: boolean;
    onCloseSavedRules: () => void;
}

const RulesLawyerView: React.FC<RulesLawyerViewProps> = ({
    savedRulesOpen,
    onCloseSavedRules,
}) => {
    const { isLoadingEmbeddings, currentEmbedding, loadEmbedding } = useChatContext();
    const [rulebooks, setRulebooks] = useState<RulebookOption[]>([]);
    const [isLoadingRulebooks, setIsLoadingRulebooks] = useState(false);
    const [rulebooksError, setRulebooksError] = useState<string | null>(null);

    const fetchRulebooks = async () => {
        setIsLoadingRulebooks(true);
        setRulebooksError(null);
        try {
            const response = await fetch(`${DUNGEONMIND_API_URL}/api/ruleslawyer/rulebooks`, {
                method: 'GET',
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`Failed to load rulebooks (${response.status})`);
            }

            const data = await response.json();
            setRulebooks(data.rulebooks || []);
        } catch (err) {
            console.error('❌ [RulesLawyer] Failed to load rulebooks:', err);
            setRulebooksError('Unable to load rulebooks. Please try again.');
        } finally {
            setIsLoadingRulebooks(false);
        }
    };

    useEffect(() => {
        fetchRulebooks();
    }, []);

    useEffect(() => {
        if (!rulebooks.length || rulebooks.some(book => book.id === currentEmbedding && book.availabilityStatus === 'available')) return;
        const available = rulebooks.filter(book => book.availabilityStatus === 'available');
        const initial = available.find(book => book.id === 'DnD_PHB_55') ?? available[0];
        if (initial) void loadEmbedding(initial.id);
    }, [rulebooks, currentEmbedding, loadEmbedding]);

    const activeRulebook = useMemo(
        () => rulebooks.find((rulebook) => rulebook.id === currentEmbedding),
        [rulebooks, currentEmbedding]
    );

    const showMissingData = !isLoadingRulebooks && !rulebooksError && rulebooks.length === 0;
    return (
        <Stack gap="lg" className="ruleslawyer-view">
            <LoadingModal isOpen={isLoadingEmbeddings} message="Loading rulebook embeddings..." />

            <Container size="lg" p={0} className="ruleslawyer-view__container">
                <Paper withBorder p="md" className="ruleslawyer-panel">
                    <Stack gap="sm">
                        <RulesetSelector
                            rulebooks={rulebooks}
                            isLoading={isLoadingRulebooks}
                            error={rulebooksError}
                            onRetry={fetchRulebooks}
                        />

                        {showMissingData && (
                            <Alert color="yellow" title="No rulebooks available">
                                Rulebook data is missing. Run ingestion refresh and try again.
                            </Alert>
                        )}
                    </Stack>
                </Paper>

                <div className="ruleslawyer-layout" data-testid="ruleslawyer-layout">
                    <Stack gap="md" data-testid="ruleslawyer-chat-panel">
                        <RulesLawyerChat rulebookTitle={activeRulebook?.title} />
                    </Stack>
                </div>
            </Container>

            <SavedRulesDrawer
                opened={savedRulesOpen}
                onClose={onCloseSavedRules}
                rulebooks={rulebooks}
                defaultRulebookId={currentEmbedding}
            />
        </Stack>
    );
};

export default RulesLawyerView;
