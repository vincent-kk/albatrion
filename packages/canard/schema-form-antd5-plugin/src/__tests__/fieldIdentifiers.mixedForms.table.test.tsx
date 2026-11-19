import { cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { Form, type JSONSchema } from '@canard/schema-form';

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
