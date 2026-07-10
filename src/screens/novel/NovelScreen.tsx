/**
 * Importing npm packages
 */
import { ScrollView, StyleSheet, Text, View } from 'react-native';

/**
 * Importing user defined packages
 */
import { ChapterList } from '@/components/chapter-list';
import { PrimaryButton } from '@/components/primary-button';
import { ScreenHeader } from '@/components/screen-header';
import { content } from '@/core/content';
import type { AppTheme } from '@/core/theme';
import type { Novel } from '@/core/types/novel.types';
import { useTheme } from '@/hooks/use-theme';
import { CharacterStrip } from '@/screens/novel/components/CharacterStrip';
import { NovelHeader } from '@/screens/novel/components/NovelHeader';
import { NovelSynopsis } from '@/screens/novel/components/NovelSynopsis';
import { useNovelScreen } from '@/screens/novel/hooks/useNovelScreen';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

function percentOf(novel: Novel): number {
  if (novel.progress === undefined) return 0;
  const total = Math.max(1, novel.chapters.length);
  return Math.round(((novel.progress.chapterIndex + novel.progress.scrollFraction) / total) * 100);
}

export function NovelScreen() {
  const model = useNovelScreen();
  const theme = useTheme();
  const styles = createStyles(theme);

  if (model.novel === null) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="" back />
        <Text style={styles.notFoundText}>{content.common.notFound}</Text>
      </View>
    );
  }

  const novel = model.novel;
  const startLabel = model.hasProgress ? content.novel.continuePercent(percentOf(novel)) : content.novel.startReading;

  return (
    <View style={styles.container}>
      <ScreenHeader title="" back action={{ icon: 'trash-2', onPress: model.confirmRemove, label: content.novel.remove }} />
      <ScrollView contentContainerStyle={styles.content}>
        <NovelHeader novel={novel} />
        <PrimaryButton label={startLabel} onPress={model.startReading} />
        {novel.description !== undefined && <NovelSynopsis text={novel.description} />}
        {novel.characters.length > 0 && <CharacterStrip novelId={novel.id} characters={novel.characters} />}
        <ChapterList chapters={novel.chapters} currentIndex={novel.progress?.chapterIndex ?? null} onSelect={model.openChapter} />
      </ScrollView>
    </View>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      padding: theme.spacing.xl,
      gap: theme.spacing.xl,
      paddingBottom: theme.spacing.xxxl,
    },
    notFoundText: {
      ...theme.type.body,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginTop: theme.spacing.xxxl,
    },
  });
}
