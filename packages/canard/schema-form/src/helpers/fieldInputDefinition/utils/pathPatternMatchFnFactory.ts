import { FormErrorCode, SchemaFormError } from '@/schema-form/errors';
import type { FieldInputTestFn } from '@/schema-form/types';

import { formatFieldInputMapError } from './formatFieldInputMapError';

/**
 * Compile an explicitly selected regular expression once at normalization.
 * @param pattern - Authored key starting with `^`; anchors are preserved.
 * @returns A predicate testing the escaped canonical node path.
 * @throws FieldInputMap when the expression cannot compile.
 */
export const pathPatternMatchFnFactory = (
  pattern: string,
): FieldInputTestFn => {
  try {
    const regex = new RegExp(pattern);
    return (hint) => regex.test(hint.path);
  } catch (error) {
    throw new SchemaFormError(
      FormErrorCode.FieldInputMap,
      formatFieldInputMapError(pattern, error),
      { path: pattern, error },
    );
  }
};
