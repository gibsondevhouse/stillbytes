import { describe, it, expect, vi, beforeEach } from 'vitest';
import { imageEditor } from '@/services/imageEditor';
import { EditOperation } from '@/types';

// Mock Canvas API since we run in Node environment for tests usually, 
// but Vitest with environment: jsdom/happy-dom might handle basic canvas.
// However, OffscreenCanvas might need specific handling or we mock the methods we use.
// For robust unit testing of logic, we can verify it calls the right context methods.
// Or we can rely on browser-based runners. 
// Let's assume a basic mock or a browser-like environment (happy-dom/jsdom) is set up.

describe('ImageEditorService', () => {
    let mockCtx: any;

    beforeEach(() => {
        // Mock Canvas Context
        mockCtx = {
            drawImage: vi.fn(),
            putImageData: vi.fn(),
            getImageData: vi.fn(() => ({
                width: 100,
                height: 100,
                data: new Uint8ClampedArray(40000),
                colorSpace: 'srgb'
            })),
            filter: '',
        };

        // Mock OffscreenCanvas
        class MockOffscreenCanvas {
            width: number;
            height: number;
            constructor(width: number, height: number) {
                this.width = width;
                this.height = height;
            }
            getContext() {
                return mockCtx;
            }
            convertToBlob() {
                return Promise.resolve(new Blob(['test'], { type: 'image/jpeg' }));
            }
        }
        vi.stubGlobal('OffscreenCanvas', MockOffscreenCanvas);

        // Mock ImageData
        class MockImageData {
            data: Uint8ClampedArray;
            width: number;
            height: number;
            constructor(data: Uint8ClampedArray, width: number, height: number) {
                this.data = data;
                this.width = width;
                this.height = height;
            }
        }
        vi.stubGlobal('ImageData', MockImageData);

        // Mock Image
        class MockImage {
            onload: any = null;
            src: string = '';
            width: number = 0;
            height: number = 0;
            naturalWidth: number = 0;
            naturalHeight: number = 0;
        }
        vi.stubGlobal('Image', MockImage);
    });

    it('should initialize with an image', async () => {
        const img = new Image();
        img.naturalWidth = 100;
        img.naturalHeight = 100;
        // Since we are mocking Image, we need to trigger logic if init relies on it,
        // but init just reads properties.

        await expect(imageEditor.init(img)).resolves.not.toThrow();
    });

    it('should apply operations without crashing', async () => {
        const ops: EditOperation[] = [
            {
                id: '1',
                type: 'exposure',
                parameters: { exposure: 1 },
                timestamp: new Date(),
                version: 1
            }
        ];

        // Init phase
        const img = new Image();
        img.naturalWidth = 100;
        img.naturalHeight = 100;
        await imageEditor.init(img);

        // Mock the target canvas passed to applyOperations
        const targetCanvas = document.createElement('canvas');
        // JSDOM canvas getContext usually works, but we ideally mock it to inspect calls
        const targetCtx = {
            putImageData: vi.fn(),
            getImageData: vi.fn(),
            drawImage: vi.fn()
        };
        targetCanvas.getContext = vi.fn(() => targetCtx as any);

        // Should call context methods
        imageEditor.applyOperations(ops, targetCanvas);
        expect(targetCtx.putImageData).toHaveBeenCalled();
    });

    it('should Apply crop_rotate operation', async () => {
        const ops: EditOperation[] = [
            {
                id: '2',
                type: 'crop_rotate',
                parameters: {
                    crop: { x: 0.25, y: 0.25, width: 0.5, height: 0.5 },
                    rotation: 0
                },
                timestamp: new Date(),
                version: 1
            }
        ];

        // Init phase
        const img = new Image();
        img.naturalWidth = 100;
        img.naturalHeight = 100;
        img.width = 100;
        img.height = 100;
        await imageEditor.init(img);

        // Mock target
        const targetCanvas = document.createElement('canvas');
        const targetCtx = {
            putImageData: vi.fn(),
            getImageData: vi.fn(),
            drawImage: vi.fn(),
            save: vi.fn(),
            restore: vi.fn(),
            translate: vi.fn(),
            rotate: vi.fn(),
            scale: vi.fn(),
        };
        targetCanvas.getContext = vi.fn(() => targetCtx as any);

        imageEditor.applyOperations(ops, targetCanvas);

        // Assert dimensions changed (Crop 50% of 100 = 50)
        expect(targetCanvas.width).toBe(50);
        expect(targetCanvas.height).toBe(50);

        // Assert drawImage called (path for crop)
        expect(targetCtx.drawImage).toHaveBeenCalled();
    });
});
