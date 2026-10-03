import { describe, expect, it } from 'vitest';

import { makeSchemaNodeTree } from '../../../__tests__/makeSchemaNodeTree';

const records = (runtime: object) => Reflect.get(runtime, 'typeMismatchRecords');

// filid:contract union-raw
describe('TEST-077 union mismatch lamp', () => {
  it('turns the lamp on when a gate narrows the effective list', () => {
    const { root } = makeSchemaNodeTree({ type: 'object', properties: {
      narrow: { type: 'boolean' }, a: { type: ['string', 'number'] },
    }, allOf: [{ controls: { active: './narrow === true' },
      properties: { a: { type: 'number' } } }] });
    root.setValue({ narrow: false, a: 'abc' });
    const a = root.find('/a');
    expect(a?.typeMismatch).toBe(false);
    expect(a?.schemaType).toEqual(['string', 'number']);
    expect(Object.isFrozen(a?.schemaType)).toBe(true);
    const fixedType = a?.schemaType;
    root.find('/narrow')?.setValue(true);
    expect(a?.typeMismatch).toBe(true);
    expect(a?.value).toBe('abc');
    expect(a?.schemaType).toBe(fixedType);
    expect(a?.jsonSchema).toMatchObject({ type: ['number'] });
    expect(a?.schemaType).toBe(fixedType);
  });

  it('TEST-077 turns the lamp off when a gate widens the effective list again', () => {
    const { root } = makeSchemaNodeTree({ type: 'object', properties: {
      narrow: { type: 'boolean' }, a: { type: ['string', 'number'] },
    }, allOf: [{ controls: { active: './narrow === true' },
      properties: { a: { type: 'number' } } }] });
    root.setValue({ narrow: true, a: 'abc' });
    const a = root.find('/a');
    expect(a?.typeMismatch).toBe(true);
    root.find('/narrow')?.setValue(false);
    expect(a?.typeMismatch).toBe(false);
    expect(root.typeMismatches).toEqual([]);
    expect(a?.raw).toBe('abc');
  });

  it('turns the lamp off when a later value matches the effective list', () => {
    const { root } = makeSchemaNodeTree({ type: ['number', 'boolean'] });
    root.setValue('invalid');
    expect(root.typeMismatch).toBe(true);
    root.setValue(1);
    expect(root.typeMismatch).toBe(false);
    expect(root.typeMismatches).toEqual([]);
  });

  it('memoizes typeMismatches until the next commit and filters by subtree', () => {
    const { root } = makeSchemaNodeTree({ type: 'object', properties: {
      group: { type: 'object', properties: {
        a: { type: ['number', 'boolean'] },
      } }, other: { type: ['number', 'boolean'] },
    } });
    root.setValue({ group: { a: 'invalid' }, other: 'invalid' });
    const first = root.typeMismatches;
    expect(first).toEqual(['/group/a', '/other']);
    expect(root.typeMismatches).toBe(first);
    expect(root.find('/group')?.typeMismatches).toEqual(['/group/a']);
    root.find('/other')?.setValue(1);
    expect(root.typeMismatches).toEqual(['/group/a']);
    expect(root.typeMismatches).not.toBe(first);
  });

  it('records TYPE_MISMATCH once while on and again after an off-to-on transition', () => {
    const { root, runtime } = makeSchemaNodeTree({ type: ['number', 'boolean'] });
    root.setValue('unconvertible');
    expect(root.typeMismatch).toBe(true);
    expect(records(runtime)).toEqual([expect.objectContaining({
      level: 'warning', code: expect.stringMatching(/TYPE_MISMATCH$/), path: '',
      expected: { schemaType: root.schemaType, nullable: false,
        effective: root.schemaType },
      reason: 'unconvertible', source: 'callerReplace',
    })]);
    root.setValue('still invalid');
    expect(root.typeMismatch).toBe(true);
    expect(records(runtime)).toEqual([]);
    root.setValue(1);
    expect(root.typeMismatch).toBe(false);
    expect(records(runtime)).toEqual([]);
    root.setValue('unconvertible');
    expect(records(runtime)).toHaveLength(1);
  });

  it('records ambiguous candidates for 0 in string-or-boolean', () => {
    const { root, runtime } = makeSchemaNodeTree({ type: ['string', 'boolean'] });
    root.setValue(0);
    expect(root.raw).toBe(0);
    expect(root.typeMismatch).toBe(true);
    expect(records(runtime)).toEqual([expect.objectContaining({
      code: expect.stringMatching(/TYPE_MISMATCH$/), reason: 'ambiguous',
      candidates: expect.any(Array),
    })]);
  });

  it('resends one TYPE_MISMATCH record on each reset load', () => {
    const { root, runtime } = makeSchemaNodeTree({ type: ['number', 'boolean'] },
      { snapshot: 'unconvertible' });
    root.resetSubtree();
    expect(records(runtime)).toHaveLength(1);
    root.resetSubtree();
    expect(records(runtime)).toHaveLength(1);
  });
});
