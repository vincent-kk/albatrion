import { createDivider } from './utils/createDivider';
import { formatIndexedList } from './utils/formatIndexedList';
import { formatLines } from './utils/formatLines';
import { formatMultiLine } from './utils/formatMultiLine';
import { formatValuePreview } from './utils/formatValuePreview';
import { getErrorMessage } from './utils/getErrorMessage';

/**
 * Formats a structured error message for dynamic function creation failures.
 * @param fieldName - Field name where the function creation failed
 * @param expression - The expression that failed to compile
 * @param functionBody - The generated function body that caused the error
 * @param error - The original error object
 */
export const formatCreateDynamicFunctionError = (
  fieldName: string,
  expression: string,
  functionBody: string,
  error: unknown,
): string => {
  const divider = createDivider();
  const errorMessage = getErrorMessage(error);

  return `
Failed to create dynamic function for computed property.

  ╭${divider}
  │  Field:       ${fieldName}
  │  Expression:  '${expression}'
  ├${divider}
  │  Generated Function Body:
  │    ${formatMultiLine(functionBody)}
  ├${divider}
  │  Error: ${errorMessage}
  ╰${divider}

The expression could not be compiled into a valid JavaScript function.
This usually indicates a syntax error in the computed property expression.

How to fix:
  1. Check the expression syntax for typos or invalid JavaScript
  2. Ensure all JSONPointer paths (e.g., '../fieldName') are valid
  3. Verify that the expression returns a valid value
  4. Check for unbalanced parentheses or brackets
`.trim();
};

/**
 * Formats a structured error message for condition index creation failures.
 * @param fieldName - Field name (oneOf, anyOf, etc.)
 * @param expressions - Array of condition expressions that failed
 * @param lines - Generated function lines
 * @param error - The original error object
 */
export const formatConditionIndexError = (
  fieldName: string,
  expressions: string[],
  lines: string[],
  error: unknown,
): string => {
  const divider = createDivider();
  const errorMessage = getErrorMessage(error);
  const expressionsSection = formatIndexedList(expressions);
  const linesSection = formatLines(lines);

  return `
Failed to create condition index function for '${fieldName}'.

  ╭${divider}
  │  Field:  ${fieldName}
  ├${divider}
  │  Condition Expressions:
${expressionsSection}
  ├${divider}
  │  Generated Code:
${linesSection}
  ├${divider}
  │  Error: ${errorMessage}
  ╰${divider}

The condition expressions could not be compiled into a valid function.
This typically occurs when '&if' expressions contain invalid syntax.

How to fix:
  1. Check each '&if' expression for valid JavaScript syntax
  2. Ensure JSONPointer paths in conditions are correct
  3. Verify that comparison operators are properly used
  4. Look for missing quotes around string comparisons
`.trim();
};

/**
 * Formats a structured error message for observed values function creation failures.
 * @param fieldName - Field name being observed
 * @param watch - Watch value(s) that failed
 * @param watchValueIndexes - Computed watch value indexes
 * @param error - The original error object
 */
export const formatObservedValuesError = (
  fieldName: string,
  watch: string | string[],
  watchValueIndexes: number[],
  error: unknown,
): string => {
  const divider = createDivider();
  const errorMessage = getErrorMessage(error);
  const watchDisplay = formatValuePreview(watch);
  const watchPaths = Array.isArray(watch) ? watch : [watch];
  const watchSection = watchPaths
    .map((path, i) => `  │    [${i}] ${path} → index ${watchValueIndexes[i]}`)
    .join('\n');

  return `
Failed to create observed values function for '${fieldName}'.

  ╭${divider}
  │  Field:  ${fieldName}
  │  Watch:  ${watchDisplay}
  ├${divider}
  │  Watch Path Mappings:
${watchSection}
  ├${divider}
  │  Error: ${errorMessage}
  ╰${divider}

The watch configuration could not be compiled into a valid function.
This monitors dependencies defined in 'computed.watch' or '&watch'.

How to fix:
  1. Verify that all watch paths are valid JSONPointer paths
  2. Check that watched fields exist in the schema
  3. Ensure watch values are strings or an array of strings
  4. Look for syntax errors in path expressions
`.trim();
};

/**
 * Formats a structured error message for condition indices (multiple) creation failures.
 * @param fieldName - Field name (anyOf, allOf, etc.)
 * @param expressions - Array of condition expressions that failed
 * @param lines - Generated function lines
 * @param error - The original error object
 */
export const formatConditionIndicesError = (
  fieldName: string,
  expressions: string[],
  lines: string[],
  error: unknown,
): string => {
  const divider = createDivider();
  const errorMessage = getErrorMessage(error);
  const expressionsSection = formatIndexedList(expressions);
  const linesSection = formatLines(lines);

  return `
Failed to create condition indices function for '${fieldName}'.

  ╭${divider}
  │  Field:  ${fieldName}
  ├${divider}
  │  Condition Expressions:
${expressionsSection}
  ├${divider}
  │  Generated Code:
${linesSection}
  ├${divider}
  │  Error: ${errorMessage}
  ╰${divider}

The condition expressions could not be compiled into a function that
returns all matching indices. This is used for anyOf/allOf conditions
where multiple schemas can be active simultaneously.

How to fix:
  1. Check each '&if' expression for valid JavaScript syntax
  2. Ensure JSONPointer paths in conditions are correct
  3. Verify that comparison operators are properly used
  4. Look for missing quotes around string comparisons
`.trim();
};
