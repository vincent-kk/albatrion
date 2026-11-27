import { expect, it } from 'vitest';

import { readSlotKind } from '../utils/readSlotKind';

it.each([
  {
    keyword: 'items',
    jsonSchema: { type: 'array', items: { type: 'string' } },
  },
  {
    keyword: 'prefixItems',
    jsonSchema: { type: 'array', prefixItems: [{ type: 'string' }] },
  },
] satisfies readonly {
  keyword: string;
  jsonSchema: Parameters<typeof readSlotKind>[0];
}[])(
  '$keyword uses the selected candidate schema instead of the first candidate kind',
  ({ jsonSchema }) => {
    expect(readSlotKind(jsonSchema, 0, { type: 'number' })).toBe('number');
    expect(readSlotKind(jsonSchema, 0, { type: 'string' })).toBe('text');
    expect(readSlotKind(jsonSchema, 0, { type: 'boolean' })).toBe('checkbox');
    expect(readSlotKind(jsonSchema, 0, { type: 'object' })).toBe('fill');
  },
);
