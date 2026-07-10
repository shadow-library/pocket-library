/**
 * Importing npm packages
 */

/**
 * Importing user defined packages
 */
import { fileSystemService } from '@/core/infrastructure/file-system.service';
import { DEFAULT_APP_SETTINGS, type AppSettings } from '@/core/types/app-settings.types';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

const APP_SETTINGS_FILE = 'app-settings.json';

// Persists app-level preferences (default reader prefs, library sort, keep-awake) across launches.
class AppSettingsRepository {
  constructor(private readonly files = fileSystemService) {}

  read(): AppSettings {
    const stored = this.files.readJsonFile<Partial<AppSettings>>(APP_SETTINGS_FILE);
    if (stored === null) return { ...DEFAULT_APP_SETTINGS };
    return { ...DEFAULT_APP_SETTINGS, ...stored };
  }

  write(settings: AppSettings): void {
    this.files.writeJsonFile(APP_SETTINGS_FILE, settings);
  }
}

export const appSettingsRepository = new AppSettingsRepository();
