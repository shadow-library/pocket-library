/**
 * Importing npm packages
 */
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/**
 * Importing user defined packages
 */
import { PrimaryButton } from '@/components/primary-button';
import { content } from '@/core/content';
import type { AppTheme } from '@/core/theme';
import { useTheme } from '@/hooks/use-theme';
import { ContinueReadingCard } from '@/screens/library/components/ContinueReadingCard';
import { LibraryEmptyState } from '@/screens/library/components/LibraryEmptyState';
import { NovelListItem } from '@/screens/library/components/NovelListItem';
import { useLibraryScreen } from '@/screens/library/hooks/useLibraryScreen';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

const SAFE_AREA_EDGES = ['top', 'bottom'] as const;

export function LibraryScreen() {
  const model = useLibraryScreen();
  const theme = useTheme();
  const styles = createStyles(theme);

  if (model.novels.length === 0) {
    return (
      <SafeAreaView edges={SAFE_AREA_EDGES} style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.title}>{content.library.title}</Text>
        </View>
        <LibraryEmptyState importing={model.importing} onImport={model.onImport} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={SAFE_AREA_EDGES} style={styles.safe}>
      <FlatList
        data={model.novels}
        keyExtractor={(novel) => novel.id}
        renderItem={({ item }) => <NovelListItem novel={item} onPress={model.openNovel} onLongPress={model.confirmRemove} />}
        ItemSeparatorComponent={Separator}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.headerBlock}>
            <View style={styles.header}>
              <Text style={styles.title}>{content.library.title}</Text>
              <PrimaryButton label={content.library.importCta} onPress={model.onImport} loading={model.importing} />
            </View>
            {model.continueNovel !== null && <ContinueReadingCard novel={model.continueNovel} onPress={model.continueReading} />}
          </View>
        }
      />
    </SafeAreaView>
  );
}

function Separator() {
  const theme = useTheme();
  return <View style={createStyles(theme).separator} />;
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
    },
    title: {
      ...theme.type.display,
      color: theme.colors.text,
    },
    headerBlock: {
      gap: theme.spacing.lg,
      paddingBottom: theme.spacing.lg,
    },
    listContent: {
      paddingHorizontal: theme.spacing.xl,
      paddingBottom: theme.spacing.xxl,
    },
    separator: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: theme.colors.border,
    },
  });
}
