import type { FieldNodeRecord } from '../../../record';
import type { SettlementContext } from '../../types/settlement';
import { getLatentOrder } from '../latentStore/getLatentOrder';
import { captureExitedRaw } from './captureExitedRaw';
import { captureLatentDescendants } from './captureLatentDescendants';
import { readDepartingAncestorPolicy } from './readDepartingAncestorPolicy';
import { readUnsetPolicy } from './readUnsetPolicy';

/** Skip predicate that lets every exit be processed. */
const NEVER_SKIP = (): boolean => false;

/**
 * Apply final exit policies to each detached previously live subtree.
 * @param context - Shape exits observed against the previous commit
 * @param skip - Exits owned by a load scope, whose sources the load already replaced
 * @returns Nothing; each departing node stores only its own latent source
 */
export const applyExitClearing = <Self extends FieldNodeRecord<Self>>(
  context: SettlementContext<Self>,
  skip: (node: Self) => boolean = NEVER_SKIP,
): void => {
  for (const node of context.exited) {
    if (skip(node) || context.entered.has(node) || !node.detached) continue;
    const inherited = readDepartingAncestorPolicy(context, node);
    captureExitedRaw(
      node,
      inherited,
      context,
      true,
      getLatentOrder(node.parent, node.name, node.blueprintNode),
    );
    captureLatentDescendants(context, node, readUnsetPolicy(node, inherited));
  }
};
