/**
 * Importing npm packages
 */

/**
 * Importing user defined packages
 */
import { libraryRepository } from '@/core/repositories/library.repository';
import type { Progress } from '@/core/types/novel.types';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

// Owns the "where did I leave off" data: per-novel progress plus the app-wide last-read pointer.
class ReadingProgressService {
  constructor(private readonly library = libraryRepository) {}

  save(novelId: string, progress: Progress): void {
    const doc = this.library.read();
    if (!doc.novels.some((novel) => novel.id === novelId)) return;
    const novels = doc.novels.map((novel) => (novel.id === novelId ? { ...novel, progress } : novel));
    this.library.write({ ...doc, novels, lastReadNovelId: novelId });
  }

  setLastRead(novelId: string): void {
    const doc = this.library.read();
    if (!doc.novels.some((novel) => novel.id === novelId)) return;
    this.library.write({ ...doc, lastReadNovelId: novelId });
  }

  get(novelId: string): Progress | null {
    return this.library.read().novels.find((novel) => novel.id === novelId)?.progress ?? null;
  }
}

export const readingProgressService = new ReadingProgressService();
