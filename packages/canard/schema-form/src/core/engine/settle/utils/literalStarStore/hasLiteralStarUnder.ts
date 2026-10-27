import { isArray } from '@winglet/common-utils/filter';

import { JSONPointer as $ } from '@/schema-form/helpers/jsonPointer';

import type { FieldNodeRecord } from '../../../record';
import { getBlueprintNodeIdentity } from '../../../utils/nodeIdentity/getBlueprintNodeIdentity';
import type { SettlementContext } from '../../types/settlement';

/**
 * Find a source below a host across every latent kind (26C-14).
 * @param context - Settlement with a lazily rebuilt proper-ancestor index
 * @param path - Host path whose descendants may hold latent sources
 * @returns Whether a latent descendant can prevent an empty-host fill
 */
export const hasLiteralStarUnder = <Self extends FieldNodeRecord<Self>>(
  context: SettlementContext<Self>,
  path: string,
): boolean => {
  if (!context.literalStarPrefixes) {
    const ignored = new Set<string>();
    for (const node of [...context.entered, ...context.revived])
      if (
        !node.detached &&
        (!node.parent || node.parent.structure?.[node.name] === node)
      )
        ignored.add(
          JSON.stringify([
            node.path,
            getBlueprintNodeIdentity(node.blueprintNode),
          ]),
        );
    const prefixes = new Set<string>();
    for (const key of context.root.runtime.literalStarRaw?.keys() ?? []) {
      if (ignored.has(key)) continue;
      const identity: unknown = JSON.parse(key);
      if (!isArray(identity) || typeof identity[0] !== 'string') continue;
      let ancestor = identity[0];
      while (ancestor) {
        ancestor = ancestor.slice(0, ancestor.lastIndexOf($.Separator));
        prefixes.add(ancestor);
      }
    }
    context.literalStarPrefixes = prefixes;
  }
  return context.literalStarPrefixes.has(path);
};
