import { SchemaFormError, VALIDATOR_THREW } from '../../../../errors';
import type { SchemaNodeRecord } from '../../../record';
import type { ValidationIssue } from '../../type';
import { assertValidationRootReady } from './assertValidationRootReady';

/**
 * Execute a fresh whole-schema verdict against the current emitted root reference.
 * @param node - Any occurrence in the tree being validated.
 * @returns Ordered issues, an empty valid verdict, or null without a validator.
 * @throws A structured compilation or execution failure.
 */
export const runSchemaNodeValidation = async <Self extends SchemaNodeRecord<Self>>(
  node: Self,
): Promise<readonly ValidationIssue[] | null> => {
  const validate = assertValidationRootReady(node);
  if (!validate) return null;
  try { return await validate(node.rootNode.emit) ?? []; }
  catch (error) {
    throw new SchemaFormError(VALIDATOR_THREW,
      'Whole-schema validator threw while checking the emitted value', { error });
  }
};
