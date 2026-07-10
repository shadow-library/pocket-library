/**
 * Importing npm packages
 */
import { useRouter } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { Alert } from 'react-native';

/**
 * Importing user defined packages
 */
import { content } from '@/core/content';
import type { Novel } from '@/core/types/novel.types';
import { useAppSettingsStore } from '@/stores/use-app-settings-store';
import { useLibraryStore } from '@/stores/use-library-store';

/**
 * Defining types
 */

export type LibraryScreenModel = {
  novels: Novel[];
  openNovel: (id: string) => void;
  openImport: () => void;
  confirmRemove: (novel: Novel) => void;
};

/**
 * Declaring the constants
 */

function byRecentlyOpened(a: Novel, b: Novel): number {
  const aKey = a.progress?.updatedAt ?? null;
  const bKey = b.progress?.updatedAt ?? null;
  if (aKey !== null && bKey !== null) return bKey - aKey;
  if (aKey !== null) return -1;
  if (bKey !== null) return 1;
  return b.importedAt - a.importedAt;
}

export function useLibraryScreen(): LibraryScreenModel {
  const router = useRouter();
  const novels = useLibraryStore((state) => state.novels);
  const removeNovel = useLibraryStore((state) => state.removeNovel);
  const librarySort = useAppSettingsStore((state) => state.librarySort);

  const sortedNovels = useMemo(() => {
    const list = [...novels];
    return librarySort === 'title' ? list.sort((a, b) => a.title.localeCompare(b.title)) : list.sort(byRecentlyOpened);
  }, [novels, librarySort]);

  const openNovel = useCallback((id: string) => router.push({ pathname: '/novel/[id]', params: { id } }), [router]);
  const openImport = useCallback(() => router.push('/import'), [router]);

  const confirmRemove = useCallback(
    (novel: Novel) => {
      Alert.alert(content.library.removeConfirm.title, content.library.removeConfirm.body, [
        { text: content.library.removeConfirm.cancel, style: 'cancel' },
        { text: content.library.removeConfirm.confirm, style: 'destructive', onPress: () => removeNovel(novel.id) },
      ]);
    },
    [removeNovel],
  );

  return {
    novels: sortedNovels,
    openNovel,
    openImport,
    confirmRemove,
  };
}
