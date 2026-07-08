/**
 * Importing npm packages
 */
import { StyleSheet, Text, View } from 'react-native';

/**
 * Importing user defined packages
 */
import { NovelCover } from '@/components/novel-cover';
import { content } from '@/core/content';
import { libraryService } from '@/core/services/library.service';
import type { AppTheme } from '@/core/theme';
import type { Novel } from '@/core/types/novel.types';
import { useTheme } from '@/hooks/use-theme';

/**
 * Defining types
 */

type NovelHeaderProps = {
  novel: Novel;
};

/**
 * Declaring the constants
 */

const COVER_WIDTH = 128;
const COVER_HEIGHT = 184;

export function NovelHeader({ novel }: NovelHeaderProps) {
  const theme = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <NovelCover uri={libraryService.coverUri(novel)} label={novel.title} width={COVER_WIDTH} height={COVER_HEIGHT} radius={theme.radii.lg} />
      <Text style={styles.title}>{novel.title}</Text>
      <Text style={styles.author}>{novel.author !== undefined ? content.novel.byAuthor(novel.author) : content.novel.unknownAuthor}</Text>
      <Text style={styles.meta}>{content.novel.chapterCount(novel.chapters.length)}</Text>
      {novel.description !== undefined && <Text style={styles.description}>{novel.description}</Text>}
    </View>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    container: {
      alignItems: 'center',
      gap: theme.spacing.sm,
      paddingVertical: theme.spacing.lg,
    },
    title: {
      ...theme.type.title,
      color: theme.colors.text,
      textAlign: 'center',
      marginTop: theme.spacing.md,
    },
    author: {
      ...theme.type.body,
      color: theme.colors.textSecondary,
    },
    meta: {
      ...theme.type.caption,
      color: theme.colors.textMuted,
    },
    description: {
      ...theme.type.body,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginTop: theme.spacing.sm,
    },
  });
}
