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
import { CONTINUE_COVER_HEIGHT, CONTINUE_COVER_WIDTH } from '@/screens/library/library.constants';

/**
 * Defining types
 */

type ContinueReadingCardProps = {
  novel: Novel;
  onPress: (novel: Novel) => void;
};

/**
 * Declaring the constants
 */

export function ContinueReadingCard({ novel, onPress }: ContinueReadingCardProps) {
  const theme = useTheme();
  const styles = createStyles(theme);
  const chapter = (novel.progress?.chapterIndex ?? 0) + 1;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${content.library.continueReading}: ${novel.title}`}
      onPress={() => onPress(novel)}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <NovelCover uri={libraryService.coverUri(novel)} label={novel.title} width={CONTINUE_COVER_WIDTH} height={CONTINUE_COVER_HEIGHT} />
      <View style={styles.body}>
        <Text style={styles.overline}>{content.library.continueReading}</Text>
        <Text style={styles.title} numberOfLines={2}>
          {novel.title}
        </Text>
        <Text style={styles.progress}>{content.library.chapterProgress(chapter, novel.chapters.length)}</Text>
      </View>
    </Pressable>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    card: {
      flexDirection: 'row',
      gap: theme.spacing.lg,
      padding: theme.spacing.lg,
      borderRadius: theme.radii.lg,
      backgroundColor: theme.colors.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
    },
    pressed: {
      opacity: 0.9,
    },
    body: {
      flex: 1,
      justifyContent: 'center',
      gap: theme.spacing.xs,
    },
    overline: {
      ...theme.type.overline,
      textTransform: 'uppercase',
      color: theme.colors.accent,
    },
    title: {
      ...theme.type.heading,
      color: theme.colors.text,
    },
    progress: {
      ...theme.type.caption,
      color: theme.colors.textSecondary,
    },
  });
}
