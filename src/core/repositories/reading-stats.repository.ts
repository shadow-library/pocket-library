/**
 * Importing npm packages
 */

/**
 * Importing user defined packages
 */
import { fileSystemService } from '@/core/infrastructure/file-system.service';
import { type ReadingStatsDoc } from '@/core/types/reading-stats.types';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

const STATS_FILE = 'reading-stats.json';

// Persists per-novel reading totals plus the set of days the user read (for streaks).
class ReadingStatsRepository {
  constructor(private readonly files = fileSystemService) {}

  read(): ReadingStatsDoc {
    const stored = this.files.readJsonFile<ReadingStatsDoc>(STATS_FILE);
    if (stored === null) return { novels: {}, readingDays: [] };
    return { novels: stored.novels ?? {}, readingDays: stored.readingDays ?? [] };
  }

  write(doc: ReadingStatsDoc): void {
    this.files.writeJsonFile(STATS_FILE, doc);
  }
}

export const readingStatsRepository = new ReadingStatsRepository();
