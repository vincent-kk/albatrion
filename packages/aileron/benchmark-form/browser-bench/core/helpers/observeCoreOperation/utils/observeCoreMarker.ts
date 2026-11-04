// Browser-owned clocks: MutationObserver delivery is the page's; only the clock reading is injected.
import type {
  CoreMarkerObservation,
  CoreMarkerTransition,
  CoreObservationEnv,
} from '../../../types';

/** Element attribute carrying the marker's error state. */
const ERROR_ATTRIBUTE = 'data-core-error';

/** Marker elements inside a mutation record's added nodes. */
const addedMarkers = (record: MutationRecord): Element[] =>
  [...record.addedNodes].flatMap((node) =>
    node instanceof Element
      ? node.matches('[data-core-marker]')
        ? [node]
        : [...node.querySelectorAll('[data-core-marker]')]
      : [],
  );

/**
 * Watch the single marker of the measured path for error-state changes and insertions.
 * @param container - Fresh form root; the marker may be re-created by a rebuild.
 * @param env - Browser-owned clock read inside the mutation callback.
 * @returns Transitions in DOM order with consecutive duplicates dropped, plus live state and count.
 */
export function observeCoreMarker(
  container: HTMLElement,
  env: CoreObservationEnv,
): CoreMarkerObservation {
  const transitions: CoreMarkerTransition[] = [];
  const push = (value: string | null) => {
    if (value !== '0' && value !== '1') return;
    if (transitions[transitions.length - 1]?.state === value) return;
    transitions.push({ atMs: env.now(), state: value });
  };
  const observer = new MutationObserver((records) => {
    for (const record of records) {
      if (record.type === 'attributes' && record.target instanceof Element)
        push(record.target.getAttribute(ERROR_ATTRIBUTE));
      for (const marker of addedMarkers(record))
        push(marker.getAttribute(ERROR_ATTRIBUTE));
    }
  });
  observer.observe(container, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: [ERROR_ATTRIBUTE],
  });
  return {
    transitions,
    state() {
      const value = container
        .querySelector('[data-core-marker]')
        ?.getAttribute(ERROR_ATTRIBUTE);
      return value === '0' || value === '1' ? value : null;
    },
    count: () => container.querySelectorAll('[data-core-marker]').length,
  };
}
