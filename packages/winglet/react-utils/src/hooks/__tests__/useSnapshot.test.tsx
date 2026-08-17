import { Suspense, startTransition, useState } from 'react';

import { act, render, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useSnapshot } from '../useSnapshot';
import { useSnapshotReference } from '../useSnapshotReference';

describe('useSnapshot', () => {
  it('should return a snapshot of the object', () => {
    const object = { value: 'test' };
    const { result } = renderHook(() => useSnapshot(object));

    expect(result.current).toBe(object);
  });

  it('should return a new snapshot when the object changes', () => {
    const object1 = { value: 'test1' };
    const object2 = { value: 'test2' };
    const { result, rerender } = renderHook(({ value }) => useSnapshot(value), {
      initialProps: { value: object1 },
    });

    expect(result.current).toBe(object1);

    rerender({ value: object2 });
    expect(result.current).toBe(object2);
  });

  it('should be able to exclude specific properties via the omit option', () => {
    const object = { value: 'test', excluded: 'excluded' };
    const { result } = renderHook(() => useSnapshot(object, ['excluded']));

    expect(result.current).toBe(object);
  });
});

describe('useSnapshotReference', () => {
  it('should return a snapshot reference of the object', () => {
    const object = { value: 'test' };
    const { result } = renderHook(() => useSnapshotReference(object));

    expect(result.current.current).toBe(object);
  });

  it('should return a new snapshot reference when the object changes', () => {
    const object1 = { value: 'test1' };
    const object2 = { value: 'test2' };
    const { result, rerender } = renderHook(
      ({ value }) => useSnapshotReference(value),
      {
        initialProps: { value: object1 },
      },
    );

    expect(result.current.current).toBe(object1);

    rerender({ value: object2 });
    expect(result.current.current).toBe(object2);
  });

  it('should be able to exclude specific properties via the omit option', () => {
    const object = { value: 'test', excluded: 'excluded' };
    const { result } = renderHook(() =>
      useSnapshotReference(object, ['excluded']),
    );

    expect(result.current.current).toBe(object);
  });

  it('should keep the same reference when re-rendering with the same object', () => {
    const object = { value: 'test' };
    const { result, rerender } = renderHook(
      ({ value }) => useSnapshotReference(value),
      {
        initialProps: { value: object },
      },
    );

    const firstRef = result.current;
    expect(firstRef.current).toBe(object);

    rerender({ value: object });
    expect(result.current).toBe(firstRef);
    expect(result.current.current).toBe(object);
  });
});

describe('useSnapshot and useSnapshotReference hooks', () => {
  describe('useSnapshotReference', () => {
    it('should return the same reference for the same object', () => {
      const obj = { a: 1, b: 2 };
      const { result, rerender } = renderHook(() => useSnapshotReference(obj));

      const firstRef = result.current;
      rerender();
      const secondRef = result.current;

      expect(firstRef).toBe(secondRef);
    });

    it('should return a new reference when the object content changes', () => {
      const { result, rerender } = renderHook(
        ({ obj }) => useSnapshotReference(obj),
        { initialProps: { obj: { a: 1, b: 2 } } },
      );

      const first = result.current.current;
      rerender({ obj: { a: 1, b: 3 } }); // change the b value
      const second = result.current.current;

      expect(first).not.toBe(second);
    });

    it('should return the same reference when an empty object changes to another empty object', () => {
      const { result, rerender } = renderHook(
        ({ obj }) => useSnapshotReference(obj),
        { initialProps: { obj: {} } },
      );

      const first = result.current.current;
      rerender({ obj: {} }); // a new empty object
      const second = result.current.current;

      expect(first).toBe(second);
    });

    it('should return a new reference when an empty object changes to an empty array', () => {
      const { result, rerender } = renderHook(
        ({ obj }) => useSnapshotReference(obj as any),
        { initialProps: { obj: {} } },
      );

      const first = result.current.current;
      rerender({ obj: [] }); // change from an empty object to an empty array
      const second = result.current.current;

      expect(first).not.toBe(second);
    });

    it('should return the empty object when a non-empty object becomes empty', () => {
      const filled = { a: 1 };
      const empty = {};
      const { result, rerender } = renderHook(
        ({ obj }) => useSnapshotReference(obj),
        { initialProps: { obj: filled as Record<string, number> } },
      );

      rerender({ obj: empty });

      expect(result.current.current).toBe(empty);
    });

    it('should return the empty array when a non-empty array becomes empty', () => {
      const filled = [1, 2];
      const empty: number[] = [];
      const { result, rerender } = renderHook(
        ({ arr }) => useSnapshotReference(arr),
        { initialProps: { arr: filled } },
      );

      rerender({ arr: empty });

      expect(result.current.current).toBe(empty);
    });

    it('should not repeat the deep comparison while the input identity is unchanged', () => {
      let propertyReads = 0;
      const snapshot = {
        get value() {
          propertyReads++;
          return 1;
        },
      };
      const replacement = {
        get value() {
          propertyReads++;
          return 1;
        },
      };

      const { rerender } = renderHook(({ obj }) => useSnapshotReference(obj), {
        initialProps: { obj: snapshot },
      });

      // A new reference holding identical contents costs exactly one deep comparison.
      rerender({ obj: replacement });
      const readsAfterFirstComparison = propertyReads;
      expect(readsAfterFirstComparison).toBeGreaterThan(0);

      // Re-rendering with that very same reference must not compare again.
      rerender({ obj: replacement });
      rerender({ obj: replacement });

      expect(propertyReads).toBe(readsAfterFirstComparison);
    });

    it('should return a new reference when an array changes to an array with different content', () => {
      const { result, rerender } = renderHook(
        ({ arr }) => useSnapshotReference(arr),
        { initialProps: { arr: [1, 2, 3] } },
      );

      const first = result.current.current;
      rerender({ arr: [1, 2, 4] }); // change the array content
      const second = result.current.current;

      expect(first).not.toBe(second);
    });

    it('should be able to compare with specific properties excluded by the omit option', () => {
      const testObj = { a: 1, b: 2, c: 3 };
      type TestObjKey = keyof typeof testObj;

      const { result, rerender } = renderHook(
        ({ obj, omit }) => useSnapshotReference(obj, omit),
        { initialProps: { obj: testObj, omit: ['c' as TestObjKey] } },
      );

      const first = result.current.current;
      // change only the c property
      rerender({ obj: { a: 1, b: 2, c: 4 }, omit: ['c' as TestObjKey] });
      const second = result.current.current;

      // c is excluded, so the reference must stay the same
      expect(first).toBe(second);

      // when a property that is not excluded changes, the reference must differ
      rerender({ obj: { a: 5, b: 2, c: 4 }, omit: ['c' as TestObjKey] });
      const third = result.current.current;

      expect(first).not.toBe(third);
    });

    it('should capture the omit option at the first comparison, not on mount', () => {
      const testObj = { a: 1, c: 3 };
      type TestObjKey = keyof typeof testObj;

      const { result, rerender } = renderHook(
        ({ obj, omit }) => useSnapshotReference(obj, omit),
        { initialProps: { obj: testObj, omit: ['c' as TestObjKey] } },
      );

      // The initial render has nothing to compare, so it never reaches the capture;
      // the omit carried by the first comparing render is the one that sticks.
      const changedOnlyInC = { a: 1, c: 4 };
      rerender({ obj: changedOnlyInC, omit: [] });

      expect(result.current.current).toBe(changedOnlyInC);
    });
  });

  describe('useSnapshot', () => {
    it('should return the same value for the same object', () => {
      const obj = { a: 1, b: 2 };
      const { result, rerender } = renderHook(() => useSnapshot(obj));

      const firstValue = result.current;
      rerender();
      const secondValue = result.current;

      expect(firstValue).toBe(secondValue);
    });

    it('should return a new value when an empty object changes to an empty array', () => {
      const { result, rerender } = renderHook(
        ({ obj }) => useSnapshot(obj as any),
        { initialProps: { obj: {} } },
      );

      const firstValue = result.current;
      rerender({ obj: [] });
      const secondValue = result.current;

      expect(firstValue).not.toBe(secondValue);
    });
  });
});

describe('useSnapshot under concurrent rendering', () => {
  it('should not keep a snapshot written by a render React discarded', () => {
    const committedPayload = { tag: 'A' };
    const transitionPayload = { tag: 'B' };
    const neverResolves = new Promise<never>(() => {});
    const observed: Array<{ prop: string; rendered: string }> = [];

    let bumpProbe = () => {};
    let startSuspendingTransition = () => {};

    const Suspender = ({ suspended }: { suspended: boolean }) => {
      if (suspended) throw neverResolves;
      return null;
    };

    const Probe = ({ payload }: { payload: { tag: string } }) => {
      const [, setTick] = useState(0);
      bumpProbe = () => setTick((tick) => tick + 1);
      const snapshot = useSnapshot(payload);
      observed.push({ prop: payload.tag, rendered: snapshot.tag });
      return <span>{snapshot.tag}</span>;
    };

    const App = () => {
      const [state, setState] = useState({
        suspended: false,
        payload: committedPayload,
      });
      startSuspendingTransition = () =>
        setState({ suspended: true, payload: transitionPayload });
      return (
        <Suspense fallback={<span>loading</span>}>
          <Probe payload={state.payload} />
          <Suspender suspended={state.suspended} />
        </Suspense>
      );
    };

    render(<App />);

    // Renders Probe with the new payload, then suspends and is thrown away.
    act(() => {
      startTransition(startSuspendingTransition);
    });

    // An urgent update re-renders Probe from the still-committed payload.
    act(() => {
      bumpProbe();
    });

    // Every render must report the payload it was actually given.
    expect(observed.filter(({ prop, rendered }) => prop !== rendered)).toEqual(
      [],
    );
  });
});
