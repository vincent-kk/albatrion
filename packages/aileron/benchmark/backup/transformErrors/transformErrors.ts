import { JSONPath, JSONPointer } from '@winglet/json';

let keySeq = 0;

export const transformErrors = (errors: any[], useKey = false): any[] => {
  if (!Array.isArray(errors)) return [];
  return errors.map((error) => {
    (error as any).key = useKey ? ++keySeq : undefined;
    (error as any).dataPath = transformDataPath(error);
    return error;
  });
};

const JSON_POINTER_CHILD_PATTERN = new RegExp(`${JSONPointer.Child}`, 'g');
const INDEX_PATTERN = new RegExp(`(${JSONPath.Child})(\\d+)`, 'g');

const transformDataPath = (error: any): string => {
  const dataPath = error.instancePath
    .replace(JSON_POINTER_CHILD_PATTERN, JSONPath.Child)
    .replace(INDEX_PATTERN, '$1[$2]');

  const hasMissingProperty =
    error.keyword === 'required' && error.params?.missingProperty;

  return hasMissingProperty
    ? `${dataPath}${JSONPath.Child}${error.params.missingProperty}`
    : dataPath;
};
