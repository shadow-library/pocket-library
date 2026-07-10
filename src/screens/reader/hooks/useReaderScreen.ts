/**
 * Importing npm packages
 */
import * as Brightness from 'expo-brightness';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { type RefObject, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, type LayoutChangeEvent, type NativeScrollEvent, type NativeSyntheticEvent, ScrollView, useWindowDimensions } from 'react-native';
import { Gesture, type GestureUpdateEvent, type PanGestureHandlerEventPayload } from 'react-native-gesture-handler';
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
import { parseMarkdown, partitionBlocks, scrollFraction, type ReaderBlock, type ReaderCharacterGallery, type ReaderImageAsset } from '@/screens/reader/reader.helpers';
import { useVolumeChapterNav } from '@/screens/reader/hooks/useVolumeChapterNav';
import { useAppSettingsStore } from '@/stores/use-app-settings-store';
import { useLibraryStore } from '@/stores/use-library-store';
import { useReaderSettingsStore } from '@/stores/use-reader-settings-store';

/**
 * Defining types
 */

export type ReaderTab = 'contents' | 'display' | 'gallery';

// -1 pulls down at the top toward the previous chapter, 1 pulls up at the end toward the next, 0 idle.
export type PullDirection = -1 | 0 | 1;

type PendingSlide = { direction: -1 | 0 | 1; toIndex: number };

type PullEngage = { dir: -1 | 1; base: number; armed: boolean };

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
  characterGalleries: ReaderCharacterGallery[];
  chapters: Chapter[];
  currentIndex: number;
  isFirst: boolean;
  isLast: boolean;
  topInset: number;
  bottomInset: number;
  progressPercent: number;
  onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onContentSizeChange: (width: number, height: number) => void;
  onLayout: (event: LayoutChangeEvent) => void;
  goToPrevChapter: () => void;
  goToNextChapter: () => void;
  seekChapter: (index: number) => void;
  selectChapter: (index: number) => void;
  goToLibrary: () => void;
  openAbout: () => void;
  slideY: Animated.Value;
  pullY: Animated.Value;
  pullDir: PullDirection;
  pullArmed: boolean;
  palette: ReadingPalette;
  fontScale: number;
  fontFamily: ReaderFontFamily;
  theme: ReadingTheme;
  brightnessValue: number;
  setBrightness: (brightness: number) => void;
  optionsVisible: boolean;
  contentGesture: ReturnType<typeof Gesture.Race>;
  scrollGesture: ReturnType<typeof Gesture.Native>;
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
// React Native dp are defined at 160 per inch, so a centimetre is ~63 dp regardless of device.
const DP_PER_CM = 160 / 2.54;
// Vertical travel before the pan activates and the engage slop before a pull is recognised.
const PULL_ACTIVATE = 12;
const PULL_ENGAGE_SLOP = 8;
// Pull the page ~2 cm past an edge and release to turn the chapter; anything shorter springs back.
// The page follows the finger 1:1 up to the threshold, then stiffens so crossing it is felt.
const PULL_THRESHOLD = 2 * DP_PER_CM;
const PULL_OVERPULL_RESISTANCE = 0.4;
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
  const [pullY] = useState(() => new Animated.Value(0));
  const [pullDir, setPullDir] = useState<PullDirection>(0);
  const [pullArmed, setPullArmed] = useState(false);
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
  const pullEngage = useRef<PullEngage | null>(null);
  // Edge flags live in refs so the pull gesture can read the latest value without rebuilding — a
  // rebuild mid-drag would reset the in-progress pan and break scroll-then-pull in one motion.
  const atTopRef = useRef(true);
  const atBottomRef = useRef(false);

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
  // Character portraits belong to the whole novel, so the gallery shows them for every chapter. Each
  // character carries its portrait + outfit/scene variants, browsed together in the swipe viewer.
  const characterGalleries = useMemo<ReaderCharacterGallery[]>(() => {
    if (novel === null) return [];
    return novel.characters
      .map((character) => ({ name: character.name, images: libraryService.characterImages(novel.id, character) }))
      .filter((entry) => entry.images.length > 0)
      .map((entry) => ({ name: entry.name, avatarUri: entry.images[0].uri, images: entry.images }));
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
    atTopRef.current = pendingFraction.current <= START_OF_CHAPTER_FRACTION;
    atBottomRef.current = pendingFraction.current >= END_OF_CHAPTER_FRACTION;
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
      atTopRef.current = fraction <= START_OF_CHAPTER_FRACTION;
      atBottomRef.current = fraction >= END_OF_CHAPTER_FRACTION;
      if (saveTimer.current !== null) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(commitSave, SAVE_DEBOUNCE_MS);
    },
    [commitSave, safeIndex, total],
  );

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
  // node — that would collapse every paragraph into one accessibility announcement. The pull runs
  // simultaneously with the scroll (via the native scroll gesture) so it never blocks scrolling; it
  // only engages once the finger drags past an edge, then the page rubber-bands and arms past the
  // threshold.
  const scrollGesture = useMemo(() => Gesture.Native(), []);
  // The pull engagement is per-gesture mutable state held in a ref. RNGH invokes these callbacks from
  // the native gesture stream, never during React render, so reading the ref inside them is safe — but
  // the React Compiler lint rule cannot see that deferral, hence the scoped disable.
  /* eslint-disable react-hooks/refs -- gesture callbacks run outside render; ref access here is safe */
  const contentGesture = useMemo(() => {
    const finishPull = () => {
      const settled = pullEngage.current;
      pullEngage.current = null;
      setPullDir(0);
      setPullArmed(false);
      if (settled !== null && settled.armed) {
        pullY.setValue(0);
        if (settled.dir === 1) goToNextChapter();
        else goToPrevChapter();
        return;
      }
      Animated.spring(pullY, { toValue: 0, useNativeDriver: true, bounciness: 6, speed: 16 }).start();
    };

    const onUpdate = (event: GestureUpdateEvent<PanGestureHandlerEventPayload>) => {
      const dy = event.translationY;
      let active = pullEngage.current;
      if (active === null) {
        if (dy > PULL_ENGAGE_SLOP && (!scrollable || atTopRef.current) && safeIndex > 0) active = { dir: -1, base: dy, armed: false };
        else if (dy < -PULL_ENGAGE_SLOP && (!scrollable || atBottomRef.current) && safeIndex < total - 1) active = { dir: 1, base: dy, armed: false };
        else return;
      }
      // Distance is measured from where the pull first engaged, so it starts at zero on that frame;
      // only a finger that travels back past the engage point (negative) disengages.
      const distance = active.dir === -1 ? dy - active.base : active.base - dy;
      if (distance < 0) {
        pullEngage.current = null;
        pullY.setValue(0);
        setPullDir(0);
        setPullArmed(false);
        return;
      }
      active.armed = distance >= PULL_THRESHOLD;
      pullEngage.current = active;
      pullY.setValue(active.dir === 1 ? -pullTranslate(distance) : pullTranslate(distance));
      setPullDir(active.dir);
      setPullArmed(active.armed);
    };

    const tap = Gesture.Tap().runOnJS(true).maxDistance(TAP_MAX_DISTANCE).onEnd(() => setOptionsVisible((visible) => !visible));
    const pull = Gesture.Pan()
      .runOnJS(true)
      .activeOffsetY([-PULL_ACTIVATE, PULL_ACTIVATE])
      .simultaneousWithExternalGesture(scrollGesture)
      .onBegin(() => {
        pullEngage.current = null;
      })
      .onUpdate(onUpdate)
      .onEnd(finishPull)
      .onFinalize(() => {
        if (pullEngage.current !== null) finishPull();
      });
    return Gesture.Race(pull, tap);
  }, [scrollGesture, scrollable, safeIndex, total, pullY, goToNextChapter, goToPrevChapter]);
  /* eslint-enable react-hooks/refs */
  const closeOptions = useCallback(() => setOptionsVisible(false), []);

  const ready = novel !== null && activeChapter !== null;
  useVolumeChapterNav(ready, goToNextChapter, goToPrevChapter);

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
    characterGalleries,
    chapters,
    currentIndex: safeIndex,
    isFirst: safeIndex <= 0,
    isLast: !ready || safeIndex >= chapters.length - 1,
    topInset: insets.top,
    bottomInset: insets.bottom,
    progressPercent,
    onScroll,
    onContentSizeChange,
    onLayout,
    goToPrevChapter,
    goToNextChapter,
    seekChapter,
    selectChapter,
    goToLibrary,
    openAbout,
    slideY,
    pullY,
    pullDir,
    pullArmed,
    palette: readingColors[theme],
    fontScale,
    fontFamily,
    theme,
    brightnessValue: brightness >= 0 ? brightness : systemBrightness,
    setBrightness,
    optionsVisible,
    contentGesture,
    scrollGesture,
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

// Rubber-band curve: the page tracks the finger 1:1 up to the turn threshold, then follows with heavy
// resistance so an overpull past the threshold is felt without yanking the whole chapter off screen.
function pullTranslate(distance: number): number {
  if (distance <= PULL_THRESHOLD) return distance;
  return PULL_THRESHOLD + (distance - PULL_THRESHOLD) * PULL_OVERPULL_RESISTANCE;
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
