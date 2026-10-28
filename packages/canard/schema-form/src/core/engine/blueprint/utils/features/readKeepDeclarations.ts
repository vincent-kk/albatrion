import { isArray } from '@winglet/common-utils/filter';

import { CONTROL_KEY } from '../../../constants/controlKey';
import { SCHEMA_GROUP } from '../../../constants/schemaGroup';
import type { PropertyDeclaration } from '../../types/node';
import { isKeepControls } from './isKeepControls';

/** Where a template's authored declarations place a possible explicit keep. */
interface KeepDeclarations {
  /** A node-scope declaration of the template governs the template itself. */
  readonly own: boolean;
  /** A fragment-scope or `controls.fields` declaration governs the template's children. */
  readonly child: boolean;
}

/**
 * Classify a template's authored `unsetOnInactive` declarations by the occurrence they govern.
 * @param declarations - All authored contributions of one template, including inactive ones
 * @returns Whether the template itself and whether its children are governed by a possible keep
 */
export const readKeepDeclarations = (
  declarations: readonly PropertyDeclaration[],
): KeepDeclarations => {
  let own = false;
  let child = false;
  for (const declaration of declarations) {
    if (!declaration.schema || typeof declaration.schema !== 'object') continue;
    const controls: unknown = Reflect.get(
      declaration.schema,
      SCHEMA_GROUP.controls,
    );
    if (isKeepControls(controls)) {
      if (declaration.scope === 'node') own = true;
      else child = true;
    }
    if (!child && hasKeepFields(controls)) child = true;
  }
  return { own, child };
};

/**
 * Check whether any `controls.fields` entry declares a possible explicit keep.
 * @param controls - Authored controls value of one declaration
 * @returns True when a field entry's own controls pass the keep test
 */
const hasKeepFields = (controls: unknown): boolean => {
  if (controls === null || typeof controls !== 'object') return false;
  const fields: unknown = Reflect.get(controls, CONTROL_KEY.fields);
  return (
    isArray(fields) &&
    fields.some(
      (field: unknown) =>
        field !== null &&
        typeof field === 'object' &&
        isKeepControls(Reflect.get(field, SCHEMA_GROUP.controls)),
    )
  );
};
