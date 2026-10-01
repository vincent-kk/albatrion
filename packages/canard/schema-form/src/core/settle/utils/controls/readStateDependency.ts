import { hasOwnProperty } from '@winglet/common-utils/lib';
import { unescapeSegment } from '@winglet/json/pointer';

import type { SchemaNodeRecord } from '../../../record';
import { resolveDependencyPath } from '../paths/resolveDependencyPath';

/** Emission and context retained before a settlement changes the live tree. */
export interface EmissionSnapshot {
  /** Previously emitted root value. */
  readonly emit: unknown;
  /** Previously bound context object. */
  readonly context?: Readonly<Record<string, unknown>>;
}

/**
 * Read an authored state or watch path from the final emitted tree.
 * @param root - Live root whose output and context are settled
 * @param hostPath - Occurrence path that anchors relative dependencies
 * @param dependency - Authored pointer or context token
 * @param snapshot - Optional preceding commit when a node is detaching
 * @returns The emitted value, context, or undefined for an absent path
 */
export const readStateDependency = <Self extends SchemaNodeRecord<Self>>(
  root: Self, hostPath: string, dependency: string,
  snapshot?: EmissionSnapshot,
): unknown => {
  const path = resolveDependencyPath(hostPath, dependency);
  if (path === '@') return (snapshot ? snapshot.context : root.runtime.context) ?? {};
  let value: unknown = snapshot ? snapshot.emit : root.emit;
  for (const encoded of path.split('/').slice(1)) {
    if (value === null || typeof value !== 'object') return undefined;
    const name = unescapeSegment(encoded);
    if (!hasOwnProperty(value, name)) return undefined;
    value = Reflect.get(value, name);
  }
  return value;
};
