import { act } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';

import { afterEach, expect, it, vi } from 'vitest';

import { Form, type JSONSchema } from '@canard/schema-form';

import { plugin } from '../../index';

class TestResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver = TestResizeObserver;
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

afterEach(() => {
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

const rows: [string, JSONSchema, unknown][] = [
  ['text', { type: 'string' }, 'hello'],
  ['password', { type: 'string', format: 'password' }, 'secret'],
  ['textarea', { type: 'string', presentation: { inputType: 'textarea' } }, 'hello'],
  ['number', { type: 'number' }, 3],
  ['boolean', { type: 'boolean' }, true],
  ['boolean switch', { type: 'boolean', presentation: { inputType: 'switch' } }, true],
  [
    'string switch',
    { type: 'string', enum: ['yes', 'no'], presentation: { inputType: 'switch' } },
    'yes',
  ],
  ['radio', { type: 'string', enum: ['one', 'two'], presentation: { inputType: 'radio' } }, 'one'],
  [
    'checkbox group',
    {
      type: 'array',
      items: { type: 'string', enum: ['one', 'two'] },
      presentation: { inputType: 'checkbox' },
    },
    ['one'],
  ],
  ['slider', { type: 'number', presentation: { inputType: 'slider' } }, 3],
  ['enum select', { type: 'string', enum: ['one', 'two'] }, 'one'],
  [
    'multiple select',
    { type: 'array', items: { type: 'string', enum: ['one', 'two'] } },
    ['one'],
  ],
  ['URI', { type: 'string', format: 'uri' }, 'https://example.test'],
  ['date', { type: 'string', format: 'date' }, '2024-01-10'],
  ['month', { type: 'string', format: 'month' }, '2024-01'],
  ['time', { type: 'string', format: 'time' }, '12:30:00Z'],
  [
    'date range',
    { type: 'array', format: 'date-range', items: { type: 'string' } },
    ['2024-01-10', '2024-01-12'],
  ],
  [
    'month range',
    { type: 'array', format: 'month-range', items: { type: 'string' } },
    ['2024-01', '2024-03'],
  ],
  [
    'time range',
    { type: 'array', format: 'time-range', items: { type: 'string' } },
    ['09:00:00Z', '18:00:00Z'],
  ],
  ['array', { type: 'array', items: { type: 'string' } }, ['a', 'b']],
];

it.each(rows)('%s hydrates the server HTML without a mismatch', async (_name, field, value) => {
  const form = (
    <Form
      fieldInputDefinitions={plugin.fieldInputDefinitions}
      FieldRenderer={plugin.FieldRenderer}
      LabelRenderer={plugin.LabelRenderer}
      ErrorMessageRenderer={plugin.ErrorMessageRenderer}
      jsonSchema={{ type: 'object', properties: { field } }}
      defaultValue={{ field: value }}
      onError={() => {}}
    />
  );
  const html = renderToString(form);
  const container = document.createElement('div');
  container.innerHTML = html;
  document.body.appendChild(container);
  const messages: string[] = [];
  const record = (...args: unknown[]) => {
    const text = args.map(String).join(' ');
    if (!/VALIDATOR_MISSING|Validation is disabled/.test(text))
      messages.push(text.slice(0, 300));
  };
  vi.spyOn(console, 'error').mockImplementation(record);
  vi.spyOn(console, 'warn').mockImplementation(record);
  const recoverable: string[] = [];
  await act(async () => {
    hydrateRoot(container, form, {
      onRecoverableError: (error) => recoverable.push(String(error).slice(0, 300)),
    });
  });
  expect({ messages, recoverable }).toEqual({ messages: [], recoverable: [] });
});
