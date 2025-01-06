// TODO: Add styles, make sure types is sorted out. This needs testing to see if temporary url is working.
import React, { useRef, useEffect, useState, useCallback } from 'react';
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

    // Separate the canvas drawing logic
    const drawTemplate = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas || !template.border || !template.seedImage) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Load and draw both images
        const borderImg = new Image();
        const seedImg = new Image();

        borderImg.crossOrigin = "anonymous";
        seedImg.crossOrigin = "anonymous";

        return new Promise<void>((resolve) => {
            borderImg.onload = () => {
                seedImg.onload = () => {
                    ctx.drawImage(seedImg, SEED_X, SEED_Y, SEED_WIDTH, SEED_HEIGHT);
                    ctx.drawImage(borderImg, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
                    resolve();
                };
                seedImg.src = template.seedImage;
            };
            borderImg.src = template.border;
        });
    }, [template]);

    // Update preview whenever template changes
    useEffect(() => {
        drawTemplate();
    }, [drawTemplate]);

    // Handle template selection
    const handleSelectTemplate = async () => {
        console.log('TemplatePreview: Selecting template');
        const canvas = canvasRef.current;
        if (!canvas) return;

        await drawTemplate(); // Ensure the canvas is up to date

        canvas.toBlob((blob) => {
            if (blob) {
                if (previewUrl) {
                    URL.revokeObjectURL(previewUrl);
                }
                const newUrl = URL.createObjectURL(blob);
                setPreviewUrl(newUrl);
                onGenerate(blob, newUrl);
                console.log('TemplatePreview: Generated new blob:', { size: blob.size });
            }
        }, 'image/png');
    };

    return (

        <div style={styles.previewContainer}>
            <button
                onClick={handleSelectTemplate}
                disabled={!template.border || !template.seedImage}
                style={styles.selectButton}
            >
                Step 4: Preview and Save Template
            </button>
            <canvas
                ref={canvasRef}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                style={styles.previewCanvas}
            />

        </div>
    );
};

export default TemplatePreview;