/**
 * Importing npm packages
 */
import { create } from 'zustand';

/**
 * Importing user defined packages
 */
import { appSettingsRepository } from '@/core/repositories/app-settings.repository';
import { DEFAULT_APP_SETTINGS, type AppSettings } from '@/core/types/app-settings.types';

/**
 * Defining types
 */

type AppSettingsState = AppSettings & { hydrated: boolean };

type AppSettingsActions = {
  hydrate: () => void;
  update: (patch: Partial<AppSettings>) => void;
};

/**
 * Declaring the constants
 */

// App-wide preferences persisted to disk. Reader initial state seeds from these defaults.
export const useAppSettingsStore = create<AppSettingsState & AppSettingsActions>((set, get) => ({
  ...DEFAULT_APP_SETTINGS,
  hydrated: false,
  hydrate: () => set({ ...appSettingsRepository.read(), hydrated: true }),
  update: (patch) => {
    const { hydrated: _hydrated, ...current } = get();
    const next = { ...current, ...patch };
    appSettingsRepository.write(next);
    set(patch);
  },
}));
