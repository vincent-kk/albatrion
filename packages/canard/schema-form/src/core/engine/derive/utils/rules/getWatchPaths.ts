import { isArray } from '@winglet/common-utils/filter';

import type { BlueprintNode } from '../../../blueprint';
import { getHostDerived } from '../../../utils/cache/derivedRecords';
import { readValidatedControls } from '../../../utils/controls/readValidatedControls';

/** Immutable target templates retain their authored watch union. */

/**
 * Read all authored watches on a value target without other expression paths.
 * @param node - Analyzed target template and its overlapping declarations
 * @returns Memoized distinct authored watch paths in declaration order
 */
export const getWatchPaths = (node: BlueprintNode): readonly string[] => {
  const cached = getHostDerived<'watchPaths', readonly string[]>(
    node,
  ).watchPaths;
  if (cached) return cached;
  const watches: string[] = [];
  for (const declaration of node.declarations) {
    const schema = declaration.schema;
    const watch = readValidatedControls(schema)?.watch;
    for (const path of isArray(watch) ? watch : [])
      if (watches.indexOf(path) === -1) watches.push(path);
  }
  getHostDerived<'watchPaths', readonly string[]>(node).watchPaths = watches;
  return watches;
};
