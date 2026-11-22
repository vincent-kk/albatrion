import { describe, expect, it } from 'vitest';

import { createDispatchTree } from '../../__tests__/fixtures/createDispatchTree';
import {
  dispatchMount,
  dispatchContextChange as setContext,
} from '../../write';

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

describe('context reads in a reused active-only template', () => {
  it('C1 both referrers follow a context change', async () => {
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
    const schema = twoDepths(Q);
    const read = (s: any) => {
      const { root } = createDispatchTree(s);
      setContext(root, { on: false });
      dispatchMount(root, {});
      const before = root.storedOutputValue;
      setContext(root, { on: true });
      return { before, after: root.storedOutputValue };
    };
    expect(read(schema)).toEqual(read(inline(schema)));
  });
});
