/**
 * Importing npm packages
 */
import { create } from 'zustand';

/**
 * Importing user defined packages
 */
import type { ReaderFontFamily, ReadingTheme } from '@/core/theme';
import { settingsRepository } from '@/core/repositories/settings.repository';
import { DEFAULT_READER_SETTINGS, MAX_FONT_SCALE, MIN_FONT_SCALE, type ReaderSettings } from '@/core/types/reader-settings.types';

/**
 * Defining types
 */

type ReaderSettingsState = ReaderSettings & { hydrated: boolean };

type ReaderSettingsActions = {
  hydrate: () => void;
  setTheme: (theme: ReadingTheme) => void;
  setFontFamily: (fontFamily: ReaderFontFamily) => void;
  setBrightness: (brightness: number) => void;
  setFontScale: (fontScale: number) => void;
};

/**
 * Declaring the constants
 */

function clampScale(scale: number): number {
  return Math.min(MAX_FONT_SCALE, Math.max(MIN_FONT_SCALE, Math.round(scale * 10) / 10));
}

// Reader preferences are persisted immediately so the reading surface is restored on next launch.
export const useReaderSettingsStore = create<ReaderSettingsState & ReaderSettingsActions>((set, get) => {
  const persist = (patch: Partial<ReaderSettings>) => {
    const { hydrated: _hydrated, ...current } = get();
    const next = { ...current, ...patch };
    settingsRepository.write(next);
    set(patch);
  };

  return {
    ...DEFAULT_READER_SETTINGS,
    hydrated: false,
    hydrate: () => set({ ...settingsRepository.read(), hydrated: true }),
    setTheme: (theme) => persist({ theme }),
    setFontFamily: (fontFamily) => persist({ fontFamily }),
    setBrightness: (brightness) => persist({ brightness }),
    setFontScale: (fontScale) => persist({ fontScale: clampScale(fontScale) }),
  };
});
