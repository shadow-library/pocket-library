/**
 * Importing npm packages
 */
import type { ViewStyle } from 'react-native';

/**
 * Importing user defined packages
 */

/**
 * Defining types
 */

export type Elevation = Pick<ViewStyle, 'shadowColor' | 'shadowOffset' | 'shadowOpacity' | 'shadowRadius' | 'elevation'>;

export type Shadows = typeof shadows;

/**
 * Declaring the constants
 */

// RN equivalents of the design's Shadow UI elevation tokens (e1/e2/e3).
export const shadows = {
  e1: { shadowColor: '#09090B', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3, elevation: 1 },
  e2: { shadowColor: '#09090B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 8, elevation: 3 },
  e3: { shadowColor: '#09090B', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.16, shadowRadius: 24, elevation: 8 },
} as const satisfies Record<string, Elevation>;
