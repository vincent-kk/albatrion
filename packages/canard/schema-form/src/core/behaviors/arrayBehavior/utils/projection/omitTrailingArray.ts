import { getItemEntry } from '../../../../blueprint';
import type { SchemaNodeRecord } from '../../../../record';

/** Reuse the most recent trimmed view while its source prefix is unchanged. */
const TRIMMED = new WeakMap<readonly unknown[], {
  end: number; result: readonly unknown[];
}>();

/**
 * Trim trailing nullish raw items or unfilled branch slots without mutation.
 * @param value - Local or terminal array whose suffix may be omitted
 * @param node - Branch host for detecting item holes; absent for terminal raw
 * @returns Original array when unchanged, otherwise a memoized copied prefix
 */
export const omitTrailingArray = <Self>(
  value: readonly unknown[], node?: SchemaNodeRecord<Self>,
): readonly unknown[] => {
  let end = value.length;
  while (end > 0) {
    const index = end - 1;
    if (!node) {
      if (value[index] != null) break;
    } else {
      const entry = getItemEntry(node.blueprintNode, index);
      if (!entry) {
        if (value[index] != null) break;
      } else {
        const child = node.structure?.[String(index)];
        const emission = child !== null && typeof child === 'object' &&
          'emit' in child ? child.emit : undefined;
        if (emission !== undefined && !(emission === null &&
          entry.node.kind !== 'object' && entry.node.kind !== 'array')) break;
      }
    }
    end--;
  }
  if (end === value.length) return value;
  const cached = TRIMMED.get(value);
  if (cached?.end === end && cached.result.every((item, index) =>
    Object.is(item, value[index]))) return cached.result;
  const result = value.slice(0, end);
  TRIMMED.set(value, { end, result });
  return result;
};
