import type { JSONSchema } from '@canard/schema-form';
import { expect, it } from 'vitest';

import { plugin } from '../default/index';

it.each([
  { asynchronous: false, identified: false, mode: 'two forms', reverse: false },
  { asynchronous: false, identified: false, mode: 'two forms', reverse: true },
  {
    asynchronous: false,
    identified: false,
    mode: 'one form twice',
    reverse: false,
  },
  {
    asynchronous: false,
    identified: false,
    mode: 'one form twice',
    reverse: true,
  },
  {
    asynchronous: false,
    identified: false,
    mode: 'interleaved',
    reverse: false,
  },
  {
    asynchronous: false,
    identified: false,
    mode: 'interleaved',
    reverse: true,
  },
  { asynchronous: false, identified: true, mode: 'two forms', reverse: false },
  { asynchronous: false, identified: true, mode: 'two forms', reverse: true },
  {
    asynchronous: false,
    identified: true,
    mode: 'one form twice',
    reverse: false,
  },
  {
    asynchronous: false,
    identified: true,
    mode: 'one form twice',
    reverse: true,
  },
  {
    asynchronous: false,
    identified: true,
    mode: 'interleaved',
    reverse: false,
  },
  { asynchronous: false, identified: true, mode: 'interleaved', reverse: true },
  { asynchronous: true, identified: false, mode: 'two forms', reverse: false },
  { asynchronous: true, identified: false, mode: 'two forms', reverse: true },
  {
    asynchronous: true,
    identified: false,
    mode: 'one form twice',
    reverse: false,
  },
  {
    asynchronous: true,
    identified: false,
    mode: 'one form twice',
    reverse: true,
  },
  {
    asynchronous: true,
    identified: false,
    mode: 'interleaved',
    reverse: false,
  },
  { asynchronous: true, identified: false, mode: 'interleaved', reverse: true },
  { asynchronous: true, identified: true, mode: 'two forms', reverse: false },
  { asynchronous: true, identified: true, mode: 'two forms', reverse: true },
  {
    asynchronous: true,
    identified: true,
    mode: 'one form twice',
    reverse: false,
  },
  {
    asynchronous: true,
    identified: true,
    mode: 'one form twice',
    reverse: true,
  },
  { asynchronous: true, identified: true, mode: 'interleaved', reverse: false },
  { asynchronous: true, identified: true, mode: 'interleaved', reverse: true },
])(
  'keeps each invocation equivalent to serialized validation: $asynchronous $identified $mode $reverse',
  async ({ asynchronous, identified, mode, reverse }) => {
    const schema: JSONSchema = {
      type: 'object',
      properties: { name: { type: 'string', minLength: 3 } },
      required: ['name'],
      ...(asynchronous ? { $async: true } : {}),
      ...(identified
        ? {
            $id: `https://round-four.invalid/${asynchronous}/${mode}/${reverse}`,
          }
        : {}),
    };
    const first = plugin.validator.compile(schema);
    const second =
      mode === 'two forms' ? plugin.validator.compile(schema) : first;
    const inputs =
      mode === 'interleaved'
        ? [{ name: 'x' }, { name: 'valid' }, { name: '' }, { name: 'another' }]
        : [{ name: 'x' }, { name: 'valid' }];
    if (reverse) inputs.reverse();
    const serialized = [];
    for (const input of inputs) serialized.push(await first(input));
    const overlapping = await Promise.all(
      inputs.map((input, index) => (index % 2 ? second : first)(input)),
    );
    expect(overlapping).toEqual(serialized);
    expect(serialized.some((issues) => issues !== null)).toBe(true);
    expect(serialized.some((issues) => issues === null)).toBe(true);
    plugin.validator.release?.(schema);
  },
);

it.each([false, 0, '', null])(
  'treats successful asynchronous validation of %j like synchronous validation',
  async (value) => {
    const schema: JSONSchema = { $async: true };
    const actual = await plugin.validator.compile(schema)(value);
    const synchronous = await plugin.validator.compile({})(value);
    expect(actual).toEqual(synchronous);
    expect(actual).toBeNull();
    plugin.validator.release?.(schema);
  },
);
