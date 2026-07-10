/**
 * Importing npm packages
 */
import { Animated, StyleSheet, Text, View } from 'react-native';

/**
 * Importing user defined packages
 */
import { Icon } from '@/components/icon';
import { content } from '@/core/content';
import type { ReadingPalette } from '@/core/theme';
import type { PullDirection } from '@/screens/reader/hooks/useReaderScreen';

/**
 * Defining types
 */

type PullIndicatorProps = {
  dir: PullDirection;
  armed: boolean;
  pull: Animated.Value;
  palette: ReadingPalette;
  topInset: number;
  bottomInset: number;
};

/**
 * Declaring the constants
 */

// Pull distance (dp) over which the indicator fades fully in — close to the ~2 cm turn threshold.
const RAMP = 110;

// The overscroll affordance that surfaces while the reader drags past an edge: it fades in with the
// pull and, once armed, flips to an arrow and the accent colour to signal a release will turn the page.
export function PullIndicator({ dir, armed, pull, palette, topInset, bottomInset }: PullIndicatorProps) {
  if (dir === 0) return null;

  const styles = createStyles(palette, topInset, bottomInset);
  const next = dir === 1;
  const opacity = pull.interpolate(
    next ? { inputRange: [-RAMP, -8, 0], outputRange: [1, 0.15, 0], extrapolate: 'clamp' } : { inputRange: [0, 8, RAMP], outputRange: [0, 0.15, 1], extrapolate: 'clamp' },
  );
  const icon = armed ? (next ? 'arrow-up' : 'arrow-down') : next ? 'chevron-up' : 'chevron-down';
  const label = next ? (armed ? content.reader.pull.releaseNext : content.reader.pull.next) : armed ? content.reader.pull.releasePrev : content.reader.pull.prev;

  return (
    <Animated.View pointerEvents="none" style={[styles.wrap, next ? styles.bottom : styles.top, { opacity }]}>
      <View style={[styles.pill, armed && styles.pillArmed]}>
        <Icon name={icon} size={18} color={armed ? palette.accent : palette.textSecondary} />
        <Text style={[styles.label, armed && styles.labelArmed]}>{label}</Text>
      </View>
    </Animated.View>
  );
}

function createStyles(palette: ReadingPalette, topInset: number, bottomInset: number) {
  return StyleSheet.create({
    wrap: {
      position: 'absolute',
      left: 0,
      right: 0,
      alignItems: 'center',
    },
    top: {
      top: topInset + 12,
    },
    bottom: {
      bottom: bottomInset + 28,
    },
    pill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 999,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.border,
      backgroundColor: palette.sheetWell,
    },
    pillArmed: {
      borderColor: palette.accent,
    },
    label: {
      fontFamily: 'Inter_500Medium',
      fontSize: 13,
      color: palette.textSecondary,
    },
    labelArmed: {
      color: palette.accent,
    },
  });
}
