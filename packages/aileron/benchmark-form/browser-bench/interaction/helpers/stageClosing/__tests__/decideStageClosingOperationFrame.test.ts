import { expect, it } from 'vitest';

import { decideStageClosingGates } from '../decideStageClosingGates';
import { closingGateFixture } from './fixtures/closingGateFixture';

it.each([
  [12, 'PASS'],
  [16.7, 'PASS'],
  [16.71, 'FAIL'],
] as const)(
  'C5 applies the operation frame limit at %s ms as %s',
  (difference, status) => {
    const data = closingGateFixture();
    data.bounds['reset-flat-500-replace'].flooredLongestFrame = {
      upperBound: 1.2,
      differenceUpperBound: difference,
      undefinedRatios: 0,
    };
    expect(
      decideStageClosingGates(
        data.rows,
        data.bounds,
        data.ir6B,
        data.ir6S,
        data.samples,
        data.pages,
      ).find((gate) => gate.id === 'C5')?.status,
    ).toBe(status);
  },
);
