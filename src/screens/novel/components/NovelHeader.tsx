/**
 * Importing npm packages
 */
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

/**
 * Importing user defined packages
 */
import { FullScreenImageViewer } from '@/components/image-viewer';
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

const COVER_WIDTH = 112;
const COVER_HEIGHT = 160;

export function NovelHeader({ novel }: NovelHeaderProps) {
  const theme = useTheme();
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const styles = createStyles(theme);
  const coverUri = libraryService.coverUri(novel);
  const coverImages = coverUri !== null ? [{ uri: coverUri, label: novel.title }] : [];
  const author = novel.author !== undefined ? content.novel.byAuthor(novel.author) : content.novel.unknownAuthor;

  return (
    <View style={styles.container}>
      <Pressable
        disabled={coverUri === null}
        accessibilityRole="button"
        accessibilityLabel={novel.title}
        onPress={() => setViewerIndex(0)}
        style={({ pressed }) => [pressed && coverUri !== null && styles.pressed]}>
        <NovelCover uri={coverUri} label={novel.title} width={COVER_WIDTH} height={COVER_HEIGHT} radius={theme.radii.lg} />
      </Pressable>
      <View style={styles.meta}>
        <Text style={styles.title}>{novel.title}</Text>
        <Text style={styles.author}>{author}</Text>
        <Text style={styles.count}>{content.novel.chapterCount(novel.chapters.length)}</Text>
        {novel.tags.length > 0 && (
          <View style={styles.tags}>
            {novel.tags.map((tag) => (
              <View key={tag} style={styles.chip}>
                <Text style={styles.chipLabel}>{`#${tag}`}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
      <FullScreenImageViewer images={coverImages} startIndex={viewerIndex} onClose={() => setViewerIndex(null)} />
    </View>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      gap: theme.spacing.lg,
      alignItems: 'flex-start',
    },
    pressed: {
      opacity: 0.8,
    },
    meta: {
      flex: 1,
      gap: theme.spacing.xs,
    },
    title: {
      ...theme.type.title,
      color: theme.colors.text,
    },
    author: {
      ...theme.type.body,
      color: theme.colors.textSecondary,
    },
    count: {
      ...theme.type.caption,
      color: theme.colors.textMuted,
    },
    tags: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
      marginTop: theme.spacing.sm,
    },
    chip: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.radii.pill,
      backgroundColor: theme.colors.surface,
    },
    chipLabel: {
      ...theme.type.caption,
      color: theme.colors.textSecondary,
    },
  });
}
