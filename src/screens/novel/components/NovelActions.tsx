/**
 * Importing npm packages
 */
import { Pressable, StyleSheet, Text } from 'react-native';

/**
 * Importing user defined packages
 */
import { PrimaryButton } from '@/components/primary-button';
import { content } from '@/core/content';
import type { AppTheme } from '@/core/theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * Defining types
 */

type NovelActionsProps = {
  startLabel: string;
  onStart: () => void;
  onRemove: () => void;
};

/**
 * Declaring the constants
 */

export function NovelActions({ startLabel, onStart, onRemove }: NovelActionsProps) {
  const theme = useTheme();
  const styles = createStyles(theme);

  return (
    <>
      <PrimaryButton label={startLabel} onPress={onStart} />
      <Pressable accessibilityRole="button" onPress={onRemove} style={({ pressed }) => [styles.remove, pressed && styles.pressed]}>
        <Text style={styles.removeLabel}>{content.novel.remove}</Text>
      </Pressable>
    </>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    remove: {
      minHeight: 48,
      alignItems: 'center',
      justifyContent: 'center',
    },
    pressed: {
      opacity: 0.6,
    },
    removeLabel: {
      ...theme.type.label,
      color: theme.colors.danger,
    },
  });
}
