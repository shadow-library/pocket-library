/**
 * Importing npm packages
 */

/**
 * Importing user defined packages
 */
import type { ArchiveEntries } from '@/core/infrastructure/archive.service';
import { fileSystemService } from '@/core/infrastructure/file-system.service';
import { utilityService } from '@/core/infrastructure/utility.service';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

const NOVELS_DIR = 'novels';

// Owns the on-disk layout of a novel's extracted assets under `novels/<id>/…`. Every path handed to
// the UI is resolved here so screens never construct filesystem uris themselves.
class NovelAssetRepository {
  constructor(private readonly files = fileSystemService, private readonly utility = utilityService) {}

  /** Writes every archive entry into the novel's private directory, replacing any prior import. */
  extract(id: string, entries: ArchiveEntries): void {
    this.remove(id);
    for (const [name, bytes] of Object.entries(entries)) {
      if (name.endsWith('/') || bytes.length === 0) continue;
      this.files.writeBytesFile(this.utility.joinPath(NOVELS_DIR, id, name), bytes);
    }
  }

  hasAsset(id: string, relativePath: string): boolean {
    return this.files.fileExists(this.utility.joinPath(NOVELS_DIR, id, relativePath));
  }

  assetUri(id: string, relativePath: string): string {
    return this.files.fileUri(this.utility.joinPath(NOVELS_DIR, id, relativePath));
  }

  readChapter(id: string, relativePath: string): string {
    return this.files.readTextFile(this.utility.joinPath(NOVELS_DIR, id, relativePath));
  }

  remove(id: string): void {
    this.files.deleteDirectory(this.utility.joinPath(NOVELS_DIR, id));
  }
}

export const novelAssetRepository = new NovelAssetRepository();
