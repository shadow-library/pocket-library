/**
 * Importing npm packages
 */
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo } from 'react';
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

export type LibraryScreenModel = {
  novels: Novel[];
  continueNovel: Novel | null;
  importing: boolean;
  onImport: () => void;
  openNovel: (id: string) => void;
  continueReading: (novel: Novel) => void;
  confirmRemove: (novel: Novel) => void;
};

/**
 * Declaring the constants
 */

export function useLibraryScreen(): LibraryScreenModel {
  const router = useRouter();
  const novels = useLibraryStore((state) => state.novels);
  const lastReadNovelId = useLibraryStore((state) => state.lastReadNovelId);
  const importing = useLibraryStore((state) => state.importing);
  const importError = useLibraryStore((state) => state.importError);
  const importNovel = useLibraryStore((state) => state.importNovel);
  const removeNovel = useLibraryStore((state) => state.removeNovel);
  const clearImportError = useLibraryStore((state) => state.clearImportError);

  const continueNovel = useMemo(() => novels.find((novel) => novel.id === lastReadNovelId) ?? null, [novels, lastReadNovelId]);

  useEffect(() => {
    if (importError === null) return;
    Alert.alert(content.library.importCta, importError);
    clearImportError();
  }, [importError, clearImportError]);

  const openNovel = useCallback((id: string) => router.push({ pathname: '/novel/[id]', params: { id } }), [router]);

  const continueReading = useCallback(
    (novel: Novel) => router.push({ pathname: '/reader/[id]', params: { id: novel.id, chapter: String(novel.progress?.chapterIndex ?? 0) } }),
    [router],
  );

  const onImport = useCallback(async () => {
    const result = await importNovel();
    if (result.status === 'imported') router.push({ pathname: '/novel/[id]', params: { id: result.novel.id } });
  }, [importNovel, router]);

  const confirmRemove = useCallback(
    (novel: Novel) => {
      Alert.alert(content.library.removeConfirm.title, content.library.removeConfirm.body, [
        { text: content.library.removeConfirm.cancel, style: 'cancel' },
        { text: content.library.removeConfirm.confirm, style: 'destructive', onPress: () => removeNovel(novel.id) },
      ]);
    },
    [removeNovel],
  );

  return { novels, continueNovel, importing, onImport, openNovel, continueReading, confirmRemove };
}
