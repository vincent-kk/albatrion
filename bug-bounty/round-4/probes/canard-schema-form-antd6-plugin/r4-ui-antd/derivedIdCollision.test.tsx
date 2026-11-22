import { createRef } from 'react';

import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { Form, type FormHandle, type JSONSchema } from '@canard/schema-form';

import { plugin } from '../../index';

class TestResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver = TestResizeObserver;
afterEach(cleanup);

const duplicateIds = (root: HTMLElement) => {
  const counts = new Map<string, number>();
  for (const element of root.querySelectorAll<HTMLElement>('[id]'))
    counts.set(element.id, (counts.get(element.id) || 0) + 1);
  return [...counts].filter(([, count]) => count > 1).map(([id]) => id);
};

describe.each<[string, JSONSchema, string, unknown]>([
  [
    'radio option ids',
    {
      type: 'object',
      properties: {
        'q-1': {
          type: 'string',
          enum: ['yes', 'no', 'maybe'],
          presentation: { inputType: 'radio' },
        },
        'q-1-1': { type: 'string' },
      },
    },
    'q-1-1',
    { 'q-1': 'yes' },
  ],
  [
    'checkbox option ids',
    {
      type: 'object',
      properties: {
        'q-2': {
          type: 'array',
          items: { type: 'string', enum: ['a', 'b'] },
          presentation: { inputType: 'checkbox' },
        },
        'q-2-1': { type: 'boolean' },
      },
    },
    'q-2-1',
    { 'q-2': ['a'] },
  ],
  [
    'date range end id',
    {
      type: 'object',
      properties: {
        period: { type: 'array', format: 'date-range', items: { type: 'string' } },
        'period-end': { type: 'string' },
      },
    },
    'period-end',
    { period: ['2024-01-10', '2024-01-12'] },
  ],
  [
    'URI protocol id',
    {
      type: 'object',
      properties: {
        site: { type: 'string', format: 'uri' },
        'site-protocol': { type: 'string' },
      },
    },
    'site-protocol',
    { site: 'https://example.com' },
  ],
])('%s', (_name, schema, sibling, defaultValue) => {
  it('every element id in the form is unique', () => {
    const { container } = render(
      <Form
        jsonSchema={schema}
        fieldInputDefinitions={plugin.fieldInputDefinitions}
        defaultValue={defaultValue as object}
        onError={() => {}}
      />,
    );
    expect(duplicateIds(container)).toEqual([]);
  });

  it(`the label of "${sibling}" targets that field's own control`, () => {
    const { container } = render(
      <Form
        jsonSchema={schema}
        fieldInputDefinitions={plugin.fieldInputDefinitions}
        defaultValue={defaultValue as object}
        onError={() => {}}
      />,
    );
    const wrapper = container.querySelector<HTMLElement>(
      `[data-path="/${sibling}"]`,
    )!;
    const label = wrapper.querySelector<HTMLLabelElement>('label[for]')!;
    expect(label, 'label present').not.toBeNull();
    const target = document.getElementById(label.htmlFor);
    expect(target && wrapper.contains(target)).toBe(true);
  });
});

it('clicking the label of q-1-1 leaves the q-1 radio value unchanged', async () => {
  const ref = createRef<FormHandle>();
  const { container } = render(
    <Form
      ref={ref}
      jsonSchema={{
        type: 'object',
        properties: {
          'q-1': {
            type: 'string',
            enum: ['yes', 'no', 'maybe'],
            presentation: { inputType: 'radio' },
          },
          'q-1-1': { type: 'string' },
        },
      }}
      fieldInputDefinitions={plugin.fieldInputDefinitions}
      defaultValue={{ 'q-1': 'yes' }}
      onError={() => {}}
    />,
  );
  const label = container
    .querySelector<HTMLElement>('[data-path="/q-1-1"]')!
    .querySelector<HTMLLabelElement>('label[for]')!;
  fireEvent.click(label);
  await act(async () => {});
  expect(ref.current!.getValue()).toEqual({ 'q-1': 'yes' });
});
