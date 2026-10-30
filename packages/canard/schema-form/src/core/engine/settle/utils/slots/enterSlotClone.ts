import type { FieldNodeRecord } from '../../../record';
import type { SettlementContext } from '../../types/settlement';
import { getChildDistribution } from '../input/getChildDistribution';
import { hasDistributedChildInput } from '../input/hasDistributedChildInput';
import { markWrite } from '../input/markWrite';

/**
 * Apply current caller input without restoring an already cloned source again.
 * @param host - Live distribution owner of the entering clone
 * @param child - Fresh subtree whose retained raw and extras have been copied
 * @param name - Canonical binding name used by the host input
 * @param context - Distribution, automatic-write, and fill work for this entry
 * @returns Nothing; exact retained sources take precedence over structural replay
 */
export const enterSlotClone = <Self extends FieldNodeRecord<Self>>(
  host: Self,
  child: Self,
  name: string,
  context: SettlementContext<Self>,
): void => {
  const distribution = getChildDistribution(host, name, context, child.path);
  if (!distribution || distribution.preserveLatent) return;
  const supplied = hasDistributedChildInput(
    distribution.input,
    name,
    host.behavior.type === 'array',
  );
  if (!supplied && !distribution.whole) return;
  const value = supplied ? Reflect.get(distribution.input, name) : undefined;
  if (distribution.automatic) {
    context.automatic = true;
    context.writtenInputs.set(child, value);
    context.filledNodes.add(child);
  }
  markWrite(child, value, context);
  if (distribution.automatic) context.automatic = false;
};
