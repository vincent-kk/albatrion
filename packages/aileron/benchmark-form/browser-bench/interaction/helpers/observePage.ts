import type { Entry, HandlerRecord, ValidationRecord } from '../types';

/**
 * Install passive measurements outside React's root; the browser supplies clocks and native events.
 * @param container - Only events originating inside this form count as interactions
 * @returns Mutable evidence and explicit begin/stop/delivery operations for this page
 */
export function observePage(container: HTMLElement) {
  const events: Entry[] = [],
    firstInputs: Entry[] = [],
    frames: Entry[] = [];
  const handlers: HandlerRecord[] = [],
    validations: ValidationRecord[] = [];
  const supported = [...PerformanceObserver.supportedEntryTypes];
  let active = false;
  let start = 0;
  const observers = (['event', 'first-input', 'long-animation-frame'] as const)
    .filter((type) => supported.includes(type))
    .map((type) => {
      const target =
        type === 'event'
          ? events
          : type === 'first-input'
            ? firstInputs
            : frames;
      const observer = new PerformanceObserver((list) => {
        target.push(...list.getEntries().map((entry) => entry.toJSON()));
      });
      observer.observe({
        type,
        buffered: true,
        ...(type === 'event' ? { durationThreshold: 16 } : {}),
      });
      return { observer, target };
    });
  const pending = new WeakMap<Event, HandlerRecord>();
  const capture = (event: Event) => {
    if (!active || !container.contains(event.target as Node)) return;
    const target = event.target as HTMLInputElement;
    if (event.type === 'input' && target.tagName === 'SELECT') return;
    if (event.type === 'change' && target.tagName !== 'SELECT') return;
    const record = {
      sequence: handlers.length + 1,
      type: event.type,
      start: performance.now(),
      value: target.value,
      trusted: event.isTrusted,
    };
    handlers.push(record);
    pending.set(event, record);
  };
  const bubble = (event: Event) => {
    const record = pending.get(event);
    if (!record) return;
    record.end = performance.now();
    record.wallMs = record.end - record.start;
  };
  for (const type of ['input', 'change']) {
    document.addEventListener(type, capture, true);
    document.addEventListener(type, bubble);
  }
  return {
    events,
    firstInputs,
    frames,
    handlers,
    validations,
    supported,
    begin() {
      start = performance.now();
      active = true;
      return start;
    },
    delivery(errors: number) {
      if (!active || !handlers.length) return;
      const latest = handlers[handlers.length - 1];
      const at = performance.now();
      validations.push({
        sequence: latest.sequence,
        at,
        arrivalMs: at - latest.start,
        value: latest.value,
        errors,
      });
    },
    stop() {
      active = false;
      for (const { observer, target } of observers) {
        target.push(...observer.takeRecords().map((entry) => entry.toJSON()));
        observer.disconnect();
      }
      return start;
    },
  };
}
