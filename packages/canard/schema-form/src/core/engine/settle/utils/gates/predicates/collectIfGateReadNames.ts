import { isArray } from '@winglet/common-utils/filter';

/** Value constraints inspect only the property value passed to their validator. */
const VALUE_KEYWORDS = [
  'type',
  'const',
  'enum',
  'minimum',
  'maximum',
  'exclusiveMinimum',
  'exclusiveMaximum',
  'multipleOf',
  'minLength',
  'maxLength',
  'pattern',
];

/**
 * Collect a complete top-level property read proof, rejecting unknown semantics.
 * @param schema - Opaque authored if condition; never executed by this analysis
 * @param names - Unique names accumulated across logical alternatives
 * @param property - Whether constraints apply to one already-recorded value
 * @returns True only when every keyword has a complete, conservative read proof
 */
export const collectIfGateReadNames = (
  schema: unknown,
  names: string[],
  property: boolean,
): boolean => {
  if (typeof schema === 'boolean') return true;
  if (!schema || typeof schema !== 'object' || isArray(schema)) return false;
  for (const [key, value] of Object.entries(schema)) {
    if (key === 'allOf' || key === 'anyOf' || key === 'oneOf') {
      if (
        !isArray(value) ||
        !(() => {
          const items = value;
          for (let index = 0, count = items.length; index < count; index++) {
            if (!(index in items)) continue;
            const entry = items[index];
            if (!collectIfGateReadNames(entry, names, property)) return false;
          }
          return true;
        })()
      )
        return false;
    } else if (key === 'not') {
      if (!collectIfGateReadNames(value, names, property)) return false;
    } else if (property && VALUE_KEYWORDS.indexOf(key) !== -1) {
      continue;
    } else if (key === 'type') {
      if (value !== 'object') return false;
    } else if (key === 'properties') {
      if (!value || typeof value !== 'object' || isArray(value)) return false;
      for (const [name, condition] of Object.entries(value)) {
        if (!collectIfGateReadNames(condition, names, true)) return false;
        if (!property && names.indexOf(name) === -1) names.push(name);
      }
    } else if (key === 'required') {
      if (
        !isArray(value) ||
        (() => {
          const items = value;
          for (let index = 0, count = items.length; index < count; index++) {
            if (!(index in items)) continue;
            const name = items[index];
            if (typeof name !== 'string') return true;
          }
          return false;
        })()
      )
        return false;
      if (!property)
        for (const name of value)
          if (names.indexOf(name) === -1) names.push(name);
    } else if (key === 'dependentRequired') {
      if (!value || typeof value !== 'object' || isArray(value)) return false;
      for (const [name, required] of Object.entries(value)) {
        if (
          !isArray(required) ||
          (() => {
            const items = required;
            for (let index = 0, count = items.length; index < count; index++) {
              if (!(index in items)) continue;
              const entry = items[index];
              if (typeof entry !== 'string') return true;
            }
            return false;
          })()
        )
          return false;
        if (!property) {
          if (names.indexOf(name) === -1) names.push(name);
          for (const entry of required)
            if (names.indexOf(entry) === -1) names.push(entry);
        }
      }
    } else return false;
  }
  return true;
};
