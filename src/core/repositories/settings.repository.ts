/**
 * Importing npm packages
 */

/**
 * Importing user defined packages
 */
import { fileSystemService } from '@/core/infrastructure/file-system.service';
import { readerFontStacks, readingColors } from '@/core/theme';
import { DEFAULT_READER_SETTINGS, MAX_FONT_SCALE, MIN_FONT_SCALE, type ReaderSettings } from '@/core/types/reader-settings.types';

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
    return this.sanitize({ ...DEFAULT_READER_SETTINGS, ...stored });
  }

  // Legacy or corrupt setting files can carry enum values no longer in the schema (e.g. a font or
  // theme from an older build). Left unchecked they crash the reader's `readerFontStacks[fontFamily]`
  // and `readingColors[theme]` lookups, so every field falls back to its default when out of range.
  private sanitize(settings: ReaderSettings): ReaderSettings {
    const fontFamily = settings.fontFamily in readerFontStacks ? settings.fontFamily : DEFAULT_READER_SETTINGS.fontFamily;
    const theme = settings.theme in readingColors ? settings.theme : DEFAULT_READER_SETTINGS.theme;
    const fontScale = Number.isFinite(settings.fontScale) ? Math.min(MAX_FONT_SCALE, Math.max(MIN_FONT_SCALE, settings.fontScale)) : DEFAULT_READER_SETTINGS.fontScale;
    const brightness = Number.isFinite(settings.brightness) && settings.brightness >= -1 && settings.brightness <= 1 ? settings.brightness : DEFAULT_READER_SETTINGS.brightness;
    return { fontFamily, theme, fontScale, brightness };
  }

  write(settings: ReaderSettings): void {
    this.files.writeJsonFile(SETTINGS_FILE, settings);
  }
}

export const settingsRepository = new SettingsRepository();
