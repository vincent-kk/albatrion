import type { DispatchTestNode } from '../../../__tests__/fixtures/createDispatchTree';
import { getCommittedDeclarationKey } from '../../../utils/controls/getCommittedDeclarationKey';

/**
 * Capture the living tree independently of retained exits and commit history.
 * @param root - Mounted dispatch tree whose final publication is observed
 * @returns Emitted value, health and every living node's presence and state
 */
export const observePresenceTree = (root: DispatchTestNode) => {
  const nodes: unknown[] = [];
  const pending = [root];
  while (pending.length) {
    const node = pending.pop()!;
    nodes.push({
      path: node.path,
      present: true,
      emit: node.emit,
      active: node.active,
      visible: node.visible,
      readOnly: node.readOnly,
      disabled: node.disabled,
      declarations: root.runtime.committedDeclarationIds?.get(
        getCommittedDeclarationKey(node),
      ),
    });
    const children = node.children ?? [];
    for (let index = children.length - 1; index >= 0; index--)
      if (children[index].parent === node) pending.push(children[index]);
  }
  return { emit: root.emit, status: root.runtime.diagnostics.status, nodes };
};
