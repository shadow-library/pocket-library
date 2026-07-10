/**
 * Importing npm packages
 */
import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { FlatList, Modal, type NativeScrollEvent, type NativeSyntheticEvent, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { type EdgeInsets, useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Importing user defined packages
 */
import { content } from '@/core/content';
import type { AppTheme } from '@/core/theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * Defining types
 */

export type ViewerImage = { uri: string; label?: string };

type FullScreenImageViewerProps = {
  images: ViewerImage[];
  startIndex: number | null;
  onClose: () => void;
};

/**
 * Declaring the constants
 */

// Vertical room reserved under the image for the label + close hint so they never overlap the photo.
const FOOTER_RESERVED = 72;

// Controlled full-screen image overlay shared by the novel cover, character strip, and reader gallery.
// It opens at `startIndex` (null keeps it closed) and pages horizontally between all `images` so a
// swipe moves to the next or previous one. Content is inset from the status and navigation bars so the
// system chrome stays visible instead of being drawn over.
export function FullScreenImageViewer({ images, startIndex, onClose }: FullScreenImageViewerProps) {
  const view = useFullScreenViewer(startIndex);

  if (startIndex === null || images.length === 0) return null;

  const styles = createStyles(view.theme, view.insets, view.width, view.height);
  const active = images[view.current] ?? images[0];

  return (
    <Modal visible transparent statusBarTranslucent animationType="fade" onRequestClose={onClose}>
      <StatusBar style={view.theme.scheme === 'dark' ? 'light' : 'dark'} />
      <View style={styles.viewer}>
        <FlatList
          data={images}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={startIndex}
          getItemLayout={(_data, index) => ({ length: view.width, offset: view.width * index, index })}
          keyExtractor={(item, index) => `${item.uri}-${index}`}
          onMomentumScrollEnd={view.onMomentumEnd}
          renderItem={({ item }) => (
            <Pressable style={styles.page} onPress={onClose} accessibilityRole="button" accessibilityLabel={item.label ?? content.common.close}>
              <Image source={{ uri: item.uri }} style={styles.image} contentFit="contain" transition={150} />
            </Pressable>
          )}
        />
        <View style={styles.footer} pointerEvents="none">
          {active.label !== undefined && active.label.length > 0 && <Text style={styles.label}>{active.label}</Text>}
          <Text style={styles.hint}>{images.length > 1 ? `${view.current + 1} / ${images.length} · ${content.common.close}` : content.common.close}</Text>
        </View>
      </View>
    </Modal>
  );
}

function useFullScreenViewer(startIndex: number | null) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const [current, setCurrent] = useState(0);
  const [openedAt, setOpenedAt] = useState<number | null>(null);

  // Reset to the tapped image whenever the viewer (re)opens, adjusting state during render rather than
  // in an effect so the first paint already shows the right page.
  if (startIndex !== openedAt) {
    setOpenedAt(startIndex);
    if (startIndex !== null) setCurrent(startIndex);
  }

  const onMomentumEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrent((prev) => (prev === next ? prev : next));
  };

  return { theme, insets, width, height, current, onMomentumEnd };
}

function createStyles(theme: AppTheme, insets: EdgeInsets, width: number, height: number) {
  return StyleSheet.create({
    viewer: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    page: {
      width,
      height,
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: insets.top + theme.spacing.md,
      paddingBottom: insets.bottom + FOOTER_RESERVED,
      paddingHorizontal: theme.spacing.xl,
    },
    image: {
      flex: 1,
      width: '100%',
    },
    footer: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      alignItems: 'center',
      gap: theme.spacing.xs,
      paddingTop: theme.spacing.sm,
      paddingBottom: insets.bottom + theme.spacing.md,
      paddingHorizontal: theme.spacing.xl,
    },
    label: {
      ...theme.type.bodyStrong,
      color: theme.colors.text,
      textAlign: 'center',
    },
    hint: {
      ...theme.type.caption,
      color: theme.colors.textMuted,
      textAlign: 'center',
    },
  });
}
