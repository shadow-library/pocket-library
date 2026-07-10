/**
 * Importing npm packages
 */
import { Fragment } from 'react';
import { StyleSheet, Text, View } from 'react-native';

/**
 * Importing user defined packages
 */
import { readerFontStacks, readingFonts, readingType, type ReaderFontFamily, type ReadingPalette } from '@/core/theme';
import type { InlineNode, ReaderBlock } from '@/screens/reader/reader.helpers';

/**
 * Defining types
 */

type MarkdownContentProps = {
  blocks: ReaderBlock[];
  palette: ReadingPalette;
  fontScale: number;
  fontFamily: ReaderFontFamily;
};

/**
 * Declaring the constants
 */

// Inline images are stripped upstream (they surface in the chapter gallery), so the body renders text
// blocks only. Chapter headings use the Lora serif; body paragraphs share one uniform reading font.
export function MarkdownContent({ blocks, palette, fontScale, fontFamily }: MarkdownContentProps) {
  const styles = createStyles(palette, fontScale, fontFamily);

  const renderInline = (nodes: InlineNode[]) =>
    nodes.map((node, index) => {
      if (node.type === 'image') return null;
      return (
        <Text key={index} style={[node.bold && styles.bold, node.italic && styles.italic, node.code && styles.code]}>
          {node.value}
        </Text>
      );
    });

  const renderBlock = (block: ReaderBlock, key: number) => {
    switch (block.type) {
      case 'heading':
        return (
          <Text key={key} style={[styles.heading, headingStyle(styles, block.level)]}>
            {renderInline(block.nodes)}
          </Text>
        );
      case 'paragraph':
        return (
          <Text key={key} style={styles.paragraph}>
            {renderInline(block.nodes)}
          </Text>
        );
      case 'blockquote':
        return (
          <View key={key} style={styles.blockquote}>
            {block.blocks.map((inner, innerIndex) => renderBlock(inner, innerIndex))}
          </View>
        );
      case 'list':
        return (
          <View key={key} style={styles.list}>
            {block.items.map((item, itemIndex) => (
              <View key={itemIndex} style={styles.listItem}>
                <Text style={styles.bullet}>{block.ordered ? `${itemIndex + 1}.` : '•'}</Text>
                <Text style={styles.listText}>{renderInline(item)}</Text>
              </View>
            ))}
          </View>
        );
      case 'hr':
        return <View key={key} style={styles.hr} />;
      default:
        return null;
    }
  };

  return <Fragment>{blocks.map((block, index) => renderBlock(block, index))}</Fragment>;
}

function headingStyle(styles: ReturnType<typeof createStyles>, level: number) {
  if (level <= 1) return styles.h1;
  if (level === 2) return styles.h2;
  return styles.h3;
}

function createStyles(palette: ReadingPalette, fontScale: number, fontFamily: ReaderFontFamily) {
  const body = readingType.bodySize * fontScale;
  const bodyLine = readingType.bodySize * readingType.bodyLineRatio * fontScale;
  const stack = readerFontStacks[fontFamily];
  return StyleSheet.create({
    paragraph: {
      fontFamily: stack.regular,
      fontSize: body,
      lineHeight: bodyLine,
      color: palette.text,
      marginBottom: 16 * fontScale,
    },
    heading: {
      fontFamily: readingFonts.serifTitle,
      color: palette.heading,
    },
    h1: {
      fontSize: readingType.titleSize * fontScale,
      lineHeight: readingType.titleLine * fontScale,
      marginBottom: 8 * fontScale,
    },
    h2: {
      fontSize: 22 * fontScale,
      lineHeight: 28 * fontScale,
    },
    h3: {
      fontSize: 19 * fontScale,
      lineHeight: 26 * fontScale,
    },
    bold: {
      fontFamily: stack.bold,
    },
    italic: {
      fontStyle: 'italic',
    },
    code: {
      fontFamily: 'monospace',
      fontSize: body * 0.92,
    },
    blockquote: {
      gap: 12 * fontScale,
      paddingLeft: 16,
      borderLeftWidth: 3,
      borderLeftColor: palette.border,
      marginBottom: 16 * fontScale,
    },
    list: {
      gap: 8 * fontScale,
      marginBottom: 16 * fontScale,
    },
    listItem: {
      flexDirection: 'row',
      gap: 10,
    },
    bullet: {
      fontFamily: stack.regular,
      fontSize: body,
      lineHeight: bodyLine,
      color: palette.textSecondary,
      minWidth: 22,
    },
    listText: {
      fontFamily: stack.regular,
      flex: 1,
      fontSize: body,
      lineHeight: bodyLine,
      color: palette.text,
    },
    hr: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: palette.border,
      marginVertical: 8,
    },
  });
}
