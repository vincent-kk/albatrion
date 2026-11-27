import { canonicalShape } from './retrievalURIPatterns';

/**
 * Tell whether resolving a retrieval key leaves its spelling unchanged.
 * @param uri Registered key as the caller wrote it.
 * @returns True only for spellings that resolution provably keeps; false may also cover keys
 *   that would resolve unchanged, which costs a normalization pass but never a wrong lookup.
 */
export function isCanonicalRetrievalURI(uri: string): boolean {
  return canonicalShape.test(uri);
}
