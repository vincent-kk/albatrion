import { describe, expect, it } from 'vitest';

import { engineModes } from '../../utils/cache/engineModes';
import { gateWheelEvaluation } from '../utils/gates/gateWheelEvaluation';
import { gateWheelCases } from './fixtures/gateWheelCases';
import { runGateSelectionCase } from './helpers/runGateSelectionCase';

describe('gate-form-one-key full observation equivalence', () => {
  it.each(gateWheelCases)('$name', (fixture) => {
    const previousMode = engineModes.gateWheel;
    const observe: Parameters<typeof runGateSelectionCase>[2] = (root) => [
      ...(root.runtime.committedDeclarationIds ?? []),
    ];
    const capture = (mode: typeof engineModes.gateWheel) =>
      runGateSelectionCase(
        fixture,
        () => {
          engineModes.setMode('gateWheel', mode);
        },
        observe,
      ).map((observation) => {
        const { visits: _visits, ...publication } = observation as {
          visits: unknown;
          [key: string]: unknown;
        };
        return publication;
      });
    try {
      const expected = capture('record');
      const actual = capture('skip');
      expect(actual).toEqual(expected);
      const confirmed = capture('shadow');
      expect(confirmed).toEqual(expected);
      expect(gateWheelEvaluation.nonNoop).toBe(0);
    } finally {
      engineModes.setMode('gateWheel', previousMode);
    }
  });
});
