import type { ReactNode } from 'react';

import type { Dictionary } from '@aileron/declare';

import type { FieldNode } from '@/schema-form/core';
import type { FormatError } from '@/schema-form/types';

/**
 * Select the first result that the formatter does not explicitly suppress with null.
 * @param node - Live source of the current raw errors.
 * @param context - Application context supplied by the owning form.
 * @param formatError - Visibility-gated formatter; exceptions belong to the caller's boundary.
 * @returns First non-null result, or null when all messages are suppressed or absent.
 */
export const selectFieldErrorMessage = (
  node: FieldNode,
  context: Dictionary,
  formatError: FormatError,
): ReactNode => {
  const errors = node.errors;
  if (errors)
    for (let index = 0; index < errors.length; index++) {
      const message = formatError(errors[index], node, context);
      if (message !== null) return message;
    }
  return null;
};
