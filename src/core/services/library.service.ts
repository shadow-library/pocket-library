/**
 * Importing npm packages
 */

/**
 * Importing user defined packages
 */
import { libraryRepository } from '@/core/repositories/library.repository';
import { novelAssetRepository } from '@/core/repositories/novel-asset.repository';
import type { Character, Novel } from '@/core/types/novel.types';

/**
 * Defining types
 */

// One viewable image of a character: the resolved uri plus a display label — the character name for the
// base portrait, or "Name · Outfit" for a labelled variant.
export type CharacterImage = { uri: string; label: string };

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

  // The character's viewable images in display order: base portrait first (when present), then each
  // outfit/scene variant. The first entry doubles as the strip avatar; `length - 1` is the "+N" count.
  characterImages(novelId: string, character: Character): CharacterImage[] {
    const images: CharacterImage[] = [];
    if (character.imagePath !== undefined) images.push({ uri: this.assets.assetUri(novelId, character.imagePath), label: character.name });
    for (const variant of character.variants) {
      const label = variant.label !== undefined && variant.label.length > 0 ? `${character.name} · ${variant.label}` : character.name;
      images.push({ uri: this.assets.assetUri(novelId, variant.imagePath), label });
    }
    return images;
  }
}

export const libraryService = new LibraryService();
