import { cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { Form, type JSONSchema } from '@canard/schema-form';

import { plugin } from '../index';

beforeEach(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
const props = {
  fieldInputDefinitions: plugin.fieldInputDefinitions,
  FieldRenderer: plugin.FieldRenderer,
  LabelRenderer: plugin.LabelRenderer,
  ErrorMessageRenderer: plugin.ErrorMessageRenderer,
};

it('owns an array checkbox title exactly once (round-3 id review 1)', () => {
  const view = render(
    <Form
      {...props}
      jsonSchema={{
        type: 'object',
        properties: {
          Field: {
            type: 'array',
            items: { type: 'string', enum: ['one', 'two'] },
            presentation: { inputType: 'checkbox' },
          },
        },
      }}
    />,
  );
  const group = view.container.querySelector<HTMLElement>(
    '[data-path="/Field"] [aria-labelledby]',
  )!;
  const titleId = group.getAttribute('aria-labelledby');
  expect(titleId).toBeTruthy();
  expect(
    Array.from(document.querySelectorAll('[id]')).filter(
      (element) => element.id === titleId,
    ),
  ).toHaveLength(1);
  expect(view.getAllByText('Field', { exact: true })).toHaveLength(1);
});

it.each<[string, JSONSchema]>([
  [
    'boolean checkbox',
    { type: 'boolean', presentation: { inputType: 'checkbox' } },
  ],
  [
    'radio hint without options',
    { type: 'string', presentation: { inputType: 'radio' } },
  ],
])('retains the native label for %s (round-3 id review 2)', (_kind, schema) => {
  const view = render(
    <Form
      {...props}
      jsonSchema={{ type: 'object', properties: { Field: schema } }}
    />,
  );
  const field = view.container.querySelector('[data-path="/Field"]')!;
  const input = field.querySelector('input')!;
  const label = Array.from(field.querySelectorAll('label')).find(
    (label) => label.htmlFor === input.id,
  );
  expect(label).toBeDefined();
  expect(label!.control).toBe(input);
  expect(input.labels).toContain(label);
});

it('preserves the existing visibility of object array-item titles (round-3 id review 3)', () => {
  const view = render(
    <Form
      {...props}
      jsonSchema={{
        type: 'object',
        properties: {
          list: {
            type: 'array',
            items: {
              type: 'object',
              properties: { Child: { type: 'string' } },
            },
          },
        },
      }}
      defaultValue={{ list: [{ Child: 'value' }] }}
    />,
  );
  expect(
    view
      .queryAllByText('0', { exact: true })
      .filter((title) => !title.closest('[hidden]')),
  ).toHaveLength(0);
});

it('consumes core identifier props before spreading custom DOM props (round-3 id review 7)', () => {
  const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
  const Custom = ({
    inputId,
    labelId,
    getInputId,
    ...rest
  }: import('@canard/schema-form').FieldInputProps<string>) => (
    <input
      id={inputId}
      aria-labelledby={labelId}
      data-option-id={getInputId(0)}
      {...Object.fromEntries(
        Object.entries(rest).filter(([key]) => key === 'labelId'),
      )}
    />
  );
  render(
    <Form
      {...props}
      fieldInputDefinitions={[{ test: { type: 'string' }, Component: Custom }]}
      jsonSchema={{ type: 'string' }}
    />,
  );
  expect(
    errors.mock.calls.filter((args) =>
      args.some((arg) => String(arg).includes('labelId')),
    ),
  ).toHaveLength(0);
  errors.mockRestore();
});
