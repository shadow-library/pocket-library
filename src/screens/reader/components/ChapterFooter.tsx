/**
 * Importing npm packages
 */
import { Pressable, StyleSheet, Text, View } from 'react-native';

/**
 * Importing user defined packages
 */
import { content } from '@/core/content';
import type { ReadingPalette } from '@/core/theme';

/**
 * Defining types
 */

type ChapterFooterProps = {
  isLast: boolean;
  onBackToLibrary: () => void;
  palette: ReadingPalette;
};

/**
 * Declaring the constants
 */

// Non-final chapters advance by pulling up past the end, so instead of a button they show a light hint;
// only the last chapter shows the finished footer with a way back to the library.
export function ChapterFooter({ isLast, onBackToLibrary, palette }: ChapterFooterProps) {
  const styles = createStyles(palette);

  if (!isLast) {
    return (
      <View style={styles.hintContainer}>
        <Text style={styles.hint}>{content.reader.pull.hint}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.divider} />
      <Text style={styles.finishedTitle}>{content.reader.finishedTitle}</Text>
      <Text style={styles.finishedBody}>{content.reader.finishedBody}</Text>
      <Pressable accessibilityRole="button" onPress={onBackToLibrary} style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
        <Text style={styles.buttonLabel}>{content.reader.backToLibrary}</Text>
      </Pressable>
    </View>
  );
}

function createStyles(palette: ReadingPalette) {
  return StyleSheet.create({
    container: {
      gap: 16,
      alignItems: 'center',
      paddingTop: 24,
    },
    hintContainer: {
      alignItems: 'center',
      paddingTop: 32,
    },
    hint: {
      fontFamily: 'Inter_400Regular',
      fontSize: 13,
      color: palette.pct,
      textAlign: 'center',
    },
    divider: {
      height: StyleSheet.hairlineWidth,
      width: '100%',
      backgroundColor: palette.border,
    },
    button: {
      minHeight: 48,
      alignSelf: 'stretch',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 12,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.border,
    },
    pressed: {
      opacity: 0.6,
    },
    buttonLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: palette.link,
    },
    finishedTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: palette.text,
      textAlign: 'center',
    },
    finishedBody: {
      fontSize: 15,
      lineHeight: 22,
      color: palette.textSecondary,
      textAlign: 'center',
    },
  });
}
