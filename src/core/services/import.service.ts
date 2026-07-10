/**
 * Importing npm packages
 */

/**
 * Importing user defined packages
 */
import { content } from '@/core/content';
import { archiveService, type ArchiveEntries } from '@/core/infrastructure/archive.service';
import { documentPickerService } from '@/core/infrastructure/document-picker.service';
import { fileSystemService } from '@/core/infrastructure/file-system.service';
import { utilityService } from '@/core/infrastructure/utility.service';
import { libraryRepository } from '@/core/repositories/library.repository';
import { novelAssetRepository } from '@/core/repositories/novel-asset.repository';
import { MANIFEST_FILE_NAME, SUPPORTED_MANIFEST_VERSION, type ManifestCharacterVariant, type NovelManifest } from '@/core/types/manifest.types';
import { LIBRARY_SCHEMA_VERSION, type Chapter, type Character, type Novel, type Scene } from '@/core/types/novel.types';

/**
 * Defining types
 */

export type ImportResult = { status: 'imported'; novel: Novel } | { status: 'canceled' } | { status: 'error'; message: string };

/**
 * Declaring the constants
 */

const errors = content.import.errors;

// Turns a picked `.novel` package into an installed, indexed novel. All external input is validated
// here before it reaches the store or UI.
class ImportService {
  constructor(
    private readonly picker = documentPickerService,
    private readonly files = fileSystemService,
    private readonly archive = archiveService,
    private readonly assets = novelAssetRepository,
    private readonly library = libraryRepository,
    private readonly utility = utilityService,
  ) {}

  async importFromPicker(): Promise<ImportResult> {
    const picked = await this.picker.pickNovelPackage();
    if (picked.status === 'canceled') return { status: 'canceled' };
    return this.importFromUri(picked.file.uri);
  }

  importFromUri(uri: string): ImportResult {
    let entries: ArchiveEntries;
    try {
      entries = this.archive.unzip(this.files.readBytesFromUri(uri));
    } catch {
      return { status: 'error', message: errors.invalidPackage };
    }

    const manifestEntry = entries[MANIFEST_FILE_NAME];
    if (manifestEntry === undefined) return { status: 'error', message: errors.missingManifest };

    const manifest = this.parseManifest(this.archive.decodeText(manifestEntry));
    if (manifest === null) return { status: 'error', message: errors.malformedManifest };

    try {
      const id = this.utility.slugify(manifest.id);
      this.assets.extract(id, entries);
      const chapters = this.installedChapters(id, manifest);
      if (chapters.length === 0) {
        this.assets.remove(id);
        return { status: 'error', message: errors.noChapters };
      }
      const novel = this.toNovel(id, manifest, chapters);
      this.register(novel);
      return { status: 'imported', novel };
    } catch {
      return { status: 'error', message: errors.failed };
    }
  }

  private installedChapters(id: string, manifest: NovelManifest): Chapter[] {
    return manifest.chapters
      .filter((chapter) => this.assets.hasAsset(id, chapter.file))
      .map((chapter) => ({ title: chapter.title, path: chapter.file }));
  }

  private toNovel(id: string, manifest: NovelManifest, chapters: Chapter[]): Novel {
    const coverPath = manifest.cover !== undefined && this.assets.hasAsset(id, manifest.cover) ? manifest.cover : undefined;
    const characters: Character[] = (manifest.characters ?? []).map((character) => ({
      name: character.name,
      description: character.description,
      imagePath: character.image !== undefined && this.assets.hasAsset(id, character.image) ? character.image : undefined,
      variants: (character.variants ?? [])
        .filter((variant) => this.assets.hasAsset(id, variant.image))
        .map((variant) => ({ imagePath: variant.image, label: variant.label })),
    }));
    const scenes = this.installedScenes(id, manifest, chapters);
    return {
      id,
      title: manifest.title,
      author: manifest.author,
      description: manifest.description,
      tags: manifest.tags ?? [],
      coverPath,
      characters,
      scenes,
      chapters,
      importedAt: Date.now(),
    };
  }

  // Drops scenes whose image asset is missing, and clears a `chapter` tag that doesn't match an
  // installed chapter's path — an untagged scene belongs to every chapter, so an unmatched tag is
  // treated the same way rather than silently discarding the scene.
  private installedScenes(id: string, manifest: NovelManifest, chapters: Chapter[]): Scene[] {
    const chapterPaths = new Set(chapters.map((chapter) => chapter.path));
    return (manifest.scenes ?? [])
      .filter((scene) => this.assets.hasAsset(id, scene.image))
      .map((scene) => ({
        imagePath: scene.image,
        chapterPath: scene.chapter !== undefined && chapterPaths.has(scene.chapter) ? scene.chapter : undefined,
        caption: scene.caption,
      }));
  }

  private register(novel: Novel): void {
    const library = this.library.read();
    const novels = [novel, ...library.novels.filter((existing) => existing.id !== novel.id)];
    this.library.write({ schemaVersion: LIBRARY_SCHEMA_VERSION, novels, lastReadNovelId: library.lastReadNovelId });
  }

  private parseManifest(raw: string): NovelManifest | null {
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return null;
    }
    if (!this.utility.isRecord(parsed)) return null;
    if (parsed.schemaVersion !== SUPPORTED_MANIFEST_VERSION) return null;
    if (typeof parsed.id !== 'string' || parsed.id.trim().length === 0) return null;
    if (typeof parsed.title !== 'string' || parsed.title.trim().length === 0) return null;
    const chapters = this.parseChapters(parsed.chapters);
    if (chapters === null) return null;
    return {
      schemaVersion: SUPPORTED_MANIFEST_VERSION,
      id: parsed.id,
      title: parsed.title,
      author: typeof parsed.author === 'string' ? parsed.author : undefined,
      description: typeof parsed.description === 'string' ? parsed.description : undefined,
      cover: typeof parsed.cover === 'string' ? parsed.cover : undefined,
      tags: this.parseStringArray(parsed.tags),
      characters: this.parseCharacters(parsed.characters),
      scenes: this.parseScenes(parsed.scenes),
      chapters,
    };
  }

  private parseChapters(value: unknown): NovelManifest['chapters'] | null {
    if (!Array.isArray(value)) return null;
    const chapters: NovelManifest['chapters'] = [];
    for (const item of value) {
      if (!this.utility.isRecord(item)) continue;
      if (typeof item.file !== 'string' || item.file.length === 0) continue;
      const title = typeof item.title === 'string' && item.title.length > 0 ? item.title : `Chapter ${chapters.length + 1}`;
      chapters.push({ title, file: item.file });
    }
    return chapters;
  }

  private parseCharacters(value: unknown): NovelManifest['characters'] {
    if (!Array.isArray(value)) return undefined;
    const characters: NonNullable<NovelManifest['characters']> = [];
    for (const item of value) {
      if (!this.utility.isRecord(item) || typeof item.name !== 'string') continue;
      characters.push({
        name: item.name,
        image: typeof item.image === 'string' ? item.image : undefined,
        description: typeof item.description === 'string' ? item.description : undefined,
        variants: this.parseCharacterVariants(item.variants),
      });
    }
    return characters;
  }

  private parseCharacterVariants(value: unknown): ManifestCharacterVariant[] | undefined {
    if (!Array.isArray(value)) return undefined;
    const variants: ManifestCharacterVariant[] = [];
    for (const item of value) {
      if (!this.utility.isRecord(item) || typeof item.image !== 'string' || item.image.length === 0) continue;
      variants.push({ image: item.image, label: typeof item.label === 'string' ? item.label : undefined });
    }
    return variants;
  }

  private parseScenes(value: unknown): NovelManifest['scenes'] {
    if (!Array.isArray(value)) return undefined;
    const scenes: NonNullable<NovelManifest['scenes']> = [];
    for (const item of value) {
      if (!this.utility.isRecord(item) || typeof item.image !== 'string' || item.image.length === 0) continue;
      scenes.push({
        image: item.image,
        chapter: typeof item.chapter === 'string' ? item.chapter : undefined,
        caption: typeof item.caption === 'string' ? item.caption : undefined,
      });
    }
    return scenes;
  }

  private parseStringArray(value: unknown): string[] | undefined {
    if (!Array.isArray(value)) return undefined;
    return value.filter((item): item is string => typeof item === 'string');
  }
}

export const importService = new ImportService();
