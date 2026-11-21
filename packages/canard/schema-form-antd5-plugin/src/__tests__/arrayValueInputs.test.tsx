import { createRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { Form, type FormHandle, type JSONSchema } from '@canard/schema-form';

import { plugin } from '../index';

// Pickers require browser observation; layout is irrelevant to these value assertions.
class TestResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver = TestResizeObserver;
afterEach(cleanup);
type WidgetCase = readonly [
  string,
  JSONSchema,
  (string | number)[],
  (string | number)[],
  string,
];

/** Reads the user-visible selection rather than the stored form value. */
const display = (container: HTMLElement, selector: string) =>
  Array.from(container.querySelectorAll(selector)).map((element) => {
    if (element instanceof HTMLInputElement)
      return element.type === 'checkbox' ? element.checked : element.value;
    return element.getAttribute('role') === 'slider'
      ? element.getAttribute('aria-valuenow')
      : element.textContent;
  });

describe.each([
  [
    'checkbox group',
    {
      type: 'array',
      items: { type: 'string', enum: ['a', 'b', 'c'] },
      presentation: { inputType: 'checkbox' },
    },
    ['a'],
    ['b'],
    'input[type=checkbox]',
  ],
  [
    'multiple select',
    { type: 'array', items: { type: 'string', enum: ['alpha', 'beta'] } },
    ['alpha'],
    ['beta'],
    '.ant-select-selection-item-content',
  ],
  [
    'date range',
    {
      type: 'array',
      format: 'date-range',
      items: { type: 'string', format: 'date' },
    },
    ['2024-01-10', '2024-01-12'],
    ['2024-03-01', '2024-03-05'],
    'input',
  ],
  [
    'month range',
    {
      type: 'array',
      format: 'month-range',
      items: { type: 'string', format: 'month' },
    },
    ['2024-01', '2024-02'],
    ['2024-03', '2024-04'],
    'input',
  ],
  [
    'time range',
    {
      type: 'array',
      format: 'time-range',
      items: { type: 'string', format: 'time' },
    },
    ['10:00:00Z', '11:00:00Z'],
    ['12:00:00Z', '13:00:00Z'],
    'input',
  ],
] satisfies readonly WidgetCase[])(
  '%s external array writes (round-2 antd5-plugin 1)',
  (_name, field, initial, next, selector) => {
    it.each(['root', 'array', 'item'] as const)(
      '%s writes match a fresh mount of the final value',
      async (write) => {
        const schema: JSONSchema = {
          type: 'object',
          properties: { value: field },
        };
        const ref = createRef<FormHandle>();
        const mounted = render(
          <Form
            ref={ref}
            jsonSchema={schema}
            fieldInputDefinitions={plugin.fieldInputDefinitions}
            defaultValue={{ value: initial }}
            onError={() => {}}
          />,
        );
        await act(async () => {
          if (write === 'root') ref.current!.setValue({ value: next });
          else if (write === 'array')
            ref.current!.findNode('/value')!.setValue(next);
          else
            for (let index = 0; index < next.length; index++)
              ref.current!.findNode('/value/' + index)!.setValue(next[index]);
        });
        expect(ref.current!.getValue()).toEqual({ value: next });
        const actual = display(mounted.container, selector);
        mounted.unmount();
        const fresh = render(
          <Form
            jsonSchema={schema}
            fieldInputDefinitions={plugin.fieldInputDefinitions}
            defaultValue={{ value: next }}
            onError={() => {}}
          />,
        );
        const expected = display(fresh.container, selector);
        expect(expected.length).toBeGreaterThan(0);
        expect(actual).toEqual(expected);
      },
    );
  },
);
