import { isArray } from '@winglet/common-utils/filter';

import type { Behavior, FieldNodeRecord } from '../../../../record';
import { getArrayItemTemplate } from './getArrayItemTemplate';
import { holeValue } from './holeValue';

/**
 * Record the slot owners of this assembly so a later unchanged-shape write may patch it.
 * @param node - Array host just assembled
 * @param children - Ordered item nodes the assembly read
 * @returns Nothing; the runtime's stable-shape record holds the owners
 */
const rememberShape = <Self>(
  node: Pick<
    FieldNodeRecord<Self>,
    'schema' | 'undeclaredValues' | 'raw' | 'itemCount' | 'runtime'
  >,
  children: readonly unknown[],
): void => {
  (node.runtime.arrayShapes ??= new WeakMap()).set(node, {
    children,
    schema: node.schema,
    undeclaredValues: node.undeclaredValues,
    raw: node.raw,
    itemCount: node.itemCount,
  });
};

/**
 * Combine emitted items and undeclared tail positions without changing source.
 * @param node - Array host with committed child projections and tail extras
 * @param children - Current ordered item nodes
 * @param recalculated - Direct items computed during an unchanged-shape write
 * @param hint - Reports whether only the recalculated slots were compared; an `append` count from a valid append proof patches only that slot into one copy of the previous local, and a `truncate` count from a valid pop proof keeps that many leading slots of the previous local in one copy
 * @returns Local array, reusing its prior reference when elements are identical
 */
export const assembleArray: Behavior['assemble'] = (
  node,
  children,
  recalculated,
  hint,
) => {
  const previous = isArray(node.local) ? node.local : undefined;
  const truncate = hint?.truncate;
  if (
    hint &&
    truncate !== undefined &&
    previous &&
    node.itemCount === truncate &&
    (previous.length === truncate + 1 || previous.length === truncate)
  ) {
    rememberShape(node, children);
    hint.incremental = true;
    return previous.length === truncate
      ? previous
      : previous.slice(0, truncate);
  }
  const append = hint?.append;
  if (
    hint &&
    append !== undefined &&
    previous &&
    node.itemCount === append + 1 &&
    (previous.length === append || previous.length === append + 1)
  ) {
    const extras = node.undeclaredValues;
    if (
      !node.blueprintNode.item &&
      !node.blueprintNode.prefixItems?.length &&
      children.length === 0 &&
      isArray(extras) &&
      extras.length === append + 1
    ) {
      const value = extras[append];
      rememberShape(node, children);
      hint.incremental = true;
      if (previous.length === append) return previous.concat([value]);
      if (Object.is(value, previous[append])) return previous;
      const result = previous.slice();
      result[append] = value;
      return result;
    }
    const template = getArrayItemTemplate(node, append);
    const child = node.structure?.[String(append)];
    if (template && child !== null && typeof child === 'object') {
      const emission = 'emit' in child ? child.emit : undefined;
      const value =
        emission === undefined
          ? holeValue(template.kind, previous[append])
          : emission;
      rememberShape(node, children);
      hint.incremental = true;
      if (previous.length === append + 1 && Object.is(value, previous[append]))
        return previous;
      if (previous.length === append) return previous.concat([value]);
      const result = previous.slice();
      result[append] = value;
      return result;
    }
  }
  const stable = node.runtime.arrayShapes?.get(node);
  if (
    recalculated &&
    previous?.length === node.itemCount &&
    stable?.children === children &&
    stable.schema === node.schema &&
    stable.undeclaredValues === node.undeclaredValues &&
    stable.raw === node.raw &&
    stable.itemCount === node.itemCount
  ) {
    let patch: unknown[] | undefined;
    let valid = true;
    for (const child of recalculated) {
      if (
        child === null ||
        typeof child !== 'object' ||
        !('name' in child) ||
        typeof child.name !== 'string' ||
        !('emit' in child)
      ) {
        valid = false;
        break;
      }
      const index = Number(child.name);
      if (
        !Number.isInteger(index) ||
        index < 0 ||
        index >= node.itemCount ||
        node.structure?.[child.name] !== child
      ) {
        valid = false;
        break;
      }
      const template = getArrayItemTemplate(node, index);
      if (!template) {
        valid = false;
        break;
      }
      const emission = child.emit;
      const value =
        emission === undefined
          ? holeValue(template.kind, previous[index])
          : emission;
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
  const extras = isArray(node.undeclaredValues) ? node.undeclaredValues : [];
  const result: unknown[] = [];
  let tailStart = 0;
  for (let index = 0; index < node.itemCount; index++) {
    const template = getArrayItemTemplate(node, index);
    if (!template) {
      result.push(extras[index - tailStart]);
      continue;
    }
    tailStart++;
    const child = node.structure?.[String(index)];
    const emission =
      child !== null && typeof child === 'object' && 'emit' in child
        ? child.emit
        : undefined;
    result.push(
      emission === undefined
        ? holeValue(template.kind, previous?.[index])
        : emission,
    );
  }
  rememberShape(node, children);
  if (
    previous?.length === result.length &&
    (() => {
      const items = result;
      for (
        let position = 0, count = items.length;
        position < count;
        position++
      ) {
        if (!(position in items)) continue;
        const value = items[position];
        const index = position;
        if (!Object.is(value, previous[index])) return false;
      }
      return true;
    })()
  )
    return previous;
  return result;
};
