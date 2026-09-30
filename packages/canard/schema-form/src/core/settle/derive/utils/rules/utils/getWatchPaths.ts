import { isArray } from '@winglet/common-utils/filter';

import type { BlueprintNode } from '../../../../../blueprint';

/**
 * Read all authored watches on a value target without other expression paths.
 * @param node - Analyzed target template and its overlapping declarations
 * @returns Distinct authored watch paths in declaration order
 */
export const getWatchPaths = (node: BlueprintNode): readonly string[] => {
  const watches: string[] = [];
  for (const declaration of node.declarations) {
    const schema = declaration.schema;
    const controls = schema && typeof schema === 'object' ?
      Reflect.get(schema, 'controls') : undefined;
    const watch = controls && typeof controls === 'object' ?
      Reflect.get(controls, 'watch') : undefined;
    for (const path of isArray(watch) ? watch : [])
      if (typeof path === 'string' && !watches.includes(path)) watches.push(path);
  }
  return watches;
};
