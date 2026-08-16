import { act, renderHook } from '@testing-library/react';
import { bench, describe } from 'vitest';

import { useWindowSize } from '@/react-utils/hooks/useWindowSize';

/**
 * Cost of a resize storm.
 *
 * Real viewports emit `resize` far more often than they actually change size — mobile
 * URL-bar movement, scrollbar appearance and devtools docking all fire it — so the
 * no-op storm is the scenario that decides whether subscribers re-render for nothing.
 * It is measured against a storm that genuinely changes size, which must re-render.
 */

const EVENTS = 100;

/** jsdom exposes the dimensions as getters; redefining once makes them assignable for the run. */
const makeResizable = () => {
  for (const key of ['innerWidth', 'innerHeight'] as const)
    Object.defineProperty(window, key, {
      writable: true,
      configurable: true,
      value: 1024,
    });
};

/**
 * One `act` per event on purpose: wrapping the whole storm in a single `act` lets React
 * batch every update into one commit, which hides exactly the difference being measured.
 */
const dispatchResizes = (sizes: readonly [number, number][]) => {
  for (let index = 0, length = sizes.length; index < length; index++) {
    const [width, height] = sizes[index];
    act(() => {
      (window as { innerWidth: number }).innerWidth = width;
      (window as { innerHeight: number }).innerHeight = height;
      window.dispatchEvent(new Event('resize'));
    });
  }
};

const unchangedSizes: [number, number][] = Array.from(
  { length: EVENTS },
  () => [1024, 768],
);

const changingSizes: [number, number][] = Array.from(
  { length: EVENTS },
  (_, index) => [1024 + index, 768 + index],
);

describe('useWindowSize — resize storm', () => {
  bench('100 events, size unchanged', () => {
    makeResizable();
    const { unmount } = renderHook(() => useWindowSize());
    dispatchResizes(unchangedSizes);
    unmount();
  });

  bench('100 events, size changes every time', () => {
    makeResizable();
    const { unmount } = renderHook(() => useWindowSize());
    dispatchResizes(changingSizes);
    unmount();
  });
});
