import { Activity, useEffect, useLayoutEffect } from 'react';
import { act, cleanup, render, renderHook } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { useRestProperties, useSnapshotReference, useTimeout } from '../../index';

afterEach(() => { cleanup(); vi.useRealTimers(); });

it('R1 a changed enumerable symbol property is returned like a changed string property', () => {
  const metadata = Symbol('renderer-metadata');
  const initial = { label: 'item', [metadata]: { selected: false } };
  const next = { label: 'item', [metadata]: { selected: true } };
  const { result, rerender } = renderHook(({ input }) => useRestProperties(input), { initialProps: { input: initial } });
  rerender({ input: next });
  expect(result.current[metadata]).toBe(next[metadata]);
});

it('R2 a removed enumerable symbol property disappears like a removed string property', () => {
  const metadata = Symbol('renderer-metadata');
  const initial: { label: string; [metadata]?: boolean } = { label: 'item', [metadata]: true };
  const { result, rerender } = renderHook(({ input }) => useRestProperties(input), { initialProps: { input: initial } });
  rerender({ input: { label: 'item' } });
  expect(Object.hasOwn(result.current, metadata)).toBe(false);
});

it('R3 a timer cannot be restarted by a child cleanup after its owner unmounts', () => {
  vi.useFakeTimers();
  const callback = vi.fn();
  function Child({ schedule }: { schedule: () => void }) {
    useEffect(() => () => schedule(), [schedule]);
    return null;
  }
  function Parent() {
    const { schedule } = useTimeout(callback, 50);
    useLayoutEffect(() => schedule(), [schedule]);
    return <Child schedule={schedule} />;
  }
  const view = render(<Parent />);
  view.unmount();
  act(() => vi.advanceTimersByTime(100));
  expect(callback).not.toHaveBeenCalled();
});

it('R4 snapshot references publish hidden updates and survive two Activity revivals', async () => {
  let reference: ReturnType<typeof useSnapshotReference<{ value: number }>> | undefined;
  function Reader({ value }: { value: number }) {
    reference = useSnapshotReference({ value });
    return <span>{value}</span>;
  }
  const app = (hidden: boolean, value: number) => <Activity mode={hidden ? 'hidden' : 'visible'}><Reader value={value} /></Activity>;
  const view = render(app(false, 0));
  const first = reference;
  for (let index = 1; index <= 2; index++) {
    await act(async () => view.rerender(app(true, index)));
    await act(async () => view.rerender(app(false, index)));
    expect(reference).toBe(first);
    expect(reference?.current).toEqual({ value: index });
  }
});
