/**
 * Importing npm packages
 */
import { StyleSheet, Text, View } from 'react-native';

/**
 * Importing user defined packages
 */
import type { AppTheme } from '@/core/theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * Defining types
 */

type VariantCountBadgeProps = {
  count: number;
};

/**
 * Declaring the constants
 */

// A small "+N" pill overlaid on a character avatar to signal it has that many extra outfit/scene
// images. Renders nothing when there are no extras.
export function VariantCountBadge({ count }: VariantCountBadgeProps) {
  const theme = useTheme();

  if (count <= 0) return null;

  const styles = createStyles(theme);

  return (
    <View style={styles.badge} pointerEvents="none">
      <Text style={styles.label}>{`+${count}`}</Text>
    </View>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    badge: {
      position: 'absolute',
      top: 0,
      right: 0,
      minWidth: 22,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: theme.radii.pill,
      backgroundColor: theme.colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: theme.colors.background,
    },
    label: {
      fontFamily: 'Inter_700Bold',
      fontSize: 11,
      color: theme.colors.accentText,
    },
  });
}
