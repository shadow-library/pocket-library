/**
 * Importing npm packages
 */
import { useState } from 'react';
import { type LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

/**
 * Importing user defined packages
 */

/**
 * Defining types
 */

type SliderProps = {
  value: number;
  onChange: (value: number) => void;
  steps?: number;
  trackColor: string;
  fillColor: string;
  thumbColor: string;
  thumbBorderColor: string;
  accessibilityLabel: string;
};

/**
 * Declaring the constants
 */

const TRACK_HEIGHT = 5;
const THUMB_SIZE = 22;

// A horizontal 0..1 slider styled after the design's sheet sliders (thin track, ringed thumb). When
// `steps` is given, drag positions snap to that many values, and a change only fires when the snapped
// value moves away from the controlled `value`, so callers are not flooded per frame.
export function Slider({ value, onChange, steps, trackColor, fillColor, thumbColor, thumbBorderColor, accessibilityLabel }: SliderProps) {
  const [width, setWidth] = useState(0);

  const emit = (x: number) => {
    if (width <= 0) return;
    let fraction = Math.min(1, Math.max(0, x / width));
    if (steps !== undefined && steps > 1) fraction = Math.round(fraction * (steps - 1)) / (steps - 1);
    if (Math.abs(fraction - value) < 0.001) return;
    onChange(fraction);
  };

  const pan = Gesture.Pan().runOnJS(true).activeOffsetX([-6, 6]).failOffsetY([-12, 12]).onUpdate((event) => emit(event.x));
  const tap = Gesture.Tap().runOnJS(true).onEnd((event) => emit(event.x));
  const onLayout = (event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width);
  const fraction = Math.min(1, Math.max(0, value));

  return (
    <GestureDetector gesture={Gesture.Race(pan, tap)}>
      <View style={styles.hit} onLayout={onLayout} accessibilityRole="adjustable" accessibilityLabel={accessibilityLabel} accessibilityValue={{ min: 0, max: 100, now: Math.round(fraction * 100) }}>
        <View style={[styles.track, { backgroundColor: trackColor }]} />
        <View style={[styles.fill, { backgroundColor: fillColor, width: fraction * width }]} />
        <View style={[styles.thumb, { backgroundColor: thumbColor, borderColor: thumbBorderColor, left: fraction * width - THUMB_SIZE / 2 }]} />
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  hit: {
    flex: 1,
    height: 44,
    justifyContent: 'center',
  },
  track: {
    height: TRACK_HEIGHT,
    borderRadius: 999,
  },
  fill: {
    position: 'absolute',
    left: 0,
    height: TRACK_HEIGHT,
    borderRadius: 999,
  },
  thumb: {
    position: 'absolute',
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    borderWidth: 2,
  },
});
