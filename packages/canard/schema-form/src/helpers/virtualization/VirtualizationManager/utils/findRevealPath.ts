import type { Nullable } from '@aileron/declare';

import {
  type FieldNode,
  isObjectNode,
  isTerminalNode,
  isVirtualNode,
} from '@/schema-form/core';

import type { DeferredGate } from '../types/deferredGate';

/** A gate that blocks the target and the complete set to mark before opening it. */
interface RevealPath {
  /** Earliest candidate position in document order. */
  element: Element;
  /** Stable gate object held by the manager. */
  gate: DeferredGate;
  /** Physical chain and intermediate virtual groups needed in the reveal commit. */
  renderPath: FieldNode[];
}

/**
 * Find the first waiting or opening gate on the target's render path without mutating it.
 * @param target - Current field; absent ancestors or terminal interiors cannot be reached.
 * @param registry - Waiting gates owned by this form.
 * @param revealing - Gates whose reveal callback already ran but whose commit is pending.
 * @returns The first DOM position and premark path, or null if no gate blocks this target.
 */
export const findRevealPath = (
  target: FieldNode,
  registry: ReadonlyMap<Element, DeferredGate>,
  revealing: ReadonlyMap<Element, DeferredGate>,
): Nullable<RevealPath> => {
  const path = new Set<FieldNode>();
  let child = target;
  for (let node: FieldNode | null = target; node; node = node.parentNode) {
    if (!node.isPresent || (node !== target && isTerminalNode(node)))
      return null;
    path.add(node);
    if (node !== child && isObjectNode(node)) {
      for (const sibling of node.children ?? [])
        if (
          isVirtualNode(sibling) &&
          sibling.isPresent &&
          sibling.children?.includes(child)
        )
          path.add(sibling);
    }
    child = node;
  }
  let result: Nullable<RevealPath> = null;
  for (const entries of [registry, revealing])
    for (const [element, gate] of entries) {
      if (!path.has(gate.node)) continue;
      if (
        !result ||
        element.compareDocumentPosition(result.element) &
          Node.DOCUMENT_POSITION_FOLLOWING
      )
        result = { element, gate, renderPath: [] };
    }
  if (result) result.renderPath = Array.from(path);
  return result;
};
