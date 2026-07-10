/**
 * Importing npm packages
 */
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Importing user defined packages
 */
import { Icon, type IconName } from '@/components/icon';
import type { AppTheme } from '@/core/theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * Defining types
 */

type ScreenHeaderProps = {
  title: string;
  back?: boolean;
  action?: { icon: IconName; onPress: () => void; label: string };
};

/**
 * Declaring the constants
 */

// Shared top bar: safe-area padded, optional back chevron, centered-left title, optional right action.
export function ScreenHeader({ title, back = false, action }: ScreenHeaderProps) {
  const theme = useTheme();
  const router = useRouter();
  const styles = createStyles(theme, useSafeAreaInsets().top);

  return (
    <View style={styles.header}>
      {back && (
        <Pressable accessibilityRole="button" accessibilityLabel="Back" hitSlop={8} onPress={() => router.back()} style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}>
          <Icon name="chevron-left" size={24} color={theme.colors.text} />
        </Pressable>
      )}
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      {action && (
        <Pressable accessibilityRole="button" accessibilityLabel={action.label} hitSlop={8} onPress={action.onPress} style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}>
          <Icon name={action.icon} size={22} color={theme.colors.textSecondary} />
        </Pressable>
      )}
    </View>
  );
}

function createStyles(theme: AppTheme, topInset: number) {
  return StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      paddingTop: topInset + theme.spacing.sm,
      paddingBottom: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      backgroundColor: theme.colors.background,
    },
    iconButton: {
      minWidth: 40,
      minHeight: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    pressed: {
      opacity: 0.5,
    },
    title: {
      ...theme.type.title,
      flex: 1,
      color: theme.colors.text,
    },
  });
}
