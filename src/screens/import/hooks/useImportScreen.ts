/**
 * Importing npm packages
 */
import { useRouter } from 'expo-router';
import { useState } from 'react';

/**
 * Importing user defined packages
 */
import { useLibraryStore } from '@/stores/use-library-store';

/**
 * Defining types
 */

export type ImportStage = { status: 'idle' } | { status: 'importing' } | { status: 'error'; message: string };

export type ImportScreenModel = {
  stage: ImportStage;
  browse: () => void;
  reset: () => void;
  close: () => void;
};

/**
 * Declaring the constants
 */

export function useImportScreen(): ImportScreenModel {
  const router = useRouter();
  const importNovel = useLibraryStore((state) => state.importNovel);
  const [stage, setStage] = useState<ImportStage>({ status: 'idle' });

  const browse = async () => {
    setStage({ status: 'importing' });
    const result = await importNovel();
    if (result.status === 'imported') router.replace({ pathname: '/novel/[id]', params: { id: result.novel.id } });
    else if (result.status === 'error') setStage({ status: 'error', message: result.message });
    else setStage({ status: 'idle' });
  };

  return {
    stage,
    browse,
    reset: () => setStage({ status: 'idle' }),
    close: () => router.back(),
  };
}
