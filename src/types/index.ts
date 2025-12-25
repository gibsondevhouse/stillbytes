/**
 * Core TypeScript interfaces for Stillbytes
 * Based on research002.md decisions
 */

// ============================================================================
// PHOTO & LIBRARY TYPES
// ============================================================================

export interface Photo {
  id?: number; // Auto-increment primary key
  filePath: string; // Unique identifier
  fileName: string;
  fileSize: number; // bytes
  format: 'CR2' | 'NEF' | 'ARW' | 'DNG' | 'RAF' | 'ORF' | 'RW2'; // RAW formats

  // Thumbnail (150x100px ~20KB Base64 JPEG)
  thumbnail: string; // Base64 encoded

  // Dates
  dateTaken: Date;
  dateImported: Date;
  dateModified?: Date;

  // User metadata
  rating: 0 | 1 | 2 | 3 | 4 | 5;
  flag: 'pick' | 'reject' | null;
  colorLabel: 'red' | 'yellow' | 'green' | 'blue' | 'purple' | null;
  starred: boolean;
  tags: string[];

  // EXIF Metadata (core tags)
  exif: {
    camera?: string; // e.g., "Canon EOS R5"
    lens?: string; // e.g., "RF 24-105mm F4L"
    iso?: number;
    shutterSpeed?: string; // e.g., "1/250"
    aperture?: string; // e.g., "f/4.0"
    focalLength?: number; // mm
    width: number; // px
    height: number; // px
    colorSpace?: string;
    copyright?: string;
  };

  // Edit history (operations only, not pixels)
  editHistory: EditOperation[];

  // Session recovery
  hasUnsavedEdits: boolean;
  // For Web/Dev Mode only:
  blob?: File;
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
    };
  }
}
