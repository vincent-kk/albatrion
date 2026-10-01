import { describe, expect, it } from 'vitest';

import { makeSchemaNodeTree } from '../makeSchemaNodeTree';

const derivedTree = (fragments = false) => makeSchemaNodeTree({ type: 'object', properties: {
  a: { type: 'number' },
  d: { type: 'string', controls: {
    derived: '../a === undefined ? undefined : "f(" + ../a + ")"',
  } },
}, ...(fragments ? { allOf: [
  { controls: { active: './d === undefined' },
    properties: { y: { type: 'string', default: 'Y' } } },
  { controls: { active: './d === "f(1)"' },
    properties: { x: { type: 'string', default: 'X' } } },
] } : {}) }).root;

const injectionTree = () => makeSchemaNodeTree({ type: 'object', properties: {
  src: { type: 'string', controls: {
    injectTo: (value: unknown) => ({ '../tgt': `f(${value})` }),
  } }, tgt: { type: 'string' },
} }, { snapshot: { src: 'x', tgt: 'custom' } }).root;

const x16Tree = (withDefault: boolean) => makeSchemaNodeTree({ type: 'object', properties: {
  t: { type: 'string' },
}, allOf: [{ controls: { active: './t === undefined' }, properties: {
  c: { type: 'string', ...(withDefault ? { default: 'C' } : {}), controls: {
    injectTo: (value: unknown) => ({ '../t': `from-${value}` }),
  } },
} }] }).root;

// filid:contract factory-single-path
describe('round8 derive and injection observations', () => {
  it('r8-port.mjs:53 P1 i derives on a changed source after a manual target edit', () => {
    const root = derivedTree();
    root.setValue({ a: 1 });
    expect(root.outputValue).toEqual({ a: 1, d: 'f(1)' });
    root.find('/d')?.setValue('mine');
    expect(root.find('/d')?.raw).toBe('mine');
    root.find('/a')?.setValue(2);
    expect(root.outputValue).toEqual({ a: 2, d: 'f(2)' });
  });
  it('r8-port.mjs:61 P1 ii same-value source write leaves a manual target', () => {
    const root = derivedTree();
    root.setValue({ a: 1 });
    root.find('/d')?.setValue('mine');
    root.find('/a')?.setValue(1);
    expect(root.find('/d')?.raw).toBe('mine');
  });
  it('r8-port.mjs:86 P1 iii sequential source then target leaves manual value', () => {
    const root = derivedTree();
    root.setValue({ a: 1 });
    root.find('/a')?.setValue(2);
    root.find('/d')?.setValue('mine');
    expect(root.find('/d')?.raw).toBe('mine');
  });
  it('r8-port.mjs:86 P1 iii sequential target then source rederives', () => {
    const root = derivedTree();
    root.setValue({ a: 1 });
    root.find('/d')?.setValue('mine');
    root.find('/a')?.setValue(2);
    expect(root.find('/d')?.raw).toBe('f(2)');
  });
  for (const [name, input] of [
    ['r8-port.mjs:95 P1 iv load_a1 settles to the final fragment', { a: 1 }],
    ['r8-port.mjs:95 P1 iv load_a1_dMine settles to the final fragment',
      { a: 1, d: 'mine' }],
  ] as const) {
    it(name, () => {
      const root = derivedTree(true);
      root.setValue(input);
      expect(root.outputValue).toEqual({ a: 1, d: 'f(1)', x: 'X' });
      expect(root.find('/y')).toBeNull();
      expect(root.diagnostics.status).toBe('stable');
    });
  }
  it('r8-port.mjs:105 P1 fn preserves distinct final histories', () => {
    const first = derivedTree();
    first.setValue({ a: 1 });
    first.find('/d')?.setValue('mine');
    first.find('/a')?.setValue(2);
    const second = derivedTree();
    second.setValue({ a: 1 });
    second.find('/a')?.setValue(2);
    second.find('/d')?.setValue('mine');
    expect([first.find('/d')?.raw, second.find('/d')?.raw]).toEqual(['f(2)', 'mine']);
  });
  it('r8-port.mjs:114 WRITE-090 P1 idem root replacement preserves output', () => {
    const root = derivedTree();
    root.setValue({ a: 1 });
    root.find('/d')?.setValue('mine');
    root.setValue(root.outputValue);
    expect(root.outputValue).toEqual({ a: 1, d: 'mine' });
  });

  it('r8-port.mjs:147 P2 X3L load and reset fire injection', () => {
    const root = injectionTree();
    root.setValue({ src: 'x', tgt: 'custom' });
    expect(root.outputValue).toEqual({ src: 'x', tgt: 'f(x)' });
    root.find('/tgt')?.setValue('mine');
    root.find('/src')?.setValue('z');
    expect(root.outputValue).toEqual({ src: 'z', tgt: 'f(z)' });
    root.resetSubtree();
    expect(root.outputValue).toEqual({ src: 'x', tgt: 'f(x)' });
  });
  for (const [title, replacement, expected] of [
    ['r8-port.mjs:152 P2 replace new source with target fires injection',
      { src: 'w', tgt: 'given' }, 'f(w)'],
    ['r8-port.mjs:153 WRITE-090 P2 same source with target has no edge',
      { src: 'x', tgt: 'given' }, 'given'],
    ['r8-port.mjs:154 P2 replace new source without target fires injection',
      { src: 'w' }, 'f(w)'],
    ['r8-port.mjs:155 WRITE-090 P2 same source without target has no edge',
      { src: 'x' }, undefined],
  ] as const) {
    it(title, () => {
      const root = injectionTree();
      root.setValue({ src: 'x', tgt: 'custom' });
      root.find('/tgt')?.setValue('mine');
      root.setValue(replacement);
      expect(root.find('/tgt')?.raw).toBe(expected);
    });
  }
  for (const [title, edit] of [
    ['r8-port.mjs:169 P2 idem fresh load has observed idempotence',
      (root: ReturnType<typeof injectionTree>) => root],
    ['r8-port.mjs:170 WRITE-090 P2 edited target stays idempotent',
      (root: ReturnType<typeof injectionTree>) =>
      root.find('/tgt')?.setValue('mine')],
    ['r8-port.mjs:171 WRITE-090 P2 cleared target stays idempotent',
      (root: ReturnType<typeof injectionTree>) =>
      root.find('/tgt')?.setValue(undefined)],
    ['r8-port.mjs:172 WRITE-090 P2 edited source then target stays idempotent',
      (root: ReturnType<typeof injectionTree>) => {
      root.find('/src')?.setValue('z'); root.find('/tgt')?.setValue('mine');
    }],
  ] as const) {
    it(title, () => {
      const root = injectionTree();
      root.setValue({ src: 'x', tgt: 'custom' });
      edit(root);
      const before = root.outputValue;
      root.setValue(before);
      const after = root.outputValue;
      expect(after).toEqual(before);
      root.setValue(after);
      expect(root.outputValue).toEqual(after);
    });
  }
  it('r8-port.mjs:200 WRITE-090 P2 idemDefault stays empty on replacement', () => {
    const { root } = makeSchemaNodeTree({ type: 'object', properties: {
      x: { type: 'string', default: 'D' },
    } });
    root.setValue({});
    root.find('/x')?.setValue(undefined);
    expect(root.outputValue).toEqual({});
    root.setValue(root.outputValue ?? {});
    expect(root.outputValue).toEqual({});
  });

  it('r8-port.mjs:361 FRAGMENT-050 29C-01 P4 X16 keeps the birth-edge write without c', () => {
    const root = x16Tree(true);
    root.setValue({});
    expect(root.outputValue).toEqual({ t: 'from-undefined' });
    expect(root.find('/c')).toBeNull();
    expect(root.diagnostics.status).toBe('stable');
  });
  it('r8-port.mjs:362 FRAGMENT-050 29C-01 P4 X16_noDefault keeps the birth-edge write', () => {
    const root = x16Tree(false);
    root.setValue({});
    expect(root.outputValue).toEqual({ t: 'from-undefined' });
    expect(root.find('/c')).toBeNull();
    expect(root.diagnostics.status).toBe('stable');
  });
});
