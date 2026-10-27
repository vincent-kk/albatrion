import { onTestFinished } from 'vitest';

import { engineModes } from '../../engine';

/** Measure shipping-path calls and mutations without replaying a shadow tree. */
export const pinSlotShipping = (): void => {
  const previous = engineModes.slots;
  engineModes.setMode('slots', 'on');
  onTestFinished(() => engineModes.setMode('slots', previous));
};
