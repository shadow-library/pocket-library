/**
 * Importing npm packages
 */
import { Pressable, StyleSheet, Text, View } from 'react-native';

/**
 * Importing user defined packages
 */
import { Icon } from '@/components/icon';
import { Slider } from '@/components/slider';
import { content } from '@/core/content';
import { readerFontStacks, readingColors, readingFonts, readingType, shadows, spacing, type ReaderFontFamily, type ReadingPalette, type ReadingTheme } from '@/core/theme';
import { FONT_SCALE_STEP, MAX_FONT_SCALE, MIN_FONT_SCALE } from '@/core/types/reader-settings.types';

/**
 * Defining types
 */

type ReaderSettingsPanelProps = {
  palette: ReadingPalette;
  fontScale: number;
  fontFamily: ReaderFontFamily;
  theme: ReadingTheme;
  brightnessValue: number;
  onSelectTheme: (theme: ReadingTheme) => void;
  onSelectFontFamily: (fontFamily: ReaderFontFamily) => void;
  onSetFontScale: (fontScale: number) => void;
  onSetBrightness: (brightness: number) => void;
};

/**
 * Declaring the constants
 */

const THEME_OPTIONS: { key: ReadingTheme; label: string }[] = [
  { key: 'light', label: content.reader.reading.themeWhite },
  { key: 'sepia', label: content.reader.reading.themeSepia },
  { key: 'dark', label: content.reader.reading.themeDark },
];

const FONT_FAMILY_OPTIONS: { key: ReaderFontFamily; label: string }[] = [
  { key: 'roboto', label: content.reader.settings.fontRoboto },
  { key: 'inter', label: content.reader.settings.fontInter },
];

const FONT_SCALE_STEPS = Math.round((MAX_FONT_SCALE - MIN_FONT_SCALE) / FONT_SCALE_STEP) + 1;
const BRIGHTNESS_STEPS = 21;

// The sheet's Reading tab from the design: theme swatches, a typeface segmented control, and the
// font-size and brightness sliders.
export function ReaderSettingsPanel(props: ReaderSettingsPanelProps) {
  const styles = createStyles(props.palette);
  const fontPt = Math.round(readingType.bodySize * props.fontScale);
  const fontValue = (props.fontScale - MIN_FONT_SCALE) / (MAX_FONT_SCALE - MIN_FONT_SCALE);
  const onFontSlide = (value: number) => props.onSetFontScale(MIN_FONT_SCALE + value * (MAX_FONT_SCALE - MIN_FONT_SCALE));

  return (
    <View style={styles.container}>
      <Text style={styles.sectionLabel}>{content.reader.reading.theme}</Text>
      <View style={styles.swatchRow}>
        {THEME_OPTIONS.map((option) => {
          const active = option.key === props.theme;
          const sample = readingColors[option.key];
          return (
            <Pressable key={option.key} accessibilityRole="button" accessibilityState={{ selected: active }} accessibilityLabel={option.label} onPress={() => props.onSelectTheme(option.key)} style={styles.swatchItem}>
              <View style={[styles.swatch, { backgroundColor: sample.background }, active && styles.swatchActive]}>
                <Text style={[styles.swatchGlyph, { color: sample.heading }]}>Aa</Text>
              </View>
              <Text style={[styles.swatchLabel, active && styles.swatchLabelActive]}>{option.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.sectionLabel}>{content.reader.reading.typeface}</Text>
      <View style={styles.segmented}>
        {FONT_FAMILY_OPTIONS.map((option) => {
          const active = option.key === props.fontFamily;
          return (
            <Pressable
              key={option.key}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={option.label}
              onPress={() => props.onSelectFontFamily(option.key)}
              style={[styles.segment, active && styles.segmentActive]}>
              <Text style={[styles.segmentLabel, { fontFamily: readerFontStacks[option.key].regular }, active && styles.segmentLabelActive]}>{option.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.labelRow}>
        <Text style={styles.sectionLabel}>{content.reader.reading.fontSize}</Text>
        <Text style={styles.value}>{content.reader.reading.fontSizeValue(fontPt)}</Text>
      </View>
      <View style={styles.sliderRow}>
        <Text style={styles.fontSmall}>A</Text>
        <Slider
          value={fontValue}
          onChange={onFontSlide}
          steps={FONT_SCALE_STEPS}
          trackColor={props.palette.sheetWell}
          fillColor={props.palette.accent}
          thumbColor={props.palette.sheet}
          thumbBorderColor={props.palette.accent}
          accessibilityLabel={content.reader.reading.fontSize}
        />
        <Text style={styles.fontLarge}>A</Text>
      </View>

      <Text style={styles.sectionLabel}>{content.reader.reading.brightness}</Text>
      <View style={styles.sliderRow}>
        <Icon name="sun" size={19} color={props.palette.pct} />
        <Slider
          value={props.brightnessValue}
          onChange={props.onSetBrightness}
          steps={BRIGHTNESS_STEPS}
          trackColor={props.palette.sheetWell}
          fillColor={props.palette.accent}
          thumbColor={props.palette.sheet}
          thumbBorderColor={props.palette.accent}
          accessibilityLabel={content.reader.reading.brightness}
        />
      </View>
    </View>
  );
}

function createStyles(palette: ReadingPalette) {
  return StyleSheet.create({
    container: {
      gap: spacing.sm,
    },
    sectionLabel: {
      fontFamily: 'Inter_700Bold',
      fontSize: 12,
      letterSpacing: 0.96,
      textTransform: 'uppercase',
      color: palette.pct,
      marginTop: spacing.xs,
    },
    labelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    value: {
      fontFamily: 'Inter_400Regular',
      fontSize: 13,
      color: palette.textSecondary,
    },
    swatchRow: {
      flexDirection: 'row',
      gap: spacing.md,
      marginBottom: spacing.sm,
    },
    swatchItem: {
      flex: 1,
      alignItems: 'center',
      gap: spacing.sm,
    },
    swatch: {
      width: '100%',
      height: 64,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: palette.sheetWell,
    },
    swatchActive: {
      borderColor: palette.accent,
      ...shadows.e1,
    },
    swatchGlyph: {
      fontFamily: readingFonts.serifTitle,
      fontSize: 26,
    },
    swatchLabel: {
      fontFamily: 'Inter_400Regular',
      fontSize: 12,
      color: palette.textSecondary,
    },
    swatchLabelActive: {
      fontFamily: 'Inter_600SemiBold',
      color: palette.accent,
    },
    segmented: {
      flexDirection: 'row',
      padding: 4,
      borderRadius: 12,
      backgroundColor: palette.sheetWell,
      marginBottom: spacing.sm,
    },
    segment: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 44,
      borderRadius: 9,
    },
    segmentActive: {
      backgroundColor: palette.sheet,
      ...shadows.e1,
    },
    segmentLabel: {
      fontSize: 15,
      color: palette.textSecondary,
    },
    segmentLabelActive: {
      color: palette.text,
    },
    sliderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
    },
    fontSmall: {
      fontFamily: readingFonts.serifBody,
      fontSize: 14,
      color: palette.pct,
    },
    fontLarge: {
      fontFamily: readingFonts.serifBody,
      fontSize: 24,
      color: palette.textSecondary,
    },
  });
}
