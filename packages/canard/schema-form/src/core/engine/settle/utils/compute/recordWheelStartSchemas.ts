import type { FieldNodeRecord } from '../../../record';
import { captureFieldNodeChange } from '../../../record';
import type { SettlementContext } from '../../types/settlement';
import { captureProjectionBaseline } from '../dependencies/captureProjectionBaseline';
import { isSameEffectiveSchema } from './isSameEffectiveSchema';

/**
 * Record the net change of reset children the first selection pass did not reselect.
 * `resetWheelStartSchema` gave each child its start schema without a record; a reselected child
 * was judged by its composition, while one left unreselected (it exited, or its entry was not
 * visited) ends the pass on its start schema, recorded against the schema it held before the
 * wheel only when the content differs. A branch child whose schema changed reselects its own
 * children, which were selected under the old one.
 * @param node - Host whose wheel reset the children
 * @param reset - Retained children `primeHost` reset for this wheel
 * @param context - Current settlement holding `wheelPriorSchemas`
 * @returns Nothing; records each remaining net change and consumes the reset entries
 */
export const recordWheelStartSchemas = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  reset: readonly Self[],
  context: SettlementContext<Self>,
): void => {
  const priors = context.wheelPriorSchemas;
  if (!priors) return;
  for (let index = 0; index < reset.length; index++) {
    const child = reset[index];
    const prior = priors.get(child);
    if (prior === undefined) continue;
    priors.delete(child);
    const start = child.__schema__;
    if (isSameEffectiveSchema(prior, start)) continue;
    child.__schema__ = prior;
    captureProjectionBaseline(node, child, true, context);
    child.__schema__ = captureFieldNodeChange(child, '__schema__', start);
    context.dirtyPaths.add(child.path);
    if (child.behavior.strategy === 'branch')
      context.shapeDirtyPaths.add(child.path);
    context.changedNodes.add(child);
  }
};
