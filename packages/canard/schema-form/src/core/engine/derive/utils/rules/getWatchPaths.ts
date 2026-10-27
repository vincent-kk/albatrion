import { isArray } from '@winglet/common-utils/filter';

import type { BlueprintNode } from '../../../blueprint';
import { CONTROL_KEY } from '../../../constants/controlKey';
import { SCHEMA_GROUP } from '../../../constants/schemaGroup';
import { getHostDerived } from '../../../utils/cache/derivedRecords';

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
    const controls =
      schema && typeof schema === 'object'
        ? Reflect.get(schema, SCHEMA_GROUP.controls)
        : undefined;
    const watch =
      controls && typeof controls === 'object'
        ? Reflect.get(controls, CONTROL_KEY.watch)
        : undefined;
    for (const path of isArray(watch) ? watch : [])
      if (typeof path === 'string' && !watches.includes(path))
        watches.push(path);
  }
  getHostDerived<'watchPaths', readonly string[]>(node).watchPaths = watches;
  return watches;
};
