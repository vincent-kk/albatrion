import { cleanup, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { Form, type JSONSchema } from '@canard/schema-form';
import { plugin } from '../index';
afterEach(() => { cleanup(); vi.restoreAllMocks(); });
it.each([
  { type: 'string', nullable: true, enum: ['red', 'green'] },
  { type: ['string', 'null'], enum: ['red', 'green'] },
] satisfies JSONSchema[])('empty enum values agree for $type', field => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  const results = [];
  for (const value of [undefined, null]) {
    warn.mockClear();
    const { unmount } = render(<Form jsonSchema={{ type: 'object', properties: { color: field } }} defaultValue={{ color: value }} fieldInputDefinitions={plugin.fieldInputDefinitions} />);
    results.push(warn.mock.calls.filter(call => call.join(' ').includes('out-of-range')).length);
    unmount();
  }
  expect(results[0]).toBe(0);
  expect(results[1]).toBe(results[0]);
});
