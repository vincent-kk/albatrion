import { walkSchemaNodes } from '../../../navigation';
import type { SchemaNodeRecord } from '../../../record';
import type { SettlementContext } from '../../type';
import { captureDetachedSchemaNodeReads } from '../detached/captureDetachedSchemaNodeReads';
import { getGateRegistry } from '../gates/getGateRegistry';
import { prunePerishedPath } from './prunePerishedPath';
import { pruneArrayTailPaths } from './pruneArrayTailPaths';

/**
 * Detach final length-removed items without exit clearing or latent capture.
 * @param context - Settlement whose array selection marked perished items
 * @returns Nothing; old references retain their last committed reads
 */
export const finalizePerished = <Self extends SchemaNodeRecord<Self>>(
  context: SettlementContext<Self>,
): void => {
  for (const node of context.perished) {
    if (node.parent?.structure?.[node.name] === node) continue;
    walkSchemaNodes(node, (departing) => {
      if (!departing.runtime.detachedReads?.has(departing))
        captureDetachedSchemaNodeReads(departing, {
          emit: context.previousEmit,
          context: context.previousContext,
          schema: context.originalSchemas.get(departing.path)?.schema ??
            departing.schema.schema,
        });
      departing.detached = true;
      departing.active = false;
    });
    getGateRegistry(node.runtime).remove(node);
    for (const [key, pending] of context.pendingExits)
      if (pending.path === node.path || pending.path.startsWith(`${node.path}/`))
        context.pendingExits.delete(key);
    prunePerishedPath(node.runtime, node.path);
  }
  for (const [host, previousCount] of context.arrayCounts)
    if (!host.detached && host.itemCount !== previousCount)
      pruneArrayTailPaths(host);
};
