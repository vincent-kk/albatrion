import { isArray } from '@winglet/common-utils/filter';

import type {
  BlueprintNode,
  EffectiveSchema,
  EffectiveSchemaOptions,
  PropertyDeclaration,
} from '../../../../../type';
import { OwnedSchemaValues } from '../../OwnedSchemaValues';
import { freezeEffectiveSchema } from '../../freezeEffectiveSchema';
import type { EffectiveSchemaFields } from '../../type';

/**
 * Build hints only after a sole static contribution proves intersection unnecessary.
 * @param node - Validated scalar anchor and complete declaration set.
 * @param declarations - Static contributions selected in authored order.
 * @param options - Static mode and unchanged diagnostic/atomic policies.
 * @returns Frozen hints with HEAD's key order, or undefined for the ordered fold.
 */
export const mergeSingleStaticContribution = (
  node: BlueprintNode,
  declarations: readonly PropertyDeclaration[],
  options: EffectiveSchemaOptions,
): EffectiveSchema | undefined => {
  if (
    options.mode !== 'static' ||
    options.isAtomic !== undefined ||
    options.collect !== undefined ||
    node.nullable ||
    node.kind === 'virtual' ||
    node.declarations.length !== 1 ||
    declarations.length !== 1
  )
    return undefined;
  const declaration = declarations[0];
  const source = declaration.schema;
  if (
    declaration !== node.declarations[0] ||
    declaration.gates.length !== 0 ||
    declaration.context !== 'conjunction' ||
    declaration.role !== 'declaration' ||
    declaration.scope !== 'node' ||
    declaration.validationOnly ||
    typeof source === 'boolean' ||
    typeof source.type !== 'string' ||
    source.type !== node.schemaType ||
    'nullable' in source ||
    'pattern' in source ||
    'options' in source ||
    'enum' in source ||
    'const' in source ||
    'multipleOf' in source ||
    'minimum' in source ||
    'maximum' in source ||
    'exclusiveMinimum' in source ||
    'exclusiveMaximum' in source ||
    'minLength' in source ||
    'maxLength' in source ||
    'minItems' in source ||
    'maxItems' in source ||
    'minProperties' in source ||
    'maxProperties' in source
  )
    return undefined;
  const schema: EffectiveSchemaFields = {};
  const keys = Object.keys(source);
  for (let index = 0; index < keys.length; index++) {
    const key = keys[index];
    const value = source[key];
    if (value === undefined || key === 'type') continue;
    if (key === 'controls') {
      if (!value || typeof value !== 'object') continue;
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- Authored controls may be any object; indexed reads need a runtime shape guard.
      const sourceControls = value as Record<string, unknown>;
      const controls: Record<string, unknown> = {};
      if (sourceControls.watch !== undefined)
        controls.watch = sourceControls.watch;
      if (sourceControls.default !== undefined)
        controls.default = sourceControls.default;
      if (Object.keys(controls).length) {
        schema.controls = controls;
        OwnedSchemaValues.add(controls);
      }
    } else if (key === 'readOnly') schema.readOnly = value === true;
    else if (key === 'required' && isArray(value)) {
      const required: unknown[] = [];
      for (let item = 0; item < value.length; item++)
        if (item in value && value.indexOf(value[item]) === item)
          required.push(value[item]);
      schema.required = required;
      OwnedSchemaValues.add(required);
    } else if (key === 'allOf' && isArray(value)) {
      schema.allOf = [...value];
      OwnedSchemaValues.add(schema.allOf);
    } else schema[key] = value;
  }
  schema.type = node.schemaType;
  return freezeEffectiveSchema({ schema, typeConflict: false });
};
