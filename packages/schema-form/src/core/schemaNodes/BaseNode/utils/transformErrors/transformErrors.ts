import type { JsonSchemaError } from '@lumy/schema-form/types';

let keySeq = 0;

export const transformErrors = (
  errors: JsonSchemaError[],
  useKey = false,
): JsonSchemaError[] => {
  // 입력값이 배열이 아닌 경우 빈 배열 반환
  if (!Array.isArray(errors)) return [];
  return errors.map((error) => {
    error.key = useKey ? ++keySeq : undefined;
    if (
      typeof error.instancePath === 'string' &&
      error.keyword === 'required' &&
      error.params?.missingProperty
    ) {
      error.instancePath =
        `${error.instancePath}.${error.params.missingProperty}`.replace(
          /^\//,
          '',
        );
    }
    return error;
  });
};
