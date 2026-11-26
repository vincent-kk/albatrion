import { isArray } from '@winglet/common-utils/filter';

import type { Optional } from '@aileron/declare';

import type { Behavior, FieldNodeRecord } from '../../../../record';
import { assembleArrayValue } from './assembleArrayValue';
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
    '__schema__' | 'extras' | 'source' | '__itemCount__' | 'runtime'
  >,
  children: readonly unknown[],
): void => {
  (node.runtime.arrayShapes ??= new WeakMap()).set(node, {
    children,
    schema: node.__schema__,
    extras: node.extras,
    source: node.source,
    itemCount: node.__itemCount__,
  });
};

/**
 * Combine emitted items and undeclared tail positions without changing source.
 * @param node - Array host with committed child projections and tail extras
 * @param children - Current ordered item nodes
 * @param recalculated - Direct items computed during an unchanged-shape write
 * @param hint - Reports whether only the recalculated slots were compared; a `previousItemCount` from a valid append proof patches only the appended slot into one copy of the previous stored value, and a `remainingItemCount` from a valid pop proof keeps that many leading slots of the previous stored value in one copy
 * @returns Stored array value, reusing its prior reference when elements are identical
 */
export const assembleArray: Behavior['assemble'] = (
  node,
  children,
  recalculated,
  hint,
) => {
  if (node.source === null) return null;
  const previous = isArray(node.__value__) ? node.__value__ : undefined;
  const remainingItemCount = hint?.remainingItemCount;
  if (
    hint &&
    remainingItemCount !== undefined &&
    previous &&
    node.__itemCount__ === remainingItemCount &&
    (previous.length === remainingItemCount + 1 ||
      previous.length === remainingItemCount)
  ) {
    rememberShape(node, children);
    hint.isIncremental = true;
    return previous.length === remainingItemCount
      ? previous
      : previous.slice(0, remainingItemCount);
  }
  const previousItemCount = hint?.previousItemCount;
  if (
    hint &&
    previousItemCount !== undefined &&
    previous &&
    node.__itemCount__ === previousItemCount + 1 &&
    (previous.length === previousItemCount ||
      previous.length === previousItemCount + 1)
  ) {
    const extras = node.extras;
    if (
      !node.blueprintNode.item &&
      !node.blueprintNode.prefixItems?.length &&
      children.length === 0 &&
      isArray(extras) &&
      extras.length === previousItemCount + 1
    ) {
      const value = extras[previousItemCount];
      rememberShape(node, children);
      hint.isIncremental = true;
      if (previous.length === previousItemCount)
        return previous.concat([value]);
      if (Object.is(value, previous[previousItemCount])) return previous;
      const result = previous.slice();
      result[previousItemCount] = value;
      return result;
    }
    const template = getArrayItemTemplate(node, previousItemCount);
    const child = node.__childrenByName__?.['' + previousItemCount];
    if (template && child !== null && typeof child === 'object') {
      const outputValue =
        '__outputValue__' in child ? child.__outputValue__ : undefined;
      const value =
        outputValue === undefined
          ? holeValue(template.kind, previous[previousItemCount])
          : outputValue;
      rememberShape(node, children);
      hint.isIncremental = true;
      if (
        previous.length === previousItemCount + 1 &&
        Object.is(value, previous[previousItemCount])
      )
        return previous;
      if (previous.length === previousItemCount)
        return previous.concat([value]);
      const result = previous.slice();
      result[previousItemCount] = value;
      return result;
    }
  }
  const stable = node.runtime.arrayShapes?.get(node);
  if (
    recalculated &&
    previous?.length === node.__itemCount__ &&
    stable?.children === children &&
    stable.schema === node.__schema__ &&
    stable.extras === node.extras &&
    stable.source === node.source &&
    stable.itemCount === node.__itemCount__
  ) {
    let patch: Optional<unknown[]>;
    let valid = true;
    for (const child of recalculated) {
      if (
        child === null ||
        typeof child !== 'object' ||
        !('name' in child) ||
        typeof child.name !== 'string' ||
        !('__outputValue__' in child)
      ) {
        valid = false;
        break;
      }
      const index = Number(child.name);
      if (
        !Number.isInteger(index) ||
        index < 0 ||
        index >= node.__itemCount__ ||
        node.__childrenByName__?.[child.name] !== child
      ) {
        valid = false;
        break;
      }
      const template = getArrayItemTemplate(node, index);
      if (!template) {
        valid = false;
        break;
      }
      const outputValue = child.__outputValue__;
      const value =
        outputValue === undefined
          ? holeValue(template.kind, previous[index])
          : outputValue;
      if (!Object.is(value, previous[index])) {
        if (!patch) patch = previous.slice();
        patch[index] = value;
      }
    }
    if (valid) {
      if (hint) hint.isIncremental = true;
      return patch ?? previous;
    }
  }
  const result = assembleArrayValue(node, previous);
  rememberShape(node, children);
  return result;
};
