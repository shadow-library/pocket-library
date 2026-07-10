/**
 * Importing npm packages
 */
import { Dimensions, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Importing user defined packages
 */
import { Cover } from '@/components/cover';
import { Icon } from '@/components/icon';
import { content } from '@/core/content';
import { libraryService } from '@/core/services/library.service';
import type { AppTheme } from '@/core/theme';
import type { Novel } from '@/core/types/novel.types';
import { useTheme } from '@/hooks/use-theme';
import { LibraryEmptyState } from '@/screens/library/components/LibraryEmptyState';
import { useLibraryScreen } from '@/screens/library/hooks/useLibraryScreen';

/**
 * Defining types
 */

type Styles = ReturnType<typeof createStyles>;

/**
 * Declaring the constants
 */

const GUTTER = 24;
const COLUMNS = 3;
const COLUMN_GAP = 14;
const COLUMN_WIDTH = (Dimensions.get('window').width - GUTTER * 2 - COLUMN_GAP * (COLUMNS - 1)) / COLUMNS;
const COVER_HEIGHT = COLUMN_WIDTH * 1.42;

function percentOf(novel: Novel): number | null {
  if (novel.progress === undefined) return null;
  const total = Math.max(1, novel.chapters.length);
  return Math.round(((novel.progress.chapterIndex + novel.progress.scrollFraction) / total) * 100);
}

export function LibraryScreen() {
  const model = useLibraryScreen();
  const theme = useTheme();
  const styles = createStyles(theme, useSafeAreaInsets().top);

  const header = (
    <View style={styles.topBar}>
      <Text style={styles.title}>{content.library.title}</Text>
      <Pressable accessibilityRole="button" accessibilityLabel={content.library.importCta} hitSlop={8} onPress={model.openImport} style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}>
        <Icon name="plus" size={22} color={theme.colors.accentText} />
      </Pressable>
    </View>
  );

  if (model.novels.length === 0) {
    return (
      <View style={styles.page}>
        <View style={styles.topBar}>
          <Text style={styles.title}>{content.library.title}</Text>
        </View>
        <LibraryEmptyState importing={false} onImport={model.openImport} />
      </View>
    );
  }

  return (
    <View style={styles.page}>
      <FlatList
        data={model.novels}
        keyExtractor={(novel) => novel.id}
        numColumns={COLUMNS}
        columnWrapperStyle={styles.column}
        contentContainerStyle={styles.content}
        ListHeaderComponent={header}
        renderItem={({ item }) => <GridCard novel={item} onPress={() => model.openNovel(item.id)} onLongPress={() => model.confirmRemove(item)} theme={theme} styles={styles} />}
      />
    </View>
  );
}

function GridCard({ novel, onPress, onLongPress, theme, styles }: { novel: Novel; onPress: () => void; onLongPress: () => void; theme: AppTheme; styles: Styles }) {
  const percent = percentOf(novel);
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={novel.title} onPress={onPress} onLongPress={onLongPress} style={({ pressed }) => [styles.gridItem, pressed && styles.pressed]}>
      <Cover uri={libraryService.coverUri(novel)} title={novel.title} width={COLUMN_WIDTH} height={COVER_HEIGHT} radius={theme.radii.md} />
      <Text style={styles.gridTitle} numberOfLines={1}>
        {novel.title}
      </Text>
      {percent !== null && (
        <View style={styles.gridProgress}>
          <View style={styles.gridTrack}>
            <View style={[styles.gridFill, { width: `${percent}%` }]} />
          </View>
          <Text style={styles.gridPct}>{percent}%</Text>
        </View>
      )}
    </Pressable>
  );
}

function createStyles(theme: AppTheme, topInset: number) {
  return StyleSheet.create({
    page: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      paddingHorizontal: GUTTER,
      paddingBottom: theme.spacing.xxl,
    },
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: topInset + theme.spacing.md,
      paddingBottom: theme.spacing.lg,
    },
    title: {
      ...theme.type.display,
      color: theme.colors.text,
    },
    addButton: {
      width: 40,
      height: 40,
      borderRadius: theme.radii.md,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.accent,
    },
    pressed: {
      opacity: 0.7,
    },
    column: {
      gap: COLUMN_GAP,
    },
    gridItem: {
      width: COLUMN_WIDTH,
      marginBottom: theme.spacing.xl,
      gap: theme.spacing.xs,
    },
    gridTitle: {
      ...theme.type.label,
      color: theme.colors.text,
    },
    gridProgress: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    gridTrack: {
      flex: 1,
      height: 4,
      borderRadius: 999,
      backgroundColor: theme.colors.surface,
      overflow: 'hidden',
    },
    gridFill: {
      height: '100%',
      borderRadius: 999,
      backgroundColor: theme.colors.accent,
    },
    gridPct: {
      ...theme.type.caption,
      color: theme.colors.textTertiary,
    },
  });
}
