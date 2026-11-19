import { expect, it } from 'vitest';

import { clone } from '../clone';
import { cloneLite } from '../cloneLite';
import { removeUndefined } from '../removeUndefined';
import { shallowClone } from '../shallowClone';
import { sortObjectKeys } from '../sortObjectKeys';
import { transformKeys } from '../transformKeys';

it('copying a container keeps absent-member lookups equivalent at root and nested positions', () => {
  const copies = [clone, cloneLite, shallowClone, removeUndefined, (value: Record<string, unknown>) => sortObjectKeys(value, ['a', 'b'])];
  for (const prototype of [Object.prototype, null]) for (const copy of copies) for (const nested of [false, true]) {
    const input: Record<string, unknown> = Object.assign(Object.create(prototype), { b: 2, a: 1 });
    const result = nested ? copy({ child: input }).child : copy(input);
    expect(Object.getPrototypeOf(result), `${copy.name}/${nested}`).toBe(Object.getPrototypeOf(input));
    expect(Reflect.get(result, 'constructor')).toBe(Reflect.get(input, 'constructor'));
  }
});

it('key transformation deliberately creates a dictionary independently of input prototype', () => {
  const ordinary = { a: 1 };
  const dictionary = Object.assign(Object.create(null), ordinary);
  const first = transformKeys(ordinary, (_value, key) => key);
  const second = transformKeys(dictionary, (_value, key) => key);
  expect(Object.getPrototypeOf(first)).toBe(Object.getPrototypeOf(second));
  expect(Object.getPrototypeOf(first)).toBe(null);
});
