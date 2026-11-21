import { isArray } from '@winglet/common-utils/filter';

import type { FieldNodeRecord, FieldNodeRuntime } from '../../../../record';
import { mergeMarkedValue, readWriteCoverage } from '../../../../settle';
import type { WriteRange } from '../../../../settle';

type BatchWrite<Self extends FieldNodeRecord<Self>> = NonNullable<
  FieldNodeRuntime<Self>['batchWrites']
>[number];

/**
 * Replay only the part of a withheld mark that later physical writes left behind.
 * @param write - The original withheld caller write
 * @param ranges - Actual decisions from marks applied at the reset barrier
 * @param start - Index of the first applied mark that follows the withheld one
 * @returns A write admitting only surviving physical targets
 */
export const subtractLaterMarks = <Self extends FieldNodeRecord<Self>>(
  write: BatchWrite<Self>,
  ranges: readonly WriteRange[][],
  start: number,
): BatchWrite<Self> | undefined => {
  if (start === ranges.length) return write;
  const targets = write.virtualTargets;
  const values = isArray(write.value) ? write.value.slice() : [];
  const kept = [];
  let value = write.value;
  for (const target of targets ?? [undefined]) {
    const node = target ? target.node : write.node;
    const path = target?.path ?? write.node.path;
    let input = target ? values[target.index] : value;
    let isCovered = false;
    for (let index = start; index < ranges.length; index++) {
      const range = readWriteCoverage(ranges[index], path, 'latest');
      if (!range || range.isLogical) continue;
      if (!range.partial) {
        isCovered = true;
        break;
      }
      input = mergeMarkedValue(node, input, range.partial);
    }
    if (target) {
      if (isCovered) continue;
      kept.push(target);
      values[target.index] = input;
    } else {
      if (isCovered) return undefined;
      value = input;
    }
  }
  if (!targets) return value === write.value ? write : { ...write, value };
  return kept.length
    ? { ...write, value: values, virtualTargets: kept }
    : undefined;
};
