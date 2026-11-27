import { getDeclarationEntries } from './getDeclarationEntries.mjs';

/**
 * Rejects development-only conditions at every depth of a published export map.
 * @param {unknown} target Export map or nested condition.
 * @returns {void} Returns when no source condition occurs below the target.
 * @throws When any published branch contains a source condition.
 */
function assertPublishedConditions(target) {
  if (!target || typeof target !== 'object') return;
  for (const [key, value] of Object.entries(target)) {
    if (key === 'source') throw new Error('Published exports must omit source conditions');
    assertPublishedConditions(value);
  }
}

/**
 * Validates published declarations against the development contract and condition order.
 * @param {object} manifest Package manifest with an optional publishConfig.exports override.
 * @returns {void} Returns only when the published map preserves the declared type surface.
 * @throws When published conditions are unsupported, contain source or differ from development declarations.
 */
export function validatePublishedDeclarations(manifest) {
  if (!manifest.publishConfig?.exports) return;
  assertPublishedConditions(manifest.publishConfig.exports);
  const published = getDeclarationEntries({ ...manifest, exports: manifest.publishConfig.exports });
  const development = getDeclarationEntries(manifest);
  if (JSON.stringify(published) !== JSON.stringify(development))
    throw new Error(`${manifest.name}: published declaration branches differ from development exports`);
}
