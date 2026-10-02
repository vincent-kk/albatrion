import { createRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { Form } from '@/schema-form/components/Form';
import type { FormHandle } from '@/schema-form/components/Form';
import { ValidationMode, type JSONSchema } from '@/schema-form/core';

afterEach(cleanup);

const schema = {
  type: 'object',
  properties: { field: { type: 'string' } },
} as const;
const external = [
  { dataPath: '/field', message: 'field error' },
  { dataPath: '', message: 'root error' },
  { dataPath: '/absent', message: 'ownerless error' },
];

it('SURFACE-053 VALIDATE-043 79C-01 applies Form errors whole to the root and by path to each node', () => {
  const ref = createRef<FormHandle>();
  const view = render(
    <Form ref={ref} jsonSchema={schema} errors={external} validationMode={ValidationMode.None}>
      <span />
    </Form>,
  );
  expect(ref.current!.node!.errors).toEqual(external);
  expect(ref.current!.findNode('/field')!.errors).toEqual([external[0]]);
  const errors = ref.current!.getErrors();
  expect(errors).toEqual(external);
  expect(ref.current!.getErrors()).toBe(errors);
  const next = [{ dataPath: '', message: 'new root error' }];
  view.rerender(
    <Form ref={ref} jsonSchema={schema} errors={next} validationMode={ValidationMode.None}>
      <span />
    </Form>,
  );
  expect(ref.current!.node!.errors).toEqual(next);
  expect(ref.current!.findNode('/field')!.errors).toEqual([]);
  expect(ref.current!.getErrors()).toEqual(next);
  expect(ref.current!.getErrors()).not.toBe(errors);
  view.rerender(
    <Form ref={ref} jsonSchema={schema} validationMode={ValidationMode.None}>
      <span />
    </Form>,
  );
  expect(ref.current!.node!.errors).toEqual([]);
  expect(ref.current!.getErrors()).toEqual([]);
});

it('WRITE-045 69C-03 79C-01 reapplies whole-root and path errors before same-schema reset returns', () => {
  const ref = createRef<FormHandle>();
  render(
    <Form ref={ref} jsonSchema={schema} errors={external} validationMode={ValidationMode.None}>
      <span />
    </Form>,
  );
  const root = ref.current!.node!;
  const field = ref.current!.findNode('/field')!;
  act(() => {
    root.setExternalErrors([{ dataPath: '', message: 'imperative root error' }]);
    field.setExternalErrors([{ dataPath: '/field', message: 'imperative field error' }]);
    ref.current!.reset();
    expect(ref.current!.node).toBe(root);
    expect(root.errors).toEqual(external);
    expect(field.errors).toEqual([external[0]]);
    expect(ref.current!.getErrors()).toEqual(external);
  });
});

it('WRITE-045 69C-03 79C-01 reapplies errors by path to the replacement root before reset returns', () => {
  const ref = createRef<FormHandle>();
  const view = render(
    <Form ref={ref} jsonSchema={schema} errors={external} validationMode={ValidationMode.None}>
      <span />
    </Form>,
  );
  const root = ref.current!.node!;
  const field = ref.current!.findNode('/field')!;
  const replacement: JSONSchema = {
    type: 'object',
    properties: { field: { type: 'string', minLength: 2 } },
  };
  view.rerender(
    <Form ref={ref} jsonSchema={replacement} errors={external} validationMode={ValidationMode.None}>
      <span />
    </Form>,
  );
  act(() => {
    ref.current!.reset();
    expect(ref.current!.node).not.toBe(root);
    expect(ref.current!.findNode('/field')).not.toBe(field);
    expect(ref.current!.node!.errors).toEqual(external);
    expect(ref.current!.findNode('/field')!.errors).toEqual([external[0]]);
    expect(ref.current!.getErrors()).toEqual(external);
  });
});
