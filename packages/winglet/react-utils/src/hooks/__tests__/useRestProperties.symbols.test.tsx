import { cleanup, renderHook } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { useRestProperties } from '../useRestProperties';

afterEach(cleanup);

it('a changed enumerable symbol property is returned like a changed string property', () => {
  const metadata = Symbol('renderer-metadata');
  const initial = { label: 'item', [metadata]: { selected: false } };
  const next = { label: 'item', [metadata]: { selected: true } };
  const { result, rerender } = renderHook(
    ({ input }) => useRestProperties(input),
    { initialProps: { input: initial } },
  );
  rerender({ input: next });
  expect(result.current[metadata]).toBe(next[metadata]);
});

it('a removed enumerable symbol property disappears like a removed string property', () => {
  const metadata = Symbol('renderer-metadata');
  const initial: { label: string; [metadata]?: boolean } = {
    label: 'item',
    [metadata]: true,
  };
  const { result, rerender } = renderHook(
    ({ input }) => useRestProperties(input),
    { initialProps: { input: initial } },
  );
  rerender({ input: { label: 'item' } });
  expect(Object.getOwnPropertySymbols(result.current).includes(metadata)).toBe(
    false,
  );
});

it('compares symbol identity and ignores non-enumerable symbols', () => {
  const previous = Symbol('metadata');
  const replacement = Symbol('metadata');
  const hidden = Symbol('hidden');
  const initial: Record<symbol, undefined> = { [previous]: undefined };
  const next = { [replacement]: undefined };
  const { result, rerender } = renderHook(
    ({ input }: { input: object }) => useRestProperties(input),
    { initialProps: { input: initial } },
  );
  rerender({ input: next });
  expect(result.current).toBe(next);
  rerender({
    input: Object.defineProperty({ ...next }, hidden, { value: true }),
  });
  expect(result.current).toBe(next);
});
