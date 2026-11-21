import { isArray } from '@winglet/common-utils/filter';

import { parsePointerSegments } from '@/schema-form/helpers/jsonPointer';

import type { FieldNodeRecord, FieldNodeRuntime } from '../../../record';
import { FieldNodeWriteKind } from '../../../types/value';
import { isNamedPointerSegments } from '../../../utils/paths/isNamedPointerSegments';
import { resolveStorageTargets } from '../../../utils/paths/resolveStorageTargets';
import type { WriteRange } from '../../types/writeRange';
import { getWriteChild } from './getWriteChild';
import { isMergeWrite } from './isMergeWrite';
import { replaceAtPath } from './replaceAtPath';

/**
 * Overlay marked caller inputs onto the last committed root value. A virtual write is
 * spread over its reference fields in call order, so the composed value never carries a
 * virtual key and a later field write wins over an earlier virtual one (R2).
 * @param root - Common root of every marked occurrence
 * @param writes - Call-order inputs, already resolved from updaters
 * @param base - Committed root value the marks overlay; a reader passes it with a target's own
 * committed value placed at the target address
 * @param ranges - Optional sink receiving physical decisions for the synthesized input
 * @param markRanges - Optional per-mark decisions while a reset is pending
 * @returns Candidate root input for one settlement
 */
export const composeBatchValue = <Self extends FieldNodeRecord<Self>>(
  root: Self,
  writes: Readonly<NonNullable<FieldNodeRuntime<Self>['batchWrites']>>,
  base: unknown = root.storedValue,
  ranges?: WriteRange[],
  markRanges?: WriteRange[][],
): unknown => {
  let value = base;
  for (const write of writes) {
    const ownRanges = markRanges ? [] : ranges;
    const merge = isMergeWrite(write.option);
    const source =
      write.source ??
      (merge
        ? FieldNodeWriteKind.CallerPartial
        : FieldNodeWriteKind.CallerReplace);
    const names = parsePointerSegments(write.node.path);
    if (!isNamedPointerSegments(names))
      throw new TypeError('Expected a named node path');
    const targets = write.virtualTargets ?? resolveStorageTargets(write.node);
    if (targets === undefined) {
      value = replaceAtPath(
        value,
        names,
        write.value,
        write.option,
        write.node,
        undefined,
        false,
        0,
        ownRanges,
        source,
      );
    } else {
      const values = isArray(write.value) ? write.value : undefined;
      const parentNames = names.slice(0, -1);
      const parent = write.node.parent;
      ownRanges?.push({ path: write.node.path, source, isLogical: true });
      for (const target of targets) {
        const current = parent?.childrenByName?.[target.name];
        if (
          !write.virtualTargets &&
          !current &&
          values?.[target.index] === undefined
        )
          continue;
        value = replaceAtPath(
          value,
          [...parentNames, target.name],
          values?.[target.index],
          write.option,
          current,
          !current && parent && merge
            ? getWriteChild(parent.blueprintNode, parent, target.name).entry
                ?.node
            : undefined,
          false,
          0,
          ownRanges,
          source,
          target.path,
          merge ? undefined : true,
        );
      }
    }
    if (markRanges && ownRanges) {
      markRanges.push(ownRanges);
      ranges?.push(...ownRanges);
    }
  }
  return value;
};
