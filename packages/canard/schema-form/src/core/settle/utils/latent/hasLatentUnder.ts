import { isArray } from '@winglet/common-utils/filter';

import type { SchemaNodeRecord } from '../../../record';
import type { SettlementContext } from '../../type';

/**
 * Find a source below a host across every latent kind (26C-14).
 * @param context - Settlement with a lazily rebuilt proper-ancestor index
 * @param path - Host path whose descendants may hold latent sources
 * @returns Whether a latent descendant can prevent an empty-host fill
 */
export const hasLatentUnder = <Self extends SchemaNodeRecord<Self>>(
  context: SettlementContext<Self>, path: string,
): boolean => {
  if (!context.latentPrefixes) {
    const ignored = new Set<string>();
    for (const node of [...context.entered, ...context.revived])
      if (!node.detached && (!node.parent || node.parent.structure?.[node.name] === node))
        ignored.add(JSON.stringify([node.path, node.blueprintNode.kind]));
    const prefixes = new Set<string>();
    for (const key of context.root.runtime.latentRaw.keys()) {
      if (ignored.has(key)) continue;
      const identity: unknown = JSON.parse(key);
      if (!isArray(identity) || typeof identity[0] !== 'string') continue;
      let ancestor = identity[0];
      while (ancestor) {
        ancestor = ancestor.slice(0, ancestor.lastIndexOf('/'));
        prefixes.add(ancestor);
      }
    }
    context.latentPrefixes = prefixes;
  }
  return context.latentPrefixes.has(path);
};
