import { describe, expect, it } from 'vitest';
import { appendFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { nodeFromJSONSchema } from '../../__tests__/fixtures/nodeFromJSONSchema';

const tree = (jsonSchema: any, defaultValue?: any, extra: any = {}) =>
  nodeFromJSONSchema({ jsonSchema, defaultValue, ...extra } as any) as any;

/** Inline every local `$ref` (non-recursive schemas only). */
const inline = (schema: any, root: any = schema): any => {
  if (Array.isArray(schema)) return schema.map((s) => inline(s, root));
  if (schema === null || typeof schema !== 'object') return schema;
  if (typeof schema.$ref === 'string') {
    let target = root;
    for (const n of schema.$ref.slice(2).split('/')) target = target[n];
    const { $ref, ...rest } = schema;
    return inline({ ...inline(target, root), ...rest }, root);
  }
  const out: any = {};
  for (const key of Object.keys(schema)) {
    if (key === '$defs') continue;
    out[key] = inline(schema[key], root);
  }
  return out;
};

type Step = (root: any) => void;
const both = (schema: any, defaultValue: any, steps: Step[], extra: any = {}) => {
  const result = bothRaw(schema, defaultValue, steps, extra);
  appendFileSync(join(tmpdir(), 'r3-compile-diag.jsonl'), JSON.stringify({ name: expect.getState().currentTestName, result }) + '\n');
  return result;
};
const bothRaw = (schema: any, defaultValue: any, steps: Step[], extra: any = {}) => {
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

const P = {
  type: 'object',
  properties: {
    on: { type: 'boolean', default: false },
    a: { type: 'string', default: 'v' },
    t: { type: 'string', default: 't' },
    d: { type: 'string' },
    ro: { type: 'string' },
  },
  controls: {
    fields: [
      { targets: ['t'], controls: { active: './on === true' } },
      { targets: ['d'], controls: { derived: '(./a) + "!"' } },
      { targets: ['ro'], controls: { unsetValue: './on === true' } },
    ],
  },
};

describe('controls.fields inside multiply referenced templates', () => {
  it('F1 two referrers', () => {
    const schema = {
      type: 'object',
      properties: { x: { $ref: '#/$defs/P' }, y: { $ref: '#/$defs/P' } },
      $defs: { P },
    };
    const r = both(schema, { x: { ro: 'keep' }, y: { ro: 'keep' } }, [
      (root) => root.find('/y/on').setValue(true),
      (root) => root.find('/y/a').setValue('w'),
      (root) => root.find('/x/a').setValue('u'),
      (root) => root.find('/x/on').setValue(true),
      (root) => root.find('/y/on').setValue(false),
    ]);
    expect(r.ref).toEqual(r.inline);
  });

  it('F2 two referrers at different depths', () => {
    const schema = {
      type: 'object',
      properties: {
        x: { $ref: '#/$defs/P' },
        g: { type: 'object', properties: { y: { $ref: '#/$defs/P' } } },
      },
      $defs: { P },
    };
    const r = both(schema, {}, [
      (root) => root.find('/g/y/on').setValue(true),
      (root) => root.find('/g/y/a').setValue('w'),
      (root) => root.find('/x/a').setValue('u'),
    ]);
    expect(r.ref).toEqual(r.inline);
  });

  it('F3 array items', () => {
    const schema = {
      type: 'object',
      properties: { list: { type: 'array', items: { $ref: '#/$defs/P' } } },
      $defs: { P },
    };
    const r = both(schema, { list: [{}, {}] }, [
      (root) => root.find('/list/1/on').setValue(true),
      (root) => root.find('/list/1/a').setValue('w'),
      (root) => root.find('/list').remove(0),
      (root) => root.find('/list/0/a').setValue('z'),
      (root) => root.find('/list').push({ on: true }),
    ]);
    expect(r.ref).toEqual(r.inline);
  });

  it('F4 fields with outer-relative paths in a template', () => {
    const Q = {
      type: 'object',
      properties: { a: { type: 'string', default: 'v' }, t: { type: 'string', default: 't' } },
      controls: { fields: [{ targets: ['t'], controls: { active: '../flag === true' } }] },
    };
    const schema = {
      type: 'object',
      properties: {
        flag: { type: 'boolean', default: false },
        x: { $ref: '#/$defs/Q' },
        g: {
          type: 'object',
          properties: { flag: { type: 'boolean', default: true }, y: { $ref: '#/$defs/Q' } },
        },
      },
      $defs: { Q },
    };
    const r = both(schema, {}, [
      (root) => root.find('/flag').setValue(true),
      (root) => root.find('/g/flag').setValue(false),
    ]);
    expect(r.ref).toEqual(r.inline);
  });

  it('F5 template with allOf fragment controls', () => {
    const R = {
      type: 'object',
      properties: { on: { type: 'boolean', default: false }, a: { type: 'string', default: 'v' } },
      allOf: [
        {
          properties: {
            t: { type: 'string', default: 't', controls: { active: '../on === true' } },
            d: { type: 'string', controls: { derived: '(../a) + "#"' } },
          },
        },
      ],
    };
    const schema = {
      type: 'object',
      properties: { x: { $ref: '#/$defs/R' }, y: { $ref: '#/$defs/R' } },
      $defs: { R },
    };
    const r = both(schema, {}, [
      (root) => root.find('/y/on').setValue(true),
      (root) => root.find('/y/a').setValue('w'),
      (root) => root.find('/x/a').setValue('u'),
    ]);
    expect(r.ref).toEqual(r.inline);
  });

  it('F6 template with watch values', () => {
    const W = {
      type: 'object',
      properties: {
        a: { type: 'string', default: 'v' },
        w: { type: 'string', controls: { watch: ['../a', '/top'] } },
      },
    };
    const schema = {
      type: 'object',
      properties: { top: { type: 'string', default: 'T' }, x: { $ref: '#/$defs/W' }, y: { $ref: '#/$defs/W' } },
      $defs: { W },
    };
    const run = (s: any) => {
      const root = tree(s, {});
      const seen: any[] = [];
      const read = () => [root.find('/x/w').watchValues, root.find('/y/w').watchValues];
      seen.push(read());
      root.find('/y/a').setValue('w');
      seen.push(read());
      root.find('/top').setValue('T2');
      seen.push(read());
      root.find('/x/a').setValue('u');
      seen.push(read());
      return JSON.parse(JSON.stringify(seen));
    };
    expect(run(schema)).toEqual(run(inline(schema)));
  });
});
