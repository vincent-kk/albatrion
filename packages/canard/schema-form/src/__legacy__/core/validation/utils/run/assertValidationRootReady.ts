import { SchemaFormError, VALIDATOR_COMPILE_FAILED } from '../../../../errors';
import type { SchemaNodeRecord } from '../../../record';
import type { ValidateFunction } from '../../type';
import { readValidationEntry } from '../cache/readValidationEntry';
import { isValidator } from '../guard/isValidator';
import { recentReleaseList } from '../lifetime/recentReleaseList';

/**
 * Compile a replacement root before a binding transfers its old live chain.
 * @param node - New root or one of its occurrences.
 * @returns Shared compiled validator, or null if none was selected.
 * @throws VALIDATOR_COMPILE_FAILED while the previous tree is still untouched.
 */
export const assertValidationRootReady = <Self extends SchemaNodeRecord<Self>>(
  node: Self,
): ValidateFunction | null => {
  const root = node.rootNode;
  const validator = root.runtime.validator;
  if (!isValidator(validator)) return null;
  const authoredRoot = root.runtime.blueprint.schema;
  const entry = readValidationEntry(validator, authoredRoot);
  if (entry.validate && !entry.failure) return entry.validate;
  const id = typeof authoredRoot === 'object' && authoredRoot !== null &&
    typeof authoredRoot.$id === 'string' ? authoredRoot.$id : undefined;
  const duplicate = !!id && entry.failure instanceof Error &&
    /already exists|duplicate/i.test(entry.failure.message) &&
    [...recentReleaseList(validator).counts].some(([other, count]) =>
      other !== authoredRoot && count > 0 && typeof other === 'object' &&
      other !== null && other.$id === id);
  throw new SchemaFormError(VALIDATOR_COMPILE_FAILED,
    'Whole-schema validation could not be compiled',
    { error: entry.failure, ...(duplicate ? { reason: 'duplicateSchemaId', $id: id } : {}) });
};
