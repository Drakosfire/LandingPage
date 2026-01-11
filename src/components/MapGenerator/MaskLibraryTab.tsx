/**
 * MaskLibraryTab Component
 * 
 * Displays all saved masks from the current user's map projects.
 * Allows importing a mask into the current project for inpainting.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Stack, SimpleGrid, Card, Image, Text, Group, Button, Loader, Center, Paper, Badge } from '@mantine/core';
import { IconMask, IconDownload, IconRefresh } from '@tabler/icons-react';
import { DUNGEONMIND_API_URL } from '../../config';
import { useAuth } from '../../context/AuthContext';

export interface MaskItem {
  /** Mask image URL (Cloudflare R2) */
  maskUrl: string;
  /** Project ID this mask belongs to */
  projectId: string;
  /** Project name */
  projectName: string;
  /** When the mask was saved */
  updatedAt: string;
}

export interface MaskLibraryTabProps {
  /** Current project ID (to exclude from list) */
  currentProjectId?: string | null;
  /** Callback when a mask is selected for import */
  onImportMask: (maskUrl: string, projectName: string) => void;
  /** Whether import is in progress */
  isImporting?: boolean;
  /** Trigger to refresh the mask list (increment to force refresh) */
  refreshTrigger?: number;
}

export const MaskLibraryTab: React.FC<MaskLibraryTabProps> = ({
  currentProjectId,
  onImportMask,
  isImporting = false,
  refreshTrigger = 0,
}) => {
  const { isLoggedIn, userId } = useAuth();
  const [masks, setMasks] = useState<MaskItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debug: Log component mount
  useEffect(() => {
    console.log('🎭 [MaskLibrary] Component mounted:', {
      isLoggedIn,
      userId: userId?.substring(0, 10) || null,
      currentProjectId: currentProjectId?.substring(0, 10) || null,
    });
  }, []);

  const fetchMasks = useCallback(async () => {
    if (!isLoggedIn || !userId) {
      setMasks([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('🎭 [MaskLibrary] Fetching masks from all projects...');
      const response = await fetch(`${DUNGEONMIND_API_URL}/api/mapgenerator/masks`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch masks: ${response.status}`);
      }

      const data = await response.json();
      const allMasks = data.masks || [];
      console.log('🎭 [MaskLibrary] Fetched masks:', {
        total: allMasks.length,
        currentProjectId: currentProjectId?.substring(0, 10) || null,
        masks: allMasks.map((m: MaskItem) => ({
          projectId: m.projectId?.substring(0, 10),
          projectName: m.projectName,
          maskUrl: m.maskUrl?.substring(0, 50) + '...',
        })),
      });
      
      // Filter out current project's mask
      const filteredMasks = allMasks.filter(
        (mask: MaskItem) => mask.projectId !== currentProjectId
      );
      
      if (allMasks.length > 0 && filteredMasks.length < allMasks.length) {
        const filteredCount = allMasks.length - filteredMasks.length;
        console.log(`🎭 [MaskLibrary] Filtered out ${filteredCount} mask(s) from current project`);
      }
      
      console.log('🎭 [MaskLibrary] Displaying masks:', filteredMasks.length);
      setMasks(filteredMasks);
    } catch (err) {
      console.error('❌ [MaskLibrary] Failed to fetch masks:', err);
      setError(err instanceof Error ? err.message : 'Failed to load masks');
    } finally {
      setIsLoading(false);
    }
  }, [isLoggedIn, userId, currentProjectId]);

  // Fetch masks on mount, when auth changes, or when refreshTrigger changes
  useEffect(() => {
    fetchMasks();
  }, [fetchMasks, refreshTrigger]);

  const handleImport = (mask: MaskItem) => {
    console.log('🎭 [MaskLibrary] Importing mask from project:', mask.projectName);
    onImportMask(mask.maskUrl, mask.projectName);
  };

  // Not logged in
  if (!isLoggedIn) {
    return (
      <Paper p="xl" withBorder style={{ textAlign: 'center' }}>
        <Stack gap="md" align="center">
          <IconMask size={48} color="var(--mantine-color-gray-5)" />
          <Text c="dimmed">Login to access your saved masks</Text>
        </Stack>
      </Paper>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <Center p="xl">
        <Stack gap="md" align="center">
          <Loader size="lg" />
          <Text c="dimmed" size="sm">Loading saved masks...</Text>
        </Stack>
      </Center>
    );
  }

  // Error state
  if (error) {
    return (
      <Paper p="xl" withBorder style={{ textAlign: 'center' }}>
        <Stack gap="md" align="center">
          <Text c="red" size="sm">{error}</Text>
          <Button
            variant="light"
            leftSection={<IconRefresh size={16} />}
            onClick={fetchMasks}
          >
            Retry
          </Button>
        </Stack>
      </Paper>
    );
  }

  // Empty state
  if (masks.length === 0) {
    return (
      <Paper p="xl" withBorder style={{ textAlign: 'center' }}>
        <Stack gap="md" align="center">
          <IconMask size={48} color="var(--mantine-color-gray-5)" />
          <Text fw={500}>No saved masks found</Text>
          <Text c="dimmed" size="sm">
            Draw and save masks in your map projects to see them here.
          </Text>
          {currentProjectId && (
            <Text c="dimmed" size="xs" style={{ fontStyle: 'italic' }}>
              Note: Masks from the current project are not shown here (they're already available in this project).
            </Text>
          )}
          <Button
            variant="light"
            leftSection={<IconRefresh size={16} />}
            onClick={fetchMasks}
            loading={isLoading}
          >
            Refresh
          </Button>
        </Stack>
      </Paper>
    );
  }

  return (
    <Stack gap="md">
      <Group justify="space-between" align="center">
        <Text size="sm" fw={500}>
          Saved Masks ({masks.length})
        </Text>
        <Button
          variant="subtle"
          size="xs"
          leftSection={<IconRefresh size={14} />}
          onClick={fetchMasks}
          loading={isLoading}
        >
          Refresh
        </Button>
      </Group>

      <SimpleGrid cols={{ base: 2, sm: 3 }} spacing="md">
        {masks.map((mask, index) => (
          <Card
            key={`${mask.projectId}-${index}`}
            padding="xs"
            radius="md"
            withBorder
            style={{
              cursor: 'pointer',
              transition: 'transform 0.1s, box-shadow 0.1s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.02)';
              e.currentTarget.style.boxShadow = 'var(--mantine-shadow-md)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <Card.Section>
              <Image
                src={mask.maskUrl}
                alt={`Mask from ${mask.projectName}`}
                height={100}
                fit="contain"
                style={{ backgroundColor: 'var(--mantine-color-dark-8)' }}
              />
            </Card.Section>

            <Stack gap={4} mt="xs">
              <Text size="xs" fw={500} lineClamp={1}>
                {mask.projectName}
              </Text>
              <Group justify="space-between" align="center">
                <Badge size="xs" variant="light" color="grape">
                  {new Date(mask.updatedAt).toLocaleDateString()}
                </Badge>
                <Button
                  size="xs"
                  variant="light"
                  color="blue"
                  leftSection={<IconDownload size={12} />}
                  onClick={() => handleImport(mask)}
                  loading={isImporting}
                >
                  Use
                </Button>
              </Group>
            </Stack>
          </Card>
        ))}
      </SimpleGrid>
    </Stack>
  );
};

export default MaskLibraryTab;
