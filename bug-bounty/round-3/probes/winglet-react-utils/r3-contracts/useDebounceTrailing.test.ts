import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { useDebounce } from '../../hooks/useDebounce';

beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
});

/**
 * docs/agents/skills/react-utils-skill/knowledge/hooks.md:85: the default (`immediate: true`)
 * fires "immediately when idle and suppress[es] the trailing call".
 */
it('default useDebounce fires once per burst of dependency changes, with no trailing call', () => {
  const callback = vi.fn();
  let query = 'a';
  const { rerender } = renderHook(() => useDebounce(callback, [query], 300));
  expect(callback).toHaveBeenCalledTimes(1);

  // The user keeps typing within the window: one burst of changes.
  query = 'ab';
  rerender();
  act(() => {
    vi.advanceTimersByTime(100);
  });
  query = 'abc';
  rerender();
  act(() => {
    vi.advanceTimersByTime(1000);
  });

  expect(callback).toHaveBeenCalledTimes(1);
});
