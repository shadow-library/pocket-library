/**
 * Importing npm packages
 */
import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

/**
 * Importing user defined packages
 */
import type { AppTheme } from '@/core/theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * Defining types
 */

type NovelCoverProps = {
  uri: string | null;
  label: string;
  width: number;
  height: number;
  radius?: number;
};

/**
 * Declaring the constants
 */

export function NovelCover({ uri, label, width, height, radius }: NovelCoverProps) {
  const theme = useTheme();
  const styles = createStyles(theme, width, height, radius ?? theme.radii.md);

  if (uri === null) {
    return (
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>{label.trim().charAt(0).toUpperCase() || '?'}</Text>
      </View>
    );
  }

  return <Image source={{ uri }} style={styles.image} contentFit="cover" transition={150} />;
}

function createStyles(theme: AppTheme, width: number, height: number, radius: number) {
  return StyleSheet.create({
    image: {
      width,
      height,
      borderRadius: radius,
      backgroundColor: theme.colors.surface,
    },
    placeholder: {
      width,
      height,
      borderRadius: radius,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
    },
    placeholderText: {
      color: theme.colors.textMuted,
      fontSize: Math.round(Math.min(width, height) * 0.4),
      fontWeight: '700',
    },
  });
}
