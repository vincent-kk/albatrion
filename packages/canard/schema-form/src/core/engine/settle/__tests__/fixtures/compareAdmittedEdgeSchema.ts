import { expect, vi } from 'vitest';

import type { PlainNode } from '../../../__tests__/fixtures/createPlainNode';
import * as admitted from '../../utils/compute/childSelection/readAdmittedEdgeSchema';
import { runGateSelectionCase } from '../helpers/runGateSelectionCase';
import type { gateSelectionCases } from './gateSelectionCases';

/** Calls of the admitted-edge read in the candidate run. */
export interface AdmittedEdgeReads {
  /** Edge names whose read returned a cached or freshly merged schema. */
  served: string[];
  /** Edge names whose read declined because the child came from another edge's node. */
  declined: string[];
}

/**
 * Run one gate history with the admitted-edge read enabled and declined, then compare
 * values, shape, per-node active and effective schemas, deliveries, failures and
 * diagnostics after every settlement, plus the committed selected declaration IDs.
 * @param fixture - Authored schema, mount input and write history
 * @returns The candidate's admitted-edge reads, for scene-specific assertions
 */
export const compareAdmittedEdgeSchema = (
  fixture: (typeof gateSelectionCases)[number],
): AdmittedEdgeReads => {
  const histories: unknown[][] = [];
  const reads: AdmittedEdgeReads = { served: [], declined: [] };
  for (const declinedRun of [false, true]) {
    const spy = vi.spyOn(admitted, 'readAdmittedEdgeSchema');
    if (declinedRun) spy.mockReturnValue(undefined);
    try {
      histories.push(
        runGateSelectionCase(fixture, undefined, (root: PlainNode) => [
          ...(root.runtime.committedDeclarationIds ?? []),
        ]),
      );
      if (!declinedRun)
        spy.mock.calls.forEach(([entry], index) =>
          (spy.mock.results[index].value === undefined
            ? reads.declined
            : reads.served
          ).push(entry.name),
        );
    } finally {
      spy.mockRestore();
    }
  }
  expect(histories[0], fixture.name).toEqual(histories[1]);
  return reads;
};
