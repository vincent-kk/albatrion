import { isArray } from '@winglet/common-utils/filter';

import { find } from '../../../navigation';
import type { FieldNodeRecord } from '../../../record';
import { writeFieldNode } from '../../../settle';
import type { FieldNodeWriteKind } from '../../../settle';
import { WriteOption } from '../../../types/value';
import { captureChainError } from './captureChainError';
import { composeBatchValue } from './composeBatchValue';

/**
 * Commit the final marked value of each batch target before delivery.
 * @param root - Tree owning marked writes
 * @returns Nothing; settlement failures stay on the current chain
 */
export const flushBatchWrites = <Self extends FieldNodeRecord<Self>>(
  root: Self,
): void => {
  const runtime = root.runtime;
  const writes = runtime.batchWrites ?? [];
  runtime.batchWrites = undefined;
  if (!writes.length) return;
  const option = writes.reduce(
    (flags, write) => flags | write.option,
    WriteOption.None,
  );
  const target = writes.length === 1 ? find(root, writes[0].node.path) : root;
  if (!target) return;
  const input =
    writes.length === 1 ? writes[0].value : composeBatchValue(root, writes);
  const merge =
    writes.length === 1 &&
    (option & WriteOption.Merge) === WriteOption.Merge &&
    !(option & WriteOption.Replace);
  const source = writes.every((write) => write.source === 'input')
    ? 'input'
    : writes.every((write) => write.source === 'automatic')
      ? 'automatic'
      : undefined;
  const origins = writes.map(
    (
      write,
    ): {
      path: string;
      source: FieldNodeWriteKind;
      keys?: readonly string[];
      fields?: readonly string[];
    } => {
      const partial =
        (write.option & WriteOption.Merge) === WriteOption.Merge &&
        !(write.option & WriteOption.Replace);
      return {
        path: write.node.path,
        source: write.source ?? (partial ? 'callerPartial' : 'callerReplace'),
        keys:
          partial &&
          write.value !== null &&
          typeof write.value === 'object' &&
          !isArray(write.value)
            ? Object.keys(write.value)
            : undefined,
        fields:
          !partial && write.node.behavior.type === 'virtual'
            ? (write.node.blueprintNode.fields ?? []).flatMap((field) => {
                const sibling = write.node.parent?.structure?.[field];
                return sibling ? [sibling.path] : [];
              })
            : undefined,
      };
    },
  );
  try {
    writeFieldNode(
      target,
      input,
      source === 'automatic'
        ? 'automatic'
        : merge
          ? 'callerPartial'
          : 'callerReplace',
      option,
      source,
      origins,
    );
  } catch (error) {
    captureChainError(runtime, error);
  }
};
