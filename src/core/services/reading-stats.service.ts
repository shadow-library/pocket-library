/**
 * Importing npm packages
 */

/**
 * Importing user defined packages
 */
import { readingStatsRepository } from '@/core/repositories/reading-stats.repository';
import { type NovelStatSummary } from '@/core/types/reading-stats.types';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

const DAY_MS = 24 * 60 * 60 * 1000;

// Owns reading-time and reading-day accounting: the reader records sessions here; the progress screen
// reads per-novel totals and the app-wide streak.
class ReadingStatsService {
  constructor(private readonly repo = readingStatsRepository) {}

  recordSession(novelId: string, chapterIndex: number, elapsedMs: number): void {
    if (elapsedMs <= 0 && chapterIndex < 0) return;
    const doc = this.repo.read();
    const stat = doc.novels[novelId] ?? { readChapters: [], msSpent: 0 };
    const readChapters = stat.readChapters.includes(chapterIndex) ? stat.readChapters : [...stat.readChapters, chapterIndex];
    const msSpent = stat.msSpent + Math.max(0, elapsedMs);
    const today = this.isoDay(new Date());
    const readingDays = doc.readingDays.includes(today) ? doc.readingDays : [...doc.readingDays, today];
    this.repo.write({ novels: { ...doc.novels, [novelId]: { readChapters, msSpent } }, readingDays });
  }

  novelStat(novelId: string): NovelStatSummary {
    const stat = this.repo.read().novels[novelId];
    return { chaptersRead: stat?.readChapters.length ?? 0, msSpent: stat?.msSpent ?? 0 };
  }

  // Consecutive days read, counting back from today (or yesterday if today has no reading yet).
  streak(): number {
    const days = new Set(this.repo.read().readingDays);
    if (days.size === 0) return 0;
    const now = new Date();
    let cursor = days.has(this.isoDay(now)) ? now : new Date(now.getTime() - DAY_MS);
    if (!days.has(this.isoDay(cursor))) return 0;
    let count = 0;
    while (days.has(this.isoDay(cursor))) {
      count += 1;
      cursor = new Date(cursor.getTime() - DAY_MS);
    }
    return count;
  }

  private isoDay(date: Date): string {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${date.getFullYear()}-${month}-${day}`;
  }
}

export const readingStatsService = new ReadingStatsService();
