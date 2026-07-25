import type Ajv from 'ajv';
import type { Options } from 'ajv';

type AjvConstructor = new (options?: Options) => Ajv;

/**
 * Depth bound for the `default` walk below. Three is already one more level than
 * any known interop produces; the bound exists only so a module whose `default`
 * points back at itself cannot spin forever.
 */
const MAX_INTEROP_DEPTH = 3;

/**
 * Extracts the Ajv constructor from whatever a default import of `ajv` yields.
 *
 * Necessary because ajv@7 publishes CommonJS whose `module.exports` is an
 * ESM-interop namespace — `{ __esModule: true, default: Ajv, ... }` — rather
 * than the class itself. What a default import produces therefore depends on
 * who resolves it:
 *
 * - TypeScript/Vite honour `__esModule` and hand back the class directly.
 * - Node's CJS-from-ESM interop ignores `__esModule` and always makes `default`
 *   the whole `module.exports`, so the class sits one level down.
 * - A bundler's CJS interop helper may wrap that namespace once more, putting
 *   the class two levels down.
 *
 * Walking `default` until a callable turns up covers all three, and also covers
 * ajv@6/ajv@8, whose `module.exports` already is the class.
 */
export const resolveAjvConstructor = (imported: unknown): AjvConstructor => {
  let candidate = imported;
  for (
    let depth = 0;
    candidate != null && depth <= MAX_INTEROP_DEPTH;
    depth++
  ) {
    if (typeof candidate === 'function') return candidate as AjvConstructor;
    candidate = (candidate as { default?: unknown }).default;
  }
  throw new Error(
    'Could not resolve the Ajv constructor from the "ajv" module export.',
  );
};
