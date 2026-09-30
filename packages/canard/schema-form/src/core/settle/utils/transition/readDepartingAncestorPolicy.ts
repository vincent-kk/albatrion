import { hasOwnProperty } from '@winglet/common-utils/lib';
import type { SchemaNodeRecord } from '../../../record';
import type { SettlementContext } from '../../type';

/**
 * Find the nearest policy on a declaration leaving a still-live ancestor.
 * @param context - Previous committed and current selected declaration sets
 * @param node - Top occurrence whose own declarations have exited
 * @returns The departing ancestor policy, or the form fallback
 */
export const readDepartingAncestorPolicy = <Self extends SchemaNodeRecord<Self>>(
  context: SettlementContext<Self>, node: Self,
): boolean => {
  for (let ancestor = node.parent; ancestor; ancestor = ancestor.parent) {
    if (ancestor.detached) continue;
    const key = JSON.stringify([ancestor.path, ancestor.blueprintNode.kind]);
    const previous = context.root.runtime.committedDeclarationIds?.get(key);
    const selected = context.selectedDeclarationIds.get(ancestor);
    if (!previous || !selected) continue;
    let clear = false;
    let keep = false;
    for (const declaration of ancestor.blueprintNode.declarations) {
      if (!previous.includes(declaration.id) || selected.includes(declaration.id) ||
        declaration.scope !== 'node' || declaration.schema === null ||
        typeof declaration.schema !== 'object') continue;
      const controls = declaration.schema.controls;
      if (controls === null || typeof controls !== 'object' ||
        !hasOwnProperty(controls, 'unsetOnInactive')) continue;
      const policy: unknown = Reflect.get(controls, 'unsetOnInactive');
      if (policy === false) keep = true;
      if (policy === true) clear = true;
    }
    if (keep) return false;
    if (clear) return true;
  }
  return context.root.runtime.unsetOnInactive === true;
};
