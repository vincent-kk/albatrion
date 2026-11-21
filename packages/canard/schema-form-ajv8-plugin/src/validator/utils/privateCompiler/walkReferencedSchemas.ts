import { readPointer } from './readPointer';
import type { SchemaDependencies } from './types';

/**
 * Promote local reference targets into assertion positions until every pointer is visited.
 * @param document - Owning schema resolved against the registration key and resource declarations.
 * @param key - Native address used to register the owning document.
 * @param facts - Existing facts; visiting a new target can append references to the worklist.
 * @param isKnown - Whether validation dependencies for this position are already recorded.
 * @param visit - Walks the target as a schema at its decoded pointer within the document.
 * @param selectedAddress - Optional fragment requested by an importing document.
 * @returns No value; adds reachable pointer targets through the visitor.
 */
export const walkReferencedSchemas = (
  document: object | boolean,
  key: string,
  facts: SchemaDependencies,
  isKnown: (target: object) => boolean,
  visit: (target: object, pointer: string) => void,
  selectedAddress?: string,
): void => {
  const visitAddress = (address: string) => {
    const hash = address.indexOf('#');
    const documentAddress = hash < 0 ? address : address.slice(0, hash);
    const resource =
      facts.resources.find((entry) => entry.address === address) ??
      (hash < 0
        ? undefined
        : facts.resources.find((entry) => entry.address === documentAddress));
    const fragment =
      hash < 0 || resource?.address === address ? '' : address.slice(hash + 1);
    if (!resource && documentAddress !== key) return;
    if (fragment && !fragment.startsWith('/')) return;
    const pointer = decodeURIComponent(fragment);
    const target = readPointer(resource?.schema ?? document, pointer, false);
    if (target && typeof target === 'object' && !isKnown(target))
      visit(target, (resource?.pointer ?? '') + pointer);
  };

  if (selectedAddress) visitAddress(selectedAddress);
  for (const { address } of facts.references) visitAddress(address);
};
