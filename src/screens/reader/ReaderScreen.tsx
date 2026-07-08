/**
 * Importing npm packages
 */
import { Stack } from 'expo-router';
import { useRef } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

/**
 * Importing user defined packages
 */
import { content } from '@/core/content';
import type { AppTheme, ReadingPalette } from '@/core/theme';
import { useTheme } from '@/hooks/use-theme';
import { AssetsOverlay } from '@/screens/reader/components/AssetsOverlay';
import { ChapterFooter } from '@/screens/reader/components/ChapterFooter';
import { MarkdownContent } from '@/screens/reader/components/MarkdownContent';
import { ReaderSettingsSheet } from '@/screens/reader/components/ReaderSettingsSheet';
import { useReaderScreen } from '@/screens/reader/hooks/useReaderScreen';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

export function ReaderScreen() {
  const scrollRef = useRef<ScrollView | null>(null);
  const model = useReaderScreen(scrollRef);
  const styles = createStyles(model.palette);

  if (model.status === 'notFound') {
    return (
      <View style={styles.page}>
        <Stack.Screen options={{ title: '' }} />
        <Text style={styles.notFound}>{content.common.notFound}</Text>
      </View>
    );
  }

  return (
    <View style={styles.page}>
      <Stack.Screen options={{ title: model.chapterTitle, headerRight: () => <HeaderSettingsButton onPress={model.openSettings} /> }} />
      <ScrollView
        ref={scrollRef}
        onScroll={model.onScroll}
        scrollEventThrottle={16}
        onContentSizeChange={model.onContentSizeChange}
        onLayout={model.onLayout}
        contentContainerStyle={styles.content}>
        <Pressable onPress={model.toggleAssets} accessibilityHint={content.reader.assets.hint}>
          <MarkdownContent blocks={model.blocks} novelId={model.novelId} chapterPath={model.chapterPath} palette={model.palette} fontScale={model.fontScale} />
          <ChapterFooter isLast={model.isLast} nextTitle={model.nextTitle} onNext={model.goToNextChapter} onBackToLibrary={model.goToLibrary} palette={model.palette} />
        </Pressable>
      </ScrollView>
      <AssetsOverlay visible={model.assetsVisible} assets={model.assets} viewingAsset={model.viewingAsset} onSelect={model.openAsset} onClose={model.closeAssetView} />
      <ReaderSettingsSheet
        visible={model.settingsVisible}
        fontScale={model.fontScale}
        theme={model.theme}
        onClose={model.closeSettings}
        onIncrease={model.increaseFont}
        onDecrease={model.decreaseFont}
        onSelectTheme={model.setTheme}
      />
    </View>
  );
}

function HeaderSettingsButton({ onPress }: { onPress: () => void }) {
  const theme = useTheme();
  const styles = createButtonStyles(theme);
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={content.reader.settings.title} hitSlop={12} onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>
      <Text style={styles.label}>Aa</Text>
    </Pressable>
  );
}

function createStyles(palette: ReadingPalette) {
  return StyleSheet.create({
    page: {
      flex: 1,
      backgroundColor: palette.background,
    },
    content: {
      paddingHorizontal: 24,
      paddingTop: 16,
      paddingBottom: 64,
      gap: 16,
    },
    notFound: {
      flex: 1,
      textAlign: 'center',
      textAlignVertical: 'center',
      marginTop: 48,
      color: palette.textSecondary,
      fontSize: 15,
    },
  });
}

function createButtonStyles(theme: AppTheme) {
  return StyleSheet.create({
    label: {
      ...theme.type.bodyStrong,
      color: theme.colors.accent,
    },
    pressed: {
      opacity: 0.5,
    },
  });
}
