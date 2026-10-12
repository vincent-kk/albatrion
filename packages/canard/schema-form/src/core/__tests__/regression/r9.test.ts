import { describe, expect, it } from 'vitest';

import * as nodeSurface from '../../SchemaNode';
import { makeSchemaNodeTree } from '../makeSchemaNodeTree';

const fillTree = () => {
  const { root } = makeSchemaNodeTree({ type: 'object', properties: {
    kind: { type: 'string' },
    base: { type: 'string', default: 'D', controls: { default: 'E' } },
    absent: { type: 'string' },
    empty: { type: ['string', 'number', 'boolean', 'null'], default: 'D' },
    nil: { type: ['string', 'number', 'boolean', 'null'], default: 'D' },
    zero: { type: ['string', 'number', 'boolean', 'null'], default: 'D' },
    no: { type: ['string', 'number', 'boolean', 'null'], default: 'D' },
  }, if: { properties: { kind: { const: 'on' } }, required: ['kind'] },
  then: { properties: { added: { type: 'string', default: 'A' } } },
  else: { properties: { fallback: { type: 'string', default: 'F' } } } });
  root.setValue({ kind: 'off', empty: '', nil: null, zero: 0, no: false });
  return root;
};

// filid:contract factory-single-path
describe('round9 P1 fill regression', () => {
  it('r9.mjs:26 has no selector state on the new root', () => {
    expect(Reflect.has(fillTree(), 'selection')).toBe(false);
  });
  it('r9.mjs:27 exposes no selector API on the node entry point', () => {
    expect(Reflect.getOwnPropertyDescriptor(nodeSurface, 'select')).toBeUndefined();
  });
  it('r9.mjs:28 lets controls.default beat ordinary default', () => {
    expect(fillTree().find('/base')?.raw).toBe('E');
  });
  it('r9.mjs:29 does not fill the inactive then declaration', () => {
    const root = fillTree();
    expect(root.find('/added')).toBeNull();
    expect(root.outputValue).not.toHaveProperty('added');
  });
  it('r9.mjs:30 leaves a source without default missing', () => {
    expect(fillTree().find('/absent')?.raw).toBeUndefined();
  });
  it('r9.mjs:31 preserves every present empty, null, zero, and false input', () => {
    const root = fillTree();
    expect(['empty', 'nil', 'zero', 'no'].map(key => root.find(`/${key}`)?.raw))
      .toEqual(['', null, 0, false]);
  });
  it('r9.mjs:34 fills the added declaration on activation', () => {
    const root = fillTree();
    root.find('/kind')?.setValue('on');
    expect(root.find('/added')?.raw).toBe('A');
  });
  it('r9.mjs:35 retains the deactivated fallback raw value', () => {
    const root = fillTree();
    root.find('/kind')?.setValue('on');
    expect(root.inactiveValues).toContainEqual({ path: '/fallback', value: 'F' });
  });
  it('r9.mjs:38 does not refill the active node on an unrelated write', () => {
    const root = fillTree();
    root.find('/kind')?.setValue('on');
    root.find('/added')?.setValue(undefined);
    root.find('/base')?.setValue('manual');
    expect(root.find('/added')?.raw).toBeUndefined();
  });
  it('r9.mjs:40 fills on a later activation lifetime', () => {
    const root = fillTree();
    root.find('/kind')?.setValue('on');
    root.find('/added')?.setValue(undefined);
    root.find('/kind')?.setValue('off');
    root.find('/kind')?.setValue('on');
    expect(root.find('/added')?.raw).toBe('A');
  });
});

const branchTree = (keyword: 'oneOf' | 'anyOf', withElse: boolean) => {
  const branches = ['a', 'b'].map(kind => ({
    if: { properties: { kind: { const: kind } }, required: ['kind'] },
    then: { properties: { [kind]: { type: 'string', default: kind.toUpperCase() } } },
    ...(withElse ? { else: false } : {}),
  }));
  const { root } = makeSchemaNodeTree({ type: 'object', properties: {
    kind: { type: 'string' },
  }, [keyword]: branches });
  root.setValue({ kind: 'a' });
  return { root, branches };
};

describe('round9 P3 branch regression', () => {
  for (const [name, keyword, withElse] of [
    ['r9.mjs:75 oneOf with else:false keeps the same form shape', 'oneOf', true],
    ['r9.mjs:75 oneOf without else:false keeps the same form shape', 'oneOf', false],
    ['r9.mjs:75 anyOf with else:false keeps the same form shape', 'anyOf', true],
    ['r9.mjs:75 anyOf without else:false keeps the same form shape', 'anyOf', false],
  ] as const) {
    it(name, () => {
      const { root } = branchTree(keyword, withElse);
      expect(root.outputValue).toEqual({ kind: 'a', a: 'A' });
    });
  }

  for (const [name, keyword, withElse] of [
    ['r9.mjs:77 oneOf with else:false preserves the authored branches', 'oneOf', true],
    ['r9.mjs:77 oneOf without else:false preserves the authored branches', 'oneOf', false],
    ['r9.mjs:77 anyOf with else:false preserves the authored branches', 'anyOf', true],
    ['r9.mjs:77 anyOf without else:false preserves the authored branches', 'anyOf', false],
  ] as const) {
    it(name, () => {
      const { branches } = branchTree(keyword, withElse);
      expect(branches.every(branch =>
        Reflect.getOwnPropertyDescriptor(branch, 'else') !== undefined)).toBe(withElse);
    });
  }

  for (const [name, keyword] of [
    ['r9.mjs:87 pure oneOf branches both contribute defaults', 'oneOf'],
    ['r9.mjs:87 pure anyOf branches both contribute defaults', 'anyOf'],
  ] as const) {
    it(name, () => {
      const { root } = makeSchemaNodeTree({ type: 'object', [keyword]: [
        { properties: { a: { const: 'a', default: 'A' } } },
        { properties: { b: { enum: ['b'], default: 'B' } } },
      ] });
      root.setValue({});
      expect(root.outputValue).toEqual({ a: 'A', b: 'B' });
    });
  }
});
