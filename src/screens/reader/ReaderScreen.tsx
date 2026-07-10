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
import { ReaderSheet } from '@/screens/reader/components/ReaderSheet';
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
      <Animated.View style={[styles.slide, { transform: [{ translateY: model.slideY }] }]}>
        <ScrollView
          ref={scrollRef}
          onScroll={model.onScroll}
          onScrollBeginDrag={model.onScrollBeginDrag}
          onScrollEndDrag={model.onScrollEndDrag}
          scrollEventThrottle={16}
          onContentSizeChange={model.onContentSizeChange}
          onLayout={model.onLayout}
          contentContainerStyle={styles.content}>
          <GestureDetector gesture={model.contentGesture}>
            <View>
              <MarkdownContent blocks={model.textBlocks} palette={model.palette} fontScale={model.fontScale} fontFamily={model.fontFamily} />
              <ChapterFooter isLast={model.isLast} nextTitle={model.nextTitle} onNext={model.goToNextChapter} onBackToLibrary={model.goToLibrary} palette={model.palette} />
            </View>
          </GestureDetector>
        </ScrollView>
      </Animated.View>
      <View style={styles.topInsetCover} pointerEvents="none" />
      <View style={styles.progressBar} pointerEvents="none">
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${model.progressPercent}%` }]} />
        </View>
        <Text style={styles.progressPct}>{model.progressPercent}%</Text>
      </View>
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
      paddingBottom: bottomInset + 64,
      gap: 16,
    },
    progressBar: {
      position: 'absolute',
      left: 24,
      right: 24,
      bottom: bottomInset + 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    progressTrack: {
      flex: 1,
      height: 5,
      borderRadius: 999,
      backgroundColor: palette.progressTrack,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      borderRadius: 999,
      backgroundColor: palette.progressFill,
    },
    progressPct: {
      fontFamily: 'Inter_400Regular',
      fontSize: 12,
      color: palette.pct,
      minWidth: 30,
      textAlign: 'right',
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
