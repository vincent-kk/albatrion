// filid:contract fingerprint-options
import { expect, it } from 'vitest';

import {
  createSafeFingerprint as createFingerprint,
  createFingerprintFactory,
} from '../index';

it('uses empty prefixes by default and captures a factory prefix once', () => {
  const value = { x: 1 };
  expect(createFingerprint(value)).toBe(
    createFingerprint(value, { prefix: '' }),
  );
  expect(createFingerprint(value, { prefix: 'app:' })).toBe(
    'app:' + createFingerprint(value),
  );
  const options = { prefix: 'app:' };
  const key = createFingerprintFactory(options);
  options.prefix = 'changed:';
  expect(key(value)).toBe('app:' + createFingerprint(value));
});

it('recomputes mutable input and caches only with immutable opt-in', () => {
  const mutable = createFingerprintFactory();
  const immutable = createFingerprintFactory({ cache: 'immutable' });
  const value = { nested: { x: 1 } };
  const before = mutable(value),
    cached = immutable(value);
  value.nested.x++;
  expect(mutable(value)).not.toBe(before);
  expect(immutable(value)).toBe(cached);
  expect(() => createFingerprintFactory({ cache: 'invalid' as any })).toThrow(
    TypeError,
  );
});

it('uses exact omit sets and observes changes to reused collections', () => {
  const key = createFingerprintFactory({ cache: 'immutable' });
  const value = { a: 1, b: 2, 'a,b': 3 };
  expect(key(value, { omit: ['a,b'] })).not.toBe(
    key(value, { omit: ['a', 'b'] }),
  );
  expect(key(value, { omit: ['b', 'a', 'a'] })).toBe(
    key(value, { omit: ['a', 'b'] }),
  );
  const omit = ['a'];
  const before = key(value, { omit });
  omit.push('b');
  expect(key(value, { omit })).not.toBe(before);
  const set = new Set(['a']);
  expect(key(value, { omit: set })).toBe(key(value, { omit: ['a'] }));
  set.add('b');
  expect(key(value, { omit: set })).toBe(key(value, { omit: ['b', 'a'] }));
});

it('assigns opaque identity to closures, symbols and custom instances', () => {
  const key = createFingerprintFactory();
  const first = () => 1,
    second = () => 1;
  expect(key(first)).toBe(key(first));
  expect(key(first)).not.toBe(key(second));
  expect(key(Symbol('x'))).not.toBe(key(Symbol('x')));
  const instance = new (class {})();
  expect(key(instance)).toBe(key(instance));
  expect(key(instance)).not.toBe(key(new (class {})()));
});

it('retries from clean traversal state after an exception', () => {
  const key = createFingerprintFactory({ cache: 'immutable' });
  const value: any = {
    nested: { x: 1 },
    get bad() {
      throw new Error('expected');
    },
  };
  expect(() => key(value)).toThrow('expected');
  delete value.bad;
  value.nested.x = 2;
  expect(key(value)).toBe(key({ nested: { x: 2 } }));
});
