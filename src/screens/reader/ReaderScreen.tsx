/**
 * Importing npm packages
 */
import { StatusBar } from 'expo-status-bar';
import { useRef } from 'react';
import { Animated, ScrollView, StyleSheet, Text, View } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';

/**
 * Importing user defined packages
 */
import { content } from '@/core/content';
import type { ReadingPalette } from '@/core/theme';
import { ChapterFooter } from '@/screens/reader/components/ChapterFooter';
import { MarkdownContent } from '@/screens/reader/components/MarkdownContent';
import { PullIndicator } from '@/screens/reader/components/PullIndicator';
import { ReaderSheet } from '@/screens/reader/components/ReaderSheet';
import { useReaderScreen } from '@/screens/reader/hooks/useReaderScreen';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

// Empty space kept below the last line so the reader can comfortably pull up to advance a chapter.
const PULL_BUFFER = 200;

export function ReaderScreen() {
  const scrollRef = useRef<ScrollView | null>(null);
  const model = useReaderScreen(scrollRef);
  const styles = createStyles(model.palette, model.topInset, model.bottomInset);

  if (model.status === 'notFound') {
    return (
      <View style={styles.page}>
        <Text style={styles.notFound}>{content.common.notFound}</Text>
      </View>
    );
  }

  return (
    <View style={styles.page}>
      <StatusBar style={model.theme === 'dark' ? 'light' : 'dark'} />
      <Animated.View style={[styles.slide, { transform: [{ translateY: model.slideY }, { translateY: model.pullY }] }]}>
        <GestureDetector gesture={model.scrollGesture}>
          <ScrollView
            ref={scrollRef}
            onScroll={model.onScroll}
            scrollEventThrottle={16}
            overScrollMode="never"
            onContentSizeChange={model.onContentSizeChange}
            onLayout={model.onLayout}
            contentContainerStyle={styles.content}>
            <GestureDetector gesture={model.contentGesture}>
              <View>
                <MarkdownContent blocks={model.textBlocks} palette={model.palette} fontScale={model.fontScale} fontFamily={model.fontFamily} />
                <ChapterFooter isLast={model.isLast} onBackToLibrary={model.goToLibrary} palette={model.palette} />
              </View>
            </GestureDetector>
          </ScrollView>
        </GestureDetector>
      </Animated.View>
      <View style={styles.topInsetCover} pointerEvents="none" />
      <PullIndicator dir={model.pullDir} armed={model.pullArmed} pull={model.pullY} palette={model.palette} topInset={model.topInset} bottomInset={model.bottomInset} />
      <ReaderSheet
        visible={model.optionsVisible}
        title={model.chapterTitle}
        palette={model.palette}
        bottomInset={model.bottomInset}
        activeTab={model.activeTab}
        onTab={model.setActiveTab}
        onClose={model.closeOptions}
        chapters={model.chapters}
        currentIndex={model.currentIndex}
        total={model.chapters.length}
        percent={model.progressPercent}
        canPrev={!model.isFirst}
        canNext={!model.isLast}
        onPrev={model.goToPrevChapter}
        onNext={model.goToNextChapter}
        onSeek={model.seekChapter}
        onSelectChapter={model.selectChapter}
        novelTitle={model.novelTitle}
        coverUri={model.coverUri}
        onAbout={model.openAbout}
        characters={model.characterImages}
        images={model.chapterImages}
        scenes={model.galleryScenes}
        fontScale={model.fontScale}
        fontFamily={model.fontFamily}
        theme={model.theme}
        brightnessValue={model.brightnessValue}
        onSetFontScale={model.setFontScale}
        onSetBrightness={model.setBrightness}
        onSelectTheme={model.setTheme}
        onSelectFontFamily={model.setFontFamily}
      />
    </View>
  );
}

function createStyles(palette: ReadingPalette, topInset: number, bottomInset: number) {
  return StyleSheet.create({
    page: {
      flex: 1,
      backgroundColor: palette.background,
    },
    slide: {
      flex: 1,
    },
    topInsetCover: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: topInset,
      backgroundColor: palette.background,
    },
    content: {
      paddingHorizontal: 24,
      paddingTop: topInset + 16,
      paddingBottom: bottomInset + PULL_BUFFER,
      gap: 16,
    },
    notFound: {
      flex: 1,
      textAlign: 'center',
      textAlignVertical: 'center',
      marginTop: topInset + 48,
      color: palette.textSecondary,
      fontSize: 15,
    },
  });
}
