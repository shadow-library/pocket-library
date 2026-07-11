/**
 * Importing npm packages
 */
import { Feather } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Importing user defined packages
 */
import { TabBarButton } from '@/components/tab-bar-button';
import { content } from '@/core/content';
import { useTheme } from '@/hooks/use-theme';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

const TAB_BAR_BASE_HEIGHT = 84;
const TAB_BAR_VERTICAL_PADDING = 16;

export default function TabsLayout() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.accent,
        tabBarInactiveTintColor: theme.colors.textTertiary,
        tabBarStyle: {
          backgroundColor: theme.colors.surfaceElevated,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          height: TAB_BAR_BASE_HEIGHT + insets.bottom,
          paddingTop: TAB_BAR_VERTICAL_PADDING,
          paddingBottom: TAB_BAR_VERTICAL_PADDING + insets.bottom,
        },
        tabBarIconStyle: { marginBottom: 4 },
        tabBarLabelStyle: { fontFamily: 'Inter_500Medium', fontSize: 11 },
        tabBarButton: (props) => <TabBarButton {...props} />,
        sceneStyle: { backgroundColor: theme.colors.background },
      }}>
      <Tabs.Screen name="index" options={{ title: content.tabs.library, tabBarIcon: ({ color, size }) => <Feather name="book-open" color={color} size={size} /> }} />
      <Tabs.Screen name="recent" options={{ title: content.tabs.recent, tabBarIcon: ({ color, size }) => <Feather name="clock" color={color} size={size} /> }} />
      <Tabs.Screen name="settings" options={{ title: content.tabs.settings, tabBarIcon: ({ color, size }) => <Feather name="settings" color={color} size={size} /> }} />
    </Tabs>
  );
}
