import { describe, expect, it } from 'vitest';

import { nodeFromJSONSchema } from '../../__tests__/fixtures/nodeFromJSONSchema';

const tree = (jsonSchema: any, defaultValue?: any) =>
  nodeFromJSONSchema({ jsonSchema, defaultValue } as any) as any;

const gated = {
  type: 'object',
  properties: {
    on: { type: 'boolean', default: true },
    a: { type: 'string', default: 'av', controls: { active: '../on === true' } },
    b: { type: 'string', controls: { derived: '(../a) ?? "none"' } },
    c: { type: 'string', controls: { visible: '../a === "av"' } },
  },
};

describe('F1 derive rules miss a dependency that leaves the shape', () => {
  it('F1a derived keeps a stale value while visible already sees the exit', () => {
    const root = tree(gated, {});
    expect(root.value).toEqual({ on: true, a: 'av', b: 'av' });
    root.find('/on').setValue(false);
    expect(root.find('/c').isVisible).toBe(false);
    expect(root.value).toEqual({ on: false, b: 'none' });
  });

  it('F1b same final input at mount gives a different value', () => {
    const mounted = tree(gated, { on: false });
    const sequenced = tree(gated, {});
    sequenced.find('/on').setValue(false);
    expect(sequenced.value).toEqual(mounted.value);
  });

  it('F1c the missed edge fires later and overwrites a direct user edit', () => {
    const root = tree(gated, {});
    root.find('/on').setValue(false);
    root.find('/b').setValue('mine');
    expect(root.find('/b').value).toBe('mine');
  });

  it('F1d oneOf branch switch removing the dependency', () => {
    const root = tree(
      {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['A', 'B'], default: 'A' },
          label: { type: 'string', controls: { derived: '(../fieldA) ?? "-"' } },
        },
        oneOf: [
          { controls: { active: "./type === 'A'" }, properties: { fieldA: { type: 'string', default: 'fa' } } },
          { controls: { active: "./type === 'B'" }, properties: { fieldB: { type: 'string' } } },
        ],
      },
      {},
    );
    root.find('/type').setValue('B');
    expect(root.value).toEqual({ type: 'B', label: '-' });
  });

  it('F1e unsetValue reading an exiting dependency never fires', () => {
    const root = tree(
      {
        type: 'object',
        properties: {
          on: { type: 'boolean', default: true },
          a: { type: 'string', default: 'av', controls: { active: '../on === true' } },
          t: { type: 'string', controls: { unsetValue: '(../a) === undefined' } },
        },
      },
      {},
    );
    root.find('/t').setValue('keep');
    root.find('/on').setValue(false);
    expect(root.value).toEqual({ on: false });
  });
});

describe('F2 path substitution rewrites text inside string literals', () => {
  it('F2a standalone @ inside a string literal is replaced by the context', () => {
    const root = tree(
      {
        type: 'object',
        properties: {
          tag: { type: 'string' },
          extra: { type: 'string', default: 'X', controls: { active: '../tag === "a @ b"' } },
        },
      },
      {},
    );
    root.find('/tag').setValue('a @ b');
    expect(root.value).toEqual({ tag: 'a @ b', extra: 'X' });
  });

  it('F2b a " /x" inside a string literal makes a valid expression fail to compile', () => {
    expect(() =>
      tree({
        type: 'object',
        properties: {
          unit: { type: 'string' },
          extra: { type: 'string', controls: { active: '../unit === "km /h"' } },
        },
      }),
    ).not.toThrow();
  });
});

describe('F3 watchValues identity', () => {
  it('F3 unchanged watched values return a new array after an unrelated write', () => {
    const root = tree(
      {
        type: 'object',
        properties: {
          a: { type: 'string', default: 'x' },
          z: { type: 'string' },
          w: { type: 'string', controls: { watch: ['../a'] } },
        },
      },
      {},
    );
    const w = root.find('/w');
    const first = w.watchValues;
    root.find('/z').setValue('q');
    expect(w.watchValues).toEqual(first);
    expect(w.watchValues).toBe(first);
  });
});
