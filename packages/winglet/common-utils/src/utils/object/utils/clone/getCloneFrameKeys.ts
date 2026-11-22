import { getSymbols } from '../../getSymbols';

/**
 * Yield keys in recursive clone order, observing metadata after array elements.
 * @param source Ordinary dictionary or intrinsic array at a deep work frame.
 * @returns An iterator over the keys copied by the recursive clone.
 */
export function* getCloneFrameKeys(source: object): Generator<PropertyKey> {
  if (!Array.isArray(source)) {
    yield* Object.keys(source);
    yield* getSymbols(source);
    return;
  }
  for (let index = 0, length = source.length; index < length; index++)
    if (index in source) yield index;
  if ('index' in source) yield 'index';
  if ('input' in source) yield 'input';
  if ('groups' in source) yield 'groups';
}
