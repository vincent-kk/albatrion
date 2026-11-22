/**
 * Decode the URI escapes of a fragment while retaining its leading marker.
 * @param fragment A pointer beginning with `#`.
 * @returns The pointer with its original marker and percent escapes decoded once.
 * @throws URIError for an invalid percent escape or invalid encoded text.
 */
export function decodePointerFragment(fragment: string): string {
  return fragment.indexOf('%') < 0 ? fragment : decodeURIComponent(fragment);
}
