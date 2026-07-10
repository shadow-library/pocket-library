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

export type ReaderSettings = {
  fontScale: number;
  theme: ReadingTheme;
  fontFamily: ReaderFontFamily;
  brightness: number;
};

/**
 * Declaring the constants
 */

export const MIN_FONT_SCALE = 0.8;
export const MAX_FONT_SCALE = 1.8;
export const FONT_SCALE_STEP = 0.1;

// brightness -1 means "follow the system"; 0..1 overrides the screen brightness while reading.
export const DEFAULT_READER_SETTINGS: ReaderSettings = {
  fontScale: 1,
  theme: 'light',
  fontFamily: 'roboto',
  brightness: -1,
};
