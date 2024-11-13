import type { JsonSchemaError } from '@lumy/schema-form/types';

let keySeq = 0;

export const transformErrors = (
  errors: JsonSchemaError[],
  useKey = false,
): JsonSchemaError[] => {
  return (Array.isArray(errors) ? errors : []).map((error) => {
    let key = useKey ? ++keySeq : undefined;
    if (
      typeof error.dataPath === 'string' &&
      error.keyword === 'required' &&
      error.params?.missingProperty
    ) {
      return {
        ...error,
        key,
        dataPath: `${error.dataPath ? `${error.dataPath}.` : ''}${
          error.params.missingProperty
        }`,
      };
    }
    return { ...error, key };
  }, []);
};
