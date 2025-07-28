// TODO: Add styles, make sure types is sorted out. This needs testing to see if temporary url is working.
import React, { useRef, useEffect, useState, useCallback } from 'react';
import styles from '../../../styles/TemplatePreview.styles';

interface TemplatePreviewProps {
    template: {
        border: string;
        itemImage: string;
    };
    onGenerate: (templateBlob: Blob, templateUrl: string) => void;
}

const TemplatePreview: React.FC<TemplatePreviewProps> = ({ template, onGenerate }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // Constants for canvas dimensions
    const CANVAS_WIDTH = 768;
    const CANVAS_HEIGHT = 1024;
    const ITEM_X = 56;
    const ITEM_Y = 128;
    const ITEM_WIDTH = 657;
    const ITEM_HEIGHT = 422;

    // Add this ref to track the previous template
    const prevTemplateRef = useRef<typeof template>();

    // Memoize the onGenerate callback to prevent unnecessary re-renders
    const stableOnGenerate = useCallback(onGenerate, []);

    // Separate the canvas drawing logic - only depend on template changes
    const drawTemplate = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas || !template.border || !template.itemImage) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Check if template has actually changed
        if (prevTemplateRef.current?.border === template.border &&
            prevTemplateRef.current?.itemImage === template.itemImage) {
            return; // No change, don't redraw
        }

        // Clear canvas
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Load and draw both images
        const borderImg = new Image();
        const itemImg = new Image();

        borderImg.crossOrigin = "anonymous";
        itemImg.crossOrigin = "anonymous";

        return new Promise<void>((resolve) => {
            borderImg.onload = () => {
                itemImg.onload = () => {
                    ctx.drawImage(itemImg, ITEM_X, ITEM_Y, ITEM_WIDTH, ITEM_HEIGHT);
                    ctx.drawImage(borderImg, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

                    // Generate blob and call onGenerate
                    canvas.toBlob((blob) => {
                        if (blob) {
                            if (previewUrl) {
                                URL.revokeObjectURL(previewUrl);
                            }
                            const newUrl = URL.createObjectURL(blob);
                            setPreviewUrl(newUrl);
                            stableOnGenerate(blob, newUrl);
                        }
                    }, 'image/png');

                    prevTemplateRef.current = template;
                    resolve();
                };
                itemImg.src = template.itemImage;
            };
            borderImg.src = template.border;
        });
    }, [template.border, template.itemImage, stableOnGenerate]); // Only depend on template properties

    useEffect(() => {
        drawTemplate();
    }, [drawTemplate]);

    return (

        <div style={styles.previewContainer}>
            {/* <button
                onClick={handleSelectTemplate}
                disabled={!template.border || !template.seedImage}
                style={styles.selectButton}
            >
                Step 4: Preview and Save Template
            </button> */}
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