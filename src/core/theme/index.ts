/**
 * Importing npm packages
 */

/**
 * Importing user defined packages
 */
import { chromeColors, readingColors, type ChromePalette, type ColorScheme, type ReadingPalette, type ReadingTheme } from './colors';
import { radii } from './radii';
import { spacing } from './spacing';
import { fonts, type, type Fonts, type Typography } from './typography';

/**
 * Defining types
 */

// The token bundle handed to `createStyles(theme)` for app-chrome surfaces.
export type AppTheme = {
  scheme: ColorScheme;
  colors: ChromePalette;
  spacing: typeof spacing;
  radii: typeof radii;
  fonts: Fonts;
  type: Typography;
};

/**
 * Declaring the constants
 */

export const tokens = { spacing, radii, fonts, type } as const;

export function buildAppTheme(scheme: ColorScheme): AppTheme {
  return { scheme, colors: chromeColors[scheme], spacing, radii, fonts, type };
}

export { chromeColors, readingColors, radii, spacing, fonts, type };
export type { ChromePalette, ColorScheme, ReadingPalette, ReadingTheme, Fonts, Typography };
