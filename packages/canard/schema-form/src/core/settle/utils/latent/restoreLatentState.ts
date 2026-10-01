import type { SchemaNodeRecord } from '../../../record';
import type { SettlementContext } from '../../type';
import { markWrite } from '../write/markWrite';
import { HostLatent } from './HostLatent';
import { isArray } from '@winglet/common-utils/filter';

/**
 * Restore only one entering node's own latent state.
 * @param node - Newly created occurrence inside the current shape
 * @param value - Source held under this occurrence's path and kind
 * @param context - Calculation work whose dirty paths must be updated
 * @returns Nothing; descendants restore their own entries separately
 */
export const restoreLatentState = <Self extends SchemaNodeRecord<Self>>(
  node: Self, value: unknown, context: SettlementContext<Self>,
): void => {
  if (node.behavior.strategy === 'terminal') {
    markWrite(node, value, context);
    return;
  }
  const raw = value instanceof HostLatent ? value.raw : undefined;
  const extras = value instanceof HostLatent ? value.extras : undefined;
  if (node.behavior.type === 'array' && isArray(raw)) {
    markWrite(node, raw, context);
    return;
  }
  if (!Object.is(node.raw, raw) || !Object.is(node.extras, extras)) {
    node.raw = raw;
    node.extras = extras;
    context.changedRaw.add(node.path);
    context.changedNodes.add(node);
  }
  context.dirtyPaths.add(node.path);
  context.shapeDirtyPaths.add(node.path);
};
