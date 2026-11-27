// Browser-owned observer: PerformanceObserver delivery and buffered Long Task entries belong to the page.
import type { CoreLongTaskEntry, CoreLongTaskSource } from '../types';

/**
 * Register buffered Long Task delivery and retain an optional probe audit trail.
 * @param deliver - Receives entries while the observation is armed.
 * @param seen - Optional caller-owned evidence array, appended on callback and takeRecords delivery.
 * @returns The observer's drain and disconnect methods; pending records must be drained before disconnecting.
 */
export function createCoreLongTaskSource(
  deliver: Parameters<CoreLongTaskSource>[0],
  seen?: CoreLongTaskEntry[],
): ReturnType<CoreLongTaskSource> {
  const copy = (entries: PerformanceEntry[]) => {
    const copied = entries.map(({ startTime, duration }) => ({
      startTime,
      duration,
    }));
    seen?.push(...copied);
    return copied;
  };
  const observer = new PerformanceObserver((list) =>
    deliver(copy(list.getEntries())),
  );
  observer.observe({ type: 'longtask', buffered: true });
  return {
    takeRecords: () => copy(observer.takeRecords()),
    disconnect: () => observer.disconnect(),
  };
}
