/**
 * Importing npm packages
 */
import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

/**
 * Importing user defined packages
 */
import { FullScreenImageViewer, type ViewerImage } from '@/components/image-viewer';
import { VariantCountBadge } from '@/components/variant-count-badge';
import { content } from '@/core/content';
import { libraryService } from '@/core/services/library.service';
import type { AppTheme } from '@/core/theme';
import type { Character } from '@/core/types/novel.types';
import { useTheme } from '@/hooks/use-theme';

/**
 * Defining types
 */

type CharacterStripProps = {
  novelId: string;
  characters: Character[];
};

/**
 * Declaring the constants
 */

const AVATAR_SIZE = 72;

export function CharacterStrip({ novelId, characters }: CharacterStripProps) {
  const theme = useTheme();
  const styles = createStyles(theme);
  // Where the viewer opens in the flat all-characters image list; null keeps it closed.
  const [startIndex, setStartIndex] = useState<number | null>(null);

  // Every character's portrait + variants concatenated into one swipe set, so the viewer can move
  // across characters and their outfits alike. Each character records where its images begin.
  const perCharacter = characters.map((character) => libraryService.characterImages(novelId, character));
  const allImages: ViewerImage[] = perCharacter.flat();
  const startByCharacter = perCharacter.map((images, index) => (images.length === 0 ? -1 : perCharacter.slice(0, index).reduce((sum, prior) => sum + prior.length, 0)));

  return (
    <View style={styles.section}>
      <Text style={styles.heading}>{content.novel.charactersHeading}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.strip}>
        {characters.map((character, index) => {
          const images = perCharacter[index];
          return (
            <Pressable
              key={`${character.name}-${index}`}
              style={({ pressed }) => [styles.item, pressed && images.length > 0 && styles.itemPressed]}
              disabled={images.length === 0}
              accessibilityRole="button"
              accessibilityLabel={character.name}
              onPress={() => setStartIndex(startByCharacter[index])}>
              <View style={styles.avatarWrap}>
                {images.length > 0 ? (
                  <Image source={{ uri: images[0].uri }} style={styles.avatar} contentFit="cover" transition={150} />
                ) : (
                  <View style={styles.avatarFallback}>
                    <Text style={styles.avatarInitial}>{character.name.charAt(0).toUpperCase()}</Text>
                  </View>
                )}
                <VariantCountBadge count={images.length - 1} />
              </View>
              <Text style={styles.name} numberOfLines={1}>
                {character.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
      <FullScreenImageViewer images={allImages} startIndex={startIndex} onClose={() => setStartIndex(null)} />
    </View>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    section: {
      gap: theme.spacing.md,
    },
    heading: {
      ...theme.type.heading,
      color: theme.colors.text,
    },
    strip: {
      gap: theme.spacing.lg,
      paddingRight: theme.spacing.xl,
    },
    item: {
      alignItems: 'center',
      gap: theme.spacing.xs,
      width: AVATAR_SIZE,
    },
    itemPressed: {
      opacity: 0.6,
    },
    avatarWrap: {
      width: AVATAR_SIZE,
      height: AVATAR_SIZE,
    },
    avatar: {
      width: AVATAR_SIZE,
      height: AVATAR_SIZE,
      borderRadius: theme.radii.pill,
      backgroundColor: theme.colors.surface,
    },
    avatarFallback: {
      width: AVATAR_SIZE,
      height: AVATAR_SIZE,
      borderRadius: theme.radii.pill,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
    },
    avatarInitial: {
      ...theme.type.heading,
      color: theme.colors.textMuted,
    },
    name: {
      ...theme.type.caption,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
  });
}
