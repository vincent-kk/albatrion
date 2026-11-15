import { afterAll } from 'vitest';

import { engineModes } from '../../utils/cache/engineModes';

// Loaded by Vitest setupFiles for unit, render and react18; each file starts with shipped modes.

const previousModes = {
  gateSelection: engineModes.gateSelection,
  gateWheel: engineModes.gateWheel,
  isDeriveShadowEnabled: engineModes.isDeriveShadowEnabled,
};
engineModes.setMode('isDeriveShadowEnabled', false);
engineModes.setMode('gateWheel', 'skip');
engineModes.setMode('gateSelection', 'table');

afterAll(() => {
  engineModes.setMode('gateSelection', previousModes.gateSelection);
  engineModes.setMode('gateWheel', previousModes.gateWheel);
  engineModes.setMode(
    'isDeriveShadowEnabled',
    previousModes.isDeriveShadowEnabled,
  );
});
