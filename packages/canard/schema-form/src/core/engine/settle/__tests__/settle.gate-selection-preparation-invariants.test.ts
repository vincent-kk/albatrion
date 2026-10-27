// Runs only in the verify bundle because stored section hashes require shadow histories.
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';

import { gateTableCases } from './fixtures/gate-table/gateTableCases';
import { observeGateTableModes } from './fixtures/gate-table/observeGateTableModes';
import { normalizeH1PrivateHistory } from './fixtures/gate-table/snapshotGateTableCase/utils/normalizeH1PrivateHistory';
import { sectionGateTableObservation } from './fixtures/gate-table/snapshotGateTableCase/utils/sectionGateTableObservation';
import { gateSelectionCases } from './fixtures/gateSelectionCases';
import { gateWheelCases } from './fixtures/gateWheelCases';

/** Pre-preparation section hashes retain every byte except the approved select visit reduction. */
const hashes: Record<string, string> = JSON.parse(
  readFileSync(
    new URL(
      './fixtures/gate-table/preparation-invariants.json',
      import.meta.url,
    ),
    'utf8',
  ),
);

// filid:contract settle-gate-selection-preparation-invariants
it('preserves every non-visits section byte in the 25 selection histories', async () => {
  const fixtures = [
    ...gateTableCases.slice(0, 9),
    ...gateSelectionCases,
    ...gateTableCases.slice(9),
  ];
  expect(fixtures).toHaveLength(25);
  for (const [index, fixture] of fixtures.entries()) {
    const { sections } = sectionGateTableObservation(
      normalizeH1PrivateHistory(
        `selection-${index}`,
        await observeGateTableModes(fixture),
      ),
    );
    const preserved = Object.fromEntries(
      Object.entries(sections).filter(([key]) => key !== 'visits'),
    );
    expect(
      createHash('sha256').update(JSON.stringify(preserved)).digest('hex'),
      fixture.name,
    ).toBe(hashes['selection-' + index]);
  }
}, 30_000);

it('preserves every non-visits section byte in the 15 wheel histories', async () => {
  expect(gateWheelCases).toHaveLength(15);
  for (const [index, fixture] of gateWheelCases.entries()) {
    const { sections } = sectionGateTableObservation(
      normalizeH1PrivateHistory(
        `wheel-${index}`,
        await observeGateTableModes(fixture),
      ),
    );
    const preserved = Object.fromEntries(
      Object.entries(sections).filter(([key]) => key !== 'visits'),
    );
    expect(
      createHash('sha256').update(JSON.stringify(preserved)).digest('hex'),
      fixture.name,
    ).toBe(hashes['wheel-' + index]);
  }
}, 30_000);
