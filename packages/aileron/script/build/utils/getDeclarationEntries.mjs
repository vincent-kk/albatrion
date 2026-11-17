/**
 * Enumerates verifiable public addresses without silently dropping export shapes.
 * @param {object} manifest Package manifest whose public declarations are checked.
 * @returns {{ entries: [string, unknown][], blocked: string[] }} Concrete exports and explicitly blocked addresses.
 * @throws When a conditional target cannot be covered by the ESM consumer checks.
 */
export function getDeclarationEntries(manifest) {
  const exports = manifest.exports;
  const targets = typeof exports === 'object' && exports !== null && !Array.isArray(exports) &&
    Object.keys(exports).some((key) => key.startsWith('.'))
    ? Object.entries(exports)
    : [['.', exports]];
  const entries = [];
  const blocked = [];
  for (const [key, target] of targets) {
    if (target === null) {
      blocked.push(key);
      continue;
    }
    if (key.includes('*')) throw new Error(`${manifest.name}: wildcard export ${key} requires concrete consumer addresses`);
    if (typeof target === 'string' || (typeof target === 'object' && !Array.isArray(target) && typeof target?.types === 'string')) {
      entries.push([key, target]);
      continue;
    }
    throw new Error(`${manifest.name}: export ${key} requires a string target or top-level types condition; nested-only types conditions are not covered by ESM consumer checks`);
  }
  if (!entries.length) throw new Error(`${manifest.name}: no verifiable public exports found`);
  return { entries, blocked };
}
