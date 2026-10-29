import { isArray } from '@winglet/common-utils/filter';

import { CONTROL_KEY } from '../../../../constants/controlKey';
import { SCHEMA_GROUP } from '../../../../constants/schemaGroup';
import { isKeepControls } from '../isKeepControls';

/**
 * Check whether any `controls.fields` entry declares a possible explicit keep.
 * @param controls - Authored controls value of one declaration
 * @returns True when a field entry's own controls pass the keep test
 */

export const hasKeepFields = (controls: unknown): boolean => {
  if (controls === null || typeof controls !== 'object') return false;
  const fields: unknown = Reflect.get(controls, CONTROL_KEY.fields);
  if (!isArray(fields)) return false;
  for (let index = 0, count = fields.length; index < count; index++) {
    if (!(index in fields)) continue;
    const field: unknown = fields[index];
    if (
      field !== null &&
      typeof field === 'object' &&
      isKeepControls(Reflect.get(field, SCHEMA_GROUP.controls))
    )
      return true;
  }
  return false;
};
