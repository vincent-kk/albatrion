import { runInNewContext } from 'node:vm';
import { expect } from 'vitest';
import { clone } from '../../clone';

/** Compare subclass identity, slots and documented own-field omission across realms. */
export function checkBuiltinSubclass(kind: string, ownField: boolean, override: boolean, foreign: boolean) {
  const methods: Record<string, string> = {
    Map: "get(key) { return super.get(key) ?? 'absent'; }",
    Set: 'has(key) { return !super.has(key); }',
    Date: 'getTime() { return super.getTime() + 7; }',
    RegExp: 'test(text) { return !super.test(text); }',
    Array: "slice(...args) { return ['override', ...super.slice(...args)]; }",
  };
  const expressions: Record<string, string> = {
    Map: "new Sub([['x', 1]])", Set: "new Sub(['x'])", Date: 'new Sub(42)',
    RegExp: "new Sub('a+', 'g')", Array: 'new Sub(1, 2)',
  };
  const reads: Record<string, string> = {
    Map: "value.get('x')", Set: "value.has('x')", Date: 'value.getTime()',
    RegExp: "value.test('aa')", Array: "Array.from(value.slice())",
  };
  const result = runInNewContext(`
    let constructions = 0;
    class Sub extends ${kind} {
      constructor(...args) { super(...args); constructions++; }
      ${override ? methods[kind] : ''}
    }
    const value = ${expressions[kind]};
    if (${ownField}) value.field = { x: 1 };
    ({ value, count: () => constructions, read: value => ${reads[kind]} });
  `, foreign ? {} : { Map, Set, Date, RegExp, Array });
  const copy = clone(result.value);
  expect(result.count()).toBe(1);
  expect(Object.getPrototypeOf(copy) === Object.getPrototypeOf(result.value)).toBe(true);
  expect(result.read(copy)).toEqual(result.read(result.value));
  expect(copy.field).toBeUndefined();
}
