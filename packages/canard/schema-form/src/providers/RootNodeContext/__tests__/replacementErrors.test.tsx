import { createRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { Form, type FormHandle } from '@/schema-form/components/Form';
import * as core from '@/schema-form/core';
import { FormErrorCode } from '@/schema-form/errors';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it.each([
  ['reset', new Error('DR-8 reset')],
  ['rebuild', 'DR-8 primitive'],
] as const)(
  'DR-8 reports a replacement %s failure once without a later host flush',
  (operation, failure) => {
    const host = vi.fn();
    vi.stubGlobal('reportError', host);
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const onError = vi.fn();
    const ref = createRef<FormHandle>();
    const first = { type: 'string' } as const;
    const next = { type: 'number' } as const;
    const Broken = () => {
      throw new Error('later render');
    };
    const view = render(
      <Form
        ref={ref}
        jsonSchema={first}
        onError={onError}
        validationMode={core.ValidationMode.None}
      >
        <span />
      </Form>,
    );
    view.rerender(
      <Form
        ref={ref}
        jsonSchema={next}
        onError={onError}
        validationMode={core.ValidationMode.None}
      >
        <span />
      </Form>,
    );
    vi.spyOn(core, 'mountFieldNode').mockImplementationOnce(() => {
      throw failure;
    });
    let caught: unknown;
    act(() => {
      try {
        ref.current![operation]();
      } catch (error) {
        caught = error;
      }
    });
    expect(caught).toBe(failure);
    expect(
      onError.mock.calls.filter(([record]) => record.error === failure),
    ).toHaveLength(1);
    expect(host).not.toHaveBeenCalled();
    view.rerender(
      <Form
        ref={ref}
        jsonSchema={next}
        onError={onError}
        validationMode={core.ValidationMode.None}
      >
        <Broken />
      </Form>,
    );
    expect(
      onError.mock.calls.filter(([record]) => record.error === failure),
    ).toHaveLength(1);
    expect(host).not.toHaveBeenCalled();
  },
);

it('DR-8 keeps no-root recovery listener failures inside applyFormErrors own chain', () => {
  const host = vi.fn();
  vi.stubGlobal('reportError', host);
  const onError = vi.fn();
  const ref = createRef<FormHandle>();
  const build = core.buildFieldNodeTree;
  vi.spyOn(core, 'buildFieldNodeTree').mockImplementationOnce(() => {
    throw new Error('initial construction');
  });
  const view = render(
    <Form
      ref={ref}
      jsonSchema={{ type: 'string' }}
      onError={onError}
      validationMode={core.ValidationMode.None}
    >
      <span />
    </Form>,
  );
  expect(ref.current!.node).toBeUndefined();
  view.rerender(
    <Form
      ref={ref}
      jsonSchema={{ type: 'number' }}
      errors={[{ dataPath: '', message: 'external' }]}
      onError={onError}
      validationMode={core.ValidationMode.None}
    >
      <span />
    </Form>,
  );
  vi.spyOn(core, 'buildFieldNodeTree').mockImplementationOnce((props) => {
    const node = build(props);
    node.subscribe(({ type }) => {
      if (type & core.FieldNodeEventType.UpdateError) throw 'DR-8 listener';
    });
    return node;
  });
  onError.mockClear();
  host.mockClear();
  let failure: unknown;
  act(() => {
    try {
      ref.current!.reset();
    } catch (error) {
      failure = error;
    }
  });
  expect(failure).toBeDefined();
  expect(onError).toHaveBeenCalledOnce();
  expect(onError.mock.calls[0][0]).toMatchObject({
    code: FormErrorCode.ListenerThrew,
  });
  expect(host).not.toHaveBeenCalled();
});

it('DR-8 limit: a primitive props-driven reset reports load then render once each', () => {
  const host = vi.fn();
  vi.stubGlobal('reportError', host);
  vi.spyOn(console, 'error').mockImplementation(() => {});
  const onError = vi.fn();
  const ref = createRef<FormHandle>();
  const first = { type: 'string' } as const;
  const next = { type: 'number' } as const;
  const before = { compile: () => () => [], compileGuard: () => () => true };
  const after = { compile: () => () => [], compileGuard: () => () => true };
  const view = render(
    <Form
      ref={ref}
      jsonSchema={first}
      validatorFactory={before}
      onError={onError}
      validationMode={core.ValidationMode.None}
    >
      <span />
    </Form>,
  );
  vi.spyOn(core, 'mountFieldNode').mockImplementationOnce(() => {
    throw 'DR-8 props primitive';
  });
  view.rerender(
    <Form
      ref={ref}
      jsonSchema={next}
      validatorFactory={after}
      onError={onError}
      validationMode={core.ValidationMode.None}
    >
      <span />
    </Form>,
  );
  expect(
    onError.mock.calls
      .filter(([record]) => record.error === 'DR-8 props primitive')
      .map(([record]) => record.origin),
  ).toEqual(['load', 'render']);
  expect(host).not.toHaveBeenCalled();
});
