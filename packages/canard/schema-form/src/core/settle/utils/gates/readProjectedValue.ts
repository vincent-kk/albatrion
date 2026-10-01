import type { SchemaNodeRecord } from '../../../record';
import type { SettlementContext } from '../../type';
import { hasOwnProperty } from '@winglet/common-utils/lib';

/** Declared child-name indexes shared by occurrences of one blueprint node. */
const DECLARED_NAMES = new WeakMap<object, Set<string>>();

/**
 * Read a path only from the current projected value and undeclared extras.
 * @param context - Root and changed paths in the current settlement
 * @param path - Absolute JSON Pointer of the requested value
 * @returns Latest projected value, or undefined when projection omits the path
 */
export const readProjectedValue = <Self extends SchemaNodeRecord<Self>>(
  context: SettlementContext<Self>,
  path: string,
): unknown => {
  let node: Self = context.root;
  let value: unknown = node.emit;
  if (value === undefined ||
    (context.changedRaw.has(node.path) && !context.changedNodes.has(node)))
    value = undefined;
  if (!path) return value;
  for (const encoded of path.slice(1).split('/')) {
    const name = encoded.replace(/~1/g, '/').replace(/~0/g, '~');
    if (node.behavior.strategy === 'branch' && node.raw !== undefined &&
      (node.parent !== null || value === null || typeof value !== 'object' ||
        !hasOwnProperty(value, name))) return undefined;
    const child = node.structure && hasOwnProperty(node.structure, name)
      ? node.structure[name] : undefined;
    if (child) {
      node = child;
      value = node.emit;
      if (value === undefined ||
        (context.changedRaw.has(node.path) && !context.changedNodes.has(node)))
        value = undefined;
    } else if (value !== null && typeof value === 'object' &&
      hasOwnProperty(value, name))
      value = Reflect.get(value, name);
    else {
      let declared = DECLARED_NAMES.get(node.blueprintNode);
      if (!declared) {
        declared = new Set(node.blueprintNode.childEntries.map((entry) => entry.name));
        DECLARED_NAMES.set(node.blueprintNode, declared);
      }
      if (!declared.has(name) && node.extras !== null &&
        typeof node.extras === 'object' && hasOwnProperty(node.extras, name))
        value = Reflect.get(node.extras, name);
      else return undefined;
    }
  }
  return value;
};
