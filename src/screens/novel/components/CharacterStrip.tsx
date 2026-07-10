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
  // The tapped character; its portrait + variants feed the full-screen swipe viewer.
  const [selected, setSelected] = useState<number | null>(null);

  const perCharacter = characters.map((character) => libraryService.characterImages(novelId, character));
  const viewerImages: ViewerImage[] = selected === null ? [] : perCharacter[selected];

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
              onPress={() => setSelected(index)}>
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
      <FullScreenImageViewer images={viewerImages} startIndex={selected === null ? null : 0} onClose={() => setSelected(null)} />
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
