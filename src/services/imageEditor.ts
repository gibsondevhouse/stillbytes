import reglModule from 'regl';
import { EditOperation, HSLAdjustOperation, BrightnessContrastOperation, ExposureOperation } from '@/types';

/**
 * High-performance WebGL Filter Service for Stillbytes
 * Uses regl for GPU-accelerated photo adjustments
 */
export class ImageEditorService {
    private regl: any = null;
    private sourceTexture: any = null;
    private drawCommand: any = null;
    private sourceWidth: number = 0;
    private sourceHeight: number = 0;

    /**
     * Initialize the service with an image
     */
    public async init(image: HTMLImageElement | HTMLCanvasElement): Promise<void> {
        this.sourceWidth = image instanceof HTMLImageElement ? image.naturalWidth : image.width;
        this.sourceHeight = image instanceof HTMLImageElement ? image.naturalHeight : image.height;

        // Create a hidden canvas for regl if we don't have one yet
        if (!this.regl) {
            const canvas = document.createElement('canvas');
            // We'll resize this when drawing
            this.regl = reglModule({
                canvas,
                attributes: { preserveDrawingBuffer: true, antialias: false }
            });

            this.createDrawCommand();
        }

        // Upload image to GPU
        if (this.sourceTexture) this.sourceTexture.destroy();
        this.sourceTexture = this.regl.texture({
            data: image,
            flipY: true, // WebGL texture coord system
            min: 'linear',
            mag: 'linear'
        });
    }

    private createDrawCommand() {
        this.drawCommand = this.regl({
            frag: `
            precision highp float;
            uniform sampler2D texture;
            uniform float exposure;
            uniform float brightness;
            uniform float contrast;
            uniform vec3 hslAdjust; // x: hue, y: sat, z: light
            varying vec2 vUv;

            // RGB to HSL helper
            vec3 rgb2hsl(vec3 c) {
                float maxVal = max(c.r, max(c.g, c.b));
                float minVal = min(c.r, min(c.g, c.b));
                float h, s, l = (maxVal + minVal) / 2.0;
                if (maxVal == minVal) {
                    h = s = 0.0;
                } else {
                    float d = maxVal - minVal;
                    s = l > 0.5 ? d / (2.0 - maxVal - minVal) : d / (maxVal + minVal);
                    if (maxVal == c.r) h = (c.g - c.b) / d + (c.g < c.b ? 6.0 : 0.0);
                    else if (maxVal == c.g) h = (c.b - c.r) / d + 2.0;
                    else if (maxVal == c.b) h = (c.r - c.g) / d + 4.0;
                    h /= 6.0;
                }
                return vec3(h, s, l);
            }

            // HSL to RGB helper
            float hue2rgb(float p, float q, float t) {
                if (t < 0.0) t += 1.0;
                if (t > 1.0) t -= 1.0;
                if (t < 1.0/6.0) return p + (q - p) * 6.0 * t;
                if (t < 1.0/2.0) return q;
                if (t < 2.0/3.0) return p + (q - p) * (2.0/3.0 - t) * 6.0;
                return p;
            }

            vec3 hsl2rgb(vec3 hsl) {
                vec3 rgb;
                if (hsl.y == 0.0) {
                    rgb = vec3(hsl.z);
                } else {
                    float q = hsl.z < 0.5 ? hsl.z * (1.0 + hsl.y) : hsl.z + hsl.y - hsl.z * hsl.y;
                    float p = 2.0 * hsl.z - q;
                    rgb.r = hue2rgb(p, q, hsl.x + 1.0/3.0);
                    rgb.g = hue2rgb(p, q, hsl.x);
                    rgb.b = hue2rgb(p, q, hsl.x - 1.0/3.0);
                }
                return rgb;
            }

            void main() {
                vec4 tex = texture2D(texture, vUv);
                vec3 color = tex.rgb;

                // 1. Exposure
                color *= pow(2.0, exposure);

                // 2. Brightness
                color += (brightness / 255.0);

                // 3. Contrast
                float factor = (259.0 * (contrast + 255.0)) / (255.0 * (259.0 - contrast));
                color = factor * (color - 0.5) + 0.5;

                // 4. HSL Adjust
                vec3 hsl = rgb2hsl(color);
                hsl.x = mod(hsl.x + hslAdjust.x / 360.0, 1.0);
                hsl.y = clamp(hsl.y * (1.0 + hslAdjust.y / 100.0), 0.0, 1.0);
                hsl.z = clamp(hsl.z + hslAdjust.z / 100.0, 0.0, 1.0);
                color = hsl2rgb(hsl);

                gl_FragColor = vec4(clamp(color, 0.0, 1.0), tex.a);
            }
            `,
            vert: `
            precision highp float;
            attribute vec2 position;
            attribute vec2 uv;
            varying vec2 vUv;
            uniform vec4 crop; // x, y, w, h
            uniform float rotation;
            void main() {
                vUv = uv;
                // Apply crop to UVs
                vUv = vec2(crop.x + uv.x * crop.z, crop.y + uv.y * crop.w);
                
                // For now, rotation can be handled by the target canvas or here
                // Simplified: rotation handled by vertex projection if needed
                gl_Position = vec4(position, 0, 1);
            }
            `,
            attributes: {
                position: [[-1, -1], [1, -1], [-1, 1], [-1, 1], [1, -1], [1, 1]],
                uv: [[0, 0], [1, 0], [0, 1], [0, 1], [1, 0], [1, 1]]
            },
            uniforms: {
                texture: this.sourceTexture,
                exposure: this.regl.prop('exposure'),
                brightness: this.regl.prop('brightness'),
                contrast: this.regl.prop('contrast'),
                hslAdjust: this.regl.prop('hslAdjust'),
                crop: this.regl.prop('crop'),
                rotation: this.regl.prop('rotation')
            },
            count: 6
        });
    }

    /**
     * Apply a stack of operations and render to the target canvas
     */
    public applyOperations(
        operations: EditOperation[],
        targetCanvas: HTMLCanvasElement
    ): void {
        if (!this.regl || !this.sourceTexture) return;

        // Parse operations
        const exposure = (operations.find(o => o.type === 'exposure') as ExposureOperation)?.parameters.exposure || 0;
        const bc = (operations.find(o => o.type === 'brightness_contrast') as BrightnessContrastOperation)?.parameters || { brightness: 0, contrast: 0 };
        const hsl = (operations.find(o => o.type === 'hsl_adjust') as HSLAdjustOperation)?.parameters || { hue: 0, saturation: 0, lightness: 0 };
        const cropOp = operations.find(o => o.type === 'crop_rotate') as any;

        const cropParams = cropOp?.parameters.crop || { x: 0, y: 0, width: 1, height: 1 };
        const rotation = cropOp?.parameters.rotation || 0;

        // Resize regl canvas and target
        const outW = Math.floor(cropParams.width * this.sourceWidth);
        const outH = Math.floor(cropParams.height * this.sourceHeight);

        // Adjust for 90/270 degree rotation switching width/height
        const isSideways = Math.abs(rotation) % 180 !== 0;
        const targetW = isSideways ? outH : outW;
        const targetH = isSideways ? outW : outH;

        targetCanvas.width = targetW;
        targetCanvas.height = targetH;

        // Regl draws to its own internal canvas first
        this.regl._gl.canvas.width = targetW;
        this.regl._gl.canvas.height = targetH;

        this.regl.clear({ color: [0, 0, 0, 1] });

        // Draw to regl canvas
        this.drawCommand({
            exposure,
            brightness: bc.brightness,
            contrast: bc.contrast,
            hslAdjust: [hsl.hue, hsl.saturation, hsl.lightness],
            crop: [cropParams.x, 1.0 - (cropParams.y + cropParams.height), cropParams.width, cropParams.height], // Flip Y for crop
            rotation
        });

        // Sync regl canvas to target canvas
        // This is necessary because targetCanvas is provided from React ref
        const ctx = targetCanvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(this.regl._gl.canvas, 0, 0);
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
