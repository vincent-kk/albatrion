import { act, cleanup, render } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, expect, it } from 'vitest';

import {
  type ArrayNode,
  Form,
  type FormHandle,
  ValidationMode,
} from '@/schema-form';

afterEach(cleanup);

/**
 * RG1 of round 3 item 6 (radio groups use the scoped id, built from the path, as their native name)
 * and IN3: when array items move, each moved row's radios are renamed in place to the new path.
 * field-input.md: an input displays the form value it received as defaultValue.
 */
const schema = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          kind: {
            type: 'string',
            enum: ['a', 'b', 'c'],
            presentation: { inputType: 'radio' },
          },
        },
      },
    },
  },
} as const;

/** Checked option value of each row's radio group, in DOM order. */
const readRows = (container: HTMLElement) =>
  [...container.querySelectorAll('[role="group"]')].map(
    (group) =>
      (group.querySelector('input:checked') as HTMLInputElement | null)
        ?.value ?? null,
  );

const mount = (items: { kind: string }[]) => {
  const handle = createRef<FormHandle<typeof schema>>();
  const view = render(
    <Form
      ref={handle}
      jsonSchema={schema}
      defaultValue={{ items }}
      validationMode={ValidationMode.None}
    />,
  );
  const list = () => handle.current!.findNode('/items') as ArrayNode;
  return { handle, view, list };
};

it('control: rows show their loaded selections', () => {
  const { view } = mount([{ kind: 'a' }, { kind: 'b' }, { kind: 'c' }]);
  expect(readRows(view.container)).toEqual(['a', 'b', 'c']);
});

it('control: push keeps the selections of existing rows', async () => {
  const { view, list, handle } = mount([{ kind: 'a' }, { kind: 'b' }]);
  await act(async () => {
    list().push({ kind: 'c' });
  });
  expect(handle.current!.getValue()).toEqual({
    items: [{ kind: 'a' }, { kind: 'b' }, { kind: 'c' }],
  });
  expect(readRows(view.container)).toEqual(['a', 'b', 'c']);
});

it('insert(0) of an empty row keeps the selections of the rows it moves', async () => {
  const { view, list, handle } = mount([{ kind: 'a' }, { kind: 'b' }]);
  await act(async () => {
    list().insert(0);
  });
  const value = handle.current!.getValue() as { items: { kind?: string }[] };
  expect(value.items.slice(1)).toEqual([{ kind: 'a' }, { kind: 'b' }]);
  expect(readRows(view.container)).toEqual([null, 'a', 'b']);
});

it('insert(0) of a selected row keeps the selections of the rows it moves', async () => {
  const { view, list, handle } = mount([{ kind: 'a' }, { kind: 'b' }]);
  await act(async () => {
    list().insert(0, { kind: 'c' });
  });
  expect(handle.current!.getValue()).toEqual({
    items: [{ kind: 'c' }, { kind: 'a' }, { kind: 'b' }],
  });
  expect(readRows(view.container)).toEqual(['c', 'a', 'b']);
});

it('remove(0) keeps the selections of the rows that move up', async () => {
  const { view, list, handle } = mount([
    { kind: 'a' },
    { kind: 'b' },
    { kind: 'c' },
  ]);
  await act(async () => {
    list().remove(0);
  });
  expect(handle.current!.getValue()).toEqual({
    items: [{ kind: 'b' }, { kind: 'c' }],
  });
  expect(readRows(view.container)).toEqual(['b', 'c']);
});
