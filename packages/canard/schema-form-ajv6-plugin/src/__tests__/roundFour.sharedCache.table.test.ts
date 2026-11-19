import Ajv from 'ajv';
import { expect, it } from 'vitest';
import { createValidator } from '../index';
it.each([false, true])('keeps custom application caches independent with initial pointers %s', pointers => {
  const entries = new Map<unknown, unknown>();
  const cache = { get: (key: unknown) => entries.get(key), put: (key: unknown, value: unknown) => { entries.set(key, value); }, del: (key: unknown) => { entries.delete(key); }, clear: () => entries.clear() };
  const instance = new Ajv({ allErrors: true, format: false, jsonPointers: pointers, cache });
  const schema = { type: 'object', additionalProperties: { type: 'string', minLength: 2 } } as const;
  const native = instance.compile(schema);
  const original = native({ 'it\'s/a~b': 'x' });
  const nativePath = native.errors?.[0].dataPath;
  const validate = createValidator(instance).compile(schema);
  return validate({ 'it\'s/a~b': 'x' }).then(issues => {
    expect(issues?.[0].dataPath).toBe('/it\'s~1a~0b');
    expect(instance.compile(schema)).toBe(native);
    expect(instance._opts.cache).toBe(cache);
    expect(native({ 'it\'s/a~b': 'x' })).toBe(original);
    expect(native.errors?.[0].dataPath).toBe(nativePath);
  });
});
