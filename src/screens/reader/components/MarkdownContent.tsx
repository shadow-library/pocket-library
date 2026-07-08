/**
 * Importing npm packages
 */
import { Fragment } from 'react';
import { StyleSheet, Text, View } from 'react-native';

/**
 * Importing user defined packages
 */
import type { ReadingPalette } from '@/core/theme';
import { ReaderImage } from '@/screens/reader/components/ReaderImage';
import type { InlineNode, ReaderBlock } from '@/screens/reader/reader.helpers';

/**
 * Defining types
 */

type MarkdownContentProps = {
  blocks: ReaderBlock[];
  novelId: string;
  chapterPath: string;
  palette: ReadingPalette;
  fontScale: number;
};

/**
 * Declaring the constants
 */

export function MarkdownContent({ blocks, novelId, chapterPath, palette, fontScale }: MarkdownContentProps) {
  const styles = createStyles(palette, fontScale);

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
      case 'image':
        return <ReaderImage key={key} novelId={novelId} chapterPath={chapterPath} src={block.src} alt={block.alt} palette={palette} />;
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

function createStyles(palette: ReadingPalette, fontScale: number) {
  const body = 18 * fontScale;
  const bodyLine = 29 * fontScale;
  return StyleSheet.create({
    paragraph: {
      fontSize: body,
      lineHeight: bodyLine,
      color: palette.text,
      textAlign: 'justify',
    },
    heading: {
      color: palette.text,
      fontWeight: '700',
    },
    h1: {
      fontSize: 27 * fontScale,
      lineHeight: 34 * fontScale,
    },
    h2: {
      fontSize: 23 * fontScale,
      lineHeight: 30 * fontScale,
    },
    h3: {
      fontSize: 20 * fontScale,
      lineHeight: 27 * fontScale,
    },
    bold: {
      fontWeight: '700',
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
    },
    list: {
      gap: 8 * fontScale,
    },
    listItem: {
      flexDirection: 'row',
      gap: 10,
    },
    bullet: {
      fontSize: body,
      lineHeight: bodyLine,
      color: palette.textSecondary,
      minWidth: 22,
    },
    listText: {
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
