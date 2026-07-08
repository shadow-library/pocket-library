/**
 * Importing npm packages
 */
import { Platform, type TextStyle } from 'react-native';

/**
 * Importing user defined packages
 */

/**
 * Defining types
 */

type TypeRole = Pick<TextStyle, 'fontFamily' | 'fontSize' | 'lineHeight' | 'fontWeight' | 'letterSpacing'>;

type TextType = 'display' | 'title' | 'heading' | 'body' | 'bodyStrong' | 'label' | 'caption' | 'overline';

export type Fonts = { sans: string | undefined; serif: string; mono: string };

export type Typography = typeof type;

/**
 * Declaring the constants
 */

// System font stacks keep the bundle light while giving prose a proper serif on both platforms.
export const fonts: Fonts = Platform.select({
  ios: { sans: undefined, serif: 'Georgia', mono: 'Menlo' },
  default: { sans: undefined, serif: 'serif', mono: 'monospace' },
}) as Fonts;

export const type: Record<TextType, TypeRole> = {
  display: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  title: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  heading: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600',
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
  },
  bodyStrong: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
  },
  label: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
  },
  overline: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600',
    letterSpacing: 1.2,
  },
};
