import type { SchemaNodeRecord } from '../../../record';
import { isArray } from '@winglet/common-utils/filter';
import { captureChainError } from './captureChainError';
import { find } from '../../../navigation';
import { writeSchemaNode } from '../../../settle';
import type { SchemaNodeWriteKind } from '../../../settle';
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
  const source = writes.every((write) => write.source === 'input') ? 'input' :
    writes.every((write) => write.source === 'automatic') ? 'automatic' : undefined;
  const origins = writes.map((write): { path: string; source: SchemaNodeWriteKind;
    keys?: readonly string[] } => {
    const partial = (write.option & SetValueOption.Merge) === SetValueOption.Merge &&
      !(write.option & SetValueOption.Replace);
    return {
      path: write.node.path,
      source: write.source ?? (partial ? 'callerPartial' : 'callerReplace'),
      keys: partial && write.value !== null && typeof write.value === 'object' &&
        !isArray(write.value) ? Object.keys(write.value) : undefined,
    };
  });
  try { writeSchemaNode(target, input, source === 'automatic' ? 'automatic' :
    merge ? 'callerPartial' : 'callerReplace', option, source, origins); }
  catch (error) { captureChainError(runtime, error); }
};
