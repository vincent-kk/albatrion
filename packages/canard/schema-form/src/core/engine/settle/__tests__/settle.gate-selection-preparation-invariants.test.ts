// Runs only in the verify bundle because stored section hashes require shadow histories.
import { expect, it } from 'vitest';

import { gateTableCases } from './fixtures/gate-table/gateTableCases';
import { observeGateTableModes } from './fixtures/gate-table/observeGateTableModes';
import { snapshotGateTableCase } from './fixtures/gate-table/snapshotGateTableCase/snapshotGateTableCase';
import { gateSelectionCases } from './fixtures/gateSelectionCases';
import { gateWheelCases } from './fixtures/gateWheelCases';

/** Original section goldens keep public and scheduling bytes after the physical source channel retires. */
// filid:contract settle-gate-selection-preparation-invariants
it('preserves every non-visits section byte in the 25 selection histories', async () => {
  const fixtures = [
    ...gateTableCases.slice(0, 9),
    ...gateSelectionCases,
    ...gateTableCases.slice(9),
  ];
  expect(fixtures).toHaveLength(25);
  for (const [index, fixture] of fixtures.entries()) {
    await snapshotGateTableCase(
      `selection-${index}`,
      await observeGateTableModes(fixture),
    );
  }
}, 30_000);

it('preserves every non-visits section byte in the 15 wheel histories', async () => {
  expect(gateWheelCases).toHaveLength(15);
  for (const [index, fixture] of gateWheelCases.entries()) {
    await snapshotGateTableCase(
      `wheel-${index}`,
      await observeGateTableModes(fixture),
    );
  }
}, 30_000);
