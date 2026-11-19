import { type RefObject, Suspense, memo, startTransition, useEffect, useLayoutEffect, useState } from 'react';
import { act, render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useRestProperties } from '../useRestProperties';
import { useSnapshot } from '../useSnapshot';
import { useSnapshotReference } from '../useSnapshotReference';
const neverSettles = new Promise<void>(() => {});

describe('render-time snapshot writes and abandoned renders (sibling of round-3 react-utils 2)', () => {
  it('useSnapshotReference: an event handler reads the committed snapshot, not a suspended transition', async () => {
    let setValue = (_value: { q: string }) => {};
    let committedRef: RefObject<{ q: string }> | null = null;
    const Probe = () => {
      const [value, set] = useState({ q: 'A' });
      setValue = set;
      const ref = useSnapshotReference(value);
      useLayoutEffect(() => {
        committedRef = ref;
      });
      if (value.q === 'B') throw neverSettles;
      return <span>{value.q}</span>;
    };
    const view = render(
      <Suspense fallback="loading">
        <Probe />
      </Suspense>,
    );
    await act(async () => {
      startTransition(() => setValue({ q: 'B' }));
    });
    expect({
      shown: view.container.textContent,
      handled: committedRef!.current.q,
    }).toEqual({ shown: 'A', handled: 'A' });
  });

  const runSnapshotScenario = async (withAbandonedTransition: boolean) => {
    let setValue = (_value: { q: string }) => {};
    const effectRuns: Array<{ q: string }> = [];
    const Probe = () => {
      const [value, set] = useState({ q: 'A' });
      setValue = set;
      const snapshot = useSnapshot(value);
      useEffect(() => {
        effectRuns.push(snapshot);
      }, [snapshot]);
      if (value.q === 'B') throw neverSettles;
      return <span>{value.q}</span>;
    };
    const view = render(
      <Suspense fallback="loading">
        <Probe />
      </Suspense>,
    );
    if (withAbandonedTransition)
      await act(async () => {
        startTransition(() => setValue({ q: 'B' }));
      });
    // An urgent update whose content equals the committed snapshot.
    await act(async () => {
      setValue({ q: 'A' });
    });
    return {
      shown: view.container.textContent,
      effectRuns: effectRuns.length,
      sameIdentity: effectRuns[effectRuns.length - 1] === effectRuns[0],
    };
  };

  it('control: useSnapshot keeps its identity for an equal input without an abandoned render', async () => {
    expect(await runSnapshotScenario(false)).toEqual({
      shown: 'A',
      effectRuns: 1,
      sameIdentity: true,
    });
  });

  it('useSnapshot keeps its identity for an equal input after an abandoned transition render', async () => {
    expect(await runSnapshotScenario(true)).toEqual(await runSnapshotScenario(false));
  });

  const runRestScenario = async (withAbandonedTransition: boolean) => {
    let setValue = (_value: { title: string }) => {};
    let childRenders = 0;
    // The object itself is the prop, as when the stabilized rest object feeds a memoized child.
    const Child = memo((props: { options: { title: string } }) => {
      childRenders++;
      return <span>{props.options.title}</span>;
    });
    const Probe = () => {
      const [value, set] = useState({ title: 'A' });
      setValue = set;
      const rest = useRestProperties(value);
      if (value.title === 'B') throw neverSettles;
      return <Child options={rest} />;
    };
    render(
      <Suspense fallback="loading">
        <Probe />
      </Suspense>,
    );
    if (withAbandonedTransition)
      await act(async () => {
        startTransition(() => setValue({ title: 'B' }));
      });
    await act(async () => {
      setValue({ title: 'A' });
    });
    return { childRenders };
  };

  it('control: useRestProperties keeps the previous object for a shallow-equal input', async () => {
    expect(await runRestScenario(false)).toEqual({ childRenders: 1 });
  });

  it('useRestProperties keeps the previous object for a shallow-equal input after an abandoned transition render', async () => {
    expect(await runRestScenario(true)).toEqual(await runRestScenario(false));
  });
});

