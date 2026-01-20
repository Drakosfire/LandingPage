import React, { useEffect, useMemo, useState } from 'react';
import {
    Badge,
    Button,
    Card,
    Divider,
    Drawer,
    Group,
    Modal,
    ScrollArea,
    Select,
    Stack,
    Text,
    Textarea,
    TextInput,
    Title,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { IconBook, IconEdit, IconTrash } from '@tabler/icons-react';
import DeleteConfirmationModal from '../CardGenerator/DeleteConfirmationModal';
import { SavedRule, UpdateSavedRulePayload, useChatContext } from '../../context/ChatContext';
import { RulebookOption } from './RulesetSelector';

interface SavedRulesDrawerProps {
    opened: boolean;
    onClose: () => void;
    rulebooks: RulebookOption[];
    defaultRulebookId?: string;
}

const SavedRulesDrawer: React.FC<SavedRulesDrawerProps> = ({
    opened,
    onClose,
    rulebooks,
    defaultRulebookId,
}) => {
    const { savedRules, updateSavedRule, deleteSavedRule } = useChatContext();
    const [selectedRulebookId, setSelectedRulebookId] = useState<string>('all');
    const [activeRule, setActiveRule] = useState<SavedRule | null>(null);
    const [editQueryText, setEditQueryText] = useState('');
    const [editResponseText, setEditResponseText] = useState('');
    const [editTags, setEditTags] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // Responsive breakpoints matching UnifiedHeader
    const isMobile = useMediaQuery('(max-width: 768px)');
    const isTablet = useMediaQuery('(max-width: 1024px)');

    // Responsive header height: Desktop: 88px, Tablet: 82px, Mobile: 60px
    const headerHeight = isMobile ? 60 : isTablet ? 82 : 88;

    // Responsive modal offset based on header height
    // Desktop: 88px header → 90px offset, Tablet: 82px → 84px, Mobile: fullScreen
    const modalYOffset = isMobile ? '0px' : isTablet ? '84px' : '90px';

    useEffect(() => {
        if (!opened) return;
        setSelectedRulebookId(defaultRulebookId || 'all');
    }, [opened, defaultRulebookId]);

    const rulebookOptions = useMemo(
        () => [
            { value: 'all', label: 'All rulebooks' },
            ...rulebooks.map((rulebook) => ({
                value: rulebook.id,
                label: rulebook.title,
            })),
        ],
        [rulebooks]
    );

    const rulebookLabelMap = useMemo(() => {
        return rulebooks.reduce<Record<string, string>>((acc, rulebook) => {
            acc[rulebook.id] = rulebook.title;
            return acc;
        }, {});
    }, [rulebooks]);

    const filteredRules = useMemo(() => {
        if (selectedRulebookId === 'all') return savedRules;
        return savedRules.filter((rule) => rule.rulebookId === selectedRulebookId);
    }, [savedRules, selectedRulebookId]);

    const sortedRules = useMemo(() => {
        return [...filteredRules].sort((a, b) => {
            const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return bTime - aTime;
        });
    }, [filteredRules]);

    const handleOpenRule = (rule: SavedRule) => {
        setActiveRule(rule);
        setEditQueryText(rule.queryText);
        setEditResponseText(rule.responseText);
        setEditTags(rule.tags.join(', '));
    };

    const handleCloseRuleModal = () => {
        setActiveRule(null);
        setEditQueryText('');
        setEditResponseText('');
        setEditTags('');
    };

    const handleSaveRule = async () => {
        if (!activeRule) return;
        const payload: UpdateSavedRulePayload = {
            queryText: editQueryText.trim(),
            responseText: editResponseText.trim(),
            tags: editTags
                .split(',')
                .map((tag) => tag.trim())
                .filter(Boolean),
        };

        setIsSaving(true);
        try {
            await updateSavedRule(activeRule.id, payload);
            handleCloseRuleModal();
        } catch (error) {
            console.error('❌ [RulesLawyer] Failed to update saved rule:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteRule = async () => {
        if (!activeRule) return;
        try {
            await deleteSavedRule(activeRule.id);
            handleCloseRuleModal();
        } catch (error) {
            console.error('❌ [RulesLawyer] Failed to delete saved rule:', error);
        }
    };

    const getCitationPages = (rule: SavedRule) => {
        const pages = rule.citations.map((citation) => citation.page).filter(Boolean);
        return Array.from(new Set(pages)).sort((a, b) => a - b);
    };

    return (
        <>
            <Drawer
                opened={opened}
                onClose={onClose}
                position="right"
                size="md"
                title={
                    <Group gap="sm">
                        <IconBook size={20} />
                        <Title order={4}>Saved Rules</Title>
                        <Badge variant="light" color="blue">
                            {sortedRules.length}
                        </Badge>
                    </Group>
                }
                closeButtonProps={{
                    'aria-label': 'Close saved rules drawer',
                }}
                overlayProps={{ opacity: 0.3, blur: 2 }}
                styles={{
                    inner: {
                        top: `${headerHeight}px`,
                        height: `calc(100vh - ${headerHeight}px)`,
                    },
                    content: {
                        height: '100%',
                        maxHeight: '100%',
                    },
                    body: {
                        height: `calc(100vh - ${headerHeight}px - 60px)`,
                        maxHeight: `calc(100vh - ${headerHeight}px - 60px)`,
                        overflow: 'auto',
                    },
                }}
            >
                <Stack gap="md" h="100%">
                    <Stack gap="xs">
                        <Text size="sm" fw={500}>
                            Rulebook
                        </Text>
                        <Select
                            data={rulebookOptions}
                            value={selectedRulebookId}
                            onChange={(value) => setSelectedRulebookId(value || 'all')}
                            placeholder="Filter by rulebook"
                            searchable
                            nothingFoundMessage="No rulebooks found"
                        />
                    </Stack>

                    <Divider />

                    <ScrollArea flex={1} type="scroll">
                        <Stack gap="sm" style={{ paddingRight: '6px' }}>
                            {sortedRules.length === 0 ? (
                                <Text size="sm" c="dimmed" ta="center">
                                    No saved rules for this rulebook yet.
                                </Text>
                            ) : (
                                sortedRules.map((rule) => {
                                    const pages = getCitationPages(rule);
                                    const rulebookLabel = rulebookLabelMap[rule.rulebookId] || rule.rulebookId;

                                    return (
                                        <Card key={rule.id} withBorder radius="sm" padding="sm">
                                            <Stack gap="xs">
                                                <Group justify="space-between" align="center" wrap="nowrap">
                                                    <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
                                                        <Text size="sm" fw={600} lineClamp={1}>
                                                            {rule.queryText || 'Untitled rule'}
                                                        </Text>
                                                        <Group gap="xs">
                                                            <Badge size="xs" variant="light" color="gray">
                                                                {rulebookLabel}
                                                            </Badge>
                                                            {pages.length > 0 && (
                                                                <Group gap={4}>
                                                                    {pages.map((page) => (
                                                                        <Badge key={`${rule.id}-page-${page}`} size="xs" variant="outline">
                                                                            p.{page}
                                                                        </Badge>
                                                                    ))}
                                                                </Group>
                                                            )}
                                                        </Group>
                                                    </Stack>
                                                    <Group gap="xs">
                                                        <Button
                                                            size="xs"
                                                            variant="light"
                                                            leftSection={<IconEdit size={14} />}
                                                            onClick={() => handleOpenRule(rule)}
                                                        >
                                                            View
                                                        </Button>
                                                        <Button
                                                            size="xs"
                                                            variant="outline"
                                                            color="red"
                                                            leftSection={<IconTrash size={14} />}
                                                            onClick={() => {
                                                                setActiveRule(rule);
                                                                setIsDeleteModalOpen(true);
                                                            }}
                                                        >
                                                            Delete
                                                        </Button>
                                                    </Group>
                                                </Group>
                                                <Text size="xs" c="dimmed" lineClamp={2}>
                                                    {rule.responseText}
                                                </Text>
                                            </Stack>
                                        </Card>
                                    );
                                })
                            )}
                        </Stack>
                    </ScrollArea>
                </Stack>
            </Drawer>

            <Modal
                opened={!!activeRule}
                onClose={handleCloseRuleModal}
                size="lg"
                centered
                fullScreen={isMobile}
                yOffset={modalYOffset}
                withCloseButton
                closeButtonProps={{ 'aria-label': 'Close edit rule modal' }}
                styles={{
                    header: {
                        padding: 0,
                        margin: 0,
                        minHeight: 0,
                        background: 'transparent',
                        border: 'none',
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        width: 'auto',
                        zIndex: 2,
                    },
                    title: {
                        display: 'none',
                    },
                    close: {
                        marginLeft: 0,
                        background: 'var(--mantine-color-dark-6)',
                        color: 'var(--mantine-color-white)',
                        borderRadius: 8,
                        width: 32,
                        height: 32,
                        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
                    },
                    body: {
                        maxHeight: isMobile ? 'calc(100vh - 60px)' : undefined,
                        overflow: isMobile ? 'auto' : undefined,
                        paddingTop: 20,
                    },
                }}
            >
                {activeRule && (
                    <Stack gap="md">
                        <TextInput
                            label="Rule name"
                            value={editQueryText}
                            onChange={(event) => setEditQueryText(event.currentTarget.value)}
                            placeholder="Name this rule"
                        />
                        <Textarea
                            label="Answer"
                            value={editResponseText}
                            onChange={(event) => setEditResponseText(event.currentTarget.value)}
                            minRows={isMobile ? 4 : 6}
                            maxRows={isMobile ? 16 : undefined}
                            autosize
                        />
                        <TextInput
                            label="Tags"
                            value={editTags}
                            onChange={(event) => setEditTags(event.currentTarget.value)}
                            placeholder="comma, separated, tags"
                        />
                        <Stack gap="xs">
                            <Text size="sm" fw={500}>
                                Citations
                            </Text>
                            <Group gap="xs">
                                {getCitationPages(activeRule).length === 0 ? (
                                    <Text size="xs" c="dimmed">
                                        No citations captured.
                                    </Text>
                                ) : (
                                    getCitationPages(activeRule).map((page) => (
                                        <Badge key={`${activeRule.id}-citation-${page}`} size="sm" variant="outline">
                                            p.{page}
                                        </Badge>
                                    ))
                                )}
                            </Group>
                        </Stack>
                        <Group justify="space-between" wrap="wrap" gap="sm">
                            <Button
                                variant="outline"
                                color="red"
                                leftSection={<IconTrash size={16} />}
                                onClick={() => setIsDeleteModalOpen(true)}
                                fullWidth={isMobile}
                            >
                                Delete
                            </Button>
                            <Group gap="sm" grow={isMobile} style={{ flex: isMobile ? 1 : undefined }}>
                                <Button variant="default" onClick={handleCloseRuleModal}>
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSaveRule}
                                    loading={isSaving}
                                    disabled={!editQueryText.trim() || !editResponseText.trim()}
                                >
                                    Save changes
                                </Button>
                            </Group>
                        </Group>
                    </Stack>
                )}
            </Modal>

            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteRule}
                title="Delete saved rule"
                message="Are you sure you want to delete this saved rule?"
                itemName={activeRule?.queryText}
            />
        </>
    );
};

export default SavedRulesDrawer;
