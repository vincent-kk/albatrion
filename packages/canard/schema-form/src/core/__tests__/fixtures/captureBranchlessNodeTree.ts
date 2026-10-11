import type { SchemaNode } from '../../SchemaNode';
import { captureBlueprintObservables } from './captureBlueprintObservables';

/**
 * Capture mounted observables without retaining runtime identities or timers.
 * @param root - Mounted core tree after a completed synchronous operation
 * @returns Node order, values, errors, state and settlement diagnostics
 */
export const captureBranchlessNodeTree = (root: SchemaNode): unknown => {
  const nodes = [];
  const pending: SchemaNode[] = [root];
  while (pending.length) {
    const node = pending.pop()!;
    nodes.push({ path: node.path, type: node.type, value: node.value,
      errors: node.errors, state: node.state, schema: node.jsonSchema,
      visible: node.visible, readOnly: node.readOnly, disabled: node.disabled,
      watchValues: node.watchValues });
    const children = node.children;
    if (children)
      for (let index = children.length - 1; index >= 0; index--)
        if (children[index].parentNode === node) pending.push(children[index]);
  }
  const runtime = Reflect.get(root, 'runtime');
  return { blueprint: captureBlueprintObservables(runtime.blueprint),
    nodes, diagnostics: root.diagnostics,
    warnings: runtime.pendingWarningRecords ? [...runtime.pendingWarningRecords] : [],
  };
};
