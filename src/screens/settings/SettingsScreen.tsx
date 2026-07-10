/**
 * Importing npm packages
 */
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

/**
 * Importing user defined packages
 */
import { Icon, type IconName } from '@/components/icon';
import { ScreenHeader } from '@/components/screen-header';
import { content } from '@/core/content';
import type { AppTheme } from '@/core/theme';
import { useTheme } from '@/hooks/use-theme';
import { useSettingsScreen } from '@/screens/settings/hooks/useSettingsScreen';

/**
 * Defining types
 */

type SettingRowProps = {
  icon: IconName;
  label: string;
  value?: string;
  onPress?: () => void;
  toggle?: { value: boolean; onChange: (value: boolean) => void };
  styles: ReturnType<typeof createStyles>;
  theme: AppTheme;
};

/**
 * Declaring the constants
 */

export function SettingsScreen() {
  const model = useSettingsScreen();
  const theme = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.page}>
      <ScreenHeader title={content.settings.title} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.groupLabel}>{content.settings.readerDefaults}</Text>
        <View style={styles.card}>
          <SettingRow icon="type" label={content.settings.typeface} value={model.typefaceLabel} onPress={model.cycleTypeface} styles={styles} theme={theme} />
          <View style={styles.divider} />
          <SettingRow icon="maximize-2" label={content.settings.defaultFontSize} value={model.fontSizeLabel} onPress={model.cycleFontSize} styles={styles} theme={theme} />
          <View style={styles.divider} />
          <SettingRow icon="sun" label={content.settings.defaultTheme} value={model.themeLabel} onPress={model.cycleTheme} styles={styles} theme={theme} />
        </View>

        <Text style={styles.groupLabel}>{content.settings.general}</Text>
        <View style={styles.card}>
          <SettingRow icon="bar-chart-2" label={content.settings.librarySort} value={model.sortLabel} onPress={model.cycleSort} styles={styles} theme={theme} />
          <View style={styles.divider} />
          <SettingRow icon="eye" label={content.settings.keepAwake} toggle={{ value: model.keepAwake, onChange: model.setKeepAwake }} styles={styles} theme={theme} />
        </View>

        <View style={styles.card}>
          <SettingRow icon="info" label={content.settings.aboutRow} value={content.settings.version} onPress={model.openAbout} styles={styles} theme={theme} />
        </View>
      </ScrollView>
    </View>
  );
}

function SettingRow({ icon, label, value, onPress, toggle, styles, theme }: SettingRowProps) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} disabled={onPress === undefined} onPress={onPress} style={({ pressed }) => [styles.row, pressed && onPress !== undefined && styles.pressed]}>
      <Icon name={icon} size={19} color={theme.colors.textTertiary} />
      <Text style={styles.rowLabel}>{label}</Text>
      {value !== undefined && <Text style={styles.rowValue}>{value}</Text>}
      {toggle ? (
        <Switch value={toggle.value} onValueChange={toggle.onChange} trackColor={{ true: theme.colors.accent, false: theme.colors.border }} thumbColor={theme.colors.surfaceElevated} />
      ) : (
        onPress !== undefined && <Icon name="chevron-right" size={18} color={theme.colors.textTertiary} />
      )}
    </Pressable>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    page: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      padding: theme.spacing.xl,
      gap: theme.spacing.md,
    },
    groupLabel: {
      ...theme.type.label,
      color: theme.colors.textTertiary,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
      marginTop: theme.spacing.md,
      marginLeft: theme.spacing.xs,
    },
    card: {
      backgroundColor: theme.colors.surfaceElevated,
      borderRadius: theme.radii.lg,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
      overflow: 'hidden',
    },
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: theme.colors.border,
      marginLeft: theme.spacing.lg + 19,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
      minHeight: 54,
      paddingHorizontal: theme.spacing.lg,
    },
    pressed: {
      opacity: 0.6,
    },
    rowLabel: {
      ...theme.type.body,
      flex: 1,
      color: theme.colors.text,
    },
    rowValue: {
      ...theme.type.body,
      color: theme.colors.textTertiary,
    },
  });
}
