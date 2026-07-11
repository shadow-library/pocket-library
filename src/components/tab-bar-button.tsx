/**
 * Importing npm packages
 */
import { type ReactNode, useState } from 'react';
import { type AccessibilityState, Animated, type GestureResponderEvent, Pressable, type StyleProp, StyleSheet, type ViewStyle } from 'react-native';

/**
 * Importing user defined packages
 */

/**
 * Defining types
 */

type TabBarButtonProps = {
  children: ReactNode;
  onPress?: ((event: GestureResponderEvent) => void) | null;
  onLongPress?: ((event: GestureResponderEvent) => void) | null;
  accessibilityState?: AccessibilityState;
  accessibilityLabel?: string;
  testID?: string;
  style?: StyleProp<ViewStyle>;
};

/**
 * Declaring the constants
 */

const PRESSED_SCALE = 0.85;

// Replaces the bottom tab bar's default button so the press feels custom rather than the stock Android
// ripple: a plain Pressable (no ripple) with a quick spring scale on the icon + label.
export function TabBarButton({ children, onPress, onLongPress, accessibilityState, accessibilityLabel, testID, style }: TabBarButtonProps) {
  const [scale] = useState(() => new Animated.Value(1));

  const spring = (toValue: number) => Animated.spring(scale, { toValue, useNativeDriver: true, speed: 40, bounciness: 6 }).start();

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={() => spring(PRESSED_SCALE)}
      onPressOut={() => spring(1)}
      accessibilityRole="button"
      accessibilityState={accessibilityState}
      accessibilityLabel={accessibilityLabel}
      testID={testID}
      style={[styles.button, style]}>
      <Animated.View style={[styles.content, { transform: [{ scale }] }]}>{children}</Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
