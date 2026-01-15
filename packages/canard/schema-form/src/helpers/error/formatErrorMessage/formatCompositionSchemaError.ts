import type { ObjectSchema } from '@/schema-form/types';

import { createDivider } from './utils/createDivider';
import { formatPropertyKeysPreview } from './utils/formatPropertyKeysPreview';
import { formatType } from './utils/formatType';

/**
 * Formats a structured error message for composition type redefinition errors.
 * @param scope - The composition type (oneOf or anyOf)
 * @param jsonSchema - The parent object schema
 * @param path - Path to the current node
 * @param parentType - Type of the parent schema
 * @param subSchemaType - Type attempted in sub-schema
 */
export const formatCompositionTypeRedefinitionError = (
  scope: 'oneOf' | 'anyOf',
  jsonSchema: ObjectSchema,
  path: string,
  parentType: unknown,
  subSchemaType: unknown,
): string => {
  const divider = createDivider();
  const parentTypeDisplay = formatType(parentType);
  const subTypeDisplay = formatType(subSchemaType);
  const propertiesPreview = formatPropertyKeysPreview(jsonSchema.properties);

  return `
Type redefinition not allowed in '${scope}' schema.

  ╭${divider}
  │  Path:              ${path}
  │  Composition:       ${scope}
  │  Parent Type:       ${parentTypeDisplay}
  │  Sub-schema Type:   ${subTypeDisplay}
  │  Properties:        ${propertiesPreview}
  ├${divider}
  │  Conflict:  ${scope} sub-schema attempts to change the type
  ╰${divider}

In composition schemas (oneOf/anyOf), sub-schemas cannot redefine
the type of the parent schema. The type must either be omitted
or match exactly.

How to fix:
  1. Remove the 'type' from the ${scope} sub-schema:
     {
       "type": "${parentType}",
       "${scope}": [
         { "properties": { ... } }  // No type here
       ]
     }

  2. Or ensure types match:
     {
       "type": "${parentType}",
       "${scope}": [
         { "type": "${parentType}", "properties": { ... } }
       ]
     }
`.trim();
};

/**
 * Formats a structured error message for composition property exclusiveness errors.
 * This occurs when a property in anyOf tries to redefine a property from another anyOf branch.
 * @param scope - The composition type (oneOf or anyOf)
 * @param path - Path to the current node
 * @param property - The property that caused the conflict
 */
export const formatCompositionPropertyExclusivenessError = (
  scope: 'oneOf' | 'anyOf',
  path: string,
  property: string,
): string => {
  const divider = createDivider();

  return `
Property exclusiveness violation in '${scope}' schema.

  ╭${divider}
  │  Path:         ${path}
  │  Composition:  ${scope}
  │  Property:     '${property}'
  ├${divider}
  │  Conflict:  Property already defined in another ${scope} branch
  ╰${divider}

In '${scope}' composition, each property can only be defined in one branch.
The property '${property}' appears in multiple ${scope} branches, which
would create ambiguity about which schema definition to use.

How to fix:
  1. Ensure '${property}' is only defined in one ${scope} branch:
     {
       "${scope}": [
         { "properties": { "${property}": { ... } } },
         { "properties": { "otherProp": { ... } } }  // Different property
       ]
     }

  2. Or move the common property to the parent schema:
     {
       "properties": { "${property}": { ... } },
       "${scope}": [
         { "properties": { "branch1Prop": { ... } } },
         { "properties": { "branch2Prop": { ... } } }
       ]
     }
`.trim();
};

/**
 * Formats a structured error message for composition property redefinition errors.
 * This occurs when a property in oneOf/anyOf tries to redefine a property from the parent schema.
 * @param scope - The composition type (oneOf or anyOf)
 * @param path - Path to the current node
 * @param property - The property that caused the conflict
 */
export const formatCompositionPropertyRedefinitionError = (
  scope: 'oneOf' | 'anyOf',
  path: string,
  property: string,
): string => {
  const divider = createDivider();

  return `
Property redefinition not allowed in '${scope}' schema.

  ╭${divider}
  │  Path:         ${path}
  │  Composition:  ${scope}
  │  Property:     '${property}'
  ├${divider}
  │  Conflict:  Property already defined in parent schema
  ╰${divider}

A property defined in the parent schema's 'properties' cannot be
redefined in a '${scope}' sub-schema. The property '${property}'
exists in the parent and cannot be overridden.

How to fix:
  1. Remove '${property}' from the ${scope} sub-schema:
     {
       "properties": { "${property}": { ... } },
       "${scope}": [
         { "properties": { "newProp": { ... } } }  // Only new properties
       ]
     }

  2. Or move '${property}' to ${scope} branches if it should vary:
     {
       "properties": { "commonProp": { ... } },
       "${scope}": [
         { "properties": { "${property}": { "type": "string" } } },
         { "properties": { "${property}": { "type": "number" } } }
       ]
     }
`.trim();
};
