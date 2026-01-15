import { createDivider } from './utils/createDivider';
import { formatArrayPreview } from './utils/formatArrayPreview';
import { formatValuePreview } from './utils/formatValuePreview';

/**
 * Formats a structured error message for invalid range errors.
 * @param min - The minimum value
 * @param max - The maximum value
 * @param errorMessage - Additional context about the range error
 */
export const formatInvalidRangeError = (
  min: number,
  max: number,
  errorMessage: string,
): string => {
  const divider = createDivider();

  return `
Invalid range constraint in schema intersection.

  ╭${divider}
  │  Minimum:  ${min}
  │  Maximum:  ${max}
  ├${divider}
  │  Error:  ${errorMessage}
  ╰${divider}

When merging schemas with 'allOf', the intersection of range constraints
resulted in an impossible range where minimum exceeds maximum.

How to fix:
  1. Adjust the allOf schemas so their ranges overlap:
     {
       "allOf": [
         { "minimum": 0, "maximum": 100 },
         { "minimum": 50, "maximum": 150 }  // Overlapping range
       ]
     }
     // Results in: minimum: 50, maximum: 100

  2. Remove conflicting constraints from one of the allOf schemas

  3. Use separate validation rules instead of allOf for exclusive ranges
`.trim();
};

/**
 * Formats a structured error message for conflicting const values.
 * @param baseConst - The const value from the base schema
 * @param sourceConst - The const value from the source schema
 */
export const formatConflictingConstValuesError = <T>(
  baseConst: T,
  sourceConst: T,
): string => {
  const divider = createDivider();
  const baseConstPreview = formatValuePreview(baseConst);
  const sourceConstPreview = formatValuePreview(sourceConst);

  return `
Conflicting const values in schema intersection.

  ╭${divider}
  │  Base const:    ${baseConstPreview}
  │  Source const:  ${sourceConstPreview}
  ├${divider}
  │  Conflict:  Two different const values cannot be merged
  ╰${divider}

When merging schemas with 'allOf', each schema has a 'const' constraint
with different values. A value cannot equal two different constants
simultaneously.

How to fix:
  1. Use the same const value in both schemas:
     {
       "allOf": [
         { "const": ${baseConstPreview} },
         { "const": ${baseConstPreview} }  // Same value
       ]
     }

  2. Remove 'const' from one of the allOf schemas

  3. Use 'enum' instead if multiple values are acceptable:
     { "enum": [${baseConstPreview}, ${sourceConstPreview}] }
`.trim();
};

/**
 * Formats a structured error message for empty enum intersection.
 * @param baseEnum - The base enum array
 * @param sourceEnum - The source enum array
 */
export const formatEmptyEnumIntersectionError = <T>(
  baseEnum: T[],
  sourceEnum: T[],
): string => {
  const divider = createDivider();
  const baseEnumPreview = formatArrayPreview(baseEnum);
  const sourceEnumPreview = formatArrayPreview(sourceEnum);

  return `
Empty enum intersection in schema merge.

  ╭${divider}
  │  Base enum:    ${baseEnumPreview}
  │  Source enum:  ${sourceEnumPreview}
  ├${divider}
  │  Problem:  No common values between enum arrays
  ╰${divider}

When merging schemas with 'allOf', the enum arrays from different
schemas must have at least one value in common. An empty intersection
means no valid value exists.

How to fix:
  1. Ensure enum arrays have at least one common value:
     {
       "allOf": [
         { "enum": ["a", "b", "c"] },
         { "enum": ["b", "c", "d"] }  // "b" and "c" are common
       ]
     }
     // Results in: enum: ["b", "c"]

  2. Remove 'enum' from one of the allOf schemas

  3. Use 'oneOf' instead if values should be exclusive:
     {
       "oneOf": [
         { "enum": ["a", "b"] },
         { "enum": ["c", "d"] }
       ]
     }
`.trim();
};
