import type { CoreInputObservation, CoreInputRecord } from '../types';

/**
 * Observe native capture/bubble boundaries around React's delegated handlers.
 * @param container - Count only controls inside this page's fresh form root.
 * @returns Explicit activation, passive evidence, and listener cleanup.
 */
export function observeCoreInputs(
  container: HTMLElement,
): CoreInputObservation {
  const records: CoreInputRecord[] = [];
  const pending = new WeakMap<Event, CoreInputRecord>();
  let active = false;
  const capture = (event: Event) => {
    const target = event.target;
    if (
      !active ||
      !(
        target instanceof HTMLInputElement ||
        target instanceof HTMLSelectElement
      ) ||
      !container.contains(target)
    )
      return;
    if (
      event.type !== (target instanceof HTMLSelectElement ? 'change' : 'input')
    )
      return;
    const record = {
      start: performance.now(),
      trusted: event.isTrusted,
      value: target.value,
    };
    records.push(record);
    pending.set(event, record);
  };
  const bubble = (event: Event) => {
    const record = pending.get(event);
    if (record) record.durationMs = performance.now() - record.start;
  };
  for (const type of ['input', 'change']) {
    document.addEventListener(type, capture, true);
    document.addEventListener(type, bubble);
  }
  return {
    records,
    begin() {
      records.length = 0;
      active = true;
    },
    stop() {
      active = false;
      for (const type of ['input', 'change']) {
        document.removeEventListener(type, capture, true);
        document.removeEventListener(type, bubble);
      }
    },
  };
}
