/**
 * Freeze the static interpretation list once when constructing a typed prototype node.
 * @param {object} schema Declaration with an optional type and nullable flag.
 * @returns {object|null} Immutable allowed-kind specification, or null for untyped historical fixtures.
 */
export function createSpec(schema) {
  if (!schema?.type) return null;
  const types = Array.isArray(schema.type) ? schema.type : [schema.type];
  return Object.freeze({ kinds: Object.freeze(types.filter(kind => kind !== 'null')), nullable: schema.nullable === true || types.includes('null') });
}
