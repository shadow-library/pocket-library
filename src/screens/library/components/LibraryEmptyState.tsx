/**
 * Importing npm packages
 */
import { StyleSheet, Text, View } from 'react-native';

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

type LibraryEmptyStateProps = {
  importing: boolean;
  onImport: () => void;
};

/**
 * Declaring the constants
 */

export function LibraryEmptyState({ importing, onImport }: LibraryEmptyStateProps) {
  const theme = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{content.library.empty.title}</Text>
      <Text style={styles.body}>{content.library.empty.body}</Text>
      <PrimaryButton label={importing ? content.library.importing : content.library.importCta} onPress={onImport} loading={importing} />
    </View>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.lg,
      paddingHorizontal: theme.spacing.xl,
    },
    title: {
      ...theme.type.title,
      color: theme.colors.text,
      textAlign: 'center',
    },
    body: {
      ...theme.type.body,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
  });
}
