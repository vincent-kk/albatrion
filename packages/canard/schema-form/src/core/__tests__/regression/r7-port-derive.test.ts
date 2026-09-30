import { describe, expect, it } from 'vitest';

import { makeSchemaNodeTree } from '../makeSchemaNodeTree';

const e3Tree = () => makeSchemaNodeTree({ type: 'object', properties: {
  src: { type: 'string', controls: {
    injectTo: (value: unknown) => ({ '../tgt': `f(${value})` }),
  } }, tgt: { type: 'string' },
} }, { snapshot: { src: 'x', tgt: 'custom' } }).root;

const sequentialEdges = () => {
  const root = e3Tree();
  root.setValue({ src: 'x', tgt: 'custom' });
  root.find('/tgt')?.setValue('mine');
  root.find('/src')?.setValue('y');
  root.find('/src')?.setValue('x');
  return root;
};

// filid:contract factory-single-path
describe('round7 derive port', () => {
  it('r7-port.mjs:124 E3 sequential source edges end at f(x)', () => {
    expect(sequentialEdges().outputValue).toEqual({ src: 'x', tgt: 'f(x)' });
  });
  it('r7-port.mjs:340 X3c commit-reference sequential edges end at f(x)', () => {
    expect(sequentialEdges().find('/tgt')?.raw).toBe('f(x)');
  });
  it('r7-port.mjs:351 X3L fires injectTo at mount and reset', () => {
    const root = e3Tree();
    root.setValue({ src: 'x', tgt: 'custom' });
    expect(root.find('/tgt')?.raw).toBe('f(x)');
    root.find('/tgt')?.setValue('mine');
    root.find('/src')?.setValue('z');
    expect(root.find('/tgt')?.raw).toBe('f(z)');
    root.resetSubtree();
    expect(root.outputValue).toEqual({ src: 'x', tgt: 'f(x)' });
  });
  it('r7-port.mjs:427 X15 discards an intermediate fragment injection', () => {
    const { root } = makeSchemaNodeTree({ type: 'object', properties: {
      kind: { type: 'string', default: 'b' },
      y: { type: 'string' },
    }, allOf: [{ controls: { active: './kind === undefined || ./kind === "a"' },
      properties: { x: { type: 'string', default: 'X', controls: {
        injectTo: (value: unknown) => ({ '../y': value === undefined
          ? undefined : `d(${value})` }),
      } } },
    }] });
    root.setValue({});
    expect(root.outputValue).toEqual({ kind: 'b' });
    expect(root.find('/x')).toBeNull();
    expect(root.find('/y')?.raw).toBeUndefined();
    expect(root.diagnostics.status).toBe('stable');
  });
  it('r7-port.mjs:444 FRAGMENT-050 29C-01 X16 keeps the birth-edge write after retracting c', () => {
    const { root } = makeSchemaNodeTree({ type: 'object', properties: {
      t: { type: 'string' },
    }, allOf: [{ controls: { active: './t === undefined' }, properties: {
      c: { type: 'string', default: 'C', controls: {
        injectTo: (value: unknown) => ({ '../t': `from-${value}` }),
      } },
    } }] });
    root.setValue({});
    expect(root.outputValue).toEqual({ t: 'from-undefined' });
    expect(root.find('/c')).toBeNull();
    expect(root.diagnostics.status).toBe('stable');
  });
  it('r7-port.mjs:463 ERROR-070 XA4 commits original B after changed-source feedback', () => {
    const { root } = makeSchemaNodeTree({ type: 'object', properties: {
      n: { type: 'number', controls: {
        injectTo: (value: unknown) => ({ '../n': Math.min(30, Number(value) + 1) }),
      } },
    } });
    (Reflect.get(root, 'runtime') as { disableAutomaticWrites: boolean })
      .disableAutomaticWrites = true;
    root.setValue({ n: 0 });
    (Reflect.get(root, 'runtime') as { disableAutomaticWrites: boolean })
      .disableAutomaticWrites = false;
    root.find('/n')?.setValue(0);
    expect(root.outputValue).toEqual({ n: 0 });
    expect(() => root.find('/n')?.setValue(1)).toThrow();
    expect(root.outputValue).toEqual({ n: 1 });
    expect(root.diagnostics).toMatchObject({ status: 'degraded',
      exceededBudget: 'derive', iterations: 25 });
  });
});
