/**
 * Importing npm packages
 */
import { Feather } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

/**
 * Importing user defined packages
 */
import { content } from '@/core/content';
import { useTheme } from '@/hooks/use-theme';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

export default function TabsLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.accent,
        tabBarInactiveTintColor: theme.colors.textTertiary,
        tabBarStyle: { backgroundColor: theme.colors.surfaceElevated, borderTopColor: theme.colors.border, borderTopWidth: 1 },
        tabBarLabelStyle: { fontFamily: 'Inter_500Medium', fontSize: 11 },
        sceneStyle: { backgroundColor: theme.colors.background },
      }}>
      <Tabs.Screen name="index" options={{ title: content.tabs.library, tabBarIcon: ({ color, size }) => <Feather name="book-open" color={color} size={size} /> }} />
      <Tabs.Screen name="recent" options={{ title: content.tabs.recent, tabBarIcon: ({ color, size }) => <Feather name="clock" color={color} size={size} /> }} />
      <Tabs.Screen name="settings" options={{ title: content.tabs.settings, tabBarIcon: ({ color, size }) => <Feather name="settings" color={color} size={size} /> }} />
    </Tabs>
  );
}
