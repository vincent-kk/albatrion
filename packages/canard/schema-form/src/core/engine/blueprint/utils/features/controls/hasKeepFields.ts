import type { ValidatedControls } from '../../../../utils/controls/readValidatedControls';
import { isKeepControls } from '../isKeepControls';

/**
 * Check whether any `controls.fields` entry declares a possible explicit keep.
 * @param controls - Authored controls value of one declaration
 * @returns True when a field entry's own controls pass the keep test
 */
export const hasKeepFields = (
  controls: ValidatedControls | undefined,
): boolean => {
  const fields = controls?.fields;
  if (!fields) return false;
  for (let index = 0; index < fields.length; index++) {
    const field = fields[index];
    if (field && isKeepControls(field.controls)) return true;
  }
  return false;
};
