import { formatNullBranchIgnoredWarning } from '@/schema-form/helpers/error';
import {
  NULL_BRANCH_IGNORED_FOR_FORM,
  warnDevelopmentIssue,
} from '@/schema-form/helpers/warning';
import type { ObjectSchema } from '@/schema-form/types';

/**
 * Emit a development warning when a `{ type: 'null' }` composition branch carries
 * a condition or `properties` — the form reads neither from a null branch.
 * @param subSchema - The null branch
 * @param scope - Composition keyword the branch belongs to
 * @param parentPath - JSON pointer of the node that owns the composition
 */
export const warnIfNullBranchIgnored = (
  subSchema: Partial<ObjectSchema>,
  scope: 'oneOf' | 'anyOf',
  parentPath: string,
) => {
  const ignored: string[] = [];
  if (subSchema['&if'] !== undefined || subSchema.computed?.if !== undefined)
    ignored.push('condition');
  if (subSchema.properties !== undefined) ignored.push('properties');
  if (ignored.length === 0) return;
  warnDevelopmentIssue({
    code: NULL_BRANCH_IGNORED_FOR_FORM,
    message: formatNullBranchIgnoredWarning(scope, ignored, parentPath),
    details: { path: parentPath, scope, ignored },
  });
};
