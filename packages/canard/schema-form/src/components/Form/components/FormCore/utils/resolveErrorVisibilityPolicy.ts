import { FormErrorCode, SchemaFormError } from '@/schema-form/errors';
import { ErrorVisibility } from '@/schema-form/types';

/**
 * Resolve the base display policy without throwing during speculative render.
 * @param policy - The selected Form or Provider value; undefined uses the default.
 * @returns A valid policy or a configuration error to report after commit.
 */
export const resolveErrorVisibilityPolicy = (
  policy: unknown,
): ErrorVisibility | SchemaFormError => {
  switch (policy) {
    case undefined:
      return ErrorVisibility.AfterEditAndTouch;
    case ErrorVisibility.Always:
    case ErrorVisibility.Never:
    case ErrorVisibility.AfterEdit:
    case ErrorVisibility.AfterTouch:
    case ErrorVisibility.AfterEditAndTouch:
    case ErrorVisibility.AfterEditOrTouch:
      return policy;
    default:
      return new SchemaFormError(
        FormErrorCode.InvalidErrorVisibility,
        'errorVisibility must be an ErrorVisibility policy.',
        { received: policy },
      );
  }
};
