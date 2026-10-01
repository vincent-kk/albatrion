import { describe, expect, it } from 'vitest';

import { makeSchemaNodeTree } from '../makeSchemaNodeTree';

// filid:contract factory-single-path
describe('round9 derive edge cases', () => {
  for (const [name, missingTitle, initial] of [
    ['edge-cases.mjs:12 missing self-dependent unset settles',
      'edge-cases.mjs:13 missing self-dependent unset leaves x missing', {}],
    ['edge-cases.mjs:12 present self-dependent unset settles',
      'edge-cases.mjs:13 present self-dependent unset leaves x missing', { x: 'D' }],
  ] as const) {
    it(name, () => {
      const { root } = makeSchemaNodeTree({ type: 'object', properties: {
        x: { type: 'string', default: 'D', controls: { unsetValue: '../x === "D"' } },
      } });
      root.setValue(initial);
      expect(root.diagnostics.status).toBe('stable');
    });
    it(missingTitle, () => {
      const { root } = makeSchemaNodeTree({ type: 'object', properties: {
        x: { type: 'string', default: 'D', controls: { unsetValue: '../x === "D"' } },
      } });
      root.setValue(initial);
      expect(root.find('/x')?.raw).toBeUndefined();
    });
  }

  const clearedObject = () => {
    const { root } = makeSchemaNodeTree({ type: 'object', properties: {
      clear: { type: 'boolean' },
      group: { type: 'object', controls: { unsetValue: '../clear === true' },
        properties: { x: { type: 'string', default: 'D' } } },
    } });
    root.setValue({ clear: false, group: { x: 'loaded' } });
    root.find('/clear')?.setValue(true);
    return root;
  };

  it('edge-cases.mjs:31 cleared object descendants are not refilled', () => {
    expect(clearedObject().find('/group/x')?.raw).toBeUndefined();
  });
  it('edge-cases.mjs:32 cleared object emits no value', () => {
    expect(clearedObject().outputValue).toEqual({ clear: true });
  });
  it('edge-cases.mjs:40 automatic injectTo overwrite does not refill a child', () => {
    const { root } = makeSchemaNodeTree({ type: 'object', properties: {
      src: { type: 'string', controls: { injectTo: () => ({ '../group': {} }) } },
      group: { type: 'object', properties: { x: { type: 'string', default: 'D' } } },
    } });
    root.setValue({ group: { x: 'loaded' } });
    root.find('/src')?.setValue('edge');
    expect(root.find('/group/x')?.raw).toBeUndefined();
  });

  for (const [name, schema] of [
    ['edge-cases.mjs:57 SETTLE-004 derived first uses unsetValue priority',
      { derived: '../src * 2', unsetValue: 'true' }],
    ['edge-cases.mjs:57 SETTLE-004 unset first uses unsetValue priority',
      { unsetValue: 'true', derived: '../src * 2' }],
  ] as const) {
    it(name, () => {
      const { root } = makeSchemaNodeTree({ type: 'object', properties: {
        src: { type: 'number' },
        x: { type: 'number', default: 0, controls: schema },
      } });
      root.setValue({ src: 2, x: 9 });
      expect(root.find('/x')?.raw).toBeUndefined();
    });
  }

  const budgetTree = () => makeSchemaNodeTree({ type: 'object', properties: {
    a: { type: 'number', controls: {
      derived: '../b + 1', injectTo: (value: unknown) => ({ '../b': Number(value) + 1 }),
    } },
    b: { type: 'number' },
  } }).root;

  it('edge-cases.mjs:76 ERROR-070 throws on a derive budget breach', () => {
    const root = budgetTree();
    expect(() => root.setValue({ a: 0, b: 0 })).toThrow();
  });
  it('edge-cases.mjs:77 ERROR-070 keeps the caller base after the throw', () => {
    const root = budgetTree();
    try { root.setValue({ a: 0, b: 0 }); } catch { /* expected budget error */ }
    expect(root.outputValue).toEqual({ a: 0, b: 0 });
  });
  it('edge-cases.mjs:78 ERROR-070 leaves a committed tree after the throw', () => {
    const root = budgetTree();
    try { root.setValue({ a: 0, b: 0 }); } catch { /* expected budget error */ }
    expect(root.diagnostics).toMatchObject({ status: 'degraded', exceededBudget: 'derive' });
  });
});
