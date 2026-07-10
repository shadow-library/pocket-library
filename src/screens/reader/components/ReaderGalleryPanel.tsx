/**
 * Importing npm packages
 */
import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

/**
 * Importing user defined packages
 */
import { FullScreenImageViewer } from '@/components/image-viewer';
import { content } from '@/core/content';
import { spacing, type ReadingPalette } from '@/core/theme';
import type { ReaderImageAsset } from '@/screens/reader/reader.helpers';

/**
 * Defining types
 */

type ReaderGalleryPanelProps = {
  palette: ReadingPalette;
  characters: ReaderImageAsset[];
  images: ReaderImageAsset[];
  scenes: ReaderImageAsset[];
};

type GallerySectionProps = {
  heading: string;
  assets: ReaderImageAsset[];
  baseIndex: number;
  onSelect: (index: number) => void;
  styles: ReturnType<typeof createStyles>;
};

/**
 * Declaring the constants
 */

const THUMB_SIZE = 64;

// The sheet's Gallery tab: round thumbnails with the current chapter's images first (inline images
// plus scenes), followed by the novel's character portraits.
export function ReaderGalleryPanel({ palette, characters, images, scenes }: ReaderGalleryPanelProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const styles = createStyles(palette);
  const chapterAssets = [...images, ...scenes];
  // One combined gallery (chapter images first, then character portraits) so a swipe pages through
  // every image in the tab regardless of which section the reader opened from.
  const gallery = [...chapterAssets, ...characters];

  if (gallery.length === 0) return <Text style={styles.empty}>{content.reader.gallery.empty}</Text>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{content.reader.gallery.title}</Text>
        <Text style={styles.hint}>{content.reader.gallery.hint}</Text>
      </View>
      {chapterAssets.length > 0 && <GallerySection heading={content.reader.gallery.thisChapter} assets={chapterAssets} baseIndex={0} onSelect={setSelected} styles={styles} />}
      {characters.length > 0 && (
        <GallerySection heading={content.reader.gallery.charactersHeading} assets={characters} baseIndex={chapterAssets.length} onSelect={setSelected} styles={styles} />
      )}
      <FullScreenImageViewer images={gallery} startIndex={selected} onClose={() => setSelected(null)} />
    </View>
  );
}

function GallerySection({ heading, assets, baseIndex, onSelect, styles }: GallerySectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{heading}</Text>
      <View style={styles.grid}>
        {assets.map((asset, index) => (
          <Pressable
            key={`${asset.uri}-${index}`}
            accessibilityRole="button"
            accessibilityLabel={asset.label.length > 0 ? asset.label : heading}
            onPress={() => onSelect(baseIndex + index)}
            style={({ pressed }) => [styles.item, pressed && styles.pressed]}>
            <Image source={{ uri: asset.uri }} style={styles.thumb} contentFit="cover" transition={150} />
            {asset.label.length > 0 && (
              <Text style={styles.itemLabel} numberOfLines={1}>
                {asset.label}
              </Text>
            )}
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function createStyles(palette: ReadingPalette) {
  return StyleSheet.create({
    container: {
      gap: spacing.lg,
    },
    empty: {
      fontFamily: 'Inter_400Regular',
      fontSize: 14,
      color: palette.textSecondary,
      paddingVertical: spacing.lg,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.md,
    },
    title: {
      fontFamily: 'Inter_700Bold',
      fontSize: 17,
      color: palette.text,
    },
    hint: {
      fontFamily: 'Inter_400Regular',
      fontSize: 12.5,
      color: palette.pct,
    },
    section: {
      gap: spacing.sm,
    },
    sectionLabel: {
      fontFamily: 'Inter_700Bold',
      fontSize: 11,
      letterSpacing: 0.88,
      textTransform: 'uppercase',
      color: palette.pct,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.md,
    },
    item: {
      width: THUMB_SIZE + spacing.sm,
      alignItems: 'center',
      gap: spacing.xs,
    },
    thumb: {
      width: THUMB_SIZE,
      height: THUMB_SIZE,
      borderRadius: THUMB_SIZE / 2,
      backgroundColor: palette.sheetWell,
    },
    itemLabel: {
      fontFamily: 'Inter_400Regular',
      fontSize: 10,
      color: palette.pct,
      textAlign: 'center',
    },
    pressed: {
      opacity: 0.6,
    },
  });
}
