import { isArray } from '@winglet/common-utils/filter';

import type {
  InactiveGeneration,
  InactiveProjection,
  InactiveSource,
} from '../../types/inactiveValues';
import { isMisfit } from '../commit/isMisfit';
import { HostLatent } from '../latentStore/HostLatent';
import { compareInactiveOrder } from './compareInactiveOrder';

/**
 * Reconcile one affected path against immutable source and presence facts.
 * @param view - Host-local replay view
 * @param generation - Generation owning any newly published item identity
 * @param path - Exact path touched by source or visibility deltas
 * @returns Whether the ordered list's item or order changed at this commit
 */
export const reconcileInactivePath = (
  view: InactiveProjection,
  generation: InactiveGeneration,
  path: string,
): boolean => {
  const previousKey = view.entries.pathIndex.at(path).values().next().value;
  const previous =
    previousKey === undefined ? undefined : view.entries.get(previousKey);
  let chosen: InactiveSource | undefined;
  let value: unknown;
  for (const key of view.sources.pathIndex.at(path)) {
    const candidate = view.sources.get(key)!;
    if (view.visibility.get(path) ?? candidate.visible) continue;
    const template = candidate.template;
    const source = candidate.source;
    const next =
      template.strategy === 'terminal'
        ? source
        : source instanceof HostLatent &&
            source.raw !== undefined &&
            ((template.kind === 'array' &&
              template.strategy === 'branch' &&
              isArray(source.raw)) ||
              isMisfit(source.raw, template.schemaType, template.nullable))
          ? source.raw
          : undefined;
    if (
      next !== undefined &&
      (!chosen || compareInactiveOrder(candidate.order, chosen.order) < 0)
    ) {
      chosen = candidate;
      value = next;
    }
  }
  if (!chosen) {
    if (previousKey !== undefined) view.entries.delete(previousKey);
    return previous !== undefined;
  }
  if (
    previousKey === chosen.key &&
    previous &&
    Object.is(previous.value, value) &&
    compareInactiveOrder(previous.order, chosen.order) === 0
  )
    return false;
  const next = generation.items.get(chosen.key) ?? {
    value,
    order: chosen.order,
    entry:
      previousKey === chosen.key && previous && Object.is(previous.value, value)
        ? previous.entry
        : Object.freeze({ path, value }),
  };
  generation.items.set(chosen.key, next);
  if (previousKey !== undefined && previousKey !== chosen.key)
    view.entries.delete(previousKey);
  view.entries.set(chosen.key, next);
  return true;
};
