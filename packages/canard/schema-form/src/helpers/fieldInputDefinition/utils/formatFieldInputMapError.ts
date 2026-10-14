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

FieldInputMap keys must be valid JSONPointer paths or patterns.
The provided pattern could not be compiled into a valid path matcher.

Valid patterns:
  • Exact paths:    '/property/nested'
  • Root path:      ''
  • With wildcard:  '/items/*/name'  (matches any index)
  • Fragment:       '#/definitions/User'

How to fix:
  1. Use valid JSONPointer syntax:
     {
       '/users/0/name': UserNameInput,
       '/items/*/title': ItemTitleInput
     }

  2. Escape special characters properly:
     • '/' in property names → '~1'
     • '~' in property names → '~0'

  3. Check for typos or invalid regex patterns in the key
`.trim();
};
