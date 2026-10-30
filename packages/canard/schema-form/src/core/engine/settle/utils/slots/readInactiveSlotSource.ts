import type { BlueprintNode } from '../../../blueprint';
import type { FieldNodeRecord } from '../../../record';
import type { SettlementContext } from '../../types/settlement';
import { readSlotRawTree } from './readSlotRawTree';
import { resolveSlotSource } from './resolveSlotSource';
/**
 * Recompose a gated-out item from its retained own-kind latent sources.
 * @param context - Settlement retaining sources by actual occurrence path and kind
 * @param path - Runtime position of the absent item or descendant
 * @param template - Blueprint kind and declared children at that position
 * @returns Its retained source value, or undefined when no source exists
 */
export const readInactiveSlotSource = <Self extends FieldNodeRecord<Self>>(
  context: SettlementContext<Self>,
  path: string,
  template: BlueprintNode,
): unknown => {
  const resolved = resolveSlotSource(context.root, path, template);
  return resolved.source || resolved.overlay
    ? readSlotRawTree(template, resolved.source, resolved.overlay)
    : undefined;
};
