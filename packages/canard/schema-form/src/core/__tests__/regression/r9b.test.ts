import { describe, expect, it } from 'vitest';

import { makeSchemaNodeTree } from '../makeSchemaNodeTree';

const heldNode = (base: 'none' | 'unconditional' | 'default') => {
  const properties = { kind: { type: 'string' },
    ...(base === 'none' ? { x: { type: 'string' } } : {}),
    ...(base === 'default' ? { x: { type: 'string', default: 'B' } } : {}),
  };
  const { root } = makeSchemaNodeTree({ type: 'object', properties,
    ...(base === 'unconditional' ? { allOf: [{ properties: {
      x: { type: 'string', default: 'U' },
    } }] } : {}),
    if: { properties: { kind: { const: 'on' } }, required: ['kind'] },
    then: { properties: { x: { type: 'string', default: 'T' } } },
  });
  root.setValue({ kind: 'off' });
  return root;
};

// filid:contract factory-single-path
describe('round9b fragment retention regression', () => {
  it('r9b.mjs:18 keeps a shared node alive as another holder activates', () => {
    const { root } = makeSchemaNodeTree({ type: 'object', properties: {
      a: { type: 'number' }, b: { type: 'number' },
    }, allOf: [
      { controls: { active: './a === 1' }, properties: {
        x: { type: 'string', default: 'P' },
      } },
      { controls: { active: './b === 1' }, properties: {
        x: { type: 'string', default: 'Q' },
      } },
    ] });
    root.setValue({ a: 1 });
    const x = root.find('/x');
    expect(x?.raw).toBe('P');
    x?.setValue(undefined);
    root.find('/b')?.setValue(1);
    expect(root.find('/x')).toBe(x);
    expect(x?.raw).toBeUndefined();
  });

  it('r9b.mjs:35 a2 does not fill an already present base node', () => {
    const root = heldNode('none');
    expect(root.find('/x')?.raw).toBeUndefined();
    root.find('/x')?.setValue(undefined);
    root.find('/kind')?.setValue('on');
    expect(root.find('/x')?.raw).toBeUndefined();
  });

  it('r9b.mjs:35 a3 keeps the unconditional filled node through then activation', () => {
    const root = heldNode('unconditional');
    expect(root.find('/x')?.raw).toBe('U');
    root.find('/x')?.setValue(undefined);
    root.find('/kind')?.setValue('on');
    expect(root.find('/x')?.raw).toBeUndefined();
  });

  it('r9b.mjs:35 a4 keeps the base filled node through then activation', () => {
    const root = heldNode('default');
    expect(root.find('/x')?.raw).toBe('B');
    root.find('/x')?.setValue(undefined);
    root.find('/kind')?.setValue('on');
    expect(root.find('/x')?.raw).toBeUndefined();
  });

  it('r9b.mjs:50 gates birth by final shape and retains inactive raw', () => {
    const { root } = makeSchemaNodeTree({ type: 'object', properties: {
      show: { type: 'boolean' }, note: { type: 'string' },
      x: { type: 'string', default: 'D', controls: {
        active: '../show === true', default: 'E',
      } },
    } });
    root.setValue({ show: false });
    expect(root.find('/x')).toBeNull();
    root.find('/show')?.setValue(true);
    expect(root.find('/x')?.raw).toBe('E');
    root.find('/x')?.setValue(undefined);
    root.find('/note')?.setValue('unrelated');
    expect(root.find('/x')?.raw).toBeUndefined();
    root.find('/x')?.setValue('retained');
    root.find('/show')?.setValue(false);
    expect(root.inactiveValues).toContainEqual({ path: '/x', value: 'retained' });
    root.find('/show')?.setValue(true);
    expect(root.find('/x')?.raw).toBe('retained');
  });

  it('r9b.mjs:50 TEST-069 replaces historical raw-unit birth with shape-unit birth', () => {
    const { root } = makeSchemaNodeTree({ type: 'object', properties: {
      show: { type: 'boolean' }, x: { type: 'string', default: 'D',
        controls: { active: '../show === true', default: 'E' } },
    } });
    root.setValue({ show: false });
    expect(root.find('/x')).toBeNull();
    expect(root.outputValue).toEqual({ show: false });
    root.find('/show')?.setValue(true);
    expect(root.find('/x')?.raw).toBe('E');
  });

  it('r9b.mjs:73 rebirths a gated object descendant on the next lifetime', () => {
    const { root } = makeSchemaNodeTree({ type: 'object', properties: {
      show: { type: 'boolean' }, group: { type: 'object',
        controls: { active: '../show === true' },
        properties: { x: { type: 'string', default: 'D' } },
      },
    } });
    root.setValue({ show: false });
    expect(root.find('/group/x')).toBeNull();
    root.find('/show')?.setValue(true);
    expect(root.find('/group/x')?.raw).toBe('D');
    root.find('/group/x')?.setValue(undefined);
    root.find('/show')?.setValue(false);
    root.find('/show')?.setValue(true);
    expect(root.find('/group/x')?.raw).toBe('D');
  });

  for (const [name, keyword] of [
    ['r9b.mjs:86 pure oneOf branches omit incompatible const hints', 'oneOf'],
    ['r9b.mjs:86 pure anyOf branches omit incompatible const hints', 'anyOf'],
  ] as const) {
    it(name, () => {
      const branches = [
        { properties: { kind: { const: 'a' }, x: { type: 'string' } } },
        { properties: { kind: { const: 'b' }, y: { type: 'number' } } },
      ];
      const { root } = makeSchemaNodeTree({ type: 'object', [keyword]: branches });
      root.setValue({ kind: 'b', y: 1 });
      expect(root.find('/kind')?.raw).toBe('b');
      expect(root.find('/kind')?.jsonSchema).not.toHaveProperty('const');
      expect(root.find('/x')).not.toBeNull();
      expect(root.find('/y')).not.toBeNull();
      expect(branches[0].properties.kind.const).toBe('a');
    });
  }
});
