/**
 * Importing npm packages
 */
import { Feather } from '@expo/vector-icons';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { Lora_400Regular, Lora_600SemiBold } from '@expo-google-fonts/lora';
import { Roboto_400Regular, Roboto_500Medium, Roboto_700Bold } from '@expo-google-fonts/roboto';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

/**
 * Importing user defined packages
 */
import { useAppSettingsStore } from '@/stores/use-app-settings-store';
import { useLibraryStore } from '@/stores/use-library-store';
import { useReaderSettingsStore } from '@/stores/use-reader-settings-store';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

// Stores hydrate at module load — before React renders — because Zustand set() notifies subscribers,
// which React forbids while components are still rendering or not yet mounted. Reads are synchronous.
const storesHydrated = hydrateStores();

// Loads the reader's selectable Google Fonts and releases the splash screen once everything is ready.
export function useAppBootstrap(): boolean {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Roboto_400Regular,
    Roboto_500Medium,
    Roboto_700Bold,
    Lora_400Regular,
    Lora_600SemiBold,
    ...Feather.font,
  });
  const ready = storesHydrated && fontsLoaded;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => undefined);
  }, [ready]);

  return ready;
}

function hydrateStores(): boolean {
  useLibraryStore.getState().hydrate();
  useReaderSettingsStore.getState().hydrate();
  useAppSettingsStore.getState().hydrate();
  return true;
}
