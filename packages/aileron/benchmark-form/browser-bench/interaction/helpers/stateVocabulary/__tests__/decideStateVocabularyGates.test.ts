import { describe, expect, it } from 'vitest';

import { bootstrapStageClosingMetric } from '../../stageClosing/bootstrapStageClosingMetric';
import { decideStateVocabularyGates } from '../decideStateVocabularyGates';
import { stateVocabularyGateFixture } from './fixtures/stateVocabularyGateFixture';

/** Use the existing closing contract fixture to exercise the new policy wrapper. */
const decide = (data: ReturnType<typeof stateVocabularyGateFixture>) =>
  decideStateVocabularyGates(data.rows, data.bounds, data.samples, data.pages);

describe('state-vocabulary timing gates', () => {
  it('keeps C1 to C6 and omits the L calibration and C7', () => {
    expect(decide(stateVocabularyGateFixture()).map((g) => g.id)).toEqual([
      'C1',
      'C2',
      'C3',
      'C4',
      'C5',
      'C6',
    ]);
    expect(
      decide(stateVocabularyGateFixture()).every((g) => g.status === 'PASS'),
    ).toBe(true);
  });
  it.each([
    {
      id: 'type-flat-500-validate-burst',
      metric: 'processing',
      gate: 'C1',
      floor: 1,
    },
    { id: 'reset-flat-500-same', metric: 'callDuration', gate: 'C5', floor: 4 },
  ])(
    'applies registered floor to $id $metric',
    ({ id, metric, gate, floor }) => {
      const data = stateVocabularyGateFixture();
      const bound = data.bounds[id][metric];
      bound.upperBound = 1.10001;
      bound.differenceUpperBound = floor;
      expect(decide(data).find((g) => g.id === gate)?.status).toBe('PASS');
      bound.differenceUpperBound = floor + 0.00001;
      expect(decide(data).find((g) => g.id === gate)?.status).toBe('FAIL');
      bound.upperBound = 1.1;
      expect(decide(data).find((g) => g.id === gate)?.status).toBe('PASS');
      bound.upperBound = 1.2;
      bound.differenceUpperBound = null;
      expect(decide(data).find((g) => g.id === gate)?.status).toBe(
        'INDETERMINATE',
      );
    },
  );
  it('keeps C5 frame and paint limits independent of callDuration floor', () => {
    const data = stateVocabularyGateFixture();
    data.bounds['rebuild-flat-500'].flooredLongestFrame = {
      upperBound: 1.36,
      differenceUpperBound: 18,
      undefinedRatios: 0,
    };
    expect(decide(data).find((g) => g.id === 'C5')?.status).toBe('FAIL');
  });
  it('C1 rejects a tail-only slowdown beyond 2.5ms', () => {
    const data = stateVocabularyGateFixture(),
      metrics = data.bounds['type-flat-500-validate-burst'];
    metrics.processing = {
      upperBound: 1.2,
      differenceUpperBound: 0,
      undefinedRatios: 0,
    };
    metrics.processingTail = {
      upperBound: 1.2,
      differenceUpperBound: 2.5,
      undefinedRatios: 0,
    };
    expect(decide(data).find((g) => g.id === 'C1')?.status).toBe('PASS');
    metrics.processingTail.differenceUpperBound = 2.50001;
    expect(decide(data).find((g) => g.id === 'C1')?.status).toBe('FAIL');
  });
  it('C1 preserves a missing tail bound as indeterminate', () => {
    const data = stateVocabularyGateFixture(),
      metrics = data.bounds['type-flat-500-validate-burst'];
    metrics.processing.upperBound = 1.2;
    delete metrics.processingTail;
    expect(decide(data).find((g) => g.id === 'C1')?.status).toBe(
      'INDETERMINATE',
    );
  });
  it('C4 censors threshold crossings and rejects a persistent 70ms mount frame', () => {
    const data = stateVocabularyGateFixture(),
      metrics = data.bounds['mount-flat-500-always'];
    metrics.longestFrame = bootstrapStageClosingMetric(
      Array.from({ length: 10 }, () => 0),
      Array.from({ length: 10 }, (_, i) => (i < 3 ? 51 : 0)),
    );
    metrics.flooredMountLongestFrame = bootstrapStageClosingMetric(
      Array.from({ length: 10 }, () => 50),
      Array.from({ length: 10 }, (_, i) => (i < 3 ? 51 : 50)),
    );
    expect(decide(data).find((g) => g.id === 'C4')?.status).toBe('PASS');
    metrics.flooredMountLongestFrame = bootstrapStageClosingMetric(
      Array.from({ length: 10 }, () => 50),
      Array.from({ length: 10 }, () => 70),
    );
    expect(decide(data).find((g) => g.id === 'C4')?.status).toBe('FAIL');
  });
});
