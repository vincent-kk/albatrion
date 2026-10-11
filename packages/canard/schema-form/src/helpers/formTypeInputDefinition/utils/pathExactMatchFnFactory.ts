import { SchemaFormError } from '@/schema-form/errors';
import { formatFormTypeInputMapError } from '@/schema-form/helpers/error';
import { stripFragment } from '@/schema-form/helpers/jsonPointer';
import type { FormTypeTestFn } from '@/schema-form/types';

/** Compile an exact or regular-expression path matcher; reject invalid patterns. */
export const pathExactMatchFnFactory = (inputPath: string): FormTypeTestFn => {
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
      formatFormTypeInputMapError(inputPath, error),
      { path: inputPath, error },
    );
  }
};
