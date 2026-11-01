import { describe, expect, it } from 'vitest';

import { closingGateFixture } from '../../stageClosing/__tests__/fixtures/closingGateFixture';
import { decideStateVocabularyGates } from '../decideStateVocabularyGates';

/** Use the existing closing contract fixture to exercise the new policy wrapper. */
const decide = (data: ReturnType<typeof closingGateFixture>) =>
  decideStateVocabularyGates(data.rows, data.bounds, data.samples, data.pages);

describe('state-vocabulary timing gates', () => {
  it('keeps C1 to C6 and omits the L calibration and C7', () => {
    expect(decide(closingGateFixture()).map((g) => g.id)).toEqual([
      'C1',
      'C2',
      'C3',
      'C4',
      'C5',
      'C6',
    ]);
    expect(decide(closingGateFixture()).every((g) => g.status === 'PASS')).toBe(
      true,
    );
  });
  it.each([
    ['type-flat-500-validate-burst', 'processing', 'C1'],
    ['reset-flat-500-same', 'callDuration', 'C5'],
  ])('applies both floors to %s %s', (id, metric, gate) => {
    const data = closingGateFixture();
    const bound = data.bounds[id][metric];
    bound.upperBound = 1.10001;
    bound.differenceUpperBound = 1;
    expect(decide(data).find((g) => g.id === gate)?.status).toBe('PASS');
    bound.differenceUpperBound = 1.00001;
    expect(decide(data).find((g) => g.id === gate)?.status).toBe('FAIL');
    bound.upperBound = 1.1;
    expect(decide(data).find((g) => g.id === gate)?.status).toBe('PASS');
    bound.upperBound = 1.2;
    bound.differenceUpperBound = null;
    expect(decide(data).find((g) => g.id === gate)?.status).toBe(
      'INDETERMINATE',
    );
  });
  it('keeps C5 frame and paint limits independent of callDuration floor', () => {
    const data = closingGateFixture();
    data.bounds['rebuild-flat-500'].flooredLongestFrame = {
      upperBound: 1.36,
      differenceUpperBound: 18,
      undefinedRatios: 0,
    };
    expect(decide(data).find((g) => g.id === 'C5')?.status).toBe('FAIL');
  });
});
