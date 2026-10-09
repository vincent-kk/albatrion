import { createRef, useState } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { Form, type FormHandle } from '@/schema-form/components/Form';
import type { FormTypeInputProps, FormTypeRendererProps } from '@/schema-form/types';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

const schema = {
  type: 'object' as const,
  properties: { bad: { type: 'string' as const }, good: { type: 'string' as const } },
};

/** Observe committed React boundary instances through the input's runtime fiber ancestry. */
const boundariesOf = (element: Element) => {
  const key = Object.keys(element).find((name) => name.startsWith('__reactFiber$'))!;
  const boundaries: object[] = [];
  let fiber = (element as unknown as Record<string, { return: unknown }>)[key] as {
    type?: { name?: string }; stateNode?: object; return?: unknown;
  } | null;
  while (fiber) {
    if (fiber.type?.name === 'ErrorBoundary') boundaries.push(fiber.stateNode!);
    fiber = fiber.return as typeof fiber;
  }
  return boundaries;
};

it.each(['renderer', 'formatError'] as const)('ERROR-044 RENDER_FAILED preserves reporter, path, identity and sink for %s', (source) => {
  const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
  const hostError = vi.fn();
  vi.stubGlobal('reportError', hostError);
  const error = new Error(source);
  const onError = vi.fn();
  const Renderer = ({ path, Input }: FormTypeRendererProps) => {
    if (source === 'renderer' && path === '/bad') throw error;
    return <Input />;
  };
  const view = render(<Form
    jsonSchema={schema} onError={onError} showError
    errors={[{ dataPath: '/bad', keyword: 'external', message: 'bad' }]}
    FormTypeGroupRenderer={Renderer}
    formatError={(_issue, node) => {
      if (source === 'formatError' && node.path === '/bad') throw error;
      return null;
    }}
  />);
  expect(view.container.querySelector('input[name="good"]')).not.toBeNull();
  expect(view.container.querySelector('input[name="bad"]')).toBeNull();
  const records = onError.mock.calls.map(([record]) => record).filter((record) => record.error === error);
  expect(records).toHaveLength(1);
  expect(records[0]).toMatchObject({
    code: 'SCHEMA_FORM_ERROR.RENDER_FAILED', level: 'error', surface: 'sink',
    path: '/bad', error, componentStack: expect.any(String),
  });
  expect(records[0].error).toBe(error);
  expect(records[0].componentStack.length).toBeGreaterThan(0);
  expect(consoleError.mock.calls.some(([message, caught]) =>
    message === 'ErrorBoundary caught an error:' && caught === error)).toBe(true);
  expect(hostError).not.toHaveBeenCalled();
});

it.each(['renderer', 'formatError'] as const)('ERROR-044 preserves console surfacing without a consumer for %s', (source) => {
  const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
  const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  const error = new Error(source);
  const Renderer = ({ path, Input }: FormTypeRendererProps) => {
    if (source === 'renderer' && path === '/bad') throw error;
    return <Input />;
  };
  const view = render(<Form jsonSchema={schema} showError
    errors={[{ dataPath: '/bad', keyword: 'external', message: 'bad' }]}
    FormTypeGroupRenderer={Renderer}
    formatError={(_issue, node) => {
      if (source === 'formatError' && node.path === '/bad') throw error;
      return null;
    }}
  />);
  expect(view.container.querySelector('input[name="good"]')).not.toBeNull();
  const records = consoleWarn.mock.calls.map(([, record]) => record).filter((record) => record?.error === error);
  expect(records).toHaveLength(1);
  expect(records[0]).toMatchObject({ path: '/bad', surface: 'sink', code: 'SCHEMA_FORM_ERROR.RENDER_FAILED' });
  expect(consoleError.mock.calls.some(([message, caught]) =>
    message === 'ErrorBoundary caught an error:' && caught === error)).toBe(true);
});

it('112C-01 EVENT-039 keeps all boundaries mounted while Refresh re-keys only its input', () => {
  const ref = createRef<FormHandle>();
  const mounts: Record<string, number> = {};
  const Input = ({ path, defaultValue }: FormTypeInputProps) => {
    useState(() => { mounts[path] = (mounts[path] ?? 0) + 1; });
    return <input id={path} defaultValue={defaultValue} />;
  };
  const view = render(<Form ref={ref} jsonSchema={schema} onError={() => {}}
    defaultValue={{ bad: 'committed', good: 'peer' }}
    formTypeInputDefinitions={[{ test: { type: 'string' }, Component: Input }]}
  />);
  const initial = view.container.querySelector('[id="/bad"]') as HTMLInputElement;
  const peer = view.container.querySelector('[id="/good"]')!;
  const boundaries = boundariesOf(initial);
  expect(boundaries.length).toBeGreaterThanOrEqual(3);
  initial.value = 'draft';
  initial.setSelectionRange(1, 3);
  act(() => ref.current!.refresh('/bad'));
  const refreshed = view.container.querySelector('[id="/bad"]') as HTMLInputElement;
  expect(refreshed).not.toBe(initial);
  expect(refreshed.value).toBe('committed');
  expect(refreshed.selectionStart).toBe(refreshed.selectionEnd);
  expect(boundariesOf(refreshed)).toEqual(boundaries);
  expect(view.container.querySelector('[id="/good"]')).toBe(peer);
  expect(mounts).toEqual({ '/bad': 2, '/good': 1 });
});

it.each(['renderer', 'formatError'] as const)('112C-01 keeps a failed %s boundary through Refresh and peer writes', (source) => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  const ref = createRef<FormHandle>();
  const onError = vi.fn();
  let fail = true;
  const Renderer = ({ path, Input }: FormTypeRendererProps) => {
    if (source === 'renderer' && path === '/bad' && fail) throw new Error(source);
    return <Input />;
  };
  const view = render(<Form ref={ref} onError={onError} jsonSchema={schema} showError
    errors={[{ dataPath: '/bad', keyword: 'external', message: 'bad' }]}
    FormTypeGroupRenderer={Renderer}
    formatError={(_issue, node) => {
      if (source === 'formatError' && node.path === '/bad' && fail) throw new Error(source);
      return null;
    }}
  />);
  const peer = view.container.querySelector('input[name="good"]');
  fail = false;
  act(() => ref.current!.refresh('/bad'));
  act(() => ref.current!.findNode('/good')!.setValue('peer'));
  expect(view.container.querySelector('input[name="bad"]')).toBeNull();
  expect(onError.mock.calls.filter(([record]) => record.code === 'SCHEMA_FORM_ERROR.RENDER_FAILED')).toHaveLength(1);
  if (source === 'renderer') {
    const currentPeer = view.container.querySelector('input[name="good"]');
    act(() => ref.current!.remount('/bad'));
    expect(view.container.querySelector('input[name="bad"]')).not.toBeNull();
    expect(view.container.querySelector('input[name="good"]')).toBe(currentPeer);
  }
  expect(view.container.querySelector('input[name="good"]')).not.toBe(peer);
});
