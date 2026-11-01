import type { Nullable } from '@aileron/declare';

import { FormErrorCode, SchemaFormError } from '../../../../../errors';
import type { FieldNodeRecord } from '../../../record';
import type { ValidateFunction } from '../../types/validator';
import { DUPLICATE_SCHEMA_ID_MESSAGE } from '../cache/constants';
import { readValidationEntry } from '../cache/readValidationEntry';
import { isValidator } from '../guard/isValidator';

/**
 * Compile or read the cached whole-schema validator for a root.
 * @param node - Root or one of its occurrences.
 * @returns Shared compiled validator, or null if none was selected.
 * @throws FormErrorCode.ValidatorCompileFailed when whole-schema compilation fails.
 */
export const assertValidationRootReady = <Self extends FieldNodeRecord<Self>>(
  node: Self,
): Nullable<ValidateFunction> => {
  const root = node.rootNode;
  const validator = root.runtime.validator;
  if (!isValidator(validator)) return null;
  const authoredRoot = root.runtime.blueprint.schema;
  const entry = readValidationEntry(validator, authoredRoot);
  if (entry.validate && !entry.failure) return entry.validate;
  const id =
    typeof authoredRoot === 'object' &&
    authoredRoot !== null &&
    typeof authoredRoot.$id === 'string'
      ? authoredRoot.$id
      : undefined;
  const duplicate =
    typeof id === 'string' &&
    entry.failure instanceof Error &&
    DUPLICATE_SCHEMA_ID_MESSAGE.test(entry.failure.message) &&
    entry.duplicate === true;

  throw (entry.rejection ??= new SchemaFormError(
    FormErrorCode.ValidatorCompileFailed,
    'Whole-schema validation could not be compiled',
    {
      error: entry.failure,
      ...(duplicate ? { reason: 'duplicateSchemaId', $id: id } : {}),
    },
  ));
};
