/**
 * Importing npm packages
 */
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

/**
 * Importing user defined packages
 */
import { Icon } from '@/components/icon';
import { PrimaryButton } from '@/components/primary-button';
import { ScreenHeader } from '@/components/screen-header';
import { content } from '@/core/content';
import type { AppTheme } from '@/core/theme';
import { useTheme } from '@/hooks/use-theme';
import { useImportScreen } from '@/screens/import/hooks/useImportScreen';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

const STEPS = [content.import.steps.unpacking, content.import.steps.manifest, content.import.steps.chapters, content.import.steps.assets];

export function ImportScreen() {
  const model = useImportScreen();
  const theme = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.page}>
      <ScreenHeader title={content.import.title} back />
      <View style={styles.content}>
        {model.stage.status === 'error' ? (
          <View style={styles.block}>
            <View style={styles.errorIcon}>
              <Icon name="alert-triangle" size={30} color={theme.colors.danger} />
            </View>
            <Text style={styles.errorTitle}>{content.import.errorTitle}</Text>
            <Text style={styles.errorBody}>{model.stage.message}</Text>
            <PrimaryButton label={content.import.retry} onPress={model.browse} />
            <Pressable accessibilityRole="button" onPress={model.reset} style={({ pressed }) => [styles.ghost, pressed && styles.pressed]}>
              <Text style={styles.ghostLabel}>{content.import.chooseDifferent}</Text>
            </Pressable>
          </View>
        ) : model.stage.status === 'importing' ? (
          <View style={styles.block}>
            <ActivityIndicator color={theme.colors.accent} />
            <Text style={styles.importingLabel}>{content.import.importing}…</Text>
            <View style={styles.steps}>
              {STEPS.map((step) => (
                <View key={step} style={styles.stepRow}>
                  <Icon name="check-circle" size={17} color={theme.colors.textTertiary} />
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.block}>
            <Pressable accessibilityRole="button" accessibilityLabel={content.import.browse} onPress={model.browse} style={({ pressed }) => [styles.dropZone, pressed && styles.pressed]}>
              <View style={styles.dropIcon}>
                <Icon name="upload-cloud" size={30} color={theme.colors.accent} />
              </View>
              <Text style={styles.dropTitle}>{content.import.dropTitle}</Text>
              <Text style={styles.dropSubtitle}>{content.import.dropSubtitle}</Text>
            </Pressable>
            <PrimaryButton label={content.import.browse} onPress={model.browse} />
          </View>
        )}
      </View>
    </View>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    page: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      flex: 1,
      padding: theme.spacing.xl,
      justifyContent: 'center',
    },
    block: {
      gap: theme.spacing.lg,
    },
    dropZone: {
      borderRadius: theme.radii.xl,
      borderWidth: 2,
      borderStyle: 'dashed',
      borderColor: theme.colors.borderStrong,
      backgroundColor: theme.colors.surfaceElevated,
      alignItems: 'center',
      gap: theme.spacing.sm,
      paddingVertical: theme.spacing.xxxl,
      paddingHorizontal: theme.spacing.xl,
    },
    dropIcon: {
      width: 60,
      height: 60,
      borderRadius: theme.radii.pill,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.accentSoft,
      marginBottom: theme.spacing.sm,
    },
    dropTitle: {
      ...theme.type.bodyStrong,
      color: theme.colors.text,
    },
    dropSubtitle: {
      ...theme.type.caption,
      color: theme.colors.textTertiary,
    },
    pressed: {
      opacity: 0.7,
    },
    importingLabel: {
      ...theme.type.bodyStrong,
      color: theme.colors.text,
      textAlign: 'center',
    },
    steps: {
      gap: theme.spacing.md,
      backgroundColor: theme.colors.surfaceElevated,
      borderRadius: theme.radii.lg,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
      padding: theme.spacing.lg,
    },
    stepRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
    },
    stepText: {
      ...theme.type.body,
      color: theme.colors.textSecondary,
    },
    errorIcon: {
      alignSelf: 'center',
      width: 60,
      height: 60,
      borderRadius: theme.radii.pill,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.dangerBg,
    },
    errorTitle: {
      ...theme.type.heading,
      color: theme.colors.text,
      textAlign: 'center',
    },
    errorBody: {
      ...theme.type.body,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    ghost: {
      minHeight: 48,
      alignItems: 'center',
      justifyContent: 'center',
    },
    ghostLabel: {
      ...theme.type.label,
      color: theme.colors.textSecondary,
    },
  });
}
