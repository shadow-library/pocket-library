/**
 * Importing npm packages
 */
import { useLocalSearchParams, useRouter } from 'expo-router';
import { type RefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { type LayoutChangeEvent, type NativeScrollEvent, type NativeSyntheticEvent, ScrollView } from 'react-native';

/**
 * Importing user defined packages
 */
import { libraryService } from '@/core/services/library.service';
import { readingProgressService } from '@/core/services/reading-progress.service';
import { readingColors, type ReadingPalette, type ReadingTheme } from '@/core/theme';
import type { Novel } from '@/core/types/novel.types';
import { parseMarkdown, scrollFraction, type ReaderAsset, type ReaderBlock } from '@/screens/reader/reader.helpers';
import { useLibraryStore } from '@/stores/use-library-store';
import { useReaderSettingsStore } from '@/stores/use-reader-settings-store';

/**
 * Defining types
 */

export type ReaderScreenModel = {
  status: 'ready' | 'notFound';
  novelId: string;
  chapterTitle: string;
  chapterPath: string;
  blocks: ReaderBlock[];
  isLast: boolean;
  nextTitle: string | null;
  onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onContentSizeChange: (width: number, height: number) => void;
  onLayout: (event: LayoutChangeEvent) => void;
  goToNextChapter: () => void;
  goToLibrary: () => void;
  palette: ReadingPalette;
  fontScale: number;
  theme: ReadingTheme;
  settingsVisible: boolean;
  openSettings: () => void;
  closeSettings: () => void;
  increaseFont: () => void;
  decreaseFont: () => void;
  setTheme: (theme: ReadingTheme) => void;
  assets: ReaderAsset[];
  assetsVisible: boolean;
  toggleAssets: () => void;
  viewingAsset: ReaderAsset | null;
  openAsset: (asset: ReaderAsset) => void;
  closeAssetView: () => void;
};

/**
 * Declaring the constants
 */

const SAVE_DEBOUNCE_MS = 800;

export function useReaderScreen(scrollView: RefObject<ScrollView | null>): ReaderScreenModel {
  const { id, chapter } = useLocalSearchParams<{ id: string; chapter?: string }>();
  const router = useRouter();
  const novel = useLibraryStore((state) => state.novels.find((item) => item.id === id) ?? null);
  const saveProgress = useLibraryStore((state) => state.saveProgress);
  const fontScale = useReaderSettingsStore((state) => state.fontScale);
  const theme = useReaderSettingsStore((state) => state.theme);
  const setTheme = useReaderSettingsStore((state) => state.setTheme);
  const increaseFont = useReaderSettingsStore((state) => state.increaseFont);
  const decreaseFont = useReaderSettingsStore((state) => state.decreaseFont);

  const [settingsVisible, setSettingsVisible] = useState(false);
  const [assetsVisible, setAssetsVisible] = useState(false);
  const [viewingAsset, setViewingAsset] = useState<ReaderAsset | null>(null);
  const [assetsChapterKey, setAssetsChapterKey] = useState('');

  const contentHeight = useRef(0);
  const layoutHeight = useRef(0);
  const restored = useRef(false);
  const pendingFraction = useRef(0);
  const lastFraction = useRef(0);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const chapters = useMemo(() => novel?.chapters ?? [], [novel]);
  const safeIndex = clampIndex(Number(chapter ?? 0), chapters.length);
  const activeChapter = chapters[safeIndex] ?? null;
  const chapterPath = activeChapter?.path ?? '';

  // Hides any open asset overlay/viewer when the chapter changes, without an effect — this is React's
  // documented "adjust state during render" escape hatch for resetting state on a prop change.
  if (chapterPath !== assetsChapterKey) {
    setAssetsChapterKey(chapterPath);
    setAssetsVisible(false);
    setViewingAsset(null);
  }

  const blocks = useMemo(() => loadBlocks(id, chapterPath), [id, chapterPath]);
  const assets = useMemo(() => chapterAssets(novel, id, chapterPath), [novel, id, chapterPath]);

  const commitSave = useCallback(() => saveProgress(id, { chapterIndex: safeIndex, scrollFraction: lastFraction.current, updatedAt: Date.now() }), [saveProgress, id, safeIndex]);

  const maybeRestore = useCallback(() => {
    if (restored.current || contentHeight.current === 0 || layoutHeight.current === 0) return;
    const scrollable = contentHeight.current - layoutHeight.current;
    if (scrollable > 0 && pendingFraction.current > 0) scrollView.current?.scrollTo({ y: pendingFraction.current * scrollable, animated: false });
    restored.current = true;
  }, [scrollView]);

  useEffect(() => {
    if (chapterPath.length === 0) return;
    const persisted = readingProgressService.get(id);
    pendingFraction.current = persisted !== null && persisted.chapterIndex === safeIndex ? persisted.scrollFraction : 0;
    lastFraction.current = pendingFraction.current;
    restored.current = false;
    scrollView.current?.scrollTo({ y: 0, animated: false });
    saveProgress(id, { chapterIndex: safeIndex, scrollFraction: pendingFraction.current, updatedAt: Date.now() });
    return () => {
      if (saveTimer.current !== null) clearTimeout(saveTimer.current);
      saveProgress(id, { chapterIndex: safeIndex, scrollFraction: lastFraction.current, updatedAt: Date.now() });
    };
  }, [id, safeIndex, chapterPath, saveProgress, scrollView]);

  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (!restored.current) return;
      const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
      lastFraction.current = scrollFraction(contentOffset.y, contentSize.height, layoutMeasurement.height);
      if (saveTimer.current !== null) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(commitSave, SAVE_DEBOUNCE_MS);
    },
    [commitSave],
  );

  const onContentSizeChange = useCallback(
    (_width: number, height: number) => {
      contentHeight.current = height;
      maybeRestore();
    },
    [maybeRestore],
  );

  const onLayout = useCallback(
    (event: LayoutChangeEvent) => {
      layoutHeight.current = event.nativeEvent.layout.height;
      maybeRestore();
    },
    [maybeRestore],
  );

  const goToNextChapter = useCallback(() => {
    if (safeIndex >= chapters.length - 1) return;
    router.setParams({ chapter: String(safeIndex + 1) });
  }, [router, safeIndex, chapters.length]);

  const goToLibrary = useCallback(() => router.navigate('/'), [router]);
  const openSettings = useCallback(() => setSettingsVisible(true), []);
  const closeSettings = useCallback(() => setSettingsVisible(false), []);
  const toggleAssets = useCallback(() => setAssetsVisible((visible) => !visible), []);
  const openAsset = useCallback((asset: ReaderAsset) => setViewingAsset(asset), []);
  const closeAssetView = useCallback(() => {
    setViewingAsset(null);
    setAssetsVisible(false);
  }, []);

  const ready = novel !== null && activeChapter !== null;

  return {
    status: ready ? 'ready' : 'notFound',
    novelId: ready ? id : '',
    chapterTitle: activeChapter?.title ?? '',
    chapterPath,
    blocks,
    isLast: !ready || safeIndex >= chapters.length - 1,
    nextTitle: chapters[safeIndex + 1]?.title ?? null,
    onScroll,
    onContentSizeChange,
    onLayout,
    goToNextChapter,
    goToLibrary,
    palette: readingColors[theme],
    fontScale,
    theme,
    settingsVisible,
    openSettings,
    closeSettings,
    increaseFont,
    decreaseFont,
    setTheme,
    assets,
    assetsVisible,
    toggleAssets,
    viewingAsset,
    openAsset,
    closeAssetView,
  };
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

// Every character portrait (the cast doesn't change per chapter) plus this chapter's scenes —
// untagged scenes (no `chapterPath`) belong to every chapter, tagged ones only match their own.
function chapterAssets(novel: Novel | null, novelId: string | undefined, chapterPath: string): ReaderAsset[] {
  if (novel === null || novelId === undefined || chapterPath.length === 0) return [];
  const characters: ReaderAsset[] = novel.characters
    .filter((character): character is typeof character & { imagePath: string } => character.imagePath !== undefined)
    .map((character) => ({ uri: libraryService.assetUri(novelId, character.imagePath), label: character.name, kind: 'character' }));
  const scenes: ReaderAsset[] = novel.scenes
    .filter((scene) => scene.chapterPath === undefined || scene.chapterPath === chapterPath)
    .map((scene) => ({ uri: libraryService.assetUri(novelId, scene.imagePath), label: scene.caption ?? '', kind: 'scene' }));
  return [...characters, ...scenes];
}
