import { createRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { Form, type FormHandle, type JSONSchema } from '@canard/schema-form';

import { plugin } from '../index';

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
    'range slider',
    {
      type: 'array',
      format: 'slider',
      items: { type: 'number' },
      minItems: 2,
      maxItems: 2,
    },
    [10, 20],
    [30, 40],
    '[role=slider]',
  ],
] satisfies readonly WidgetCase[])(
  '%s external array writes (round-2 antd-mobile-plugin 2)',
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
