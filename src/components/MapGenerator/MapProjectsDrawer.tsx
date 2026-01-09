/**
 * MapProjectsDrawer
 * 
 * Mantine Drawer for managing map projects (list, load, delete).
 * Follows the same pattern as StatBlockGenerator/ProjectsDrawer.tsx
 */

import React, { useState } from 'react';
import {
  Stack,
  Group,
  Text,
  Button,
  ActionIcon,
  Card,
  Badge,
  ScrollArea,
  Divider,
  TextInput,
  Title,
  Drawer,
  LoadingOverlay,
  Loader,
} from '@mantine/core';
import {
  IconPlus,
  IconTrash,
  IconSearch,
  IconFolderOpen,
  IconLoader,
  IconRefresh,
  IconDownload,
  IconPencil,
  IconCheck,
  IconX,
} from '@tabler/icons-react';
import { MapProjectSummary } from 'dungeonmind-canvas';
import DeleteConfirmationModal from '../CardGenerator/DeleteConfirmationModal';

interface MapProjectsDrawerProps {
  opened: boolean;
  onClose: () => void;
  projects: MapProjectSummary[];
  currentProjectId?: string;
  isLoadingProjects?: boolean;
  onLoadProject: (projectId: string) => Promise<void>;
  onCreateNewProject: () => Promise<void>;
  onDeleteProject: (projectId: string) => Promise<void>;
  onRenameProject: (projectId: string, newName: string) => Promise<void>;
  onRefresh?: () => Promise<void>;
  isLoadingProject?: boolean; // True when a project is being loaded
}

const MapProjectsDrawer: React.FC<MapProjectsDrawerProps> = ({
  opened,
  onClose,
  projects,
  currentProjectId,
  isLoadingProjects = false,
  onLoadProject,
  onCreateNewProject,
  onDeleteProject,
  onRenameProject,
  onRefresh,
  isLoadingProject = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<MapProjectSummary | null>(null);
  const [isDeletingProject, setIsDeletingProject] = useState(false);

  // Inline editing state
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);

  // Combine parent loading state with local loading state for full lock
  const isAnyLoadInProgress = isLoadingProject;

  // Filter projects based on search
  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort projects by last updated (most recent first)
  const sortedProjects = [...filteredProjects].sort((a, b) =>
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  const handleLoadProject = async (projectId: string) => {
    if (isAnyLoadInProgress) {
      console.log('⚠️ [MapProjectsDrawer] Load blocked - operation in progress');
      return;
    }

    await onLoadProject(projectId);
  };

  const handleDeleteClick = (project: MapProjectSummary) => {
    setProjectToDelete(project);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!projectToDelete) return;

    setIsDeletingProject(true);
    try {
      await onDeleteProject(projectToDelete.id);
    } catch (error) {
      console.error('Failed to delete project:', error);
      throw error;
    } finally {
      setIsDeletingProject(false);
    }
  };

  // Inline editing handlers
  const handleStartEdit = (project: MapProjectSummary) => {
    setEditingProjectId(project.id);
    setEditingName(project.name);
  };

  const handleCancelEdit = () => {
    setEditingProjectId(null);
    setEditingName('');
  };

  const handleConfirmEdit = async () => {
    if (!editingProjectId || !editingName.trim()) return;

    setIsRenaming(true);
    try {
      await onRenameProject(editingProjectId, editingName.trim());
      setEditingProjectId(null);
      setEditingName('');
    } catch (error) {
      console.error('Failed to rename project:', error);
    } finally {
      setIsRenaming(false);
    }
  };

  return (
    <>
      <Drawer
        opened={opened}
        onClose={() => {
          // Prevent closing while a project is loading
          if (isAnyLoadInProgress) {
            console.log('⚠️ [MapProjectsDrawer] Cannot close while loading project');
            return;
          }
          onClose();
        }}
        position="right"
        size="md"
        title={
          <Group gap="sm">
            <IconFolderOpen size={20} />
            <Title order={4}>Map Projects</Title>
            {isAnyLoadInProgress && (
              <Badge color="blue" variant="light" leftSection={<IconLoader size={12} />}>
                Loading...
              </Badge>
            )}
          </Group>
        }
        closeButtonProps={{
          'aria-label': 'Close projects drawer',
          disabled: isAnyLoadInProgress,
        }}
        overlayProps={{ opacity: 0.3, blur: 2 }}
        styles={{
          inner: {
            top: '88px', // Below UnifiedHeader (88px desktop height)
            height: 'calc(100vh - 88px)',
          },
          content: {
            height: '100%',
            maxHeight: '100%',
          },
          body: {
            // Account for drawer header (~60px)
            height: 'calc(100vh - 88px - 60px)',
            maxHeight: 'calc(100vh - 88px - 60px)',
            overflow: 'auto',
          },
        }}
      >
        <Stack gap="md" h="100%" pos="relative">
          {/* Loading overlay when a project is being loaded */}
          <LoadingOverlay
            visible={isAnyLoadInProgress}
            zIndex={1000}
            overlayProps={{ radius: 'sm', blur: 2 }}
            loaderProps={{
              children: (
                <Stack align="center" gap="xs">
                  <Loader size="lg" />
                  <Text size="sm" c="dimmed">
                    Loading project...
                  </Text>
                </Stack>
              ),
            }}
          />

          {/* Refresh Button */}
          {onRefresh && (
            <Group justify="flex-end">
              <ActionIcon
                variant="subtle"
                color="blue"
                size="md"
                loading={isLoadingProjects}
                onClick={onRefresh}
                title="Refresh projects list"
                style={{ minWidth: 36, minHeight: 36 }}
              >
                <IconRefresh size={16} />
              </ActionIcon>
            </Group>
          )}

          {/* Action Buttons */}
          <Stack gap="xs">
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={onCreateNewProject}
              variant="filled"
              fullWidth
              disabled={isAnyLoadInProgress}
              title={
                isAnyLoadInProgress
                  ? 'Please wait while project loads...'
                  : ''
              }
              size="md"
              style={{ minHeight: 44 }}
            >
              New Project
            </Button>
          </Stack>

          <Divider />

          {/* Search */}
          <TextInput
            placeholder="Search projects..."
            leftSection={<IconSearch size={16} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
            size="sm"
          />

          {/* Projects List */}
          <ScrollArea flex={1} type="scroll">
            <Stack gap="xs" style={{ paddingRight: '8px' }}>
              {isLoadingProjects ? (
                <Text c="dimmed" ta="center" size="sm">
                  Loading...
                </Text>
              ) : sortedProjects.length === 0 ? (
                <Text c="dimmed" ta="center" size="sm">
                  {searchQuery ? 'No matches.' : 'No projects yet.'}
                </Text>
              ) : (
                sortedProjects.map((project) => {
                  const isCurrentProject = currentProjectId === project.id;
                  const isDisabled = isAnyLoadInProgress || isRenaming;
                  const isEditing = editingProjectId === project.id;

                  return (
                    <Card
                      key={project.id}
                      withBorder
                      radius="sm"
                      padding="xs"
                      style={{
                        cursor: 'pointer',
                        borderColor: isCurrentProject
                          ? 'var(--mantine-color-blue-4)'
                          : undefined,
                        backgroundColor: isCurrentProject
                          ? 'var(--mantine-color-blue-0)'
                          : undefined,
                        width: '100%',
                        maxWidth: '100%',
                        overflow: 'hidden',
                      }}
                    >
                      <Stack gap="xs">
                        <Group justify="space-between" wrap="nowrap" gap="xs">
                          <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
                            {isEditing ? (
                              /* Inline edit mode */
                              <Group gap="xs" wrap="nowrap">
                                <TextInput
                                  value={editingName}
                                  onChange={(e) => setEditingName(e.currentTarget.value)}
                                  size="xs"
                                  style={{ flex: 1 }}
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleConfirmEdit();
                                    } else if (e.key === 'Escape') {
                                      handleCancelEdit();
                                    }
                                  }}
                                  disabled={isRenaming}
                                />
                                <ActionIcon
                                  variant="filled"
                                  color="green"
                                  size="sm"
                                  onClick={handleConfirmEdit}
                                  loading={isRenaming}
                                  disabled={!editingName.trim()}
                                  title="Save name"
                                >
                                  <IconCheck size={14} />
                                </ActionIcon>
                                <ActionIcon
                                  variant="subtle"
                                  color="gray"
                                  size="sm"
                                  onClick={handleCancelEdit}
                                  disabled={isRenaming}
                                  title="Cancel"
                                >
                                  <IconX size={14} />
                                </ActionIcon>
                              </Group>
                            ) : (
                              /* Display mode */
                              <Text fw={500} size="sm" truncate>
                                {project.name || 'Untitled Map'}
                              </Text>
                            )}
                            <Text size="xs" c="dimmed">
                              {new Date(project.updatedAt).toLocaleDateString()}
                            </Text>
                          </Stack>

                          {/* Load Button and Actions (hide during edit) */}
                          {!isEditing && (
                            <Group gap={4} wrap="nowrap">
                              {isCurrentProject ? (
                                <Badge color="green" variant="light">
                                  Active
                                </Badge>
                              ) : (
                                <Button
                                  size="xs"
                                  variant="light"
                                  color="blue"
                                  disabled={isDisabled}
                                  leftSection={<IconDownload size={14} />}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleLoadProject(project.id);
                                  }}
                                  title={
                                    isDisabled
                                      ? 'Please wait - operation in progress'
                                      : 'Load this project'
                                  }
                                >
                                  Load
                                </Button>
                              )}

                              {/* Edit Button */}
                              <ActionIcon
                                variant="subtle"
                                color="blue"
                                size="md"
                                disabled={isDisabled}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStartEdit(project);
                                }}
                                title="Rename project"
                                style={{
                                  opacity: isDisabled ? 0.5 : 1,
                                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                                  minWidth: 36,
                                  minHeight: 36,
                                }}
                              >
                                <IconPencil size={16} />
                              </ActionIcon>

                              {/* Delete Button */}
                              <ActionIcon
                                variant="subtle"
                                color="red"
                                size="md"
                                disabled={isDisabled}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteClick(project);
                                }}
                                title={
                                  isDisabled
                                    ? 'Please wait - operation in progress'
                                    : isCurrentProject
                                      ? 'Delete this active project (⚠️ Will clear current work)'
                                      : 'Delete this project'
                                }
                                style={{
                                  opacity: isDisabled ? 0.5 : 1,
                                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                                  minWidth: 36,
                                  minHeight: 36,
                                  position: 'relative',
                                  zIndex: 10,
                                }}
                              >
                                <IconTrash size={16} />
                              </ActionIcon>
                            </Group>
                          )}
                        </Group>
                      </Stack>
                    </Card>
                  );
                })
              )}
            </Stack>
          </ScrollArea>
        </Stack>
      </Drawer>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setProjectToDelete(null);
          setIsDeletingProject(false);
        }}
        onConfirm={confirmDelete}
        title="Delete Map Project"
        message={
          projectToDelete?.id === currentProjectId
            ? '⚠️ You are about to delete your ACTIVE project. This will clear your current work and cannot be undone.'
            : 'Are you sure you want to delete this project?'
        }
        itemName={projectToDelete?.name}
        isLoading={isDeletingProject}
      />
    </>
  );
};

export default MapProjectsDrawer;
