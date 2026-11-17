import { readValidatedControls } from '../../../utils/controls/readValidatedControls';
import type { PropertyDeclaration } from '../../types/node';
import { hasKeepFields } from './controls/hasKeepFields';
import { isKeepControls } from './isKeepControls';

/** Where a template's authored declarations place a possible explicit keep. */
interface KeepDeclarations {
  /** A node-scope declaration of the template governs the template itself. */
  readonly hasOwnKeep: boolean;
  /** A fragment-scope or `controls.fields` declaration governs the template's children. */
  readonly hasChildKeep: boolean;
}

/**
 * Classify a template's authored `unsetOnInactive` declarations by the occurrence they govern.
 * @param declarations - All authored contributions of one template, including inactive ones
 * @returns Whether the template itself and whether its children are governed by a possible keep
 */
export const readKeepDeclarations = (
  declarations: readonly PropertyDeclaration[],
): KeepDeclarations => {
  let hasOwnKeep = false;
  let hasChildKeep = false;
  for (const declaration of declarations) {
    if (!declaration.schema || typeof declaration.schema !== 'object') continue;
    const controls = readValidatedControls(declaration.schema);
    if (isKeepControls(controls)) {
      if (declaration.scope === 'node') hasOwnKeep = true;
      else hasChildKeep = true;
    }
    if (!hasChildKeep && hasKeepFields(controls)) hasChildKeep = true;
  }
  return { hasOwnKeep, hasChildKeep };
};
