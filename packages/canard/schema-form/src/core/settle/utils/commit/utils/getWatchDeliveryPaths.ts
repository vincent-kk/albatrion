import { isArray } from '@winglet/common-utils/filter';

import type { SchemaNodeRecord } from '../../../../record';
import { resolveDependencyPath } from '../../paths/resolveDependencyPath';

/**
 * Resolve the final effective watch list against this live occurrence.
 * @param node - Live node whose effective schema declares watch paths
 * @returns Resolved paths, including the context sentinel when watched
 */
export const getWatchDeliveryPaths = <Self extends SchemaNodeRecord<Self>>(
  node: Self,
): readonly string[] => {
  const schema = node.schema.schema;
  const controls: unknown = typeof schema === 'object' ? schema.controls : undefined;
  const watch: unknown = controls && typeof controls === 'object' ?
    Reflect.get(controls, 'watch') : undefined;
  if (!isArray(watch)) return [];
  const paths: string[] = [];
  for (const path of watch)
    if (typeof path === 'string')
      paths.push(resolveDependencyPath(node.path, path));
  return paths;
};
