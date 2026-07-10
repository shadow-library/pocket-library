/**
 * Importing npm packages
 */
import { Image } from 'expo-image';
import { Modal, Pressable, StyleSheet, Text } from 'react-native';

/**
 * Importing user defined packages
 */
import { content } from '@/core/content';
import type { AppTheme } from '@/core/theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * Defining types
 */

type FullScreenImageViewerProps = {
  uri: string | null;
  label?: string;
  onClose: () => void;
};

/**
 * Declaring the constants
 */

// Controlled full-screen image overlay: renders when `uri` is set, closes on tap. Shared by the
// novel cover, character strip, and reader chapter gallery so full-screen viewing behaves the same.
export function FullScreenImageViewer({ uri, label, onClose }: FullScreenImageViewerProps) {
  const theme = useTheme();
  const styles = createStyles(theme);

  if (uri === null) return null;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.viewer} onPress={onClose} accessibilityRole="button" accessibilityLabel={content.common.close}>
        <Image source={{ uri }} style={styles.image} contentFit="contain" transition={150} accessibilityLabel={label} />
        {label !== undefined && label.length > 0 && <Text style={styles.label}>{label}</Text>}
        <Text style={styles.hint}>{content.common.close}</Text>
      </Pressable>
    </Modal>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    viewer: {
      flex: 1,
      backgroundColor: theme.colors.background,
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing.xl,
      gap: theme.spacing.md,
    },
    image: {
      width: '100%',
      flex: 1,
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
