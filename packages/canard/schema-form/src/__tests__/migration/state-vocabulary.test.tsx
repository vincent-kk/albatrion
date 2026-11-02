import { createRef } from 'react';

import { act, render } from '@testing-library/react';
import { expect, it } from 'vitest';

import { Form, type FormHandle, type JSONSchema } from '@/schema-form';

it('new node vocabulary follows input, reset, rebuild and validator changes', () => {
  const ref = createRef<FormHandle>();
  const schema: JSONSchema = { type: 'string' };
  const view = render(
    <Form ref={ref} jsonSchema={schema} defaultValue="loaded" />,
  );
  try {
    const handle = ref.current;
    if (!handle?.node) throw new Error('Missing Form handle');
    expect(handle.node.isEdited).toBe(false);
    expect(handle.node.isTouched).toBe(false);
    expect(handle.node.isDivergent).toBe(false);
    act(() => handle.setValue('edited'));
    expect(handle.node.isDivergent).toBe(true);
    act(() => handle.reset());
    expect(handle.node.isDivergent).toBe(false);
    const previous = handle.node;
    const rebuiltSchema: JSONSchema = { type: 'number' };
    view.rerender(
      <Form ref={ref} jsonSchema={rebuiltSchema} defaultValue={7} />,
    );
    act(() => ref.current?.reset());
    const rebuilt = ref.current;
    if (!rebuilt?.node) throw new Error('Missing rebuilt handle');
    expect(rebuilt.node).not.toBe(previous);
    expect(rebuilt.node.isDivergent).toBe(false);
    act(() => rebuilt.setValue(8));
    expect(rebuilt.node.isDivergent).toBe(true);
    const beforeValidator = rebuilt.node;
    view.rerender(
      <Form
        ref={ref}
        jsonSchema={rebuiltSchema}
        defaultValue={9}
        validatorFactory={{
          compile: () => () => [],
          compileGuard: () => () => true,
        }}
      />,
    );
    const validated = ref.current;
    if (!validated?.node) throw new Error('Missing validator-rebuilt handle');
    expect(validated.node).not.toBe(beforeValidator);
    expect(validated.node.isDivergent).toBe(false);
    act(() => validated.setValue(10));
    expect(validated.node.isDivergent).toBe(true);
    act(() => validated.setValue(9));
    expect(validated.node.isDivergent).toBe(false);
    for (const name of [
      'required',
      'active',
      'visible',
      'enabled',
      'readOnly',
      'disabled',
      'misfit',
    ])
      expect(ref.current?.node).not.toHaveProperty(name);
  } finally {
    view.unmount();
  }
});

it('explicit same-schema rebuild moves the baseline and preserves edit and revert comparison', () => {
  const ref = createRef<FormHandle>();
  const schema: JSONSchema = { type: 'string' };
  const view = render(
    <Form ref={ref} jsonSchema={schema} defaultValue="loaded" />,
  );
  try {
    const handle = ref.current;
    if (!handle?.node) throw new Error('Missing handle');
    act(() => handle.setValue('edited'));
    expect(handle.node.isDivergent).toBe(true);
    view.rerender(
      <Form ref={ref} jsonSchema={schema} defaultValue="rebuilt" />,
    );
    act(() => handle.rebuild());
    const rebuilt = ref.current;
    if (!rebuilt?.node) throw new Error('Missing rebuilt node');
    expect(rebuilt.node.isDivergent).toBe(false);
    expect(rebuilt.node.outputValue).toBe('rebuilt');
    act(() => rebuilt.setValue('next'));
    expect(rebuilt.node.isDivergent).toBe(true);
    act(() => rebuilt.setValue('rebuilt'));
    expect(rebuilt.node.isDivergent).toBe(false);
  } finally {
    view.unmount();
  }
});
