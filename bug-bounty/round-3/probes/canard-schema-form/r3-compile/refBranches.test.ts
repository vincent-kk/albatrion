import { describe, expect, it } from 'vitest';
import { appendFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const diag = (name: any, data: any) => appendFileSync(join(tmpdir(), 'r3-compile-diag.jsonl'), JSON.stringify({ name, data }) + '\n');

import { createTestValidator } from '../../core/__tests__/fixtures/createTestValidator';
import { nodeFromJSONSchema } from '../../__tests__/fixtures/nodeFromJSONSchema';

const tree = (jsonSchema: any, defaultValue?: any, extra: any = {}) =>
  nodeFromJSONSchema({ jsonSchema, defaultValue, ...extra } as any) as any;

/** Inline every local `$ref` (non-recursive schemas only). */
const inline = (schema: any, root: any = schema): any => {
  if (Array.isArray(schema)) return schema.map((s) => inline(s, root));
  if (schema === null || typeof schema !== 'object') return schema;
  if (typeof schema.$ref === 'string') {
    const names = schema.$ref
      .slice(2)
      .split('/')
      .map((n: string) => decodeURIComponent(n).replace(/~1/g, '/').replace(/~0/g, '~'));
    let target = root;
    for (const n of names) target = target[n];
    const { $ref, ...rest } = schema;
    return inline({ ...inline(target, root), ...rest }, root);
  }
  const out: any = {};
  for (const key of Object.keys(schema)) {
    if (key === '$defs' || key === 'definitions') continue;
    out[key] = inline(schema[key], root);
  }
  return out;
};

type Step = (root: any) => void;

const both = (schema: any, defaultValue: any, steps: Step[], extra: any = {}) => {
  const run = (s: any) => {
    const root = tree(s, defaultValue, extra);
    const seen: any[] = [root.value];
    for (const step of steps) {
      step(root);
      seen.push(root.value);
    }
    return seen;
  };
  return { ref: run(schema), inline: run(inline(schema)) };
};

const A = {
  controls: { active: "./type === 'A'" },
  properties: { fieldA: { type: 'string', default: 'da' } },
};
const B = {
  controls: { active: "./type === 'B'" },
  properties: { fieldB: { type: 'string', default: 'db' } },
};

describe('EQ1 $ref branches against inline branches', () => {
  it('R1 oneOf branches through $ref', () => {
    const schema = {
      type: 'object',
      properties: { type: { type: 'string', enum: ['A', 'B'], default: 'A' } },
      oneOf: [{ $ref: '#/$defs/A' }, { $ref: '#/$defs/B' }],
      $defs: { A, B },
    };
    const r = both(schema, {}, [(root) => root.find('/type').setValue('B')]);
    diag(expect.getState().currentTestName, r);
    expect(r.ref).toEqual(r.inline);
  });

  it('R2 anyOf branches through $ref', () => {
    const schema = {
      type: 'object',
      properties: { type: { type: 'string', default: 'A' } },
      anyOf: [{ $ref: '#/$defs/A' }, { $ref: '#/$defs/B' }],
      $defs: { A, B },
    };
    const r = both(schema, {}, [(root) => root.find('/type').setValue('B')]);
    diag(expect.getState().currentTestName, r);
    expect(r.ref).toEqual(r.inline);
  });

  it('R3 gated allOf fragment through $ref', () => {
    const schema = {
      type: 'object',
      properties: { on: { type: 'boolean', default: false } },
      allOf: [{ $ref: '#/$defs/G' }],
      $defs: {
        G: {
          controls: { active: '../on === true' },
          properties: { extra: { type: 'string', default: 'x' } },
        },
      },
    };
    const r = both(schema, {}, [
      (root) => root.find('/on').setValue(true),
      (root) => root.find('/on').setValue(false),
    ]);
    diag(expect.getState().currentTestName, r);
    expect(r.ref).toEqual(r.inline);
  });

  it('R3b gated allOf fragment through $ref with ./ path', () => {
    const schema = {
      type: 'object',
      properties: { on: { type: 'boolean', default: false } },
      allOf: [{ $ref: '#/$defs/G' }],
      $defs: {
        G: {
          controls: { active: './on === true' },
          properties: { extra: { type: 'string', default: 'x' } },
        },
      },
    };
    const r = both(schema, {}, [
      (root) => root.find('/on').setValue(true),
      (root) => root.find('/on').setValue(false),
    ]);
    diag(expect.getState().currentTestName, r);
    expect(r.ref).toEqual(r.inline);
  });

  it('R4 template with gated oneOf referenced twice', () => {
    const P = {
      type: 'object',
      properties: { type: { type: 'string', default: 'A' } },
      oneOf: [A, B],
    };
    const schema = {
      type: 'object',
      properties: { x: { $ref: '#/$defs/P' }, y: { $ref: '#/$defs/P' } },
      $defs: { P },
    };
    const r = both(schema, {}, [
      (root) => root.find('/y/type').setValue('B'),
      (root) => root.find('/x/type').setValue('B'),
      (root) => root.find('/y/type').setValue('A'),
    ]);
    diag(expect.getState().currentTestName, r);
    expect(r.ref).toEqual(r.inline);
  });

  it('R5 template with $ref branches referenced twice', () => {
    const P = {
      type: 'object',
      properties: { type: { type: 'string', default: 'A' } },
      oneOf: [{ $ref: '#/$defs/A' }, { $ref: '#/$defs/B' }],
    };
    const schema = {
      type: 'object',
      properties: { x: { $ref: '#/$defs/P' }, y: { $ref: '#/$defs/P' } },
      $defs: { P, A, B },
    };
    const r = both(schema, {}, [
      (root) => root.find('/y/type').setValue('B'),
      (root) => root.find('/x/type').setValue('B'),
      (root) => root.find('/y/type').setValue('A'),
    ]);
    diag(expect.getState().currentTestName, r);
    expect(r.ref).toEqual(r.inline);
  });

  it('R6 branch $ref with its own sibling gate', () => {
    const schema = {
      type: 'object',
      properties: { type: { type: 'string', default: 'A' } },
      oneOf: [
        { $ref: '#/$defs/PA', controls: { active: "./type === 'A'" } },
        { $ref: '#/$defs/PB', controls: { active: "./type === 'B'" } },
      ],
      $defs: {
        PA: { properties: { fieldA: { type: 'string', default: 'da' } } },
        PB: { properties: { fieldB: { type: 'string', default: 'db' } } },
      },
    };
    const r = both(schema, {}, [(root) => root.find('/type').setValue('B')]);
    diag(expect.getState().currentTestName, r);
    expect(r.ref).toEqual(r.inline);
  });

  it('R7 double indirection branch', () => {
    const schema = {
      type: 'object',
      properties: { type: { type: 'string', default: 'A' } },
      oneOf: [{ $ref: '#/$defs/A1' }, { $ref: '#/$defs/B1' }],
      $defs: { A1: { $ref: '#/$defs/A' }, B1: { $ref: '#/$defs/B' }, A, B },
    };
    const r = both(schema, {}, [(root) => root.find('/type').setValue('B')]);
    diag(expect.getState().currentTestName, r);
    expect(r.ref).toEqual(r.inline);
  });

  it('R8 nested oneOf inside a $ref branch', () => {
    const schema = {
      type: 'object',
      properties: {
        type: { type: 'string', default: 'A' },
        sub: { type: 'string', default: 'p' },
      },
      oneOf: [{ $ref: '#/$defs/AN' }, B],
      $defs: {
        AN: {
          controls: { active: "./type === 'A'" },
          oneOf: [
            { controls: { active: "./sub === 'p'" }, properties: { p: { type: 'string', default: 'pp' } } },
            { controls: { active: "./sub === 'q'" }, properties: { q: { type: 'string', default: 'qq' } } },
          ],
        },
      },
    };
    const r = both(schema, {}, [
      (root) => root.find('/sub').setValue('q'),
      (root) => root.find('/type').setValue('B'),
      (root) => root.find('/type').setValue('A'),
    ]);
    diag(expect.getState().currentTestName, r);
    expect(r.ref).toEqual(r.inline);
  });

  it('R9 array items $ref with gated oneOf', () => {
    const schema = {
      type: 'object',
      properties: { list: { type: 'array', items: { $ref: '#/$defs/P' } } },
      $defs: {
        P: {
          type: 'object',
          properties: { type: { type: 'string', default: 'A' } },
          oneOf: [{ $ref: '#/$defs/A' }, { $ref: '#/$defs/B' }],
        },
        A,
        B,
      },
    };
    const r = both(schema, { list: [{}, {}] }, [
      (root) => root.find('/list/1/type').setValue('B'),
      (root) => root.find('/list').push({ type: 'B' }),
      (root) => root.find('/list/0/type').setValue('B'),
      (root) => root.find('/list').remove(0),
      (root) => root.find('/list/0/type').setValue('A'),
    ]);
    diag(expect.getState().currentTestName, r);
    expect(r.ref).toEqual(r.inline);
  });

  it('R10 discriminator with $ref branches referenced twice', () => {
    const P = {
      type: 'object',
      properties: { kind: { type: 'string', default: 'a' } },
      controls: { discriminator: 'kind' },
      oneOf: [{ $ref: '#/$defs/KA' }, { $ref: '#/$defs/KB' }],
    };
    const schema = {
      type: 'object',
      properties: { x: { $ref: '#/$defs/P' }, y: { $ref: '#/$defs/P' } },
      $defs: {
        P,
        KA: { properties: { kind: { const: 'a' }, ka: { type: 'string', default: 'A!' } } },
        KB: { properties: { kind: { const: 'b' }, kb: { type: 'string', default: 'B!' } } },
      },
    };
    const r = both(schema, {}, [
      (root) => root.find('/y/kind').setValue('b'),
      (root) => root.find('/x/kind').setValue('b'),
      (root) => root.find('/y/kind').setValue('a'),
    ]);
    diag(expect.getState().currentTestName, r);
    expect(r.ref).toEqual(r.inline);
  });
});

describe('EQ1 if/then/else with $ref', () => {
  const v = () => ({ validator: createTestValidator() });
  const cond = { properties: { on: { const: true } }, required: ['on'] };
  const thenS = { properties: { t: { type: 'string', default: 'tt' } } };
  const elseS = { properties: { e: { type: 'string', default: 'ee' } } };

  it('I1 then/else through $ref', () => {
    const schema = {
      type: 'object',
      properties: { on: { type: 'boolean', default: false } },
      if: cond,
      then: { $ref: '#/$defs/T' },
      else: { $ref: '#/$defs/E' },
      $defs: { T: thenS, E: elseS },
    };
    const r = both(schema, {}, [
      (root) => root.find('/on').setValue(true),
      (root) => root.find('/on').setValue(false),
    ], v());
    diag(expect.getState().currentTestName, r);
    expect(r.ref).toEqual(r.inline);
  });

  it('I2 if through $ref', () => {
    const schema = {
      type: 'object',
      properties: { on: { type: 'boolean', default: false } },
      if: { $ref: '#/$defs/C' },
      then: thenS,
      else: elseS,
      $defs: { C: cond },
    };
    const r = both(schema, {}, [
      (root) => root.find('/on').setValue(true),
      (root) => root.find('/on').setValue(false),
    ], v());
    diag(expect.getState().currentTestName, r);
    expect(r.ref).toEqual(r.inline);
  });

  it('I3 if/then/else inside a $ref target referenced twice', () => {
    const P = {
      type: 'object',
      properties: { on: { type: 'boolean', default: false } },
      if: cond,
      then: thenS,
      else: elseS,
    };
    const schema = {
      type: 'object',
      properties: { x: { $ref: '#/$defs/P' }, y: { $ref: '#/$defs/P' } },
      $defs: { P },
    };
    const r = both(schema, {}, [
      (root) => root.find('/y/on').setValue(true),
      (root) => root.find('/x/on').setValue(true),
      (root) => root.find('/y/on').setValue(false),
    ], v());
    diag(expect.getState().currentTestName, r);
    expect(r.ref).toEqual(r.inline);
  });

  it('I4 allOf $ref fragment that holds if/then', () => {
    const schema = {
      type: 'object',
      properties: { on: { type: 'boolean', default: false } },
      allOf: [{ $ref: '#/$defs/F' }],
      $defs: { F: { if: cond, then: thenS, else: elseS } },
    };
    const r = both(schema, {}, [
      (root) => root.find('/on').setValue(true),
      (root) => root.find('/on').setValue(false),
    ], v());
    diag(expect.getState().currentTestName, r);
    expect(r.ref).toEqual(r.inline);
  });

  it('I5 oneOf $ref branch that holds if/then', () => {
    const schema = {
      type: 'object',
      properties: {
        type: { type: 'string', default: 'A' },
        on: { type: 'boolean', default: false },
      },
      oneOf: [{ $ref: '#/$defs/BA' }, B],
      $defs: {
        BA: { controls: { active: "./type === 'A'" }, if: cond, then: thenS },
      },
    };
    const r = both(schema, {}, [
      (root) => root.find('/on').setValue(true),
      (root) => root.find('/type').setValue('B'),
      (root) => root.find('/type').setValue('A'),
    ], v());
    diag(expect.getState().currentTestName, r);
    expect(r.ref).toEqual(r.inline);
  });

  it('I6 array item $ref with if/then', () => {
    const schema = {
      type: 'object',
      properties: { list: { type: 'array', items: { $ref: '#/$defs/P' } } },
      $defs: {
        P: {
          type: 'object',
          properties: { on: { type: 'boolean', default: false } },
          if: cond,
          then: thenS,
        },
      },
    };
    const r = both(schema, { list: [{}, {}] }, [
      (root) => root.find('/list/1/on').setValue(true),
      (root) => root.find('/list').remove(0),
      (root) => root.find('/list').push({ on: true }),
    ], v());
    diag(expect.getState().currentTestName, r);
    expect(r.ref).toEqual(r.inline);
  });
});
