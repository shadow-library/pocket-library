/**
 * Importing npm packages
 */
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

/**
 * Importing user defined packages
 */
import { useAppBootstrap } from '@/hooks/use-app-bootstrap';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

const SCREEN_OPTIONS = { headerShadowVisible: false } as const;

SplashScreen.preventAutoHideAsync().catch(() => undefined);

export default function RootLayout() {
  const scheme = useColorScheme();
  const ready = useAppBootstrap();

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <ThemeProvider value={scheme === 'dark' ? DarkTheme : DefaultTheme}>
          <StatusBar style="auto" />
          <Stack screenOptions={SCREEN_OPTIONS}>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="novel/[id]" options={{ headerTitle: '', headerBackButtonDisplayMode: 'minimal' }} />
            <Stack.Screen name="reader/[id]" />
          </Stack>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
