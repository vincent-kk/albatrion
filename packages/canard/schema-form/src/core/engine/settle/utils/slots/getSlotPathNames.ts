import type { Optional } from '@aileron/declare';

import type { Blueprint } from '../../../blueprint';
import { getCachedPointerSegments } from '../../../utils/paths/getCachedPointerSegments';
import { isNamedPointerSegments } from '../../../utils/paths/isNamedPointerSegments';
import { getDependencyIndex } from '../dependencies/getDependencyIndex';

/**
 * Read the decoded names of a slot address, sharing its syntax with the dependency index.
 * @param runtime - Runtime whose blueprint, when present and not branchless, supplies the shared index.
 * @param path - Canonical slot address made of concrete names.
 * @returns The names, or undefined when any segment is an operator and the address is not concrete. Callers must not mutate the result.
 */
export const getSlotPathNames = (
  runtime: { readonly blueprint?: Blueprint },
  path: string,
): Optional<readonly string[]> => {
  const segments =
    runtime.blueprint && !runtime.blueprint.capabilities.branchless
      ? getDependencyIndex(runtime.blueprint).pathSegments(path, runtime)
      : getCachedPointerSegments(runtime, path);
  return isNamedPointerSegments(segments) ? segments : undefined;
};
