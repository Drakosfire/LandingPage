// GenerationDrawer.tsx - Drawer UI for AI Generation Tools
// Pattern: Follow Mantine Drawer with tabbed content

import React, { useState } from 'react';
import { Drawer, Tabs, Title, Stack, Box } from '@mantine/core';
import { IconWand, IconPhoto } from '@tabler/icons-react';
import TextGenerationTab from './generationDrawerComponents/TextGenerationTab';
import ImageGenerationTab from './generationDrawerComponents/ImageGenerationTab';

interface GenerationDrawerProps {
    opened: boolean;
    onClose: () => void;
    isGenerationInProgress?: boolean;
    initialTab?: 'text' | 'image'; // Control which tab opens initially
    initialPrompt?: string; // Pre-populate text generation prompt
    isTutorialMode?: boolean; // Tutorial mode flag to prevent real generation
}

const GenerationDrawer: React.FC<GenerationDrawerProps> = ({
    opened,
    onClose,
    isGenerationInProgress = false,
    initialTab = 'text',
    initialPrompt = '',
    isTutorialMode = false
}) => {
    const [activeTab, setActiveTab] = useState<'text' | 'image'>(initialTab);

    // Update active tab when initialTab changes (e.g., from createProject)
    React.useEffect(() => {
        if (opened && initialTab) {
            setActiveTab(initialTab);
        }
    }, [opened, initialTab]);

    return (
        <Drawer
            opened={opened}
            onClose={onClose}
            position="left"
            size="lg"
            title={
                <Box data-tutorial="generation-drawer-title">
                    <Title order={4}>
                        AI Generation
                    </Title>
                </Box>
            }
            closeButtonProps={{ 'aria-label': 'Close generation drawer' }}
            overlayProps={{ opacity: 0.3, blur: 2 }}
            styles={{
                content: {
                    marginTop: '60px', // Below header
                    marginLeft: '80px', // Right of nav bar
                    height: 'calc(100vh - 60px)',
                    width: 'calc(100% - 80px)' // Account for nav bar width
                }
            }}
            data-tutorial="generation-drawer"
        >
            <Stack gap="md" h="100%">
                <Tabs value={activeTab} onChange={(val) => setActiveTab(val as any)}>
                    <Tabs.List grow>
                        <Tabs.Tab
                            value="text"
                            leftSection={<IconWand size={16} />}
                            disabled={isGenerationInProgress}
                            data-tutorial="text-generation-tab"
                        >
                            Text Generation
                        </Tabs.Tab>
                        <Tabs.Tab
                            value="image"
                            leftSection={<IconPhoto size={16} />}
                            disabled={isGenerationInProgress}
                            data-tutorial="image-generation-tab"
                        >
                            Image Generation
                        </Tabs.Tab>
                    </Tabs.List>

                    <Tabs.Panel value="text" pt="md">
                        <TextGenerationTab
                            initialPrompt={initialPrompt}
                            isTutorialMode={isTutorialMode}
                        />
                    </Tabs.Panel>

                    <Tabs.Panel value="image" pt="md">
                        <ImageGenerationTab />
                    </Tabs.Panel>
                </Tabs>
            </Stack>
        </Drawer>
    );
};

export default GenerationDrawer;


