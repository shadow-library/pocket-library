/**
 * Importing npm packages
 */

/**
 * Importing user defined packages
 */
import { fileSystemService } from '@/core/infrastructure/file-system.service';
import { LIBRARY_SCHEMA_VERSION, type LibraryDoc } from '@/core/types/novel.types';

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
  constructor(private readonly files = fileSystemService) {}

  read(): LibraryDoc {
    const stored = this.files.readJsonFile<LibraryDoc>(LIBRARY_FILE);
    if (stored === null) return { ...EMPTY_LIBRARY };
    return { schemaVersion: stored.schemaVersion, novels: stored.novels ?? [], lastReadNovelId: stored.lastReadNovelId ?? null };
  }

  write(doc: LibraryDoc): void {
    this.files.writeJsonFile(LIBRARY_FILE, doc);
  }
}

export const libraryRepository = new LibraryRepository();
