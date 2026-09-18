import {
  parseGraph,
  stringifyGraph,
} from '../../src/utils/object';
import {
  createFingerprintFactory,
  createSafeFingerprint,
} from '../../src/utils/object/fingerprint';
import { encodeGraph } from '../../src/utils/object/serialization/utils/encodeGraph';
import { createFixture } from './fixtures';

/** One measured operation with setup kept outside the timing region. */
export interface MeasurementCase {
  name: string;
  contract: string;
  prepare: () => () => unknown;
}

/** Key cases use the public safe API; graph normalization remains a distinct contract. */
export function createCases(fixture: string): MeasurementCase[] {
  const value = createFixture(fixture);
  const text = stringifyGraph(value);
  const key = createFingerprintFactory();
  const immutable = createFingerprintFactory({ cache: 'immutable' });
  const prefixed = createFingerprintFactory({ prefix: 'app:' });
  immutable(value);
  const operations: MeasurementCase[] = [];
  const add = (name: string, contract: string, run: () => unknown) =>
    operations.push({ name, contract, prepare: () => run });
  add('stringifyGraph', 'graph-v1', () => stringifyGraph(value));
  add('parseGraph', 'graph-v1', () => parseGraph(text));
  add('graph-roundtrip', 'graph-v1', () => parseGraph(stringifyGraph(value)));
  add('createSafeFingerprint', 'safe-sorted-opaque-identity-key', () =>
    createSafeFingerprint(value),
  );
  add(
    'native-normalized-key',
    'sorted-reference-key-normalization-baseline',
    () => JSON.stringify(encodeGraph(value, { sorted: true })),
  );
  add('factory-create', 'identity-scope', () => createFingerprintFactory());
  add('factory-mutable', 'safe-sorted-opaque-identity-key', () => key(value));
  add('fingerprint-prefix', 'prefixed-safe-key', () =>
    createSafeFingerprint(value, { prefix: 'app:' }),
  );
  add('factory-prefix', 'prefixed-safe-key', () => prefixed(value));
  const mutation = { counter: 0, value };
  add('factory-mutating', 'safe-sorted-opaque-identity-key', () => {
    mutation.counter++;
    return key(mutation);
  });
  add('factory-immutable-hit', 'immutable-cache', () => immutable(value));
  operations.push({
    name: 'factory-first',
    contract: 'safe-sorted-opaque-identity-key',
    prepare: () => {
      const first = createFingerprintFactory();
      return () => first(value);
    },
  });
  for (const [label, omit] of [
    ['small', ['secret', 'name']],
    ['large', Array.from({ length: 128 }, (_, i) => `field${i}`)],
  ] as const) {
    add(`graph-omit-${label}`, 'graph-omit', () =>
      stringifyGraph(value, { omit }),
    );
    add(`key-omit-${label}`, 'safe-key-omit', () =>
      createSafeFingerprint(value, { omit }),
    );
  }
  const omit = ['secret'];
  const largeOmit = Array.from({ length: 128 }, (_, i) => `field${i}`);
  const omitIndex = new Set(largeOmit);
  add('omit-index-build', 'omit-index-construction', () => new Set(largeOmit));
  add('graph-omit-reused-set', 'graph-omit', () =>
    stringifyGraph(value, { omit: omitIndex }),
  );
  add('key-omit-reused-set', 'safe-key-omit', () =>
    createSafeFingerprint(value, { omit: omitIndex }),
  );
  add('factory-omit-changing', 'immutable-cache-options', () => {
    omit[0] = omit[0] === 'secret' ? 'name' : 'secret';
    return immutable(value, { omit });
  });
  if (!['cycle', 'extended'].includes(fixture)) {
    const json = JSON.stringify(value);
    add('JSON.stringify', 'native-json-lossy-for-extended-values', () =>
      JSON.stringify(value),
    );
    add('JSON.parse', 'native-json', () => JSON.parse(json));
    add('native-omit', 'native-recursive-replacer', () =>
      JSON.stringify(value, (key, item) =>
        key === 'secret' ? undefined : item,
      ),
    );
  }
  return operations;
}
