// TODO: Add styles, make sure types is sorted out. This needs testing to see if temporary url is working.
import React, { useRef, useEffect, useState } from 'react';
import styles from '../../../styles/TemplatePreview.styles';

interface TemplatePreviewProps {
    template: {
        border: string;
        seedImage: string;
    };
    onGenerate: (templateBlob: Blob, templateUrl: string) => void;
}

const TemplatePreview: React.FC<TemplatePreviewProps> = ({ template, onGenerate }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // Constants for canvas dimensions
    const CANVAS_WIDTH = 768;
    const CANVAS_HEIGHT = 1024;
    const SEED_X = 56;
    const SEED_Y = 128;
    const SEED_WIDTH = 657;
    const SEED_HEIGHT = 422;

    useEffect(() => {
        if (!template.border || !template.seedImage) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Load and draw both images
        const borderImg = new Image();
        const seedImg = new Image();

        // Set crossOrigin for both images
        borderImg.crossOrigin = "anonymous";
        seedImg.crossOrigin = "anonymous";

        borderImg.onload = () => {
            seedImg.onload = () => {
                // Draw seed image first (bottom layer)
                ctx.drawImage(
                    seedImg,
                    SEED_X,
                    SEED_Y,
                    SEED_WIDTH,
                    SEED_HEIGHT
                );
                // Draw border over it (top layer)
                ctx.drawImage(borderImg, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

                // Create preview URL
                canvas.toBlob((blob) => {
                    if (blob) {
                        if (previewUrl) {
                            URL.revokeObjectURL(previewUrl);
                        }
                        const newUrl = URL.createObjectURL(blob);
                        setPreviewUrl(newUrl);
                    }
                }, 'image/png');
            };
            seedImg.src = template.seedImage;  // Start loading seed image after border loads
        };

        borderImg.src = template.border;  // Start loading border first

        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [template]);

    const handleGenerateClick = async () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.toBlob((blob) => {
            if (blob && previewUrl) {
                onGenerate(blob, previewUrl);
            }
        }, 'image/png');
    };

    return (
        <div style={styles.previewContainer}>
            <canvas
                ref={canvasRef}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                style={styles.previewCanvas}
            />
            <button
                onClick={handleGenerateClick}
                disabled={!previewUrl}
                style={styles.generateButton}
            >
                Generate Template
            </button>
        </div>
    );
};

export default TemplatePreview;