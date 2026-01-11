/**
 * ExportButton Component
 * 
 * Button component for exporting maps as flattened images.
 * Handles export API call and file download.
 */

import React, { useState, useEffect } from 'react';
import { Button, Group, Text, TextInput, Modal } from '@mantine/core';
import { IconDownload, IconCheck } from '@tabler/icons-react';
import { useMapExport } from 'dungeonmind-canvas';
import { useMapGenerator } from './MapGeneratorProvider';
import { DUNGEONMIND_API_URL } from '../../config';

export interface ExportButtonProps {
  /** Additional CSS classes */
  className?: string;
}

/**
 * ExportButton component for exporting maps
 */
export function ExportButton({ className }: ExportButtonProps) {
  const { exportMap, downloadImage } = useMapExport({ apiBaseUrl: DUNGEONMIND_API_URL });
  const { baseImageUrl, gridConfig, labels, labelsVisible, projectName } = useMapGenerator();
  
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [exportModalOpened, setExportModalOpened] = useState(false);
  const [filename, setFilename] = useState('');

  // Pre-populate filename with project name when modal opens or project changes
  useEffect(() => {
    if (exportModalOpened && projectName && projectName !== 'Untitled Map') {
      // Sanitize project name for filename (remove invalid characters)
      const sanitized = projectName
        .replace(/[^a-z0-9\s-]/gi, '') // Remove invalid filename characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .toLowerCase()
        .trim();
      setFilename(sanitized || 'map-export');
    } else if (exportModalOpened && !filename) {
      setFilename('map-export');
    }
  }, [exportModalOpened, projectName]);

  const handleExport = async () => {
    if (!baseImageUrl) {
      console.warn('⚠️ [ExportButton] No base image to export');
      return;
    }

    // Validate filename
    const sanitizedFilename = filename.trim() || 'map-export';
    if (!sanitizedFilename) {
      alert('Please enter a filename');
      return;
    }

    setIsExporting(true);
    setExportSuccess(false);

    try {
      console.log('📤 [ExportButton] Starting export...', {
        format: 'png',
        hasGrid: gridConfig.visible,
        labelCount: labels.length,
        labelsVisible,
      });
      
      // Filter labels based on visibility toggle (export respects UI visibility)
      const labelsToExport = labelsVisible ? labels : [];
      
      // Export map as PNG
      const result = await exportMap(
        {
          baseImageUrl,
          gridConfig,
          labels: labelsToExport,
        },
        'png'
      );

      // Generate filename with PNG extension
      const finalFilename = `${sanitizedFilename}.png`;

      // Download the exported image
      await downloadImage(result.imageUrl, finalFilename);

      setExportSuccess(true);
      setExportModalOpened(false);
      console.log('✅ [ExportButton] Export and download complete');

      // Reset success state after 2 seconds
      setTimeout(() => setExportSuccess(false), 2000);
    } catch (error) {
      console.error('❌ [ExportButton] Export failed:', error);
      alert(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <Group gap="xs" className={className}>
        <Button
          leftSection={exportSuccess ? <IconCheck size={16} /> : <IconDownload size={16} />}
          onClick={() => setExportModalOpened(true)}
          loading={isExporting}
          disabled={!baseImageUrl}
          size="sm"
          color={exportSuccess ? 'green' : 'blue'}
        >
          {exportSuccess ? 'Exported!' : 'Export'}
        </Button>
        {!baseImageUrl && (
          <Text size="xs" c="dimmed">
            Generate or upload a map first
          </Text>
        )}
      </Group>

      <Modal
        opened={exportModalOpened}
        onClose={() => !isExporting && setExportModalOpened(false)}
        title="Export Map"
        size="sm"
        centered
        overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
      >
        <TextInput
          label="Filename"
          placeholder="map-export"
          value={filename}
          onChange={(e) => setFilename(e.target.value)}
          disabled={isExporting}
          description={`Will be saved as ${filename || 'map-export'}.png`}
        />
        <Group justify="flex-end" mt="md">
          <Button
            variant="subtle"
            onClick={() => setExportModalOpened(false)}
            disabled={isExporting}
          >
            Cancel
          </Button>
          <Button
            leftSection={<IconDownload size={16} />}
            onClick={handleExport}
            loading={isExporting}
            disabled={!filename.trim()}
          >
            Export
          </Button>
        </Group>
      </Modal>
    </>
  );
}
