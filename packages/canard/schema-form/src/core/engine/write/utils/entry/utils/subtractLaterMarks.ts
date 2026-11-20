import { isArray } from '@winglet/common-utils/filter';

import type { Optional } from '@aileron/declare';

import type { FieldNodeRecord } from '../../../../record';
import type { WriteOption } from '../../../../types/value';
import { resolveStorageTargets } from '../../../../utils/paths/resolveStorageTargets';
import { mergeMarkedValue } from '../../chain/utils/mergeMarkedValue';
import { type LaterMark, readLaterCoverage } from './readLaterCoverage';

/** The batch write a mark holds: its node, value and the virtual fields it still admits. */
type MarkWrite<Self> = {
  readonly node: Self;
  readonly value: unknown;
  readonly option: WriteOption;
  readonly virtualFields?: readonly string[];
};

/**
 * Remove from an earlier batch mark what the later marks of the same segment write, as the later
 * calls in sequence would overwrite it (write DETAIL EVENT-013). An address a later mark covers
 * whole leaves the mark, and the part of an address a later Merge names is merged into the mark's
 * value, so applying the reduced mark after the later marks leaves what the calls in order leave.
 * @param node - Node the earlier mark writes, which decides its storage addresses and merge boundaries
 * @param earlier - The earlier mark, its storage paths and the batch write that holds it
 * @param laters - The later marks, in call order
 * @returns The reduced write, or undefined when the later marks cover every address of the mark
 */
export const subtractLaterMarks = <
  Self extends FieldNodeRecord<Self>,
  Write extends MarkWrite<Self>,
>(
  node: Self,
  earlier: LaterMark & { readonly write: Write },
  laters: readonly LaterMark[],
): Optional<Write> => {
  const targets = resolveStorageTargets(node);
  const isVirtual = earlier.paths.length > 1 || targets !== undefined;
  const live = earlier.paths.map(() => true);
  const values: unknown[] = isVirtual
    ? earlier.paths.map((_, index) =>
        isArray(earlier.value) ? earlier.value[index] : undefined,
      )
    : [earlier.value];
  for (const later of laters)
    for (let index = 0; index < earlier.paths.length; index++) {
      if (!live[index]) continue;
      const coverage = readLaterCoverage(earlier.paths[index], later);
      if (coverage.kind === 'covered') live[index] = false;
      else if (coverage.kind === 'merged')
        values[index] = mergeMarkedValue(
          isVirtual ? targets?.[index]?.node : node,
          values[index],
          coverage.value,
        );
    }
  if (!live.some(Boolean)) return undefined;
  if (!isVirtual) return { ...earlier.write, value: values[0] };
  const names = (targets ?? []).map((target) => target.name);
  return {
    ...earlier.write,
    value: values,
    virtualFields: names.filter(
      (name, index) =>
        live[index] && (earlier.write.virtualFields?.includes(name) ?? true),
    ),
  };
};
