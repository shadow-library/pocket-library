/**
 * Importing npm packages
 */

/**
 * Importing user defined packages
 */
import { libraryRepository } from '@/core/repositories/library.repository';
import { novelAssetRepository } from '@/core/repositories/novel-asset.repository';
import type { Novel } from '@/core/types/novel.types';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

// Read side of the library plus removal and asset-uri resolution for the UI.
class LibraryService {
  constructor(private readonly library = libraryRepository, private readonly assets = novelAssetRepository) {}

  list(): Novel[] {
    return this.library.read().novels;
  }

  get(id: string): Novel | null {
    return this.library.read().novels.find((novel) => novel.id === id) ?? null;
  }

  lastReadNovelId(): string | null {
    return this.library.read().lastReadNovelId;
  }

  continueReading(): Novel | null {
    const doc = this.library.read();
    if (doc.lastReadNovelId === null) return null;
    return doc.novels.find((novel) => novel.id === doc.lastReadNovelId) ?? null;
  }

  remove(id: string): void {
    this.assets.remove(id);
    const doc = this.library.read();
    const novels = doc.novels.filter((novel) => novel.id !== id);
    const lastReadNovelId = doc.lastReadNovelId === id ? null : doc.lastReadNovelId;
    this.library.write({ ...doc, novels, lastReadNovelId });
  }

  coverUri(novel: Novel): string | null {
    return novel.coverPath !== undefined ? this.assets.assetUri(novel.id, novel.coverPath) : null;
  }

  assetUri(novelId: string, relativePath: string): string {
    return this.assets.assetUri(novelId, relativePath);
  }

  chapterText(novelId: string, relativePath: string): string {
    return this.assets.readChapter(novelId, relativePath);
  }
}

export const libraryService = new LibraryService();
