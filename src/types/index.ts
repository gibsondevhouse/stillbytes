/**
 * Core TypeScript interfaces for Stillbytes
 * Based on research002.md decisions
 */

// ============================================================================
// PHOTO & LIBRARY TYPES
// ============================================================================

export interface MasterPhoto {
  id?: number; // Auto-increment primary key
  filePath: string; // Unique identifier (original RAW)
  fileName: string;
  fileSize: number; // bytes
  format: 'CR2' | 'NEF' | 'ARW' | 'DNG' | 'RAF' | 'ORF' | 'RW2'; // RAW formats

  // Cache/Preview Paths (Section 2.1.1)
  cachePath: string; // Directory containing previews/masks
  thumbnailPath: string; // thumb.jpg
  previewPath: string; // preview.jpg
  proxyPath: string; // smart_proxy.jpg

  // Dates
  dateTaken: Date;
  dateImported: Date;

  // EXIF Metadata (core tags)
  exif: {
    camera?: string;
    lens?: string;
    iso?: number;
    shutterSpeed?: string;
    aperture?: string;
    focalLength?: number;
    width: number;
    height: number;
    colorSpace?: string;
    copyright?: string;
  };

  // Virtual Copies (Every Master has at least one)
  virtualCopies: VirtualCopy[];
}

export interface VirtualCopy {
  id: string; // UUID
  masterPhotoId: number; // Link to MasterPhoto
  name: string; // e.g., "Original", "B&W", "Edit 1"
  version: number; // incremented

  // Metadata specific to this copy
  rating: 0 | 1 | 2 | 3 | 4 | 5;
  flag: 'pick' | 'reject' | null;
  colorLabel: 'red' | 'yellow' | 'green' | 'blue' | 'purple' | null;
  starred: boolean;
  tags: string[];

  // Edit history (Specific to this copy)
  editHistory: EditOperation[];
  hasUnsavedEdits: boolean;

  dateCreated: Date;
  dateModified: Date;
}

// ============================================================================
// EDIT OPERATION TYPES
// ============================================================================

export type EditOperation =
  | HSLAdjustOperation
  | BrightnessContrastOperation
  | ToneCurveOperation
  | ExposureOperation
  | ExposureOperation
  | SharpenOperation
  | CropRotateOperation;

interface BaseOperation {
  id: string; // UUID
  type: string;
  timestamp: Date;
  version: number; // For future compatibility
}

export interface HSLAdjustOperation extends BaseOperation {
  type: 'hsl_adjust';
  parameters: {
    hue: number; // -180 to +180
    saturation: number; // -100 to +100
    lightness: number; // -100 to +100
  };
}

export interface BrightnessContrastOperation extends BaseOperation {
  type: 'brightness_contrast';
  parameters: {
    brightness: number; // -100 to +100
    contrast: number; // -100 to +100
  };
}

export interface ToneCurveOperation extends BaseOperation {
  type: 'tone_curve';
  parameters: {
    shadows: number; // 0-255
    midtones: number; // 0-255
    highlights: number; // 0-255
    blacks: number; // 0-255
    whites: number; // 0-255
  };
}

export interface ExposureOperation extends BaseOperation {
  type: 'exposure';
  parameters: {
    exposure: number; // -3 to +3 stops
  };
}

export interface SharpenOperation extends BaseOperation {
  type: 'sharpen';
  parameters: {
    amount: number; // 0-100
    radius: number; // 0.5-5.0
  };
}

export interface CropRotateOperation extends BaseOperation {
  type: 'crop_rotate';
  parameters: {
    crop: { x: number; y: number; width: number; height: number }; // Normalized 0-1
    rotation: number; // Degrees
    flipHorizontal?: boolean;
    flipVertical?: boolean;
  };
}

// ============================================================================
// LIBRARY TYPES
// ============================================================================

export interface Library {
  id?: number;
  name: string;
  photoCount: number;
  totalSizeBytes: number;
  dateCreated: Date;
  dateModified: Date;
}

// ============================================================================
// STORAGE QUOTA
// ============================================================================

export interface StorageQuota {
  usage: number; // bytes
  quota: number; // bytes
  usagePercent: number; // 0-100
  isPersisted: boolean;
}

// ============================================================================
// IMPORT TYPES
// ============================================================================

export interface ImportProgress {
  currentFile: string;
  filesProcessed: number;
  totalFiles: number;
  percentComplete: number;
  status: 'pending' | 'processing' | 'complete' | 'error';
  error?: string;
}

// ============================================================================
// FILTER PIPELINE TYPES
// ============================================================================

export interface FilterPipeline {
  operations: EditOperation[];
  previewImageData?: ImageData;
}

// ============================================================================
// UNDO/REDO STATE
// ============================================================================

export interface EditHistoryState {
  past: EditOperation[][];
  present: EditOperation[];
  future: EditOperation[][];
  maxHistoryLength: number; // Default: 50
}

// ============================================================================
// GLOBAL TYPES
// ============================================================================

declare global {
  interface Window {
    electron: {
      selectDirectory: () => Promise<string | null>;
      scanDirectory: (path: string) => Promise<string[]>;
      readImage: (path: string) => Promise<ArrayBuffer>;
      getAppPath: () => Promise<string>;
      ensureDirectory: (path: string) => Promise<void>;
      copyFile: (src: string, dest: string) => Promise<void>;
      getFileStats: (path: string) => Promise<{ birthtime: Date; mtime: Date; size: number }>;
      generateThumbnail: (path: string) => Promise<string>;
      // New background process methods for Phase 2
      generateCacheArtifacts: (path: string, cacheDir: string) => Promise<{
        thumbPath: string;
        previewPath: string;
        proxyPath: string;
      }>;
    };
  }
}
