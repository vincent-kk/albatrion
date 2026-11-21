import { createRef } from 'react';

import {
  act,
  cleanup,
  fireEvent,
  render,
  within,
} from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { Form, type FormHandle, type JSONSchema } from '@canard/schema-form';

import { plugin } from '../index';

beforeEach(() =>
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  ),
);
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
const schema: JSONSchema = {
  type: 'object',
  properties: {
    plan: {
      type: 'string',
      enum: ['email', 'phone'],
      presentation: { inputType: 'radio' },
    },
    'plan-1': { type: 'string' },
    name: { type: 'string' },
    'name-label': { type: 'string' },
    'first name': { type: 'string' },
    left: { type: 'object', properties: { leaf: { type: 'string' } } },
    right: { type: 'object', properties: { leaf: { type: 'string' } } },
    dates: { type: 'array', format: 'date-range', items: { type: 'string' } },
    times: { type: 'array', format: 'time-range', items: { type: 'string' } },
    site: { type: 'string', format: 'uri' },
    amount: {
      type: 'number',
      format: 'slider',
      minimum: 0,
      maximum: 10,
      presentation: { inputType: 'slider' },
    },
    span: {
      type: 'array',
      format: 'slider',
      items: { type: 'number', minimum: 0, maximum: 10 },
      presentation: { inputType: 'slider' },
    },
    choice: { type: 'string', enum: ['one', 'two'] },
  },
};
it('keeps a mixed collision schema local and unambiguous across two Forms', () => {
  const view = render(
    <>
      <Form
        jsonSchema={schema}
        fieldInputDefinitions={plugin.fieldInputDefinitions}
        FieldRenderer={plugin.FieldRenderer}
        LabelRenderer={plugin.LabelRenderer}
      />
      <Form
        jsonSchema={schema}
        fieldInputDefinitions={plugin.fieldInputDefinitions}
        FieldRenderer={plugin.FieldRenderer}
        LabelRenderer={plugin.LabelRenderer}
      />
    </>,
  );
  const ids = Array.from(
    view.container.querySelectorAll('[id]'),
    (element) => element.id,
  );
  expect(ids.filter((id, index) => ids.indexOf(id) !== index)).toEqual([]);
  expect(ids.filter((id) => /[\t\n\f\r ]/.test(id))).toEqual([]);
  const forms = view.container.querySelectorAll('form');
  expect(forms).toHaveLength(2);
  for (const form of forms) {
    for (const label of form.querySelectorAll('label[for]')) {
      const target = document.getElementById(label.getAttribute('for')!);
      expect(target).not.toBeNull();
      expect(form.contains(target)).toBe(true);
    }
    for (const control of form.querySelectorAll('[aria-labelledby]'))
      for (const id of control.getAttribute('aria-labelledby')!.split(/\s+/)) {
        const target = document.getElementById(id);
        expect(target).not.toBeNull();
        expect(form.contains(target)).toBe(true);
      }
  }
});

it('array edits and focus stay in the originating form for an escaped property (identifier scope contract)', async () => {
  const first = createRef<FormHandle>();
  const second = createRef<FormHandle>();
  const key = 'name/~';
  const schema: JSONSchema = {
    type: 'object',
    properties: {
      [key]: {
        type: 'array',
        title: 'Items',
        items: { type: 'string', default: 'added' },
      },
    },
  };
  const props = {
    jsonSchema: schema,
    fieldInputDefinitions: plugin.fieldInputDefinitions,
    FieldRenderer: plugin.FieldRenderer,
    LabelRenderer: plugin.LabelRenderer,
    ErrorMessageRenderer: plugin.ErrorMessageRenderer,
  };
  const { container } = render(
    <>
      <article>
        <Form {...props} ref={first} defaultValue={{ [key]: ['a', 'b'] }} />
      </article>
      <article>
        <Form {...props} ref={second} defaultValue={{ [key]: ['c'] }} />
      </article>
    </>,
  );
  const forms = container.querySelectorAll('article');
  expect(forms).toHaveLength(2);
  const left = within(forms[0]!);
  const assertReferences = () => {
    const ids = Array.from(
      container.querySelectorAll('[id]'),
      (element) => element.id,
    );
    expect(ids.filter((id, index) => ids.indexOf(id) !== index)).toEqual([]);
    for (const form of forms)
      for (const element of form.querySelectorAll('[for], [aria-labelledby]'))
        for (const id of [
          element.getAttribute('for'),
          element.getAttribute('aria-labelledby'),
        ]
          .filter(Boolean)
          .join(' ')
          .split(/\s+/))
          expect(form.contains(document.getElementById(id)), id).toBe(true);
  };
  assertReferences();
  fireEvent.click(
    left.queryByTitle('add') ?? left.getByRole('button', { name: '+' }),
  );
  expect(first.current!.getValue()).toEqual({ [key]: ['a', 'b', 'added'] });
  fireEvent.click(
    left.queryAllByTitle('remove')[0] ??
      left.getAllByRole('button', { name: '-' })[0]!,
  );
  expect(first.current!.getValue()).toEqual({ [key]: ['b', 'added'] });
  expect(second.current!.getValue()).toEqual({ [key]: ['c'] });
  await act(async () => first.current!.focus('/name~1~0/0'));
  expect(document.activeElement).toBe(left.getByDisplayValue('b'));
  assertReferences();
});
