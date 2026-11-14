import type { Nullable, Optional } from '@aileron/declare';

import { FormErrorCode, SchemaFormError } from '../../../../../errors';
import type { FieldNodeRecord } from '../../../record';
import type { ValidationIssue } from '../../types/issue';
import { isValidator } from '../guard/isValidator';
import { pinValidationRoot } from '../lifetime/pinValidationRoot';
import { unpinValidationRoot } from '../lifetime/unpinValidationRoot';
import { normalizeValidationIssue } from '../route/normalizeValidationIssue';
import { assertValidationRootReady } from './assertValidationRootReady';

/**
 * Execute a fresh whole-schema verdict against the current emitted root reference.
 * @param node - Any occurrence in the tree being validated.
 * @returns Ordered issues, an empty valid verdict, or null without a validator.
 * @throws A structured compilation or execution failure.
 */
export const runFieldNodeValidation = async <
  Self extends FieldNodeRecord<Self>,
>(
  node: Self,
): Promise<Nullable<readonly ValidationIssue[]>> => {
  const selected = node.rootNode.runtime.validator;
  const validator = isValidator(selected) ? selected : undefined;
  const authoredRoot = node.rootNode.runtime.blueprint.schema;
  if (validator) pinValidationRoot(validator, authoredRoot);
  try {
    const validate = assertValidationRootReady(node);
    if (!validate) return null;
    try {
      const issues = (await validate(node.rootNode.emit)) ?? [];
      let normalized: Optional<ValidationIssue[]>;
      for (let index = 0; index < issues.length; index++) {
        const issue = normalizeValidationIssue(issues[index]);
        if (issue !== issues[index] && !normalized) normalized = issues.slice();
        if (normalized) normalized[index] = issue;
      }
      return normalized ?? issues;
    } catch (error) {
      throw new SchemaFormError(
        FormErrorCode.ValidatorThrew,
        'Whole-schema validator threw while checking the emitted value',
        { error },
      );
    }
  } finally {
    if (validator) unpinValidationRoot(validator, authoredRoot);
  }
};
