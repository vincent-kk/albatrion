import type { BlueprintNode } from '../../../blueprint';
import type { SchemaNodeRecord } from '../../../record';
import type { SettlementContext } from '../../type';
import { hasLatentUnder } from '../latent/hasLatentUnder';
import { isMissingRaw } from '../transition/isMissingRaw';

/**
 * Stop source-free template repetition within object-property chains.
 * Array item edges terminate the chain because only existing items expand.
 * @param parent - Current declaration host
 * @param template - Template requested by the gate
 * @param input - Distributed or latent source for the new occurrence
 * @param context - Settlement's live and latent source index
 * @returns Whether repeating the template would expand without a source
 */
export const hasRecursiveExpansion = <Self extends SchemaNodeRecord<Self>>(
  parent: Self, template: BlueprintNode, input: unknown,
  context: SettlementContext<Self>,
): boolean => {
  if (input !== undefined) return false;
  let ancestor: Self | null = parent;
  while (ancestor) {
    if (ancestor.behavior.type === 'array') return false;
    if (ancestor.blueprintNode === template) {
      const hasSource = ancestor.raw !== undefined ||
        ancestor.extras !== undefined ||
        context.distributedInputs.get(ancestor)?.input !== undefined ||
        hasLatentUnder(context, ancestor.path) ||
        (ancestor.children ?? []).some((child) => !isMissingRaw(child, context));
      if (!hasSource) return true;
    }
    ancestor = ancestor.parent;
  }
  return false;
};
