import { describe, expect, it } from 'vitest';

import { nodeFromJSONSchema } from '../../__tests__/fixtures/nodeFromJSONSchema';

const tree = (jsonSchema: any, defaultValue?: any) =>
  nodeFromJSONSchema({ jsonSchema, defaultValue } as any) as any;

const P = {
  type: 'object',
  properties: {
    a: { type: 'string', default: 'v' },
    b: { type: 'string', controls: { derived: '(../a) + "!"' } },
  },
};

describe('shared template derived', () => {
  it('S1 single referrer updates', () => {
    const root = tree({ type: 'object', properties: { x: { $ref: '#/$defs/P' } }, $defs: { P } }, {});
    root.find('/x/a').setValue('w');
    expect(root.value).toEqual({ x: { a: 'w', b: 'w!' } });
  });

  it('S2 two referrers at same depth: second updates', () => {
    const root = tree(
      { type: 'object', properties: { x: { $ref: '#/$defs/P' }, y: { $ref: '#/$defs/P' } }, $defs: { P } },
      {},
    );
    root.find('/y/a').setValue('w');
    root.find('/x/a').setValue('u');
    expect(root.value).toEqual({ x: { a: 'u', b: 'u!' }, y: { a: 'w', b: 'w!' } });
  });

  it('S3 two referrers at different depths: first updates', () => {
    const root = tree(
      {
        type: 'object',
        properties: {
          x: { $ref: '#/$defs/P' },
          g: { type: 'object', properties: { y: { $ref: '#/$defs/P' } } },
        },
        $defs: { P },
      },
      {},
    );
    root.find('/x/a').setValue('u');
    expect(root.value.x).toEqual({ a: 'u', b: 'u!' });
  });

  it('S4 same at different depths without $ref (inline copies)', () => {
    const root = tree(
      {
        type: 'object',
        properties: {
          x: P,
          g: { type: 'object', properties: { y: P } },
        },
      },
      {},
    );
    root.find('/g/y/a').setValue('w');
    expect(root.value.g.y).toEqual({ a: 'w', b: 'w!' });
  });

  it('S5 array items with derived (non recursive)', () => {
    const root = tree(
      {
        type: 'object',
        properties: {
          list: { type: 'array', items: P },
          nest: { type: 'array', items: { type: 'array', items: P } },
        },
      },
      { list: [{}], nest: [[{}]] },
    );
    root.find('/list/0/a').setValue('w');
    root.find('/nest/0/0/a').setValue('z');
    expect(root.value).toEqual({ list: [{ a: 'w', b: 'w!' }], nest: [[{ a: 'z', b: 'z!' }]] });
  });

  it('S6 active gate in shared target, single referrer', () => {
    const root = tree(
      {
        type: 'object',
        properties: {
          a: { type: 'object', properties: { on: { type: 'boolean', default: true }, s: { $ref: '#/$defs/S' } } },
        },
        $defs: { S: { type: 'string', default: 'd', controls: { active: '../on === true' } } },
      },
      {},
    );
    expect(root.value).toEqual({ a: { on: true, s: 'd' } });
  });

  it('S7 active gate inline (control)', () => {
    const root = tree(
      {
        type: 'object',
        properties: {
          a: { type: 'object', properties: { on: { type: 'boolean', default: true }, s: { type: 'string', default: 'd', controls: { active: '../on === true' } } } },
        },
      },
      {},
    );
    expect(root.value).toEqual({ a: { on: true, s: 'd' } });
  });

  it('S8 fragment controls.default without standard default', () => {
    const root = tree(
      { type: 'object', properties: { s: { type: 'string', allOf: [{ controls: { default: 'frag' } }] } } },
      {},
    );
    expect(root.value).toEqual({ s: 'frag' });
  });

  it('S9 parent fields default vs standard default', () => {
    const root = tree(
      {
        type: 'object',
        properties: { s: { type: 'string', default: 'std' } },
        controls: { fields: [{ targets: ['s'], controls: { default: 'fld' } }] },
      },
      {},
    );
    expect(root.value).toEqual({ s: 'fld' });
  });
});

describe('shared template other rules', () => {
  const Q = {
    type: 'object',
    properties: {
      a: { type: 'string', default: 'v' },
      vis: { type: 'string', controls: { visible: '../a === "v"' } },
      act: { type: 'string', default: 'z', controls: { active: '../a === "v"' } },
      w: { type: 'string', controls: { watch: ['../a'] } },
    },
  };
  it('S10 second referrer: visible, active and watch follow its own source', () => {
    const root = tree(
      { type: 'object', properties: { x: { $ref: '#/$defs/Q' }, y: { $ref: '#/$defs/Q' } }, $defs: { Q } },
      {},
    );
    root.find('/y/a').setValue('changed');
    expect({
      vis: root.find('/y/vis').isVisible,
      act: root.value.y.act,
      w: root.find('/y/w').watchValues,
    }).toEqual({ vis: false, act: undefined, w: ['changed'] });
  });
});
