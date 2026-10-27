import { expect, it } from 'vitest';

import { engineModeFooter } from '../../__benchmarks__/fixtures/observationIdentity/engineModeFooter';
import { engineModes } from '../utils/cache/engineModes';

it('restores every mode changed by a generated observation fixture, including exceptional exits', () => {
  const gateSelectionTable = { violations: 0, assertions: {} };
  const previous = [
    engineModes.gateSelection,
    engineModes.gateWheel,
    engineModes.deriveShadow,
  ];
  const create = new Function(
    'engineModes',
    'gateSelectionTable',
    engineModeFooter().split('export const ').join('const ') +
      '\nreturn { __restoreEngineModes, __readGateTableVerification };',
  );
  const fixture = create(engineModes, gateSelectionTable);
  try {
    expect(fixture.__readGateTableVerification().mode).toBe('verify');
    engineModes.setMode('gateWheel', 'record');
    engineModes.setMode('deriveShadow', !engineModes.deriveShadow);
    throw new Error('scene failed');
  } catch (error) {
    expect((error as Error).message).toBe('scene failed');
  } finally {
    fixture.__restoreEngineModes();
  }
  expect([
    engineModes.gateSelection,
    engineModes.gateWheel,
    engineModes.deriveShadow,
  ]).toEqual(previous);
});
