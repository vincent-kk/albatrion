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

const hydrate = async (field: JSONSchema, value: unknown) => {
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
      messages.push(text.slice(0, 1200));
  };
  vi.spyOn(console, 'error').mockImplementation(record);
  vi.spyOn(console, 'warn').mockImplementation(record);
  const recoverable: string[] = [];
  await act(async () => {
    hydrateRoot(container, form, {
      onRecoverableError: (error) => recoverable.push(String(error).slice(0, 1200)),
    });
  });
  return { messages, recoverable, html: html.slice(0, 1500) };
};

it('diagnostic: antd6 textarea hydration messages', async () => {
  const result = await hydrate(
    { type: 'string', presentation: { inputType: 'textarea' } },
    'hello',
  );
  expect(result).toEqual({ messages: [], recoverable: [], html: '' });
});

it('textarea with an empty value hydrates without a mismatch', async () => {
  const { messages, recoverable } = await hydrate(
    { type: 'string', presentation: { inputType: 'textarea' } },
    undefined,
  );
  expect({ messages, recoverable }).toEqual({ messages: [], recoverable: [] });
});

it('textarea with minRows and maxRows hydrates without a mismatch', async () => {
  const { messages, recoverable } = await hydrate(
    {
      type: 'string',
      presentation: { inputType: 'textarea' },
      minRows: 2,
      maxRows: 4,
    } as JSONSchema,
    'hello',
  );
  expect({ messages, recoverable }).toEqual({ messages: [], recoverable: [] });
});
