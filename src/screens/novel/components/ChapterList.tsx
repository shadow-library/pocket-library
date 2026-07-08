/**
 * Importing npm packages
 */
import { Pressable, StyleSheet, Text, View } from 'react-native';

/**
 * Importing user defined packages
 */
import { content } from '@/core/content';
import type { AppTheme } from '@/core/theme';
import type { Chapter } from '@/core/types/novel.types';
import { useTheme } from '@/hooks/use-theme';

/**
 * Defining types
 */

type ChapterListProps = {
  chapters: Chapter[];
  currentIndex: number | null;
  onSelect: (index: number) => void;
};

/**
 * Declaring the constants
 */

export function ChapterList({ chapters, currentIndex, onSelect }: ChapterListProps) {
  const theme = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.section}>
      <Text style={styles.heading}>{content.novel.chaptersHeading}</Text>
      <View style={styles.list}>
        {chapters.map((chapter, index) => {
          const active = index === currentIndex;
          return (
            <Pressable
              key={`${chapter.path}-${index}`}
              accessibilityRole="button"
              accessibilityLabel={chapter.title}
              onPress={() => onSelect(index)}
              style={({ pressed }) => [styles.row, active && styles.rowActive, pressed && styles.pressed]}>
              <Text style={[styles.number, active && styles.numberActive]}>{index + 1}</Text>
              <Text style={[styles.title, active && styles.titleActive]} numberOfLines={2}>
                {chapter.title}
              </Text>
            </Pressable>
          );
        })}
      </View>
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
    list: {
      borderRadius: theme.radii.lg,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
      overflow: 'hidden',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      minHeight: 52,
    },
    rowActive: {
      backgroundColor: theme.colors.surface,
    },
    pressed: {
      opacity: 0.6,
    },
    number: {
      ...theme.type.label,
      color: theme.colors.textMuted,
      minWidth: 24,
      textAlign: 'center',
    },
    numberActive: {
      color: theme.colors.accent,
    },
    title: {
      ...theme.type.body,
      color: theme.colors.text,
      flex: 1,
    },
    titleActive: {
      color: theme.colors.accent,
    },
  });
}
