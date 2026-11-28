import type { EffectiveSchema } from '../../../blueprint';
import type { FieldNodeRecord } from '../../../record';
import type { SettlementContext } from '../../types/settlement';
import { captureProjectionBaseline } from '../dependencies/captureProjectionBaseline';
import { isSameEffectiveSchema } from './isSameEffectiveSchema';

/** Annotates the lazily created `wheelPriorSchemas`; an argument-less `new Map()` would be `Map<any, any>`. */
type WheelPriorSchemas<Self> = Map<Self, EffectiveSchema>;

/**
 * Start a retained child's wheel from its fixed start schema without recording the change.
 * The child holds and computes under the start schema, so the wheel's first round reads its
 * value, output and derived inputs as a fresh load of the same sources would (SETTLE-044). The
 * schema it held before is kept for the net judgement at its first selection
 * (`composeEntrySchema`) or, when no selection reaches it, `recordWheelStartSchemas`.
 * @param host - Host whose wheel resets the child
 * @param child - Retained child whose current schema is not its start schema
 * @param start - Start schema of this wheel (the ungated baseline or the fixed-first baseline)
 * @param context - Current settlement
 * @returns Nothing; the child holds `start`, and a child whose content changed is dirty with
 * its projection baseline and original schema captured from before the reset
 */
export const resetWheelStartSchema = <Self extends FieldNodeRecord<Self>>(
  host: Self,
  child: Self,
  start: EffectiveSchema,
  context: SettlementContext<Self>,
): void => {
  const priors: WheelPriorSchemas<Self> = (context.wheelPriorSchemas ??=
    new Map());
  if (!priors.has(child)) priors.set(child, child.__schema__);
  if (!context.originalSchemas.has(child.path))
    context.originalSchemas.set(child.path, child.__schema__);
  if (!isSameEffectiveSchema(child.__schema__, start)) {
    captureProjectionBaseline(host, child, true, context);
    context.dirtyPaths.add(child.path);
  }
  child.__schema__ = start;
};
