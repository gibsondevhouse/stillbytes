import { useEffect, useState, RefObject } from 'react';
import { EditOperation } from '@/types';
import { imageEditor } from '@/services/imageEditor';

interface UseCanvasEditorReturn {
    isProcessing: boolean;
    exportImage: (fileName: string) => Promise<void>;
}

export const useCanvasEditor = (
    canvasRef: RefObject<HTMLCanvasElement>,
    imageUrl: string | undefined,
    operations: EditOperation[],
    isComparing: boolean = false
): UseCanvasEditorReturn => {
    const [isProcessing, setIsProcessing] = useState(false);

    // Initialize
    useEffect(() => {
        let isMounted = true;

        async function init() {
            if (!imageUrl || !canvasRef.current) return;

            const img = new Image();
            img.src = imageUrl;
            await new Promise((resolve) => (img.onload = resolve));

            if (!isMounted) return;

            await imageEditor.init(img);
            // Trigger initial render
            applyEdits();
        }

        init();
        return () => { isMounted = false; };
    }, [imageUrl]);

    // Apply Edits
    const applyEdits = () => {
        if (!canvasRef.current) return;

        setIsProcessing(true);
        requestAnimationFrame(() => {
            // If comparing, render empty list
            const opsToApply = isComparing ? [] : operations;
            imageEditor.applyOperations(opsToApply, canvasRef.current!);
            setIsProcessing(false);
        });
    };

    // Watch for changes
    useEffect(() => {
        applyEdits();
    }, [operations, isComparing]);

    // Export
    const exportImage = async (fileName: string) => {
        if (!canvasRef.current) throw new Error('No canvas');

        const blob = await imageEditor.exportCanvas(canvasRef.current);
        if (!blob) throw new Error('Export failed');

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `stillbytes_${fileName}.jpg`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return {
        isProcessing,
        exportImage
    };
};
