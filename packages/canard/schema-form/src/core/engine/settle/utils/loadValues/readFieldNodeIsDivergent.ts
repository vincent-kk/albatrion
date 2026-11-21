import type { FieldNodeRecord } from '../../../record';
import { sameValue } from '../../../utils/compute/sameValue';
import { getLoadValue } from './getLoadValue';
import { readLoadProperty } from './readLoadProperty';
import { readLoadSegments } from './readLoadSegments';

/**
 * Compare the form output at one occurrence's path with its last root load output.
 * @param node - Occurrence with constructor-initialized memo fields and cached path syntax
 * @returns False before a root load or after detach; otherwise the memoized ordered-value difference
 */
export const readFieldNodeIsDivergent = <Self extends FieldNodeRecord<Self>>(
  node: Self,
): boolean => {
  const baseline = node.runtime.loadBaseline;
  if (!baseline || node.isDetached) return false;
  let segments = node.divergenceSegments;
  if (!segments || !Object.is(node.path, node.divergencePath)) {
    if (node.behavior.type === 'virtual') {
      if (!node.parent) return false;
      const current = getLoadValue(
        node.rootNode.storedOutputValue,
        node.parent.path,
      );
      const base = getLoadValue(baseline.value, node.parent.path);
      return (node.blueprintNode.fields ?? []).some(
        (name) =>
          !sameValue(
            readLoadProperty(current, name),
            readLoadProperty(base, name),
          ),
      );
    }
    segments = readLoadSegments(node);
    node.divergencePath = node.path;
    node.divergenceSegments = segments;
  }
  const current = getLoadValue(
    node.rootNode.storedOutputValue,
    node.path,
    segments,
  );
  const base = getLoadValue(baseline.value, node.path, segments);
  if (
    Object.is(current, node.divergenceCurrent) &&
    Object.is(base, node.divergenceBase)
  )
    return node.storedIsDivergent;
  const result = !sameValue(current, base);
  node.divergenceCurrent = current;
  node.divergenceBase = base;
  node.storedIsDivergent = result;
  return result;
};
