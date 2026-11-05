import type { Nullable } from '@aileron/declare';

import {
  type FieldNode,
  FieldNodeRequestType,
  isTerminalNode,
} from '@/schema-form/core';

/**
 * Request focus through the first deferred rendering ancestor, or the target itself.
 * @param target - Current target node; absent paths are ignored.
 * @param form - Owning form, or null before mount; only its placeholders participate.
 * @returns Nothing. An ancestor request reveals and focuses its own slot, so the exact
 *   descendant and nested reveals are not guaranteed. No request state survives the call.
 */
export const focusFieldNode = (
  target: Nullable<FieldNode> | undefined,
  form: Nullable<HTMLFormElement>,
): void => {
  if (!target) return;
  const placeholders = form?.querySelectorAll<HTMLElement>(
    '[data-deferred][data-path]',
  );
  if (placeholders)
    for (const placeholder of placeholders) {
      const ancestor = target.rootNode.find(
        placeholder.getAttribute('data-path')!,
      );
      if (!ancestor) continue;
      const pending: FieldNode[] = [ancestor];
      const visited = new Set<FieldNode>();
      while (pending.length) {
        const node = pending.pop()!;
        if (visited.has(node)) continue;
        visited.add(node);
        if (!node.isPresent) continue;
        if (node === target) {
          ancestor.request(FieldNodeRequestType.Focus);
          return;
        }
        if (isTerminalNode(node)) continue;
        for (const child of node.children ?? []) pending.push(child);
      }
    }
  target.request(FieldNodeRequestType.Focus);
};
