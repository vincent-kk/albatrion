import type { Blueprint } from '../../../blueprint';
import { getCachedPointerSegments } from '../../../utils/paths/getCachedPointerSegments';
import { getDependencyIndex } from '../dependencies/getDependencyIndex';

const isName = (segment: unknown): segment is string =>
  typeof segment === 'string';

/** Share slot address syntax while allowing only concrete property names. */
export const getSlotPathNames = (
  runtime: { readonly blueprint?: Blueprint },
  path: string,
): readonly string[] | undefined => {
  const segments =
    runtime.blueprint && !runtime.blueprint.capabilities.branchless
      ? getDependencyIndex(runtime.blueprint).pathSegments(path, runtime)
      : getCachedPointerSegments(runtime, path);
  return segments.every(isName) ? segments : undefined;
};
