import { hasOwnProperty } from '@winglet/common-utils/lib';
import { unescapeSegment } from '@winglet/json/pointer';

import type { SchemaNodeRecord } from '../../../../../record';
import { resolveDependencyPath } from '../../../../utils/paths/resolveDependencyPath';

/**
 * Read one authored expression dependency from the current output projection.
 * @param root - Calculated root for the current round
 * @param hostPath - Live declaration host for relative paths
 * @param dependency - Authored path or the context token
 * @returns Projected value, context object, or undefined for an absent path
 */
export const readDeriveDependency = <Self extends SchemaNodeRecord<Self>>(
  root: Self, hostPath: string, dependency: string,
): unknown => {
  const path = resolveDependencyPath(hostPath, dependency);
  if (path === '@') return root.runtime.context ?? {};
  let value: unknown = root.emit;
  for (const encoded of path.split('/').slice(1)) {
    if (value === null || typeof value !== 'object') return undefined;
    const name = unescapeSegment(encoded);
    if (!hasOwnProperty(value, name)) return undefined;
    value = Reflect.get(value, name);
  }
  return value;
};
