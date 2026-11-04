import { createRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { Form, type FormHandle } from '@/schema-form/components/Form';
import * as core from '@/schema-form/core';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it('D4 does not flush a caller-delivered rebuild mount failure after a later render failure', () => {
  const host = vi.fn();
  vi.stubGlobal('reportError', host);
  vi.spyOn(console, 'error').mockImplementation(() => {});
  const ref = createRef<FormHandle>();
  const onError = vi.fn();
  const mountFailure = new Error('D4 rebuild mount');
  const renderFailure = new Error('D4 later render');
  const schema = { type: 'string' } as const;
  const Broken = () => {
    throw renderFailure;
  };
  const view = render(
    <Form
      ref={ref}
      jsonSchema={schema}
      validationMode={core.ValidationMode.None}
      onError={onError}
    >
      <span />
    </Form>,
  );
  const previous = ref.current!.node;
  vi.spyOn(core, 'mountFieldNode').mockImplementationOnce(() => {
    throw mountFailure;
  });
  act(() => {
    expect(() => ref.current!.rebuild()).toThrow(mountFailure);
  });
  expect(ref.current!.node).not.toBe(previous);
  view.rerender(
    <Form
      ref={ref}
      jsonSchema={schema}
      validationMode={core.ValidationMode.None}
      onError={onError}
    >
      <span />
    </Form>,
  );
  const hostBefore = host.mock.calls.filter(
    ([error]) => error === mountFailure,
  ).length;
  const recordsBefore = onError.mock.calls.filter(
    ([record]) => record.error === mountFailure,
  ).length;
  view.rerender(
    <Form
      ref={ref}
      jsonSchema={schema}
      validationMode={core.ValidationMode.None}
      onError={onError}
    >
      <Broken />
    </Form>,
  );
  expect(
    onError.mock.calls.some(([record]) => record.error === renderFailure),
  ).toBe(true);
  expect({
    host: host.mock.calls.filter(([error]) => error === mountFailure).length,
    records: onError.mock.calls.filter(
      ([record]) => record.error === mountFailure,
    ).length,
  }).toEqual({ host: hostBefore, records: recordsBefore });
});
