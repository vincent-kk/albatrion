import type { FieldNodeRecord } from '../../../record';
import type { PendingPresenceTemplate } from '../../types/pendingPresenceTemplate';
import type { SettlementContext } from '../../types/settlement';

/**
 * Park one unbound reader and schedule its static host without expanding it.
 * @param template - Absolute reader pointer containing an unbound wildcard
 * @param kind - Presence query phase whose exclusion rule must be preserved
 * @param origin - Registering host for outer reads or changed child for direct reads
 * @param context - Call-local pending table and dirty indexes to update
 * @returns Whether a new pending entry was created and its host scheduled
 */
export const deferPresenceTemplate = <Self extends FieldNodeRecord<Self>>(
  template: string,
  kind: PendingPresenceTemplate['kind'],
  origin: string,
  context: SettlementContext<Self>,
): boolean => {
  const pending = (context.presenceTemplates ??= new Map());
  const key = kind + '\u0000' + template;
  const entry = pending.get(key);
  if (!entry) {
    const host = template.slice(0, template.indexOf('/*'));
    pending.set(key, { template, kind, deepest: origin, host });
    context.dirtyPaths.add(host);
    context.shapeDirtyPaths.add(host);
    for (let ancestor = host; ancestor; ) {
      ancestor = ancestor.slice(0, ancestor.lastIndexOf('/'));
      context.dirtyPaths.add(ancestor);
    }
    return true;
  }
  const deepest = entry.deepest;
  if (
    deepest !== null &&
    deepest !== origin &&
    !(origin === '' || deepest.startsWith(origin + '/'))
  )
    entry.deepest =
      deepest === '' || origin.startsWith(deepest + '/') ? origin : null;
  return false;
};
