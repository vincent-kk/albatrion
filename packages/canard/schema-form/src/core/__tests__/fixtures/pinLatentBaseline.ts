import { onTestFinished } from 'vitest';

import { engineModes } from '../../engine';

/** Pin direct latent-store assertions to the baseline, restoring the next test's mode. */
export const pinLatentBaseline = (): void => {
  const previous = engineModes.slots;
  engineModes.setMode('slots', 'off');
  onTestFinished(() => engineModes.setMode('slots', previous));
};
