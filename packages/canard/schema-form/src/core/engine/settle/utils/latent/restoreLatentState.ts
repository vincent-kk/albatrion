import { isArray } from '@winglet/common-utils/filter';

import type { FieldNodeRecord } from '../../../record';
import type { SettlementContext } from '../../types/settlement';
import { markWrite } from '../input/markWrite';
import { HostLatent } from '../latentStore/HostLatent';
import { replayMovedInput } from './replayMovedInput';

/**
 * Restore only one entering node's own latent state.
 * @param node - Newly created occurrence inside the current shape
 * @param value - Source held under this occurrence's path and kind
 * @param context - Calculation work whose dirty paths must be updated
 * @returns Nothing; descendants restore their own entries separately
 */
export const restoreLatentState = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  value: unknown,
  context: SettlementContext<Self>,
): void => {
  if (
    context.root.blueprintNode.hasCandidateDescendants &&
    ((node.behavior.strategy === 'terminal' && value instanceof HostLatent) ||
      (node.behavior.strategy === 'branch' &&
        value !== undefined &&
        !(value instanceof HostLatent)))
  ) {
    replayMovedInput(node, value, context);
    return;
  }
  if (node.behavior.strategy === 'terminal') {
    markWrite(node, value, context);
    return;
  }
  const raw = value instanceof HostLatent ? value.raw : undefined;
  const extras =
    value instanceof HostLatent ? value.undeclaredValues : undefined;
  if (node.behavior.type === 'array' && isArray(raw)) {
    markWrite(node, raw, context);
    if (value instanceof HostLatent && value.retainedItemNames) {
      const distribution = context.distributedInputs.get(node);
      if (distribution)
        context.distributedInputs.set(node, {
          ...distribution,
          retainedItemNames: value.retainedItemNames,
        });
    }
    return;
  }
  if (!Object.is(node.raw, raw) || !Object.is(node.undeclaredValues, extras)) {
    node.raw = raw;
    node.undeclaredValues = extras;
    context.changedRaw.add(node.path);
    context.changedNodes.add(node);
  }
  context.dirtyPaths.add(node.path);
  context.shapeDirtyPaths.add(node.path);
};
