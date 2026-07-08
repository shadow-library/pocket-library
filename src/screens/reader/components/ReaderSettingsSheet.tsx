/**
 * Importing npm packages
 */
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

/**
 * Importing user defined packages
 */
import { content } from '@/core/content';
import type { AppTheme, ReadingTheme } from '@/core/theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * Defining types
 */

type ReaderSettingsSheetProps = {
  visible: boolean;
  fontScale: number;
  theme: ReadingTheme;
  onClose: () => void;
  onIncrease: () => void;
  onDecrease: () => void;
  onSelectTheme: (theme: ReadingTheme) => void;
};

/**
 * Declaring the constants
 */

const THEME_OPTIONS: { key: ReadingTheme; label: string }[] = [
  { key: 'light', label: content.reader.settings.themeLight },
  { key: 'dark', label: content.reader.settings.themeDark },
  { key: 'sepia', label: content.reader.settings.themeSepia },
];

export function ReaderSettingsSheet({ visible, fontScale, theme, onClose, onIncrease, onDecrease, onSelectTheme }: ReaderSettingsSheetProps) {
  const appTheme = useTheme();
  const styles = createStyles(appTheme);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityRole="button" accessibilityLabel={content.common.cancel} />
      <View style={styles.sheet}>
        <Text style={styles.title}>{content.reader.settings.title}</Text>

        <Text style={styles.label}>{content.reader.settings.fontSize}</Text>
        <View style={styles.fontRow}>
          <Pressable accessibilityRole="button" accessibilityLabel="Decrease font size" onPress={onDecrease} style={({ pressed }) => [styles.stepper, pressed && styles.pressed]}>
            <Text style={styles.stepperLabel}>A−</Text>
          </Pressable>
          <Text style={styles.fontValue}>{`${Math.round(fontScale * 100)}%`}</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Increase font size" onPress={onIncrease} style={({ pressed }) => [styles.stepper, pressed && styles.pressed]}>
            <Text style={styles.stepperLabelLarge}>A+</Text>
          </Pressable>
        </View>

        <Text style={styles.label}>{content.reader.settings.theme}</Text>
        <View style={styles.themeRow}>
          {THEME_OPTIONS.map((option) => {
            const active = option.key === theme;
            return (
              <Pressable
                key={option.key}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                onPress={() => onSelectTheme(option.key)}
                style={({ pressed }) => [styles.chip, active && styles.chipActive, pressed && styles.pressed]}>
                <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>{option.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </Modal>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: theme.colors.overlay,
    },
    sheet: {
      backgroundColor: theme.colors.surfaceElevated,
      paddingHorizontal: theme.spacing.xl,
      paddingTop: theme.spacing.xl,
      paddingBottom: theme.spacing.xxxl,
      borderTopLeftRadius: theme.radii.xl,
      borderTopRightRadius: theme.radii.xl,
      gap: theme.spacing.md,
    },
    title: {
      ...theme.type.heading,
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
    },
    label: {
      ...theme.type.label,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.sm,
    },
    fontRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.spacing.lg,
    },
    stepper: {
      flex: 1,
      minHeight: 48,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: theme.radii.md,
      backgroundColor: theme.colors.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
    },
    pressed: {
      opacity: 0.6,
    },
    stepperLabel: {
      ...theme.type.body,
      color: theme.colors.text,
    },
    stepperLabelLarge: {
      ...theme.type.heading,
      color: theme.colors.text,
    },
    fontValue: {
      ...theme.type.bodyStrong,
      color: theme.colors.text,
      minWidth: 56,
      textAlign: 'center',
    },
    themeRow: {
      flexDirection: 'row',
      gap: theme.spacing.md,
    },
    chip: {
      flex: 1,
      minHeight: 48,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: theme.radii.md,
      backgroundColor: theme.colors.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
    },
    chipActive: {
      borderColor: theme.colors.accent,
      backgroundColor: theme.colors.background,
    },
    chipLabel: {
      ...theme.type.label,
      color: theme.colors.textSecondary,
    },
    chipLabelActive: {
      color: theme.colors.accent,
    },
  });
}
