import { expect, it } from 'vitest';
import { applyPatch, compare, difference, mergePatch, getValue, type Patch } from '@/json';

/** Construct a nested prototype-free JSON dictionary with escaped and reserved names. */
function dictionary(): any {
  const result = Object.create(null);
  for (const key of ['', '__proto__', 'constructor', 'a/b', '~']) result[key] = Object.assign(Object.create(null), { value: key });
  return result;
}

it('null dictionaries keep addressed source and target containers through cross-branch move and copy', () => {
  for (const op of ['move', 'copy'] as const) {
    const input = dictionary();
    const patch: Patch[] = [{ op, from: '/__proto__', path: '/constructor/moved' }, { op: 'replace', path: '/constructor/moved/value', value: 'changed' }];
    const result = applyPatch(input, patch);
    expect(Object.getPrototypeOf(result)).toBe(null);
    expect(Object.getPrototypeOf(result.constructor)).toBe(null);
    expect(Object.getPrototypeOf(result.constructor.moved)).toBe(null);
    expect(input.__proto__.value).toBe('__proto__');
    expect(getValue(result, '/constructor/moved/value')).toBe('changed');
  }
});

it('patch generators preserve null dictionaries for reserved-key additions and removals', () => {
  const source = dictionary();
  const target = dictionary();
  delete target['']; target.__proto__.value = 'changed'; target['x/y'] = { value: 2 };
  expect(applyPatch(source, compare(source, target))).toEqual(target);
  expect(mergePatch(source, difference(source, target))).toEqual(target);
  expect(Object.getPrototypeOf(mergePatch(source, difference(source, target)))).toBe(null);
});
