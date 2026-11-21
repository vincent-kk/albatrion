// Loaded by Vitest render/react18 projects; probes callbacks from a tree that rebuild() or a jsonSchema reset replaced.
import { act, cleanup, render } from '@testing-library/react';
import * as React from 'react';
import { afterEach, expect, it, vi } from 'vitest';

import { Form, ValidationMode } from '../../index';

afterEach(cleanup);

const schema = () =>
  ({
    type: 'object',
    properties: { name: { type: 'string', minLength: 3 } },
  }) as const;

async function setup() {
  const handle = React.createRef<any>();
  const onChange = vi.fn();
  const onValidate = vi.fn();
  const onStateChange = vi.fn();
  const props = {
    ref: handle,
    jsonSchema: schema(),
    defaultValue: { name: 'abc' },
    onChange,
    onValidate,
    onStateChange,
    validationMode: ValidationMode.OnChange,
  };
  const view = render(<Form {...props} />);
  await act(async () => {
    await new Promise((r) => setTimeout(r, 20));
  });
  return { handle, onChange, onValidate, onStateChange, view, props };
}

for (const replace of ['rebuild'] as const) {
  it(`hypothesis (passes): a node retained across ${replace} refuses writes and reports nothing`, async () => {
    const { handle, onChange, onValidate, onStateChange, view, props } = await setup();
    const stale = handle.current.findNode('/name');
    const staleRoot = handle.current.node;
    if (replace === 'rebuild') await act(async () => handle.current.rebuild());
    else {
      view.rerender(<Form {...props} jsonSchema={schema()} />);
      await act(async () => handle.current.reset());
    }
    await act(async () => {
      await new Promise((r) => setTimeout(r, 20));
    });
    expect(handle.current.node).not.toBe(staleRoot);
    onChange.mockClear();
    onValidate.mockClear();
    onStateChange.mockClear();
    await act(async () => {
      expect(() => stale.setValue('x')).toThrow(/disposed/);
      await new Promise((r) => setTimeout(r, 20));
    });
    expect({
      onChange: onChange.mock.calls,
      onValidate: onValidate.mock.calls.length,
      onStateChange: onStateChange.mock.calls.length,
      value: handle.current.getValue(),
    }).toEqual({ onChange: [], onValidate: 0, onStateChange: 0, value: { name: 'abc' } });
  });
}
