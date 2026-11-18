import { Component, StrictMode, Suspense, startTransition, useLayoutEffect, useState, type PropsWithChildren } from 'react';
import { act, render } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { useHandle } from '../useHandle';
import { useOnUnmount } from '../useOnUnmount';
import { useOnUnmountLayout } from '../useOnUnmountLayout';
import { useTimeout } from '../useTimeout';
import { useVersion } from '../useVersion';

it('round-3 react-utils 2: a suspended and abandoned render is equivalent to a render never attempted', async () => {
  for (const strict of [false, true]) {
    let handle = () => '';
    let setValue = (_value: string) => {};
    let release = () => {};
    const pending = new Promise<void>(resolve => { release = resolve; });
    const cleanups: string[] = [];
    const Probe = () => {
      const [value, set] = useState('A'); setValue = set;
      handle = useHandle(() => value);
      useOnUnmount(() => cleanups.push('passive:' + value));
      useOnUnmountLayout(() => cleanups.push('layout:' + value));
      if (value === 'B') throw pending;
      return <span>{value}</span>;
    };
    const app = <Suspense fallback="loading"><Probe /></Suspense>;
    const view = render(strict ? <StrictMode>{app}</StrictMode> : app);
    const before = handle(); cleanups.length = 0;
    await act(async () => { startTransition(() => setValue('B')); });
    expect(handle()).toBe(before);
    await act(async () => { setValue('C'); });
    expect(handle()).toBe(view.container.textContent);
    await act(async () => { release(); await pending; });
    expect(handle()).toBe('C');
    view.unmount();
    expect(cleanups).toEqual(['layout:C', 'passive:C']);
  }
});

it('round-3 react-utils 2: unmount cleanup reads the same commit as the still-visible DOM', async () => {
  let update = (_value: string) => {};
  const pending = new Promise<void>(() => {});
  const cleanups: string[] = [];
  const Probe = () => {
    const [value, set] = useState('committed'); update = set;
    useOnUnmount(() => cleanups.push(value));
    useOnUnmountLayout(() => cleanups.push(value));
    if (value === 'discarded') throw pending;
    return <span>{value}</span>;
  };
  const view = render(<Suspense fallback="loading"><Probe /></Suspense>);
  await act(async () => { startTransition(() => update('discarded')); });
  const shown = view.container.textContent;
  view.unmount();
  expect(cleanups).toEqual([shown, shown]);
});

it('round-3 react-utils 2: a child layout effect sees the current parent commit', () => {
  const seen: string[] = [];
  const Child = ({ handle, value }: {handle: () => string; value: string}) => {
    useLayoutEffect(() => { seen.push(handle()); }, [handle, value]);
    return <span>{value}</span>;
  };
  const Parent = ({value}: {value: string}) => {
    const handle = useHandle(() => value);
    return <Child value={value} handle={handle} />;
  };
  const view = render(<Parent value="A" />);
  view.rerender(<Parent value="B" />);
  expect(seen).toEqual(['A', view.container.textContent]);
  view.unmount();
});

it('round-3 react-utils 2: a throwing render and its retry do not replace the committed handler', async () => {
  class Boundary extends Component<PropsWithChildren, {failed: boolean}> {
    state = {failed: false};
    static getDerivedStateFromError() {return {failed: true};}
    render() {return this.state.failed ? <button onClick={() => this.setState({failed: false})}>retry</button> : this.props.children;}
  }
  let handle = () => '';
  const cleanups: string[] = [];
  let shouldThrow = false;
  const Probe = ({value}: {value: string}) => {
    handle = useHandle(() => value);
    useOnUnmount(() => cleanups.push(value));
    useOnUnmountLayout(() => cleanups.push(value));
    if (shouldThrow) throw new Error('render failed');
    return <span>{value}</span>;
  };
  const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
  try {
    const view = render(<Boundary><Probe value="A" /></Boundary>);
    const committed = handle(); shouldThrow = true;
    view.rerender(<Boundary><Probe value="B" /></Boundary>);
    expect(handle()).toBe(committed);
    expect(cleanups).toEqual([committed, committed]);
    shouldThrow = false;
    await act(async () => { view.getByText('retry').click(); });
    expect(handle()).toBe(view.container.textContent);
    view.unmount();
  } finally {errors.mockRestore();}
});

it.each(['timeout', 'version'])('round-3 react-utils 2 sibling: %s callbacks match the visible committed render', async (kind) => {
  vi.useFakeTimers();
  try {
    const seen: string[] = [];
    let setValue = (_value: string) => {};
    let invoke = () => {};
    const pending = new Promise<void>(() => {});
    const Probe = () => {
      const [value, set] = useState('committed'); setValue = set;
      const timeout = useTimeout(() => seen.push(value), 10);
      const [, update] = useVersion(() => seen.push(value));
      invoke = kind === 'timeout' ? timeout.schedule : update;
      if (value === 'discarded') throw pending;
      return <span>{value}</span>;
    };
    const view = render(<Suspense fallback="loading"><Probe /></Suspense>);
    await act(async () => { startTransition(() => setValue('discarded')); });
    const shown = view.container.textContent;
    act(() => { invoke(); if (kind === 'timeout') vi.advanceTimersByTime(20); });
    expect(seen).toEqual([shown]);
    view.unmount();
  } finally { vi.useRealTimers(); }
});
