import type {
  CoreLongTaskEntry,
  CoreLongTaskSource,
  CoreObservationEnv,
} from '../../../types';

/** Window view of the Long Tasks delivered to one observer. */
export interface CoreLongTaskSummary {
  /** Longest original duration among tasks overlapping the window; null when none. */
  maxLongTaskMs: number | null;
  /** Sum of the overlapping parts inside the window. */
  longTaskOverlapMs: number;
}

/** Armed Long Task observer. */
export interface CoreLongTaskObservation {
  /** Wait one macrotask, collect queued entries, disconnect, and summarize the window. */
  finish(startMs: number, endMs: number): Promise<CoreLongTaskSummary>;
}

/** Part of one task inside [startMs, endMs]; 0 when disjoint. */
const overlapOf = (entry: CoreLongTaskEntry, startMs: number, endMs: number) =>
  Math.max(
    0,
    Math.min(entry.startTime + entry.duration, endMs) -
      Math.max(entry.startTime, startMs),
  );

/**
 * Register a buffered Long Task observer before the operation starts.
 * @param source - PerformanceObserver-like delivery; production passes `observe({ type: 'longtask', buffered: true })`.
 * @param env - Browser-owned timer used for the post-settle macrotask.
 * @returns A handle whose `finish` keeps only tasks overlapping the window and separates original length from overlap.
 */
export function observeCoreLongTasks(
  source: CoreLongTaskSource,
  env: CoreObservationEnv,
): CoreLongTaskObservation {
  const entries: CoreLongTaskEntry[] = [];
  const observer = source((delivered) => {
    entries.push(...delivered);
  });
  return {
    async finish(startMs, endMs) {
      await new Promise<void>((resolve) => env.setTimeout(resolve, 0));
      entries.push(...observer.takeRecords());
      observer.disconnect();
      const overlapping = entries.filter(
        (entry) => overlapOf(entry, startMs, endMs) > 0,
      );
      return {
        maxLongTaskMs: overlapping.length
          ? Math.max(...overlapping.map((entry) => entry.duration))
          : null,
        longTaskOverlapMs: overlapping.reduce(
          (sum, entry) => sum + overlapOf(entry, startMs, endMs),
          0,
        ),
      };
    },
  };
}
