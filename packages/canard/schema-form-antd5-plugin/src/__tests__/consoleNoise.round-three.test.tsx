import { StrictMode } from 'react';

import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Form } from '@canard/schema-form';

import { plugin } from '../index';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const schema = {
  type: 'object',
  properties: {
    text: { type: 'string' },
    count: { type: 'number' },
    flag: { type: 'boolean' },
    toggle: { type: 'boolean', presentation: { inputType: 'switch' } },
    color: { type: 'string', enum: ['red', 'green'] },
    size: {
      type: 'string',
      enum: ['s', 'm'],
      presentation: { inputType: 'radio' },
    },
    tags: {
      type: 'array',
      items: { type: 'string', enum: ['a', 'b'] },
      presentation: { inputType: 'checkbox' },
    },
    mode: {
      type: 'string',
      enum: ['on', 'off'],
      presentation: { inputType: 'switch' },
    },
    link: { type: 'string', format: 'uri' },
    level: {
      type: 'number',
      minimum: 0,
      maximum: 10,
      presentation: { inputType: 'slider' },
    },
  },
} as const;

const collect = () => {
  const messages: string[] = [];
  const record = (...args: unknown[]) => {
    const text = args.map(String).join(' ');
    if (!/VALIDATOR_MISSING|Validation is disabled/.test(text))
      messages.push(text.slice(0, 160));
  };
  vi.spyOn(console, 'warn').mockImplementation(record);
  vi.spyOn(console, 'error').mockImplementation(record);
  return messages;
};

describe('console output of an empty form (antd5)', () => {
  it('an empty form mounts without console warnings or errors', () => {
    const messages = collect();
    render(
      <Form
        fieldInputDefinitions={plugin.fieldInputDefinitions}
        jsonSchema={schema}
      />,
    );
    expect(messages).toEqual([]);
  });

  it('an empty form mounts under StrictMode without console warnings or errors', () => {
    const messages = collect();
    render(
      <StrictMode>
        <Form
          fieldInputDefinitions={plugin.fieldInputDefinitions}
          jsonSchema={schema}
        />
      </StrictMode>,
    );
    expect(messages).toEqual([]);
  });

  it('a filled form mounts without console warnings or errors', () => {
    const messages = collect();
    render(
      <Form
        fieldInputDefinitions={plugin.fieldInputDefinitions}
        jsonSchema={schema}
        defaultValue={{
          text: 'x',
          count: 1,
          flag: true,
          toggle: true,
          color: 'red',
          size: 's',
          tags: ['a'],
          mode: 'on',
          link: 'https://example.com',
          level: 3,
        }}
      />,
    );
    expect(messages).toEqual([]);
  });
});
