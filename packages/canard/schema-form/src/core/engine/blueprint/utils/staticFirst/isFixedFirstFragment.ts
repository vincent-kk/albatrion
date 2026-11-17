import type { BlueprintChildEntry } from '../../types/node';
import { isFixedFirstConstraint } from './isFixedFirstConstraint';
import { isFixedFirstRecord } from './isFixedFirstRecord';

/**
 * Prove that a local conditional fragment cannot change membership or values.
 * @param value - Then/else fragment; undefined means no authored contribution
 * @param children - Unique unconditional child bindings indexed once per host
 * @returns Whether the fragment only constrains existing string children
 */
export const isFixedFirstFragment = (
  value: unknown,
  children: ReadonlyMap<string, BlueprintChildEntry>,
): boolean => {
  if (value === undefined) return true;
  if (!isFixedFirstRecord(value)) return false;
  const fragment = value;
  const keys = Object.keys(fragment);
  if (keys.length === 0) return true;
  if (keys.length !== 1 || keys[0] !== 'properties') return false;
  const properties = fragment.properties;
  if (!isFixedFirstRecord(properties)) return false;
  for (const name of Object.keys(properties)) {
    const child = children.get(name);
    if (
      !child ||
      child.node.kind !== 'string' ||
      !isFixedFirstConstraint(properties[name])
    )
      return false;
  }
  return true;
};
