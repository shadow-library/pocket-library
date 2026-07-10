/**
 * Importing npm packages
 */

/**
 * Importing user defined packages
 */
import { chromeColors, readingColors, type ChromePalette, type ColorScheme, type ReadingPalette, type ReadingTheme } from './colors';
import { radii } from './radii';
import { shadows, type Shadows } from './shadows';
import { spacing } from './spacing';
import { fonts, readerFontStacks, readingFonts, readingType, type, type Fonts, type ReaderFontFamily, type ReaderFontStack, type Typography } from './typography';

/**
 * Defining types
 */

// The token bundle handed to `createStyles(theme)` for app-chrome surfaces.
export type AppTheme = {
  scheme: ColorScheme;
  colors: ChromePalette;
  spacing: typeof spacing;
  radii: typeof radii;
  shadows: Shadows;
  fonts: Fonts;
  type: Typography;
};

/**
 * Declaring the constants
 */

export const tokens = { spacing, radii, shadows, fonts, type } as const;

export function buildAppTheme(scheme: ColorScheme): AppTheme {
  return { scheme, colors: chromeColors[scheme], spacing, radii, shadows, fonts, type };
}

export { chromeColors, readingColors, radii, shadows, spacing, fonts, readerFontStacks, readingFonts, readingType, type };
export type { ChromePalette, ColorScheme, ReadingPalette, ReadingTheme, Fonts, ReaderFontFamily, ReaderFontStack, Shadows, Typography };
