import { describe, expect, it } from 'vitest';
import { clone } from '../clone';
import { cloneLite } from '../cloneLite';
import { shallowClone } from '../shallowClone';
import { removeUndefined } from '../removeUndefined';

describe('round-4 prototype-free copy equivalence', () => {
  for (const copy of [shallowClone, removeUndefined])
    it(`${copy.name} keeps the prototype of deep copies`, () => {
      const input = Object.assign(Object.create(null), { apple: 1 });
      expect(Object.getPrototypeOf(copy(input))).toBe(Object.getPrototypeOf(clone(input)));
      expect(Reflect.get(copy(input), 'constructor')).toBe(Reflect.get(cloneLite(input), 'constructor'));
    });
});
