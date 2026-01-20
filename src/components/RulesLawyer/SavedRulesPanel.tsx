import React from 'react';
import { Accordion, Badge, Button, Group, Stack, Text } from '@mantine/core';
import { useChatContext } from '../../context/ChatContext';

const SavedRulesPanel: React.FC = () => {
    const { savedRules } = useChatContext();

    if (savedRules.length === 0) {
        return (
            <Text size="sm" c="dimmed">
                No saved rules yet.
            </Text>
        );
    }

    return (
        <Accordion variant="contained">
            {savedRules.map((rule) => (
                <Accordion.Item key={rule.id} value={rule.id}>
                    <Accordion.Control>
                        <Group justify="space-between" align="center">
                            <Text size="sm" fw={500}>{rule.queryText}</Text>
                            <Badge size="xs" variant="light">
                                {rule.citations.length} citations
                            </Badge>
                        </Group>
                    </Accordion.Control>
                    <Accordion.Panel>
                        <Stack gap="xs">
                            <Text size="sm" c="dimmed">
                                {rule.responseText}
                            </Text>
                            <Group gap="xs">
                                {rule.tags.map((tag) => (
                                    <Badge key={tag} size="xs" variant="outline">
                                        {tag}
                                    </Badge>
                                ))}
                            </Group>
                            <Button size="xs" variant="light" onClick={() => navigator.clipboard?.writeText(rule.responseText)}>
                                Copy
                            </Button>
                        </Stack>
                    </Accordion.Panel>
                </Accordion.Item>
            ))}
        </Accordion>
    );
};

export default SavedRulesPanel;
