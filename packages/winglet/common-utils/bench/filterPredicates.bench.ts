import { bench, describe } from 'vitest';

import { isArrayLike } from '@/common-utils/utils/filter/isArrayLike';
import { isEmpty } from '@/common-utils/utils/filter/isEmpty';
import { isPlainObject } from '@/common-utils/utils/filter/isPlainObject';

/**
 * Type guards called once per field in the schema-form and json traversals, so their
 * per-call cost is multiplied by document size rather than amortised.
 */

class Instance {
  constructor(public value = 1) {}
}

const plain = { a: 1, b: 2 };
const instance = new Instance();
const nullProto = Object.assign(Object.create(null), { a: 1 });
const map = new Map([['a', 1]]);
const list = [1, 2, 3];

describe('isPlainObject — by input kind', () => {
  bench('plain object', () => isPlainObject(plain));
  bench('class instance', () => isPlainObject(instance));
  bench('null-prototype object', () => isPlainObject(nullProto));
  bench('Map', () => isPlainObject(map));
});

describe('isEmpty — by input kind', () => {
  bench('populated plain object', () => isEmpty(plain));
  bench('empty plain object', () => isEmpty({}));
  bench('populated Map', () => isEmpty(map));
});

describe('isArrayLike — by input kind', () => {
  bench('array', () => isArrayLike(list));
  bench('plain object', () => isArrayLike(plain));
});
