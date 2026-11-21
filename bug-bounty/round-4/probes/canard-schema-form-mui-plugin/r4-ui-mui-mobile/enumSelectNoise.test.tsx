import { cleanup, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { Form, type JSONSchema } from '@canard/schema-form';

import { plugin } from '../../index';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

/** Messages MUI prints for a Select value that matches no option. */
const outOfRangeMessages = (spy: ReturnType<typeof vi.spyOn>) =>
  spy.mock.calls
    .map((call: unknown[]) => call.map(String).join(' '))
    .filter((message: string) => message.includes('out-of-range'));

/**
 * Round-3 MUI item 5 removed the out-of-range warning for an empty select (`undefined`).
 * An optional enum loaded as `null`, as a database NULL arrives, is also a select with no
 * value; `nullable: true` is the documented way to accept it.
 */
it.each([
  ['nullable: true', { type: 'string', nullable: true, enum: ['red', 'green'] }],
  ['type with null', { type: ['string', 'null'], enum: ['red', 'green'] }],
] as [string, JSONSchema][])(
  'a nullable enum select loaded as null mounts without out-of-range warnings (%s)',
  (_, color) => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <Form
        jsonSchema={{ type: 'object', properties: { color } }}
        defaultValue={{ color: null }}
        fieldInputDefinitions={plugin.fieldInputDefinitions}
        FieldRenderer={plugin.FieldRenderer}
      />,
    );
    expect(outOfRangeMessages(warn)).toEqual([]);
  },
);

it('control: an enum select loaded as undefined mounts without out-of-range warnings', () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  render(
    <Form
      jsonSchema={{
        type: 'object',
        properties: { color: { type: 'string', enum: ['red', 'green'] } },
      }}
      fieldInputDefinitions={plugin.fieldInputDefinitions}
      FieldRenderer={plugin.FieldRenderer}
    />,
  );
  expect(outOfRangeMessages(warn)).toEqual([]);
});
