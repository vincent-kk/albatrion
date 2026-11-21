import { describe, expect, it } from 'vitest';

import { createDispatchTree } from '../../__tests__/fixtures/createDispatchTree';
import { find } from '../../navigation';
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

describe('context reads: which controls follow a context change at the second referrer', () => {
  const runContext = async (Q: any, extra?: any) => {
    const base = twoDepths(Q);
    const schema = extra
      ? { ...base, properties: { ...base.properties, extra } }
      : base;
    const read = (s: any) => {
      const { root } = createDispatchTree(s);
      setContext(root, { on: false });
      dispatchMount(root, {});
      const state = () => ({
        value: root.storedOutputValue,
        visible: [
          find(root, '/x/t')?.isVisible,
          find(root, '/g/y/t')?.isVisible,
        ],
        readOnly: [
          find(root, '/x/t')?.isReadOnly,
          find(root, '/g/y/t')?.isReadOnly,
        ],
      });
      const before = state();
      setContext(root, { on: true });
      return { before, after: state() };
    };
    return { ref: read(schema), inline: read(inline(schema)) };
  };
  const field = (controls: any) => ({
    type: 'object',
    properties: {
      a: { type: 'string', default: 'v' },
      t: { type: 'string', default: 't', controls },
    },
  });

  it('C2 visible reading context', async () => {
    const r = await runContext(field({ visible: '@.on === true' }));
    expect(r.ref).toEqual(r.inline);
  });

  it('C3 readOnly reading context', async () => {
    const r = await runContext(field({ readOnly: '@.on === true' }));
    expect(r.ref).toEqual(r.inline);
  });

  it('C4 active reading context with an unrelated path-reading visible control', async () => {
    const r = await runContext(field({ active: '@.on === true' }), {
      type: 'string',
      controls: { visible: '../flag === true' },
    });
    expect(r.ref).toEqual(r.inline);
  });

  it('C5 derived reading context', async () => {
    const r = await runContext(field({ derived: '(@).on ? "yes" : "no"' }));
    expect(r.ref).toEqual(r.inline);
  });

  it('C6 active reading context with a single referrer', async () => {
    const schema = withQ(field({ active: '@.on === true' }), {
      g: { type: 'object', properties: { y: { $ref: '#/$defs/Q' } } },
    });
    const read = (s: any) => {
      const { root } = createDispatchTree(s);
      setContext(root, { on: false });
      dispatchMount(root, {});
      setContext(root, { on: true });
      return root.storedOutputValue;
    };
    expect(read(schema)).toEqual(read(inline(schema)));
  });
});
