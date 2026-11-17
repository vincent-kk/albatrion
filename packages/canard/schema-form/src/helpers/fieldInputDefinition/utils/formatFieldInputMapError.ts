import { createDivider, getErrorMessage } from '@/schema-form/helpers/error';

/**
 * Formats a structured error message for FieldInputMap invalid key pattern errors.
 * @param inputPath - The invalid key pattern
 * @param error - The original error object
 */
export const formatFieldInputMapError = (
  inputPath: string,
  error: unknown,
): string => {
  const divider = createDivider();
  const errorMessage = getErrorMessage(error);

  return `
Invalid key pattern in FieldInputMap.

  ╭${divider}
  │  Pattern:  '${inputPath}'
  ├${divider}
  │  Error:  ${errorMessage}
  ╰${divider}

Only FieldInputMap keys starting with '^' are regular expressions.
The provided expression could not be compiled. Other keys compare as text,
except absolute pointers with a standalone '*' segment (one segment per star).

Valid keys:
  • Exact paths:    '/property/nested'
  • Root path:      ''
  • With wildcard:  '/items/*/name'  (matches any index)
  • Fragment:       '#/definitions/User'
  • Expression:     '^/users/(name|email)$'

How to fix:
  1. Use valid JSONPointer syntax:
     {
       '/users/0/name': UserNameInput,
       '/items/*/title': ItemTitleInput
     }

  2. Escape special characters properly:
     • '/' in property names → '~1'
     • '~' in property names → '~0'

  3. Fix the regular expression after '^'. Add '$' to anchor its end.
     Patterns test escaped node paths and do not use a fragment '#'.
`.trim();
};
