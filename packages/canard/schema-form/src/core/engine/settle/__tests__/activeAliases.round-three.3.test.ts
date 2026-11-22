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

describe('other gate shapes reading outside a reused template', () => {
  it('O12 oneOf branch gates that read the referrer sibling', () => {
    const Q = {
      type: 'object',
      properties: { a: { type: 'string', default: 'v' } },
      oneOf: [
        {
          controls: { active: '../mode === "a"' },
          properties: { pa: { type: 'string', default: 'A' } },
        },
        {
          controls: { active: '../mode === "b"' },
          properties: { pb: { type: 'string', default: 'B' } },
        },
      ],
    };
    const schema = withQ(Q, {
      g1: {
        type: 'object',
        properties: {
          mode: { type: 'string', default: 'a' },
          y: { $ref: '#/$defs/Q' },
        },
      },
      g2: {
        type: 'object',
        properties: {
          mode: { type: 'string', default: 'a' },
          y: { $ref: '#/$defs/Q' },
        },
      },
    });
    const steps = [(root: any) => root.find('/g2/mode')!.setValue('b')];
    expect(run(schema, {}, steps)).toEqual(run(inline(schema), {}, steps));
  });

  it('O13 recursive template whose field reads the parent node', () => {
    const schema = {
      type: 'object',
      properties: { root: { $ref: '#/$defs/N' } },
      $defs: {
        N: {
          type: 'object',
          properties: {
            open: { type: 'boolean', default: true },
            label: {
              type: 'string',
              default: 'L',
              controls: { active: '../../../open === true' },
            },
            kids: { type: 'array', items: { $ref: '#/$defs/N' } },
          },
        },
      },
    };
    const root = tree(schema, {
      root: { open: true, kids: [{ open: true, kids: [{}] }] },
    });
    const before = root.find('/root/kids/0/kids/0/label')! !== null;
    root.find('/root/kids/0/open')!.setValue(false);
    const after = root.find('/root/kids/0/kids/0/label')! !== null;
    expect({ before, after }).toEqual({ before: true, after: false });
  });
});
