import { describe, expect, it } from 'vitest';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';
import { createTestValidator } from '@/schema-form/core/__tests__/fixtures/createTestValidator';

import { FieldNodeEventType } from '../record';
import { ValidationMode } from '../types/state';

/*
 * A schema event comes only when a child's schema changes in content: a child the
 * host's wheel reselects and an item recomposed for its own decision both adopt an equal
 * composition under its new reference without a record or an event.
 */

const validator = createTestValidator();

type ProbeRoot = ReturnType<typeof nodeFromJSONSchema>;

const mount = (schema: object, value: unknown): ProbeRoot =>
  nodeFromJSONSchema({
    jsonSchema: schema,
    defaultValue: value,
    validationMode: ValidationMode.None,
    validator,
  });

/** Count schema events per path from now on. */
const watchSchemaEvents = (root: ProbeRoot, paths: readonly string[]) => {
  const counts = new Map(paths.map((path) => [path, 0]));
  for (const path of paths)
    root.find(path)?.subscribe((event) => {
      if (event.type & FieldNodeEventType.UpdateJsonSchema)
        counts.set(path, (counts.get(path) ?? 0) + 1);
    });
  return counts;
};

const read = (root: ProbeRoot, path: string) =>
  JSON.stringify(root.find(path)?.jsonSchema ?? null);

const ifEqual = (name: string, value: string) => ({
  properties: { [name]: { const: value } },
  required: [name],
});

/** Either decision admits the same `minLength`, so switching between them composes equal items. */
const twoEqualDecisions = {
  type: 'object',
  properties: {
    list: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          p: { type: 'string' },
          q: { type: 'string' },
          v: { type: 'string' },
        },
        allOf: [
          {
            if: ifEqual('p', '1'),
            then: { properties: { v: { minLength: 3 } } },
          },
          {
            if: ifEqual('q', '1'),
            then: { properties: { v: { minLength: 3 } } },
          },
        ],
      },
    },
  },
};

/**
 * `/c` takes the same `minLength` from `d` or from `e`. Clearing `d` while writing `''` to `e`
 * leaves `''` omitted under `/e`'s start schema, so the first pass composes `/c` without
 * `minLength`; once the rule on `k` keeps `/e`'s empty value, a later round satisfies `e` and
 * `/c` returns to equal content under the other decision and another reference.
 */
const laterRoundReturn = {
  type: 'object',
  properties: {
    c: { type: 'string' },
    d: { type: 'string' },
    e: { type: 'string' },
    k: { type: 'string' },
  },
  allOf: [
    { if: { required: ['d'] }, then: { properties: { c: { minLength: 1 } } } },
    { if: { required: ['e'] }, then: { properties: { c: { minLength: 1 } } } },
    {
      if: { required: ['k'] },
      then: { properties: { e: { options: { omitEmpty: false } } } },
    },
  ],
};

describe('a schema event only when the content differs', () => {
  it('an item recomposed for its own decision into an equal schema gets no schema event', () => {
    const root = mount(twoEqualDecisions, {
      list: [{ p: '1', q: '0', v: 'a' }],
    });
    const before = read(root, '/list/0');
    const events = watchSchemaEvents(root, ['/list/0', '/list/0/v']);
    root.find('/list/0/q')?.setValue('1');
    expect(read(root, '/list/0')).toBe(before);
    expect(Object.fromEntries(events)).toEqual({
      '/list/0': 0,
      '/list/0/v': 0,
    });
  });

  it('each switch between the two decisions keeps the item silent, and each state equals a fresh load', () => {
    const root = mount(twoEqualDecisions, {
      list: [{ p: '1', q: '0', v: 'a' }],
    });
    const events = watchSchemaEvents(root, ['/list/0', '/list/0/v']);
    const writes: [string, string][] = [
      ['/list/0/q', '1'],
      ['/list/0/p', '0'],
      ['/list/0/p', '1'],
      ['/list/0/q', '0'],
    ];
    for (const [path, value] of writes) {
      root.find(path)?.setValue(value);
      const fresh = mount(twoEqualDecisions, structuredClone(root.value));
      expect(read(root, '/list/0'), path).toBe(read(fresh, '/list/0'));
      expect(read(root, '/list/0/v'), path).toBe(read(fresh, '/list/0/v'));
    }
    expect(Object.fromEntries(events)).toEqual({
      '/list/0': 0,
      '/list/0/v': 0,
    });
  });

  it('a reset child that a later round returns to equal content under another decision gets no schema event', () => {
    const root = mount(laterRoundReturn, { c: 'y', d: 'v', k: 'x' });
    const before = read(root, '/c');
    const events = watchSchemaEvents(root, ['/c']);
    root.batch(() => {
      root.find('/d')?.setValue(undefined);
      root.find('/e')?.setValue('');
    });
    const fresh = mount(laterRoundReturn, structuredClone(root.value));
    expect(read(root, '/c')).toBe(before);
    expect(read(root, '/c')).toBe(read(fresh, '/c'));
    expect(read(root, '/e')).toBe(read(fresh, '/e'));
    expect(root.value).toEqual(fresh.value);
    expect(Object.fromEntries(events)).toEqual({ '/c': 0 });
  });

  it('a decision that changes the content still delivers one schema event', () => {
    const root = mount(twoEqualDecisions, {
      list: [{ p: '1', q: '0', v: 'a' }],
    });
    const events = watchSchemaEvents(root, ['/list/0', '/list/0/v']);
    root.find('/list/0/p')?.setValue('0');
    expect(Object.fromEntries(events)).toEqual({
      '/list/0': 1,
      '/list/0/v': 1,
    });
  });
});
