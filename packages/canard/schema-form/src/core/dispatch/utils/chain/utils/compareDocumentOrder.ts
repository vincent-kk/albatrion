import type { SchemaNodeRecord } from '../../../../record';

/**
 * Compare two committed occurrences by their parent-child document positions.
 * @param left - First occurrence in the current wave
 * @param right - Second occurrence in the current wave
 * @returns Negative when left precedes right, positive when it follows
 */
export const compareDocumentOrder = <Self extends SchemaNodeRecord<Self>>(
  left: Self, right: Self,
): number => {
  if (left === right) return 0;
  const leftLine: Self[] = [];
  const rightLine: Self[] = [];
  for (let node: Self | null = left; node; node = node.parent) leftLine.unshift(node);
  for (let node: Self | null = right; node; node = node.parent) rightLine.unshift(node);
  let index = 0;
  while (index < leftLine.length && index < rightLine.length &&
    leftLine[index] === rightLine[index]) index += 1;
  if (index === leftLine.length) return -1;
  if (index === rightLine.length) return 1;
  const siblings = leftLine[index - 1].children ?? [];
  return siblings.indexOf(leftLine[index]) - siblings.indexOf(rightLine[index]);
};
