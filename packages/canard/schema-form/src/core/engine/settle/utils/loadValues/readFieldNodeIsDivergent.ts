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
  let segments = node.__divergenceSegments__;
  if (!segments || !Object.is(node.path, node.__divergencePath__)) {
    if (node.behavior.type === 'virtual') {
      if (!node.__parent__) return false;
      const current = getLoadValue(
        node.rootNode.__outputValue__,
        node.__parent__.path,
      );
      const base = getLoadValue(baseline.value, node.__parent__.path);
      return (node.blueprintNode.fields ?? []).some(
        (name) =>
          !sameValue(
            readLoadProperty(current, name),
            readLoadProperty(base, name),
          ),
      );
    }
    segments = readLoadSegments(node);
    node.__divergencePath__ = node.path;
    node.__divergenceSegments__ = segments;
  }
  const current = getLoadValue(
    node.rootNode.__outputValue__,
    node.path,
    segments,
  );
  const base = getLoadValue(baseline.value, node.path, segments);
  if (
    Object.is(current, node.__divergenceCurrent__) &&
    Object.is(base, node.__divergenceBase__)
  )
    return node.__isDivergent__;
  const result = !sameValue(current, base);
  node.__divergenceCurrent__ = current;
  node.__divergenceBase__ = base;
  node.__isDivergent__ = result;
  return result;
};
