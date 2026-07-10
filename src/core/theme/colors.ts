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

// App-chrome palette. Values follow the Shadow UI token scale (indigo accent, neutral surfaces). The
// original key set is preserved so existing components keep working; new semantic keys are additive.
export type ChromePalette = {
  background: string;
  surface: string;
  surfaceElevated: string;
  surfaceWell: string;
  border: string;
  borderStrong: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  textTertiary: string;
  accent: string;
  accentText: string;
  accentSoft: string;
  danger: string;
  dangerBg: string;
  dangerBorder: string;
  success: string;
  warning: string;
  overlay: string;
};

export type ReadingPalette = {
  background: string;
  text: string;
  heading: string;
  textSecondary: string;
  border: string;
  link: string;
  progressFill: string;
  progressTrack: string;
  pct: string;
  sheet: string;
  sheetWell: string;
  accent: string;
  accentSoft: string;
};

export type ReadingTheme = keyof typeof readingColors;

/**
 * Declaring the constants
 */

// App chrome follows the system light/dark scheme. Light mirrors the design's Shadow UI tokens; dark
// is derived from the same neutral/indigo scale so chrome still adapts on dark devices.
export const chromeColors: Record<ColorScheme, ChromePalette> = {
  light: {
    background: '#F5F6F8',
    surface: '#F0F0F3',
    surfaceElevated: '#FFFFFF',
    surfaceWell: '#F0F0F3',
    border: '#E5E7EB',
    borderStrong: '#C8CDD4',
    text: '#111214',
    textSecondary: '#525866',
    textMuted: '#707784',
    textTertiary: '#707784',
    accent: '#4F46E5',
    accentText: '#FFFFFF',
    accentSoft: '#F0F1FE',
    danger: '#DC2626',
    dangerBg: '#FEF2F2',
    dangerBorder: '#FECACA',
    success: '#16A34A',
    warning: '#D97706',
    overlay: 'rgba(9,9,11,0.45)',
  },
  dark: {
    background: '#09090B',
    surface: '#17181B',
    surfaceElevated: '#202226',
    surfaceWell: '#17181B',
    border: '#2A2C31',
    borderStrong: '#3A3D44',
    text: '#ECEDEF',
    textSecondary: '#9CA3AF',
    textMuted: '#707784',
    textTertiary: '#707784',
    accent: '#8283F0',
    accentText: '#09090B',
    accentSoft: '#1E1B4E',
    danger: '#F87171',
    dangerBg: '#2A1414',
    dangerBorder: '#7F1D1D',
    success: '#4ADE80',
    warning: '#FBBF24',
    overlay: 'rgba(0,0,0,0.6)',
  },
};

// The reading surface is chosen by the reader independently of chrome. Values are taken directly from
// the design's White / Sepia / Dark reader mockups.
export const readingColors = {
  light: {
    background: '#FFFFFF',
    text: '#1A1A1A',
    heading: '#1A1A1A',
    textSecondary: '#565656',
    border: '#ECECEC',
    link: '#4F46E5',
    progressFill: '#4F46E5',
    progressTrack: '#ECECEC',
    pct: '#8A8579',
    sheet: '#FFFFFF',
    sheetWell: '#F0F0F3',
    accent: '#4F46E5',
    accentSoft: '#F0F1FE',
  },
  sepia: {
    background: '#F4EAD3',
    text: '#43381F',
    heading: '#43381F',
    textSecondary: '#6E5E48',
    border: '#E2D3AC',
    link: '#7A1524',
    progressFill: '#7A1524',
    progressTrack: '#E2D3AC',
    pct: '#9A8A63',
    sheet: '#FBFAF7',
    sheetWell: '#F0F0F3',
    accent: '#4F46E5',
    accentSoft: '#F0F1FE',
  },
  dark: {
    background: '#131316',
    text: '#D9D4CB',
    heading: '#ECE7DD',
    textSecondary: '#9A9A94',
    border: '#26262B',
    link: '#C8A24A',
    progressFill: '#C8A24A',
    progressTrack: 'rgba(255,255,255,0.12)',
    pct: 'rgba(217,212,203,0.5)',
    sheet: '#1B1B1F',
    sheetWell: '#26262B',
    accent: '#8283F0',
    accentSoft: '#232345',
  },
} as const satisfies Record<string, ReadingPalette>;
