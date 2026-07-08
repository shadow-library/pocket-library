/**
 * Importing npm packages
 */
import { Image } from 'expo-image';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

/**
 * Importing user defined packages
 */
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

  return (
    <View style={styles.section}>
      <Text style={styles.heading}>{content.novel.charactersHeading}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.strip}>
        {characters.map((character, index) => (
          <View key={`${character.name}-${index}`} style={styles.item}>
            {character.imagePath !== undefined ? (
              <Image source={{ uri: libraryService.assetUri(novelId, character.imagePath) }} style={styles.avatar} contentFit="cover" transition={150} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarInitial}>{character.name.charAt(0).toUpperCase()}</Text>
              </View>
            )}
            <Text style={styles.name} numberOfLines={1}>
              {character.name}
            </Text>
          </View>
        ))}
      </ScrollView>
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
