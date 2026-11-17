import { locateNode } from '@/schema-form/__tests__/fixtures/remountEquivalence/locateNode';
import type { RemountWrite } from '@/schema-form/__tests__/fixtures/remountEquivalence/types';
import {
  type FieldNode,
  SetValueOption,
  setContext,
} from '@/schema-form/core/surface';

/**
 * Execute the scene vocabulary through public writes and the context binding.
 * @param root - Current public tree.
 * @param write - One authored operation.
 * @param retained - Scene-owned references retained before detachment.
 * @returns Nothing; each non-batch entry settles synchronously.
 */
export function applyCoreWrite(
  root: FieldNode,
  write: RemountWrite,
  retained: Map<string, FieldNode>,
): void {
  if (write.action === 'context')
    return setContext(root, write.value as Record<string, unknown>);
  if (write.action === 'batch')
    return root.batch(() => {
      for (const nested of write.writes ?? [])
        applyCoreWrite(root, nested, retained);
    });
  const node =
    write.action === 'retained'
      ? retained.get(write.key ?? '')
      : locateNode(root, write.path ?? '');
  if (!node) throw new Error(`SCENE_NODE_MISSING ${write.path ?? write.key}`);
  if (write.action === 'retain') {
    retained.set(write.key ?? '', node);
    return;
  }
  if (write.action === 'reset' || write.action === 'resetSubtree')
    return node.resetSubtree();
  if (write.action === 'same')
    return node.setValue(node.outputValue, write.option);
  if (write.action === 'bulk')
    return node.setValue(
      { ...(node.outputValue as object), ...(write.value as object) },
      write.option,
    );
  if (
    write.action === 'setValue' ||
    write.action === 'retained' ||
    write.action === 'merge'
  )
    return node.setValue(
      write.value,
      write.action === 'merge' ? SetValueOption.Merge : write.option,
    );
  if (node.type !== 'array')
    throw new Error(`SCENE_ARRAY_REQUIRED ${write.path}`);
  if (write.action === 'push') {
    node.push(write.value);
    return;
  }
  if (write.action === 'pop') {
    node.pop();
    return;
  }
  if (write.action === 'clear') return node.clear();
  if (write.action === 'remove') {
    node.remove(write.index!);
    return;
  }
  if (write.action === 'insert') {
    node.insert(write.index!, write.value);
    return;
  }
  node.update(write.index!, write.value);
}
