import { createRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import {
  FieldNodeEventType,
  Form,
  type FormHandle,
  ValidationMode,
  isArrayNode,
} from '../../index';

afterEach(cleanup);

const schema = {
  type: 'object',
  properties: {
    arr: {
      type: 'array',
      items: { type: 'object', properties: { n: { type: 'string' } } },
    },
  },
} as const;

/** One issue per item whose `n` is shorter than two characters. */
const validateItems = (value: unknown) => {
  const items =
    value !== null &&
    typeof value === 'object' &&
    'arr' in value &&
    Array.isArray(value.arr)
      ? value.arr
      : [];
  const issues: { dataPath: string; message: string }[] = [];
  items.forEach((item: unknown, index) => {
    const n =
      item !== null && typeof item === 'object' && 'n' in item ? item.n : '';
    if (typeof n === 'string' && n.length < 2)
      issues.push({ dataPath: `/arr/${index}/n`, message: 'too short' });
  });
  return issues.length ? issues : null;
};

const renderForm = () => {
  const ref = createRef<FormHandle<typeof schema>>();
  const onValidate = vi.fn();
  render(
    <Form
      ref={ref}
      jsonSchema={schema}
      defaultValue={{ arr: [{ n: 'aa' }, { n: 'b' }] }}
      validationMode={ValidationMode.OnRequest}
      validatorFactory={{
        compile: () => validateItems,
        compileGuard: () => () => true,
      }}
      onValidate={onValidate}
    />,
  );
  const lastPaths = () =>
    (onValidate.mock.lastCall?.[0] ?? []).map(
      (issue: { dataPath: string }) => issue.dataPath,
    );
  const insert = (index: number) =>
    act(() => {
      const array = ref.current?.findNode('/arr');
      if (isArrayNode(array)) array.insert(index, { n: 'zz' });
    });
  return { ref, onValidate, lastPaths, insert };
};

it('reports a held issue at its new path to onValidate after an array insert moves it', async () => {
  const { ref, onValidate, lastPaths, insert } = renderForm();
  await act(() => ref.current!.validate());
  expect(lastPaths()).toEqual(['/arr/1/n']);
  onValidate.mockClear();
  const field = ref.current!.findNode('/arr/1/n')!;
  const fieldEvents = vi.fn();
  const rootEvents = vi.fn();
  field.subscribe(fieldEvents);
  ref.current!.node!.subscribe(rootEvents);
  insert(0);
  expect(ref.current!.findNode('/arr/2/n')).toBe(field);
  expect(
    fieldEvents.mock.calls.some(
      ([event]) => (event.type & FieldNodeEventType.UpdateError) !== 0,
    ),
  ).toBe(true);
  expect(
    rootEvents.mock.calls.some(
      ([event]) => (event.type & FieldNodeEventType.UpdateGlobalError) !== 0,
    ),
  ).toBe(true);
  expect(onValidate).toHaveBeenCalledTimes(1);
  expect(lastPaths()).toEqual(['/arr/2/n']);
  expect(ref.current?.findNode('/arr/2/n')?.errors).toEqual(
    onValidate.mock.lastCall?.[0],
  );
});

it('does not call onValidate when an array insert moves no held issue', async () => {
  const { ref, onValidate, insert } = renderForm();
  await act(() => ref.current!.validate());
  onValidate.mockClear();
  insert(2);
  expect(onValidate).not.toHaveBeenCalled();
});

it('reports an empty list to onValidate after clearing the array drops the held issue', async () => {
  const { ref, onValidate, lastPaths } = renderForm();
  await act(() => ref.current!.validate());
  onValidate.mockClear();
  act(() => {
    const array = ref.current?.findNode('/arr');
    if (isArrayNode(array)) array.clear();
  });
  expect(onValidate).toHaveBeenCalledTimes(1);
  expect(lastPaths()).toEqual([]);
  expect(ref.current?.node?.globalErrors).toEqual([]);
});
