import { isArray } from '@winglet/common-utils/filter';
import { hasOwnProperty } from '@winglet/common-utils/lib';

import type { ObjectNode } from '@/schema-form/core/nodes/ObjectNode';
import { formatNullUnreachableWarning } from '@/schema-form/helpers/error';
import { extractSchemaInfo } from '@/schema-form/helpers/jsonSchema';
import {
  NULLABLE_ONE_OF_NULL_UNREACHABLE,
  warnDevelopmentIssue,
} from '@/schema-form/helpers/warning';
import type { ObjectSchema } from '@/schema-form/types';

/**
 * Emit a development warning when a nullable object's `oneOf` can never validate `null`.
 * `oneOf` needs exactly one matching branch; a branch without `type` accepts `null`, so `null` often matches several or, once every branch is typed, none.
 * @param parentNode - Object node owning the composition; only a nullable one is judged
 * @param scope - Composition keyword; only `oneOf` is judged, since `anyOf` needs one match at least
 * @param branches - The branch schemas; a `$ref` among them leaves the question open and nothing is reported
 */
export const warnIfNullUnreachable = (
  parentNode: ObjectNode,
  scope: 'oneOf' | 'anyOf',
  branches: readonly Partial<ObjectSchema>[],
) => {
  if (scope !== 'oneOf' || parentNode.nullable === false) return;
  let admitting = 0;
  for (const branch of branches) {
    if (branch.$ref !== undefined) return;
    if (admitsNull(branch)) admitting++;
  }
  if (admitting === 1) return;
  warnDevelopmentIssue({
    code: NULLABLE_ONE_OF_NULL_UNREACHABLE,
    message: formatNullUnreachableWarning(parentNode.path, admitting),
    details: { path: parentNode.path, admitting },
  });
};

/** Whether `null` satisfies the branch's own `type`, `const` and `enum`; `properties` and `required` never reject `null`. */
const admitsNull = (branch: Partial<ObjectSchema>) => {
  if (branch.type !== undefined && extractSchemaInfo(branch)?.nullable !== true)
    return false;
  if (hasOwnProperty(branch, 'const') && branch.const !== null) return false;
  if (isArray(branch.enum) && branch.enum.indexOf(null) === -1) return false;
  return true;
};
