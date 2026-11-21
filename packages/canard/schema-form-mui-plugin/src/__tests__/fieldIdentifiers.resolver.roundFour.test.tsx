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
  (_kind, fieldSchema, keys) => {
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
      expect(
        ids.filter((id) => id === props.getInputId('legend')),
      ).toHaveLength(1);
      for (const key of keys) {
        expect(ids.filter((id) => id === props.getInputId(key))).toHaveLength(
          1,
        );
      }
    }
  },
);
