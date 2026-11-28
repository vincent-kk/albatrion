import {
  JSONPointer as $,
  resolvePointer,
} from '@/schema-form/helpers/jsonPointer';

import type { FieldNodeRecord } from '../../../record';
import type { SettlementContext } from '../../types/settlement';
import type { DecisionConsumer } from './type';

/**
 * Reschedule every other consumer of a decision that just flipped.
 * A branch consumer reselects its children; an array item named for its own schema recomposes
 * it after its computation. A consumer below the evaluating host is reached by its ancestors'
 * dirty-child loops, so its whole ancestry is marked dirty.
 * @param consumers - Consumers named by the registry for the flipped decision
 * @param context - Current settlement receiving dirty, shape-dirty and own-schema marks
 * @returns Nothing; extends the settlement's dirty, shape-dirty and own-schema sets
 */
export const scheduleDecisionConsumers = <Self extends FieldNodeRecord<Self>>(
  consumers: readonly DecisionConsumer[],
  context: SettlementContext<Self>,
): void => {
  for (const consumer of consumers) {
    if (consumer.isOwnSchema)
      (context.ownSchemaPaths ??= new Set()).add(consumer.path);
    else context.shapeDirtyPaths.add(consumer.path);
    for (let path = consumer.path; !context.dirtyPaths.has(path); ) {
      context.dirtyPaths.add(path);
      if (!path) break;
      path = resolvePointer(path, $.Parent);
    }
  }
};
