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
import { VariantCountBadge } from '@/components/variant-count-badge';
import { content } from '@/core/content';
import { spacing, type ReadingPalette } from '@/core/theme';
import type { ReaderCharacterGallery, ReaderImageAsset } from '@/screens/reader/reader.helpers';

/**
 * Defining types
 */

type ReaderGalleryPanelProps = {
  palette: ReadingPalette;
  characters: ReaderCharacterGallery[];
  images: ReaderImageAsset[];
  scenes: ReaderImageAsset[];
};

type OpenViewer = { images: ReaderImageAsset[]; startIndex: number };

type GalleryThumbProps = {
  uri: string;
  label: string;
  accessibilityLabel: string;
  badgeCount: number;
  onPress: () => void;
  styles: ReturnType<typeof createStyles>;
};

/**
 * Declaring the constants
 */

const THUMB_SIZE = 64;

// The sheet's Gallery tab. The current chapter's images (inline art + scenes) share one swipe set, while
// each character opens its own set — its portrait plus any outfit/scene variants — with a "+N" badge.
export function ReaderGalleryPanel({ palette, characters, images, scenes }: ReaderGalleryPanelProps) {
  const [viewer, setViewer] = useState<OpenViewer | null>(null);
  const styles = createStyles(palette);
  const chapterAssets = [...images, ...scenes];
  // Every character's images concatenated so a swipe crosses characters and their outfits; each avatar
  // opens the flat set at the offset where that character begins.
  const characterImages = characters.flatMap((character) => character.images);
  const characterStart = characters.map((_character, index) => characters.slice(0, index).reduce((sum, prior) => sum + prior.images.length, 0));

  if (chapterAssets.length === 0 && characters.length === 0) return <Text style={styles.empty}>{content.reader.gallery.empty}</Text>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{content.reader.gallery.title}</Text>
        <Text style={styles.hint}>{content.reader.gallery.hint}</Text>
      </View>
      {chapterAssets.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{content.reader.gallery.thisChapter}</Text>
          <View style={styles.grid}>
            {chapterAssets.map((asset, index) => (
              <GalleryThumb
                key={`${asset.uri}-${index}`}
                uri={asset.uri}
                label={asset.label}
                accessibilityLabel={asset.label.length > 0 ? asset.label : content.reader.gallery.thisChapter}
                badgeCount={0}
                onPress={() => setViewer({ images: chapterAssets, startIndex: index })}
                styles={styles}
              />
            ))}
          </View>
        </View>
      )}
      {characters.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{content.reader.gallery.charactersHeading}</Text>
          <View style={styles.grid}>
            {characters.map((character, index) => (
              <GalleryThumb
                key={`${character.name}-${index}`}
                uri={character.avatarUri}
                label={character.name}
                accessibilityLabel={character.name}
                badgeCount={character.images.length - 1}
                onPress={() => setViewer({ images: characterImages, startIndex: characterStart[index] })}
                styles={styles}
              />
            ))}
          </View>
        </View>
      )}
      <FullScreenImageViewer images={viewer?.images ?? []} startIndex={viewer?.startIndex ?? null} onClose={() => setViewer(null)} />
    </View>
  );
}

function GalleryThumb({ uri, label, accessibilityLabel, badgeCount, onPress, styles }: GalleryThumbProps) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel} onPress={onPress} style={({ pressed }) => [styles.item, pressed && styles.pressed]}>
      <View style={styles.thumbWrap}>
        <Image source={{ uri }} style={styles.thumb} contentFit="cover" transition={150} />
        <VariantCountBadge count={badgeCount} />
      </View>
      {label.length > 0 && (
        <Text style={styles.itemLabel} numberOfLines={1}>
          {label}
        </Text>
      )}
    </Pressable>
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
    thumbWrap: {
      width: THUMB_SIZE,
      height: THUMB_SIZE,
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
