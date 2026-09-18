// filid:contract fingerprint-values
import { expect, it } from 'vitest';

import { createSafeFingerprint as createFingerprint } from '../index';

it('provides the independent public generator', () => {
  expect(createFingerprint).toBeTypeOf('function');
});

it('sorts keys and distinguishes scalar types and property boundaries', () => {
  expect(createFingerprint({ b: 2, a: 1 })).toBe(
    createFingerprint({ a: 1, b: 2 }),
  );
  expect(createFingerprint(1)).not.toBe(createFingerprint('1'));
  expect(createFingerprint(1n)).not.toBe(createFingerprint(1));
  expect(createFingerprint(-0)).not.toBe(createFingerprint(0));
  expect(createFingerprint({ a: 1, b: 2 })).not.toBe(
    createFingerprint({ 'b:2|a': 1 }),
  );
  expect(createFingerprint([])).not.toBe(createFingerprint({}));
});

it('terminates cycles and uses structural keys for shared subtrees', () => {
  const first: any = {};
  first.self = first;
  const second: any = {};
  second.self = second;
  expect(createFingerprint(first)).toBe(createFingerprint(second));
  expect(createFingerprint(first)).toBe(createFingerprint(first));
  const shared = { x: 1 };
  expect(createFingerprint([shared, shared])).toBe(
    createFingerprint([{ x: 1 }, { x: 1 }]),
  );
});

it('applies omit recursively before reading and observes mutations', () => {
  let calls = 0;
  const nested = {
    x: 1,
    get secret() {
      calls++;
      return 7;
    },
  };
  expect(createFingerprint({ nested }, { omit: ['secret'] })).toBe(
    createFingerprint({ nested: { x: 1 } }),
  );
  expect(calls).toBe(0);
  createFingerprint(nested);
  expect(calls).toBe(1);
  const before = createFingerprint(nested, { omit: ['secret'] });
  nested.x++;
  expect(createFingerprint(nested, { omit: ['secret'] })).not.toBe(before);
});

it('preserves scalar intrinsic values without a graph format', () => {
  expect(createFingerprint(new Date(0))).toBe(createFingerprint(new Date(0)));
  expect(createFingerprint(new Date(NaN))).not.toBe(createFingerprint(null));
  expect(createFingerprint(/x/g)).not.toBe(createFingerprint(/x/i));
  expect(createFingerprint(undefined)).not.toBe(createFingerprint('undefined'));
  expect(createFingerprint(NaN)).not.toBe(createFingerprint('NaN'));
});

it('handles reserved and empty property names without writing the input', () => {
  const value = JSON.parse('{"__proto__":1,"":2,"constructor":3}');
  expect(createFingerprint(value)).not.toBe(createFingerprint({}));
  expect(Object.getPrototypeOf(value)).toBe(Object.prototype);
  expect(value.__proto__).toBe(1);
});
