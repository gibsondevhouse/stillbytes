import { EditOperation, HSLAdjustOperation, BrightnessContrastOperation, ExposureOperation } from '@/types';

/**
 * High-performance Canvas Filter Service for Stillbytes
 * Handles pixel manipulation for real-time photo editing
 */
export class ImageEditorService {
    private offscreenCanvas: OffscreenCanvas | null = null;
    private offscreenCtx: OffscreenCanvasRenderingContext2D | null = null;
    private originalImageData: ImageData | null = null;

    /**
     * Initialize the service with an image
     */
    public async init(image: HTMLImageElement | HTMLCanvasElement): Promise<void> {
        const width = image instanceof HTMLImageElement ? image.naturalWidth : image.width;
        const height = image instanceof HTMLImageElement ? image.naturalHeight : image.height;

        this.offscreenCanvas = new OffscreenCanvas(width, height);
        this.offscreenCtx = this.offscreenCanvas.getContext('2d', { willReadFrequently: true });

        if (!this.offscreenCtx) throw new Error('Could not get offscreen context');

        this.offscreenCtx.drawImage(image, 0, 0);
        this.originalImageData = this.offscreenCtx.getImageData(0, 0, width, height);
    }

    /**
     * Apply a stack of operations and render to the target canvas
     */
    public applyOperations(
        operations: EditOperation[],
        targetCanvas: HTMLCanvasElement
    ): void {
        if (!this.originalImageData || !this.offscreenCtx || !this.offscreenCanvas) return;

        // Start with a fresh copy of original pixels
        const workingImageData = new ImageData(
            new Uint8ClampedArray(this.originalImageData.data),
            this.originalImageData.width,
            this.originalImageData.height
        );

        const data = workingImageData.data;

        // Apply operations in sequence
        for (const op of operations) {
            switch (op.type) {
                case 'brightness_contrast':
                    this.applyBrightnessContrast(data, op as BrightnessContrastOperation);
                    break;
                case 'hsl_adjust':
                    this.applyHSL(data, op as HSLAdjustOperation);
                    break;
                case 'exposure':
                    this.applyExposure(data, op as ExposureOperation);
                    break;
                // Other operations can be added here
            }
        }

        // Render result to target canvas
        const ctx = targetCanvas.getContext('2d');
        if (ctx) {
            targetCanvas.width = this.offscreenCanvas.width;
            targetCanvas.height = this.offscreenCanvas.height;
            ctx.putImageData(workingImageData, 0, 0);
        }
    }

    /**
     * Fast Brightness/Contrast adjustment
     */
    private applyBrightnessContrast(data: Uint8ClampedArray, op: BrightnessContrastOperation): void {
        const { brightness, contrast } = op.parameters;
        const b = brightness; // -100 to 100
        const factor = (259 * (contrast + 255)) / (255 * (259 - contrast)); // Traditional contrast formula

        for (let i = 0; i < data.length; i += 4) {
            // RBC (Red, Green, Blue)
            for (let j = 0; j < 3; j++) {
                let val = data[i + j];
                // Brightness
                val += b;
                // Contrast
                val = factor * (val - 128) + 128;
                data[i + j] = Math.max(0, Math.min(255, val));
            }
        }
    }

    /**
     * Fast HSL adjustment
     */
    private applyHSL(data: Uint8ClampedArray, op: HSLAdjustOperation): void {
        const { hue, saturation, lightness } = op.parameters;
        const sFact = (saturation + 100) / 100;
        const lFact = lightness / 100;

        for (let i = 0; i < data.length; i += 4) {
            let r = data[i] / 255;
            let g = data[i + 1] / 255;
            let b = data[i + 2] / 255;

            // Convert to HSL
            const max = Math.max(r, g, b), min = Math.min(r, g, b);
            let h = 0, s, l = (max + min) / 2;

            if (max === min) {
                h = s = 0;
            } else {
                const d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                switch (max) {
                    case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                    case g: h = (b - r) / d + 2; break;
                    case b: h = (r - g) / d + 4; break;
                }
                h /= 6;
            }

            // Apply Adjustments
            h = (h + hue / 360) % 1;
            if (h < 0) h += 1;
            s = Math.max(0, Math.min(1, s * sFact));
            l = Math.max(0, Math.min(1, l + lFact));

            // Convert back to RGB
            if (s === 0) {
                r = g = b = l;
            } else {
                const hue2rgb = (p: number, q: number, t: number) => {
                    if (t < 0) t += 1;
                    if (t > 1) t -= 1;
                    if (t < 1 / 6) return p + (q - p) * 6 * t;
                    if (t < 1 / 2) return q;
                    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                    return p;
                };
                const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                const p = 2 * l - q;
                r = hue2rgb(p, q, h + 1 / 3);
                g = hue2rgb(p, q, h);
                b = hue2rgb(p, q, h - 1 / 3);
            }

            data[i] = r * 255;
            data[i + 1] = g * 255;
            data[i + 2] = b * 255;
        }
    }

    /**
     * Exposure adjustment (linear shift)
     */
    private applyExposure(data: Uint8ClampedArray, op: ExposureOperation): void {
        const exposure = op.parameters.exposure;
        const factor = Math.pow(2, exposure);

        for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.max(0, Math.min(255, data[i] * factor));
            data[i + 1] = Math.max(0, Math.min(255, data[i + 1] * factor));
            data[i + 2] = Math.max(0, Math.min(255, data[i + 2] * factor));
        }
    }
    /**
     * Export the current canvas state as a blob
     */
    public async exportCanvas(canvas: HTMLCanvasElement, quality = 0.9): Promise<Blob | null> {
        return new Promise((resolve) => {
            canvas.toBlob((blob) => resolve(blob), 'image/jpeg', quality);
        });
    }
}

export const imageEditor = new ImageEditorService();
