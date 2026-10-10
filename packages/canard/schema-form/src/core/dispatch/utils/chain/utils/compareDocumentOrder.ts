import type { SchemaNodeRecord } from '../../../../record';

/**
 * Compare two committed occurrences by their parent-child document positions.
 * @param left - First occurrence in the current wave
 * @param right - Second occurrence in the current wave
 * @param siblingIndexes - Parent positions shared across this wave's comparisons
 * @returns Negative when left precedes right, positive when it follows
 */
export const compareDocumentOrder = <Self extends SchemaNodeRecord<Self>>(
  left: Self, right: Self, siblingIndexes: Map<Self, Map<Self, number>>,
): number => {
  if (left === right) return 0;
  const leftLine: Self[] = [];
  const rightLine: Self[] = [];
  for (let node: Self | null = left; node; node = node.parent) leftLine.push(node);
  for (let node: Self | null = right; node; node = node.parent) rightLine.push(node);
  leftLine.reverse();
  rightLine.reverse();
  let index = 0;
  while (index < leftLine.length && index < rightLine.length &&
    leftLine[index] === rightLine[index]) index += 1;
  if (index === leftLine.length) return -1;
  if (index === rightLine.length) return 1;
  const parent = leftLine[index - 1];
  let positions = siblingIndexes.get(parent);
  if (!positions) {
    positions = new Map<Self, number>();
    for (const [position, child] of (parent.children ?? []).entries())
      positions.set(child, position);
    siblingIndexes.set(parent, positions);
  }
  return (positions.get(leftLine[index]) ?? -1) -
    (positions.get(rightLine[index]) ?? -1);
};
