import type { SchemaNodeRecord } from '../../../record';
import { captureChainError } from './captureChainError';
import { find } from '../../../navigation';
import { writeSchemaNode } from '../../../settle';
import { SetValueOption } from '../../../types/value';
import { composeBatchValue } from './composeBatchValue';

/**
 * Commit the final marked value of each batch target before delivery.
 * @param root - Tree owning marked writes
 * @returns Nothing; settlement failures stay on the current chain
 */
export const flushBatchWrites = <Self extends SchemaNodeRecord<Self>>(
  root: Self,
): void => {
  const runtime = root.runtime;
  const writes = runtime.batchWrites ?? [];
  runtime.batchWrites = undefined;
  if (!writes.length) return;
  const option = writes.reduce((flags, write) => flags | write.option,
    SetValueOption.None);
  const target = writes.length === 1 ? find(root, writes[0].node.path) : root;
  if (!target) return;
  const input = writes.length === 1 ? writes[0].value : composeBatchValue(root, writes);
  const merge = writes.length === 1 &&
    (option & SetValueOption.Merge) === SetValueOption.Merge &&
    !(option & SetValueOption.Replace);
  try { writeSchemaNode(target, input, merge ? 'callerPartial' : 'callerReplace', option); }
  catch (error) { captureChainError(runtime, error); }
};
