import { maxLite } from '@winglet/common-utils/math';

import {
  JSONPointer as $,
  PointerOperator,
  isDescendantPath,
  joinPointer,
  resolvePointer,
} from '@/schema-form/helpers/jsonPointer';

import type { FieldNodeRecord } from '../../../record';
import type { PendingPresenceTemplate } from '../../types/pendingPresenceTemplate';
import type { SettlementContext } from '../../types/settlement';
import { getDependencyIndex } from './getDependencyIndex';

/**
 * Park one unbound reader and schedule its static host without expanding it.
 * @param template - Absolute reader pointer containing an unbound wildcard
 * @param kind - Presence query phase whose exclusion rule must be preserved
 * @param origin - Registering host for outer reads or changed child for direct reads
 * @param context - Call-local pending table and dirty indexes to update
 * @param stamp - Logical time of the contributing presence change
 * @returns Whether a new pending entry was created and its host scheduled
 */
export const deferPresenceTemplate = <Self extends FieldNodeRecord<Self>>(
  template: string,
  kind: PendingPresenceTemplate['kind'],
  origin: string,
  context: SettlementContext<Self>,
  stamp: number,
): boolean => {
  const pending = (context.presenceTemplates ??= new Map());
  const key = kind + '\u0000' + template;
  const entry = pending.get(key);
  if (!entry) {
    const segments = getDependencyIndex(
      context.root.runtime.blueprint,
    ).pathSegments(template, context.root.runtime);
    const wildcard = segments.indexOf(PointerOperator.Wildcard);
    const host = joinPointer(
      segments.slice(0, wildcard < 0 ? undefined : wildcard),
    );
    pending.set(key, { template, kind, deepest: origin, host, stamp });
    context.dirtyPaths.add(host);
    context.shapeDirtyPaths.add(host);
    for (let ancestor = host; ancestor; ) {
      ancestor = resolvePointer(ancestor, $.Parent);
      context.dirtyPaths.add(ancestor);
    }
    return true;
  }
  entry.stamp = maxLite(entry.stamp, stamp);
  const deepest = entry.deepest;
  if (
    deepest !== null &&
    deepest !== origin &&
    !(origin === $.Root || isDescendantPath(deepest, origin))
  )
    entry.deepest =
      deepest === $.Root || isDescendantPath(origin, deepest) ? origin : null;
  return false;
};
