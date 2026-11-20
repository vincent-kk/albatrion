/**
 * Schema-value keywords that contain arrays of schemas. */
const ARRAYS = new Set(['allOf', 'anyOf', 'oneOf', 'prefixItems', 'items']);
/** Schema-value keywords whose object maps names to schemas. */
const MAPS = new Set([
  'properties',
  'patternProperties',
  'definitions',
  '$defs',
  'dependencies',
  'dependentSchemas',
]);
/** Standard direct schema values; unknown object values are visited only for native resource declarations. */
const VALUES = new Set([
  'additionalItems',
  'items',
  'contains',
  'additionalProperties',
  'propertyNames',
  'not',
  'if',
  'then',
  'else',
  'unevaluatedProperties',
  'unevaluatedItems',
]);
/** Native traversal never treats these literal values as schema positions. */
const DATA = new Set([
  'default',
  'enum',
  'const',
  'required',
  'maximum',
  'minimum',
  'exclusiveMaximum',
  'exclusiveMinimum',
  'multipleOf',
  'maxLength',
  'minLength',
  'pattern',
  'format',
  'maxItems',
  'minItems',
  'uniqueItems',
  'maxProperties',
  'minProperties',
]);

/** Walk schema objects without following data objects or prototype properties.
 * @param value - Schema value to traverse through own properties.
 * @param visit - Receives each schema object, escaped pointer, parent and assertion-position flag.
 * @param pointer - Escaped JSON Pointer of this traversal position.
 * @param parent - Enclosing schema object whose resource establishes the base URI.
 * @param assertion - Whether validation keywords are interpreted here; false visits only resource declarations.
 * @returns No value; invokes the visitor once for each traversed schema object.
 */
export const walkSchemas = (
  value: unknown,
  visit: (
    schema: object,
    pointer: string,
    parent: object | undefined,
    assertion: boolean,
  ) => void,
  pointer = '',
  parent?: object,
  assertion = true,
): void => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return;
  visit(value, pointer, parent, assertion);
  for (const key of Object.keys(value)) {
    const child: unknown = Reflect.get(value, key);
    if (!child || typeof child !== 'object' || DATA.has(key)) continue;
    const at = `${pointer}/${key.replace(/~/g, '~0').replace(/\//g, '~1')}`;
    if (Array.isArray(child)) {
      if (ARRAYS.has(key))
        for (let index = 0; index < child.length; index++)
          walkSchemas(child[index], visit, `${at}/${index}`, value, assertion);
    } else if (MAPS.has(key)) {
      for (const name of Object.keys(child))
        walkSchemas(
          Reflect.get(child, name),
          visit,
          `${at}/${name.replace(/~/g, '~0').replace(/\//g, '~1')}`,
          value,
          assertion,
        );
    } else
      walkSchemas(child, visit, at, value, assertion && VALUES.has(key));
  }
};
