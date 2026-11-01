import { readFailureBundle } from './readFailureBundle';

/**
 * Visit host failure leaves depth-first without changing their identity.
 * @param failure - Any value; malformed or revisited bundles remain leaves.
 * @param visit - Consumer invoked once per leaf in element order.
 * @returns Nothing; traversal adds no exception of its own.
 */
export const forEachFailureLeaf = (
  failure: unknown,
  visit: (leaf: unknown) => void,
): void => {
  const root = readFailureBundle(failure);
  if (!root) return visit(failure);
  const visited = new Set<unknown>([failure]);
  const frames: { errors: readonly unknown[]; index: number }[] = [
    { errors: root, index: 0 },
  ];
  while (frames.length) {
    const frame = frames[frames.length - 1];
    if (frame.index >= frame.errors.length) {
      frames.pop();
      continue;
    }
    const element = frame.errors[frame.index++];
    const nested = visited.has(element)
      ? undefined
      : readFailureBundle(element);
    if (nested) {
      visited.add(element);
      frames.push({ errors: nested, index: 0 });
    } else visit(element);
  }
};
