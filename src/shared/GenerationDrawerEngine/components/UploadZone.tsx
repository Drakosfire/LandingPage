/**
 * UploadZone - Drag-and-drop file upload component
 * 
 * Provides drag-and-drop and file picker interfaces for image uploads.
 * Validates file types and sizes before calling onUpload.
 * Shows upload success feedback with recently uploaded files.
 */

import React, { useCallback, useState, useRef } from 'react';
import { Button, Text, Stack, Progress, Paper, Group, Alert, Image, SimpleGrid, CloseButton } from '@mantine/core';
import { IconUpload, IconPhoto, IconCheck, IconX } from '@tabler/icons-react';

/** Recently uploaded file for feedback display */
export interface RecentUpload {
    id: string;
    name: string;
    url?: string;
    status: 'pending' | 'success' | 'error';
    error?: string;
}

export interface UploadZoneProps {
    /** Callback when files are uploaded */
    onUpload: (files: File[]) => void;
    /** Callback when error occurs */
    onError: (error: string) => void;
    /** Maximum file size in bytes */
    maxSize?: number;
    /** Accepted MIME types */
    acceptedTypes?: string[];
    /** Allow multiple files */
    multiple?: boolean;
    /** Whether upload is in progress */
    isUploading?: boolean;
    /** Upload progress (0-100) */
    uploadProgress?: number;
    /** Recently uploaded files for feedback */
    recentUploads?: RecentUpload[];
    /** Callback to clear a recent upload from the list */
    onClearUpload?: (id: string) => void;
}

/**
 * UploadZone component for drag-and-drop file uploads
 */
export const UploadZone: React.FC<UploadZoneProps> = ({
    onUpload,
    onError,
    maxSize = 5 * 1024 * 1024, // 5MB default
    acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'],
    multiple = false,
    isUploading = false,
    uploadProgress = 0,
    recentUploads = [],
    onClearUpload
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const validateFile = useCallback((file: File): string | null => {
        // Validate file type
        if (!acceptedTypes.includes(file.type)) {
            return `Invalid file type: ${file.name}. Accepted types: ${acceptedTypes.join(', ')}`;
        }

        // Validate file size
        if (file.size > maxSize) {
            const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
            return `File too large: ${file.name}. Maximum size: ${maxSizeMB}MB`;
        }

        return null;
    }, [acceptedTypes, maxSize]);

    const processFiles = useCallback((files: FileList | File[]) => {
        const fileArray = Array.from(files);
        const validFiles: File[] = [];
        const errors: string[] = [];

        fileArray.forEach((file) => {
            const error = validateFile(file);
            if (error) {
                errors.push(error);
            } else {
                validFiles.push(file);
            }
        });

        if (errors.length > 0) {
            errors.forEach(error => onError(error));
        }

        if (validFiles.length > 0) {
            onUpload(validFiles);
        }
    }, [validateFile, onUpload, onError]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            processFiles(e.dataTransfer.files);
        }
    }, [processFiles]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            processFiles(e.target.files);
            // Reset input so same file can be selected again
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    }, [processFiles]);

    const handleClick = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    return (
        <Stack gap="md">
            <Paper
                p="xl"
                radius="md"
                style={{
                    border: `2px dashed ${isDragging ? 'var(--mantine-color-blue-6)' : 'var(--mantine-color-gray-4)'}`,
                    backgroundColor: isDragging ? 'var(--mantine-color-blue-0)' : 'transparent',
                    cursor: isUploading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s'
                }}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={!isUploading ? handleClick : undefined}
                data-testid="upload-zone"
            >
                <Stack align="center" gap="xs">
                    <IconPhoto size={48} stroke={1.5} />
                    <Text size="lg" fw={500}>
                        Drag and drop images here
                    </Text>
                    <Text size="sm" c="dimmed">
                        or click to select files
                    </Text>
                    <Text size="xs" c="dimmed" mt="xs">
                        Accepted: {acceptedTypes.join(', ')} (max {Math.round(maxSize / (1024 * 1024))}MB)
                    </Text>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept={acceptedTypes.join(',')}
                        multiple={multiple}
                        onChange={handleFileSelect}
                        style={{ display: 'none' }}
                        disabled={isUploading}
                    />
                </Stack>
            </Paper>

            {isUploading && (
                <Stack gap="xs">
                    <Text size="sm" c="dimmed">Uploading...</Text>
                    <Progress value={uploadProgress} size="sm" animated />
                </Stack>
            )}

            {/* Recent uploads feedback */}
            {recentUploads.length > 0 && (
                <Stack gap="sm">
                    <Text size="sm" fw={500}>Recently Uploaded</Text>
                    <SimpleGrid cols={{ base: 2, sm: 3, md: 4 }} spacing="sm">
                        {recentUploads.map((upload) => (
                            <Paper
                                key={upload.id}
                                p="xs"
                                withBorder
                                style={{
                                    position: 'relative',
                                    borderColor: upload.status === 'success' 
                                        ? 'var(--mantine-color-green-4)' 
                                        : upload.status === 'error'
                                        ? 'var(--mantine-color-red-4)'
                                        : 'var(--mantine-color-gray-4)'
                                }}
                            >
                                {onClearUpload && (
                                    <CloseButton
                                        size="xs"
                                        style={{
                                            position: 'absolute',
                                            top: 4,
                                            right: 4,
                                            zIndex: 1
                                        }}
                                        onClick={() => onClearUpload(upload.id)}
                                        aria-label="Remove"
                                    />
                                )}
                                {upload.url && upload.status === 'success' && (
                                    <Image
                                        src={upload.url}
                                        alt={upload.name}
                                        h={80}
                                        fit="cover"
                                        radius="sm"
                                    />
                                )}
                                <Group gap="xs" mt="xs">
                                    {upload.status === 'success' && (
                                        <IconCheck size={14} color="var(--mantine-color-green-6)" />
                                    )}
                                    {upload.status === 'error' && (
                                        <IconX size={14} color="var(--mantine-color-red-6)" />
                                    )}
                                    {upload.status === 'pending' && (
                                        <Progress size="xs" value={uploadProgress} w={50} />
                                    )}
                                    <Text size="xs" lineClamp={1} style={{ flex: 1 }}>
                                        {upload.name}
                                    </Text>
                                </Group>
                                {upload.error && (
                                    <Text size="xs" c="red" mt="xs">
                                        {upload.error}
                                    </Text>
                                )}
                            </Paper>
                        ))}
                    </SimpleGrid>
                </Stack>
            )}
        </Stack>
    );
};
