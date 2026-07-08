/**
 * Importing npm packages
 */
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { Alert } from 'react-native';

/**
 * Importing user defined packages
 */
import { content } from '@/core/content';
import type { Novel } from '@/core/types/novel.types';
import { useLibraryStore } from '@/stores/use-library-store';

/**
 * Defining types
 */

export type NovelScreenModel = {
  novel: Novel | null;
  hasProgress: boolean;
  openChapter: (index: number) => void;
  startReading: () => void;
  confirmRemove: () => void;
};

/**
 * Declaring the constants
 */

export function useNovelScreen(): NovelScreenModel {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const novel = useLibraryStore((state) => state.novels.find((item) => item.id === id) ?? null);
  const removeNovel = useLibraryStore((state) => state.removeNovel);

  const openChapter = useCallback((index: number) => router.push({ pathname: '/reader/[id]', params: { id, chapter: String(index) } }), [router, id]);

  const startReading = useCallback(() => openChapter(novel?.progress?.chapterIndex ?? 0), [openChapter, novel]);

  const confirmRemove = useCallback(() => {
    Alert.alert(content.library.removeConfirm.title, content.library.removeConfirm.body, [
      { text: content.library.removeConfirm.cancel, style: 'cancel' },
      {
        text: content.library.removeConfirm.confirm,
        style: 'destructive',
        onPress: () => {
          removeNovel(id);
          router.back();
        },
      },
    ]);
  }, [removeNovel, id, router]);

  return { novel, hasProgress: novel?.progress !== undefined, openChapter, startReading, confirmRemove };
}
