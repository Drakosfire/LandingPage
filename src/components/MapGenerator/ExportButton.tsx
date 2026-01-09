/**
 * ExportButton Component
 * 
 * Button component for exporting maps as flattened images.
 * Handles export API call and file download.
 */

import React, { useState } from 'react';
import { Button, Group, Select, Text } from '@mantine/core';
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
  const { baseImageUrl, gridConfig, labels } = useMapGenerator();
  
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'png' | 'jpeg'>('png');
  const [exportSuccess, setExportSuccess] = useState(false);

  const handleExport = async () => {
    if (!baseImageUrl) {
      console.warn('⚠️ [ExportButton] No base image to export');
      return;
    }

    setIsExporting(true);
    setExportSuccess(false);

    try {
      console.log('📤 [ExportButton] Starting export...');
      
      // Export map
      const result = await exportMap(
        {
          baseImageUrl,
          gridConfig,
          labels,
        },
        exportFormat
      );

      // Generate filename
      const extension = exportFormat === 'png' ? 'png' : 'jpg';
      const filename = `map-export-${Date.now()}.${extension}`;

      // Download the exported image
      await downloadImage(result.imageUrl, filename);

      setExportSuccess(true);
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
    <Group gap="xs" className={className}>
      <Select
        value={exportFormat}
        onChange={(value) => setExportFormat(value as 'png' | 'jpeg')}
        data={[
          { value: 'png', label: 'PNG' },
          { value: 'jpeg', label: 'JPEG' },
        ]}
        size="sm"
        style={{ width: 80 }}
        disabled={isExporting || !baseImageUrl}
      />
      <Button
        leftSection={exportSuccess ? <IconCheck size={16} /> : <IconDownload size={16} />}
        onClick={handleExport}
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
  );
}
