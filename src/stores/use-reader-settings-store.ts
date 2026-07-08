/**
 * Importing npm packages
 */
import { create } from 'zustand';

/**
 * Importing user defined packages
 */
import type { ReadingTheme } from '@/core/theme';
import { settingsRepository } from '@/core/repositories/settings.repository';
import { DEFAULT_READER_SETTINGS, FONT_SCALE_STEP, MAX_FONT_SCALE, MIN_FONT_SCALE, type ReaderSettings } from '@/core/types/reader-settings.types';

/**
 * Defining types
 */

type ReaderSettingsState = ReaderSettings & { hydrated: boolean };

type ReaderSettingsActions = {
  hydrate: () => void;
  setTheme: (theme: ReadingTheme) => void;
  increaseFont: () => void;
  decreaseFont: () => void;
};

/**
 * Declaring the constants
 */

function clampScale(scale: number): number {
  return Math.min(MAX_FONT_SCALE, Math.max(MIN_FONT_SCALE, Math.round(scale * 10) / 10));
}

// Reader preferences are persisted immediately so the reading surface is restored on next launch.
export const useReaderSettingsStore = create<ReaderSettingsState & ReaderSettingsActions>((set, get) => ({
  ...DEFAULT_READER_SETTINGS,
  hydrated: false,
  hydrate: () => set({ ...settingsRepository.read(), hydrated: true }),
  setTheme: (theme) => {
    settingsRepository.write({ fontScale: get().fontScale, theme });
    set({ theme });
  },
  increaseFont: () => {
    const fontScale = clampScale(get().fontScale + FONT_SCALE_STEP);
    settingsRepository.write({ fontScale, theme: get().theme });
    set({ fontScale });
  },
  decreaseFont: () => {
    const fontScale = clampScale(get().fontScale - FONT_SCALE_STEP);
    settingsRepository.write({ fontScale, theme: get().theme });
    set({ fontScale });
  },
}));
