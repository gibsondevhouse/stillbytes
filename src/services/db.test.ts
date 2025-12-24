/**
 * Database tests for Stillbytes
 * Run with: npm run test
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  addPhoto,
  addPhotos,
  getPhotoByPath,
  getAllPhotos,
  updatePhoto,
  deletePhoto,
  clearDatabase,
  initDatabase,
  db,
} from '@/services/db';
import { Photo } from '@/types';

describe('Database Service', () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  it('should initialize database with default library and sample data', async () => {
    await initDatabase();
    const photoCount = await db.photos.count();
    // 2 sample photos are added during init
    expect(photoCount).toBe(2);

    const libraryCount = await db.libraries.count();
    expect(libraryCount).toBe(1);
  });

  it('should add a single photo', async () => {
    const photo: Omit<Photo, 'id'> = {
      filePath: '/test/photo1.CR2',
      fileName: 'photo1.CR2',
      fileSize: 25000000,
      format: 'CR2',
      thumbnail: 'data:image/jpeg;base64,test',
      dateTaken: new Date('2024-01-15'),
      dateImported: new Date(),
      rating: 0,
      starred: false,
      tags: [],
      exif: {
        camera: 'Canon EOS R5',
        lens: 'RF 24-105mm F4L',
        iso: 400,
        shutterSpeed: '1/250',
        aperture: 'f/4.0',
        focalLength: 50,
        width: 8192,
        height: 5464,
      },
      editHistory: [],
      hasUnsavedEdits: false,
    };

    const id = await addPhoto(photo);
    expect(id).toBeGreaterThan(0);

    const retrieved = await getPhotoByPath('/test/photo1.CR2');
    expect(retrieved?.fileName).toBe('photo1.CR2');
    expect(retrieved?.exif.camera).toBe('Canon EOS R5');
  });

  it('should bulk add multiple photos', async () => {
    const photos: Omit<Photo, 'id'>[] = [
      {
        filePath: '/test/photo1.CR2',
        fileName: 'photo1.CR2',
        fileSize: 25000000,
        format: 'CR2',
        thumbnail: 'test1',
        dateTaken: new Date(),
        dateImported: new Date(),
        rating: 0,
        starred: false,
        tags: [],
        exif: { width: 8192, height: 5464 },
        editHistory: [],
        hasUnsavedEdits: false,
      },
      {
        filePath: '/test/photo2.CR2',
        fileName: 'photo2.CR2',
        fileSize: 25000000,
        format: 'CR2',
        thumbnail: 'test2',
        dateTaken: new Date(),
        dateImported: new Date(),
        rating: 0,
        starred: false,
        tags: [],
        exif: { width: 8192, height: 5464 },
        editHistory: [],
        hasUnsavedEdits: false,
      },
    ];

    const count = await addPhotos(photos);
    expect(count).toBe(2);

    const allPhotos = await getAllPhotos();
    // 2 samples + 2 added
    expect(allPhotos.length).toBe(4);
  });

  it('should filter photos by rating', async () => {
    const photos: Omit<Photo, 'id'>[] = [
      {
        filePath: '/test/photo1.CR2',
        fileName: 'photo1.CR2',
        fileSize: 25000000,
        format: 'CR2',
        thumbnail: 'test1',
        dateTaken: new Date(),
        dateImported: new Date(),
        rating: 5,
        starred: false,
        tags: [],
        exif: { width: 8192, height: 5464 },
        editHistory: [],
        hasUnsavedEdits: false,
      },
      {
        filePath: '/test/photo2.CR2',
        fileName: 'photo2.CR2',
        fileSize: 25000000,
        format: 'CR2',
        thumbnail: 'test2',
        dateTaken: new Date(),
        dateImported: new Date(),
        rating: 3,
        starred: false,
        tags: [],
        exif: { width: 8192, height: 5464 },
        editHistory: [],
        hasUnsavedEdits: false,
      },
    ];

    await addPhotos(photos);

    // Initialized has 2 sample photos:
    // 1. lake.CR2 (rating 5, starred: true)
    // 2. portrait.ARW (rating 4, starred: false)
    // We added 2 more:
    // 3. photo1.CR2 (rating 5)
    // 4. photo2.CR2 (rating 3)
    // Total photos with rating >= 4 should be 3 (2 samples + 1 added)
    const highRated = await getAllPhotos({ rating: 4 });
    expect(highRated.length).toBe(3);
    expect(highRated.filter(p => p.rating === 5).length).toBe(2);
  });

  it('should update photo metadata', async () => {
    const photo: Omit<Photo, 'id'> = {
      filePath: '/test/photo1.CR2',
      fileName: 'photo1.CR2',
      fileSize: 25000000,
      format: 'CR2',
      thumbnail: 'test',
      dateTaken: new Date(),
      dateImported: new Date(),
      rating: 0,
      starred: false,
      tags: [],
      exif: { width: 8192, height: 5464 },
      editHistory: [],
      hasUnsavedEdits: false,
    };

    const id = await addPhoto(photo);
    await updatePhoto(id, { rating: 5, starred: true });

    const updated = await getPhotoByPath('/test/photo1.CR2');
    expect(updated?.rating).toBe(5);
    expect(updated?.starred).toBe(true);
  });

  it('should delete photo', async () => {
    const photo: Omit<Photo, 'id'> = {
      filePath: '/test/photo1.CR2',
      fileName: 'photo1.CR2',
      fileSize: 25000000,
      format: 'CR2',
      thumbnail: 'test',
      dateTaken: new Date(),
      dateImported: new Date(),
      rating: 0,
      starred: false,
      tags: [],
      exif: { width: 8192, height: 5464 },
      editHistory: [],
      hasUnsavedEdits: false,
    };

    const id = await addPhoto(photo);
    await deletePhoto(id);

    const retrieved = await getPhotoByPath('/test/photo1.CR2');
    expect(retrieved).toBeUndefined();
  });
});
