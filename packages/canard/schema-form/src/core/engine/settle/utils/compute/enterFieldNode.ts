import type { FieldNodeRecord } from '../../../record';
import type { SettlementContext } from '../../type';
import { restoreLatentState } from '../latent/restoreLatentState';
import { hasDistributedChildInput } from '../write/hasDistributedChildInput';
import { isWithinReplacePaths } from '../write/isWithinReplacePaths';
import { markWrite } from '../write/markWrite';

/**
 * Give this settlement's distributed key priority over an entering node's latent.
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
  const distribution = isWithinReplacePaths(context, child.path)
    ? context.distributedInputs.get(host)
    : undefined;
  const latent = context.root.runtime.latentRaw;
  const key =
    latent.size > 0
      ? JSON.stringify([child.path, child.blueprintNode.kind])
      : undefined;
  const own = key === undefined ? undefined : latent.get(key);
  const write =
    distribution &&
    hasDistributedChildInput(
      distribution.input,
      name,
      host.behavior.type === 'array',
    );
  if (write || distribution?.whole) {
    if (write && !distribution.whole && key !== undefined && latent.has(key))
      restoreLatentState(child, own, context);
    const value = write ? Reflect.get(distribution.input, name) : undefined;
    if (distribution.automatic) {
      context.automatic = true;
      context.writtenInputs.set(child, value);
      context.filledNodes.add(child);
    }
    markWrite(child, value, context);
    if (distribution.automatic) context.automatic = false;
  } else restoreLatentState(child, own, context);
};
