import { hasOwnProperty } from '@winglet/common-utils/lib';
import type { SchemaNodeRecord } from '../../../record';

/**
 * Resolve the nearest authored exit policy before the form's fallback.
 * @param node - Exiting declaration occurrence
 * @param inherited - Closest ancestor or form policy
 * @returns The local true/false choice when present, otherwise inherited
 */
export const readUnsetPolicy = <Self extends SchemaNodeRecord<Self>>(
  node: Self, inherited: boolean,
): boolean => {
  let clear = false;
  let keep = false;
  const key = JSON.stringify([node.path, node.blueprintNode.kind]);
  const committed = node.runtime.committedDeclarationIds?.get(key);
  for (const declaration of node.blueprintNode.declarations) {
    if (committed ? !committed.includes(declaration.id) :
      declaration.gates.length > 0) continue;
    if (declaration.scope !== 'node' || declaration.schema === null ||
      typeof declaration.schema !== 'object') continue;
    const controls = declaration.schema.controls;
    if (controls !== null && typeof controls === 'object' &&
      hasOwnProperty(controls, 'unsetOnInactive')) {
      const policy: unknown = Reflect.get(controls, 'unsetOnInactive');
      if (policy === false) keep = true;
      if (policy === true) clear = true;
    }
  }
  return keep ? false : clear ? true : inherited;
};
