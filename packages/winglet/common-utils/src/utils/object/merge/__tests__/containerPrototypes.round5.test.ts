import { expect, it } from 'vitest';

import { merge } from '../merge';

it('immutable and mutable copies of existing dictionaries preserve the same prototype', () => {
  for (const prototype of [Object.prototype, null]) for (const nested of [false, true]) {
    const first = Object.assign(Object.create(prototype), { a: 1 });
    const second = Object.assign(Object.create(prototype), { a: 1 });
    const target = nested ? { child: first } : first;
    const control = nested ? { child: second } : second;
    const patch = nested ? { child: { b: 2 } } : { b: 2 };
    const immutable = merge(target, patch, { immutable: true });
    const mutable = merge(control, patch);
    expect(Object.getPrototypeOf(nested ? immutable.child : immutable)).toBe(Object.getPrototypeOf(nested ? mutable.child : mutable));
    expect(first).toEqual(Object.assign(Object.create(prototype), { a: 1 }));
  }
});
