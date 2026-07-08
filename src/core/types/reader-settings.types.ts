/**
 * Importing npm packages
 */

/**
 * Importing user defined packages
 */
import type { ReadingTheme } from '@/core/theme';

/**
 * Defining types
 */

export type ReaderSettings = {
  fontScale: number;
  theme: ReadingTheme;
};

/**
 * Declaring the constants
 */

export const MIN_FONT_SCALE = 0.8;
export const MAX_FONT_SCALE = 1.8;
export const FONT_SCALE_STEP = 0.1;

export const DEFAULT_READER_SETTINGS: ReaderSettings = {
  fontScale: 1,
  theme: 'light',
};
