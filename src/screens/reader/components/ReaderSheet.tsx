/**
 * Importing npm packages
 */
import { useEffect, useState } from 'react';
import { Animated, Easing, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

/**
 * Importing user defined packages
 */
import { Icon } from '@/components/icon';
import { content } from '@/core/content';
import { readingFonts, spacing, type ReaderFontFamily, type ReadingPalette, type ReadingTheme } from '@/core/theme';
import type { Chapter } from '@/core/types/novel.types';
import { ReaderGalleryPanel } from '@/screens/reader/components/ReaderGalleryPanel';
import { ReaderMenuPanel } from '@/screens/reader/components/ReaderMenuPanel';
import { ReaderSettingsPanel } from '@/screens/reader/components/ReaderSettingsPanel';
import type { ReaderImageAsset } from '@/screens/reader/reader.helpers';
import type { ReaderTab } from '@/screens/reader/hooks/useReaderScreen';

/**
 * Defining types
 */

type ReaderSheetProps = {
  visible: boolean;
  title: string;
  palette: ReadingPalette;
  bottomInset: number;
  activeTab: ReaderTab;
  onTab: (tab: ReaderTab) => void;
  onClose: () => void;
  chapters: Chapter[];
  currentIndex: number;
  total: number;
  percent: number;
  canPrev: boolean;
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onSeek: (index: number) => void;
  onSelectChapter: (index: number) => void;
  novelTitle: string;
  coverUri: string | null;
  onAbout: () => void;
  characters: ReaderImageAsset[];
  images: ReaderImageAsset[];
  scenes: ReaderImageAsset[];
  fontScale: number;
  fontFamily: ReaderFontFamily;
  theme: ReadingTheme;
  brightnessValue: number;
  onSetFontScale: (fontScale: number) => void;
  onSetBrightness: (brightness: number) => void;
  onSelectTheme: (theme: ReadingTheme) => void;
  onSelectFontFamily: (fontFamily: ReaderFontFamily) => void;
};

type TabBarProps = {
  activeTab: ReaderTab;
  onTab: (tab: ReaderTab) => void;
  palette: ReadingPalette;
  styles: ReturnType<typeof createStyles>;
};

/**
 * Declaring the constants
 */

const TABS: { key: ReaderTab; label: string }[] = [
  { key: 'contents', label: content.reader.tabs.menu },
  { key: 'display', label: content.reader.tabs.reading },
  { key: 'gallery', label: content.reader.tabs.gallery },
];

const SHEET_SLIDE_OFFSET = 480;
const OPEN_DURATION_MS = 240;
const CLOSE_DURATION_MS = 180;

// The reader's tap-triggered control surface: a slide-up sheet styled after the design — Menu,
// Reading, and Gallery panels switched by the bottom tile row. Everything is colored from the active
// reading palette so the sheet matches the page behind it. The Modal's own animation is disabled so
// the backdrop can fade in place while only the sheet slides; closing plays the reverse before the
// parent is told to hide the modal.
export function ReaderSheet(props: ReaderSheetProps) {
  const [progress] = useState(() => new Animated.Value(0));
  const styles = createStyles(props.palette);

  useEffect(() => {
    if (!props.visible) return;
    progress.setValue(0);
    Animated.timing(progress, { toValue: 1, duration: OPEN_DURATION_MS, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [props.visible, progress]);

  const close = () => Animated.timing(progress, { toValue: 0, duration: CLOSE_DURATION_MS, easing: Easing.in(Easing.cubic), useNativeDriver: true }).start(() => props.onClose());
  const sheetY = progress.interpolate({ inputRange: [0, 1], outputRange: [SHEET_SLIDE_OFFSET, 0] });

  return (
    <Modal visible={props.visible} transparent animationType="none" onRequestClose={close}>
      <GestureHandlerRootView style={styles.root}>
        <Animated.View style={[styles.backdrop, { opacity: progress }]}>
          <Pressable style={styles.backdropPress} onPress={close} accessibilityRole="button" accessibilityLabel={content.common.close} />
        </Animated.View>
        <Animated.View style={[styles.sheet, { paddingBottom: props.bottomInset + spacing.sm, transform: [{ translateY: sheetY }] }]}>
          <View style={styles.handle} />
          <ScrollView style={styles.panel} contentContainerStyle={styles.panelContent} showsVerticalScrollIndicator={false}>
            {props.activeTab === 'contents' && (
              <ReaderMenuPanel
                palette={props.palette}
                percent={props.percent}
                chapterTitle={props.title}
                chapters={props.chapters}
                currentIndex={props.currentIndex}
                total={props.total}
                canPrev={props.canPrev}
                canNext={props.canNext}
                onPrev={props.onPrev}
                onNext={props.onNext}
                onSeek={props.onSeek}
                onSelectChapter={props.onSelectChapter}
                novelTitle={props.novelTitle}
                coverUri={props.coverUri}
                onAbout={props.onAbout}
              />
            )}
            {props.activeTab === 'display' && (
              <ReaderSettingsPanel
                palette={props.palette}
                fontScale={props.fontScale}
                fontFamily={props.fontFamily}
                theme={props.theme}
                brightnessValue={props.brightnessValue}
                onSelectTheme={props.onSelectTheme}
                onSelectFontFamily={props.onSelectFontFamily}
                onSetFontScale={props.onSetFontScale}
                onSetBrightness={props.onSetBrightness}
              />
            )}
            {props.activeTab === 'gallery' && <ReaderGalleryPanel palette={props.palette} characters={props.characters} images={props.images} scenes={props.scenes} />}
          </ScrollView>
          <TabBar activeTab={props.activeTab} onTab={props.onTab} palette={props.palette} styles={styles} />
        </Animated.View>
      </GestureHandlerRootView>
    </Modal>
  );
}

function TabBar({ activeTab, onTab, palette, styles }: TabBarProps) {
  return (
    <View style={styles.tabBar}>
      {TABS.map((tab) => {
        const active = tab.key === activeTab;
        return (
          <Pressable
            key={tab.key}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={tab.label}
            onPress={() => onTab(tab.key)}
            style={({ pressed }) => [styles.tabTile, active && styles.tabTileActive, pressed && styles.pressed]}>
            {tab.key === 'contents' && <Icon name="list" size={21} color={active ? palette.accent : palette.pct} />}
            {tab.key === 'display' && <Text style={[styles.tabGlyph, active && styles.tabGlyphActive]}>Aa</Text>}
            {tab.key === 'gallery' && <Icon name="image" size={20} color={active ? palette.accent : palette.pct} />}
          </Pressable>
        );
      })}
    </View>
  );
}

function createStyles(palette: ReadingPalette) {
  return StyleSheet.create({
    root: {
      flex: 1,
    },
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(20,15,5,0.28)',
    },
    backdropPress: {
      flex: 1,
    },
    sheet: {
      maxHeight: '80%',
      backgroundColor: palette.sheet,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingTop: spacing.sm,
    },
    handle: {
      alignSelf: 'center',
      width: 40,
      height: 5,
      borderRadius: 999,
      backgroundColor: palette.progressTrack,
      marginBottom: spacing.sm,
    },
    pressed: {
      opacity: 0.5,
    },
    panel: {
      flexShrink: 1,
    },
    panelContent: {
      paddingHorizontal: 18,
      paddingBottom: spacing.md,
    },
    tabBar: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: spacing.lg,
      borderTopWidth: 1,
      borderTopColor: palette.sheetWell,
      paddingTop: spacing.md,
    },
    tabTile: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 12,
    },
    tabTileActive: {
      backgroundColor: palette.accentSoft,
    },
    tabGlyph: {
      fontFamily: readingFonts.serifTitle,
      fontSize: 18,
      color: palette.pct,
    },
    tabGlyphActive: {
      color: palette.accent,
    },
  });
}
