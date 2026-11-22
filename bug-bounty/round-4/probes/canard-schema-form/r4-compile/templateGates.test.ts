import { describe, expect, it } from 'vitest';

import { nodeFromJSONSchema } from '../../__tests__/fixtures/nodeFromJSONSchema';
import { setContext } from '../../core';
import { createTestValidator } from '../../core/__tests__/fixtures/createTestValidator';

const tree = (jsonSchema: any, defaultValue?: any, extra: any = {}) =>
  nodeFromJSONSchema({
    jsonSchema,
    defaultValue,
    validator: createTestValidator(),
    ...extra,
  } as any) as any;

const attempt = <T>(fn: () => T): T | { error: string } => {
  try {
    return fn();
  } catch (error) {
    return { error: String((error as any)?.code ?? error) };
  }
};

/** Replace every `{ $ref: '#/$defs/T' }` with a structural copy of T. */
const inline = (schema: any): any => {
  const defs = schema.$defs;
  const walk = (value: any): any => {
    if (Array.isArray(value)) return value.map(walk);
    if (value === null || typeof value !== 'object') return value;
    if (typeof value.$ref === 'string') {
      const target = defs[value.$ref.slice('#/$defs/'.length)];
      const { $ref, ...rest } = value;
      return { ...walk(structuredClone(target)), ...rest };
    }
    const out: any = {};
    for (const key of Object.keys(value))
      if (key !== '$defs') out[key] = walk(value[key]);
    return out;
  };
  return walk(schema);
};

/** Two hosts (`buyer`, `seller`) referencing the same template T as `contact`. */
const hosts = (T: any) => ({
  type: 'object',
  properties: {
    buyer: {
      type: 'object',
      properties: { flag: { type: 'boolean' }, contact: { $ref: '#/$defs/T' } },
    },
    seller: {
      type: 'object',
      properties: { flag: { type: 'boolean' }, contact: { $ref: '#/$defs/T' } },
    },
  },
  $defs: { T },
});

const start = {
  buyer: { flag: false, contact: { kind: 'company' } },
  seller: { flag: false, contact: { kind: 'company' } },
};

type Step = [path: string, value: unknown] | ['@', Record<string, unknown>];

const play = (schema: any, steps: Step[], context?: any) =>
  attempt(() => {
    const root = tree(schema, structuredClone(start), { context });
    const seen = [structuredClone(root.value)];
    for (const [path, value] of steps) {
      if (path === '@') setContext(root, value as any);
      else root.find(path).setValue(value);
      seen.push(structuredClone(root.value));
    }
    return seen;
  });

const compare = (T: any, steps: Step[], context?: any) => {
  const schema = hosts(T);
  const expected = play(inline(schema), steps, context);
  // Guard against a vacuous comparison: the inline run must toggle the gated field on and off.
  const text = JSON.stringify(expected);
  expect(text).toContain('"vatId":"V"');
  expect((expected as any[]).some((v) => !v.seller?.contact?.vatId)).toBe(true);
  return {
    ref: play(schema, steps, context),
    inline: expected,
  };
};

const outer: Step[] = [
  ['/seller/flag', true],
  ['/buyer/flag', true],
  ['/seller/flag', false],
  ['/seller/flag', true],
];

const vat = (active: string) => ({
  vatId: { type: 'string', default: 'V', controls: { active } },
});

describe('reused template: child gates under if/then read an outer path', () => {
  it('then-branch child with ../../flag', () => {
    const T = {
      type: 'object',
      properties: { kind: { type: 'string' } },
      if: { properties: { kind: { const: 'company' } }, required: ['kind'] },
      then: { properties: vat('../../flag === true') },
    };
    const { ref, inline: expected } = compare(T, outer);
    expect(ref).toEqual(expected);
  });

  it('else-branch child with ../../flag', () => {
    const T = {
      type: 'object',
      properties: { kind: { type: 'string' } },
      if: { properties: { kind: { const: 'person' } }, required: ['kind'] },
      else: { properties: vat('../../flag === true') },
    };
    const { ref, inline: expected } = compare(T, outer);
    expect(ref).toEqual(expected);
  });

  it('then-branch child with @ context', () => {
    const T = {
      type: 'object',
      properties: { kind: { type: 'string' } },
      if: { properties: { kind: { const: 'company' } }, required: ['kind'] },
      then: { properties: vat('@.role === "admin"') },
    };
    const { ref, inline: expected } = compare(
      T,
      [
        ['@', { role: 'admin' }],
        ['@', { role: 'user' }],
        ['@', { role: 'admin' }],
      ],
      { role: 'user' },
    );
    expect(ref).toEqual(expected);
  });
});

describe('reused template: gated allOf fragments read an outer path', () => {
  it('fragment-level controls.active with ../flag', () => {
    const T = {
      type: 'object',
      properties: { kind: { type: 'string' } },
      allOf: [
        {
          controls: { active: '../flag === true' },
          properties: { vatId: { type: 'string', default: 'V' } },
        },
      ],
    };
    const { ref, inline: expected } = compare(T, outer);
    expect(ref).toEqual(expected);
  });

  it('child gate inside an ungated allOf fragment with ../../flag', () => {
    const T = {
      type: 'object',
      properties: { kind: { type: 'string' } },
      allOf: [{ properties: vat('../../flag === true') }],
    };
    const { ref, inline: expected } = compare(T, outer);
    expect(ref).toEqual(expected);
  });

  it('fragment-level controls.active with @ context', () => {
    const T = {
      type: 'object',
      properties: { kind: { type: 'string' } },
      allOf: [
        {
          controls: { active: '@.role === "admin"' },
          properties: { vatId: { type: 'string', default: 'V' } },
        },
      ],
    };
    const { ref, inline: expected } = compare(
      T,
      [
        ['@', { role: 'admin' }],
        ['@', { role: 'user' }],
        ['@', { role: 'admin' }],
      ],
      { role: 'user' },
    );
    expect(ref).toEqual(expected);
  });
});

describe('reused template: oneOf branch-level active and nested template', () => {
  it('oneOf branch active with ../flag (round 3 sibling scope, control)', () => {
    const T = {
      type: 'object',
      properties: { kind: { type: 'string' } },
      oneOf: [
        {
          controls: { active: '../flag === true' },
          properties: { vatId: { type: 'string', default: 'V' } },
        },
        {
          controls: { active: '../flag !== true' },
          properties: { ssn: { type: 'string', default: 'S' } },
        },
      ],
    };
    const { ref, inline: expected } = compare(T, outer);
    expect(ref).toEqual(expected);
  });

  it('template nested inside another template, child reads three levels up', () => {
    const schema = {
      type: 'object',
      properties: {
        buyer: {
          type: 'object',
          properties: { flag: { type: 'boolean' }, contact: { $ref: '#/$defs/Outer' } },
        },
        seller: {
          type: 'object',
          properties: { flag: { type: 'boolean' }, contact: { $ref: '#/$defs/Outer' } },
        },
      },
      $defs: {
        Outer: {
          type: 'object',
          properties: { kind: { type: 'string' }, inner: { $ref: '#/$defs/Inner' } },
        },
        Inner: {
          type: 'object',
          properties: vat('../../../flag === true'),
        },
      },
    };
    const inlined = {
      type: 'object',
      properties: Object.fromEntries(
        ['buyer', 'seller'].map((name) => [
          name,
          {
            type: 'object',
            properties: {
              flag: { type: 'boolean' },
              contact: {
                type: 'object',
                properties: {
                  kind: { type: 'string' },
                  inner: { type: 'object', properties: vat('../../../flag === true') },
                },
              },
            },
          },
        ]),
      ),
    };
    expect(play(schema, outer)).toEqual(play(inlined, outer));
  });
});
