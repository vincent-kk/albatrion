/**
 * Ajv instances for the redteam3 scripts.
 * `ajv` is resolved from the monorepo's ajv8 plugin — nothing is installed (same trick as spikes/work-loop/proto/build.mjs).
 */
import { createRequire } from 'node:module';

const require = createRequire(
  '/Users/Vincent/Workspace/albatrion/packages/canard/schema-form-ajv8-plugin/package.json',
);
const Ajv2020 = require('ajv/dist/2020').default ?? require('ajv/dist/2020');
const Ajv07 = require('ajv/dist/ajv').default ?? require('ajv/dist/ajv');

export const AJV_VERSION = require('ajv/package.json').version;

/** @param {object} opts extra Ajv options */
export const make2020 = (opts = {}) => new Ajv2020({ allErrors: true, strict: false, ...opts });
/** @param {object} opts extra Ajv options */
export const make07 = (opts = {}) => new Ajv07({ allErrors: true, strict: false, ...opts });

/**
 * Validate `value` against `root` with a fresh instance, returning `{ valid, errors }`.
 * A fresh instance per call avoids `$id` collisions between corpus entries.
 */
export function verdict(root, value, { dialect = '2020', ...opts } = {}) {
  const ajv = dialect === '2020' ? make2020(opts) : make07(opts);
  const fn = ajv.compile(root);
  const valid = fn(value);
  return { valid, errors: (fn.errors ?? []).map((e) => `${e.instancePath || '/'} ${e.keyword} ${e.message}`) };
}

/**
 * Which union branches (by index) accept `value` when compiled in the context of `root`.
 * `pointer` is the JSON pointer of the union keyword array, e.g. `/properties/pet/oneOf`.
 */
export function acceptingBranches(root, pointer, count, value, { dialect = '2020', ...opts } = {}) {
  const ajv = dialect === '2020' ? make2020(opts) : make07(opts);
  ajv.addSchema(root, 'r');
  const out = [];
  for (let i = 0; i < count; i++) {
    const fn = ajv.compile({ $ref: `r#${pointer}/${i}` });
    if (fn(value)) out.push(i);
  }
  return out;
}
