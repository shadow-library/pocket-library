/**
 * Importing npm packages
 */

/**
 * Importing user defined packages
 */

/**
 * Defining types
 */

export type NovelStat = {
  readChapters: number[];
  msSpent: number;
};

export type ReadingStatsDoc = {
  novels: Record<string, NovelStat>;
  readingDays: string[];
};

export type NovelStatSummary = {
  chaptersRead: number;
  msSpent: number;
};

/**
 * Declaring the constants
 */

export const EMPTY_READING_STATS: ReadingStatsDoc = { novels: {}, readingDays: [] };
