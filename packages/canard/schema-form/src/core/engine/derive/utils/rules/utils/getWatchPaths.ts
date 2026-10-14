import { isArray } from '@winglet/common-utils/filter';

import type { BlueprintNode } from '../../../../blueprint';
import { CONTROL_KEY } from '../../../../constants/controlKey';
import { SCHEMA_GROUP } from '../../../../constants/schemaGroup';

/** Immutable target templates retain their authored watch union. */
const WATCH_PATHS = new WeakMap<BlueprintNode, readonly string[]>();

/**
 * Read all authored watches on a value target without other expression paths.
 * @param node - Analyzed target template and its overlapping declarations
 * @returns Memoized distinct authored watch paths in declaration order
 */
export const getWatchPaths = (node: BlueprintNode): readonly string[] => {
  const cached = WATCH_PATHS.get(node);
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
  WATCH_PATHS.set(node, watches);
  return watches;
};
