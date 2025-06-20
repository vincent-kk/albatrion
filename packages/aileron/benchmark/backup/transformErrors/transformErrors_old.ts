import { JSONPath, JSONPointer } from '@winglet/json';

let keySeq = 0;

const JSON_POINTER_CHILD_PATTERN = new RegExp(`${JSONPointer.Child}`, 'g');

export const transformErrors = (errors: any[], useKey = false): any[] => {
  return (Array.isArray(errors) ? errors : []).map((error) => {
    const key = useKey ? ++keySeq : undefined;
    error.dataPath = error.instancePath.replace(
      JSON_POINTER_CHILD_PATTERN,
      JSONPath.Child,
    );
    if (
      typeof error.dataPath === 'string' &&
      error.keyword === 'required' &&
      error.params?.missingProperty
    ) {
      return {
        ...error,
        key,
        dataPath: `${error.dataPath}.${error.params.missingProperty}`,
      };
    }
    return { ...error, key };
  }, []);
};
