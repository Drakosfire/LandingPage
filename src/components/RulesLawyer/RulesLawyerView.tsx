import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Container, Paper, SimpleGrid, Stack, Text } from '@mantine/core';
import { DUNGEONMIND_API_URL } from '../../config';
import { useChatContext } from '../../context/ChatContext';
import LoadingModal from './LoadingModal';
import RulesLawyerChat from './RulesLawyerChat';
import RulesetSelector, { RulebookOption } from './RulesetSelector';
import SavedRulesPanel from './SavedRulesPanel';

const RulesLawyerView: React.FC = () => {
    const { isLoadingEmbeddings, currentEmbedding } = useChatContext();
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

                <SimpleGrid
                    cols={{ base: 1, md: 2 }}
                    spacing="lg"
                    className="ruleslawyer-layout"
                    data-testid="ruleslawyer-layout"
                >
                    <Stack gap="md" data-testid="ruleslawyer-chat-panel">
                        <RulesLawyerChat rulebookTitle={activeRulebook?.title} />
                    </Stack>

                    <Paper withBorder p="md" className="ruleslawyer-panel" data-testid="ruleslawyer-saved-panel">
                        <Stack gap="xs">
                            <Text size="sm" fw={600}>Saved Rules</Text>
                            <SavedRulesPanel />
                        </Stack>
                    </Paper>
                </SimpleGrid>
            </Container>
        </Stack>
    );
};

export default RulesLawyerView;
