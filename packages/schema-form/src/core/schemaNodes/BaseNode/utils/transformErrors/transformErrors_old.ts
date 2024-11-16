import type { JsonSchemaError } from '@lumy/schema-form/types';

let keySeq = 0;

export const transformErrors = (
  errors: JsonSchemaError[],
  useKey = false,
): JsonSchemaError[] => {
  return (Array.isArray(errors) ? errors : []).map((error) => {
    const key = useKey ? ++keySeq : undefined;
    if (
      typeof error.instancePath === 'string' &&
      error.keyword === 'required' &&
      error.params?.missingProperty
    ) {
      return {
        ...error,
        key,
        instancePath: `${error.instancePath ? `${error.instancePath}.` : ''}${
          error.params.missingProperty
        }`,
      };
    }
    return { ...error, key };
  }, []);
};
