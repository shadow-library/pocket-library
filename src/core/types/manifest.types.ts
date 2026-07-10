/**
 * Importing npm packages
 */

/**
 * Importing user defined packages
 */

/**
 * Defining types
 */

// Shape authored inside a `.novel` package's `manifest.json`. Paths are relative to the zip root.
// An alternate image of a character — a different outfit or scene. `image` is required, `label` names
// the outfit/scene.
export type ManifestCharacterVariant = {
  image: string;
  label?: string;
};

export type ManifestCharacter = {
  name: string;
  image?: string;
  description?: string;
  variants?: ManifestCharacterVariant[];
};

export type ManifestChapter = {
  title: string;
  file: string;
};

// A reference/concept image for a scene — distinct from a character portrait and from an inline
// `![alt](path)` image already embedded in a chapter's Markdown. `chapter` ties it to one chapter's
// `file`; omitted, it is untagged and belongs to every chapter.
export type ManifestScene = {
  image: string;
  chapter?: string;
  caption?: string;
};

export type NovelManifest = {
  schemaVersion: number;
  id: string;
  title: string;
  author?: string;
  description?: string;
  cover?: string;
  tags?: string[];
  characters?: ManifestCharacter[];
  scenes?: ManifestScene[];
  chapters: ManifestChapter[];
};

/**
 * Declaring the constants
 */

export const MANIFEST_FILE_NAME = 'manifest.json';
export const SUPPORTED_MANIFEST_VERSION = 1;
