/**
 * Importing npm packages
 */
import { useColorScheme } from 'react-native';

/**
 * Importing user defined packages
 */
import { buildAppTheme, type AppTheme } from '@/core/theme';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

export function useTheme(): AppTheme {
  const scheme = useColorScheme();
  return buildAppTheme(scheme === 'dark' ? 'dark' : 'light');
}
