/**
 * Yield array keys in recursive clone order, observing metadata after the elements.
 * @param source Intrinsic array at a deep work frame.
 * @returns An iterator over the keys copied by the recursive clone.
 */
export function* getCloneFrameKeys(
  source: readonly unknown[],
): Generator<PropertyKey> {
  for (let index = 0, length = source.length; index < length; index++)
    if (index in source) yield index;
  if ('index' in source) yield 'index';
  if ('input' in source) yield 'input';
  if ('groups' in source) yield 'groups';
}
