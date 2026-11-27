import { FormErrorCode, SchemaFormError } from '@/schema-form/errors';

/**
 * Create a cycle with a read fuse so a nonterminating traversal fails the test.
 * @param first - Known leaf before the self reference.
 * @param onRead - Records inspection work before the fuse stops a broken traversal.
 * @returns A bundle containing exactly first and itself until the fuse throws.
 */
export const createCyclicCaptureFailure = (
  first: unknown,
  onRead?: () => void,
) => {
  const errors: unknown[] = [first];
  const failure = new SchemaFormError(FormErrorCode.MultipleErrors, 'cycle', {
    errors,
  });
  let reads = 0;
  Object.defineProperty(errors, 1, {
    enumerable: true,
    get: () => {
      onRead?.();
      if (++reads > 128) throw new Error('Cyclic capture did not terminate');
      return failure;
    },
  });
  return failure;
};
