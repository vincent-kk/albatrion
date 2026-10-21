import { expect, it } from 'vitest';

import { gateTableCases } from './fixtures/gate-table/gateTableCases';
import { observeGateTableCase } from './fixtures/gate-table/observeGateTableCase';
import { snapshotGateTableCase } from './fixtures/gate-table/snapshotGateTableCase/snapshotGateTableCase';

it('rejects a fixture observation when only local value key order changes', async () => {
  const serialized = observeGateTableCase(gateTableCases[0]);
  await snapshotGateTableCase('selection-0', serialized);

  const history = JSON.parse(serialized) as {
    observations: { nodes: { local: Record<string, unknown> }[] }[];
  };
  const node = history.observations[0].nodes[0];
  const keys = Object.keys(node.local);
  expect(keys.length).toBeGreaterThan(1);
  node.local = Object.fromEntries(Object.entries(node.local).reverse());
  expect(Object.keys(node.local)).not.toEqual(keys);

  await expect(
    snapshotGateTableCase('selection-0', JSON.stringify(history)),
  ).rejects.toThrow();
});
