import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { fixDtsExtensions } from './fixDtsExtensions.mjs';

/**
 * Detects a declared require branch that opts into CommonJS declarations.
 * @param {unknown} target Export map or nested condition to inspect.
 * @returns {boolean} Whether any require.types target exists below this value.
 */
function hasCommonJsTypes(target) {
  return target !== null && typeof target === 'object' &&
    (typeof target.require?.types === 'string' || Object.values(target).some(hasCommonJsTypes));
}

/**
 * Copies canonical declarations, including ambient dependencies, into a parallel CJS graph.
 * @param {string} directory Built declaration directory, after alias and ESM extension repair.
 * @param {object} manifest Package exports opt in through a nested require.types target.
 * @returns {number} Number of CommonJS companion files emitted; zero without opt-in.
 */
export function emitCommonJsDeclarations(directory, manifest) {
  if (!hasCommonJsTypes(manifest.exports) && !hasCommonJsTypes(manifest.publishConfig?.exports)) return 0;
  const declarations = readdirSync(directory, { recursive: true })
    .filter((name) => /\.d\.(?:ts|mts)$/.test(name));
  for (const name of declarations) {
    writeFileSync(join(directory, name.replace(/\.d\.(?:ts|mts)$/, '.d.cts')),
      readFileSync(join(directory, name)));
  }
  fixDtsExtensions(directory, { declarationFormat: 'commonjs' });
  return declarations.length;
}
