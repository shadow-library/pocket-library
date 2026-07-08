/**
 * Importing npm packages
 */
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';

/**
 * Importing user defined packages
 */
import { useLibraryStore } from '@/stores/use-library-store';
import { useReaderSettingsStore } from '@/stores/use-reader-settings-store';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

// Hydrates the persisted library and reader settings from disk during the first render (store reads
// are synchronous), so the UI paints already populated, then releases the splash screen.
export function useAppBootstrap(): boolean {
  const [ready] = useState(hydrateStores);

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => undefined);
  }, []);

  return ready;
}

function hydrateStores(): boolean {
  useLibraryStore.getState().hydrate();
  useReaderSettingsStore.getState().hydrate();
  return true;
}
