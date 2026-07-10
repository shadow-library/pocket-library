/**
 * Importing npm packages
 */
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';

/**
 * Importing user defined packages
 */
import { content } from '@/core/content';
import type { Novel } from '@/core/types/novel.types';
import { useLibraryStore } from '@/stores/use-library-store';

/**
 * Defining types
 */

export type RecentEntry = { novel: Novel; percent: number; chapter: number; total: number; finished: boolean; when: string };
export type RecentGroup = { label: string; entries: RecentEntry[] };
export type RecentScreenModel = { groups: RecentGroup[]; open: (novel: Novel) => void };

/**
 * Declaring the constants
 */

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function relativeTime(updatedAt: number, now: number): string {
  const delta = now - updatedAt;
  if (delta < MINUTE) return 'just now';
  if (delta < HOUR) return `${Math.round(delta / MINUTE)} min ago`;
  if (delta < DAY) return `${Math.round(delta / HOUR)} hr ago`;
  if (delta < 7 * DAY) return WEEKDAYS[new Date(updatedAt).getDay()];
  return new Date(updatedAt).toLocaleDateString();
}

function bucket(updatedAt: number, now: number): 'today' | 'earlier' | 'older' {
  const startOfToday = new Date(now).setHours(0, 0, 0, 0);
  if (updatedAt >= startOfToday) return 'today';
  if (now - updatedAt < 7 * DAY) return 'earlier';
  return 'older';
}

export function useRecentScreen(): RecentScreenModel {
  const router = useRouter();
  const novels = useLibraryStore((state) => state.novels);
  const [now] = useState(() => Date.now());

  const groups = useMemo<RecentGroup[]>(() => {
    const read = novels
      .filter((novel): novel is Novel & { progress: NonNullable<Novel['progress']> } => novel.progress !== undefined)
      .sort((a, b) => b.progress.updatedAt - a.progress.updatedAt);

    const byBucket: Record<'today' | 'earlier' | 'older', RecentEntry[]> = { today: [], earlier: [], older: [] };
    for (const novel of read) {
      const total = novel.chapters.length;
      const position = (novel.progress.chapterIndex + novel.progress.scrollFraction) / Math.max(1, total);
      const finished = novel.progress.chapterIndex >= total - 1 && novel.progress.scrollFraction >= 0.98;
      const entry: RecentEntry = {
        novel,
        percent: Math.round(position * 100),
        chapter: novel.progress.chapterIndex + 1,
        total,
        finished,
        when: relativeTime(novel.progress.updatedAt, now),
      };
      byBucket[bucket(novel.progress.updatedAt, now)].push(entry);
    }

    return [
      { label: content.recent.today, entries: byBucket.today },
      { label: content.recent.earlier, entries: byBucket.earlier },
      { label: content.recent.older, entries: byBucket.older },
    ].filter((group) => group.entries.length > 0);
  }, [novels, now]);

  const open = (novel: Novel) => router.push({ pathname: '/reader/[id]', params: { id: novel.id, chapter: String(novel.progress?.chapterIndex ?? 0) } });

  return { groups, open };
}
