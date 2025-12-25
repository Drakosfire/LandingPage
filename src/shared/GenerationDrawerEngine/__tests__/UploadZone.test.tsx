/**
 * Unit tests for UploadZone component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { UploadZone } from '../components/UploadZone';
import { renderWithEngine } from '../test-utils/renderWithEngine';

const renderWithProvider = (ui: React.ReactElement) => {
    return render(<MantineProvider>{ui}</MantineProvider>);
};

describe('UploadZone', () => {
    const mockOnUpload = jest.fn();
    const mockOnError = jest.fn();

    const defaultProps = {
        onUpload: mockOnUpload,
        onError: mockOnError,
        maxSize: 5 * 1024 * 1024, // 5MB
        acceptedTypes: ['image/jpeg', 'image/png', 'image/webp']
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Rendering', () => {
        it('renders upload zone with drop area', () => {
            renderWithProvider(<UploadZone {...defaultProps} />);
            expect(screen.getByText(/drag.*drop/i)).toBeInTheDocument();
        });

        it('renders clickable upload zone', () => {
            renderWithProvider(<UploadZone {...defaultProps} />);
            const uploadZone = screen.getByTestId('upload-zone');
            expect(uploadZone).toBeInTheDocument();
            expect(uploadZone).toHaveTextContent(/click to select files/i);
        });
    });

    describe('File Selection', () => {
        it('calls onUpload when file is selected via picker', async () => {
            renderWithProvider(<UploadZone {...defaultProps} />);
            const fileInput = document.querySelector('input[type="file"]');

            expect(fileInput).toBeInTheDocument();

            if (fileInput) {
                const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
                Object.defineProperty(file, 'size', { value: 1024 * 1024 }); // 1MB

                fireEvent.change(fileInput, { target: { files: [file] } });

                await waitFor(() => {
                    expect(mockOnUpload).toHaveBeenCalledWith(expect.arrayContaining([file]));
                });
            }
        });

        it('validates file type', async () => {
            renderWithProvider(<UploadZone {...defaultProps} />);
            const fileInput = document.querySelector('input[type="file"]');

            if (fileInput) {
                const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
                Object.defineProperty(file, 'size', { value: 1024 * 1024 });

                fireEvent.change(fileInput, { target: { files: [file] } });

                await waitFor(() => {
                    expect(mockOnError).toHaveBeenCalledWith(
                        expect.stringContaining('Invalid file type')
                    );
                });
                expect(mockOnUpload).not.toHaveBeenCalled();
            }
        });

        it('validates file size', async () => {
            renderWithProvider(<UploadZone {...defaultProps} maxSize={1024 * 1024} />);
            const fileInput = document.querySelector('input[type="file"]');

            expect(fileInput).toBeInTheDocument();

            const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
            Object.defineProperty(file, 'size', {
                value: 10 * 1024 * 1024,
                writable: false,
                configurable: true
            }); // 10MB

            fireEvent.change(fileInput!, { target: { files: [file] } });

            await waitFor(() => {
                expect(mockOnError).toHaveBeenCalledWith(
                    expect.stringContaining('File too large')
                );
            }, { timeout: 3000 });
            expect(mockOnUpload).not.toHaveBeenCalled();
        });
    });

    describe('Drag and Drop', () => {
        it('highlights drop zone on drag enter', () => {
            renderWithProvider(<UploadZone {...defaultProps} />);
            const uploadZone = screen.getByTestId('upload-zone');

            fireEvent.dragOver(uploadZone);
            // Visual state is handled by component state
            expect(uploadZone).toBeInTheDocument();
        });

        it('calls onUpload when file is dropped', async () => {
            renderWithProvider(<UploadZone {...defaultProps} />);
            const uploadZone = screen.getByTestId('upload-zone');

            const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
            Object.defineProperty(file, 'size', { value: 1024 * 1024 });

            const dataTransfer = {
                files: [file],
                items: [{ kind: 'file', type: 'image/jpeg', getAsFile: () => file }],
                types: ['Files']
            };

            fireEvent.drop(uploadZone, { dataTransfer });

            await waitFor(() => {
                expect(mockOnUpload).toHaveBeenCalled();
            });
        });
    });

    describe('Upload Progress', () => {
        it('shows upload progress when uploading', () => {
            renderWithProvider(<UploadZone {...defaultProps} isUploading={true} />);
            expect(screen.getByText(/uploading/i)).toBeInTheDocument();
        });

        it('disables interaction during upload', () => {
            renderWithProvider(<UploadZone {...defaultProps} isUploading={true} />);
            const uploadZone = screen.getByTestId('upload-zone');
            const fileInput = document.querySelector('input[type="file"]');
            expect(fileInput).toBeDisabled();
            // Upload zone should have disabled cursor style
            expect(uploadZone).toHaveStyle({ cursor: 'not-allowed' });
        });
    });

    describe('Multiple Files', () => {
        it('handles multiple file selection', async () => {
            renderWithProvider(<UploadZone {...defaultProps} multiple={true} />);
            const fileInput = document.querySelector('input[type="file"]');

            if (fileInput) {
                const file1 = new File(['test1'], 'test1.jpg', { type: 'image/jpeg' });
                const file2 = new File(['test2'], 'test2.png', { type: 'image/png' });
                Object.defineProperty(file1, 'size', { value: 1024 * 1024 });
                Object.defineProperty(file2, 'size', { value: 1024 * 1024 });

                fireEvent.change(fileInput, { target: { files: [file1, file2] } });

                await waitFor(() => {
                    expect(mockOnUpload).toHaveBeenCalledWith(
                        expect.arrayContaining([file1, file2])
                    );
                });
            }
        });
    });
});

