import { describe, expect, it } from 'vitest';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';

import { createDispatchTree } from '../../__tests__/fixtures/createDispatchTree';
import {
  dispatchMount,
  dispatchContextChange as setContext,
} from '../../write';

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

const fieldsGate = (key: string, expression: string) => ({
  type: 'object',
  properties: {
    a: { type: 'string', default: 'v' },
    t: { type: 'string', default: 't' },
  },
  controls: { fields: [{ targets: ['t'], controls: { [key]: expression } }] },
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

describe('diagnostic: absent child at the second referrer with the aliased index present', () => {
  const withExtra = (schema: any) => ({
    ...schema,
    properties: {
      ...schema.properties,
      extra: { type: 'string', controls: { visible: '../flag === true' } },
    },
  });

  it('D5 O9 (second referrer turns on from off) plus an unrelated visible control', () => {
    const schema = withExtra(
      twoDepths(fieldsGate('active', '../flag === true')),
    );
    const load = { flag: true, g: { flag: false } };
    const steps = [(root: any) => root.find('/g/flag')!.setValue(true)];
    expect(run(schema, load, steps)).toEqual(run(inline(schema), load, steps));
  });

  it('D6 node own active, second referrer turns on from off, plus an unrelated visible control', () => {
    const Q = {
      type: 'object',
      properties: {
        a: { type: 'string', default: 'v' },
        t: {
          type: 'string',
          default: 't',
          controls: { active: '../../flag === true' },
        },
      },
    };
    const schema = withExtra(twoDepths(Q));
    const load = { flag: true, g: { flag: false } };
    const steps = [(root: any) => root.find('/g/flag')!.setValue(true)];
    expect(run(schema, load, steps)).toEqual(run(inline(schema), load, steps));
  });

  it('D7 context: field starts active at both referrers and turns off', async () => {
    const Q = {
      type: 'object',
      properties: {
        a: { type: 'string', default: 'v' },
        t: {
          type: 'string',
          default: 't',
          controls: { active: '@.on === true' },
        },
      },
    };
    const schema = withExtra(twoDepths(Q));
    const read = (s: any) => {
      const { root } = createDispatchTree(s);
      setContext(root, { on: true });
      dispatchMount(root, {});
      const before = root.storedOutputValue;
      setContext(root, { on: false });
      return { before, after: root.storedOutputValue };
    };
    expect(read(schema)).toEqual(read(inline(schema)));
  });
});
