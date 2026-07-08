/**
 * Importing npm packages
 */

/**
 * Importing user defined packages
 */

/**
 * Defining types
 */

export type ColorScheme = 'light' | 'dark';

export type ChromePalette = {
  background: string;
  surface: string;
  surfaceElevated: string;
  border: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentText: string;
  danger: string;
  overlay: string;
};

export type ReadingPalette = {
  background: string;
  text: string;
  textSecondary: string;
  border: string;
  link: string;
};

export type ReadingTheme = keyof typeof readingColors;

/**
 * Declaring the constants
 */

// App chrome (library, novel detail, reader controls) follows the system light/dark scheme.
export const chromeColors: Record<ColorScheme, ChromePalette> = {
  light: {
    background: '#FFFFFF',
    surface: '#F4F4F6',
    surfaceElevated: '#FFFFFF',
    border: '#E4E4E9',
    text: '#16181D',
    textSecondary: '#5C6067',
    textMuted: '#8A8F98',
    accent: '#4C6FFF',
    accentText: '#FFFFFF',
    danger: '#D64545',
    overlay: 'rgba(16,18,23,0.45)',
  },
  dark: {
    background: '#0E0F12',
    surface: '#17191F',
    surfaceElevated: '#1E2027',
    border: '#2A2D36',
    text: '#ECEDEF',
    textSecondary: '#A0A4AD',
    textMuted: '#6D7178',
    accent: '#7D93FF',
    accentText: '#0E0F12',
    danger: '#FF6B6B',
    overlay: 'rgba(0,0,0,0.6)',
  },
};

// The reading surface is chosen by the reader independently of chrome, so long sessions can pick the
// most comfortable page tone regardless of the OS theme.
export const readingColors = {
  light: {
    background: '#FFFFFF',
    text: '#1A1A1A',
    textSecondary: '#565656',
    border: '#E6E6E6',
    link: '#2E6FF2',
  },
  dark: {
    background: '#0F1114',
    text: '#D8D8D2',
    textSecondary: '#9A9A94',
    border: '#23262B',
    link: '#7FA6FF',
  },
  sepia: {
    background: '#F5ECD9',
    text: '#4A3F30',
    textSecondary: '#6E5E48',
    border: '#E3D7BE',
    link: '#8C5A2B',
  },
} as const satisfies Record<string, ReadingPalette>;
