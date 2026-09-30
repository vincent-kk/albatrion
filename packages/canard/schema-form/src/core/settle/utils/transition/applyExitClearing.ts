import type { SchemaNodeRecord } from '../../../record';
import type { SettlementContext } from '../../type';
import { getLatentOrder } from '../latent/getLatentOrder';
import { captureExitedRaw } from './captureExitedRaw';
import { captureLatentDescendants } from './captureLatentDescendants';
import { readUnsetPolicy } from './readUnsetPolicy';
import { readDepartingAncestorPolicy } from './readDepartingAncestorPolicy';

/**
 * Apply final exit policies to each detached previously live subtree.
 * @param context - Shape exits observed against the previous commit
 * @param skip - Exits owned by a load scope, whose sources the load already replaced
 * @returns Nothing; each departing node stores only its own latent source
 */
export const applyExitClearing = <Self extends SchemaNodeRecord<Self>>(
  context: SettlementContext<Self>,
  skip: (node: Self) => boolean = () => false,
): void => {
  for (const node of context.exited) {
    if (skip(node) || context.entered.has(node) || !node.detached) continue;
    const inherited = readDepartingAncestorPolicy(context, node);
    captureExitedRaw(node, inherited, context, true,
      getLatentOrder(node.parent, node.name, node.blueprintNode));
    captureLatentDescendants(context, node, readUnsetPolicy(node, inherited));
  }
};
