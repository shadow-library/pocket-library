/**
 * Importing npm packages
 */
import { Pressable, StyleSheet, Text, View } from 'react-native';

/**
 * Importing user defined packages
 */
import { NovelCover } from '@/components/novel-cover';
import { content } from '@/core/content';
import { libraryService } from '@/core/services/library.service';
import type { AppTheme } from '@/core/theme';
import type { Novel } from '@/core/types/novel.types';
import { useTheme } from '@/hooks/use-theme';
import { LIST_COVER_HEIGHT, LIST_COVER_WIDTH } from '@/screens/library/library.constants';

/**
 * Defining types
 */

type NovelListItemProps = {
  novel: Novel;
  onPress: (id: string) => void;
  onLongPress: (novel: Novel) => void;
};

/**
 * Declaring the constants
 */

export function NovelListItem({ novel, onPress, onLongPress }: NovelListItemProps) {
  const theme = useTheme();
  const styles = createStyles(theme);
  const author = novel.author ?? content.novel.unknownAuthor;
  const progressLabel = novel.progress !== undefined ? content.library.chapterProgress(novel.progress.chapterIndex + 1, novel.chapters.length) : content.novel.chapterCount(novel.chapters.length);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={novel.title}
      onPress={() => onPress(novel.id)}
      onLongPress={() => onLongPress(novel)}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <NovelCover uri={libraryService.coverUri(novel)} label={novel.title} width={LIST_COVER_WIDTH} height={LIST_COVER_HEIGHT} />
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>
          {novel.title}
        </Text>
        <Text style={styles.author} numberOfLines={1}>
          {author}
        </Text>
        <Text style={styles.progress}>{progressLabel}</Text>
      </View>
    </Pressable>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      gap: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
    },
    pressed: {
      opacity: 0.7,
    },
    body: {
      flex: 1,
      justifyContent: 'center',
      gap: theme.spacing.xs,
    },
    title: {
      ...theme.type.bodyStrong,
      color: theme.colors.text,
    },
    author: {
      ...theme.type.caption,
      color: theme.colors.textSecondary,
    },
    progress: {
      ...theme.type.caption,
      color: theme.colors.textMuted,
    },
  });
}
