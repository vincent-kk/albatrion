import type { SchemaNodeRecord } from '../../../record';
import type { SettlementContext } from '../../type';
import { hasOwnProperty } from '@winglet/common-utils/lib';

/**
 * Read a path from the current calculation, falling back to unexpanded raw.
 * @param context - Root and changed paths in the current settlement
 * @param path - Absolute JSON Pointer of the requested value
 * @returns Latest projected or raw value at that path
 */
export const readProjectedValue = <Self extends SchemaNodeRecord<Self>>(
  context: SettlementContext<Self>,
  path: string,
): unknown => {
  let node: Self = context.root;
  let value: unknown = node.emit;
  if (value === undefined ||
    (context.changedRaw.has(node.path) && !context.changedNodes.has(node)))
    value = node.raw;
  if (!path) return value;
  for (const encoded of path.slice(1).split('/')) {
    const name = encoded.replace(/~1/g, '/').replace(/~0/g, '~');
    const child = node.structure && hasOwnProperty(node.structure, name)
      ? node.structure[name] : undefined;
    if (child) {
      node = child;
      value = node.emit;
      if (value === undefined ||
        (context.changedRaw.has(node.path) && !context.changedNodes.has(node)))
        value = node.raw;
    } else if (value !== null && typeof value === 'object' &&
      hasOwnProperty(value, name))
      value = Reflect.get(value, name);
    else if (!node.blueprintNode.childEntries.some((entry) => entry.name === name) &&
      node.raw !== null && typeof node.raw === 'object' &&
      hasOwnProperty(node.raw, name)) value = Reflect.get(node.raw, name);
    else return undefined;
  }
  return value;
};
