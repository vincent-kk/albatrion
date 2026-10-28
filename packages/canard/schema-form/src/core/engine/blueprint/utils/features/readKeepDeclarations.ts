import { SCHEMA_GROUP } from '../../../constants/schemaGroup';
import type { PropertyDeclaration } from '../../types/node';
import { hasKeepFields } from './controls/hasKeepFields';
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
