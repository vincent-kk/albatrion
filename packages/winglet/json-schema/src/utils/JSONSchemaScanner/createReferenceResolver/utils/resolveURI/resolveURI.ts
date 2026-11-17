import { encodeUnsafe } from './utils/encodeUnsafe';
import { isAbsoluteURI } from './utils/isAbsoluteURI';
import { isHierarchical } from './utils/isHierarchical';
import { resolveRelative } from './utils/resolveRelative/resolveRelative';

/**
 * Resolve a written reference or identifier by RFC 3986 section 5.2 under any base.
 * @param reference Written value. C0 controls, spaces and backslashes are percent-encoded first:
 *   the URL parser deletes or rewrites them, so one string would name different targets under
 *   different bases.
 * @param base Enclosing address: hierarchical (`https:`), opaque (`urn:`, `tag:`), relative, or
 *   empty for an unknown default base.
 * @returns The target, which stays relative while the base is empty or relative; undefined when
 *   the text before the first colon is not a scheme or the URL parser rejects the result.
 */
export function resolveURI(
  reference: string,
  base: string,
): string | undefined {
  const written = encodeUnsafe(reference);
  const scheme = isAbsoluteURI(written);
  if (!scheme && written[written.search(/[:/?#]/)] === ':') return undefined;
  try {
    if (isHierarchical(base)) return new URL(written, base).href;
    if (scheme) return new URL(written).href;
  } catch {
    return undefined;
  }
  return resolveRelative(written, base);
}
