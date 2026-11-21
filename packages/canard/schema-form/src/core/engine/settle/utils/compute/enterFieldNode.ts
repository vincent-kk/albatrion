import type { FieldNodeRecord } from '../../../record';
import type { SettlementContext } from '../../types/settlement';
import { getChildDistribution } from '../input/getChildDistribution';
import { hasDistributedChildInput } from '../input/hasDistributedChildInput';
import { markWrite } from '../input/markWrite';
import { replayMovedSource } from '../slots/replayMovedSource';

/**
 * Prefer caller input while structural replay preserves an entering candidate's source.
 * @param host - Live parent that may have received a current write
 * @param child - Occurrence newly entering the shape
 * @param name - Child name in the parent's declaration
 * @param context - Current distribution and per-kind latent sources; in a batch only a
 * child inside the replace paths reads the host's distribution
 * @returns Nothing; the child is ready for shape calculation
 */
export const enterFieldNode = <Self extends FieldNodeRecord<Self>>(
  host: Self,
  child: Self,
  name: string,
  context: SettlementContext<Self>,
): void => {
  const distribution = getChildDistribution(host, name, context, child.path);
  const write =
    distribution &&
    hasDistributedChildInput(
      distribution.input,
      name,
      host.behavior.type === 'array',
    );
  if (distribution?.shouldPreserveLatent)
    replayMovedSource(
      child,
      write ? Reflect.get(distribution.input, name) : undefined,
      context,
    );
  else if (write || distribution?.isWhole) {
    const value = write ? Reflect.get(distribution.input, name) : undefined;
    const writeOrigin =
      write || distribution.writeOrigin === 'revived'
        ? distribution.writeOrigin
        : undefined;
    if (distribution.isAutomatic) {
      context.isAutomatic = true;
      if (writeOrigin === undefined) {
        context.writtenInputs.set(child, value);
        context.filledNodes.add(child);
      }
    }
    markWrite(child, value, context, undefined, undefined, writeOrigin);
    if (distribution.isAutomatic) context.isAutomatic = false;
  } else if (child.behavior.strategy === 'terminal')
    markWrite(child, undefined, context);
  else {
    context.dirtyPaths.add(child.path);
    context.shapeDirtyPaths.add(child.path);
  }
};
