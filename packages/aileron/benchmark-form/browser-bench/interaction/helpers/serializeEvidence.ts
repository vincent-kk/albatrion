import { pathToFileURL } from 'node:url';

/**
 * Serialize raw browser entries without embedding local file URLs in retained evidence.
 * @param value - Evidence whose numeric and behavioral fields remain unchanged
 * @param root - Frozen bundle directory, replaced by the stable ir0 URL scheme
 * @returns Pretty JSON with local page source URLs normalized
 */
export function serializeEvidence(value: unknown, root: string): string {
  const url = pathToFileURL(root).href;
  return (
    JSON.stringify(
      value,
      (_key, entry) =>
        typeof entry === 'string'
          ? entry.split(url).join('ir0:/').split(root).join('[prepared-root]')
          : entry,
      2,
    ) + '\n'
  );
}
