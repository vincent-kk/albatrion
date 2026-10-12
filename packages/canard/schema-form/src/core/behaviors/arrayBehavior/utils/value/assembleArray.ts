import { isArray } from '@winglet/common-utils/filter';
import type { Behavior } from '../../../../record';
import { holeValue } from './holeValue';

/** The previous slot owners make unchanged shapes eligible for sparse patches. */
const STABLE_SHAPES = new WeakMap<object, {
  children: readonly unknown[]; schema: unknown; extras: unknown;
  raw: unknown; itemCount: number;
}>();

/**
 * Combine emitted items and undeclared tail positions without changing source.
 * @param node - Array host with committed child projections and tail extras
 * @param children - Current ordered item nodes
 * @param recalculated - Direct items computed during an unchanged-shape write
 * @param hint - Reports whether only the recalculated slots were compared
 * @returns Local array, reusing its prior reference when elements are identical
 */
export const assembleArray: Behavior['assemble'] = (node, children,
  recalculated, hint) => {
  const previous = isArray(node.local) ? node.local : undefined;
  const stable = STABLE_SHAPES.get(node);
  if (recalculated && previous?.length === node.itemCount &&
    stable?.children === children && stable.schema === node.schema &&
    stable.extras === node.extras && stable.raw === node.raw &&
    stable.itemCount === node.itemCount) {
    let patch: unknown[] | undefined;
    let valid = true;
    for (const child of recalculated) {
      if (child === null || typeof child !== 'object' ||
        !('name' in child) || typeof child.name !== 'string' ||
        !('emit' in child)) {
        valid = false;
        break;
      }
      const index = Number(child.name);
      if (!Number.isInteger(index) || index < 0 || index >= node.itemCount ||
        node.structure?.[child.name] !== child) {
        valid = false;
        break;
      }
      const template = node.blueprintNode.prefixItems?.[index] ??
        node.blueprintNode.item;
      if (!template) {
        valid = false;
        break;
      }
      const emission = child.emit;
      const value = emission === undefined
        ? holeValue(template.kind, previous[index]) : emission;
      if (!Object.is(value, previous[index])) {
        if (!patch) patch = previous.slice();
        patch[index] = value;
      }
    }
    if (valid) {
      if (hint) hint.incremental = true;
      return patch ?? previous;
    }
  }
  const extras = isArray(node.extras) ? node.extras : [];
  const result: unknown[] = [];
  let tailStart = 0;
  for (let index = 0; index < node.itemCount; index++) {
    const template = node.blueprintNode.prefixItems?.[index] ??
      node.blueprintNode.item;
    if (!template) {
      result.push(extras[index - tailStart]);
      continue;
    }
    tailStart++;
    const child = node.structure?.[String(index)];
    const emission = child !== null && typeof child === 'object' &&
      'emit' in child ? child.emit : undefined;
    result.push(emission === undefined
      ? holeValue(template.kind, previous?.[index]) : emission);
  }
  STABLE_SHAPES.set(node, { children, schema: node.schema, extras: node.extras,
    raw: node.raw, itemCount: node.itemCount });
  if (previous?.length === result.length &&
    result.every((value, index) => Object.is(value, previous[index]))) return previous;
  return result;
};
