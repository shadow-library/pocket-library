/**
 * Importing npm packages
 */
import { Image, type ImageLoadEventData } from 'expo-image';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

/**
 * Importing user defined packages
 */
import { libraryService } from '@/core/services/library.service';
import { utilityService } from '@/core/infrastructure/utility.service';
import type { ReadingPalette } from '@/core/theme';

/**
 * Defining types
 */

type ReaderImageProps = {
  novelId: string;
  chapterPath: string;
  src: string;
  alt: string;
  palette: ReadingPalette;
};

/**
 * Declaring the constants
 */

const DEFAULT_RATIO = 1.5;

export function ReaderImage({ novelId, chapterPath, src, alt, palette }: ReaderImageProps) {
  const [ratio, setRatio] = useState(DEFAULT_RATIO);
  const uri = libraryService.assetUri(novelId, utilityService.resolvePath(chapterPath, src));
  const styles = createStyles(palette, ratio);

  const onLoad = (event: ImageLoadEventData) => {
    if (event.source.height > 0) setRatio(event.source.width / event.source.height);
  };

  return (
    <View style={styles.container}>
      <Image source={{ uri }} style={styles.image} contentFit="contain" transition={150} onLoad={onLoad} accessibilityLabel={alt} />
      {alt.length > 0 && <Text style={styles.caption}>{alt}</Text>}
    </View>
  );
}

function createStyles(palette: ReadingPalette, ratio: number) {
  return StyleSheet.create({
    container: {
      gap: 6,
    },
    image: {
      width: '100%',
      aspectRatio: ratio,
      borderRadius: 10,
      backgroundColor: palette.border,
    },
    caption: {
      fontSize: 13,
      lineHeight: 18,
      color: palette.textSecondary,
      textAlign: 'center',
      fontStyle: 'italic',
    },
  });
}
