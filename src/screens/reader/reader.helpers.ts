/**
 * Importing npm packages
 */
import MarkdownIt from 'markdown-it';

/**
 * Importing user defined packages
 */

/**
 * Defining types
 */

type Token = ReturnType<MarkdownIt['parse']>[number];

export type InlineNode = { type: 'text'; value: string; bold: boolean; italic: boolean; code: boolean } | { type: 'image'; src: string; alt: string };

export type ReaderBlock =
  | { type: 'heading'; level: number; nodes: InlineNode[] }
  | { type: 'paragraph'; nodes: InlineNode[] }
  | { type: 'blockquote'; blocks: ReaderBlock[] }
  | { type: 'list'; ordered: boolean; items: InlineNode[][] }
  | { type: 'image'; src: string; alt: string }
  | { type: 'hr' };

type ImageBlock = Extract<ReaderBlock, { type: 'image' }>;

// A full-screen-viewable image for the current chapter: an extracted inline chapter image or a scene.
export type ReaderImageAsset = { uri: string; label: string };

// A character grouped with its portrait + outfit/scene variants for the reader gallery. `avatarUri` is
// the thumbnail; `images` (portrait first) feeds the full-screen swipe viewer, each label pre-composed.
export type ReaderCharacterGallery = { name: string; avatarUri: string; images: ReaderImageAsset[] };

/**
 * Declaring the constants
 */

const md = new MarkdownIt({ html: false, linkify: true, typographer: true, breaks: false });

export function parseMarkdown(source: string): ReaderBlock[] {
  return parseBlocks(md.parse(source, {}));
}

// Splits parsed blocks so images leave the reading flow (they surface in the chapter gallery instead)
// while the remaining text blocks render as the chapter body.
export function partitionBlocks(blocks: ReaderBlock[]): { textBlocks: ReaderBlock[]; imageBlocks: ImageBlock[] } {
  const textBlocks: ReaderBlock[] = [];
  const imageBlocks: ImageBlock[] = [];
  for (const block of blocks) {
    if (block.type === 'image') imageBlocks.push(block);
    else textBlocks.push(block);
  }
  return { textBlocks, imageBlocks };
}

export function scrollFraction(offsetY: number, contentHeight: number, layoutHeight: number): number {
  const scrollable = contentHeight - layoutHeight;
  return scrollable > 0 ? Math.min(1, Math.max(0, offsetY / scrollable)) : 0;
}

function parseBlocks(tokens: Token[]): ReaderBlock[] {
  const blocks: ReaderBlock[] = [];
  let index = 0;
  while (index < tokens.length) {
    const token = tokens[index];
    if (token.type === 'heading_open') {
      const inline = tokens[index + 1];
      blocks.push({ type: 'heading', level: Number(token.tag.slice(1)) || 1, nodes: inlineNodes(inline) });
      index += 3;
      continue;
    }
    if (token.type === 'paragraph_open') {
      const nodes = inlineNodes(tokens[index + 1]);
      const only = nodes.length === 1 ? nodes[0] : null;
      if (only !== null && only.type === 'image') blocks.push({ type: 'image', src: only.src, alt: only.alt });
      else blocks.push({ type: 'paragraph', nodes });
      index += 3;
      continue;
    }
    if (token.type === 'hr') {
      blocks.push({ type: 'hr' });
      index += 1;
      continue;
    }
    if (token.type === 'blockquote_open') {
      const [inner, next] = sliceMatched(tokens, index, 'blockquote_open', 'blockquote_close');
      blocks.push({ type: 'blockquote', blocks: parseBlocks(inner) });
      index = next;
      continue;
    }
    if (token.type === 'bullet_list_open' || token.type === 'ordered_list_open') {
      const ordered = token.type === 'ordered_list_open';
      const [inner, next] = sliceMatched(tokens, index, token.type, ordered ? 'ordered_list_close' : 'bullet_list_close');
      blocks.push({ type: 'list', ordered, items: parseListItems(inner) });
      index = next;
      continue;
    }
    index += 1;
  }
  return blocks;
}

function inlineNodes(token: Token | undefined): InlineNode[] {
  if (token === undefined || token.type !== 'inline' || token.children === null) return [];
  const nodes: InlineNode[] = [];
  let bold = 0;
  let italic = 0;
  for (const child of token.children) {
    switch (child.type) {
      case 'text':
        if (child.content.length > 0) nodes.push({ type: 'text', value: child.content, bold: bold > 0, italic: italic > 0, code: false });
        break;
      case 'code_inline':
        nodes.push({ type: 'text', value: child.content, bold: bold > 0, italic: italic > 0, code: true });
        break;
      case 'softbreak':
        nodes.push({ type: 'text', value: ' ', bold: false, italic: false, code: false });
        break;
      case 'hardbreak':
        nodes.push({ type: 'text', value: '\n', bold: false, italic: false, code: false });
        break;
      case 'strong_open':
        bold += 1;
        break;
      case 'strong_close':
        bold = Math.max(0, bold - 1);
        break;
      case 'em_open':
        italic += 1;
        break;
      case 'em_close':
        italic = Math.max(0, italic - 1);
        break;
      case 'image':
        nodes.push({ type: 'image', src: child.attrGet('src') ?? '', alt: child.content });
        break;
      default:
        break;
    }
  }
  return nodes;
}

function parseListItems(tokens: Token[]): InlineNode[][] {
  const items: InlineNode[][] = [];
  let index = 0;
  while (index < tokens.length) {
    if (tokens[index].type !== 'list_item_open') {
      index += 1;
      continue;
    }
    const [inner, next] = sliceMatched(tokens, index, 'list_item_open', 'list_item_close');
    const nodes: InlineNode[] = [];
    for (const block of parseBlocks(inner)) {
      if (block.type === 'paragraph' || block.type === 'heading') nodes.push(...block.nodes);
    }
    items.push(nodes);
    index = next;
  }
  return items;
}

function sliceMatched(tokens: Token[], openIndex: number, openType: string, closeType: string): [Token[], number] {
  let depth = 0;
  let index = openIndex;
  for (; index < tokens.length; index += 1) {
    if (tokens[index].type === openType) depth += 1;
    else if (tokens[index].type === closeType) {
      depth -= 1;
      if (depth === 0) break;
    }
  }
  return [tokens.slice(openIndex + 1, index), index + 1];
}
