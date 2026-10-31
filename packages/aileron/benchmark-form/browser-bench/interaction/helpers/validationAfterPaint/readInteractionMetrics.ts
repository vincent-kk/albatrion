import type { PageRecord } from '../../types';

/** Group native Event Timing by interaction without mixing handler fallback into its distribution. */
export function readInteractionMetrics(page: PageRecord) {
  const interactions = new Map<
    number,
    { processing: number; duration: number; inputDelay: number }
  >();
  for (const event of page.events) {
    if (
      !event.interactionId ||
      event.startTime < page.start ||
      event.startTime > page.end
    )
      continue;
    const previous = interactions.get(event.interactionId);
    interactions.set(event.interactionId, {
      processing: Math.max(
        previous?.processing ?? 0,
        event.processingEnd - event.processingStart,
      ),
      duration: Math.max(previous?.duration ?? 0, event.duration),
      inputDelay: Math.max(
        previous?.inputDelay ?? 0,
        event.processingStart - event.startTime,
      ),
    });
  }
  return {
    processing: [...interactions.values()].map((value) => value.processing),
    duration: [...interactions.values()].map((value) => value.duration),
    inputDelay: [...interactions.values()].map((value) => value.inputDelay),
    handler: page.handlers
      .map((handler) => handler.wallMs!)
      .filter(Number.isFinite),
  };
}
