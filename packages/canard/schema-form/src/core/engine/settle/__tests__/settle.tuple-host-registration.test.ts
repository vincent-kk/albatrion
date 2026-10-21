import { afterEach, describe, expect, it, vi } from 'vitest';

import { gateSelectionTable } from '../utils/gates/gateSelectionTable';
import { observeGateTableModes } from './fixtures/gate-table/observeGateTableModes';
import { tupleGateHostCase } from './fixtures/tupleGateHostCase';
import { runGateSelectionCase } from './helpers/runGateSelectionCase';

const previous = { ...gateSelectionTable };
afterEach(() => {
  vi.restoreAllMocks();
  Object.assign(gateSelectionTable, previous);
});

// filid:contract settle-split-registration
describe('tuple host registration before the host exists', () => {
  it('verify creates the selected branch without an S3 violation', () => {
    gateSelectionTable.mode = 'verify';
    const before = gateSelectionTable.violations;
    const history = runGateSelectionCase(tupleGateHostCase) as {
      failure: unknown;
      nodes: { path: string; emit: unknown }[];
    }[];
    expect(history.map((row) => row.failure)).toEqual([undefined, undefined]);
    expect(history[1].nodes.find((node) => node.path === '')?.emit).toEqual({
      arr: [{ kind: 'b', b: 'B' }],
    });
    expect(gateSelectionTable.violations).toBe(before);
  });

  it('preserves characterization sections and registration shape in all three modes', async () => {
    await observeGateTableModes(tupleGateHostCase);
  });
});
