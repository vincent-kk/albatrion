import { StrictMode } from 'react';

import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { advanceValidationFrame } from '@/schema-form/__tests__/helpers/advanceValidationFrame';
import { Form } from '@/schema-form/components/Form';
import { VirtualizationManager } from '@/schema-form/helpers/virtualization';
import type { InputRendererProps } from '@/schema-form/types';

import { createRestructuringFrame } from './helpers/createRestructuringFrame';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it('starts a restructured frame input from the live draft and retains its files', () => {
  const view = createRestructuringFrame();
  expect(view.input().value).toBe('initial');
  const file = new File(['draft'], 'draft.txt');
  act(() => view.props().onFileAttach(file));
  fireEvent.change(view.input(), { target: { value: 'typed' } });
  const previous = view.input();

  act(() =>
    view.node.setExternalErrors([{ dataPath: '/field', message: 'bad' }]),
  );

  expect(view.input()).not.toBe(previous);
  expect(view.input().value).toBe('typed');
  expect(view.mounts()).toBe(2);
  expect(view.files().get('/field')).toEqual([file]);
  expect(view.node.value).toBe('typed');
  fireEvent.change(view.input(), { target: { value: 'next' } });
  expect(view.node.value).toBe('next');
  expect(view.input().value).toBe('next');
});

it('rejects value and file callbacks captured before the container replacement', () => {
  const view = createRestructuringFrame();
  const previous = view.props();
  const file = new File(['draft'], 'draft.txt');
  act(() => previous.onFileAttach(file));
  act(() =>
    view.node.setExternalErrors([{ dataPath: '/field', message: 'bad' }]),
  );

  act(() => previous.onChange('stale'));
  expect(view.node.value).toBe('initial');
  act(() => previous.onFileAttach(undefined));
  expect(view.files().get('/field')).toEqual([file]);
  act(() => view.props().onChange('current'));
  expect(view.node.value).toBe('current');
  act(() => view.props().onFileAttach(undefined));
  expect(view.files().has('/field')).toBe(false);
});

it('moves virtualization registration and focus from the detached container', () => {
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  const attach = vi.spyOn(VirtualizationManager.prototype, 'attachInput');
  const detach = vi.spyOn(VirtualizationManager.prototype, 'detachInput');
  const view = createRestructuringFrame(true);
  const previous = view.input().parentElement!;
  expect(attach).toHaveBeenCalledWith(previous, view.node);
  const manager =
    attach.mock.contexts[
      attach.mock.calls.findIndex(([element]) => element === previous)
    ];
  if (!(manager instanceof VirtualizationManager))
    throw new Error('input registration must use the form manager');

  act(() =>
    view.node.setExternalErrors([{ dataPath: '/field', message: 'bad' }]),
  );

  const current = view.input().parentElement!;
  expect(previous.isConnected).toBe(false);
  expect(detach).toHaveBeenCalledWith(previous);
  expect(attach).toHaveBeenCalledWith(current, view.node);
  expect(manager.inputsOf(view.node)).toEqual([current]);
  act(() => view.ref.current!.focus('/field'));
  expect(document.activeElement).toBe(view.input());
  view.unmount();
  expect(detach).toHaveBeenCalledWith(current);
  expect(manager.inputsOf(view.node)).toEqual([]);
});

it.each(['before', 'after'] as const)(
  'releases composition and applies a refresh requested %s frame restructuring',
  (timing) => {
    const view = createRestructuringFrame();
    const previous = view.input();
    fireEvent.compositionStart(previous);
    if (timing === 'before') act(() => view.node.setValue('refreshed'));

    act(() =>
      view.node.setExternalErrors([{ dataPath: '/field', message: 'bad' }]),
    );
    if (timing === 'after') act(() => view.node.setValue('refreshed'));

    expect(view.input()).not.toBe(previous);
    expect(view.input().value).toBe('refreshed');
    expect(view.node.value).toBe('refreshed');
  },
);

it('rejects a blur queued by the replaced container', async () => {
  const view = createRestructuringFrame();
  act(() => view.node.setState({ 2: false }));
  fireEvent.blur(view.input());
  act(() =>
    view.node.setExternalErrors([{ dataPath: '/field', message: 'bad' }]),
  );
  await advanceValidationFrame();
  expect(view.node.state[2]).toBe(false);
  fireEvent.blur(view.input());
  await advanceValidationFrame();
  expect(view.node.state[2]).toBe(true);
});

it('does not treat StrictMode mount ref reattachment as a replacement', () => {
  const frames = vi.fn(({ children }: InputRendererProps) => (
    <section>{children}</section>
  ));
  render(
    <StrictMode>
      <Form
        jsonSchema={{ type: 'string' }}
        InputRenderer={frames}
        validationMode={0}
      />
    </StrictMode>,
  );
  expect(frames).toHaveBeenCalledTimes(2);
});
