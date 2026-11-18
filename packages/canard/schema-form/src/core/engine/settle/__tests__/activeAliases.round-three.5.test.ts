import { describe, expect, it } from 'vitest';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';

const tree = (jsonSchema: any, defaultValue?: any) =>
  nodeFromJSONSchema({ jsonSchema, defaultValue });

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

const run = (schema: any, load: any, steps: ((root: any) => void)[]) => {
  const root = tree(schema, load);
  const seen: any[] = [root.value];
  for (const step of steps) {
    step(root);
    seen.push(root.value);
  }
  return seen;
};

const withQ = (Q: any, properties: any) => ({
  type: 'object',
  properties,
  $defs: { Q },
});

const twoDepths = (Q: any) =>
  withQ(Q, {
    flag: { type: 'boolean', default: false },
    x: { $ref: '#/$defs/Q' },
    g: {
      type: 'object',
      properties: {
        flag: { type: 'boolean', default: true },
        y: { $ref: '#/$defs/Q' },
      },
    },
  });

describe('edge controls alone in a reused template with an outer path', () => {
  it('E1 unsetValue only', () => {
    const Q = {
      type: 'object',
      properties: {
        a: { type: 'string', default: 'v' },
        t: { type: 'string', controls: { unsetValue: '../../flag === true' } },
      },
    };
    const schema = twoDepths(Q);
    const load = { x: { t: 'keepX' }, g: { flag: false, y: { t: 'keepY' } } };
    const steps = [(root: any) => root.find('/g/flag')!.setValue(true)];
    expect(run(schema, load, steps)).toEqual(run(inline(schema), load, steps));
  });

  it('E2 resetInteraction only', () => {
    const Q = {
      type: 'object',
      properties: {
        a: { type: 'string', default: 'v' },
        t: {
          type: 'string',
          controls: { resetInteraction: '../../flag === true' },
        },
      },
    };
    const schema = twoDepths(Q);
    const read = (s: any) => {
      const root = tree(s, { g: { flag: false } });
      root.find('/g/y/t')!.setValue('typed');
      const before = root.find('/g/y/t')!.isEdited;
      root.find('/g/flag')!.setValue(true);
      const after = root.find('/g/y/t')!.isEdited;
      return { before, after };
    };
    expect(read(schema)).toEqual(read(inline(schema)));
  });
});
