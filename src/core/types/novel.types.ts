/**
 * Importing npm packages
 */

/**
 * Importing user defined packages
 */

/**
 * Defining types
 */

// Paths are stored relative to the novel's private directory and resolved to `file://` uris at read
// time, so the persisted index survives the app document directory moving between installs (iOS).
// An alternate image of a character (a different outfit or scene). `label` names the outfit/scene.
export type CharacterVariant = {
  imagePath: string;
  label?: string;
};

export type Character = {
  name: string;
  imagePath?: string;
  description?: string;
  variants: CharacterVariant[];
};

export type Chapter = {
  title: string;
  path: string;
};

// Reference/concept art for a scene, not a character portrait. `chapterPath` matches a `Chapter.path`
// when tagged to one chapter; undefined means it applies to every chapter.
export type Scene = {
  imagePath: string;
  chapterPath?: string;
  caption?: string;
};

export type Progress = {
  chapterIndex: number;
  scrollFraction: number;
  updatedAt: number;
};

export type Novel = {
  id: string;
  title: string;
  author?: string;
  description?: string;
  tags: string[];
  coverPath?: string;
  characters: Character[];
  scenes: Scene[];
  chapters: Chapter[];
  importedAt: number;
  progress?: Progress;
};

export type LibraryDoc = {
  schemaVersion: number;
  novels: Novel[];
  lastReadNovelId: string | null;
};

/**
 * Declaring the constants
 */

// Version of the persisted library index shape. Bump when the stored `Novel` shape changes; the read
// path in `library.repository.ts` normalizes older docs forward, so a bump documents the change rather
// than gating it. History: 1 = initial, 2 = `characters[].variants`.
export const LIBRARY_SCHEMA_VERSION = 2;
