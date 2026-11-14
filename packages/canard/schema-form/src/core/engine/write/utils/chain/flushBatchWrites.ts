import { map as mapArray } from '@winglet/common-utils/array';
import { isArray } from '@winglet/common-utils/filter';

import type { Optional } from '@aileron/declare';

import { find } from '../../../navigation';
import type { FieldNodeRecord } from '../../../record';
import { writeFieldNode } from '../../../settle';
import { FieldNodeWriteKind } from '../../../types/value';
import { WriteOption } from '../../../types/value';
import { captureChainError } from './captureChainError';
import { composeBatchValue } from './composeBatchValue';

/**
 * Commit the final marked value of each batch target before delivery.
 * Every exit after detaching batchWrites clears pending input relay records.
 * @param root - Tree owning marked writes
 * @returns Nothing; settlement failures stay on the current chain
 */
export const flushBatchWrites = <Self extends FieldNodeRecord<Self>>(
  root: Self,
): void => {
  const runtime = root.runtime;
  const writes = runtime.batchWrites ?? [];
  runtime.batchWrites = undefined;
  try {
    if (!writes.length) return;
    let option = WriteOption.None;
    for (const write of writes) option |= write.option;
    const target = writes.length === 1 ? find(root, writes[0].node.path) : root;
    if (!target) return;
    const value =
      writes.length === 1 ? writes[0].value : composeBatchValue(root, writes);
    const merge =
      writes.length === 1 &&
      (option & WriteOption.Merge) === WriteOption.Merge &&
      !(option & WriteOption.Replace);
    let allMatch = true;
    for (let index = 0, count = writes.length; index < count; index++) {
      const write = writes[index];

      if (!(write.source === FieldNodeWriteKind.Input)) {
        allMatch = false;
        break;
      }
    }
    let source: Optional<
      FieldNodeWriteKind.Input | FieldNodeWriteKind.Automatic
    >;
    if (allMatch) {
      source = FieldNodeWriteKind.Input;
    } else {
      let allMatch2 = true;
      for (let index = 0, count = writes.length; index < count; index++) {
        const write = writes[index];

        if (!(write.source === FieldNodeWriteKind.Automatic)) {
          allMatch2 = false;
          break;
        }
      }
      source = allMatch2 ? FieldNodeWriteKind.Automatic : undefined;
    }

    const origins = mapArray(
      writes,
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
          source:
            write.source ??
            (partial
              ? FieldNodeWriteKind.CallerPartial
              : FieldNodeWriteKind.CallerReplace),
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
    writeFieldNode(
      target,
      value,
      source === FieldNodeWriteKind.Automatic
        ? FieldNodeWriteKind.Automatic
        : merge
          ? FieldNodeWriteKind.CallerPartial
          : FieldNodeWriteKind.CallerReplace,
      option,
      source,
      origins,
    );
  } catch (error) {
    captureChainError(runtime, error);
  } finally {
    if (runtime.inputRelays !== undefined) runtime.inputRelays = undefined;
  }
};
