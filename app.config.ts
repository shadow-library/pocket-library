/**
 * Importing npm packages
 */
import type { ExpoConfig } from 'expo/config';

/**
 * Importing user defined packages
 */

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

// EAS Build sets this automatically per profile; local `expo start`/`expo run:*` leave it unset.
const BUILD_PROFILE = process.env.EAS_BUILD_PROFILE;

const APP_NAME_BY_PROFILE: Record<string, string> = {
  development: 'Pocket Library Dev',
  preview: 'Pocket Library Preview',
};

const appName = APP_NAME_BY_PROFILE[BUILD_PROFILE ?? ''] ?? 'Pocket Library';

const config: ExpoConfig = {
  name: appName,
  slug: 'pocket-library',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'pocketlibrary',
  userInterfaceStyle: 'automatic',
  ios: {
    icon: './assets/images/icon.png',
    bundleIdentifier: 'com.shadowapps.pocketlibrary',
  },
  android: {
    package: 'com.shadowapps.pocketlibrary',
    adaptiveIcon: {
      backgroundColor: '#4338CA',
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
  },
  web: {
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    'expo-font',
    [
      'expo-splash-screen',
      {
        backgroundColor: '#0E0E18',
        image: './assets/images/splash-icon.png',
        imageWidth: 96,
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    router: {},
    eas: {
      projectId: '093b574e-0bca-4942-b87d-d93de73188c3',
    },
  },
  owner: 'shadow-apps',
};

export default config;
