import { expect, vi } from 'vitest';

import * as reads from '../../utils/gates/readProjectedValue';
import { readProjectedValueWithoutPublication } from './readProjectedValueWithoutPublication';

/**
 * Compare each actual baseline read immediately without adding a publication.
 * @returns Read count, violations with paths, and a function restoring the reader
 */
export const installGateSelectionShadow = () => {
  const original = reads.readProjectedValue;
  const violations: string[] = [];
  let count = 0;
  const spy = vi.spyOn(reads, 'readProjectedValue').mockImplementation((context, path) => {
    const actual = original(context, path);
    const changed = [...context.changedNodes];
    const pending = [...context.pendingOutputs ?? []];
    const version = context.gateThrowVersion;
    try {
      const shadow = readProjectedValueWithoutPublication(context, path);
      expect(shadow).toBe(actual);
      count++;
    } catch (cause) {
      violations.push(`${context.kind} ${path || '<root>'}: ${String(cause)}`);
    }
    expect([...context.changedNodes]).toEqual(changed);
    expect([...context.pendingOutputs ?? []]).toEqual(pending);
    expect(context.gateThrowVersion).toBe(version);
    return actual;
  });
  return { violations, get count() { return count; }, restore: () => spy.mockRestore() };
};
