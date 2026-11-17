import { hasOwnProperty } from '@winglet/common-utils/lib';

import type { FieldNodeRecord } from '../../../record';
import { getCachedPointerSegments } from '../../../utils/paths/getCachedPointerSegments';
import type { SettlementContext } from '../../types/settlement';
import { getDeclaredChildNames } from '../declarations/getDeclaredChildNames';
import { flushPendingOutput } from '../output/flushPendingOutput';
import { getGateRegistry } from './getGateRegistry';

/**
 * Read a publication only after its changed source has been calculated.
 * @param node - Record whose output value is requested
 * @param context - Source changes and calculated records for this settlement
 * @returns Published output value, or undefined while its changed source is pending
 */
const projectedOutputValue = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  context: SettlementContext<Self>,
): unknown =>
  node.storedOutputValue === undefined ||
  (context.changedSource.has(node.path) && !context.changedNodes.has(node))
    ? undefined
    : node.storedOutputValue;

/**
 * Read a path only from the current projected value and undeclared extras.
 * @param context - Root and changed paths in the current settlement
 * @param path - Absolute JSON Pointer of the requested value
 * @returns Latest projected value, or undefined when projection omits the path
 */
export const readProjectedValue = <Self extends FieldNodeRecord<Self>>(
  context: SettlementContext<Self>,
  path: string,
): unknown => {
  let node: Self = context.root;
  if (!path) flushPendingOutput(node, context);
  let value = projectedOutputValue(node, context);
  if (!path) return value;
  let atNode = true;
  const segments = node.runtime.blueprint.capabilities.isBranchless
    ? getCachedPointerSegments(node.runtime, path)
    : getGateRegistry(node.runtime).pathSegments(path);
  for (let index = 0; index < segments.length; index++) {
    const name = segments[index];
    if (typeof name !== 'string') return undefined;
    if (!atNode) {
      if (
        value === null ||
        typeof value !== 'object' ||
        !hasOwnProperty(value, name)
      )
        return undefined;
      value = Reflect.get(value, name);
      continue;
    }
    if (
      node.behavior.strategy === 'branch' &&
      node.source !== undefined &&
      flushPendingOutput(node, context)
    )
      value = projectedOutputValue(node, context);
    if (
      node.behavior.strategy === 'branch' &&
      node.source !== undefined &&
      (node.parent !== null ||
        value === null ||
        typeof value !== 'object' ||
        !hasOwnProperty(value, name))
    )
      return undefined;
    const childrenByName = node.childrenByName;
    const child = childrenByName
      ? node.behavior.type !== 'array' &&
        Object.getPrototypeOf(childrenByName) === null
        ? childrenByName[name]
        : hasOwnProperty(childrenByName, name)
          ? childrenByName[name]
          : undefined
      : undefined;
    if (child) {
      node = child;
      atNode = true;
      value = projectedOutputValue(node, context);
    } else {
      if (flushPendingOutput(node, context))
        value = projectedOutputValue(node, context);
      atNode = false;
      if (
        value !== null &&
        typeof value === 'object' &&
        hasOwnProperty(value, name)
      )
        value = Reflect.get(value, name);
      else {
        const declared = getDeclaredChildNames(node.blueprintNode);
        if (
          !declared.has(name) &&
          node.extras !== null &&
          typeof node.extras === 'object' &&
          hasOwnProperty(node.extras, name)
        )
          value = Reflect.get(node.extras, name);
        else return undefined;
      }
    }
  }
  if (atNode && flushPendingOutput(node, context))
    value = projectedOutputValue(node, context);
  return value;
};
