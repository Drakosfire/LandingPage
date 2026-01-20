import React, { useMemo } from 'react';
import { Alert, Button, Group, Loader, Select, Text } from '@mantine/core';
import { useChatContext } from '../../context/ChatContext';

export interface RulebookOption {
    id: string;
    title: string;
    availabilityStatus: 'available' | 'missing_data' | 'disabled';
}

interface RulesetSelectorProps {
    rulebooks: RulebookOption[];
    isLoading: boolean;
    error: string | null;
    onRetry?: () => void;
}

const RulesetSelector: React.FC<RulesetSelectorProps> = ({
    rulebooks,
    isLoading,
    error,
    onRetry
}) => {
    const { currentEmbedding, loadEmbedding, isLoadingEmbeddings } = useChatContext();

    const options = useMemo(
        () =>
            rulebooks.map((rulebook) => ({
                value: rulebook.id,
                label: rulebook.title,
                disabled: rulebook.availabilityStatus !== 'available'
            })),
        [rulebooks]
    );

    const handleChange = async (value: string | null) => {
        if (!value || value === currentEmbedding) return;
        try {
            await loadEmbedding(value);
        } catch (err) {
            console.error('❌ [RulesLawyer] Failed to load rulebook:', err);
        }
    };

    if (error) {
        return (
            <Alert color="red" title="Rulebooks unavailable">
                <Group justify="space-between" align="center">
                    <Text size="sm">{error}</Text>
                    {onRetry && (
                        <Button size="xs" variant="light" onClick={onRetry}>
                            Retry
                        </Button>
                    )}
                </Group>
            </Alert>
        );
    }

    return (
        <Group gap="sm" align="center">
            <Text size="sm" fw={500}>Rulebook</Text>
            {isLoading ? (
                <Loader size="sm" />
            ) : (
                <Select
                    data={options}
                    value={currentEmbedding}
                    onChange={handleChange}
                    disabled={isLoadingEmbeddings}
                    placeholder="Select a rulebook"
                    checkIconPosition="right"
                />
            )}
        </Group>
    );
};

export default RulesetSelector;
