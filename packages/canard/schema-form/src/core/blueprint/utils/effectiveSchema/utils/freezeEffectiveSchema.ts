import { isArray } from '@winglet/common-utils/filter';

import type { EffectiveSchema } from '../../../type';
import { OwnedSchemaValues } from './OwnedSchemaValues';

/** Environment selection matches commit payload protection and is folded by bundlers. */
const DEVELOPMENT = process.env.NODE_ENV !== 'production';

/**
 * Protect producer-owned public values once at the end of one schema merge.
 * @param result - Fresh completed envelope; its authored descendants are never traversed.
 * @returns Identical envelope, with public owned values frozen in either mode.
 */
export const freezeEffectiveSchema = (
  result: EffectiveSchema,
): EffectiveSchema => {
  const schema = result.schema;
  if (typeof schema === 'object') {
    const required = schema.required;
    const allOf = schema.allOf;
    const enumeration = schema.enum;
    const controls = schema.controls;
    const options = schema.options;
    const presentation = schema.presentation;
    const type = schema.type;
    if (
      required &&
      typeof required === 'object' &&
      OwnedSchemaValues.delete(required)
    )
      Object.freeze(required);
    if (allOf && typeof allOf === 'object' && OwnedSchemaValues.delete(allOf))
      Object.freeze(allOf);
    if (
      enumeration &&
      typeof enumeration === 'object' &&
      OwnedSchemaValues.delete(enumeration)
    )
      Object.freeze(enumeration);
    if (
      controls &&
      typeof controls === 'object' &&
      OwnedSchemaValues.delete(controls)
    )
      Object.freeze(controls);
    if (
      options &&
      typeof options === 'object' &&
      OwnedSchemaValues.delete(options)
    )
      Object.freeze(options);
    if (
      presentation &&
      typeof presentation === 'object' &&
      OwnedSchemaValues.delete(presentation)
    )
      Object.freeze(presentation);
    if (type && typeof type === 'object' && OwnedSchemaValues.delete(type))
      Object.freeze(type);
    if (isArray(allOf))
      for (let index = 0; index < allOf.length; index++) {
        const clause = allOf[index];
        if (
          clause &&
          typeof clause === 'object' &&
          OwnedSchemaValues.delete(clause)
        )
          Object.freeze(clause);
      }
    Object.freeze(schema);
  }
  if (DEVELOPMENT) Object.freeze(result);
  return result;
};
