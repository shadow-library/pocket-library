/**
 * Importing npm packages
 */

/**
 * Importing user defined packages
 */
import type { ReaderFontFamily, ReadingTheme } from '@/core/theme';

/**
 * Defining types
 */

// 'system' resolves the reader theme against the OS light/dark scheme; otherwise a fixed reading theme.
export type DefaultThemeChoice = 'system' | ReadingTheme;

export type LibrarySort = 'recent' | 'title';

export type AppSettings = {
  defaultTypeface: ReaderFontFamily;
  defaultFontScale: number;
  defaultTheme: DefaultThemeChoice;
  librarySort: LibrarySort;
  keepAwake: boolean;
};

/**
 * Declaring the constants
 */

export const DEFAULT_APP_SETTINGS: AppSettings = {
  defaultTypeface: 'roboto',
  defaultFontScale: 1,
  defaultTheme: 'system',
  librarySort: 'recent',
  keepAwake: false,
};
