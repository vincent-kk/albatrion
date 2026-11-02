import type { FieldNodeRecord } from '../../../record';
import { sameValue } from '../../../utils/compute/sameValue';
import { getCachedPointerSegments } from '../../../utils/paths/getCachedPointerSegments';
import { getDependencyIndex } from '../dependencies/getDependencyIndex';
import { getLoadValue } from './getLoadValue';

/**
 * Compare the form output at one occurrence's path with its last root load output.
 * @param node - Occurrence with constructor-initialized memo fields and cached path syntax
 * @returns False before a root load or after detach; otherwise the memoized ordered-value difference
 */
export const readFieldNodeIsDivergent = <Self extends FieldNodeRecord<Self>>(
  node: Self,
): boolean => {
  const baseline = node.runtime.loadBaseline;
  if (!baseline || node.detached) return false;
  let segments = node.divergenceSegments;
  if (!segments || !Object.is(node.path, node.divergencePath)) {
    segments = node.runtime.blueprint.capabilities.branchless
      ? getCachedPointerSegments(node.runtime, node.path)
      : getDependencyIndex(node.runtime.blueprint).pathSegments(
          node.path,
          node.runtime,
        );
    node.divergencePath = node.path;
    node.divergenceSegments = segments;
  }
  const current = getLoadValue(node.rootNode.emit, node.path, segments);
  const base = getLoadValue(baseline.value, node.path, segments);
  if (
    Object.is(current, node.divergenceCurrent) &&
    Object.is(base, node.divergenceBase)
  )
    return node.divergenceResult;
  const result = !sameValue(current, base);
  node.divergenceCurrent = current;
  node.divergenceBase = base;
  node.divergenceResult = result;
  return result;
};
