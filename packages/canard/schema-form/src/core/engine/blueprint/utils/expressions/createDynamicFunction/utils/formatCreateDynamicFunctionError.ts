import { createDivider, getErrorMessage } from '@/schema-form/helpers/error';

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
Failed to create dynamic function for a controls expression.

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
This usually indicates a syntax error in the controls expression.

How to fix:
  1. Check the expression syntax for typos or invalid JavaScript
  2. Ensure all JSONPointer paths (e.g., '../fieldName') are valid
  3. Verify that the expression returns a valid value
  4. Check for unbalanced parentheses or brackets
`.trim();
};

/**
 * Replaces newlines in a string with box-compatible line breaks.
 * @param text - Text with newlines
 * @param prefix - Prefix for continuation lines
 * @returns Formatted multi-line string
 */
const formatMultiLine = (text: string, prefix = '\n  │    '): string =>
  text.replace(/\n/g, prefix);
