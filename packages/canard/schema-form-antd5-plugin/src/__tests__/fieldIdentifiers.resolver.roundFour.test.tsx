import { cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import {
  type FieldInputProps,
  Form,
  type JSONSchema,
} from '@canard/schema-form';

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

it.each<[string, JSONSchema, (string | number)[]]>([
  [
    'date range',
    {
      type: 'array',
      format: 'date-range',
      items: { type: 'string', format: 'date' },
      minItems: 2,
      maxItems: 2,
    },
    ['end'],
  ],
  [
    'month range',
    {
      type: 'array',
      format: 'month-range',
      items: { type: 'string', format: 'month' },
      minItems: 2,
      maxItems: 2,
    },
    ['end'],
  ],
  [
    'time range',
    {
      type: 'array',
      format: 'time-range',
      items: { type: 'string', format: 'time' },
      minItems: 2,
      maxItems: 2,
    },
    ['end'],
  ],
  ['URI', { type: 'string', format: 'uri' }, ['protocol']],
  ['slider', { type: 'number', presentation: { inputType: 'slider' } }, []],
  [
    'boolean switch',
    { type: 'boolean', presentation: { inputType: 'switch' } },
    [],
  ],
  [
    'string switch',
    {
      type: 'string',
      enum: ['on', 'off'],
      presentation: { inputType: 'switch' },
    },
    [],
  ],
  ['time', { type: 'string', format: 'time' }, []],
  ['date', { type: 'string', format: 'date' }, []],
  ['month', { type: 'string', format: 'month' }, []],
  ['select', { type: 'string', enum: ['one', 'two'] }, []],
  [
    'radio',
    {
      type: 'string',
      enum: ['one', 'two'],
      presentation: { inputType: 'radio' },
    },
    [0, 1],
  ],
  [
    'radiogroup',
    {
      type: 'string',
      enum: ['one', 'two'],
      presentation: { inputType: 'radiogroup' },
    },
    [0, 1],
  ],
  [
    'checkbox',
    {
      type: 'array',
      items: { type: 'string', enum: ['one', 'two'] },
      presentation: { inputType: 'checkbox' },
    },
    [0, 1],
  ],
])(
  'renders core-provided keyed addresses for %s in two Forms',
  (kind, fieldSchema, keys) => {
    const captured = new Map<string, FieldInputProps>();
    const definitions = plugin.fieldInputDefinitions.map((definition) => {
      const Component = definition.Component;
      const Capture = (props: FieldInputProps) => {
        if (props.path === '/plan') captured.set(props.inputId, props);
        return <Component {...props} />;
      };
      return { ...definition, Component: Capture };
    });
    const jsonSchema: JSONSchema = {
      type: 'object',
      properties: {
        plan: fieldSchema,
        'plan-0': { type: 'string' },
        'plan-1': { type: 'string' },
      },
    };
    render(
      <>
        {[0, 1].map((key) => (
          <Form
            key={key}
            jsonSchema={jsonSchema}
            fieldInputDefinitions={definitions}
            FieldRenderer={plugin.FieldRenderer}
            LabelRenderer={plugin.LabelRenderer}
            ErrorMessageRenderer={plugin.ErrorMessageRenderer}
          />
        ))}
      </>,
    );
    expect(captured.size).toBe(2);
    const ids = Array.from(
      document.querySelectorAll('[id]'),
      (element) => element.id,
    );
    for (const props of captured.values()) {
      expect(ids.filter((id) => id === props.inputId)).toHaveLength(1);
      expect(ids.filter((id) => id === props.labelId)).toHaveLength(1);
      for (const key of keys) {
        expect(ids.filter((id) => id === props.getInputId(key))).toHaveLength(
          1,
        );
      }
      const control = document.getElementById(props.inputId)!;
      if (kind === 'slider') {
        expect(
          control
            .querySelector('[role="slider"]')
            ?.getAttribute('aria-labelledby'),
        ).toBe(props.labelId);
      } else if (keys.length || kind.endsWith('switch')) {
        expect(control.getAttribute('aria-labelledby')).toBe(props.labelId);
      }
      if (kind.endsWith('range')) {
        expect(
          document
            .getElementById(props.getInputId('end'))
            ?.getAttribute('aria-labelledby'),
        ).toBe(props.labelId);
      }
      if (kind.startsWith('radio')) {
        for (const option of control.querySelectorAll<HTMLInputElement>(
          'input',
        )) {
          expect(option.name).toBe(props.inputId);
        }
      }
    }
  },
);
