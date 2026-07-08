/**
 * Importing npm packages
 */

/**
 * Importing user defined packages
 */
import { fileSystemService } from '@/core/infrastructure/file-system.service';
import { DEFAULT_READER_SETTINGS, type ReaderSettings } from '@/core/types/reader-settings.types';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

const SETTINGS_FILE = 'settings.json';

// Persists reader preferences (font scale + reading theme) so the reading surface is restored on the
// next launch.
class SettingsRepository {
  constructor(private readonly files = fileSystemService) {}

  read(): ReaderSettings {
    const stored = this.files.readJsonFile<Partial<ReaderSettings>>(SETTINGS_FILE);
    if (stored === null) return { ...DEFAULT_READER_SETTINGS };
    return { ...DEFAULT_READER_SETTINGS, ...stored };
  }

  write(settings: ReaderSettings): void {
    this.files.writeJsonFile(SETTINGS_FILE, settings);
  }
}

export const settingsRepository = new SettingsRepository();
