import type { FingerprintFactoryOptions, FingerprintGenerator } from './type';
import { createSafeWriter } from './utils/createSafeWriter';
import { writeFastFingerprint } from './utils/writeFastFingerprint';
import { writeSortedFingerprint } from './utils/writeSortedFingerprint';

/**
 * Selects a key algorithm and owns optional immutable-result caching and opaque identities.
 * @param options Fixed mode/prefix and cache policy; defaults to safe, empty prefix and no cache.
 * @returns A generator with per-call omit options; immutable input is a caller guarantee.
 * @throws TypeError for unknown mode/cache policies or errors from the selected writer.
 */
export function createFingerprintFactory(
  options: FingerprintFactoryOptions = {},
): FingerprintGenerator {
  const mode = options.mode ?? 'safe';
  if (mode !== 'fast' && mode !== 'sorted' && mode !== 'safe')
    throw new TypeError('Invalid fingerprint mode');
  if (
    options.cache !== undefined &&
    options.cache !== 'none' &&
    options.cache !== 'immutable'
  )
    throw new TypeError('Invalid fingerprint cache policy');
  const write =
    mode === 'fast'
      ? writeFastFingerprint
      : mode === 'sorted'
        ? writeSortedFingerprint
        : createSafeWriter(options.sort ?? true);
  const prefix = options.prefix ?? '';
  if (options.cache !== 'immutable')
    return (value, inputOptions) => {
      const key = write(value, inputOptions?.omit);
      return prefix ? prefix + key : key;
    };
  const plain = new WeakMap<object, string>();
  const excluded = new WeakMap<object, Map<string, string>>();
  return (value, inputOptions) => {
    const cacheable =
      value !== null &&
      (typeof value === 'object' || typeof value === 'function');
    const omit = inputOptions?.omit;
    if (!cacheable) {
      const key = write(value, omit);
      return prefix ? prefix + key : key;
    }
    let signature = '';
    if (omit) {
      const keys = [...omit].sort();
      for (let i = 0; i < keys.length; i++)
        if (i === 0 || keys[i] !== keys[i - 1])
          signature += keys[i].length + ':' + keys[i];
    }
    const cached = signature
      ? excluded.get(value)?.get(signature)
      : plain.get(value);
    if (cached !== undefined) return cached;
    const body = write(value, omit);
    const key = prefix ? prefix + body : body;
    if (!signature) plain.set(value, key);
    else {
      let entries = excluded.get(value);
      if (!entries) {
        entries = new Map();
        excluded.set(value, entries);
      }
      entries.set(signature, key);
    }
    return key;
  };
}
