/**
 * PlayerCharacterCreationDrawer Component
 * 
 * Main drawer for player character creation with wizard-style workflow.
 * Adapted from StatBlockGenerationDrawer but with D&D Beyond-style step progression.
 * 
 * Features:
 * - Tab 1: Character Creation (wizard with 5 steps)
 * - Tab 2: Portrait Generation
 * 
 * @module PlayerCharacterGenerator
 */

import React, { useState, useEffect } from 'react';
import { Drawer, Tabs, Title, Stack, Box } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { IconUsers, IconPhoto } from '@tabler/icons-react';
import CharacterCreationWizard from './creationDrawerComponents/CharacterCreationWizard';

interface PlayerCharacterCreationDrawerProps {
    opened: boolean;
    onClose: () => void;
}

const PlayerCharacterCreationDrawer: React.FC<PlayerCharacterCreationDrawerProps> = ({
    opened,
    onClose,
}) => {
    const [activeTab, setActiveTab] = useState<'creation' | 'portrait'>('creation');
    const isMobile = useMediaQuery('(max-width: 768px)');

    // Reset to creation tab when drawer opens
    useEffect(() => {
        if (opened) {
            setActiveTab('creation');
        }
    }, [opened]);

    return (
        <Drawer
            opened={opened}
            onClose={onClose}
            position="left"
            size="lg"
            title={
                <Box data-testid="character-creation-drawer-title">
                    <Title order={4}>
                        {isMobile ? 'Create Character' : 'Character Creation'}
                    </Title>
                </Box>
            }
            closeButtonProps={{ 'aria-label': 'Close character creation drawer' }}
            overlayProps={{ opacity: 0.3, blur: 2 }}
            styles={{
                content: {
                    marginTop: '88px', // Below UnifiedHeader
                    marginLeft: '0',
                    height: 'calc(100vh - 88px)',
                    width: '100%'
                }
            }}
            data-testid="character-creation-drawer"
        >
            <Stack gap="md" h="100%">
                <Tabs value={activeTab} onChange={(val) => setActiveTab(val as any)}>
                    <Tabs.List grow>
                        <Tabs.Tab
                            value="creation"
                            leftSection={<IconUsers size={16} />}
                            data-testid="character-creation-tab"
                        >
                            Character Creation
                        </Tabs.Tab>
                        <Tabs.Tab
                            value="portrait"
                            leftSection={<IconPhoto size={16} />}
                            data-testid="portrait-tab"
                        >
                            Portrait
                        </Tabs.Tab>
                    </Tabs.List>

                    <Tabs.Panel value="creation" pt="md">
                        <CharacterCreationWizard />
                    </Tabs.Panel>

                    <Tabs.Panel value="portrait" pt="md">
                        <Stack gap="md">
                            <Title order={5}>Portrait Generation</Title>
                            <Box p="md" style={{ border: '1px dashed gray', borderRadius: '8px' }}>
                                Phase 1: Portrait generation placeholder
                                <br />
                                Will lift ImageGenerationTab from StatblockGenerator in Phase 2
                            </Box>
                        </Stack>
                    </Tabs.Panel>
                </Tabs>
            </Stack>
        </Drawer>
    );
};

export default PlayerCharacterCreationDrawer;





