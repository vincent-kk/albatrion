import { SchemaFormError } from '@/schema-form/errors';
import { stripFragment } from '@/schema-form/helpers/jsonPointer';
import type { FieldInputTestFn } from '@/schema-form/types';

import { formatFieldInputMapError } from './formatFieldInputMapError';

/** Compile an exact or regular-expression path matcher; reject invalid patterns. */
export const pathExactMatchFnFactory = (
  inputPath: string,
): FieldInputTestFn => {
  try {
    const path = stripFragment(inputPath);
    const regex = path ? new RegExp(path) : null;
    return (hint) => {
      if (hint.path === path) return true;
      if (regex?.test(hint.path)) return true;
      return false;
    };
  } catch (error) {
    throw new SchemaFormError(
      'FORM_TYPE_INPUT_MAP',
      formatFieldInputMapError(inputPath, error),
      { path: inputPath, error },
    );
  }
};
