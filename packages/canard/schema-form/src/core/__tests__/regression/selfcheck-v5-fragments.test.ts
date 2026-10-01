import { describe, expect, it } from 'vitest';

import { makeSchemaNodeTree } from '../makeSchemaNodeTree';

// filid:contract factory-single-path
describe('selfcheck-v5 nested fragment regression', () => {
  it('selfcheck-v5.mjs:119 resolves a nested fragment after a top-level fill', () => {
    const { root } = makeSchemaNodeTree({ type: 'object', properties: {
      p: { type: 'string' },
    }, allOf: [{ allOf: [{ controls: { active: './q !== undefined' },
      properties: { r: { type: 'string', default: 'R' } } }] }],
    if: { required: ['p'] },
    then: { properties: { q: { type: 'string', default: 'Q' } } } });
    root.setValue({});
    root.setValue({ p: 'P' });
    expect(root.outputValue).toEqual({ p: 'P', q: 'Q', r: 'R' });
  });

  const nestedThen = () => makeSchemaNodeTree({ type: 'object', properties: {
    p: { type: 'string' }, q: { type: 'string' },
  }, if: { required: ['p'] },
    then: { properties: { inner: { type: 'string', default: 'I' } },
    allOf: [{ controls: { active: './q !== undefined' }, properties: {
      deep: { type: 'string', default: 'DEEP' },
    } }],
  } }).root;

  it('selfcheck-v5.mjs:129 keeps a nested then off while its parent is off', () => {
    const root = nestedThen();
    root.setValue({});
    root.setValue({ q: 'Q' });
    expect(root.outputValue).toEqual({ q: 'Q' });
    expect(root.find('/deep')).toBeNull();
  });

  it('selfcheck-v5.mjs:131 activates both nested declarations with the parent', () => {
    const root = nestedThen();
    root.setValue({});
    root.setValue({ p: 'P', q: 'Q' });
    expect(root.outputValue).toEqual({ p: 'P', q: 'Q', inner: 'I', deep: 'DEEP' });
  });

  it('selfcheck-v5.mjs:193 reaches the negated-gate fixpoint after a competing birth', () => {
    const { root } = makeSchemaNodeTree({ type: 'object', properties: {
      seed: { type: 'boolean' },
    }, allOf: [
      { controls: { active: './x === undefined' }, properties: {
        a: { type: 'string', default: 'A' },
      } },
      { controls: { active: './seed !== undefined' }, properties: {
        x: { type: 'number', default: 1 },
      } },
    ] });
    root.setValue({ seed: true });
    expect(root.outputValue).toEqual({ seed: true, x: 1 });
    expect(root.find('/a')).toBeNull();
    expect(root.diagnostics.status).toBe('stable');
  });

  it('selfcheck-v5.mjs:240 leaves a value intact when a false schema declares nothing', () => {
    const { root } = makeSchemaNodeTree({ type: 'object', properties: {
      a: { type: 'string' },
    }, allOf: [
      { if: { required: ['a'] }, then: { properties: { a: false } } },
      { controls: { active: './a !== undefined' }, properties: {
        b: { type: 'number', default: 1 },
      } },
    ] });
    root.setValue({ a: 'kept' });
    expect(root.value).toEqual({ a: 'kept', b: 1 });
    expect(root.outputValue).toEqual({ a: 'kept', b: 1 });
  });

  it('selfcheck-v5.mjs:247 tests a presence guard on projected empty input', () => {
    const { root } = makeSchemaNodeTree({ type: 'object', properties: {
      a: { type: 'string' },
    }, if: { required: ['a'] }, then: { properties: {
      b: { type: 'string', default: 'B' },
    } } });
    root.setValue({ a: '' });
    expect(root.outputValue).toEqual({});
    expect(root.find('/b')).toBeNull();
  });

  it('selfcheck-v5.mjs:469 chains object, child, and dependent default births', () => {
    const { root } = makeSchemaNodeTree({ type: 'object', properties: {
      seed: { type: 'boolean' },
    }, allOf: [
      { controls: { active: './seed !== undefined' }, properties: {
        child: { type: 'object', default: {}, properties: {
          token: { type: 'number', default: 1 },
        } },
      } },
      { controls: { active: './child/token !== undefined' }, properties: {
        done: { type: 'boolean', default: true },
      } },
    ] });
    root.setValue({ seed: true });
    expect(root.outputValue).toEqual({ seed: true, child: { token: 1 }, done: true });
  });
});
