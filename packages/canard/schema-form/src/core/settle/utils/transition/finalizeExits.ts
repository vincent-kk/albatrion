import { walkSchemaNodes } from '../../../navigation';
import type { SchemaNodeRecord } from '../../../record';
import type { SettlementContext } from '../../type';
import { updateOutput } from '../compute/updateOutput';
import { captureDetachedSchemaNodeReads } from '../detached/captureDetachedSchemaNodeReads';
import { getGateRegistry } from '../gates/getGateRegistry';
import { applyExitClearing } from './applyExitClearing';
import { withdrawDetachedFills } from './withdrawDetachedFills';

/**
 * Decide exits only against the settled final shape, including Source B.
 * @param context - One call's temporarily absent occurrences
 * @returns Nothing; departing references retain their previous commit reads
 */
export const finalizeExits = <Self extends SchemaNodeRecord<Self>>(
  context: SettlementContext<Self>,
): void => {
  for (const node of context.pendingExits.values()) {
    if (node.detached) continue;
    const parent = node.parent;
    if (parent?.structure?.[node.name] === node) continue;
    context.exited.add(node);
    walkSchemaNodes(node, (departing) => {
      if (!departing.runtime.detachedReads?.has(departing))
        captureDetachedSchemaNodeReads(departing);
      departing.detached = true;
      departing.active = false;
    });
    getGateRegistry(node.runtime).remove(node);
    for (const path of [...context.root.runtime.typeMismatchPaths])
      if (path === node.path || path.startsWith(`${node.path}/`))
        context.root.runtime.typeMismatchPaths.delete(path);
  }
  withdrawDetachedFills(context);
  if (!context.suppressAutomaticWrites && !context.failure)
    applyExitClearing(context);
  for (const node of context.exited)
    for (let ancestor = node.parent; ancestor; ancestor = ancestor.parent)
      if (!ancestor.detached) updateOutput(ancestor, context);
};
