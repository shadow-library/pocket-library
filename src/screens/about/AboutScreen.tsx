/**
 * Importing npm packages
 */
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

/**
 * Importing user defined packages
 */
import { Icon, type IconName } from '@/components/icon';
import { ScreenHeader } from '@/components/screen-header';
import { content } from '@/core/content';
import type { AppTheme } from '@/core/theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * Defining types
 */

type LinkRowProps = {
  icon: IconName;
  label: string;
  styles: ReturnType<typeof createStyles>;
  color: string;
  muted: string;
};

/**
 * Declaring the constants
 */

const LINKS: { icon: IconName; label: string }[] = [
  { icon: 'award', label: content.about.acknowledgements },
  { icon: 'file-text', label: content.about.licences },
  { icon: 'shield', label: content.about.privacy },
];

export function AboutScreen() {
  const theme = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.page}>
      <ScreenHeader title={content.about.title} back />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <LinearGradient colors={['#6D6EF2', '#4338CA']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.logo}>
            <Icon name="book-open" size={40} color="#FFFFFF" />
          </LinearGradient>
          <Text style={styles.appName}>{content.about.appName}</Text>
          <Text style={styles.version}>{content.about.version}</Text>
          <Text style={styles.description}>{content.about.description}</Text>
        </View>

        <View style={styles.card}>
          {LINKS.map((link, index) => (
            <View key={link.label}>
              {index > 0 && <View style={styles.divider} />}
              <LinkRow icon={link.icon} label={link.label} styles={styles} color={theme.colors.text} muted={theme.colors.textTertiary} />
            </View>
          ))}
        </View>

        <Text style={styles.footer}>{content.about.footer}</Text>
      </ScrollView>
    </View>
  );
}

function LinkRow({ icon, label, styles, color, muted }: LinkRowProps) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <Icon name={icon} size={19} color={muted} />
      <Text style={styles.rowLabel}>{label}</Text>
      <Icon name="chevron-right" size={18} color={muted} />
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
      gap: theme.spacing.xl,
    },
    hero: {
      alignItems: 'center',
      gap: theme.spacing.sm,
      paddingVertical: theme.spacing.xl,
    },
    logo: {
      width: 84,
      height: 84,
      borderRadius: theme.radii.xl,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.sm,
    },
    appName: {
      ...theme.type.title,
      color: theme.colors.text,
    },
    version: {
      ...theme.type.body,
      color: theme.colors.textTertiary,
    },
    description: {
      ...theme.type.body,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginTop: theme.spacing.sm,
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
      marginLeft: theme.spacing.xl + 19,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
      paddingVertical: theme.spacing.lg,
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
    footer: {
      ...theme.type.caption,
      color: theme.colors.textTertiary,
      textAlign: 'center',
    },
  });
}
