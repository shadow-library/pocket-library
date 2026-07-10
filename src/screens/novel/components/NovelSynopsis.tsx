/**
 * Importing npm packages
 */
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

/**
 * Importing user defined packages
 */
import { content } from '@/core/content';
import type { AppTheme } from '@/core/theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * Defining types
 */

type NovelSynopsisProps = {
  text: string;
};

/**
 * Declaring the constants
 */

const COLLAPSED_LINES = 4;
const TRUNCATE_AT = 180;

export function NovelSynopsis({ text }: NovelSynopsisProps) {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);
  const styles = createStyles(theme);
  const isLong = text.length > TRUNCATE_AT;

  return (
    <View style={styles.container}>
      <Text style={styles.body} numberOfLines={isLong && !expanded ? COLLAPSED_LINES : undefined}>
        {text}
      </Text>
      {isLong && (
        <Pressable accessibilityRole="button" onPress={() => setExpanded((value) => !value)} style={({ pressed }) => [pressed && styles.pressed]}>
          <Text style={styles.toggle}>{expanded ? content.novel.synopsisLess : content.novel.synopsisMore}</Text>
        </Pressable>
      )}
    </View>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    container: {
      gap: theme.spacing.xs,
    },
    body: {
      ...theme.type.body,
      color: theme.colors.textSecondary,
    },
    pressed: {
      opacity: 0.6,
    },
    toggle: {
      ...theme.type.label,
      color: theme.colors.accent,
    },
  });
}
