import { formatNestedCompositionIgnoredWarning } from '@/schema-form/helpers/error';
import {
  NESTED_COMPOSITION_IGNORED_FOR_FORM,
  warnDevelopmentIssue,
} from '@/schema-form/helpers/warning';
import type { ObjectSchema } from '@/schema-form/types';

/**
 * Emit a development warning when a composition sub-schema itself nests
 * another composition (oneOf/anyOf) — nested composition is ignored during form build.
 */
export const warnIfNestedComposition = (
  subSchema: Partial<ObjectSchema>,
  scope: 'oneOf' | 'anyOf',
  parentPath: string,
) => {
  const nestedScope =
    subSchema.oneOf !== undefined
      ? 'oneOf'
      : subSchema.anyOf !== undefined
        ? 'anyOf'
        : undefined;
  if (nestedScope === undefined) return;
  warnDevelopmentIssue({
    code: NESTED_COMPOSITION_IGNORED_FOR_FORM,
    message: formatNestedCompositionIgnoredWarning(
      scope,
      nestedScope,
      parentPath,
    ),
    details: { path: parentPath, scope, nestedScope },
  });
};
