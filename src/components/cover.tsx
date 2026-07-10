/**
 * Importing npm packages
 */
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text } from 'react-native';

/**
 * Importing user defined packages
 */

/**
 * Defining types
 */

type CoverProps = {
  uri: string | null;
  title: string;
  width: number;
  height: number;
  radius?: number;
};

/**
 * Declaring the constants
 */

// Deterministic spine gradients so cover-less novels still look like the design's coloured book spines.
const GRADIENTS: [string, string][] = [
  ['#4A0D16', '#1A0509'],
  ['#241A30', '#0D0A14'],
  ['#14504A', '#08221F'],
  ['#2F3A63', '#141A30'],
  ['#6B4A12', '#2C1E06'],
  ['#7A2447', '#320F22'],
];

function hashString(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  return hash;
}

export function Cover({ uri, title, width, height, radius = 8 }: CoverProps) {
  if (uri !== null) return <Image source={{ uri }} style={{ width, height, borderRadius: radius }} contentFit="cover" transition={150} />;

  const gradient = GRADIENTS[hashString(title) % GRADIENTS.length];
  return (
    <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.placeholder, { width, height, borderRadius: radius }]}>
      <Text style={[styles.spine, { fontSize: Math.max(9, width * 0.13) }]} numberOfLines={4}>
        {title}
      </Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    justifyContent: 'flex-end',
    padding: 8,
  },
  spine: {
    fontFamily: 'Lora_600SemiBold',
    color: '#F0D6A8',
    lineHeight: undefined,
  },
});
