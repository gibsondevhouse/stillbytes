/**
 * Dexie.js Database Service for Stillbytes
 * Based on research002.md: IndexedDB + Dexie.js for MVP (<5K photos)
 * 
 * Features:
 * - TypeScript-first with Table<T> generic types
 * - Indexed queries: filePath (unique), dateTaken, rating, starred
 * - Quota monitoring at 80%, persistent storage request at 50%
 * - Bulk operations with bulkAdd() optimization
 */

import Dexie, { Table } from 'dexie';
import { Photo, Library, StorageQuota } from '@/types';

// ============================================================================
// DATABASE CLASS
// ============================================================================

class StillbytesDB extends Dexie {
  photos!: Table<Photo, number>;
  libraries!: Table<Library, number>;

  constructor() {
    super('StillbytesDB');
    
    // Schema version 1
    this.version(1).stores({
      photos: '++id, filePath, dateTaken, rating, starred, dateImported',
      libraries: '++id, name, dateCreated',
    });
  }
}

// Singleton instance
const db = new StillbytesDB();

// ============================================================================
// PHOTO OPERATIONS
// ============================================================================

/**
 * Add a single photo to the database
 */
export async function addPhoto(photo: Omit<Photo, 'id'>): Promise<number> {
  try {
    const id = await db.photos.add(photo as Photo);
    return id;
  } catch (error: any) {
    if (error.name === 'QuotaExceededError') {
      console.error('Storage quota exceeded. Attempting to cleanup...');
      await cleanupOldThumbnails(50);
      // Retry once
      return await db.photos.add(photo as Photo);
    }
    console.error('Failed to add photo:', error);
    throw new Error(`Failed to add photo: ${error.message || error}`);
  }
}

/**
 * Add multiple photos in bulk (2-3× faster than individual adds)
 */
export async function addPhotos(photos: Omit<Photo, 'id'>[]): Promise<number> {
  try {
    await db.photos.bulkAdd(photos as Photo[]);
    return photos.length;
  } catch (error: any) {
    if (error.name === 'QuotaExceededError') {
      console.error('Storage quota exceeded during bulk add.');
      throw new Error('Storage space full. Please free up some space.');
    }
    console.error('Failed to bulk add photos:', error);
    throw new Error(`Failed to bulk add photos: ${error.message || error}`);
  }
}

/**
 * Get photo by unique file path
 */
export async function getPhotoByPath(filePath: string): Promise<Photo | undefined> {
  return await db.photos.where('filePath').equals(filePath).first();
}

/**
 * Get photo by ID
 */
export async function getPhotoById(id: number): Promise<Photo | undefined> {
  return await db.photos.get(id);
}

/**
 * Get all photos (with optional filters)
 */
export async function getAllPhotos(filters?: {
  rating?: number;
  starred?: boolean;
  dateRange?: { start: Date; end: Date };
}): Promise<Photo[]> {
  let collection;

  if (filters?.starred !== undefined) {
    collection = db.photos.where('starred').equals(filters.starred ? 1 : 0);
  } else if (filters?.rating !== undefined) {
    collection = db.photos.where('rating').aboveOrEqual(filters.rating);
  } else {
    collection = db.photos.toCollection();
  }

  // Secondary filters (unindexed or complex)
  if (filters?.rating !== undefined && filters?.starred !== undefined) {
    collection = collection.filter(p => p.rating >= filters.rating!);
  }

  if (filters?.dateRange) {
    collection = collection.filter(
      p => p.dateTaken >= filters.dateRange!.start && p.dateTaken <= filters.dateRange!.end
    );
  }

  return await collection.toArray();
}

/**
 * Update photo metadata
 */
export async function updatePhoto(id: number, changes: Partial<Photo>): Promise<void> {
  await db.photos.update(id, changes);
}

/**
 * Update photo edit history
 */
export async function saveEditHistory(id: number, editHistory: Photo['editHistory']): Promise<void> {
  await db.photos.update(id, {
    editHistory,
    dateModified: new Date(),
    hasUnsavedEdits: false,
  });
}

/**
 * Mark photo as having unsaved edits (for session recovery)
 */
export async function markPhotoUnsaved(id: number, hasUnsavedEdits: boolean): Promise<void> {
  await db.photos.update(id, { hasUnsavedEdits });
}

/**
 * Delete photo by ID
 */
export async function deletePhoto(id: number): Promise<void> {
  await db.photos.delete(id);
}

/**
 * Delete multiple photos
 */
export async function deletePhotos(ids: number[]): Promise<void> {
  await db.photos.bulkDelete(ids);
}

/**
 * Get photos with unsaved edits (for session recovery)
 */
export async function getPhotosWithUnsavedEdits(): Promise<Photo[]> {
  return await db.photos.where('hasUnsavedEdits').equals(1).toArray();
}

// ============================================================================
// LIBRARY OPERATIONS
// ============================================================================

/**
 * Create a new library
 */
export async function createLibrary(name: string): Promise<number> {
  const library: Omit<Library, 'id'> = {
    name,
    photoCount: 0,
    totalSizeBytes: 0,
    dateCreated: new Date(),
    dateModified: new Date(),
  };
  return await db.libraries.add(library as Library);
}

/**
 * Update library statistics
 */
export async function updateLibraryStats(): Promise<void> {
  const photos = await db.photos.toArray();
  const totalSize = photos.reduce((sum, p) => sum + p.fileSize, 0);
  
  // For MVP: single library (ID = 1)
  await db.libraries.update(1, {
    photoCount: photos.length,
    totalSizeBytes: totalSize,
    dateModified: new Date(),
  });
}

// ============================================================================
// STORAGE QUOTA MANAGEMENT
// ============================================================================

/**
 * Get current storage quota status
 * Warn at 80%, request persistent storage at 50%
 */
export async function getStorageQuota(): Promise<StorageQuota> {
  if (!navigator.storage || !navigator.storage.estimate) {
    throw new Error('Storage API not supported');
  }

  const estimate = await navigator.storage.estimate();
  const usage = estimate.usage || 0;
  const quota = estimate.quota || 0;
  const usagePercent = quota > 0 ? (usage / quota) * 100 : 0;

  // Request persistent storage if usage > 50% and not already persisted
  if (usagePercent > 50) {
    const isPersisted = await navigator.storage.persist();
    return {
      usage,
      quota,
      usagePercent,
      isPersisted,
    };
  }

  const isPersisted = (await navigator.storage.persisted()) || false;

  return {
    usage,
    quota,
    usagePercent,
    isPersisted,
  };
}

/**
 * Check if approaching quota limit (>80%)
 */
export async function isApproachingQuota(): Promise<boolean> {
  const { usagePercent } = await getStorageQuota();
  return usagePercent > 80;
}

/**
 * Clean up oldest thumbnails to free space
 */
export async function cleanupOldThumbnails(count: number = 100): Promise<number> {
  const oldestPhotos = await db.photos
    .orderBy('dateImported')
    .limit(count)
    .toArray();

  let deletedCount = 0;
  for (const photo of oldestPhotos) {
    await db.photos.update(photo.id!, { thumbnail: '' });
    deletedCount++;
  }

  return deletedCount;
}

// ============================================================================
// DATABASE UTILITIES
// ============================================================================

/**
 * Initialize database (create default library)
 */
export async function initDatabase(): Promise<void> {
  const libraryCount = await db.libraries.count();
  if (libraryCount === 0) {
    await createLibrary('My Library');
    await seedDatabase();
  }
}

/**
 * Seed database with sample data
 */
export async function seedDatabase(): Promise<void> {
  const photoCount = await db.photos.count();
  if (photoCount > 0) return;

  const samplePhotos: Omit<Photo, 'id'>[] = [
    {
      filePath: '/samples/lake.CR2',
      fileName: 'lake.CR2',
      fileSize: 28450122,
      format: 'CR2',
      thumbnail: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCABkAGQDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElPU1FVWV1hZWmNkZWZnaGlqc3R1dnd4eXqGhcXl5ocEByYnN4eLhEGGo6mksl5SVl69zZ2unqKys7S1tre4u7v7w0fX19fY2drh4u7f3e39/f0p/9oADAMBAAIRAxEAPwD3+iiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAP//Z',
      dateTaken: new Date('2024-05-15T14:20:00'),
      dateImported: new Date(),
      rating: 5,
      starred: true,
      tags: ['landscape', 'nature'],
      exif: {
        camera: 'Canon EOS R5',
        lens: 'RF 24-70mm F2.8L',
        iso: 100,
        shutterSpeed: '1/125',
        aperture: 'f/8.0',
        focalLength: 35,
        width: 8192,
        height: 5464,
      },
      editHistory: [],
      hasUnsavedEdits: false,
    },
    {
      filePath: '/samples/portrait.ARW',
      fileName: 'portrait.ARW',
      fileSize: 42100500,
      format: 'ARW',
      thumbnail: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCABkAGQDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElPU1FVWV1hZWmNkZWZnaGlqc3R1dnd4eXqGhcXl5ocEByYnN4eLhEGGo6mksl5SVl69zZ2unqKys7S1tre4u7v7w0fX19fY2drh4u7f3e39/f0p/9oADAMBAAIRAxEAPwD3+iiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKAP//Z',
      dateTaken: new Date('2024-06-02T16:45:00'),
      dateImported: new Date(),
      rating: 4,
      starred: false,
      tags: ['portrait', 'studio'],
      exif: {
        camera: 'Sony A7R IV',
        lens: 'FE 85mm F1.4 GM',
        iso: 200,
        shutterSpeed: '1/200',
        aperture: 'f/1.8',
        focalLength: 85,
        width: 9504,
        height: 6336,
      },
      editHistory: [],
      hasUnsavedEdits: false,
    },
  ];

  await addPhotos(samplePhotos);
  console.log('Database seeded with sample photos.');
}

/**
 * Get database statistics
 */
export async function getDatabaseStats() {
  const photoCount = await db.photos.count();
  const photos = await db.photos.toArray();
  const totalSize = photos.reduce((sum, p) => sum + p.fileSize, 0);
  const quota = await getStorageQuota();

  return {
    photoCount,
    totalSizeBytes: totalSize,
    storageQuota: quota,
  };
}

/**
 * Export database to JSON (for backup)
 */
export async function exportDatabase(): Promise<string> {
  const photos = await db.photos.toArray();
  const libraries = await db.libraries.toArray();

  return JSON.stringify(
    {
      version: 1,
      exportDate: new Date().toISOString(),
      photos,
      libraries,
    },
    null,
    2
  );
}

/**
 * Clear all data (for testing/reset)
 */
export async function clearDatabase(): Promise<void> {
  await db.photos.clear();
  await db.libraries.clear();
  await initDatabase();
}

// ============================================================================
// EXPORTS
// ============================================================================

export { db };
export default db;
