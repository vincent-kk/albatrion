import { createRef } from 'react';

import { cleanup, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { Form, type FormHandle, type JSONSchema } from '@canard/schema-form';

import { plugin } from '../index';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
it.each([
  { type: ['string', 'null'], enum: ['red', 'green'] },
] satisfies JSONSchema[])('empty enum values agree for $type', (field) => {
  const messages: string[] = [];
  for (const method of ['warn', 'error'] as const)
    vi.spyOn(console, method).mockImplementation((...args: unknown[]) => {
      messages.push(args.map(String).join(' '));
    });
  const results = [];
  for (const value of [undefined, null]) {
    messages.length = 0;
    const ref = createRef<FormHandle>();
    const { unmount } = render(
      <Form
        ref={ref}
        jsonSchema={{ type: 'object', properties: { color: field } }}
        defaultValue={{ color: value }}
        fieldInputDefinitions={plugin.fieldInputDefinitions}
      />,
    );
    results.push(
      messages.filter((message) => message.includes('out-of-range')).length,
    );
    expect(ref.current!.getValue()).toEqual(
      value === undefined ? {} : { color: value },
    );
    unmount();
  }
  expect(results[0]).toBe(0);
  expect(results[1]).toBe(results[0]);
});
