/**
 * Importing npm packages
 */
import { Image } from 'expo-image';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

/**
 * Importing user defined packages
 */
import { content } from '@/core/content';
import type { AppTheme } from '@/core/theme';
import { useTheme } from '@/hooks/use-theme';
import type { ReaderAsset } from '@/screens/reader/reader.helpers';

/**
 * Defining types
 */

type AssetsOverlayProps = {
  visible: boolean;
  assets: ReaderAsset[];
  viewingAsset: ReaderAsset | null;
  onSelect: (asset: ReaderAsset) => void;
  onClose: () => void;
};

/**
 * Declaring the constants
 */

const AVATAR_SIZE = 64;
const SCENE_THUMB_WIDTH = 96;
const SCENE_THUMB_HEIGHT = 72;

// Tapping the reading area toggles this bottom bar of character/scene thumbnails; tapping a thumbnail
// opens it full-screen in a Modal, and tapping the full-screen image returns to the chapter.
export function AssetsOverlay({ visible, assets, viewingAsset, onSelect, onClose }: AssetsOverlayProps) {
  const theme = useTheme();
  const styles = createStyles(theme);

  if (viewingAsset !== null) {
    return (
      <Modal visible transparent animationType="fade" onRequestClose={onClose}>
        <FullScreenViewer asset={viewingAsset} onClose={onClose} styles={styles} />
      </Modal>
    );
  }

  if (!visible || assets.length === 0) return null;

  const characters = assets.filter((asset) => asset.kind === 'character');
  const scenes = assets.filter((asset) => asset.kind === 'scene');

  return (
    <View style={styles.bar}>
      {characters.length > 0 && <AssetRow label={content.reader.assets.charactersHeading} assets={characters} shape="round" onSelect={onSelect} styles={styles} />}
      {scenes.length > 0 && <AssetRow label={content.reader.assets.scenesHeading} assets={scenes} shape="rect" onSelect={onSelect} styles={styles} />}
    </View>
  );
}

type OverlayStyles = ReturnType<typeof createStyles>;

function AssetRow({
  label,
  assets,
  shape,
  onSelect,
  styles,
}: {
  label: string;
  assets: ReaderAsset[];
  shape: 'round' | 'rect';
  onSelect: (asset: ReaderAsset) => void;
  styles: OverlayStyles;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rowContent}>
        {assets.map((asset) => (
          <Pressable
            key={asset.uri}
            accessibilityRole="button"
            accessibilityLabel={asset.label.length > 0 ? asset.label : label}
            onPress={() => onSelect(asset)}
            style={({ pressed }) => [shape === 'round' ? styles.avatarWrap : styles.thumbWrap, pressed && styles.pressed]}>
            <Image source={{ uri: asset.uri }} style={shape === 'round' ? styles.avatar : styles.thumb} contentFit="cover" transition={150} />
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

function FullScreenViewer({ asset, onClose, styles }: { asset: ReaderAsset; onClose: () => void; styles: OverlayStyles }) {
  return (
    <Pressable style={styles.viewer} onPress={onClose} accessibilityRole="button" accessibilityLabel={content.reader.assets.close}>
      <Image source={{ uri: asset.uri }} style={styles.viewerImage} contentFit="contain" transition={150} accessibilityLabel={asset.label} />
      {asset.label.length > 0 && <Text style={styles.viewerLabel}>{asset.label}</Text>}
      <Text style={styles.viewerHint}>{content.reader.assets.close}</Text>
    </Pressable>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    bar: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: theme.colors.surfaceElevated,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.colors.border,
      paddingHorizontal: theme.spacing.xl,
      paddingTop: theme.spacing.lg,
      paddingBottom: theme.spacing.xxl,
      gap: theme.spacing.lg,
    },
    row: {
      gap: theme.spacing.sm,
    },
    rowLabel: {
      ...theme.type.label,
      color: theme.colors.textSecondary,
    },
    rowContent: {
      gap: theme.spacing.md,
      paddingRight: theme.spacing.xl,
    },
    pressed: {
      opacity: 0.6,
    },
    avatarWrap: {
      borderRadius: theme.radii.pill,
      overflow: 'hidden',
    },
    avatar: {
      width: AVATAR_SIZE,
      height: AVATAR_SIZE,
      backgroundColor: theme.colors.surface,
    },
    thumbWrap: {
      borderRadius: theme.radii.md,
      overflow: 'hidden',
    },
    thumb: {
      width: SCENE_THUMB_WIDTH,
      height: SCENE_THUMB_HEIGHT,
      backgroundColor: theme.colors.surface,
    },
    viewer: {
      flex: 1,
      backgroundColor: theme.colors.background,
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing.xl,
      gap: theme.spacing.md,
    },
    viewerImage: {
      width: '100%',
      flex: 1,
    },
    viewerLabel: {
      ...theme.type.bodyStrong,
      color: theme.colors.text,
      textAlign: 'center',
    },
    viewerHint: {
      ...theme.type.caption,
      color: theme.colors.textMuted,
      textAlign: 'center',
    },
  });
}
