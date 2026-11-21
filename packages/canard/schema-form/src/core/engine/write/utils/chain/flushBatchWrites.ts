import { find } from '../../../navigation';
import type { FieldNodeRecord } from '../../../record';
import {
  composeBatchValue,
  isMergeWrite,
  writeFieldNode,
} from '../../../settle';
import type { WriteRange } from '../../../settle';
import { FieldNodeWriteKind } from '../../../types/value';
import { WriteOption } from '../../../types/value';
import { captureChainError } from './captureChainError';
import { restoreBatchOutput } from './utils/restoreBatchOutput';

/**
 * Commit the final marked value of each batch target before delivery.
 * Every exit after detaching batchWrites clears pending input relay records.
 * @param root - Tree owning marked writes
 * @param markRanges - Per-mark range sink for a pending subtree reset
 * @returns Nothing; settlement failures stay on the current chain
 */
export const flushBatchWrites = <Self extends FieldNodeRecord<Self>>(
  root: Self,
  markRanges?: WriteRange[][],
): void => {
  const runtime = root.runtime;
  const writes = runtime.batchWrites ?? [];
  runtime.batchWrites = undefined;
  try {
    if (!writes.length) return;
    let option = WriteOption.None;
    for (const write of writes) option |= write.option;
    if (
      option & WriteOption.EnableAutomaticWrites &&
      !(option & WriteOption.DisableAutomaticWrites) &&
      runtime.disableAutomaticWrites === true &&
      writes.length > 1 &&
      writes.some(
        (write) => !(write.option & WriteOption.EnableAutomaticWrites),
      )
    ) {
      for (const write of writes) {
        if (markRanges)
          composeBatchValue(root, [write], undefined, undefined, markRanges);
        writeFieldNode(
          write.node,
          write.value,
          isMergeWrite(write.option)
            ? FieldNodeWriteKind.CallerPartial
            : FieldNodeWriteKind.CallerReplace,
          write.option,
          write.source,
          undefined,
          undefined,
          write.virtualTargets,
        );
      }
      return;
    }
    // A lone mark kept past a refused reset can name a detached node; it then composes at the root.
    const single =
      writes.length === 1 ? find(root, writes[0].node.path) : undefined;
    const target = single ?? root;
    const ranges: WriteRange[] | undefined = single ? undefined : [];
    if (single && markRanges)
      composeBatchValue(root, writes, undefined, undefined, markRanges);
    const value = single
      ? writes[0].value
      : composeBatchValue(root, writes, undefined, ranges, markRanges);
    const firstSource = writes[0].source;
    const source =
      firstSource !== undefined &&
      writes.every((write) => write.source === firstSource)
        ? firstSource
        : undefined;
    writeFieldNode(
      target,
      value,
      source === FieldNodeWriteKind.Automatic
        ? FieldNodeWriteKind.Automatic
        : single && isMergeWrite(option)
          ? FieldNodeWriteKind.CallerPartial
          : FieldNodeWriteKind.CallerReplace,
      option,
      source,
      ranges,
      undefined,
      single ? writes[0].virtualTargets : undefined,
    );
  } catch (error) {
    captureChainError(runtime, error);
  } finally {
    if (runtime.batchHasArrayOperation && !runtime.batchDepth) {
      runtime.batchHasArrayOperation = undefined;
      restoreBatchOutput(root, runtime.chainInitialOutputValue);
    }
    if (runtime.inputRelays !== undefined) runtime.inputRelays = undefined;
  }
};
