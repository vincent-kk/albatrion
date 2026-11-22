import { EMPTY_ARRAY } from '@winglet/common-utils/constant';
import { isArray } from '@winglet/common-utils/filter';

import { parsePointerSegments } from '@/schema-form/helpers/jsonPointer';

import type { FieldNodeRecord, FieldNodeRuntime } from '../../../record';
import { FieldNodeWriteKind } from '../../../types/value';
import { isNamedPointerSegments } from '../../../utils/paths/isNamedPointerSegments';
import { isVirtualWriteFieldAdmitted } from '../../../utils/paths/isVirtualWriteFieldAdmitted';
import { resolveStorageTargets } from '../../../utils/paths/resolveStorageTargets';
import type { WriteRange } from '../../types/writeRange';
import { assertVirtualWriteShape } from './assertVirtualWriteShape';
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
 * @param mode - Prepare a single input at its own target after direct write admission
 * @returns Candidate input at the root or at the original target of a direct write
 */
export const composeBatchValue = <Self extends FieldNodeRecord<Self>>(
  root: Self,
  writes: Readonly<NonNullable<FieldNodeRuntime<Self>['batchWrites']>>,
  base: unknown = root.storedValue,
  ranges?: WriteRange[],
  markRanges?: WriteRange[][],
  mode: 'root' | 'direct' = 'root',
): unknown => {
  const direct = mode === 'direct';
  let value = base;
  for (const write of writes) {
    const ownRanges = markRanges ? [] : ranges;
    const merge = isMergeWrite(write.option);
    const source =
      write.source ??
      (merge
        ? FieldNodeWriteKind.CallerPartial
        : FieldNodeWriteKind.CallerReplace);
    const names = direct ? EMPTY_ARRAY : parsePointerSegments(write.node.path);
    if (!isNamedPointerSegments(names))
      throw new TypeError('Expected a named node path');
    const targets = write.virtualTargets ?? resolveStorageTargets(write.node);
    if (targets === undefined) {
      value = replaceAtPath(
        direct ? undefined : value,
        names,
        write.value,
        write.option,
        write.node,
        undefined,
        false,
        0,
        ownRanges,
        source,
        write.node.path,
        undefined,
        mode,
      );
    } else {
      if (ranges && !direct) assertVirtualWriteShape(write.node, write.value);
      const values = isArray(write.value) ? write.value : undefined;
      const tuple =
        direct && values ? new Array<unknown>(values.length) : undefined;
      const parentNames = direct ? EMPTY_ARRAY : names.slice(0, -1);
      const parent = write.node.parent;
      ownRanges?.push({ path: write.node.path, source, isLogical: true });
      for (const target of targets) {
        const current = parent?.childrenByName?.[target.name];
        const input = values?.[target.index];
        if (
          !write.virtualTargets &&
          !isVirtualWriteFieldAdmitted(!!current, input)
        )
          continue;
        const next = replaceAtPath(
          direct ? undefined : value,
          direct ? EMPTY_ARRAY : [...parentNames, target.name],
          input,
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
          mode,
        );
        if (tuple) tuple[target.index] = next;
        else if (!direct) value = next;
      }
      if (direct) value = tuple;
    }
    if (markRanges && ownRanges) {
      markRanges.push(ownRanges);
      ranges?.push(...ownRanges);
    }
  }
  return value;
};
