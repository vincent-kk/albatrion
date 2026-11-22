import { expect, it } from 'vitest';

import { clone } from '../index';
import { cloneLite } from '../index';
import { removeUndefined } from '../index';
import { shallowClone } from '../index';
import { sortObjectKeys } from '../index';
import { transformKeys } from '../index';
import { transformValues } from '../index';

it('copying a container keeps absent-member lookups equivalent at root and nested positions', () => {
  const copies = [
    clone,
    cloneLite,
    shallowClone,
    removeUndefined,
    (value: Record<string, unknown>) => sortObjectKeys(value, ['a', 'b']),
  ];
  for (const prototype of [Object.prototype, null])
    for (const copy of copies)
      for (const nested of [false, true]) {
        const input: Record<string, unknown> = Object.assign(
          Object.create(prototype),
          { b: 2, a: 1 },
        );
        const result = nested ? copy({ child: input }).child : copy(input);
        if (typeof result !== 'object' || result === null)
          throw new Error('Expected a copied container');
        expect(Object.getPrototypeOf(result), `${copy.name}/${nested}`).toBe(
          Object.getPrototypeOf(input),
        );
        expect(Reflect.get(result, 'constructor')).toBe(
          Reflect.get(input, 'constructor'),
        );
      }
});

it('transformations deliberately create dictionaries at either application depth', () => {
  const transforms = [
    (value: Record<string, unknown>) =>
      transformKeys(value, (_value, key) => key),
    (value: Record<string, unknown>) =>
      transformValues(value, (value) => value),
  ];
  for (const transform of transforms)
    for (const nested of [false, true]) {
      const ordinary = { a: 1 };
      const dictionary = Object.assign(Object.create(null), ordinary);
      const first = nested
        ? { child: transform(ordinary) }.child
        : transform(ordinary);
      const second = nested
        ? { child: transform(dictionary) }.child
        : transform(dictionary);
      expect(Object.getPrototypeOf(first)).toBe(Object.getPrototypeOf(second));
      expect(Object.getPrototypeOf(first)).toBe(null);
    }
});
