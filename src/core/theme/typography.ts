/**
 * Importing npm packages
 */
import type { TextStyle } from 'react-native';

/**
 * Importing user defined packages
 */

/**
 * Defining types
 */

type TypeRole = Pick<TextStyle, 'fontFamily' | 'fontSize' | 'lineHeight' | 'fontWeight' | 'letterSpacing'>;

type TextType = 'display' | 'title' | 'heading' | 'body' | 'bodyStrong' | 'label' | 'caption' | 'overline';

export type Fonts = { sans: string; serif: string; mono: string };

export type Typography = typeof type;

// The reader body typeface is user-selectable; chapter titles + drop caps always use the Lora serif.
export type ReaderFontFamily = 'roboto' | 'inter';

export type ReaderFontStack = { regular: string; bold: string };

/**
 * Declaring the constants
 */

const INTER_400 = 'Inter_400Regular';
const INTER_500 = 'Inter_500Medium';
const INTER_600 = 'Inter_600SemiBold';
const INTER_700 = 'Inter_700Bold';

// Chrome uses Inter across the app; Lora is the reading serif.
export const fonts: Fonts = { sans: INTER_400, serif: 'Lora_600SemiBold', mono: 'monospace' };

// Reading body font stacks for the typeface toggle. Chapter titles + drop caps use Lora regardless.
export const readerFontStacks: Record<ReaderFontFamily, ReaderFontStack> = {
  roboto: { regular: 'Roboto_400Regular', bold: 'Roboto_700Bold' },
  inter: { regular: INTER_400, bold: INTER_700 },
};

export const readingFonts = {
  serifTitle: 'Lora_600SemiBold',
  serifBody: 'Lora_400Regular',
} as const;

// Reader body metrics from the design (17pt base, 1.72 line-height).
export const readingType = {
  titleSize: 26,
  titleLine: 32,
  bodySize: 17,
  bodyLineRatio: 1.72,
} as const;

export const type: Record<TextType, TypeRole> = {
  display: {
    fontFamily: INTER_700,
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  title: {
    fontFamily: INTER_700,
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  heading: {
    fontFamily: INTER_600,
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600',
  },
  body: {
    fontFamily: INTER_400,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
  },
  bodyStrong: {
    fontFamily: INTER_600,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
  },
  label: {
    fontFamily: INTER_500,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  caption: {
    fontFamily: INTER_400,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
  },
  overline: {
    fontFamily: INTER_600,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600',
    letterSpacing: 1.2,
  },
};
