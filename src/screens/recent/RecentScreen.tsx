/**
 * Importing npm packages
 */
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

/**
 * Importing user defined packages
 */
import { Cover } from '@/components/cover';
import { ScreenHeader } from '@/components/screen-header';
import { content } from '@/core/content';
import { libraryService } from '@/core/services/library.service';
import type { AppTheme } from '@/core/theme';
import { useTheme } from '@/hooks/use-theme';
import { useRecentScreen, type RecentEntry } from '@/screens/recent/hooks/useRecentScreen';

/**
 * Defining types
 */

type RecentRowProps = {
  entry: RecentEntry;
  onPress: () => void;
  styles: ReturnType<typeof createStyles>;
};

/**
 * Declaring the constants
 */

export function RecentScreen() {
  const model = useRecentScreen();
  const theme = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.page}>
      <ScreenHeader title={content.recent.title} />
      {model.groups.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>{content.recent.empty}</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {model.groups.map((group) => (
            <View key={group.label} style={styles.group}>
              <Text style={styles.groupLabel}>{group.label}</Text>
              <View style={styles.card}>
                {group.entries.map((entry, index) => (
                  <View key={entry.novel.id}>
                    {index > 0 && <View style={styles.divider} />}
                    <RecentRow entry={entry} onPress={() => model.open(entry.novel)} styles={styles} />
                  </View>
                ))}
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

function RecentRow({ entry, onPress, styles }: RecentRowProps) {
  const line = entry.finished ? `${content.recent.finished} · ${entry.when}` : content.recent.entry(entry.chapter, entry.percent, entry.when);
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={entry.novel.title} onPress={onPress} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <Cover uri={libraryService.coverUri(entry.novel)} title={entry.novel.title} width={44} height={62} radius={6} />
      <View style={styles.rowBody}>
        <Text style={styles.rowTitle} numberOfLines={1}>
          {entry.novel.title}
        </Text>
        <Text style={styles.rowLine} numberOfLines={1}>
          {line}
        </Text>
      </View>
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
    empty: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyText: {
      ...theme.type.body,
      color: theme.colors.textSecondary,
    },
    group: {
      gap: theme.spacing.sm,
    },
    groupLabel: {
      ...theme.type.label,
      color: theme.colors.textTertiary,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
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
      marginLeft: theme.spacing.lg + 44 + theme.spacing.md,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
      padding: theme.spacing.lg,
    },
    pressed: {
      opacity: 0.6,
    },
    rowBody: {
      flex: 1,
      gap: 3,
    },
    rowTitle: {
      ...theme.type.bodyStrong,
      color: theme.colors.text,
    },
    rowLine: {
      ...theme.type.caption,
      color: theme.colors.textTertiary,
    },
  });
}
