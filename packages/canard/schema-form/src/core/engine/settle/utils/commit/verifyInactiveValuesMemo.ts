import { find } from '../../../navigation';
import type { FieldNodeRecord, FieldNodeRuntime } from '../../../record';
import { rebuildInactiveValuesMemo } from './rebuildInactiveValuesMemo';

/** Verify-bundle counters; product modes do not write them. */
export const inactiveValuesVerification = {
  comparisons: 0,
  violations: 0,
  reads: 0,
};

/**
 * Compare final lazy publications against an independent full rebuild.
 * @param root - Final real shape used by the full presence predicate
 * @param oracle - Prior publication and this commit's independent source snapshot
 * @returns Nothing; throws on value, order, freeze, grouping or identity mismatch
 */
export const verifyInactiveValuesMemo = <Self extends FieldNodeRecord<Self>>(
  root: Self,
  oracle: FieldNodeRuntime<Self>,
): void => {
  const before = new Map(oracle.inactiveValuesMemo);
  const beforeEntries = new Map(oracle.inactiveValueEntries);
  rebuildInactiveValuesMemo(root, oracle, (path) => find(root, path) !== null);
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
    for (let index = 0; index < expected.length; index++)
      if (
        actual[index].path !== expected[index].path ||
        !Object.is(actual[index].value, expected[index].value) ||
        !Object.isFrozen(actual[index])
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
