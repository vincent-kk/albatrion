import { isArray } from '@winglet/common-utils/filter';
import { hasOwnProperty } from '@winglet/common-utils/lib';

import { CONTROL_KEY } from '../../../constants/controlKey';

/**
 * Check whether an authored control group declares a possible explicit keep.
 * @param controls - Authored controls value of a declaration or a `controls.fields` entry
 * @returns True when `unsetOnInactive` is declared with anything but literal true; an expression may evaluate to keep
 */
export const isKeepControls = (controls: unknown): boolean =>
  controls !== null &&
  typeof controls === 'object' &&
  !isArray(controls) &&
  hasOwnProperty(controls, CONTROL_KEY.unsetOnInactive) &&
  Reflect.get(controls, CONTROL_KEY.unsetOnInactive) !== true;
