import type { Nullable } from '@aileron/declare';

import { FormErrorCode, SchemaFormError } from '../../../../../errors';
import type { FieldNodeRecord } from '../../../record';
import type { ValidateFunction } from '../../types/validator';
import { readValidationEntry } from '../cache/readValidationEntry';
import { isValidator } from '../guard/isValidator';
import { recentReleaseList } from '../lifetime/recentReleaseList';

/** A validator compile failure message that reports a duplicate schema id. */
const DUPLICATE_SCHEMA_ID_MESSAGE = /already exists|duplicate/i;

/**
 * Compile a replacement root before a binding transfers its old live chain.
 * @param node - New root or one of its occurrences.
 * @returns Shared compiled validator, or null if none was selected.
 * @throws FormErrorCode.ValidatorCompileFailed while the previous tree is still untouched.
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
  let duplicate =
    !!id &&
    entry.failure instanceof Error &&
    DUPLICATE_SCHEMA_ID_MESSAGE.test(entry.failure.message);
  if (duplicate) {
    duplicate = false;
    {
      const items = [...recentReleaseList(validator).counts];
      for (let index = 0, limit = items.length; index < limit; index++) {
        const [other, count] = items[index];

        {
          if (
            other !== authoredRoot &&
            count > 0 &&
            typeof other === 'object' &&
            other !== null &&
            other.$id === id
          ) {
            duplicate = true;
            break;
          }
        }
      }
    }
  }

  throw new SchemaFormError(
    FormErrorCode.ValidatorCompileFailed,
    'Whole-schema validation could not be compiled',
    {
      error: entry.failure,
      ...(duplicate ? { reason: 'duplicateSchemaId', $id: id } : {}),
    },
  );
};
