/**
 * Importing npm packages
 */
import * as Brightness from 'expo-brightness';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { type RefObject, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, type LayoutChangeEvent, type NativeScrollEvent, type NativeSyntheticEvent, ScrollView, useWindowDimensions } from 'react-native';
import { Gesture } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Importing user defined packages
 */
import { utilityService } from '@/core/infrastructure/utility.service';
import { libraryService } from '@/core/services/library.service';
import { readingProgressService } from '@/core/services/reading-progress.service';
import { readingStatsService } from '@/core/services/reading-stats.service';
import { readingColors, type ReaderFontFamily, type ReadingPalette, type ReadingTheme } from '@/core/theme';
import type { Chapter } from '@/core/types/novel.types';
import { parseMarkdown, partitionBlocks, scrollFraction, type ReaderBlock, type ReaderImageAsset } from '@/screens/reader/reader.helpers';
import { useAppSettingsStore } from '@/stores/use-app-settings-store';
import { useLibraryStore } from '@/stores/use-library-store';
import { useReaderSettingsStore } from '@/stores/use-reader-settings-store';

/**
 * Defining types
 */

export type ReaderTab = 'contents' | 'display' | 'gallery';

type PendingSlide = { direction: -1 | 0 | 1; toIndex: number };

export type ReaderScreenModel = {
  status: 'ready' | 'notFound';
  novelId: string;
  novelTitle: string;
  coverUri: string | null;
  chapterTitle: string;
  chapterPath: string;
  textBlocks: ReaderBlock[];
  chapterImages: ReaderImageAsset[];
  galleryScenes: ReaderImageAsset[];
  characterImages: ReaderImageAsset[];
  chapters: Chapter[];
  currentIndex: number;
  isFirst: boolean;
  isLast: boolean;
  nextTitle: string | null;
  topInset: number;
  bottomInset: number;
  progressPercent: number;
  onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onScrollBeginDrag: () => void;
  onScrollEndDrag: () => void;
  onContentSizeChange: (width: number, height: number) => void;
  onLayout: (event: LayoutChangeEvent) => void;
  goToPrevChapter: () => void;
  goToNextChapter: () => void;
  seekChapter: (index: number) => void;
  selectChapter: (index: number) => void;
  goToLibrary: () => void;
  openAbout: () => void;
  slideY: Animated.Value;
  palette: ReadingPalette;
  fontScale: number;
  fontFamily: ReaderFontFamily;
  theme: ReadingTheme;
  brightnessValue: number;
  setBrightness: (brightness: number) => void;
  optionsVisible: boolean;
  contentGesture: ReturnType<typeof Gesture.Race>;
  closeOptions: () => void;
  activeTab: ReaderTab;
  setActiveTab: (tab: ReaderTab) => void;
  setFontScale: (fontScale: number) => void;
  setTheme: (theme: ReadingTheme) => void;
  setFontFamily: (fontFamily: ReaderFontFamily) => void;
};

/**
 * Declaring the constants
 */

const SAVE_DEBOUNCE_MS = 800;
const END_OF_CHAPTER_FRACTION = 0.995;
const START_OF_CHAPTER_FRACTION = 0.005;
const SLIDE_DURATION_MS = 280;
const TAP_MAX_DISTANCE = 16;
const PULL_DISTANCE = 80;
const NO_SLIDE: PendingSlide = { direction: 0, toIndex: -1 };

export function useReaderScreen(scrollView: RefObject<ScrollView | null>): ReaderScreenModel {
  const { id, chapter } = useLocalSearchParams<{ id: string; chapter?: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const novel = useLibraryStore((state) => state.novels.find((item) => item.id === id) ?? null);
  const saveProgress = useLibraryStore((state) => state.saveProgress);
  const fontScale = useReaderSettingsStore((state) => state.fontScale);
  const fontFamily = useReaderSettingsStore((state) => state.fontFamily);
  const theme = useReaderSettingsStore((state) => state.theme);
  const setTheme = useReaderSettingsStore((state) => state.setTheme);
  const setFontFamily = useReaderSettingsStore((state) => state.setFontFamily);
  const setFontScale = useReaderSettingsStore((state) => state.setFontScale);
  const brightness = useReaderSettingsStore((state) => state.brightness);
  const setBrightness = useReaderSettingsStore((state) => state.setBrightness);
  const keepAwake = useAppSettingsStore((state) => state.keepAwake);

  const [optionsVisible, setOptionsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<ReaderTab>('contents');
  const [progressPercent, setProgressPercent] = useState(0);
  const [systemBrightness, setSystemBrightness] = useState(0.5);
  const [slideY] = useState(() => new Animated.Value(0));
  const [scrollable, setScrollable] = useState(false);
  const [pendingSlide, setPendingSlide] = useState<PendingSlide>(NO_SLIDE);
  const { height: windowHeight } = useWindowDimensions();

  const contentHeight = useRef(0);
  const layoutHeight = useRef(0);
  const restored = useRef(false);
  const pendingFraction = useRef(0);
  const lastFraction = useRef(0);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sessionStart = useRef(0);
  const dragStartedAtEnd = useRef(false);
  const dragStartedAtStart = useRef(false);

  const chapters = useMemo(() => novel?.chapters ?? [], [novel]);
  const safeIndex = clampIndex(Number(chapter ?? 0), chapters.length);
  const activeChapter = chapters[safeIndex] ?? null;
  const chapterPath = activeChapter?.path ?? '';

  const { textBlocks, imageBlocks } = useMemo(() => partitionBlocks(loadBlocks(id, chapterPath)), [id, chapterPath]);
  const chapterImages = useMemo<ReaderImageAsset[]>(
    () => imageBlocks.map((block) => ({ uri: libraryService.assetUri(id, utilityService.resolvePath(chapterPath, block.src)), label: block.alt })),
    [imageBlocks, id, chapterPath],
  );
  const galleryScenes = useMemo<ReaderImageAsset[]>(() => {
    if (novel === null) return [];
    return novel.scenes
      .filter((scene) => scene.chapterPath === undefined || scene.chapterPath === chapterPath)
      .map((scene) => ({ uri: libraryService.assetUri(novel.id, scene.imagePath), label: scene.caption ?? '' }));
  }, [novel, chapterPath]);
  // Character portraits belong to the whole novel, so the gallery shows them for every chapter.
  const characterImages = useMemo<ReaderImageAsset[]>(() => {
    if (novel === null) return [];
    return novel.characters
      .filter((character): character is typeof character & { imagePath: string } => character.imagePath !== undefined)
      .map((character) => ({ uri: libraryService.assetUri(novel.id, character.imagePath), label: character.name }));
  }, [novel]);

  const commitSave = useCallback(() => saveProgress(id, { chapterIndex: safeIndex, scrollFraction: lastFraction.current, updatedAt: Date.now() }), [saveProgress, id, safeIndex]);

  const maybeRestore = useCallback(() => {
    if (restored.current || contentHeight.current === 0 || layoutHeight.current === 0) return;
    const scrollable = contentHeight.current - layoutHeight.current;
    if (scrollable > 0 && pendingFraction.current > 0) scrollView.current?.scrollTo({ y: pendingFraction.current * scrollable, animated: false });
    restored.current = true;
  }, [scrollView]);

  const total = chapters.length;

  useEffect(() => {
    if (chapterPath.length === 0) return;
    const persisted = readingProgressService.get(id);
    pendingFraction.current = persisted !== null && persisted.chapterIndex === safeIndex ? persisted.scrollFraction : 0;
    lastFraction.current = pendingFraction.current;
    restored.current = false;
    sessionStart.current = Date.now();
    setProgressPercent(bookPercent(safeIndex, pendingFraction.current, total));
    scrollView.current?.scrollTo({ y: 0, animated: false });
    saveProgress(id, { chapterIndex: safeIndex, scrollFraction: pendingFraction.current, updatedAt: Date.now() });
    return () => {
      if (saveTimer.current !== null) clearTimeout(saveTimer.current);
      saveProgress(id, { chapterIndex: safeIndex, scrollFraction: lastFraction.current, updatedAt: Date.now() });
      readingStatsService.recordSession(id, safeIndex, Date.now() - sessionStart.current);
    };
  }, [id, safeIndex, chapterPath, saveProgress, scrollView, total]);

  useEffect(() => {
    if (brightness < 0) return;
    Brightness.setBrightnessAsync(brightness).catch(() => undefined);
    return () => {
      Brightness.restoreSystemBrightnessAsync().catch(() => undefined);
    };
  }, [brightness]);

  // The sheet's brightness slider needs a starting position even while the user still follows the
  // system level, so the current system brightness is sampled once on mount.
  useEffect(() => {
    Brightness.getBrightnessAsync().then(setSystemBrightness).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!keepAwake) return;
    activateKeepAwakeAsync('reader').catch(() => undefined);
    return () => {
      deactivateKeepAwake('reader').catch(() => undefined);
    };
  }, [keepAwake]);

  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (!restored.current) return;
      const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
      const fraction = scrollFraction(contentOffset.y, contentSize.height, layoutMeasurement.height);
      lastFraction.current = fraction;
      setProgressPercent((prev) => {
        const next = bookPercent(safeIndex, fraction, total);
        return prev === next ? prev : next;
      });
      if (saveTimer.current !== null) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(commitSave, SAVE_DEBOUNCE_MS);
    },
    [commitSave, safeIndex, total],
  );

  // Pulling up while already at the chapter's end advances to the next chapter, and pulling down at
  // the very start goes back to the previous one. The drag must both start and finish at that edge,
  // so a normal scroll that merely reaches an edge never triggers a chapter change.
  const onScrollBeginDrag = useCallback(() => {
    dragStartedAtEnd.current = restored.current && lastFraction.current >= END_OF_CHAPTER_FRACTION;
    dragStartedAtStart.current = restored.current && lastFraction.current <= START_OF_CHAPTER_FRACTION;
  }, []);

  const onContentSizeChange = useCallback(
    (_width: number, height: number) => {
      contentHeight.current = height;
      setScrollable(contentHeight.current - layoutHeight.current > 1);
      maybeRestore();
    },
    [maybeRestore],
  );

  const onLayout = useCallback(
    (event: LayoutChangeEvent) => {
      layoutHeight.current = event.nativeEvent.layout.height;
      setScrollable(contentHeight.current - layoutHeight.current > 1);
      maybeRestore();
    },
    [maybeRestore],
  );

  const goToNextChapter = useCallback(() => {
    if (safeIndex >= chapters.length - 1) return;
    setPendingSlide({ direction: 1, toIndex: safeIndex + 1 });
    router.setParams({ chapter: String(safeIndex + 1) });
  }, [router, safeIndex, chapters.length]);

  const goToPrevChapter = useCallback(() => {
    if (safeIndex <= 0) return;
    setPendingSlide({ direction: -1, toIndex: safeIndex - 1 });
    router.setParams({ chapter: String(safeIndex - 1) });
  }, [router, safeIndex]);

  const onScrollEndDrag = useCallback(() => {
    if (dragStartedAtEnd.current && lastFraction.current >= END_OF_CHAPTER_FRACTION) goToNextChapter();
    else if (dragStartedAtStart.current && lastFraction.current <= START_OF_CHAPTER_FRACTION) goToPrevChapter();
    dragStartedAtEnd.current = false;
    dragStartedAtStart.current = false;
  }, [goToNextChapter, goToPrevChapter]);

  // The incoming chapter slides in from the edge it was pulled from: from below when advancing, from
  // above when going back. A layout effect positions it off-screen before the frame paints; matching
  // on the target index means jump navigations (scrubber, contents list) never replay the slide.
  useLayoutEffect(() => {
    if (pendingSlide.direction === 0 || pendingSlide.toIndex !== safeIndex) return;
    slideY.setValue(pendingSlide.direction * windowHeight);
    Animated.timing(slideY, { toValue: 0, duration: SLIDE_DURATION_MS, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [pendingSlide, safeIndex, slideY, windowHeight]);

  // Jump chapters from the sheet's scrubber without dismissing the sheet, so scrubbing stays fluid.
  const seekChapter = useCallback(
    (index: number) => {
      setPendingSlide(NO_SLIDE);
      router.setParams({ chapter: String(clampIndex(index, chapters.length)) });
    },
    [router, chapters.length],
  );

  const selectChapter = useCallback(
    (index: number) => {
      setPendingSlide(NO_SLIDE);
      setOptionsVisible(false);
      router.setParams({ chapter: String(index) });
    },
    [router],
  );

  const goToLibrary = useCallback(() => router.navigate('/'), [router]);
  const openAbout = useCallback(() => {
    setOptionsVisible(false);
    router.push({ pathname: '/novel/[id]', params: { id } });
  }, [router, id]);
  // A gesture-handler tap (not a Pressable) so the chapter body is not marked an Android "clickable"
  // node — that would collapse every paragraph into one accessibility announcement. When a chapter
  // fits on one screen the ScrollView never sees drags, so a pan stands in for the edge pulls there;
  // on scrollable chapters it stays disabled and the scroll drag handlers own pull detection.
  const contentGesture = useMemo(() => {
    const tap = Gesture.Tap().runOnJS(true).maxDistance(TAP_MAX_DISTANCE).onEnd(() => setOptionsVisible((visible) => !visible));
    const pull = Gesture.Pan().enabled(!scrollable).runOnJS(true).onEnd((event) => {
      if (event.translationY > PULL_DISTANCE) goToPrevChapter();
      else if (event.translationY < -PULL_DISTANCE) goToNextChapter();
    });
    return Gesture.Race(pull, tap);
  }, [scrollable, goToPrevChapter, goToNextChapter]);
  const closeOptions = useCallback(() => setOptionsVisible(false), []);

  const ready = novel !== null && activeChapter !== null;

  return {
    status: ready ? 'ready' : 'notFound',
    novelId: ready ? id : '',
    novelTitle: novel?.title ?? '',
    coverUri: novel !== null && novel.coverPath !== undefined ? libraryService.assetUri(novel.id, novel.coverPath) : null,
    chapterTitle: activeChapter?.title ?? '',
    chapterPath,
    textBlocks,
    chapterImages,
    galleryScenes,
    characterImages,
    chapters,
    currentIndex: safeIndex,
    isFirst: safeIndex <= 0,
    isLast: !ready || safeIndex >= chapters.length - 1,
    nextTitle: chapters[safeIndex + 1]?.title ?? null,
    topInset: insets.top,
    bottomInset: insets.bottom,
    progressPercent,
    onScroll,
    onScrollBeginDrag,
    onScrollEndDrag,
    onContentSizeChange,
    onLayout,
    goToPrevChapter,
    goToNextChapter,
    seekChapter,
    selectChapter,
    goToLibrary,
    openAbout,
    slideY,
    palette: readingColors[theme],
    fontScale,
    fontFamily,
    theme,
    brightnessValue: brightness >= 0 ? brightness : systemBrightness,
    setBrightness,
    optionsVisible,
    contentGesture,
    closeOptions,
    activeTab,
    setActiveTab,
    setFontScale,
    setTheme,
    setFontFamily,
  };
}

function bookPercent(chapterIndex: number, fraction: number, total: number): number {
  return Math.round(((chapterIndex + fraction) / Math.max(1, total)) * 100);
}

function clampIndex(value: number, length: number): number {
  if (!Number.isFinite(value) || length === 0) return 0;
  return Math.min(Math.max(0, Math.trunc(value)), length - 1);
}

function loadBlocks(novelId: string | undefined, chapterPath: string): ReaderBlock[] {
  if (novelId === undefined || chapterPath.length === 0) return [];
  try {
    return parseMarkdown(libraryService.chapterText(novelId, chapterPath));
  } catch {
    return [];
  }
}
