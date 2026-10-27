import type { FieldNodeRecord, FieldNodeRuntime } from '../../../record';
import { rebuildInactiveValuesMemo } from './utils/inactiveValues/rebuildInactiveValuesMemo';

/** Verify-only counters; no public surface or per-tree product allocation. */
export const inactiveValuesVerification = { comparisons: 0, violations: 0 };

/**
 * Compare publications with a full rebuild from the same prior committed memo.
 * @param root - Final live shape used by both calculations
 * @param oracle - Verify-only prior publication and current source snapshot
 * @returns Nothing; throws on grouping, order, value, freeze or identity mismatch
 */
export const verifyInactiveValuesMemo = <Self extends FieldNodeRecord<Self>>(
  root: Self,
  oracle: FieldNodeRuntime<Self>,
): void => {
  const before = new Map(oracle.inactiveValuesMemo);
  const beforeEntries = new Map(oracle.inactiveValueEntries);
  rebuildInactiveValuesMemo(root, oracle);
  const runtime = root.runtime;
  let matches =
    runtime.inactiveValuesMemo.size === oracle.inactiveValuesMemo.size &&
    runtime.inactiveValueEntries?.size === oracle.inactiveValueEntries?.size;
  for (const [host, expected] of oracle.inactiveValuesMemo) {
    const actual = runtime.inactiveValuesMemo.get(host);
    if (
      !actual ||
      !Object.isFrozen(actual) ||
      actual.length !== expected.length ||
      (expected === before.get(host)) !== (actual === before.get(host))
    ) {
      matches = false;
      continue;
    }
    for (let i = 0; i < expected.length; i++)
      if (
        actual[i].path !== expected[i].path ||
        !Object.is(actual[i].value, expected[i].value) ||
        !Object.isFrozen(actual[i])
      )
        matches = false;
  }
  for (const [key, expected] of oracle.inactiveValueEntries ?? []) {
    const actual = runtime.inactiveValueEntries?.get(key);
    const previous = beforeEntries.get(key);
    if (
      !actual ||
      (expected.entry === previous?.entry) !==
        (actual.entry === previous?.entry) ||
      expected.order.length !== actual.order.length ||
      expected.order.some((value, index) => value !== actual.order[index])
    )
      matches = false;
  }
  inactiveValuesVerification.comparisons++;
  if (!matches) {
    inactiveValuesVerification.violations++;
    throw new Error('Inactive value memo differs from the full rebuild oracle');
  }
};
