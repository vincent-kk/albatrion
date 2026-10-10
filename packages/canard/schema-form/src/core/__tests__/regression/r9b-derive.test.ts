import { describe, expect, it } from 'vitest';

import { makeSchemaNodeTree } from '../makeSchemaNodeTree';

const finalShapeTree = (seedDefault: boolean) => makeSchemaNodeTree({
  type: 'object', properties: {
    seed: { type: 'number', ...(seedDefault ? { default: 1 } : {}) },
    on: { type: 'number', controls: {
      derived: seedDefault ? '../seed === 1 ? 0 : 1' : '0',
    } },
  }, allOf: [{ controls: { active: './on === 1' },
    properties: { x: { type: 'string', default: 'P' } },
  }],
}).root;

// filid:contract factory-single-path
describe('round9b final derive shape', () => {
  it('r9b.mjs:102 retracts a fragment after its gate is derived away', () => {
    const root = finalShapeTree(false);
    root.setValue({ seed: 1, on: 1 });
    expect(root.find('/x')).toBeNull();
    expect(root.outputValue).toEqual({ seed: 1, on: 0 });
    expect(root.diagnostics.status).toBe('stable');
  });

  it('r9b.mjs:115 retracts a fragment after a filled dependency derives its gate', () => {
    const root = finalShapeTree(true);
    root.setValue({ on: 1 });
    expect(root.find('/seed')?.raw).toBe(1);
    expect(root.find('/x')).toBeNull();
    expect(root.outputValue).toEqual({ seed: 1, on: 0 });
  });

  it('r9b.mjs:127 keeps caller raw even when final shape excludes it', () => {
    const root = finalShapeTree(false);
    root.setValue({ seed: 1, on: 1, x: 'caller' });
    expect(root.inactiveValues).toContainEqual({ path: '/x', value: 'caller' });
    expect(root.find('/x')).toBeNull();
    expect(root.outputValue).toEqual({ seed: 1, on: 0 });
  });

  it('r9b.mjs:137 FRAGMENT-050 retracts only intermediate c before commit', () => {
    const { root } = makeSchemaNodeTree({ type: 'object', properties: {
      t: { type: 'string' },
    }, allOf: [{ controls: { active: './t === undefined' }, properties: {
      c: { type: 'string', default: 'C', controls: {
        injectTo: (value: unknown) => ({
          '../t': value === undefined ? undefined : `from-${value}`,
        }),
      } },
    } }] });
    root.setValue({});
    expect(root.outputValue).toEqual({ t: 'from-C' });
    expect(root.find('/c')).toBeNull();
    expect(root.diagnostics.status).toBe('stable');
  });
});
