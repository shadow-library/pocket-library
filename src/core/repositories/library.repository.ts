/**
 * Importing npm packages
 */

/**
 * Importing user defined packages
 */
import { fileSystemService } from '@/core/infrastructure/file-system.service';
import { utilityService } from '@/core/infrastructure/utility.service';
import { LIBRARY_SCHEMA_VERSION, type Chapter, type Character, type CharacterVariant, type LibraryDoc, type Novel, type Progress, type Scene } from '@/core/types/novel.types';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

const LIBRARY_FILE = 'library.json';

const EMPTY_LIBRARY: LibraryDoc = { schemaVersion: LIBRARY_SCHEMA_VERSION, novels: [], lastReadNovelId: null };

// Persists the library index (novel metadata + progress + last-read pointer) as a single JSON file
// in the private document directory.
class LibraryRepository {
  constructor(private readonly files = fileSystemService, private readonly utility = utilityService) {}

  read(): LibraryDoc {
    const stored = this.files.readJsonFile<unknown>(LIBRARY_FILE);
    if (stored === null) return { ...EMPTY_LIBRARY };
    return this.migrate(stored);
  }

  write(doc: LibraryDoc): void {
    this.files.writeJsonFile(LIBRARY_FILE, doc);
  }

  // Forward-migrates any previously persisted library doc to the current shape. Every novel is rebuilt
  // field-by-field with safe defaults instead of being trusted as-is, so a field added in a newer app
  // version (e.g. `characters[].variants`) is backfilled rather than read as `undefined` and crashing
  // the UI. Malformed entries are dropped, not propagated. Adding a field later means giving it a
  // default here — old libraries then upgrade transparently on the next read.
  private migrate(raw: unknown): LibraryDoc {
    const doc = this.utility.isRecord(raw) ? raw : {};
    const novels = Array.isArray(doc.novels) ? doc.novels.map((novel) => this.normalizeNovel(novel)).filter((novel): novel is Novel => novel !== null) : [];
    const ids = new Set(novels.map((novel) => novel.id));
    const lastReadNovelId = typeof doc.lastReadNovelId === 'string' && ids.has(doc.lastReadNovelId) ? doc.lastReadNovelId : null;
    return { schemaVersion: LIBRARY_SCHEMA_VERSION, novels, lastReadNovelId };
  }

  private normalizeNovel(raw: unknown): Novel | null {
    if (!this.utility.isRecord(raw) || typeof raw.id !== 'string' || raw.id.length === 0) return null;
    return {
      id: raw.id,
      title: typeof raw.title === 'string' && raw.title.length > 0 ? raw.title : raw.id,
      author: typeof raw.author === 'string' ? raw.author : undefined,
      description: typeof raw.description === 'string' ? raw.description : undefined,
      tags: Array.isArray(raw.tags) ? raw.tags.filter((tag): tag is string => typeof tag === 'string') : [],
      coverPath: typeof raw.coverPath === 'string' ? raw.coverPath : undefined,
      characters: Array.isArray(raw.characters) ? raw.characters.map((character) => this.normalizeCharacter(character)).filter((character): character is Character => character !== null) : [],
      scenes: Array.isArray(raw.scenes) ? raw.scenes.map((scene) => this.normalizeScene(scene)).filter((scene): scene is Scene => scene !== null) : [],
      chapters: Array.isArray(raw.chapters) ? raw.chapters.map((chapter) => this.normalizeChapter(chapter)).filter((chapter): chapter is Chapter => chapter !== null) : [],
      importedAt: typeof raw.importedAt === 'number' ? raw.importedAt : Date.now(),
      progress: this.normalizeProgress(raw.progress),
    };
  }

  private normalizeCharacter(raw: unknown): Character | null {
    if (!this.utility.isRecord(raw) || typeof raw.name !== 'string' || raw.name.length === 0) return null;
    return {
      name: raw.name,
      imagePath: typeof raw.imagePath === 'string' ? raw.imagePath : undefined,
      description: typeof raw.description === 'string' ? raw.description : undefined,
      variants: Array.isArray(raw.variants) ? raw.variants.map((variant) => this.normalizeVariant(variant)).filter((variant): variant is CharacterVariant => variant !== null) : [],
    };
  }

  private normalizeVariant(raw: unknown): CharacterVariant | null {
    if (!this.utility.isRecord(raw) || typeof raw.imagePath !== 'string' || raw.imagePath.length === 0) return null;
    return { imagePath: raw.imagePath, label: typeof raw.label === 'string' ? raw.label : undefined };
  }

  private normalizeChapter(raw: unknown): Chapter | null {
    if (!this.utility.isRecord(raw) || typeof raw.path !== 'string' || raw.path.length === 0) return null;
    return { title: typeof raw.title === 'string' && raw.title.length > 0 ? raw.title : raw.path, path: raw.path };
  }

  private normalizeScene(raw: unknown): Scene | null {
    if (!this.utility.isRecord(raw) || typeof raw.imagePath !== 'string' || raw.imagePath.length === 0) return null;
    return {
      imagePath: raw.imagePath,
      chapterPath: typeof raw.chapterPath === 'string' ? raw.chapterPath : undefined,
      caption: typeof raw.caption === 'string' ? raw.caption : undefined,
    };
  }

  private normalizeProgress(raw: unknown): Progress | undefined {
    if (!this.utility.isRecord(raw) || typeof raw.chapterIndex !== 'number') return undefined;
    return {
      chapterIndex: raw.chapterIndex,
      scrollFraction: typeof raw.scrollFraction === 'number' ? raw.scrollFraction : 0,
      updatedAt: typeof raw.updatedAt === 'number' ? raw.updatedAt : Date.now(),
    };
  }
}

export const libraryRepository = new LibraryRepository();
