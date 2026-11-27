import { hasOwnProperty } from '@winglet/common-utils/lib';

import { CONTROL_KEY } from '../../../constants/controlKey';
import type { ValidatedControls } from '../../../utils/controls/readValidatedControls';

/**
 * Check whether an authored control group declares a possible explicit keep.
 * @param controls - Authored controls value of a declaration or a `controls.fields` entry
 * @returns True when `unsetOnInactive` is declared with anything but literal true; an expression may evaluate to keep
 */
export const isKeepControls = (
  controls: ValidatedControls | undefined,
): boolean =>
  controls !== undefined &&
  hasOwnProperty(controls, CONTROL_KEY.unsetOnInactive) &&
  Reflect.get(controls, CONTROL_KEY.unsetOnInactive) !== true;
