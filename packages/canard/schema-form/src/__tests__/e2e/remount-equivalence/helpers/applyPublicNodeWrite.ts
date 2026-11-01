import { type FieldNode, SetValueOption } from '@/schema-form';
import { locateNode } from '@/schema-form/__tests__/fixtures/remountEquivalence/locateNode';
import type { RemountWrite } from '@/schema-form/__tests__/fixtures/remountEquivalence/types';

/**
 * Execute imperative or batched replay steps through the public node contract.
 * @param root - FormHandle's current public root.
 * @param write - One operation that does not require DOM typing or context props.
 * @param retained - References captured before detachment.
 * @returns Nothing; node writes settle synchronously within act.
 */
export function applyPublicNodeWrite(
  root: FieldNode,
  write: RemountWrite,
  retained: Map<string, FieldNode>,
): void {
  if (write.action === 'batch')
    return root.batch(() => {
      for (const nested of write.writes ?? [])
        applyPublicNodeWrite(root, nested, retained);
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
  if (write.action === 'same')
    return node.setValue(node.outputValue, write.option);
  if (write.action === 'bulk')
    return node.setValue(
      { ...(node.outputValue as object), ...(write.value as object) },
      write.option,
    );
  if (write.action === 'merge')
    return node.setValue(write.value, SetValueOption.Merge);
  if (write.action === 'setValue' || write.action === 'retained')
    return node.setValue(write.value, write.option);
  if (write.action === 'reset' || write.action === 'resetSubtree')
    return node.resetSubtree();
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
  if (write.action === 'remove') {
    node.remove(write.index!);
    return;
  }
  if (write.action === 'clear') return node.clear();
  if (write.action === 'insert') {
    node.insert(write.index!, write.value);
    return;
  }
  if (write.action === 'update') {
    node.update(write.index!, write.value);
    return;
  }
  throw new Error(`UNSUPPORTED_BATCH_WRITE ${write.action}`);
}
