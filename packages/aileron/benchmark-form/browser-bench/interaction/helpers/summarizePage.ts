import type { PageRecord } from '../types';

/**
 * Reduce a page without discarding raw API evidence or conflating censored and complete observations.
 * @param page - Entire fresh-page record with fixed interaction-window boundaries
 * @returns Per-sample distributions and counts used for across-sample reporting
 */
export function summarizePage(page: PageRecord) {
  const distribution = (values: number[]) => {
    const sorted = [...values].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    return {
      count: sorted.length,
      median: sorted.length
        ? sorted.length % 2
          ? sorted[middle]
          : (sorted[middle - 1] + sorted[middle]) / 2
        : null,
      p95: sorted.length ? sorted[Math.ceil(sorted.length * 0.95) - 1] : null,
    };
  };
  const interactions = new Map<number, { processing: number; total: number }>();
  for (const event of page.events) {
    if (
      event.startTime < page.start ||
      event.startTime > page.end ||
      !event.interactionId
    )
      continue;
    const previous = interactions.get(event.interactionId);
    interactions.set(event.interactionId, {
      processing: Math.max(
        previous?.processing ?? 0,
        event.processingEnd - event.processingStart,
      ),
      total: Math.max(previous?.total ?? 0, event.duration),
    });
  }
  const frames = page.frames.filter(
    (frame) =>
      frame.startTime <= page.end &&
      frame.startTime + frame.duration >= page.start,
  );
  const deliveries = page.handlers
    .map((handler) =>
      page.validations.find(
        (delivery) => delivery.sequence === handler.sequence,
      ),
    )
    .filter((value) => value !== undefined);
  return {
    processing: distribution(
      [...interactions.values()].map((value) => value.processing),
    ),
    total: distribution([...interactions.values()].map((value) => value.total)),
    handler: distribution(page.handlers.map((handler) => handler.wallMs!)),
    validation: distribution(deliveries.map((delivery) => delivery.arrivalMs)),
    undelivered: page.handlers.length - deliveries.length,
    longestFrame: frames.length
      ? Math.max(...frames.map((frame) => frame.duration))
      : 0,
    longFrameCount: frames.filter((frame) => frame.duration >= 50).length,
    eventSupported: page.supported.includes('event'),
    frameSupported: page.supported.includes('long-animation-frame'),
    mount: page.mount,
  };
}
