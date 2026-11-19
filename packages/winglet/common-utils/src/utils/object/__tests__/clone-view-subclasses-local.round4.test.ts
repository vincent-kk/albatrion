import { describe, it } from 'vitest';

import { checkBuiltinViewSubclass } from './helpers/checkBuiltinViewSubclass';

describe('round-4 local built-in view subclass equivalence', () => {
  for (const kind of ['Int8Array', 'Uint8Array', 'Uint8ClampedArray', 'Int16Array', 'Uint16Array', 'Int32Array', 'Uint32Array', 'Float16Array', 'Float32Array', 'Float64Array', 'BigInt64Array', 'BigUint64Array', 'DataView'])
    for (const partial of [false, true])
      it.skipIf(kind === 'Float16Array' && typeof Reflect.get(globalThis, kind) !== 'function')(`${kind} partial=${partial}; Float16Array requires host support`, () => {
        checkBuiltinViewSubclass(kind, partial, false);
      });
});
