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
import { AppSplash } from '@/components/app-splash';
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

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <ThemeProvider value={scheme === 'dark' ? DarkTheme : DefaultTheme}>
          <StatusBar style="auto" />
          {ready ? (
            <Stack screenOptions={SCREEN_OPTIONS}>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="novel/[id]" options={{ headerShown: false }} />
              <Stack.Screen name="reader/[id]" options={{ headerShown: false }} />
              <Stack.Screen name="import" options={{ headerShown: false }} />
              <Stack.Screen name="about" options={{ headerShown: false }} />
            </Stack>
          ) : (
            <AppSplash />
          )}
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
