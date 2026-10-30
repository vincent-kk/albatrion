import { verifyInputs as verifyBaseInputs } from '../b9-1/verifyInputs.mjs';

/** Validate the original immutable bundles and every pinned hygiene adapter.
 * @param {string} root Prepared external .noindex root.
 * @returns {object} Frozen input metadata; throws when any recorded byte changed.
 */
export function verifyInputs(root) {
  return verifyBaseInputs(root);
}
