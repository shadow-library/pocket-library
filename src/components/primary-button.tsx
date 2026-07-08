/**
 * Importing npm packages
 */
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

/**
 * Importing user defined packages
 */
import type { AppTheme } from '@/core/theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * Defining types
 */

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'ghost';
};

/**
 * Declaring the constants
 */

export function PrimaryButton({ label, onPress, loading = false, disabled = false, variant = 'primary' }: PrimaryButtonProps) {
  const theme = useTheme();
  const styles = createStyles(theme);
  const isGhost = variant === 'ghost';
  const inactive = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive, busy: loading }}
      onPress={onPress}
      disabled={inactive}
      style={({ pressed }) => [styles.base, isGhost ? styles.ghost : styles.primary, pressed && !inactive && styles.pressed, inactive && styles.inactive]}>
      {loading ? (
        <ActivityIndicator color={isGhost ? theme.colors.text : theme.colors.accentText} />
      ) : (
        <Text style={[styles.label, isGhost ? styles.ghostLabel : styles.primaryLabel]}>{label}</Text>
      )}
    </Pressable>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    base: {
      minHeight: 48,
      paddingHorizontal: theme.spacing.xl,
      borderRadius: theme.radii.md,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    },
    primary: {
      backgroundColor: theme.colors.accent,
    },
    ghost: {
      backgroundColor: 'transparent',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
    },
    pressed: {
      opacity: 0.85,
    },
    inactive: {
      opacity: 0.5,
    },
    label: {
      ...theme.type.bodyStrong,
    },
    primaryLabel: {
      color: theme.colors.accentText,
    },
    ghostLabel: {
      color: theme.colors.text,
    },
  });
}
