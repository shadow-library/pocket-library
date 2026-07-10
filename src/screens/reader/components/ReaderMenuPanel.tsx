/**
 * Importing npm packages
 */
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

/**
 * Importing user defined packages
 */
import { Cover } from '@/components/cover';
import { Icon } from '@/components/icon';
import { Slider } from '@/components/slider';
import { content } from '@/core/content';
import { radii, spacing, type ReadingPalette } from '@/core/theme';
import type { Chapter } from '@/core/types/novel.types';

/**
 * Defining types
 */

type ReaderMenuPanelProps = {
  palette: ReadingPalette;
  percent: number;
  chapterTitle: string;
  chapters: Chapter[];
  currentIndex: number;
  total: number;
  canPrev: boolean;
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onSeek: (index: number) => void;
  onSelectChapter: (index: number) => void;
  novelTitle: string;
  coverUri: string | null;
  onAbout: () => void;
};

/**
 * Declaring the constants
 */

// The sheet's Menu tab from the design: a position card with a chapter scrubber, then Contents and
// About cards. Tapping Contents expands the chapter list in place; About pushes the novel details.
export function ReaderMenuPanel(props: ReaderMenuPanelProps) {
  const [contentsOpen, setContentsOpen] = useState(false);
  const styles = createStyles(props.palette);
  const scrubberValue = props.total > 1 ? props.currentIndex / (props.total - 1) : 0;
  const onScrub = (value: number) => props.onSeek(Math.round(value * (props.total - 1)));

  return (
    <View style={styles.container}>
      <View style={styles.positionCard}>
        <Text style={styles.positionLabel} numberOfLines={1}>
          {content.reader.positionLabel(props.percent, props.currentIndex + 1, props.chapterTitle)}
        </Text>
        <View style={styles.scrubRow}>
          <Pressable accessibilityRole="button" accessibilityLabel={content.reader.options.prevChapter} disabled={!props.canPrev} hitSlop={8} onPress={props.onPrev} style={({ pressed }) => [pressed && styles.pressed]}>
            <Icon name="chevron-left" size={20} color={props.canPrev ? props.palette.text : props.palette.pct} />
          </Pressable>
          <Slider
            value={scrubberValue}
            onChange={onScrub}
            steps={props.total}
            trackColor={props.palette.progressTrack}
            fillColor={props.palette.accent}
            thumbColor={props.palette.accent}
            thumbBorderColor={props.palette.accent}
            accessibilityLabel={content.reader.positionLabel(props.percent, props.currentIndex + 1, props.chapterTitle)}
          />
          <Pressable accessibilityRole="button" accessibilityLabel={content.reader.options.nextChapter} disabled={!props.canNext} hitSlop={8} onPress={props.onNext} style={({ pressed }) => [pressed && styles.pressed]}>
            <Icon name="chevron-right" size={20} color={props.canNext ? props.palette.text : props.palette.pct} />
          </Pressable>
        </View>
      </View>

      <View style={styles.cardRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded: contentsOpen }}
          accessibilityLabel={content.reader.menu.contents}
          onPress={() => setContentsOpen((open) => !open)}
          style={({ pressed }) => [styles.card, contentsOpen && styles.cardActive, pressed && styles.pressed]}>
          <Icon name="list" size={22} color={props.palette.text} />
          <View style={styles.cardBody}>
            <Text style={styles.cardTitle}>{content.reader.menu.contents}</Text>
            <Text style={styles.cardSubtitle}>{content.reader.menu.contentsCount(props.total)}</Text>
          </View>
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel={content.reader.menu.aboutTitle} onPress={props.onAbout} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
          <Cover uri={props.coverUri} title={props.novelTitle} width={34} height={44} radius={6} />
          <View style={styles.cardBody}>
            <Text style={styles.cardTitle}>{content.reader.menu.aboutTitle}</Text>
            <Text style={styles.cardSubtitle}>{content.reader.menu.aboutSubtitle}</Text>
          </View>
          <Icon name="chevron-right" size={15} color={props.palette.pct} />
        </Pressable>
      </View>

      {contentsOpen && (
        <View style={styles.chapterList}>
          {props.chapters.map((chapter, index) => {
            const active = index === props.currentIndex;
            return (
              <Pressable
                key={`${chapter.path}-${index}`}
                accessibilityRole="button"
                accessibilityLabel={chapter.title}
                onPress={() => props.onSelectChapter(index)}
                style={({ pressed }) => [styles.chapterRow, pressed && styles.pressed]}>
                <Text style={[styles.chapterNumber, active && styles.chapterActive]}>{index + 1}</Text>
                <Text style={[styles.chapterTitle, active && styles.chapterActive]} numberOfLines={1}>
                  {chapter.title}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

function createStyles(palette: ReadingPalette) {
  return StyleSheet.create({
    container: {
      gap: spacing.md,
    },
    positionCard: {
      borderRadius: 18,
      backgroundColor: palette.sheetWell,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
    },
    positionLabel: {
      fontFamily: 'Inter_600SemiBold',
      fontSize: 14,
      textAlign: 'center',
      color: palette.textSecondary,
    },
    scrubRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    cardRow: {
      flexDirection: 'row',
      gap: spacing.md,
    },
    card: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      padding: 14,
      borderRadius: radii.lg,
      backgroundColor: palette.sheetWell,
    },
    cardActive: {
      backgroundColor: palette.accentSoft,
    },
    cardBody: {
      flex: 1,
      gap: 2,
    },
    cardTitle: {
      fontFamily: 'Inter_600SemiBold',
      fontSize: 14,
      color: palette.text,
    },
    cardSubtitle: {
      fontFamily: 'Inter_400Regular',
      fontSize: 12,
      color: palette.pct,
    },
    chapterList: {
      borderRadius: radii.lg,
      backgroundColor: palette.sheetWell,
      paddingVertical: spacing.xs,
    },
    chapterRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.lg,
      minHeight: 48,
      paddingHorizontal: spacing.lg,
    },
    chapterNumber: {
      fontFamily: 'Inter_400Regular',
      fontSize: 13,
      color: palette.pct,
      minWidth: 22,
      textAlign: 'center',
    },
    chapterTitle: {
      fontFamily: 'Inter_400Regular',
      fontSize: 14,
      color: palette.text,
      flex: 1,
    },
    chapterActive: {
      color: palette.accent,
      fontFamily: 'Inter_600SemiBold',
    },
    pressed: {
      opacity: 0.6,
    },
  });
}
