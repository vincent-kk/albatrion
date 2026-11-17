import { createRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { Form, type FormHandle, type JSONSchema } from '@/schema-form';

afterEach(cleanup);

// prettier-ignore
const copySchema = {
  type: 'object',
  properties: {
    nickname: { type: 'string' },
    price: { type: 'number' },
    quantity: { type: 'number' },
// injectTo: copy once, then independent
name: {
  type: 'string',
  controls: { injectTo: (value) => ({ '../nickname': value }) },
},

// derived: always computed
totalPrice: {
  type: 'number',
  controls: { derived: '(../price ?? 0) * (../quantity ?? 1)' },
},
  },
} satisfies JSONSchema;

it('injectTo copies once per source change and leaves the target editable, while derived recomputes', () => {
  const ref = createRef<FormHandle>();
  render(<Form ref={ref} jsonSchema={copySchema} />);
  const node = (path: string) => ref.current!.findNode(path)!;

  act(() => node('/name').setValue('Ada'));
  expect(node('/nickname').value).toBe('Ada');
  act(() => node('/nickname').setValue('Bob'));
  expect(node('/nickname').value).toBe('Bob');
  expect(node('/name').value).toBe('Ada');
  act(() => node('/name').setValue('Eve'));
  expect(node('/nickname').value).toBe('Eve');

  act(() => node('/price').setValue(2));
  act(() => node('/quantity').setValue(3));
  expect(node('/totalPrice').value).toBe(6);
  act(() => node('/totalPrice').setValue(99));
  expect(node('/totalPrice').value).toBe(99);
  act(() => node('/price').setValue(5));
  expect(node('/totalPrice').value).toBe(15);
});

// prettier-ignore
const branchingSchema = {
  type: 'object',
  properties: {
    longTarget: { type: 'string' },
    shortTarget: { type: 'string' },
    audit: { type: 'object', properties: { lastShort: { type: 'string' } } },
source: {
  type: 'string',
  controls: {
    injectTo: (value: string | undefined) => value !== undefined && value.length > 5
      ? { '../longTarget': value }
      : { '../shortTarget': value, '/audit/lastShort': value },
  },
},
  },
} satisfies JSONSchema;

it('lets one handler inject into several targets, mixing relative and absolute paths', () => {
  const ref = createRef<FormHandle>();
  render(<Form ref={ref} jsonSchema={branchingSchema} />);
  const node = (path: string) => ref.current!.findNode(path)!;
  expect(node('/longTarget').value).toBeUndefined();
  act(() => node('/source').setValue('abc'));
  expect(node('/shortTarget').value).toBe('abc');
  expect(node('/audit/lastShort').value).toBe('abc');
  expect(node('/longTarget').value).toBeUndefined();
  act(() => node('/source').setValue('abcdefg'));
  expect(node('/longTarget').value).toBe('abcdefg');
  expect(node('/shortTarget').value).toBe('abc');
});
