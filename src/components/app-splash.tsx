/**
 * Importing npm packages
 */
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

/**
 * Importing user defined packages
 */
import { Icon } from '@/components/icon';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

// Startup screen shown while fonts + stores hydrate (matches design screen 01). Colors are fixed dark
// tones independent of the chrome theme, mirroring the design's night-sky splash.
export function AppSplash() {
  return (
    <LinearGradient colors={['#1C1D3A', '#0E0E18', '#08080E']} locations={[0, 0.55, 1]} style={styles.root}>
      <View style={styles.center}>
        <LinearGradient colors={['#6D6EF2', '#4338CA']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.logo}>
          <Icon name="book-open" size={48} color="#FFFFFF" />
        </LinearGradient>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>Pocket Library</Text>
          <Text style={styles.subtitle}>Your novels, anywhere.</Text>
        </View>
      </View>
      <View style={styles.footer}>
        <View style={styles.track}>
          <LinearGradient colors={['transparent', '#8B8CF5', 'transparent']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.bar} />
        </View>
        <Text style={styles.loading}>Initializing library…</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 26,
  },
  logo: {
    width: 96,
    height: 96,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleBlock: {
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontFamily: 'Inter_700Bold',
    fontSize: 30,
    letterSpacing: -0.4,
    color: '#FFFFFF',
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: 'rgba(255,255,255,0.55)',
  },
  footer: {
    alignSelf: 'stretch',
    paddingHorizontal: 60,
    paddingBottom: 72,
    alignItems: 'center',
    gap: 16,
  },
  track: {
    width: '55%',
    height: 3,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
  },
  bar: {
    width: '45%',
    height: '100%',
    borderRadius: 999,
  },
  loading: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12.5,
    color: 'rgba(255,255,255,0.5)',
  },
});
