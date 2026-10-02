import type { SchemaNodeRecord } from '../../../record';
import type { SettlementContext } from '../../type';
import { hasOwnProperty } from '@winglet/common-utils/lib';
import { getDeclaredChildNames } from '../declarations/getDeclaredChildNames';
import { flushPendingOutput } from '../compute/flushPendingOutput';

/**
 * Read a publication only after its changed raw has been calculated.
 * @param node - Record whose emission is requested
 * @param context - Raw changes and calculated records for this settlement
 * @returns Published emission, or undefined while its changed raw is pending
 */
const projectedEmission = <Self extends SchemaNodeRecord<Self>>(
  node: Self, context: SettlementContext<Self>,
): unknown => node.emit === undefined ||
  (context.changedRaw.has(node.path) && !context.changedNodes.has(node))
  ? undefined : node.emit;

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
  if (!path) flushPendingOutput(node, context);
  let value = projectedEmission(node, context);
  if (!path) return value;
  let atNode = true;
  for (const encoded of path.slice(1).split('/')) {
    const name = encoded.replace(/~1/g, '/').replace(/~0/g, '~');
    if (node.behavior.strategy === 'branch' && node.raw !== undefined &&
      flushPendingOutput(node, context)) value = projectedEmission(node, context);
    if (node.behavior.strategy === 'branch' && node.raw !== undefined &&
      (node.parent !== null || value === null || typeof value !== 'object' ||
        !hasOwnProperty(value, name))) return undefined;
    const child = node.structure && hasOwnProperty(node.structure, name)
      ? node.structure[name] : undefined;
    if (child) {
      node = child;
      atNode = true;
      value = projectedEmission(node, context);
    } else {
      if (flushPendingOutput(node, context)) value = projectedEmission(node, context);
      atNode = false;
      if (value !== null && typeof value === 'object' && hasOwnProperty(value, name))
        value = Reflect.get(value, name);
      else {
        const declared = getDeclaredChildNames(node.blueprintNode);
        if (!declared.has(name) && node.extras !== null &&
          typeof node.extras === 'object' && hasOwnProperty(node.extras, name))
          value = Reflect.get(node.extras, name);
        else return undefined;
      }
    }
  }
  if (atNode && flushPendingOutput(node, context)) value = projectedEmission(node, context);
  return value;
};
