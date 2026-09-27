import { intersectSpec } from '../interpret/intersectSpec.mjs';
import { isMember } from '../interpret/isMember.mjs';

/**
 * Compute effective allowed lists and mismatch indicators without rewriting values.
 * @param {object} context Runtime operations supplying projected values and pending raw values.
 * @param {object} root Typed node registry of the current tree.
 * @param {number} sid Current calculation identifier.
 * @returns {undefined} Updates only computed specification and mismatch fields.
 */
export function updateEffectiveSpecs(context, root, sid) {
  const emitted = context.emitOf(root, sid);
  const value = emitted === context.MISSING ? {} : emitted;
  for (const node of root.typedNodes) {
    let spec = node.spec;
    for (const narrowing of node.narrowings) if (narrowing.when(value)) spec = intersectSpec(spec, narrowing.spec);
    node.effectiveSpec = spec;
    const raw = context.rawOf(node);
    node.typeMismatch = raw !== undefined && (raw === null ? !spec.nullable : !spec.kinds.some(kind => isMember(raw, kind)));
  }
}
