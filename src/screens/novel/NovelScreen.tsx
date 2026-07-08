/**
 * Importing npm packages
 */
import { Stack } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

/**
 * Importing user defined packages
 */
import { content } from '@/core/content';
import type { AppTheme } from '@/core/theme';
import { useTheme } from '@/hooks/use-theme';
import { CharacterStrip } from '@/screens/novel/components/CharacterStrip';
import { ChapterList } from '@/screens/novel/components/ChapterList';
import { NovelActions } from '@/screens/novel/components/NovelActions';
import { NovelHeader } from '@/screens/novel/components/NovelHeader';
import { useNovelScreen } from '@/screens/novel/hooks/useNovelScreen';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

export function NovelScreen() {
  const model = useNovelScreen();
  const theme = useTheme();
  const styles = createStyles(theme);

  if (model.novel === null) {
    return (
      <View style={styles.notFound}>
        <Stack.Screen options={{ title: '' }} />
        <Text style={styles.notFoundText}>{content.common.notFound}</Text>
      </View>
    );
  }

  const novel = model.novel;
  const startLabel = model.hasProgress ? content.novel.continueReading : content.novel.startReading;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: novel.title }} />
      <ScrollView contentContainerStyle={styles.content}>
        <NovelHeader novel={novel} />
        <NovelActions startLabel={startLabel} onStart={model.startReading} onRemove={model.confirmRemove} />
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
    notFound: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.background,
      padding: theme.spacing.xl,
    },
    notFoundText: {
      ...theme.type.body,
      color: theme.colors.textSecondary,
    },
  });
}
