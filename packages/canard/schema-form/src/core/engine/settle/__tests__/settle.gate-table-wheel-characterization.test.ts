import { describe, expect, it } from 'vitest';

import { observeGateTableCase } from './fixtures/gate-table/observeGateTableCase';
import { gateWheelCases } from './fixtures/gateWheelCases';

/** Pre-extraction gate-wheel corpus; snapshot ownership is documented in the sibling selection suite. */
describe('decision-62 pre-extraction gate-wheel characterization', () => {
  it.each([
    { index: 0, name: 'S1 shared key K=100' },
    { index: 1, name: 'S1 shared key K=1000' },
    { index: 2, name: 'S2 root oneOf-5' },
    { index: 3, name: 'S2 nested oneOf-5' },
    { index: 4, name: 'S2 root oneOf-20' },
    { index: 5, name: 'S2 nested oneOf-20' },
    { index: 6, name: 'S2 root oneOf-80' },
    { index: 7, name: 'S2 nested oneOf-80' },
    { index: 8, name: 'S3 late latent key' },
    { index: 9, name: 'S3 positive cycle' },
    { index: 10, name: 'S4 two dependencies' },
    { index: 11, name: 'S5 nested dependency' },
    { index: 12, name: 'S5 overlay projection' },
    { index: 13, name: 'S6 unrelated key' },
    { index: 14, name: 'S6 validator gate' },
  ])('$name', async ({ index }) => {
    expect(gateWheelCases).toHaveLength(15);
    const fixture = gateWheelCases[index];
    await expect(observeGateTableCase(fixture)).toMatchFileSnapshot(
      `./fixtures/gate-table/wheel-${index}.json`,
    );
  });
});
