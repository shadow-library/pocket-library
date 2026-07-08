/**
 * Importing npm packages
 */
import { create } from 'zustand';

/**
 * Importing user defined packages
 */
import { content } from '@/core/content';
import { importService, type ImportResult } from '@/core/services/import.service';
import { libraryService } from '@/core/services/library.service';
import { readingProgressService } from '@/core/services/reading-progress.service';
import type { Novel, Progress } from '@/core/types/novel.types';

/**
 * Defining types
 */

type LibraryStoreState = {
  novels: Novel[];
  lastReadNovelId: string | null;
  hydrated: boolean;
  importing: boolean;
  importError: string | null;
};

type LibraryStoreActions = {
  hydrate: () => void;
  refresh: () => void;
  importNovel: () => Promise<ImportResult>;
  removeNovel: (id: string) => void;
  saveProgress: (novelId: string, progress: Progress) => void;
  clearImportError: () => void;
};

/**
 * Declaring the constants
 */

function readSnapshot(): Pick<LibraryStoreState, 'novels' | 'lastReadNovelId'> {
  return { novels: libraryService.list(), lastReadNovelId: libraryService.lastReadNovelId() };
}

// App-wide view of the imported library. Async filesystem work stays in the import/library services;
// the store orchestrates those calls and mirrors the persisted index into React state.
export const useLibraryStore = create<LibraryStoreState & LibraryStoreActions>((set) => ({
  novels: [],
  lastReadNovelId: null,
  hydrated: false,
  importing: false,
  importError: null,
  hydrate: () => set({ ...readSnapshot(), hydrated: true }),
  refresh: () => set(readSnapshot()),
  importNovel: async () => {
    set({ importing: true, importError: null });
    try {
      const result = await importService.importFromPicker();
      if (result.status === 'imported') set({ ...readSnapshot(), importing: false });
      else if (result.status === 'error') set({ importing: false, importError: result.message });
      else set({ importing: false });
      return result;
    } catch {
      set({ importing: false, importError: content.import.errors.failed });
      return { status: 'error', message: content.import.errors.failed };
    }
  },
  removeNovel: (id) => {
    libraryService.remove(id);
    set(readSnapshot());
  },
  saveProgress: (novelId, progress) => {
    readingProgressService.save(novelId, progress);
    set(readSnapshot());
  },
  clearImportError: () => set({ importError: null }),
}));
