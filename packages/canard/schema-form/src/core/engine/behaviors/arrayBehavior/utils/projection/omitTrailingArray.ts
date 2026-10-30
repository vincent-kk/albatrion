import type { FieldNodeRecord } from '../../../../record';
import { trimmedArrays } from '../../../../utils/cache/valueMemos';
import { getArrayItemTemplate } from '../value/getArrayItemTemplate';

/**
 * Trim trailing nullish raw items or unfilled branch slots without mutation.
 * @param value - Local or terminal array whose suffix may be omitted
 * @param node - Branch host for detecting item holes; absent for terminal raw
 * @returns Original array when unchanged, otherwise a memoized copied prefix
 */
export const omitTrailingArray = <Self>(
  value: readonly unknown[],
  node?: FieldNodeRecord<Self>,
): readonly unknown[] => {
  let end = value.length;
  while (end > 0) {
    const index = end - 1;
    if (!node) {
      if (value[index] != null) break;
    } else {
      const template = getArrayItemTemplate(node, index);
      if (!template) {
        if (value[index] != null) break;
      } else {
        const child = node.structure?.[String(index)];
        const emission =
          child !== null && typeof child === 'object' && 'emit' in child
            ? child.emit
            : undefined;
        if (
          emission !== undefined &&
          !(
            emission === null &&
            template.kind !== 'object' &&
            template.kind !== 'array'
          )
        )
          break;
      }
    }
    end--;
  }
  if (end === value.length) return value;
  const cached = trimmedArrays.get(value);
  if (
    cached?.end === end &&
    cached.result.every((item, index) => Object.is(item, value[index]))
  )
    return cached.result;
  const result = value.slice(0, end);
  trimmedArrays.set(value, { end, result });
  return result;
};
